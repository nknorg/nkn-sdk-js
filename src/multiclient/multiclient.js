// @flow
"use strict";

import * as ncp from "@nkn/ncp";
import { Cache } from "memory-cache";
import Promise from "core-js-pure/features/promise";

import Client from "../client";
import Wallet from "../wallet";
import { defaultPublishOptions } from "../client/consts";
import * as common from "../common";
import * as consts from "./consts";
import * as message from "../client/message";
import * as util from "./util";

import type {
  ConnectHandler,
  ConnectFailedHandler,
  MessageHandler,
  WsErrorHandler,
  Destination,
  MessageData,
  ReplyData,
  SendOptions,
  PublishOptions,
} from "../client";
import type {
  CreateTransactionOptions,
  TransactionOptions,
  TxnOrHash,
} from "../wallet";

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
 * @param {boolean} [options.webrtc=undefined] - Force to use/not use web rtc if defined. By default, webrtc is used only in https location when tls is undefined.
 * @param {boolean} [options.tls=undefined] - Force to use ws or wss if defined. This option is only used when webrtc is not used. Default is true in https location, otherwise false.
 * @param {string|Array<string>} [options.stunServerAddr=["stun:stun.l.google.com:19302","stun:stun.cloudflare.com:3478","stun:stunserver.stunprotocol.org:3478"]] - Stun server address for webrtc.
 * @param {boolean|function} [options.worker=false] - Whether to use web workers (if available) to compute signatures. Can also be a function that returns web worker. Typically you only need to set it to a function if you import nkn-sdk as a module and are NOT using browserify or webpack worker-loader to bundle js file. The worker file is located at `lib/worker/webpack.worker.js`.
 * @param {number} [options.numSubClients=4] - Number of sub clients to create.
 * @param {boolean} [options.originalClient=false] - Whether to create client with no additional identifier prefix added. This client is not counted towards sub clients controlled by `options.numSubClients`.
 * @param {number} [options.msgCacheExpiration=300000] - Message cache expiration time in ms. This cache is used to remove duplicate messages received by different clients.
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
    worker: boolean | (() => Worker | Promise<Worker>),
    numSubClients: number,
    originalClient: boolean,
    msgCacheExpiration: number,
    sessionConfig: {},
    stunServerAddr?: string | Array<string>,
    webrtc?: boolean,
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
    connectFailed: Array<ConnectFailedHandler>,
    wsError: Array<WsErrorHandler>,
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
   * Whether multiclient is ready (at least one underylying client is ready).
   */
  isReady: boolean;
  /**
   * Whether multiclient fails to connect to node (all underlying clients failed).
   */
  isFailed: boolean;
  /**
   * Whether multiclient is closed.
   */
  isClosed: boolean;

  constructor(
    options: {
      seed?: string,
      identifier?: string,
      reconnectIntervalMin?: number,
      reconnectIntervalMax?: number,
      responseTimeout?: number,
      msgHoldingSeconds?: number,
      encrypt?: boolean,
      rpcServerAddr?: string,
      tls?: boolean,
      worker?: boolean | (() => Worker | Promise<Worker>),
      numSubClients?: number,
      originalClient?: boolean,
      msgCacheExpiration?: number,
      sessionConfig?: {},
      stunServerAddr?: string | Array<string>,
      webrtc?: boolean,
    } = {},
  ) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    let baseIdentifier = options.identifier || "";
    let clients: { [string]: Client } = {};

    if (options.originalClient) {
      let clientID = util.addIdentifier("", "");
      clients[clientID] = new Client(options);
      if (!options.seed) {
        options = common.util.assignDefined({}, options, {
          seed: clients[clientID].key.seed,
        });
      }
    }

    for (let i = 0; i < options.numSubClients; i++) {
      clients[util.addIdentifier("", i)] = new Client(
        common.util.assignDefined({}, options, {
          identifier: util.addIdentifier(baseIdentifier, i),
        }),
      );
      if (i === 0 && !options.seed) {
        options = common.util.assignDefined({}, options, {
          seed: clients[util.addIdentifier("", i)].key.seed,
        });
      }
    }

    let clientIDs = Object.keys(clients).sort();
    if (clientIDs.length === 0) {
      throw new RangeError("should have at least one client");
    }

    this.options = options;
    this.clients = clients;
    this.defaultClient = clients[clientIDs[0]];
    this.key = this.defaultClient.key;
    this.identifier = baseIdentifier;
    this.addr =
      (baseIdentifier ? baseIdentifier + "." : "") + this.key.publicKey;
    this.eventListeners = {
      connect: [],
      connectFailed: [],
      wsError: [],
      message: [],
      session: [],
    };
    this.msgCache = new Cache();
    this.acceptAddrs = [];
    this.sessions = new Map();
    this.isReady = false;
    this.isFailed = false;
    this.isClosed = false;

    for (let clientID: string of Object.keys(clients)) {
      clients[clientID].onMessage(
        async ({
          src,
          payload,
          payloadType,
          isEncrypted,
          messageId,
          noReply,
        }) => {
          if (this.isClosed) {
            return false;
          }

          if (payloadType === common.pb.payloads.PayloadType.SESSION) {
            if (!isEncrypted) {
              return false;
            }
            try {
              await this._handleSessionMsg(clientID, src, messageId, payload);
            } catch (e) {
              if (
                !(
                  e instanceof ncp.errors.SessionClosedError ||
                  e instanceof common.errors.AddrNotAllowedError
                )
              ) {
                throw e;
              }
            }
            return false;
          }

          let key = common.util.bytesToHex(messageId);
          if (this.msgCache.get(key) !== null) {
            return false;
          }
          this.msgCache.put(key, clientID, options.msgCacheExpiration);

          src = util.removeIdentifier(src).addr;

          if (this.eventListeners.message.length > 0) {
            let responses = await Promise.all(
              this.eventListeners.message.map(async (f) => {
                try {
                  return await f({
                    src,
                    payload,
                    payloadType,
                    isEncrypted,
                    messageId,
                    noReply,
                  });
                } catch (e) {
                  console.log("Message handler error:", e);
                  return null;
                }
              }),
            );
            if (!noReply) {
              let responded = false;
              for (let response of responses) {
                if (response === false) {
                  return false;
                } else if (response !== undefined && response !== null) {
                  this.send(src, response, {
                    encrypt: isEncrypted,
                    msgHoldingSeconds: 0,
                    replyToId: messageId,
                  }).catch((e) => {
                    console.log("Send response error:", e);
                  });
                  responded = true;
                  break;
                }
              }
              if (!responded) {
                for (let clientID: string of Object.keys(clients)) {
                  if (clients[clientID].isReady) {
                    clients[clientID]
                      ._sendACK(
                        util.addIdentifierPrefixAll(src, clientID),
                        messageId,
                        isEncrypted,
                      )
                      .catch((e) => {
                        console.log("Send ack error:", e);
                      });
                  }
                }
              }
            }
          }
          return false;
        },
      );
    }

    let connectPromises = Object.keys(this.clients).map(
      (clientID) =>
        new Promise((resolve, reject) => {
          this.clients[clientID].onConnect(resolve);
        }),
    );
    Promise.any(connectPromises).then((r) => {
      this.isReady = true;
      if (this.eventListeners.connect.length > 0) {
        this.eventListeners.connect.forEach(async (f) => {
          try {
            await f(r);
          } catch (e) {
            console.log("Connect handler error:", e);
          }
        });
      }
    });

    let connectFailedPromises = Object.keys(this.clients).map(
      (clientID) =>
        new Promise((resolve, reject) => {
          this.clients[clientID].onConnectFailed(resolve);
        }),
    );
    Promise.all(connectFailedPromises).then(() => {
      this.isFailed = true;
      if (this.eventListeners.connectFailed.length > 0) {
        this.eventListeners.connectFailed.forEach(async (f) => {
          try {
            await f();
          } catch (e) {
            console.log("Connect failed handler error:", e);
          }
        });
      } else {
        console.log("All clients connect failed");
      }
    });

    Object.keys(this.clients).map((clientID) => {
      this.clients[clientID].onWsError((event) => {
        if (this.eventListeners.wsError.length > 0) {
          this.eventListeners.wsError.forEach(async (f) => {
            try {
              await f(event);
            } catch (e) {
              console.log("WsError handler error:", e);
            }
          });
        } else {
          console.log(event.message);
        }
      });
    });
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

  async _handleSessionMsg(
    localClientID: string,
    src: string,
    sessionID: string,
    data: Uint8Array,
  ): Promise<void> {
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
      session = (this._newSession(
        remoteAddr,
        sessionID,
        this.options.sessionConfig,
      ): any);
      this.sessions.set(sessionKey, session);
    }

    session.receiveWith(localClientID, remoteClientID, data);

    if (!existed) {
      await session.accept();

      if (this.eventListeners.session.length > 0) {
        await Promise.all(
          this.eventListeners.session.map(async (f) => {
            try {
              return await f(session);
            } catch (e) {
              console.log("Session handler error:", e);
              return;
            }
          }),
        );
      }
    }
  }

  _newSession(
    remoteAddr: string,
    sessionID: string,
    sessionConfig: {} = {},
  ): ncp.Session {
    let clientIDs = this.readyClientIDs().sort();
    return new ncp.Session(
      this.addr,
      remoteAddr,
      clientIDs,
      null,
      async (localClientID, remoteClientID, data) => {
        let client = this.clients[localClientID];
        if (!client.isReady) {
          throw new common.errors.ClientNotReadyError();
        }
        let payload = message.newSessionPayload(data, sessionID);
        await client._send(
          util.addIdentifierPrefix(remoteAddr, remoteClientID),
          payload,
        );
      },
      sessionConfig,
    );
  }

  /**
   * Send byte or string data to a single or an array of destination using the
   * client with given clientID. Typically `send` should be used instead for
   * better reliability and lower latency.
   * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
   */
  async sendWithClient(
    clientID: string,
    dest: Destination,
    data: MessageData,
    options: SendOptions = {},
  ): Promise<ReplyData> {
    let client = this.clients[clientID];
    if (!client) {
      throw new common.errors.InvalidArgumentError("no such clientID");
    }
    if (!client.isReady) {
      throw new common.errors.ClientNotReadyError();
    }
    return await client.send(
      util.addIdentifierPrefixAll(dest, clientID),
      data,
      options,
    );
  }

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
  async send(
    dest: Destination,
    data: MessageData,
    options: SendOptions = {},
  ): Promise<ReplyData> {
    options = common.util.assignDefined({}, options, {
      messageId: common.util.randomBytes(message.messageIdSize),
    });
    let readyClientID = this.readyClientIDs();
    if (readyClientID.length === 0) {
      throw new common.errors.ClientNotReadyError();
    }
    dest = await this.defaultClient._processDests(dest);
    try {
      return await Promise.any(
        readyClientID.map((clientID) => {
          return this.sendWithClient(clientID, dest, data, options);
        }),
      );
    } catch (e) {
      throw new Error("failed to send with any client: " + e.errors);
    }
  }

  /**
   * Send byte or string data to all subscribers of a topic using all available
   * clients.
   * @returns A promise that will be resolved with null when send success.
   */
  async publish(
    topic: string,
    data: MessageData,
    options: PublishOptions = {},
  ): Promise<null> {
    options = common.util.assignDefined({}, defaultPublishOptions, options, {
      noReply: true,
    });
    let offset = options.offset;
    let res = await this.getSubscribers(topic, {
      offset,
      limit: options.limit,
      txPool: options.txPool,
    });
    let subscribers = res.subscribers;
    let subscribersInTxPool = res.subscribersInTxPool;
    while (res.subscribers && res.subscribers.length >= options.limit) {
      offset += options.limit;
      res = await this.getSubscribers(topic, { offset, limit: options.limit });
      subscribers = subscribers.concat(res.subscribers);
    }
    if (options.txPool) {
      subscribers = subscribers.concat(subscribersInTxPool);
    }
    return await this.send(subscribers, data, options);
  }

  /**
   * @deprecated please use onConnect, onMessage, onSession, etc.
   */
  on(evt: string, func: (...args: Array<any>) => any) {
    if (!this.eventListeners[evt]) {
      this.eventListeners[evt] = [];
    }
    this.eventListeners[evt].push(func);
  }

  /**
   * Add event listener function that will be called when at least one sub
   * client is connected to node. Multiple listeners will be called sequentially
   * in the order of added. Note that listeners added after client is connected
   * to node (i.e. `multiclient.isReady === true`) will not be called.
   */
  onConnect(func: ConnectHandler) {
    this.eventListeners.connect.push(func);
  }

  /**
   * Add event listener function that will be called when all sub clients fail
   * to connect to node. Multiple listeners will be called sequentially in the
   * order of added. Note that listeners added after client fails to connect to
   * node (i.e. `multiclient.isFailed === true`) will not be called.
   */
  onConnectFailed(func: ConnectFailedHandler) {
    this.eventListeners.connectFailed.push(func);
  }

  /**
   * Add event listener function that will be called when any client websocket
   * connection throws an error. Multiple listeners will be called sequentially
   * in the order of added.
   */
  onWsError(func: WsErrorHandler) {
    this.eventListeners.wsError.push(func);
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
   * msg received will be sent back. Receiving reply or ACK will not trigger
   * the event listener.
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
  }

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
  async dial(
    remoteAddr: string,
    options: DialOptions = {},
  ): Promise<ncp.Session> {
    let dialTimeout = options.dialTimeout;
    options = common.util.assignDefined({}, options);
    delete options.dialTimeout;
    let sessionConfig = common.util.assignDefined(
      {},
      this.options.sessionConfig,
      options,
    );
    let sessionID = common.util.randomBytes(consts.sessionIDSize);
    let sessionKey = util.sessionKey(remoteAddr, sessionID);
    let session = this._newSession(remoteAddr, sessionID, sessionConfig);
    this.sessions.set(sessionKey, session);
    await session.dial(dialTimeout);
    return session;
  }

  /**
   * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  async getLatestBlock(): Promise<{ height: number, hash: string }> {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await Wallet.getLatestBlock(
            this.clients[clientID].wallet.options,
          );
        } catch (e) {}
      }
    }
    return await Wallet.getLatestBlock(this.options);
  }

  /**
   * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  async getRegistrant(
    name: string,
  ): Promise<{ registrant: string, expiresAt: number }> {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await Wallet.getRegistrant(
            name,
            this.clients[clientID].wallet.options,
          );
        } catch (e) {}
      }
    }
    return await Wallet.getRegistrant(name, this.options);
  }

  /**
   * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  async getSubscribers(
    topic: string,
    options: {
      offset?: number,
      limit?: number,
      meta?: boolean,
      txPool?: boolean,
    } = {},
  ): Promise<{
    subscribers: Array<string> | { [string]: string },
    subscribersInTxPool?: Array<string> | { [string]: string },
  }> {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await Wallet.getSubscribers(
            topic,
            Object.assign({}, this.clients[clientID].wallet.options, options),
          );
        } catch (e) {}
      }
    }
    return await Wallet.getSubscribers(
      topic,
      Object.assign({}, this.options, options),
    );
  }

  /**
   * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
   * this multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  async getSubscribersCount(topic: string): Promise<number> {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await Wallet.getSubscribersCount(
            topic,
            this.clients[clientID].wallet.options,
          );
        } catch (e) {}
      }
    }
    return await Wallet.getSubscribersCount(topic, this.options);
  }

  /**
   * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  async getSubscription(
    topic: string,
    subscriber: string,
  ): Promise<{ meta: string, expiresAt: number }> {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await Wallet.getSubscription(
            topic,
            subscriber,
            this.clients[clientID].wallet.options,
          );
        } catch (e) {}
      }
    }
    return await Wallet.getSubscription(topic, subscriber, this.options);
  }

  /**
   * Same as [Wallet.getBalance](#walletgetbalance), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  async getBalance(address: ?string): Promise<common.Amount> {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await Wallet.getBalance(
            address || this.defaultClient.wallet.address,
            this.clients[clientID].wallet.options,
          );
        } catch (e) {}
      }
    }
    return await Wallet.getBalance(
      address || this.defaultClient.wallet.address,
      this.options,
    );
  }

  /**
   * Same as [Wallet.getNonce](#walletgetnonce), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  async getNonce(
    address: ?string,
    options: { txPool: boolean } = {},
  ): Promise<number> {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await Wallet.getNonce(
            address || this.defaultClient.wallet.address,
            Object.assign({}, this.clients[clientID].wallet.options, options),
          );
        } catch (e) {}
      }
    }
    return await Wallet.getNonce(
      address || this.defaultClient.wallet.address,
      Object.assign({}, this.options, options),
    );
  }

  /**
   * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  async sendTransaction(
    txn: common.pb.transaction.Transaction,
  ): Promise<string> {
    let clients = Object.values(this.clients).filter(
      (client: Client) => client.wallet.options.rpcServerAddr,
    );
    if (clients.length > 0) {
      try {
        return await Promise.any(
          clients.map((client: Client) =>
            Wallet.sendTransaction(txn, client.wallet.options),
          ),
        );
      } catch (e) {}
    }
    return await Wallet.sendTransaction(txn, this.options);
  }

  /**
   * Same as [wallet.transferTo](#wallettransferto), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  transferTo(
    toAddress: string,
    amount: number | string | common.Amount,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.transferTo.call(this, toAddress, amount, options);
  }

  /**
   * Same as [wallet.registerName](#walletregistername), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  registerName(
    name: string,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.registerName.call(this, name, options);
  }

  /**
   * Same as [wallet.transferName](#wallettransfername), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  transferName(
    name: string,
    recipient: string,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.transferName.call(this, name, recipient, options);
  }

  /**
   * Same as [wallet.deleteName](#walletdeletename), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  deleteName(
    name: string,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.deleteName.call(this, name, options);
  }

  /**
   * Same as [wallet.subscribe](#walletsubscribe), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  subscribe(
    topic: string,
    duration: number,
    identifier: ?string = "",
    meta: ?string = "",
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.subscribe.call(
      this,
      topic,
      duration,
      identifier,
      meta,
      options,
    );
  }

  /**
   * Same as [wallet.unsubscribe](#walletunsubscribe), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */
  unsubscribe(
    topic: string,
    identifier: string = "",
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.unsubscribe.call(this, topic, identifier, options);
  }

  createTransaction(
    pld: common.pb.transaction.Payload,
    nonce: number,
    options: CreateTransactionOptions = {},
  ): Promise<common.pb.transaction.Transaction> {
    return this.defaultClient.wallet.createTransaction(pld, nonce, options);
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
