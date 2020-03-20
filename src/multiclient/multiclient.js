// @flow
'use strict';

import * as ncp from '@nkn/ncp';
import { Cache } from 'memory-cache';
import Promise from 'core-js-pure/features/promise';

import Client from '../client';
import type { ConnectHandler, MessageHandler, Destination, MessageData, ReplyData, SendOptions, PublishOptions } from '../client';
import * as common from '../common';
import * as consts from './consts';
import * as message from '../client/message';
import * as util from './util';

/**
 * NKN client that sends data to and receives data from other NKN clients.
 * @param {Object} [options={}] - Client configuration
 * @param {string} [options.seed=undefined] - Secret seed (64 hex characters). If empty, a random seed will be used.
 * @param {string} [options.identifier=undefined] - Identifier used to differentiate multiple clients sharing the same secret seed.
 * @param {number} [options.reconnectIntervalMin=1000] - Minimal reconnect interval in ms.
 * @param {number} [options.reconnectIntervalMax=64000] - Maximal reconnect interval in ms.
 * @param {number} [options.responseTimeout=5000] - Message response timeout in ms. Zero disables timeout.
 * @param {number} [options.msgHoldingSeconds=0] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 * @param {boolean} [options.encrypt=true] - Whether to end to end encrypt message.
 * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address used to join the network.
 * @param {boolean} [options.tls=undefined] - Force to use wss instead of ws protocol. If not defined, wss will only be used in https location.
 * @param {boolean} [options.worker=false] - Whether to use web workers (if available) to compute signatures.
 * @param {number} [options.numSubClients=3] - Number of sub clients to create.
 * @param {boolean} [options.originalClient=false] - Whether to create client with no additional identifier prefix added. This client is not counted towards sub clients controlled by `options.numSubClients`.
 * @param {number} [options.msgCacheExpiration=300000] - Message pid cache expiration time in ms. This cache is used to remove duplicate messages received by different clients.
 * @param {Object} [options.sessionConfig={}] - Session configuration
 */
export default class MultiClient {
  options: {
    seed?: string,
    identifier?: string,
    reconnectIntervalMin: number,
    reconnectIntervalMax: number,
    responseTimeout: number,
    msgHoldingSeconds: number,
    encrypt: boolean,
    rpcServerAddr: string,
    tls?: boolean,
    worker: boolean,
    numSubClients: number,
    originalClient: boolean,
    msgCacheExpiration: number,
    sessionConfig: {},
  };
  key: common.Key;
  /**
   * Address identifier.
   */
  identifier: string;
  /**
   * Client address, which will be `identifier.pubicKeyHex` if `identifier` is not empty, otherwise just `pubicKeyHex`.
   */
  addr: string;
  eventListeners: {
    connect: Array<ConnectHandler>,
    message: Array<MessageHandler>,
    session: Array<SessionHandler>,
  };
  /**
   * Underlying NKN clients used to send/receive data.
   */
  clients: { [string]: Client };
  /**
   * Default NKN client for low level API access.
   */
  defaultClient: Client;
  msgCache: Cache;
  acceptAddrs: Array<RegExp>;
  sessions: Map<string, ncp.Session>;
  /**
   * Whether client is ready (connected to a node).
   */
  isReady: boolean;
  /**
   * Whether client is closed.
   */
  isClosed: boolean;

  constructor(options: {
    seed?: string,
    identifier?: string,
    reconnectIntervalMin?: number,
    reconnectIntervalMax?: number,
    responseTimeout?: number,
    msgHoldingSeconds?: number,
    encrypt?: boolean,
    rpcServerAddr?: string,
    tls?: boolean,
    worker?: boolean,
    numSubClients?: number,
    originalClient?: boolean,
    msgCacheExpiration?: number,
    sessionConfig?: {},
  } = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    let baseIdentifier = options.identifier || '';
    let clients: { [string]: Client } = {};

    if (options.originalClient) {
      let clientID = util.addIdentifier('', '');
      clients[clientID] = new Client(options);
      if (!options.seed) {
        options = common.util.assignDefined({}, options, { seed: clients[clientID].key.seed });
      }
    }

    for (let i = 0; i < options.numSubClients; i++) {
      clients[util.addIdentifier('', i)] = new Client(common.util.assignDefined({}, options, {identifier: util.addIdentifier(baseIdentifier, i)}));
      if (i === 0 && !options.seed) {
        options = common.util.assignDefined({}, options, { seed: clients[util.addIdentifier('', i)].key.seed });
      }
    }

    let clientIDs = Object.keys(clients).sort();
    if (clientIDs.length === 0) {
      throw new RangeError('should have at least one client');
    }

    this.options = options;
    this.clients = clients;
    this.defaultClient = clients[clientIDs[0]];
    this.key = this.defaultClient.key;
    this.identifier = baseIdentifier;
    this.addr = (baseIdentifier ? baseIdentifier + '.' : '') + this.key.publicKey;
    this.eventListeners = {
      connect: [],
      message: [],
      session: [],
    };
    this.msgCache = new Cache();
    this.acceptAddrs = [];
    this.sessions = new Map();
    this.isReady = false;
    this.isClosed = false;

    for (let clientID: string of Object.keys(clients)) {
      clients[clientID].onMessage(async ({ src, payload, payloadType, isEncrypted, pid }) => {
        if (this.isClosed) {
          return false;
        }

        if (payloadType === common.pb.payloads.PayloadType.SESSION) {
          if (!isEncrypted) {
            return false;
          }
          try {
            await this._handleSessionMsg(clientID, src, pid, payload);
          } catch (e) {
            if (!(e instanceof ncp.errors.SessionClosedError || e instanceof common.errors.AddrNotAllowedError)) {
              throw e;
            }
          }
          return false;
        }

        let key = common.util.bytesToHex(pid);
        if (this.msgCache.get(key) !== null) {
          return false;
        }
        this.msgCache.put(key, clientID, options.msgCacheExpiration);

        src = util.removeIdentifier(src).addr;

        let responses = [];
        if (this.eventListeners.message) {
          responses = await Promise.all(this.eventListeners.message.map(async f => {
            try {
              return await f({ src, payload, payloadType, isEncrypted, pid });
            } catch (e) {
              console.log('Message handler error:', e);
              return null;
            }
          }));
        }
        let responded = false;
        for (let response of responses) {
          if (response === false) {
            return false;
          } else if (response !== undefined && response !== null) {
            this.send(src, response, {
              encrypt: isEncrypted,
              msgHoldingSeconds: 0,
              replyToPid: pid,
              noReply: true,
            }).catch((e) => {
              console.log('Send response error:', e);
            });
            responded = true;
            break;
          }
        }
        if (!responded) {
          for (let clientID: string of Object.keys(clients)) {
            if (clients[clientID].isReady) {
              clients[clientID]._sendACK(util.addIdentifierPrefixAll(src, clientID), pid, isEncrypted);
            }
          }
        }
        return false;
      });
    }
  }

  /**
   * Get the secret seed of the client.
   * @returns Secret seed as hex string.
   */
  getSeed(): string {
    return this.key.seed;
  }

  /**
   * Get the public key of the client.
   * @returns Public key as hex string.
   */
  getPublicKey(): string {
    return this.key.publicKey;
  }

  _shouldAcceptAddr(addr: string): boolean {
    for (let allowAddr of this.acceptAddrs) {
      if (allowAddr.test(addr)) {
        return true;
      }
    }
  	return false;
  }

  async _handleSessionMsg(localClientID: string, src: string, sessionID: string, data: Uint8Array): Promise<void> {
    let remote = util.removeIdentifier(src);
    let remoteAddr = remote.addr;
    let remoteClientID = remote.clientID;
    let sessionKey = util.sessionKey(remoteAddr, sessionID);

    let session;
    let existed = this.sessions.has(sessionKey);
    if (existed) {
      session = (this.sessions.get(sessionKey): any);
    } else {
      if (!this._shouldAcceptAddr(remoteAddr)) {
        throw new common.errors.AddrNotAllowedError();
      }
      session = (this._newSession(remoteAddr, sessionID, this.options.sessionConfig): any);
      this.sessions.set(sessionKey, session);
    }

    session.receiveWith(localClientID, remoteClientID, data);

    if (!existed) {
      await session.accept();

      if (this.eventListeners.session) {
        await Promise.all(this.eventListeners.session.map(async f => {
          try {
            return await f(session);
          } catch (e) {
            console.log('Session handler error:', e);
            return;
          }
        }));
      }
    }
  };

  _newSession(remoteAddr: string, sessionID: string, sessionConfig: {} = {}): ncp.Session {
    let clientIDs = this.readyClientIDs().sort();
    return new ncp.Session(this.addr, remoteAddr, clientIDs, null, async (localClientID, remoteClientID, data) => {
      let client = this.clients[localClientID];
      if (!client.isReady) {
        throw new common.errors.ClientNotReadyError();
      }
      let payload = message.newSessionPayload(data, sessionID);
      await client._send(util.addIdentifierPrefix(remoteAddr, remoteClientID), payload);
    }, sessionConfig);
  }

  /**
   * Send byte or string data to a single or an array of destination using the
   * client with given clientID. Typically `send` should be used instead for
   * better reliability and lower latency.
   * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
   */
  async sendWithClient(clientID: string, dest: Destination, data: Uint8Array, options: SendOptions = {}): Promise<ReplyData> {
    let client = this.clients[clientID];
    if (!client) {
      throw new common.errors.InvalidArgumentError('no such clientID');
    }
    if (!client.isReady) {
      throw new common.errors.ClientNotReadyError();
    }
    return await client.send(util.addIdentifierPrefixAll(dest, clientID), data, options);
  };

  /**
   * Get the list of clientID that are ready.
   */
  readyClientIDs(): Array<string> {
    return Object.keys(this.clients).filter((clientID) => {
      return this.clients[clientID] && this.clients[clientID].isReady;
    });
  }

  /**
   * Send byte or string data to a single or an array of destination using all
   * available clients.
   * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
   */
  async send(dest: Destination, data: MessageData, options: SendOptions = {}): Promise<ReplyData> {
    options = common.util.assignDefined({}, options, { pid: common.util.randomBytes(message.pidSize) });
    let readyClientID = this.readyClientIDs();
    if (readyClientID.length === 0) {
      throw new common.errors.ClientNotReadyError();
    }
    dest = await this.defaultClient._processDests(dest);
    try {
      return await Promise.any(readyClientID.map((clientID) => {
        return this.sendWithClient(clientID, dest, data, options);
      }));
    } catch (e) {
      throw new Error('failed to send with any client: ' + e.errors);
    }
  };

  /**
   * Send byte or string data to all subscribers of a topic using all available
   * clients.
   * @returns A promise that will be resolved with null when send success.
   */
  async publish(topic: string, data: MessageData, options: PublishOptions = {}): Promise<null> {
    let offset = 0;
    let limit = 1000;
    let res = await this.defaultClient.getSubscribers(topic, { offset, limit, txPool: options.txPool || false });
    let subscribers = res.subscribers;
    let subscribersInTxPool = res.subscribersInTxPool;
    while (res.subscribers && res.subscribers.length >= limit) {
      offset += limit;
      res = await this.defaultClient.getSubscribers(topic, { offset, limit });
      subscribers = subscribers.concat(res.subscribers);
    }
    if (options.txPool) {
      subscribers = subscribers.concat(subscribersInTxPool);
    }
    options = common.util.assignDefined({}, options, { noReply: true });
    return await this.send(subscribers, data, options);
  }

  /**
   * @deprecated please use onConnect, onMessage, onSession, etc.
   */
  on(evt: string, func: (...args: Array<any>) => any) {
    switch (evt) {
      case 'connect':
        return this.onConnect(func);
      case 'message':
        return this.onMessage(func);
      case 'session':
        return this.onSession(func);
      default:
        if (!this.eventListeners[evt]) {
          this.eventListeners[evt] = [];
        }
        this.eventListeners[evt].push(func);
    }
  };

  /**
   * Add event listener function that will be called when at least one sub
   * client is connected to node. Multiple listeners will be called sequentially
   * in the order of added. Note that listeners added after client is connected
   * to node (i.e. `multiclient.isReady === true`) will not be called.
   */
  onConnect(func: ConnectHandler) {
    let promises = Object.keys(this.clients).map(clientID => new Promise((resolve, reject) => {
      this.clients[clientID].onConnect(resolve);
    }));
    Promise.any(promises).then(r => {
      this.isReady = true;
      func(r);
    }).catch(e => {
      console.log('Failed to connect to any client:', e.errors);
      this.close();
    });
  }

  /**
   * Add event listener function that will be called when client receives a
   * message. Multiple listeners will be called sequentially in the order of
   * added. Can be an async function, in which case each call will wait for
   * promise to resolve before calling next listener function. If the first
   * non-null and non-undefined returned value is `Uint8Array` or `string`,
   * the value will be sent back as reply; if the first non-null and
   * non-undefined returned value is `false`, no reply or ACK will be sent;
   * if all handler functions return `null` or `undefined`, an ACK indicating
   * msg received will be sent back.
   */
  onMessage(func: MessageHandler) {
    this.eventListeners.message.push(func);
  }

  /**
   * Add event listener function that will be called when client accepts a new
   * session.
   */
  onSession(func: SessionHandler) {
    this.eventListeners.session.push(func);
  }

  /**
   * Close the client and all sessions.
   */
  async close(): Promise<void> {
    let promises = [];
    for (let session of this.sessions.values()) {
      promises.push(session.close());
    }
    try {
      await Promise.all(promises);
    } catch (e) {
      console.log(e);
    }

    Object.keys(this.clients).forEach((clientID) => {
      try {
        this.clients[clientID].close();
      } catch (e) {
        console.log(e);
      }
    });

    this.msgCache.clear();
    this.isClosed = true;
  };

  /**
   * Start accepting sessions from addresses, which could be one or an array of
   * RegExp. If addrs is a string or string array, each element will be
   * converted to RegExp. Session from NKN address that matches any RegExp in
   * addrs will be allowed. When addrs is null or undefined, any address will be
   * accepted. Each function call will overwrite previous listening addresses.
   */
  listen(addrs: RegExp | Array<RegExp> | string | Array<string> | null | void) {
    if (addrs === null || addrs === undefined) {
      addrs = ([consts.defaultSessionAllowAddr]: Array<RegExp>);
    } else if (!Array.isArray(addrs)) {
      if (addrs instanceof RegExp) {
        addrs = ([addrs]: Array<RegExp>);
      } else {
        addrs = ([addrs]: Array<string>);
      }
    }

    this.acceptAddrs = [];
    for (let i = 0; i < addrs.length; i++) {
      if (addrs[i] instanceof RegExp) {
        this.acceptAddrs.push(addrs[i]);
      } else {
        this.acceptAddrs.push(new RegExp(addrs[i]));
      }
    }
  }

  /**
   * Dial a session to a remote NKN address.
   */
  async dial(remoteAddr: string, options: DialOptions = {}): Promise<ncp.Session> {
    let dialTimeout = options.dialTimeout;
    options = common.util.assignDefined({}, options);
    delete options.dialTimeout;
    let sessionConfig = common.util.assignDefined({}, this.options.sessionConfig, options);
    let sessionID = common.util.randomBytes(consts.sessionIDSize);
    let sessionKey = util.sessionKey(remoteAddr, sessionID);
    let session = this._newSession(remoteAddr, sessionID, sessionConfig);
    this.sessions.set(sessionKey, session);
    await session.dial(dialTimeout);
    return session;
  }
}

/**
 * Accept session handler function type.
 */
type SessionHandler = (ncp.Session) => void;

/**
 * Dial session options type.
 * @property {number} [dialTimeout] - Dial timeout in ms. Zero disables timeout.
 */
type DialOptions = {
  dialTimeout?: number,
  sessionConfig?: {},
};
