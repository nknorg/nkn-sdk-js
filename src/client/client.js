'use strict';

import nacl from 'tweetnacl';
import WebSocket from 'isomorphic-ws';

import * as common from '../common';
import * as consts from './consts';
import * as message from './message';

class ResponseProcessor {
  pid;
  deadline;
  responseHandler;
  timeoutHandler;

  constructor(pid, timeout, responseHandler, timeoutHandler) {
    if (pid instanceof Uint8Array) {
      pid = common.util.bytesToHex(pid);
    }

    this.pid = pid;
    this.deadline = Date.now() + timeout;
    this.responseHandler = responseHandler;
    this.timeoutHandler = timeoutHandler;
  }

  checkTimeout(now) {
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
  responseProcessors;
  timer;

  constructor() {
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

  respond(pid, data) {
    if (pid instanceof Uint8Array) {
      pid = common.util.bytesToHex(pid);
    }
    if (this.responseProcessors.has(pid)) {
      this.responseProcessors.get(pid).handleResponse(data);
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
    })

    this.timer = setTimeout(this.checkTimeout.bind(this), consts.checkTimeoutInterval);
  }
}

export default class Client {
  options;
  key;
  identifier;
  addr;
  eventListeners;
  sigChainBlockHash;
  shouldReconnect;
  reconnectInterval;
  responseManager;
  ws;
  node;
  isReady;
  isClosed;

  constructor(options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    let key = new common.Key(options.seed);
    let identifier = options.identifier || '';
    let pubkey = key.publicKey;
    let addr = (identifier ? identifier + '.' : '') + pubkey;

    this.options = options;
    this.key = key;
    this.identifier = identifier;
    this.addr = addr;
    this.eventListeners = {};
    this.sigChainBlockHash = null;
    this.shouldReconnect = false;
    this.reconnectInterval = options.reconnectIntervalMin;
    this.responseManager = new ResponseManager();
    this.ws = null;
    this.node = null;
    this.isReady = false;
    this.isClosed = false;

    this.connect();
  }

  getSeed() {
    return this.key.seed;
  }

  getPublicKey() {
    return this.key.publicKey;
  }

  async connect() {
    let getAddr = this.shouldUseTls() ? common.rpc.getWssAddr : common.rpc.getWsAddr;
    let res, error;
    for (let i = 0; i < 3; i++) {
      try {
        res = await getAddr(this.options.seedRpcServerAddr, { address: this.addr });
      } catch (e) {
        error = e;
        continue;
      }
      this.newWsAddr(res);
      return;
    }
    console.log('RPC call failed,', error);
    if (this.shouldReconnect) {
      this.reconnect();
    }
  };

  reconnect() {
    console.log('Reconnecting in ' + this.reconnectInterval/1000 + 's...');
    setTimeout(() => this.connect(), this.reconnectInterval);
    this.reconnectInterval *= 2;
    if (this.reconnectInterval > this.options.reconnectIntervalMax) {
      this.reconnectInterval = this.options.reconnectIntervalMax;
    }
  };

  on(e, func) {
    if (this.eventListeners[e]) {
      this.eventListeners[e].push(func);
    } else {
      this.eventListeners[e] = [func];
    }
  };

  async _send(dest, payload, encrypt = true, maxHoldingSeconds = 0) {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        return null;
      }
      if (dest.length === 1) {
        return await this._send(dest[0], payload, encrypt, maxHoldingSeconds);
      }
    }

    let pldMsg = this.messageFromPayload(payload, encrypt, dest);
    if (Array.isArray(pldMsg)) {
      pldMsg = pldMsg.map(pld => pld.serializeBinary());
    } else {
      pldMsg = pldMsg.serializeBinary();
    }

    let msgs = [];
    if (Array.isArray(pldMsg)) {
      let destList = [], pldList = [], totalSize = 0, size = 0;
      for (var i = 0; i < pldMsg.length; i++) {
        size = pldMsg[i].length + dest[i].length + common.key.signatureLength;
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
      msgs.push(await message.newOutboundMessage(this, destList, pldList, maxHoldingSeconds));
    } else {
      if (pldMsg.length + dest.length + common.key.signatureLength > message.maxClientMessageSize) {
        throw new common.errors.DataSizeTooLargeError('encoded message is greater than ' + message.maxClientMessageSize + ' bytes');
      }
      msgs.push(await message.newOutboundMessage(this, dest, pldMsg, maxHoldingSeconds));
    }

    if (msgs.length > 1) {
      console.log(`Client message size is greater than ${message.maxClientMessageSize} bytes, split into ${msgs.length} batches.`);
    }

    msgs.forEach((msg) => {
      this.ws.send(msg.serializeBinary());
    });

    return payload.getPid();
  }

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
  };

  async sendACK(dest, pid, encrypt) {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        return;
      }
      if (dest.length === 1) {
        return await this.sendACK(dest[0], pid, encrypt);
      }
      if (dest.length > 1 && encrypt) {
        console.warn('Encrypted ACK with multicast is not supported, fallback to unicast.')
        for (var i = 0; i < dest.length; i++) {
          await this.sendACK(dest[i], pid, encrypt);
        }
        return;
      }
    }

    let payload = message.newAckPayload(pid);
    let pldMsg = this.messageFromPayload(payload, encrypt, dest);
    let msg = await message.newOutboundMessage(this, dest, pldMsg.serializeBinary(), 0);
    this.ws.send(msg.serializeBinary());
  };

  getSubscribers(topic, options = {}) {
    return common.rpc.getSubscribers(
      this.options.seedRpcServerAddr,
      { topic, offset: options.offset, limit: options.limit, meta: options.meta, txPool: options.txPool },
    );
  }

  getSubscribersCount(topic) {
    return common.rpc.getSubscribersCount(this.options.seedRpcServerAddr, { topic });
  }

  getSubscription(topic, subscriber) {
    return common.rpc.getSubscription(this.options.seedRpcServerAddr, { topic, subscriber });
  }

  async publish(topic, data, options = {}) {
    let offset = 0;
    let limit = 1000;
    let res = await this.getSubscribers(topic, { offset, limit, txPool: options.txPool || false });
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

  close() {
    this.responseManager.stop();
    this.shouldReconnect = false;
    try {
      this.ws.close();
    } catch (e) {
    }
    this.isClosed = true;
  };

  messageFromPayload(payload, encrypt, dest) {
    if (encrypt) {
      return this.encryptPayload(payload.serializeBinary(), dest);
    }
    return message.newMessage(payload.serializeBinary(), false);
  }

  async _handleMsg(rawMsg) {
    let msg = common.pb.messages.ClientMessage.deserializeBinary(rawMsg);
    switch (msg.getMessageType()) {
      case common.pb.messages.ClientMessageType.INBOUND_MESSAGE:
        return await this._handleInboundMsg(msg.getMessage());
      default:
        return false
    }
  }

  async _handleInboundMsg(rawMsg) {
    let msg = common.pb.messages.InboundMessage.deserializeBinary(rawMsg);

    let prevSignature = msg.getPrevSignature();
    if (prevSignature.length > 0) {
      prevSignature = common.util.bytesToHex(prevSignature);
      let receipt = await message.newReceipt(this, prevSignature);
      this.ws.send(receipt.serializeBinary());
    }

    let pldMsg = common.pb.payloads.Message.deserializeBinary(msg.getPayload());
    let pldBytes;
    if (pldMsg.getEncrypted()) {
      pldBytes = this.decryptPayload(pldMsg, msg.getSrc());
    } else {
      pldBytes = pldMsg.getPayload();
    }
    let payload = common.pb.payloads.Payload.deserializeBinary(pldBytes);
    let data = payload.getData();

    // process data
    switch (payload.getType()) {
      case common.pb.payloads.PayloadType.TEXT:
        let textData = common.pb.payloads.TextData.deserializeBinary(data);
        data = textData.getText();
        break;
      case common.pb.payloads.PayloadType.ACK:
        data = undefined;
        break;
    }

    // handle response if applicable
    if (payload.getReplyToPid().length) {
      this.responseManager.respond(payload.getReplyToPid(), data, payload.getType());
      return true;
    }

    // handle msg
    switch (payload.getType()) {
      case common.pb.payloads.PayloadType.TEXT:
      case common.pb.payloads.PayloadType.BINARY:
      case common.pb.payloads.PayloadType.SESSION:
        let responses = [];
        if (this.eventListeners.message) {
          responses = await Promise.all(this.eventListeners.message.map(f => {
            try {
              return Promise.resolve(f({
                src: msg.getSrc(),
                payload: data,
                payloadType: payload.getType(),
                isEncrypted: pldMsg.getEncrypted(),
                pid: payload.getPid(),
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
              noReply: true,
            });
            responded = true;
            break;
          }
        }
        if (!responded) {
          await this.sendACK(msg.getSrc(), payload.getPid(), pldMsg.getEncrypted());
        }
        return true;
      default:
        return false;
    }
  }

  shouldUseTls() {
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

  newWsAddr(nodeInfo) {
    if (!nodeInfo.addr) {
      console.log('No address in node info', nodeInfo);
      if (this.shouldReconnect) {
        this.reconnect();
      }
      return;
    }

    var ws;
    try {
      ws = new WebSocket((this.shouldUseTls() ? 'wss://' : 'ws://') + nodeInfo.addr);
      ws.binaryType = 'arraybuffer';
    } catch (e) {
      console.log('Create WebSocket failed,', e);
      if (this.shouldReconnect) {
        this.reconnect();
      }
      return;
    }

    if (this.ws) {
      this.ws.onclose = () => {};
      try {
        this.ws.close();
      } catch (e) {
      }
    }

    this.ws = ws;
    this.node = nodeInfo;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        Action: 'setClient',
        Addr: this.addr,
      }));
      this.shouldReconnect = true;
      this.reconnectInterval = this.options.reconnectIntervalMin;
    };

    ws.onmessage = async (event) => {
      if (event.data instanceof ArrayBuffer) {
        try {
          let handled = await this._handleMsg(event.data);
          if(!handled) {
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
          this.newWsAddr(msg.Result);
        } else if (msg.Action === 'setClient') {
          try {
            this.ws.close();
          } catch (e) {
          }
        }
        return;
      }
      switch (msg.Action) {
        case 'setClient':
          this.sigChainBlockHash = msg.Result.sigChainBlockHash;
          this.isReady = true;
          if (this.eventListeners.connect) {
            this.eventListeners.connect.forEach(f => f(msg.Result));
          }
          break;
        case 'updateSigChainBlockHash':
          this.sigChainBlockHash = msg.Result;
          break;
        case 'sendRawBlock':
          if (this.eventListeners.block) {
            this.eventListeners.block.forEach(f => f(msg.Result));
          }
          break;
        default:
          console.warn('Unknown msg type:', msg.Action);
      }
    };

    ws.onclose = () => {
      if (this.shouldReconnect) {
        console.warn('WebSocket unexpectedly closed.');
        this.reconnect();
      }
    };

    ws.onerror = (err) => {
      console.log(err.message);
    }
  }

  encryptPayload(payload, dest) {
    if (Array.isArray(dest)) {
      let nonce = common.util.randomBytes(nacl.secretbox.nonceLength);
      let key = common.util.randomBytes(nacl.secretbox.keyLength);
      let encryptedPayload = nacl.secretbox(payload, nonce, key);

      let msgs = [];
      for (var i = 0; i < dest.length; i++) {
        let pk = common.util.hexToBytes(message.addrToPubkey(dest[i]));
        let encryptedKey = this.key.encrypt(key, pk);
        let mergedNonce = common.util.mergeTypedArrays(encryptedKey.nonce, nonce);
        let msg = message.newMessage(encryptedPayload, true, mergedNonce, encryptedKey.message);
        msgs.push(msg);
      }
      return msgs;
    } else {
      let pk = common.util.hexToBytes(message.addrToPubkey(dest))
      let encrypted = this.key.encrypt(payload, pk);
      return message.newMessage(encrypted.message, true, encrypted.nonce);
    }
  }

  decryptPayload(msg, srcAddr) {
    let rawPayload = msg.getPayload();
    let srcPubkey = common.util.hexToBytes(message.addrToPubkey(srcAddr));
    let nonce = msg.getNonce();
    let encryptedKey = msg.getEncryptedKey();
    let decryptedPayload;
    if (encryptedKey && encryptedKey.length > 0) {
      if (nonce.length != nacl.box.nonceLength + nacl.secretbox.nonceLength) {
        throw new common.errors.DecryptionError('invalid nonce length');
      }
      let sharedKey = this.key.decrypt(encryptedKey, nonce.slice(0, nacl.box.nonceLength), srcPubkey);
      if (sharedKey === null) {
        throw new common.errors.DecryptionError('decrypt shared key failed');
      }
      decryptedPayload = nacl.secretbox.open(rawPayload, nonce.slice(nacl.box.nonceLength), sharedKey)
      if (decryptedPayload === null) {
        throw new common.errors.DecryptionError('decrypt message failed');
      }
    } else {
      if (nonce.length != nacl.box.nonceLength) {
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
