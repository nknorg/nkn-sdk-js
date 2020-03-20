// @flow
'use strict';

import nacl from 'tweetnacl';
import WebSocket from 'isomorphic-ws';

import * as common from '../common';
import * as consts from './consts';
import * as message from './message';

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
 * @param {boolean} [options.worker=false] - Whether to use web workers (if available) to compute signatures.
 */
export default class Client {
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
  };
  sigChainBlockHash: string | null;
  shouldReconnect: boolean;
  reconnectInterval: number;
  responseManager: ResponseManager;
  ws: WebSocket | null;
  node: { addr: string } | null;
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
  } = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    let key = new common.Key(options.seed, { worker: options.worker });
    let identifier = options.identifier || '';
    let pubkey = key.publicKey;
    let addr = (identifier ? identifier + '.' : '') + pubkey;

    this.options = options;
    this.key = key;
    this.identifier = identifier;
    this.addr = addr;
    this.eventListeners = {
      connect: [],
      message: [],
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

  async _connect() {
    let getAddr = this._shouldUseTls() ? common.rpc.getWssAddr : common.rpc.getWsAddr;
    let res, error;
    for (let i = 0; i < 3; i++) {
      try {
        res = await getAddr(this.options.rpcServerAddr, { address: this.addr });
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
  };

  _reconnect() {
    console.log('Reconnecting in ' + this.reconnectInterval/1000 + 's...');
    setTimeout(() => this._connect(), this.reconnectInterval);
    this.reconnectInterval *= 2;
    if (this.reconnectInterval > this.options.reconnectIntervalMax) {
      this.reconnectInterval = this.options.reconnectIntervalMax;
    }
  };

  /**
   * @deprecated please use onConnect, onMessage, etc.
   */
  on(evt: string, func: (...args: Array<any>) => any) {
    if (!this.eventListeners[evt]) {
      this.eventListeners[evt] = [];
    }
    this.eventListeners[evt].push(func);
  };

  /**
   * Add event listener function that will be called when client is connected to
   * node. Multiple listeners will be called sequentially in the order of added.
   * Note that listeners added after client is connected to node (i.e.
   * `client.isReady === true`) will not be called.
   */
  onConnect(func: ConnectHandler) {
    this.eventListeners.connect.push(func);
  };

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
  };

  _wsSend(data: Uint8Array) {
    if (!this.ws) {
      throw new common.errors.ClientNotReadyError();
    }
    this.ws.send(data);
  };

  async _processDest(dest: string): Promise<string> {
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
  };

  async _processDests(dest: Destination): Promise<Destination> {
    if (Array.isArray(dest)) {
      dest = await Promise.all(dest.map(async (addr) => {
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

  async _send(dest: Destination, payload: common.pb.payloads.Payload, encrypt: boolean = true, maxHoldingSeconds: number = 0): Promise<Uint8Array | null> {
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
    if (Array.isArray(pldMsg)) {
      pldMsg = pldMsg.map(pld => pld.serializeBinary());
    } else {
      pldMsg = pldMsg.serializeBinary();
    }

    let msgs = [];
    if (Array.isArray(pldMsg)) {
      let destList = [], pldList = [], totalSize = 0, size = 0;
      for (let i = 0; i < pldMsg.length; i++) {
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
      this._wsSend(msg.serializeBinary());
    });

    return payload.getPid();
  };

  /**
   * Send byte or string data to a single or an array of destination.
   * @param options - Send options that will override client options.
   * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
   */
  async send(dest: Destination, data: MessageData, options: SendOptions = {}): Promise<ReplyData> {
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

    return await new Promise((resolve: ResponseHandler, reject: TimeoutHandler) => {
      this.responseManager.add(new ResponseProcessor(pid, options.responseTimeout, resolve, reject));
    });
  };

  async _sendACK(dest: Destination, pid: Uint8Array, encrypt: boolean): Promise<void> {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        return;
      }
      if (dest.length === 1) {
        return await this._sendACK(dest[0], pid, encrypt);
      }
      if (dest.length > 1 && encrypt) {
        console.warn('Encrypted ACK with multicast is not supported, fallback to unicast.')
        for (let i = 0; i < dest.length; i++) {
          await this._sendACK(dest[i], pid, encrypt);
        }
        return;
      }
    }

    let payload = message.newAckPayload(pid);
    let pldMsg = await this._messageFromPayload(payload, encrypt, dest);
    if (pldMsg instanceof Array) {
      throw new TypeError('ack payload should not be an array');
    }
    let msg = await message.newOutboundMessage(this, dest, pldMsg.serializeBinary(), 0);
    this._wsSend(msg.serializeBinary());
  };

  /**
   * Get the registrant's public key and expiration block height of a name. If
   * name is not registered, `registrant` will be '' and `expiresAt` will be 0.
   */
  static getRegistrant(name: string, options: { rpcServerAddr?: string } = {}): Promise<{ registrant: string, expiresAt: number }> {
    return common.rpc.getRegistrant(
      options.rpcServerAddr || consts.defaultOptions.rpcServerAddr,
      { name },
    );
  }

  /**
   * Same as [Client.getRegistrant](#clientgetregistrant), but using this
   * client's rpcServerAddr as rpcServerAddr.
   */
  getRegistrant(name: string): Promise<{ registrant: string, expiresAt: number }> {
    return Client.getRegistrant(name, { rpcServerAddr: this.options.rpcServerAddr });
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
  static getSubscribers(
    topic: string,
    options: {
      offset?: number,
      limit?: number,
      meta?: boolean,
      txPool?: boolean,
      rpcServerAddr?: string,
    } = {},
  ): Promise<{
    subscribers: Array<string> | { [string]: string },
    subscribersInTxPool?: Array<string> | { [string]: string },
  }> {
    return common.rpc.getSubscribers(
      options.rpcServerAddr || consts.defaultOptions.rpcServerAddr,
      { topic, offset: options.offset, limit: options.limit, meta: options.meta, txPool: options.txPool },
    );
  }

  /**
   * Same as [Client.getSubscribers](#clientgetsubscribers), but using this
   * client's rpcServerAddr as rpcServerAddr.
   */
  getSubscribers(
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
    return Client.getSubscribers(topic, Object.assign({}, options, { rpcServerAddr: this.options.rpcServerAddr }));
  }

  /**
   * Get subscribers count of a topic.
   */
  static getSubscribersCount(topic: string, options: { rpcServerAddr: string } = {}): Promise<number> {
    return common.rpc.getSubscribersCount(
      options.rpcServerAddr || consts.defaultOptions.rpcServerAddr,
      { topic },
    );
  }

  /**
   * Same as [Client.getSubscribersCount](#clientgetsubscriberscount), but using
   * this client's rpcServerAddr as rpcServerAddr.
   */
  getSubscribersCount(topic: string): Promise<number> {
    return Client.getSubscribersCount(topic, { rpcServerAddr: this.options.rpcServerAddr });
  }

  /**
   * Get the subscription details of a subscriber in a topic.
   */
  static getSubscription(
    topic: string,
    subscriber: string,
    options: { rpcServerAddr: string } = {},
  ): Promise<{ meta: string, expiresAt: number }> {
    return common.rpc.getSubscription(
      options.rpcServerAddr || consts.defaultOptions.rpcServerAddr,
      { topic, subscriber },
    );
  }

  /**
   * Same as [Client.getSubscription](#clientgetsubscription), but using this
   * client's rpcServerAddr as rpcServerAddr.
   */
  getSubscription(
    topic: string,
    subscriber: string,
  ): Promise<{ meta: string, expiresAt: number }> {
    return Client.getSubscription(topic, subscriber, { rpcServerAddr: this.options.rpcServerAddr });
  }

  /**
   * Send byte or string data to all subscribers of a topic.
   * @returns A promise that will be resolved with null when send success.
   */
  async publish(topic: string, data: MessageData, options: PublishOptions = {}): Promise<null> {
    let offset = 0;
    let limit = 1000;
    let res = await this.getSubscribers(topic, { offset, limit, txPool: options.txPool || false });
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
      res = await this.getSubscribers(topic, { offset, limit });
      if (!(res.subscribers instanceof Array)) {
        throw new common.errors.InvalidResponseError('subscribers should be an array');
      }
      subscribers = subscribers.concat(res.subscribers);
    }
    if (options.txPool && subscribersInTxPool) {
      subscribers = subscribers.concat(subscribersInTxPool);
    }
    options = common.util.assignDefined({}, options, { noReply: true });
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
    } catch (e) {
    }
    this.isClosed = true;
  }

  async _messageFromPayload(payload: common.pb.payloads.Payload, encrypt: boolean, dest: Destination): Promise<common.pb.payloads.Message | Array<common.pb.payloads.Message>> {
    if (encrypt) {
      return await this._encryptPayload(payload.serializeBinary(), dest);
    }
    return message.newMessage(payload.serializeBinary(), false);
  }

  async _handleMsg(rawMsg: Uint8Array): Promise<boolean> {
    let msg = common.pb.messages.ClientMessage.deserializeBinary(rawMsg);
    switch (msg.getMessageType()) {
      case common.pb.messages.ClientMessageType.INBOUND_MESSAGE:
        return await this._handleInboundMsg(msg.getMessage());
      default:
        return false;
    }
  }

  async _handleInboundMsg(rawMsg: Uint8Array): Promise<boolean> {
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
    let data = payload.getData();

    // process data
    switch (payload.getType()) {
      case common.pb.payloads.PayloadType.TEXT:
        let textData = common.pb.payloads.TextData.deserializeBinary(data);
        data = textData.getText();
        break;
      case common.pb.payloads.PayloadType.ACK:
        this.responseManager.respond(payload.getReplyToPid(), null, payload.getType());
        return true;
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
        if (this.eventListeners.message.length > 0) {
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
          await this._sendACK(msg.getSrc(), payload.getPid(), pldMsg.getEncrypted());
        }
        return true;
      default:
        return false;
    }
  }

  _shouldUseTls(): boolean {
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

  _newWsAddr(nodeInfo: { addr: string }) {
    if (!nodeInfo.addr) {
      console.log('No address in node info', nodeInfo);
      if (this.shouldReconnect) {
        this._reconnect();
      }
      return;
    }

    let ws;
    try {
      ws = new WebSocket((this._shouldUseTls() ? 'wss://' : 'ws://') + nodeInfo.addr);
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
          this._newWsAddr(msg.Result);
        } else if (msg.Action === 'setClient') {
          try {
            this.ws && this.ws.close();
          } catch (e) {
          }
        }
        return;
      }
      switch (msg.Action) {
        case 'setClient':
          this.sigChainBlockHash = msg.Result.sigChainBlockHash;
          if (!this.isReady) {
            this.isReady = true;
            if (this.eventListeners.connect.length > 0) {
              this.eventListeners.connect.forEach(f => f(msg.Result));
            }
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

    ws.onerror = (err) => {
      console.log(err.message);
    }
  }

  async _encryptPayload(payload: Uint8Array, dest: Destination): Promise<common.pb.payloads.Message | Array<common.pb.payloads.Message>> {
    if (Array.isArray(dest)) {
      let nonce = common.util.randomBytes(nacl.secretbox.nonceLength);
      let key = common.util.randomBytes(nacl.secretbox.keyLength);
      let encryptedPayload = nacl.secretbox(payload, nonce, key);

      let msgs: Array<common.pb.payloads.Message> = [];
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
      return message.newMessage(encrypted.message, true, encrypted.nonce);
    }
  }

  async _decryptPayload(msg: common.pb.payloads.Message, srcAddr: string): Promise<Uint8Array> {
    let rawPayload = msg.getPayload();
    let srcPubkey = message.addrToPubkey(srcAddr);
    let nonce = msg.getNonce();
    let encryptedKey = msg.getEncryptedKey();
    let decryptedPayload;
    if (encryptedKey && encryptedKey.length > 0) {
      if (nonce.length != nacl.box.nonceLength + nacl.secretbox.nonceLength) {
        throw new common.errors.DecryptionError('invalid nonce length');
      }
      let sharedKey = await this.key.decrypt(encryptedKey, nonce.slice(0, nacl.box.nonceLength), srcPubkey);
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
      decryptedPayload = await this.key.decrypt(rawPayload, nonce, srcPubkey);
      if (decryptedPayload === null) {
        throw new common.errors.DecryptionError('decrypt message failed');
      }
    }
    return decryptedPayload;
  }
}

class ResponseProcessor {
  pid: string;
  deadline: ?number;
  responseHandler: ResponseHandler;
  timeoutHandler: TimeoutHandler;

  constructor(
    pid: Uint8Array | string,
    timeout: ?number,
    responseHandler: ResponseHandler,
    timeoutHandler: TimeoutHandler,
  ) {
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

  checkTimeout(now: number): boolean {
    if (!this.deadline) {
      return false;
    }
    if (!now) {
      now = Date.now();
    }
    return now > this.deadline;
  }

  handleResponse(data: ReplyData) {
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
  responseProcessors: Map<string, ResponseProcessor>;
  timer: TimeoutID | null;

  constructor() {
    this.responseProcessors = new Map();
    this.timer = null;
    this.checkTimeout();
  }

  add(proceccor: ResponseProcessor) {
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

  respond(pid: Uint8Array | string, data: ReplyData, payloadType?: common.pb.payloads.PayloadType) {
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
    })

    this.timer = setTimeout(this.checkTimeout.bind(this), consts.checkTimeoutInterval);
  }
}

type ResponseHandler = (data: ReplyData) => void;
type TimeoutHandler = (error: Error) => void;

/**
 * One or multiple NKN address type. Each NKN address should either be the form
 * of 'identifier.publicKey', or a name registered using wallet.
 */
export type Destination = string | Array<string>;

/**
 * Message data type.
 */
export type MessageData = Uint8Array | string;

/**
 * Reply data type, `null` means ACK instead of reply is received.
 */
export type ReplyData = MessageData | null;

/**
 * Message type.
 */
export type Message = {
  src: string,
  payload: MessageData,
  payloadType: common.pb.payloads.PayloadType,
  isEncrypted: boolean,
  pid: Uint8Array,
};

/**
 * Connect handler function type.
 */
export type ConnectHandler = ({ addr: string }) => void;

/**
 * Message handler function type.
 */
export type MessageHandler = (Message) => ReplyData | false | void | Promise<ReplyData | false | void>;

/**
 * Send message options type.
 * @property {number} [responseTimeout] - Message response timeout in ms. Zero disables timeout.
 * @property {boolean} [encrypt] - Whether to end to end encrypt message.
 * @property {number} [msgHoldingSeconds] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 * @property {boolean} [noReply=false] - Do not allocate any resources to wait for reply. Returned promise will resolve with null immediately when send success.
 */
export type SendOptions = {
  responseTimeout?: number,
  encrypt?: boolean,
  msgHoldingSeconds?: number,
  noReply?: boolean,
  pid?: Uint8Array,
  replyToPid?: Uint8Array,
}

/**
 * Publish message options type.
 * @property {boolean} [txPool=false] - Whether to send message to subscribers whose subscribe transaction is still in txpool. Enabling this will cause subscribers to receive message sooner after sending subscribe transaction, but might affect the correctness of subscribers because transactions in txpool is not guaranteed to be packed into a block.
 * @property {boolean} [encrypt] - Whether to end to end encrypt message.
 * @property {number} [msgHoldingSeconds] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 */
export type PublishOptions = {
  txPool?: boolean,
  encrypt?: boolean,
  msgHoldingSeconds?: number,
  pid?: Uint8Array,
  replyToPid?: Uint8Array,
}
