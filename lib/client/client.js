'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

var _isomorphicWs = _interopRequireDefault(require("isomorphic-ws"));

var common = _interopRequireWildcard(require("../common"));

var consts = _interopRequireWildcard(require("./consts"));

var message = _interopRequireWildcard(require("./message"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * NKN client that sends data to and receives data from other NKN clients.
 * Typically you might want to use [MultiClient](#multiclient) for better
 * reliability and lower latency.
 * @param {Object} [options={}] - Client configuration
 * @param {string} [options.seed=undefined] - Secret seed (64 hex characters). If empty, a random seed will be used.
 * @param {string} [options.identifier=undefined] - Identifier used to differentiate multiple clients sharing the same secret seed.
 * @param {number} [options.reconnectIntervalMin=1000] - Minimal reconnect interval in ms.
 * @param {number} [options.reconnectIntervalMax=64000] - Maximal reconnect interval in ms.
 * @param {number} [options.responseTimeout=5000] - Message response timeout in ms. Zero disables timeout.
 * @param {number} [options.msgHoldingSeconds=0] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 * @param {boolean} [options.encrypt=true] - Whether to end to end encrypt message.
 * @param {string} [options.seedRpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - Seed RPC server address used to join the network.
 * @param {boolean} [options.tls=undefined] - Force to use wss instead of ws protocol. If not defined, wss will only be used in https location.
 */
class Client {
  /**
   * Address identifier.
   */

  /**
   * Client address, which will be `identifier.pubicKeyHex` if `identifier` is not empty, otherwise just `pubicKeyHex`.
   */

  /**
   * Whether client is ready (connected to a node).
   */

  /**
   * Whether client is closed.
   */
  constructor(options = {}) {
    _defineProperty(this, "options", void 0);

    _defineProperty(this, "key", void 0);

    _defineProperty(this, "identifier", void 0);

    _defineProperty(this, "addr", void 0);

    _defineProperty(this, "eventListeners", void 0);

    _defineProperty(this, "sigChainBlockHash", void 0);

    _defineProperty(this, "shouldReconnect", void 0);

    _defineProperty(this, "reconnectInterval", void 0);

    _defineProperty(this, "responseManager", void 0);

    _defineProperty(this, "ws", void 0);

    _defineProperty(this, "node", void 0);

    _defineProperty(this, "isReady", void 0);

    _defineProperty(this, "isClosed", void 0);

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let key = new common.Key(options.seed);
    let identifier = options.identifier || '';
    let pubkey = key.publicKey;
    let addr = (identifier ? identifier + '.' : '') + pubkey;
    this.options = options;
    this.key = key;
    this.identifier = identifier;
    this.addr = addr;
    this.eventListeners = {
      connect: [],
      message: []
    };
    this.sigChainBlockHash = null;
    this.shouldReconnect = false;
    this.reconnectInterval = options.reconnectIntervalMin;
    this.responseManager = new ResponseManager();
    this.ws = null;
    this.node = null;
    this.isReady = false;
    this.isClosed = false;

    this._connect();
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

  async _connect() {
    let getAddr = this._shouldUseTls() ? common.rpc.getWssAddr : common.rpc.getWsAddr;
    let res, error;

    for (let i = 0; i < 3; i++) {
      try {
        res = await getAddr(this.options.seedRpcServerAddr, {
          address: this.addr
        });
      } catch (e) {
        error = e;
        continue;
      }

      this._newWsAddr(res);

      return;
    }

    console.log('RPC call failed,', error);

    if (this.shouldReconnect) {
      this._reconnect();
    }
  }

  _reconnect() {
    console.log('Reconnecting in ' + this.reconnectInterval / 1000 + 's...');
    setTimeout(() => this._connect(), this.reconnectInterval);
    this.reconnectInterval *= 2;

    if (this.reconnectInterval > this.options.reconnectIntervalMax) {
      this.reconnectInterval = this.options.reconnectIntervalMax;
    }
  }

  /**
   * @deprecated please use onConnect, onMessage, etc.
   */
  on(evt, func) {
    if (!this.eventListeners[evt]) {
      this.eventListeners[evt] = [];
    }

    this.eventListeners[evt].push(func);
  }

  /**
   * Add event listener function that will be called when client is connected to
   * node. Multiple listeners will be called sequentially in the order of added.
   */
  onConnect(func) {
    this.eventListeners.connect.push(func);
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
  onMessage(func) {
    this.eventListeners.message.push(func);
  }

  _wssend(data) {
    if (!this.ws) {
      throw new common.errors.ClientNotReadyError();
    }

    this.ws.send(data);
  }

  async _send(dest, payload, encrypt = true, maxHoldingSeconds = 0) {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        return null;
      }

      if (dest.length === 1) {
        return await this._send(dest[0], payload, encrypt, maxHoldingSeconds);
      }
    }

    let pldMsg = this._messageFromPayload(payload, encrypt, dest);

    if (Array.isArray(pldMsg)) {
      pldMsg = pldMsg.map(pld => pld.serializeBinary());
    } else {
      pldMsg = pldMsg.serializeBinary();
    }

    let msgs = [];

    if (Array.isArray(pldMsg)) {
      let destList = [],
          pldList = [],
          totalSize = 0,
          size = 0;

      for (let i = 0; i < pldMsg.length; i++) {
        size = pldMsg[i].length + dest[i].length + common.key.signatureLength;

        if (size > message.maxClientMessageSize) {
          throw new common.errors.DataSizeTooLargeError('encoded message is greater than ' + message.maxClientMessageSize + ' bytes');
        }

        if (totalSize + size > message.maxClientMessageSize) {
          msgs.push((await message.newOutboundMessage(this, destList, pldList, maxHoldingSeconds)));
          destList = [];
          pldList = [];
          totalSize = 0;
        }

        destList.push(dest[i]);
        pldList.push(pldMsg[i]);
        totalSize += size;
      }

      msgs.push((await message.newOutboundMessage(this, destList, pldList, maxHoldingSeconds)));
    } else {
      if (pldMsg.length + dest.length + common.key.signatureLength > message.maxClientMessageSize) {
        throw new common.errors.DataSizeTooLargeError('encoded message is greater than ' + message.maxClientMessageSize + ' bytes');
      }

      msgs.push((await message.newOutboundMessage(this, dest, pldMsg, maxHoldingSeconds)));
    }

    if (msgs.length > 1) {
      console.log(`Client message size is greater than ${message.maxClientMessageSize} bytes, split into ${msgs.length} batches.`);
    }

    msgs.forEach(msg => {
      this._wssend(msg.serializeBinary());
    });
    return payload.getPid();
  }
  /**
   * Send byte or string data to a single or an array of destination.
   * @param options - Send options that will override client options.
   * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
   */


  async send(dest, data, options = {}) {
    options = common.util.assignDefined({}, this.options, options);
    let payload;

    if (typeof data === 'string') {
      payload = message.newTextPayload(data, options.replyToPid, options.pid);
    } else {
      payload = message.newBinaryPayload(data, options.replyToPid, options.pid);
    }

    let pid = await this._send(dest, payload, options.encrypt, options.msgHoldingSeconds);

    if (pid === null || options.noReply) {
      return null;
    }

    return await new Promise((resolve, reject) => {
      this.responseManager.add(new ResponseProcessor(pid, options.responseTimeout, resolve, reject));
    });
  }

  async _sendACK(dest, pid, encrypt) {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        return;
      }

      if (dest.length === 1) {
        return await this._sendACK(dest[0], pid, encrypt);
      }

      if (dest.length > 1 && encrypt) {
        console.warn('Encrypted ACK with multicast is not supported, fallback to unicast.');

        for (let i = 0; i < dest.length; i++) {
          await this._sendACK(dest[i], pid, encrypt);
        }

        return;
      }
    }

    let payload = message.newAckPayload(pid);

    let pldMsg = this._messageFromPayload(payload, encrypt, dest);

    if (pldMsg instanceof Array) {
      throw new TypeError('ack payload should not be an array');
    }

    let msg = await message.newOutboundMessage(this, dest, pldMsg.serializeBinary(), 0);

    this._wssend(msg.serializeBinary());
  }

  /**
   * Get subscribers of a topic.
   * @param options - Get subscribers options.
   * @param {number} [options.offset=0] - Offset of subscribers to get.
   * @param {number} [options.limit=1000] - Max number of subscribers to get. This does not affect subscribers in txpool.
   * @param {boolean} [options.meta=false] - Whether to include metadata of subscribers in the topic.
   * @param {boolean} [options.txPool=false] - Whether to include subscribers whose subscribe transaction is still in txpool. Enabling this will get subscribers sooner after they send subscribe transactions, but might affect the correctness of subscribers because transactions in txpool is not guaranteed to be packed into a block.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address.
   * @returns A promise that will be resolved with subscribers info. Note that `options.meta=false/true` will cause results to be an array (of subscriber address) or map (subscriber address -> metadata), respectively.
   */
  static getSubscribers(topic, options = {}) {
    return common.rpc.getSubscribers(options.rpcServerAddr || consts.defaultOptions.seedRpcServerAddr, {
      topic,
      offset: options.offset,
      limit: options.limit,
      meta: options.meta,
      txPool: options.txPool
    });
  }
  /**
   * Same as Client.getSubscribers, but using this client's seedRpcServerAddr as
   * rpcServerAddr.
   */


  getSubscribers(topic, options = {}) {
    return Client.getSubscribers(topic, Object.assign({}, options, {
      rpcServerAddr: this.options.seedRpcServerAddr
    }));
  }
  /**
   * Get subscribers count of a topic.
   */


  static getSubscribersCount(topic, options = {}) {
    return common.rpc.getSubscribersCount(options.rpcServerAddr || consts.defaultOptions.seedRpcServerAddr, {
      topic
    });
  }
  /**
   * Same as Client.getSubscribersCount, but using this client's
   * seedRpcServerAddr as rpcServerAddr.
   */


  getSubscribersCount(topic) {
    return Client.getSubscribersCount(topic, {
      rpcServerAddr: this.options.seedRpcServerAddr
    });
  }
  /**
   * Get the subscription details of a subscriber in a topic.
   */


  static getSubscription(topic, subscriber, options = {}) {
    return common.rpc.getSubscription(options.rpcServerAddr || consts.defaultOptions.seedRpcServerAddr, {
      topic,
      subscriber
    });
  }
  /**
   * Same as Client.getSubscription, but using this client's seedRpcServerAddr
   * as rpcServerAddr.
   */


  getSubscription(topic, subscriber) {
    return Client.getSubscription(topic, subscriber, {
      rpcServerAddr: this.options.seedRpcServerAddr
    });
  }
  /**
   * Send byte or string data to all subscribers of a topic.
   * @returns A promise that will be resolved with null when send success.
   */


  async publish(topic, data, options = {}) {
    let offset = 0;
    let limit = 1000;
    let res = await this.getSubscribers(topic, {
      offset,
      limit,
      txPool: options.txPool || false
    });

    if (!(res.subscribers instanceof Array)) {
      throw new common.errors.InvalidResponseError('subscribers should be an array');
    }

    if (res.subscribersInTxPool && !(res.subscribersInTxPool instanceof Array)) {
      throw new common.errors.InvalidResponseError('subscribersInTxPool should be an array');
    }

    let subscribers = res.subscribers;
    let subscribersInTxPool = res.subscribersInTxPool;

    while (res.subscribers && res.subscribers.length >= limit) {
      offset += limit;
      res = await this.getSubscribers(topic, {
        offset,
        limit
      });

      if (!(res.subscribers instanceof Array)) {
        throw new common.errors.InvalidResponseError('subscribers should be an array');
      }

      subscribers = subscribers.concat(res.subscribers);
    }

    if (options.txPool && subscribersInTxPool) {
      subscribers = subscribers.concat(subscribersInTxPool);
    }

    options = common.util.assignDefined({}, options, {
      noReply: true
    });
    await this.send(subscribers, data, options);
    return null;
  }
  /**
   * Close the client.
   */


  close() {
    this.responseManager.stop();
    this.shouldReconnect = false;

    try {
      this.ws && this.ws.close();
    } catch (e) {}

    this.isClosed = true;
  }

  _messageFromPayload(payload, encrypt, dest) {
    if (encrypt) {
      return this._encryptPayload(payload.serializeBinary(), dest);
    }

    return message.newMessage(payload.serializeBinary(), false);
  }

  async _handleMsg(rawMsg) {
    let msg = common.pb.messages.ClientMessage.deserializeBinary(rawMsg);

    switch (msg.getMessageType()) {
      case common.pb.messages.ClientMessageType.INBOUND_MESSAGE:
        return await this._handleInboundMsg(msg.getMessage());

      default:
        return false;
    }
  }

  async _handleInboundMsg(rawMsg) {
    let msg = common.pb.messages.InboundMessage.deserializeBinary(rawMsg);
    let prevSignature = msg.getPrevSignature();

    if (prevSignature.length > 0) {
      prevSignature = common.util.bytesToHex(prevSignature);
      let receipt = await message.newReceipt(this, prevSignature);

      this._wssend(receipt.serializeBinary());
    }

    let pldMsg = common.pb.payloads.Message.deserializeBinary(msg.getPayload());
    let pldBytes;

    if (pldMsg.getEncrypted()) {
      pldBytes = this._decryptPayload(pldMsg, msg.getSrc());
    } else {
      pldBytes = pldMsg.getPayload();
    }

    let payload = common.pb.payloads.Payload.deserializeBinary(pldBytes);
    let data = payload.getData(); // process data

    switch (payload.getType()) {
      case common.pb.payloads.PayloadType.TEXT:
        let textData = common.pb.payloads.TextData.deserializeBinary(data);
        data = textData.getText();
        break;

      case common.pb.payloads.PayloadType.ACK:
        this.responseManager.respond(payload.getReplyToPid(), null, payload.getType());
        return true;
    } // handle response if applicable


    if (payload.getReplyToPid().length) {
      this.responseManager.respond(payload.getReplyToPid(), data, payload.getType());
      return true;
    } // handle msg


    switch (payload.getType()) {
      case common.pb.payloads.PayloadType.TEXT:
      case common.pb.payloads.PayloadType.BINARY:
      case common.pb.payloads.PayloadType.SESSION:
        let responses = [];

        if (this.eventListeners.message.length > 0) {
          responses = await Promise.all(this.eventListeners.message.map(f => {
            try {
              return Promise.resolve(f({
                src: msg.getSrc(),
                payload: data,
                payloadType: payload.getType(),
                isEncrypted: pldMsg.getEncrypted(),
                pid: payload.getPid()
              }));
            } catch (e) {
              console.log(e);
              return Promise.resolve(null);
            }
          }));
        }

        let responded = false;

        for (let response of responses) {
          if (response === false) {
            return true;
          } else if (response !== undefined && response !== null) {
            this.send(msg.getSrc(), response, {
              encrypt: pldMsg.getEncrypted(),
              msgHoldingSeconds: 0,
              replyToPid: payload.getPid(),
              noReply: true
            });
            responded = true;
            break;
          }
        }

        if (!responded) {
          await this._sendACK(msg.getSrc(), payload.getPid(), pldMsg.getEncrypted());
        }

        return true;

      default:
        return false;
    }
  }

  _shouldUseTls() {
    if (this.options.tls !== undefined) {
      return !!this.options.tls;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    if (window.location && window.location.protocol === 'https:') {
      return true;
    }

    return false;
  }

  _newWsAddr(nodeInfo) {
    if (!nodeInfo.addr) {
      console.log('No address in node info', nodeInfo);

      if (this.shouldReconnect) {
        this._reconnect();
      }

      return;
    }

    let ws;

    try {
      ws = new _isomorphicWs.default((this._shouldUseTls() ? 'wss://' : 'ws://') + nodeInfo.addr);
      ws.binaryType = 'arraybuffer';
    } catch (e) {
      console.log('Create WebSocket failed,', e);

      if (this.shouldReconnect) {
        this._reconnect();
      }

      return;
    }

    if (this.ws) {
      this.ws.onclose = () => {};

      try {
        this.ws && this.ws.close();
      } catch (e) {}
    }

    this.ws = ws;
    this.node = nodeInfo;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        Action: 'setClient',
        Addr: this.addr
      }));
      this.shouldReconnect = true;
      this.reconnectInterval = this.options.reconnectIntervalMin;
    };

    ws.onmessage = async event => {
      if (event.data instanceof ArrayBuffer) {
        try {
          let handled = await this._handleMsg(event.data);

          if (!handled) {
            console.warn('Unhandled msg.');
          }
        } catch (e) {
          console.log(e);
        }

        return;
      }

      let msg = JSON.parse(event.data);

      if (msg.Error !== undefined && msg.Error !== common.errors.rpcRespErrCodes.success) {
        console.log(msg);

        if (msg.Error === common.errors.rpcRespErrCodes.wrongNode) {
          this._newWsAddr(msg.Result);
        } else if (msg.Action === 'setClient') {
          try {
            this.ws && this.ws.close();
          } catch (e) {}
        }

        return;
      }

      switch (msg.Action) {
        case 'setClient':
          this.sigChainBlockHash = msg.Result.sigChainBlockHash;
          this.isReady = true;

          if (this.eventListeners.connect.length > 0) {
            this.eventListeners.connect.forEach(f => f(msg.Result));
          }

          break;

        case 'updateSigChainBlockHash':
          this.sigChainBlockHash = msg.Result;
          break;

        default:
          console.warn('Unknown msg type:', msg.Action);
      }
    };

    ws.onclose = () => {
      if (this.shouldReconnect) {
        console.warn('WebSocket unexpectedly closed.');

        this._reconnect();
      }
    };

    ws.onerror = err => {
      console.log(err.message);
    };
  }

  _encryptPayload(payload, dest) {
    if (Array.isArray(dest)) {
      let nonce = common.util.randomBytes(_tweetnacl.default.secretbox.nonceLength);
      let key = common.util.randomBytes(_tweetnacl.default.secretbox.keyLength);

      let encryptedPayload = _tweetnacl.default.secretbox(payload, nonce, key);

      let msgs = [];

      for (let i = 0; i < dest.length; i++) {
        let pk = common.util.hexToBytes(message.addrToPubkey(dest[i]));
        let encryptedKey = this.key.encrypt(key, pk);
        let mergedNonce = common.util.mergeTypedArrays(encryptedKey.nonce, nonce);
        let msg = message.newMessage(encryptedPayload, true, mergedNonce, encryptedKey.message);
        msgs.push(msg);
      }

      return msgs;
    } else {
      let pk = common.util.hexToBytes(message.addrToPubkey(dest));
      let encrypted = this.key.encrypt(payload, pk);
      return message.newMessage(encrypted.message, true, encrypted.nonce);
    }
  }

  _decryptPayload(msg, srcAddr) {
    let rawPayload = msg.getPayload();
    let srcPubkey = common.util.hexToBytes(message.addrToPubkey(srcAddr));
    let nonce = msg.getNonce();
    let encryptedKey = msg.getEncryptedKey();
    let decryptedPayload;

    if (encryptedKey && encryptedKey.length > 0) {
      if (nonce.length != _tweetnacl.default.box.nonceLength + _tweetnacl.default.secretbox.nonceLength) {
        throw new common.errors.DecryptionError('invalid nonce length');
      }

      let sharedKey = this.key.decrypt(encryptedKey, nonce.slice(0, _tweetnacl.default.box.nonceLength), srcPubkey);

      if (sharedKey === null) {
        throw new common.errors.DecryptionError('decrypt shared key failed');
      }

      decryptedPayload = _tweetnacl.default.secretbox.open(rawPayload, nonce.slice(_tweetnacl.default.box.nonceLength), sharedKey);

      if (decryptedPayload === null) {
        throw new common.errors.DecryptionError('decrypt message failed');
      }
    } else {
      if (nonce.length != _tweetnacl.default.box.nonceLength) {
        throw new common.errors.DecryptionError('invalid nonce length');
      }

      decryptedPayload = this.key.decrypt(rawPayload, nonce, srcPubkey);

      if (decryptedPayload === null) {
        throw new common.errors.DecryptionError('decrypt message failed');
      }
    }

    return decryptedPayload;
  }

}

exports.default = Client;

class ResponseProcessor {
  constructor(pid, timeout, responseHandler, timeoutHandler) {
    _defineProperty(this, "pid", void 0);

    _defineProperty(this, "deadline", void 0);

    _defineProperty(this, "responseHandler", void 0);

    _defineProperty(this, "timeoutHandler", void 0);

    if (pid instanceof Uint8Array) {
      pid = common.util.bytesToHex(pid);
    }

    this.pid = pid;

    if (timeout) {
      this.deadline = Date.now() + timeout;
    }

    this.responseHandler = responseHandler;
    this.timeoutHandler = timeoutHandler;
  }

  checkTimeout(now) {
    if (!this.deadline) {
      return false;
    }

    if (!now) {
      now = Date.now();
    }

    return now > this.deadline;
  }

  handleResponse(data) {
    if (this.responseHandler) {
      this.responseHandler(data);
    }
  }

  handleTimeout() {
    if (this.timeoutHandler) {
      this.timeoutHandler(new Error('Message timeout'));
    }
  }

}

class ResponseManager {
  constructor() {
    _defineProperty(this, "responseProcessors", void 0);

    _defineProperty(this, "timer", void 0);

    this.responseProcessors = new Map();
    this.timer = null;
    this.checkTimeout();
  }

  add(proceccor) {
    this.responseProcessors.set(proceccor.pid, proceccor);
  }

  clear() {
    for (let processor of this.responseProcessors.values()) {
      processor.handleTimeout();
    }

    this.responseProcessors = new Map();
  }

  stop() {
    clearTimeout(this.timer);
    this.clear();
  }

  respond(pid, data, payloadType) {
    if (pid instanceof Uint8Array) {
      pid = common.util.bytesToHex(pid);
    }

    let responseProcessor = this.responseProcessors.get(pid);

    if (responseProcessor) {
      responseProcessor.handleResponse(data);
      this.responseProcessors.delete(pid);
    }
  }

  checkTimeout() {
    let timeoutProcessors = [];
    let now = Date.now();

    for (let processor of this.responseProcessors.values()) {
      if (processor.checkTimeout(now)) {
        timeoutProcessors.push(processor);
      }
    }

    timeoutProcessors.forEach(p => {
      p.handleTimeout();
      this.responseProcessors.delete(p.pid);
    });
    this.timer = setTimeout(this.checkTimeout.bind(this), consts.checkTimeoutInterval);
  }

}