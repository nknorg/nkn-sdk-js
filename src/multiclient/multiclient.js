'use strict';

import * as ncp from '@nkn/ncp';
import { Cache } from 'memory-cache';
import Promise from 'core-js-pure/features/promise';

import Client from '../client';
import * as common from '../common';
import * as consts from './consts';
import * as message from '../client/message';
import * as util from './util';

export default class MultiClient {
  options;
  key;
  identifier;
  addr;
  eventListeners;
  clients;
  defaultClient;
  msgCache;
  acceptAddrs;
  sessions;
  isReady;
  isClosed;

  constructor(options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    let baseIdentifier = options.identifier || '';
    let clients = {};

    if (options.originalClient) {
      let clientID = util.addIdentifier('', '');
      clients[clientID] = new Client(options);
      if (!options.seed) {
        options = common.util.assignDefined({}, options, { seed: clients[clientID].key.seed });
      }
    }

    for (var i = 0; i < options.numSubClients; i++) {
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
    this.eventListeners = {};
    this.msgCache = new Cache();
    this.acceptAddrs = [];
    this.sessions = new Map();
    this.isReady = false;
    this.isClosed = false;

    for (let [clientID, client] of Object.entries(clients)) {
      client.on('message', async ({ src, payload, payloadType, isEncrypted, pid }) => {
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
          for (let [clientID, client] of Object.entries(clients)) {
            if (client.isReady) {
              client.sendACK(util.addIdentifierPrefixAll(src, clientID), pid, isEncrypted);
            }
          }
        }
        return false;
      });
    }
  }

  getSeed() {
    return this.key.seed;
  }

  getPublicKey() {
    return this.key.publicKey;
  }

  shouldAcceptAddr(addr) {
    for (let allowAddr of this.acceptAddrs) {
      if (allowAddr.test(addr)) {
        return true;
      }
    }
  	return false;
  }

  async _handleSessionMsg(localClientID, src, sessionID, data) {
    let remote = util.removeIdentifier(src);
    let remoteAddr = remote.addr;
    let remoteClientID = remote.clientID;
    let sessionKey = util.sessionKey(remoteAddr, sessionID);

    let session;
    let existed = this.sessions.has(sessionKey);
    if (existed) {
      session = this.sessions.get(sessionKey);
    } else {
      if (!this.shouldAcceptAddr(remoteAddr)) {
        throw new common.errors.AddrNotAllowedError();
      }
      session = this._newSession(remoteAddr, sessionID, this.options.sessionConfig);
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
            return null;
          }
        }));
      }
    }
  };

  _newSession(remoteAddr, sessionID, sessionConfig = {}) {
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

  async sendWithClient(clientID, dest, data, options = {}) {
    let client = this.clients[clientID];
    if (!client) {
      throw new common.errors.InvalidArgumentError('no such clientID');
    }
    if (!client.isReady) {
      throw new common.errors.ClientNotReadyError();
    }
    return await client.send(util.addIdentifierPrefixAll(dest, clientID), data, options);
  };

  readyClientIDs() {
    return Object.keys(this.clients).filter((clientID) => {
      return this.clients[clientID] && this.clients[clientID].isReady;
    });
  }

  async send(dest, data, options = {}) {
    options = common.util.assignDefined({}, options, { pid: common.util.randomBytes(message.pidSize) });
    let readyClientID = this.readyClientIDs();
    if (readyClientID.length === 0) {
      throw new common.errors.ClientNotReadyError();
    }
    try {
      return await Promise.any(readyClientID.map((clientID) => {
        return this.sendWithClient(clientID, dest, data, options);
      }));
    } catch (e) {
      throw new Error('failed to send with any client: ' + e.errors);
    }
  };

  async publish(topic, data, options = {}) {
    let offset = 0;
    let limit = 1000;
    let res = await this.defaultClient.getSubscribers(topic, { offset, limit, txPool: options.txPool || false });
    let subscribers = res.subscribers;
    let subscribersInTxPool = res.subscribersInTxPool;
    while (res.subscribers && res.subscribers.length >= limit) {
      offset += limit;
      res = await this.getSubscribers(topic, { offset, limit });
      subscribers = subscribers.concat(res.subscribers);
    }
    if (options.txPool) {
      subscribers = subscribers.concat(subscribersInTxPool);
    }
    options = common.util.assignDefined({}, options, { noReply: true });
    return await this.send(subscribers, data, options);
  }

  on(e, func) {
    switch (e) {
      case 'connect':
        let promises = Object.values(this.clients).map(client => new Promise((resolve, reject) => {
          client.on('connect', resolve);
        }));
        Promise.any(promises).then(r => {
          this.isReady = true;
          func(r);
        }).catch(e => {
          console.log('Failed to connect to any client:', e.errors);
          this.close();
        });
      case 'message':
      case 'session':
        if (this.eventListeners[e]) {
          this.eventListeners[e].push(func);
        } else {
          this.eventListeners[e] = [func];
        }
        return;
      default:
        return this.defaultClient.on(e, func);
    }
  };

  async close() {
    let promises = [];
    for (let session of this.sessions.values()) {
      promises.push(session.close());
    }
    try {
      await Promise.all(promises);
    } catch (e) {
      console.log(e);
    }

    Object.values(this.clients).forEach((client) => {
      try {
        client.close()
      } catch (e) {
        console.log(e);
      }
    });

    this.msgCache.clear();
    this.isClosed = true;
  };

  listen(addrsRe) {
    if (addrsRe === null || addrsRe === undefined) {
      addrsRe = [consts.defaultSessionAllowAddr];
    } else if (!Array.isArray(addrsRe)) {
      addrsRe = [addrsRe];
    }

    for (var i = 0; i < addrsRe.length; i++) {
      if (!(addrsRe[i] instanceof RegExp)) {
        addrsRe[i] = new RegExp(addrsRe[i]);
      }
    }

    this.acceptAddrs = addrsRe;
  }

  async dial(remoteAddr, options = {}) {
    let dialTimeout = options.dialTimeout;
    options = common.util.assignDefined({}, options);
    delete options.dialTimeout;
    let sessionConfig = common.util.assignDefined({}, this.options.sessionConfig, options);
    let sessionID = common.util.randomBytes(consts.sessionIDSize);
    let sessionKey = util.sessionKey(remoteAddr, sessionID);
    let session = this._newSession(remoteAddr, sessionID, sessionConfig);
    this.sessions.set(sessionKey, session);
    await session.dial(options.dialTimeout);
    return session;
  }
}
