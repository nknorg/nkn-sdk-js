'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isomorphicWs = _interopRequireDefault(require("isomorphic-ws"));

var _wallet = _interopRequireDefault(require("../wallet"));

var common = _interopRequireWildcard(require("../common"));

var consts = _interopRequireWildcard(require("./consts"));

var message = _interopRequireWildcard(require("./message"));

var crypto = _interopRequireWildcard(require("../common/crypto"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const Action = {
  setClient: 'setClient',
  updateSigChainBlockHash: 'updateSigChainBlockHash',
  authChallenge: 'authChallenge'
};
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
 * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address used to join the network.
 * @param {boolean} [options.tls=undefined] - Force to use wss instead of ws protocol. If not defined, wss will only be used in https location.
 * @param {boolean|function} [options.worker=false] - Whether to use web workers (if available) to compute signatures. Can also be a function that returns web worker. Typically you only need to set it to a function if you import nkn-sdk as a module and are NOT using browserify or webpack worker-loader to bundle js file. The worker file is located at `lib/worker/webpack.worker.js`.
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
   * Whether client fails to connect to node.
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

    _defineProperty(this, "isFailed", void 0);

    _defineProperty(this, "isClosed", void 0);

    _defineProperty(this, "wallet", void 0);

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let key = new common.Key(options.seed, {
      worker: options.worker
    });
    let identifier = options.identifier || '';
    let pubkey = key.publicKey;
    let addr = (identifier ? identifier + '.' : '') + pubkey;
    let wallet = new _wallet.default(Object.assign({}, options, {
      seed: key.seed,
      worker: false,
      version: 1
    }));
    delete options.seed;
    this.options = options;
    this.key = key;
    this.identifier = identifier;
    this.addr = addr;
    this.eventListeners = {
      connect: [],
      connectFailed: [],
      wsError: [],
      message: []
    };
    this.sigChainBlockHash = null;
    this.shouldReconnect = false;
    this.reconnectInterval = options.reconnectIntervalMin;
    this.responseManager = new ResponseManager();
    this.ws = null;
    this.node = null;
    this.isReady = false;
    this.isFailed = false;
    this.isClosed = false;
    this.wallet = wallet;

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
        res = await getAddr(this.addr, this.options);
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
    } else if (!this.isClosed) {
      this._connectFailed();
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

  _connectFailed() {
    if (!this.isFailed) {
      this.isFailed = true;

      if (this.eventListeners.connectFailed.length > 0) {
        this.eventListeners.connectFailed.forEach(async f => {
          try {
            await f();
          } catch (e) {
            console.log('Connect failed handler error:', e);
          }
        });
      } else {
        console.log('Client connect failed');
      }
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
   * Note that listeners added after client is connected to node (i.e.
   * `client.isReady === true`) will not be called.
   */
  onConnect(func) {
    this.eventListeners.connect.push(func);
  }

  /**
   * Add event listener function that will be called when client fails to
   * connect to node. Multiple listeners will be called sequentially in the
   * order of added. Note that listeners added after client fails to connect to
   * node (i.e. `client.isFailed === true`) will not be called.
   */
  onConnectFailed(func) {
    this.eventListeners.connectFailed.push(func);
  }

  /**
   * Add event listener function that will be called when client websocket
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

  _wsSend(data) {
    if (!this.ws) {
      throw new common.errors.ClientNotReadyError();
    }

    this.ws.send(data);
  }

  async _processDest(dest) {
    if (dest.length === 0) {
      throw new common.errors.InvalidDestinationError('destination is empty');
    }

    let addr = dest.split('.');

    if (addr[addr.length - 1].length < common.key.publicKeyLength * 2) {
      let res = await this.getRegistrant(addr[addr.length - 1]);

      if (res.registrant && res.registrant.length > 0) {
        addr[addr.length - 1] = res.registrant;
      } else {
        throw new common.errors.InvalidDestinationError(dest + ' is neither a valid public key nor a registered name');
      }
    }

    return addr.join('.');
  }

  async _processDests(dest) {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        throw new common.errors.InvalidDestinationError('no destinations');
      }

      dest = await Promise.all(dest.map(async addr => {
        try {
          return await this._processDest(addr);
        } catch (e) {
          console.warn(e.message);
          return '';
        }
      }));
      dest = dest.filter(addr => addr.length > 0);

      if (dest.length === 0) {
        throw new common.errors.InvalidDestinationError('all destinations are invalid');
      }
    } else {
      dest = await this._processDest(dest);
    }

    return dest;
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

    dest = await this._processDests(dest);
    let pldMsg = await this._messageFromPayload(payload, encrypt, dest);
    pldMsg = pldMsg.map(pld => pld.serializeBinary());
    let msgs = [],
        destList = [],
        pldList = [];

    if (pldMsg.length > 1) {
      let totalSize = 0,
          size = 0;

      for (let i = 0; i < pldMsg.length; i++) {
        size = pldMsg[i].length + dest[i].length + common.crypto.signatureLength;

        if (size > message.maxClientMessageSize) {
          throw new common.errors.DataSizeTooLargeError('encoded message is greater than ' + message.maxClientMessageSize + ' bytes');
        }

        if (totalSize + size > message.maxClientMessageSize) {
          msgs.push(await message.newOutboundMessage(this, destList, pldList, maxHoldingSeconds));
          destList = [];
          pldList = [];
          totalSize = 0;
        }

        destList.push(dest[i]);
        pldList.push(pldMsg[i]);
        totalSize += size;
      }
    } else {
      let size = pldMsg[0].length;

      if (Array.isArray(dest)) {
        for (let i = 0; i < dest.length; i++) {
          size += dest[i].length + common.crypto.signatureLength;
        }
      } else {
        size += dest.length + common.crypto.signatureLength;
      }

      if (size > message.maxClientMessageSize) {
        throw new common.errors.DataSizeTooLargeError('encoded message is greater than ' + message.maxClientMessageSize + ' bytes');
      }

      destList = dest;
      pldList = pldMsg;
    }

    msgs.push(await message.newOutboundMessage(this, destList, pldList, maxHoldingSeconds));

    if (msgs.length > 1) {
      console.log(`Client message size is greater than ${message.maxClientMessageSize} bytes, split into ${msgs.length} batches.`);
    }

    msgs.forEach(msg => {
      this._wsSend(msg.serializeBinary());
    });
    return payload.getMessageId() || null;
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
      payload = message.newTextPayload(data, options.replyToId, options.messageId);
    } else {
      payload = message.newBinaryPayload(data, options.replyToId, options.messageId);
    }

    let messageId = await this._send(dest, payload, options.encrypt, options.msgHoldingSeconds);

    if (messageId === null || options.noReply) {
      return null;
    }

    return await new Promise((resolve, reject) => {
      this.responseManager.add(new ResponseProcessor(messageId, options.responseTimeout, resolve, reject));
    });
  }

  async _sendACK(dest, messageId, encrypt) {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        return;
      }

      if (dest.length === 1) {
        return await this._sendACK(dest[0], messageId, encrypt);
      }

      if (dest.length > 1 && encrypt) {
        console.warn('Encrypted ACK with multicast is not supported, fallback to unicast.');

        for (let i = 0; i < dest.length; i++) {
          await this._sendACK(dest[i], messageId, encrypt);
        }

        return;
      }
    }

    let payload = message.newAckPayload(messageId);
    let pldMsg = await this._messageFromPayload(payload, encrypt, dest);
    let msg = await message.newOutboundMessage(this, dest, pldMsg[0].serializeBinary(), 0);

    this._wsSend(msg.serializeBinary());
  }

  /**
   * Send byte or string data to all subscribers of a topic.
   * @returns A promise that will be resolved with null when send success.
   */
  async publish(topic, data, options = {}) {
    options = common.util.assignDefined({}, consts.defaultPublishOptions, options, {
      noReply: true
    });
    let offset = options.offset;
    let res = await this.getSubscribers(topic, {
      offset,
      limit: options.limit,
      txPool: options.txPool
    });

    if (!(res.subscribers instanceof Array)) {
      throw new common.errors.InvalidResponseError('subscribers should be an array');
    }

    if (res.subscribersInTxPool && !(res.subscribersInTxPool instanceof Array)) {
      throw new common.errors.InvalidResponseError('subscribersInTxPool should be an array');
    }

    let subscribers = res.subscribers;
    let subscribersInTxPool = res.subscribersInTxPool;

    while (res.subscribers && res.subscribers.length >= options.limit) {
      offset += options.limit;
      res = await this.getSubscribers(topic, {
        offset,
        limit: options.limit
      });

      if (!(res.subscribers instanceof Array)) {
        throw new common.errors.InvalidResponseError('subscribers should be an array');
      }

      subscribers = subscribers.concat(res.subscribers);
    }

    if (options.txPool && subscribersInTxPool) {
      subscribers = subscribers.concat(subscribersInTxPool);
    }

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

  async _messageFromPayload(payload, encrypt, dest) {
    if (encrypt) {
      return await this._encryptPayload(payload.serializeBinary(), dest);
    }

    return [message.newMessage(payload.serializeBinary(), false)];
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

      this._wsSend(receipt.serializeBinary());
    }

    let pldMsg = common.pb.payloads.Message.deserializeBinary(msg.getPayload());
    let pldBytes;

    if (pldMsg.getEncrypted()) {
      pldBytes = await this._decryptPayload(pldMsg, msg.getSrc());
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
        this.responseManager.respond(payload.getReplyToId(), null, payload.getType());
        return true;
    } // handle response if applicable


    if (payload.getReplyToId().length) {
      this.responseManager.respond(payload.getReplyToId(), data, payload.getType());
      return true;
    } // handle msg


    switch (payload.getType()) {
      case common.pb.payloads.PayloadType.TEXT:
      case common.pb.payloads.PayloadType.BINARY:
      case common.pb.payloads.PayloadType.SESSION:
        if (this.eventListeners.message.length > 0) {
          let responses = await Promise.all(this.eventListeners.message.map(async f => {
            try {
              return await f({
                src: msg.getSrc(),
                payload: data,
                payloadType: payload.getType(),
                isEncrypted: pldMsg.getEncrypted(),
                messageId: payload.getMessageId(),
                noReply: payload.getNoReply()
              });
            } catch (e) {
              console.log('Message handler error:', e);
              return null;
            }
          }));

          if (!payload.getNoReply()) {
            let responded = false;

            for (let response of responses) {
              if (response === false) {
                return true;
              } else if (response !== undefined && response !== null) {
                this.send(msg.getSrc(), response, {
                  encrypt: pldMsg.getEncrypted(),
                  msgHoldingSeconds: 0,
                  replyToId: payload.getMessageId()
                }).catch(e => {
                  console.log('Send response error:', e);
                });
                responded = true;
                break;
              }
            }

            if (!responded) {
              await this._sendACK(msg.getSrc(), payload.getMessageId(), pldMsg.getEncrypted());
            }
          }
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
      } else if (!this.isClosed) {
        this._connectFailed();
      }

      return;
    }

    let tls = this._shouldUseTls();

    let ws;

    try {
      ws = new _isomorphicWs.default((tls ? 'wss' : 'ws') + '://' + nodeInfo.addr);
      ws.binaryType = 'arraybuffer';
    } catch (e) {
      console.log('Create WebSocket failed,', e);

      if (this.shouldReconnect) {
        this._reconnect();
      } else if (!this.isClosed) {
        this._connectFailed();
      }

      return;
    }

    if (this.ws) {
      this.ws.onclose = () => {};

      try {
        this.ws.close();
      } catch (e) {}
    }

    if (this.isClosed) {
      try {
        ws.close();
      } catch (e) {}

      return;
    }

    this.ws = ws;
    this.node = nodeInfo;

    if (nodeInfo.rpcAddr) {
      this.wallet.options.rpcServerAddr = (tls ? 'https' : 'http') + '://' + nodeInfo.rpcAddr;
    } else {
      this.wallet.options.rpcServerAddr = '';
    }

    let challengeDone;
    let challengeHandler = new Promise(async (resolve, reject) => {
      challengeDone = resolve;
      setTimeout(() => {
        reject(new Error('Challenge timeout'));
      }, consts.waitForChallengeTimeout);
    });

    ws.onopen = async () => {
      let data = {
        Action: Action.setClient,
        Addr: this.addr
      };

      try {
        let req = await challengeHandler;

        if (!!req) {
          data.ClientSalt = common.util.bytesToHex(req.ClientSalt);
          data.Signature = common.util.bytesToHex(req.Signature);
        }
      } catch (e) {
        console.log(e);
      }

      ws.send(JSON.stringify(data));
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
        } else if (msg.Action === Action.setClient) {
          try {
            this.ws && this.ws.close();
          } catch (e) {}
        }

        return;
      }

      switch (msg.Action) {
        case Action.setClient:
          this.sigChainBlockHash = msg.Result.sigChainBlockHash;

          if (!this.isReady) {
            this.isReady = true;

            if (this.eventListeners.connect.length > 0) {
              this.eventListeners.connect.forEach(async f => {
                try {
                  await f(msg.Result);
                } catch (e) {
                  console.log('Connect handler error:', e);
                }
              });
            }
          }

          break;

        case Action.updateSigChainBlockHash:
          this.sigChainBlockHash = msg.Result;
          break;

        case Action.authChallenge:
          let challenge = msg.Challenge;
          let byteChallenge = common.util.hexToBytes(challenge);
          let clientSalt = common.util.randomBytes(32);
          byteChallenge = common.util.mergeTypedArrays(byteChallenge, clientSalt);
          let hash = common.hash.sha256Hex(common.util.bytesToHex(byteChallenge));
          let signature = await crypto.sign(this.key.privateKey, hash);
          challengeDone({
            ClientSalt: clientSalt,
            Signature: common.util.hexToBytes(signature)
          });
          break;

        default:
          console.warn('Unknown msg type:', msg.Action);
      }
    };

    ws.onclose = () => {
      if (this.shouldReconnect) {
        console.warn('WebSocket unexpectedly closed.');

        this._reconnect();
      } else if (!this.isClosed) {
        this._connectFailed();
      }
    };

    ws.onerror = event => {
      if (this.eventListeners.wsError.length > 0) {
        this.eventListeners.wsError.forEach(async f => {
          try {
            await f(event);
          } catch (e) {
            console.log('WsError handler error:', e);
          }
        });
      } else {
        console.log(event.message);
      }
    };
  }

  async _encryptPayload(payload, dest) {
    if (Array.isArray(dest)) {
      let nonce = common.util.randomBytes(common.crypto.nonceLength);
      let key = common.util.randomBytes(common.crypto.keyLength);
      let encryptedPayload = await common.crypto.encryptSymmetric(payload, nonce, key);
      let msgs = [];

      for (let i = 0; i < dest.length; i++) {
        let pk = message.addrToPubkey(dest[i]);
        let encryptedKey = await this.key.encrypt(key, pk);
        let mergedNonce = common.util.mergeTypedArrays(encryptedKey.nonce, nonce);
        let msg = message.newMessage(encryptedPayload, true, mergedNonce, encryptedKey.message);
        msgs.push(msg);
      }

      return msgs;
    } else {
      let pk = message.addrToPubkey(dest);
      let encrypted = await this.key.encrypt(payload, pk);
      return [message.newMessage(encrypted.message, true, encrypted.nonce)];
    }
  }

  async _decryptPayload(msg, srcAddr) {
    let rawPayload = msg.getPayload();
    let srcPubkey = message.addrToPubkey(srcAddr);
    let nonce = msg.getNonce();
    let encryptedKey = msg.getEncryptedKey();
    let decryptedPayload;

    if (encryptedKey && encryptedKey.length > 0) {
      if (nonce.length != common.crypto.nonceLength * 2) {
        throw new common.errors.DecryptionError('invalid nonce length');
      }

      let sharedKey = await this.key.decrypt(encryptedKey, nonce.slice(0, common.crypto.nonceLength), srcPubkey);

      if (sharedKey === null) {
        throw new common.errors.DecryptionError('decrypt shared key failed');
      }

      decryptedPayload = await common.crypto.decryptSymmetric(rawPayload, nonce.slice(common.crypto.nonceLength), sharedKey);

      if (decryptedPayload === null) {
        throw new common.errors.DecryptionError('decrypt message failed');
      }
    } else {
      if (nonce.length != common.crypto.nonceLength) {
        throw new common.errors.DecryptionError('invalid nonce length');
      }

      decryptedPayload = await this.key.decrypt(rawPayload, nonce, srcPubkey);

      if (decryptedPayload === null) {
        throw new common.errors.DecryptionError('decrypt message failed');
      }
    }

    return decryptedPayload;
  }
  /**
   * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  async getLatestBlock() {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await _wallet.default.getLatestBlock(this.options);
      } catch (e) {}
    }

    return await _wallet.default.getLatestBlock(this.options);
  }
  /**
   * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  async getRegistrant(name) {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await _wallet.default.getRegistrant(name, this.wallet.options);
      } catch (e) {}
    }

    return await _wallet.default.getRegistrant(name, this.options);
  }
  /**
   * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  async getSubscribers(topic, options = {}) {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await _wallet.default.getSubscribers(topic, Object.assign({}, this.wallet.options, options));
      } catch (e) {}
    }

    return await _wallet.default.getSubscribers(topic, Object.assign({}, this.options, options));
  }
  /**
   * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
   * this client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  async getSubscribersCount(topic) {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await _wallet.default.getSubscribersCount(topic, this.wallet.options);
      } catch (e) {}
    }

    return await _wallet.default.getSubscribersCount(topic, this.options);
  }
  /**
   * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  async getSubscription(topic, subscriber) {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await _wallet.default.getSubscription(topic, subscriber, this.wallet.options);
      } catch (e) {}
    }

    return await _wallet.default.getSubscription(topic, subscriber, this.options);
  }
  /**
   * Same as [Wallet.getBalance](#walletgetbalance), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  async getBalance(address) {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await _wallet.default.getBalance(address || this.wallet.address, this.wallet.options);
      } catch (e) {}
    }

    return await _wallet.default.getBalance(address || this.wallet.address, this.options);
  }
  /**
   * Same as [Wallet.getNonce](#walletgetnonce), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  async getNonce(address, options = {}) {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await _wallet.default.getNonce(address || this.wallet.address, Object.assign({}, this.wallet.options, options));
      } catch (e) {}
    }

    return await _wallet.default.getNonce(address || this.wallet.address, Object.assign({}, this.options, options));
  }
  /**
   * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  async sendTransaction(txn) {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await _wallet.default.sendTransaction(txn, this.wallet.options);
      } catch (e) {}
    }

    return await _wallet.default.sendTransaction(txn, this.options);
  }
  /**
   * Same as [wallet.transferTo](#wallettransferto), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  transferTo(toAddress, amount, options = {}) {
    return common.rpc.transferTo.call(this, toAddress, amount, options);
  }
  /**
   * Same as [wallet.registerName](#walletregistername), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  registerName(name, options = {}) {
    return common.rpc.registerName.call(this, name, options);
  }
  /**
   * Same as [wallet.transferName](#wallettransfername), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  transferName(name, recipient, options = {}) {
    return common.rpc.transferName.call(this, name, recipient, options);
  }
  /**
   * Same as [wallet.deleteName](#walletdeletename), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  deleteName(name, options = {}) {
    return common.rpc.deleteName.call(this, name, options);
  }
  /**
   * Same as [wallet.subscribe](#walletsubscribe), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  subscribe(topic, duration, identifier = '', meta = '', options = {}) {
    return common.rpc.subscribe.call(this, topic, duration, identifier, meta, options);
  }
  /**
   * Same as [wallet.unsubscribe](#walletunsubscribe), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */


  unsubscribe(topic, identifier = '', options = {}) {
    return common.rpc.unsubscribe.call(this, topic, identifier, options);
  }

  createTransaction(pld, nonce, options = {}) {
    return this.wallet.createTransaction(pld, nonce, options);
  }

}

exports.default = Client;

class ResponseProcessor {
  constructor(messageId, timeout, responseHandler, timeoutHandler) {
    _defineProperty(this, "messageId", void 0);

    _defineProperty(this, "deadline", void 0);

    _defineProperty(this, "responseHandler", void 0);

    _defineProperty(this, "timeoutHandler", void 0);

    if (messageId instanceof Uint8Array) {
      messageId = common.util.bytesToHex(messageId);
    }

    this.messageId = messageId;

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
    this.responseProcessors.set(proceccor.messageId, proceccor);
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

  respond(messageId, data, payloadType) {
    if (messageId instanceof Uint8Array) {
      messageId = common.util.bytesToHex(messageId);
    }

    let responseProcessor = this.responseProcessors.get(messageId);

    if (responseProcessor) {
      responseProcessor.handleResponse(data);
      this.responseProcessors.delete(messageId);
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
      this.responseProcessors.delete(p.messageId);
    });
    this.timer = setTimeout(this.checkTimeout.bind(this), consts.checkTimeoutInterval);
  }

}