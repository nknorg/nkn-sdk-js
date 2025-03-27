"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var ncp = _interopRequireWildcard(require("@nkn/ncp"));

var _memoryCache = require("memory-cache");

var _promise = _interopRequireDefault(require("core-js-pure/features/promise"));

var _client = _interopRequireDefault(require("../client"));

var _wallet = _interopRequireDefault(require("../wallet"));

var _consts = require("../client/consts");

var common = _interopRequireWildcard(require("../common"));

var consts = _interopRequireWildcard(require("./consts"));

var message = _interopRequireWildcard(require("../client/message"));

var util = _interopRequireWildcard(require("./util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
class MultiClient {
  /**
   * Address identifier.
   */

  /**
   * Client address, which will be `identifier.pubicKeyHex` if `identifier` is not empty, otherwise just `pubicKeyHex`.
   */

  /**
   * Underlying NKN clients used to send/receive data.
   */

  /**
   * Default NKN client for low level API access.
   */

  /**
   * Whether multiclient is ready (at least one underylying client is ready).
   */

  /**
   * Whether multiclient fails to connect to node (all underlying clients failed).
   */

  /**
   * Whether multiclient is closed.
   */
  constructor(options = {}) {
    _defineProperty(this, "options", void 0);

    _defineProperty(this, "key", void 0);

    _defineProperty(this, "identifier", void 0);

    _defineProperty(this, "addr", void 0);

    _defineProperty(this, "eventListeners", void 0);

    _defineProperty(this, "clients", void 0);

    _defineProperty(this, "defaultClient", void 0);

    _defineProperty(this, "msgCache", void 0);

    _defineProperty(this, "acceptAddrs", void 0);

    _defineProperty(this, "sessions", void 0);

    _defineProperty(this, "isReady", void 0);

    _defineProperty(this, "isFailed", void 0);

    _defineProperty(this, "isClosed", void 0);

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let baseIdentifier = options.identifier || "";
    let clients = {};

    if (options.originalClient) {
      let clientID = util.addIdentifier("", "");
      clients[clientID] = new _client.default(options);

      if (!options.seed) {
        options = common.util.assignDefined({}, options, {
          seed: clients[clientID].key.seed
        });
      }
    }

    for (let i = 0; i < options.numSubClients; i++) {
      clients[util.addIdentifier("", i)] = new _client.default(common.util.assignDefined({}, options, {
        identifier: util.addIdentifier(baseIdentifier, i)
      }));

      if (i === 0 && !options.seed) {
        options = common.util.assignDefined({}, options, {
          seed: clients[util.addIdentifier("", i)].key.seed
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
    this.addr = (baseIdentifier ? baseIdentifier + "." : "") + this.key.publicKey;
    this.eventListeners = {
      connect: [],
      connectFailed: [],
      wsError: [],
      message: [],
      session: []
    };
    this.msgCache = new _memoryCache.Cache();
    this.acceptAddrs = [];
    this.sessions = new Map();
    this.isReady = false;
    this.isFailed = false;
    this.isClosed = false;

    for (let clientID of Object.keys(clients)) {
      clients[clientID].onMessage(async ({
        src,
        payload,
        payloadType,
        isEncrypted,
        messageId,
        noReply
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
            if (!(e instanceof ncp.errors.SessionClosedError || e instanceof common.errors.AddrNotAllowedError)) {
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
          let responses = await _promise.default.all(this.eventListeners.message.map(async f => {
            try {
              return await f({
                src,
                payload,
                payloadType,
                isEncrypted,
                messageId,
                noReply
              });
            } catch (e) {
              console.log("Message handler error:", e);
              return null;
            }
          }));

          if (!noReply) {
            let responded = false;

            for (let response of responses) {
              if (response === false) {
                return false;
              } else if (response !== undefined && response !== null) {
                this.send(src, response, {
                  encrypt: isEncrypted,
                  msgHoldingSeconds: 0,
                  replyToId: messageId
                }).catch(e => {
                  console.log("Send response error:", e);
                });
                responded = true;
                break;
              }
            }

            if (!responded) {
              for (let clientID of Object.keys(clients)) {
                if (clients[clientID].isReady) {
                  clients[clientID]._sendACK(util.addIdentifierPrefixAll(src, clientID), messageId, isEncrypted).catch(e => {
                    console.log("Send ack error:", e);
                  });
                }
              }
            }
          }
        }

        return false;
      });
    }

    let connectPromises = Object.keys(this.clients).map(clientID => new _promise.default((resolve, reject) => {
      this.clients[clientID].onConnect(resolve);
    }));

    _promise.default.any(connectPromises).then(r => {
      this.isReady = true;

      if (this.eventListeners.connect.length > 0) {
        this.eventListeners.connect.forEach(async f => {
          try {
            await f(r);
          } catch (e) {
            console.log("Connect handler error:", e);
          }
        });
      }
    });

    let connectFailedPromises = Object.keys(this.clients).map(clientID => new _promise.default((resolve, reject) => {
      this.clients[clientID].onConnectFailed(resolve);
    }));

    _promise.default.all(connectFailedPromises).then(() => {
      this.isFailed = true;

      if (this.eventListeners.connectFailed.length > 0) {
        this.eventListeners.connectFailed.forEach(async f => {
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

    Object.keys(this.clients).map(clientID => {
      this.clients[clientID].onWsError(event => {
        if (this.eventListeners.wsError.length > 0) {
          this.eventListeners.wsError.forEach(async f => {
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


  getSeed() {
    return this.key.seed;
  }
  /**
   * Get the public key of the client.
   * @returns Public key as hex string.
   */


  getPublicKey() {
    return this.key.publicKey;
  }

  _shouldAcceptAddr(addr) {
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
      if (!this._shouldAcceptAddr(remoteAddr)) {
        throw new common.errors.AddrNotAllowedError();
      }

      session = this._newSession(remoteAddr, sessionID, this.options.sessionConfig);
      this.sessions.set(sessionKey, session);
    }

    session.receiveWith(localClientID, remoteClientID, data);

    if (!existed) {
      await session.accept();

      if (this.eventListeners.session.length > 0) {
        await _promise.default.all(this.eventListeners.session.map(async f => {
          try {
            return await f(session);
          } catch (e) {
            console.log("Session handler error:", e);
            return;
          }
        }));
      }
    }
  }

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
  /**
   * Send byte or string data to a single or an array of destination using the
   * client with given clientID. Typically `send` should be used instead for
   * better reliability and lower latency.
   * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
   */


  async sendWithClient(clientID, dest, data, options = {}) {
    let client = this.clients[clientID];

    if (!client) {
      throw new common.errors.InvalidArgumentError("no such clientID");
    }

    if (!client.isReady) {
      throw new common.errors.ClientNotReadyError();
    }

    return await client.send(util.addIdentifierPrefixAll(dest, clientID), data, options);
  }
  /**
   * Get the list of clientID that are ready.
   */


  readyClientIDs() {
    return Object.keys(this.clients).filter(clientID => {
      return this.clients[clientID] && this.clients[clientID].isReady;
    });
  }
  /**
   * Send byte or string data to a single or an array of destination using all
   * available clients.
   * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
   */


  async send(dest, data, options = {}) {
    options = common.util.assignDefined({}, options, {
      messageId: common.util.randomBytes(message.messageIdSize)
    });
    let readyClientID = this.readyClientIDs();

    if (readyClientID.length === 0) {
      throw new common.errors.ClientNotReadyError();
    }

    dest = await this.defaultClient._processDests(dest);

    try {
      return await _promise.default.any(readyClientID.map(clientID => {
        return this.sendWithClient(clientID, dest, data, options);
      }));
    } catch (e) {
      throw new Error("failed to send with any client: " + e.errors);
    }
  }
  /**
   * Send byte or string data to all subscribers of a topic using all available
   * clients.
   * @returns A promise that will be resolved with null when send success.
   */


  async publish(topic, data, options = {}) {
    options = common.util.assignDefined({}, _consts.defaultPublishOptions, options, {
      noReply: true
    });
    let offset = options.offset;
    let res = await this.getSubscribers(topic, {
      offset,
      limit: options.limit,
      txPool: options.txPool
    });
    let subscribers = res.subscribers;
    let subscribersInTxPool = res.subscribersInTxPool;

    while (res.subscribers && res.subscribers.length >= options.limit) {
      offset += options.limit;
      res = await this.getSubscribers(topic, {
        offset,
        limit: options.limit
      });
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


  on(evt, func) {
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


  onConnect(func) {
    this.eventListeners.connect.push(func);
  }
  /**
   * Add event listener function that will be called when all sub clients fail
   * to connect to node. Multiple listeners will be called sequentially in the
   * order of added. Note that listeners added after client fails to connect to
   * node (i.e. `multiclient.isFailed === true`) will not be called.
   */


  onConnectFailed(func) {
    this.eventListeners.connectFailed.push(func);
  }
  /**
   * Add event listener function that will be called when any client websocket
   * connection throws an error. Multiple listeners will be called sequentially
   * in the order of added.
   */


  onWsError(func) {
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


  onMessage(func) {
    this.eventListeners.message.push(func);
  }
  /**
   * Add event listener function that will be called when client accepts a new
   * session.
   */


  onSession(func) {
    this.eventListeners.session.push(func);
  }
  /**
   * Close the client and all sessions.
   */


  async close() {
    let promises = [];

    for (let session of this.sessions.values()) {
      promises.push(session.close());
    }

    try {
      await _promise.default.all(promises);
    } catch (e) {
      console.log(e);
    }

    Object.keys(this.clients).forEach(clientID => {
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


  listen(addrs) {
    if (addrs === null || addrs === undefined) {
      addrs = [consts.defaultSessionAllowAddr];
    } else if (!Array.isArray(addrs)) {
      if (addrs instanceof RegExp) {
        addrs = [addrs];
      } else {
        addrs = [addrs];
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


  async dial(remoteAddr, options = {}) {
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
  /**
   * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  async getLatestBlock() {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await _wallet.default.getLatestBlock(this.clients[clientID].wallet.options);
        } catch (e) {}
      }
    }

    return await _wallet.default.getLatestBlock(this.options);
  }
  /**
   * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  async getRegistrant(name) {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await _wallet.default.getRegistrant(name, this.clients[clientID].wallet.options);
        } catch (e) {}
      }
    }

    return await _wallet.default.getRegistrant(name, this.options);
  }
  /**
   * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  async getSubscribers(topic, options = {}) {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await _wallet.default.getSubscribers(topic, Object.assign({}, this.clients[clientID].wallet.options, options));
        } catch (e) {}
      }
    }

    return await _wallet.default.getSubscribers(topic, Object.assign({}, this.options, options));
  }
  /**
   * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
   * this multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  async getSubscribersCount(topic) {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await _wallet.default.getSubscribersCount(topic, this.clients[clientID].wallet.options);
        } catch (e) {}
      }
    }

    return await _wallet.default.getSubscribersCount(topic, this.options);
  }
  /**
   * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  async getSubscription(topic, subscriber) {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await _wallet.default.getSubscription(topic, subscriber, this.clients[clientID].wallet.options);
        } catch (e) {}
      }
    }

    return await _wallet.default.getSubscription(topic, subscriber, this.options);
  }
  /**
   * Same as [Wallet.getBalance](#walletgetbalance), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  async getBalance(address) {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await _wallet.default.getBalance(address || this.defaultClient.wallet.address, this.clients[clientID].wallet.options);
        } catch (e) {}
      }
    }

    return await _wallet.default.getBalance(address || this.defaultClient.wallet.address, this.options);
  }
  /**
   * Same as [Wallet.getNonce](#walletgetnonce), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  async getNonce(address, options = {}) {
    for (let clientID of Object.keys(this.clients)) {
      if (this.clients[clientID].wallet.options.rpcServerAddr) {
        try {
          return await _wallet.default.getNonce(address || this.defaultClient.wallet.address, Object.assign({}, this.clients[clientID].wallet.options, options));
        } catch (e) {}
      }
    }

    return await _wallet.default.getNonce(address || this.defaultClient.wallet.address, Object.assign({}, this.options, options));
  }
  /**
   * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  async sendTransaction(txn) {
    let clients = Object.values(this.clients).filter(client => client.wallet.options.rpcServerAddr);

    if (clients.length > 0) {
      try {
        return await _promise.default.any(clients.map(client => _wallet.default.sendTransaction(txn, client.wallet.options)));
      } catch (e) {}
    }

    return await _wallet.default.sendTransaction(txn, this.options);
  }
  /**
   * Same as [wallet.transferTo](#wallettransferto), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  transferTo(toAddress, amount, options = {}) {
    return common.rpc.transferTo.call(this, toAddress, amount, options);
  }
  /**
   * Same as [wallet.registerName](#walletregistername), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  registerName(name, options = {}) {
    return common.rpc.registerName.call(this, name, options);
  }
  /**
   * Same as [wallet.transferName](#wallettransfername), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  transferName(name, recipient, options = {}) {
    return common.rpc.transferName.call(this, name, recipient, options);
  }
  /**
   * Same as [wallet.deleteName](#walletdeletename), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  deleteName(name, options = {}) {
    return common.rpc.deleteName.call(this, name, options);
  }
  /**
   * Same as [wallet.subscribe](#walletsubscribe), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  subscribe(topic, duration, identifier = "", meta = "", options = {}) {
    return common.rpc.subscribe.call(this, topic, duration, identifier, meta, options);
  }
  /**
   * Same as [wallet.unsubscribe](#walletunsubscribe), but using this
   * multiclient's connected node as rpcServerAddr, followed by this
   * multiclient's rpcServerAddr if failed.
   */


  unsubscribe(topic, identifier = "", options = {}) {
    return common.rpc.unsubscribe.call(this, topic, identifier, options);
  }

  createTransaction(pld, nonce, options = {}) {
    return this.defaultClient.wallet.createTransaction(pld, nonce, options);
  }

}
/**
 * Accept session handler function type.
 */

/**
 * Dial session options type.
 * @property {number} [dialTimeout] - Dial timeout in ms. Zero disables timeout.
 */


exports.default = MultiClient;