// @flow
"use strict";

import WebSocket from "isomorphic-ws";

import Wallet from "../wallet";
import * as common from "../common";
import * as consts from "./consts";
import * as message from "./message";
import Peer from "./webrtc";

import type {
  CreateTransactionOptions,
  TransactionOptions,
  TxnOrHash,
} from "../wallet";
import * as crypto from "../common/crypto";
import { waitForChallengeTimeout } from "./consts";

const Action = {
  setClient: "setClient",
  updateSigChainBlockHash: "updateSigChainBlockHash",
  authChallenge: "authChallenge",
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
 * @param {number} [options.connectTimeout=10000] - Websocket/webrtc connect timeout in ms. Zero disables timeout.
 * @param {number} [options.msgHoldingSeconds=0] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 * @param {boolean} [options.encrypt=true] - Whether to end to end encrypt message.
 * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address used to join the network.
 * @param {boolean} [options.webrtc=undefined] - Force to use/not use web rtc if defined. By default, webrtc is used only in https location when tls is undefined.
 * @param {boolean} [options.tls=undefined] - Force to use ws or wss if defined. This option is only used when webrtc is not used. Default is true in https location, otherwise false.
 * @param {string|Array<string>} [options.stunServerAddr=["stun:stun.l.google.com:19302","stun:stun.cloudflare.com:3478","stun:stunserver.stunprotocol.org:3478"]] - Stun server address for webrtc.
 * @param {boolean|function} [options.worker=false] - Whether to use web workers (if available) to compute signatures. Can also be a function that returns web worker. Typically you only need to set it to a function if you import nkn-sdk as a module and are NOT using browserify or webpack worker-loader to bundle js file. The worker file is located at `lib/worker/webpack.worker.js`.
 */
export default class Client {
  options: {
    identifier?: string,
    reconnectIntervalMin: number,
    reconnectIntervalMax: number,
    responseTimeout: number,
    connectTimeout: number,
    msgHoldingSeconds: number,
    encrypt: boolean,
    rpcServerAddr: string,
    tls?: boolean,
    webrtc?: boolean,
    stunServerAddr?: string | Array<string>,
    worker: boolean | (() => Worker | Promise<Worker>),
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
  };
  sigChainBlockHash: string | null;
  shouldReconnect: boolean;
  reconnectInterval: number;
  responseManager: ResponseManager;
  ws: WebSocket | null;
  node: { addr: string, rpcAddr: string } | null;
  /**
   * Whether client is ready (connected to a node).
   */
  isReady: boolean;
  /**
   * Whether client fails to connect to node.
   */
  isFailed: boolean;
  /**
   * Whether client is closed.
   */
  isClosed: boolean;
  wallet: Wallet;

  /**
   * Webrtc peer end
   * @type {Peer}
   */
  peer: Peer;

  constructor(
    options: {
      seed?: string,
      identifier?: string,
      reconnectIntervalMin?: number,
      reconnectIntervalMax?: number,
      responseTimeout?: number,
      connectTimeout?: number,
      msgHoldingSeconds?: number,
      encrypt?: boolean,
      rpcServerAddr?: string,
      tls?: boolean,
      worker?: boolean | (() => Worker | Promise<Worker>),
      stunServerAddr?: string | Array<string>,
      webrtc?: boolean,
    } = {},
  ) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    let key = new common.Key(options.seed, { worker: options.worker });
    let identifier = options.identifier || "";
    let pubkey = key.publicKey;
    let addr = (identifier ? identifier + "." : "") + pubkey;
    let wallet = new Wallet(
      Object.assign({}, options, { seed: key.seed, worker: false, version: 1 }),
    );

    delete options.seed;

    this.options = options;
    this.key = key;
    this.identifier = identifier;
    this.addr = addr;
    this.eventListeners = {
      connect: [],
      connectFailed: [],
      wsError: [],
      message: [],
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

    if (options.webrtc === undefined && options.tls === undefined) {
      options.webrtc = this._shouldUseTls();
    }

    if (options.webrtc) {
      this.peer = new Peer(options.stunServerAddr);
    }

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
    let getAddr = this._shouldUseTls()
      ? common.rpc.getWssAddr
      : common.rpc.getWsAddr;
    let res, error;
    for (let i = 0; i < 3; i++) {
      try {
        if (this.options.webrtc) {
          const offer = await this.peer.offer(this.addr);
          res = await common.rpc.getPeerAddr(this.addr, {
            rpcServerAddr: this.options.rpcServerAddr,
            offer,
          });
        } else {
          res = await getAddr(this.addr, {
            rpcServerAddr: this.options.rpcServerAddr,
          });
        }
      } catch (e) {
        error = e;
        if (
          e instanceof common.errors.ServerError &&
          e.message.includes(
            common.errors.rpcRespErrCodes.invalidMethod.toString(),
          )
        ) {
          break;
        }
        continue;
      }
      this._newWsAddr(res);
      return;
    }
    console.log("RPC call failed,", error);
    if (this.shouldReconnect) {
      this._reconnect();
    } else if (!this.isClosed) {
      this._connectFailed();
    }
  }

  _reconnect() {
    console.log("Reconnecting in " + this.reconnectInterval / 1000 + "s...");
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
        this.eventListeners.connectFailed.forEach(async (f) => {
          try {
            await f();
          } catch (e) {
            console.log("Connect failed handler error:", e);
          }
        });
      } else {
        console.log("Client connect failed");
      }
    }
  }

  /**
   * @deprecated please use onConnect, onMessage, etc.
   */
  on(evt: string, func: (...args: Array<any>) => any) {
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
  onConnect(func: ConnectHandler) {
    this.eventListeners.connect.push(func);
  }

  /**
   * Add event listener function that will be called when client fails to
   * connect to node. Multiple listeners will be called sequentially in the
   * order of added. Note that listeners added after client fails to connect to
   * node (i.e. `client.isFailed === true`) will not be called.
   */
  onConnectFailed(func: ConnectFailedHandler) {
    this.eventListeners.connectFailed.push(func);
  }

  /**
   * Add event listener function that will be called when client websocket
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

  _wsSend(data: Uint8Array) {
    if (!this.ws) {
      throw new common.errors.ClientNotReadyError();
    }
    this.ws.send(data);
  }

  async _processDest(dest: string): Promise<string> {
    if (dest.length === 0) {
      throw new common.errors.InvalidDestinationError("destination is empty");
    }
    let addr = dest.split(".");
    if (addr[addr.length - 1].length < common.crypto.publicKeyLength * 2) {
      let res = await this.getRegistrant(addr[addr.length - 1]);
      if (res.registrant && res.registrant.length > 0) {
        addr[addr.length - 1] = res.registrant;
      } else {
        throw new common.errors.InvalidDestinationError(
          dest + " is neither a valid public key nor a registered name",
        );
      }
    }
    return addr.join(".");
  }

  async _processDests(dest: Destination): Promise<Destination> {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        throw new common.errors.InvalidDestinationError("no destinations");
      }
      dest = await Promise.all(
        dest.map(async (addr) => {
          try {
            return await this._processDest(addr);
          } catch (e) {
            console.warn(e.message);
            return "";
          }
        }),
      );
      dest = dest.filter((addr) => addr.length > 0);
      if (dest.length === 0) {
        throw new common.errors.InvalidDestinationError(
          "all destinations are invalid",
        );
      }
    } else {
      dest = await this._processDest(dest);
    }
    return dest;
  }

  async _send(
    dest: Destination,
    payload: common.pb.payloads.Payload,
    encrypt: boolean = true,
    maxHoldingSeconds: number = 0,
  ): Promise<Uint8Array | null> {
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
    pldMsg = pldMsg.map((pld) => pld.serializeBinary());

    let msgs = [],
      destList = [],
      pldList = [];
    if (pldMsg.length > 1) {
      let totalSize = 0,
        size = 0;
      for (let i = 0; i < pldMsg.length; i++) {
        size =
          pldMsg[i].length + dest[i].length + common.crypto.signatureLength;
        if (size > message.maxClientMessageSize) {
          throw new common.errors.DataSizeTooLargeError(
            "encoded message is greater than " +
              message.maxClientMessageSize +
              " bytes",
          );
        }
        if (totalSize + size > message.maxClientMessageSize) {
          msgs.push(
            await message.newOutboundMessage(
              this,
              destList,
              pldList,
              maxHoldingSeconds,
            ),
          );
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
        throw new common.errors.DataSizeTooLargeError(
          "encoded message is greater than " +
            message.maxClientMessageSize +
            " bytes",
        );
      }
      destList = dest;
      pldList = pldMsg;
    }
    msgs.push(
      await message.newOutboundMessage(
        this,
        destList,
        pldList,
        maxHoldingSeconds,
      ),
    );

    if (msgs.length > 1) {
      console.log(
        `Client message size is greater than ${message.maxClientMessageSize} bytes, split into ${msgs.length} batches.`,
      );
    }

    msgs.forEach((msg) => {
      this._wsSend(msg.serializeBinary());
    });

    return payload.getMessageId() || null;
  }

  /**
   * Send byte or string data to a single or an array of destination.
   * @param options - Send options that will override client options.
   * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
   */
  async send(
    dest: Destination,
    data: MessageData,
    options: SendOptions = {},
  ): Promise<ReplyData> {
    options = common.util.assignDefined({}, this.options, options);
    let payload;
    if (typeof data === "string") {
      payload = message.newTextPayload(
        data,
        options.replyToId,
        options.messageId,
      );
    } else {
      payload = message.newBinaryPayload(
        data,
        options.replyToId,
        options.messageId,
      );
    }

    let messageId = await this._send(
      dest,
      payload,
      options.encrypt,
      options.msgHoldingSeconds,
    );
    if (messageId === null || options.noReply) {
      return null;
    }

    return await new Promise(
      (resolve: ResponseHandler, reject: TimeoutHandler) => {
        this.responseManager.add(
          new ResponseProcessor(
            messageId,
            options.responseTimeout,
            resolve,
            reject,
          ),
        );
      },
    );
  }

  async _sendACK(
    dest: Destination,
    messageId: Uint8Array,
    encrypt: boolean,
  ): Promise<void> {
    if (Array.isArray(dest)) {
      if (dest.length === 0) {
        return;
      }
      if (dest.length === 1) {
        return await this._sendACK(dest[0], messageId, encrypt);
      }
      if (dest.length > 1 && encrypt) {
        console.warn(
          "Encrypted ACK with multicast is not supported, fallback to unicast.",
        );
        for (let i = 0; i < dest.length; i++) {
          await this._sendACK(dest[i], messageId, encrypt);
        }
        return;
      }
    }

    let payload = message.newAckPayload(messageId);
    let pldMsg = await this._messageFromPayload(payload, encrypt, dest);
    let msg = await message.newOutboundMessage(
      this,
      dest,
      pldMsg[0].serializeBinary(),
      0,
    );
    this._wsSend(msg.serializeBinary());
  }

  /**
   * Send byte or string data to all subscribers of a topic.
   * @returns A promise that will be resolved with null when send success.
   */
  async publish(
    topic: string,
    data: MessageData,
    options: PublishOptions = {},
  ): Promise<null> {
    options = common.util.assignDefined(
      {},
      consts.defaultPublishOptions,
      options,
      { noReply: true },
    );
    let offset = options.offset;
    let res = await this.getSubscribers(topic, {
      offset,
      limit: options.limit,
      txPool: options.txPool,
    });
    if (!(res.subscribers instanceof Array)) {
      throw new common.errors.InvalidResponseError(
        "subscribers should be an array",
      );
    }
    if (
      res.subscribersInTxPool &&
      !(res.subscribersInTxPool instanceof Array)
    ) {
      throw new common.errors.InvalidResponseError(
        "subscribersInTxPool should be an array",
      );
    }
    let subscribers = res.subscribers;
    let subscribersInTxPool = res.subscribersInTxPool;
    while (res.subscribers && res.subscribers.length >= options.limit) {
      offset += options.limit;
      res = await this.getSubscribers(topic, { offset, limit: options.limit });
      if (!(res.subscribers instanceof Array)) {
        throw new common.errors.InvalidResponseError(
          "subscribers should be an array",
        );
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

  async _messageFromPayload(
    payload: common.pb.payloads.Payload,
    encrypt: boolean,
    dest: Destination,
  ): Promise<Array<common.pb.payloads.Message>> {
    if (encrypt) {
      return await this._encryptPayload(payload.serializeBinary(), dest);
    }
    return [message.newMessage(payload.serializeBinary(), false)];
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
        this.responseManager.respond(
          payload.getReplyToId(),
          null,
          payload.getType(),
        );
        return true;
    }

    // handle response if applicable
    if (payload.getReplyToId().length) {
      this.responseManager.respond(
        payload.getReplyToId(),
        data,
        payload.getType(),
      );
      return true;
    }

    // handle msg
    switch (payload.getType()) {
      case common.pb.payloads.PayloadType.TEXT:
      case common.pb.payloads.PayloadType.BINARY:
      case common.pb.payloads.PayloadType.SESSION:
        if (this.eventListeners.message.length > 0) {
          let responses = await Promise.all(
            this.eventListeners.message.map(async (f) => {
              try {
                return await f({
                  src: msg.getSrc(),
                  payload: data,
                  payloadType: payload.getType(),
                  isEncrypted: pldMsg.getEncrypted(),
                  messageId: payload.getMessageId(),
                  noReply: payload.getNoReply(),
                });
              } catch (e) {
                console.log("Message handler error:", e);
                return null;
              }
            }),
          );
          if (!payload.getNoReply()) {
            let responded = false;
            for (let response of responses) {
              if (response === false) {
                return true;
              } else if (response !== undefined && response !== null) {
                this.send(msg.getSrc(), response, {
                  encrypt: pldMsg.getEncrypted(),
                  msgHoldingSeconds: 0,
                  replyToId: payload.getMessageId(),
                }).catch((e) => {
                  console.log("Send response error:", e);
                });
                responded = true;
                break;
              }
            }
            if (!responded) {
              await this._sendACK(
                msg.getSrc(),
                payload.getMessageId(),
                pldMsg.getEncrypted(),
              );
            }
          }
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
    if (typeof window === "undefined") {
      return false;
    }
    if (window.location && window.location.protocol === "https:") {
      return true;
    }
    return false;
  }

  async _newWsAddr(nodeInfo: { addr: string, rpcAddr: string, sdp?: string }) {
    if (!nodeInfo.addr) {
      console.log("No address in node info", nodeInfo);
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
      if (this.options.webrtc) {
        ws = this.peer;
        this.peer.setRemoteDescription(nodeInfo.sdp);
      } else {
        ws = new WebSocket((tls ? "wss" : "ws") + "://" + nodeInfo.addr);
        ws.binaryType = "arraybuffer";
      }
    } catch (e) {
      console.log("Create WebSocket or WebRTC failed,", e);
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
    this.wallet.options.rpcServerAddr = "";
    if (!tls && nodeInfo.rpcAddr) {
      let addr = "http://" + nodeInfo.rpcAddr;
      common.rpc
        .getNodeState({ rpcServerAddr: addr })
        .then((nodeState) => {
          if (nodeState.syncState === "PERSIST_FINISHED") {
            this.wallet.options.rpcServerAddr = addr;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }

    let wsConnectResolve, wsConnectTimer;
    new Promise((resolve, reject) => {
      wsConnectResolve = resolve;
      wsConnectTimer = setTimeout(() => {
        if (this.ws === ws) {
          reject(new common.errors.ConnectToNodeTimeoutError());
        } else {
          resolve();
        }
      }, this.options.connectTimeout);
    })
      .then(() => {
        clearTimeout(wsConnectTimer);
      })
      .catch((e) => {
        if (!this.isClosed) {
          console.log("WebSocket or WebRTC connect timeout,", e);
        }
        if (this.shouldReconnect) {
          this._reconnect();
        } else if (!this.isClosed) {
          this._connectFailed();
        }
      });

    let challengeDone: Function;
    let challengeHandler: Promise<SaltAndSignature> =
      new Promise<SaltAndSignature>((resolve, reject) => {
        challengeDone = resolve;
        setTimeout(() => {
          if (this.ws === ws) {
            // Some nodejs version might terminate the whole process if we call reject here
            resolve(new common.errors.ChallengeTimeoutError());
          }
        }, waitForChallengeTimeout);
      });

    ws.onopen = async () => {
      wsConnectResolve();
      let data: any = {
        Action: Action.setClient,
        Addr: this.addr,
      };
      let req = await challengeHandler;
      if (!!req && !(req instanceof common.errors.ChallengeTimeoutError)) {
        data.ClientSalt = common.util.bytesToHex(req.ClientSalt);
        data.Signature = common.util.bytesToHex(req.Signature);
      }
      ws.send(JSON.stringify(data));
      this.shouldReconnect = true;
      this.reconnectInterval = this.options.reconnectIntervalMin;
    };

    ws.onmessage = async (event) => {
      let data = event.data;
      if (data instanceof ArrayBuffer || data instanceof Blob) {
        try {
          if (data instanceof Blob) {
            data = new Uint8Array(await data.arrayBuffer());
          }
          let handled = await this._handleMsg(data);
          if (!handled) {
            console.warn("Unhandled msg.");
          }
        } catch (e) {
          console.log(e);
        }
        return;
      }

      let msg = JSON.parse(data);
      if (
        msg.Error !== undefined &&
        msg.Error !== common.errors.rpcRespErrCodes.success
      ) {
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
              this.eventListeners.connect.forEach(async (f) => {
                try {
                  await f(msg.Result);
                } catch (e) {
                  console.log("Connect handler error:", e);
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
          byteChallenge = common.util.mergeTypedArrays(
            byteChallenge,
            clientSalt,
          );
          let hash = common.hash.sha256Hex(
            common.util.bytesToHex(byteChallenge),
          );
          let signature = await crypto.sign(this.key.privateKey, hash);
          challengeDone({
            ClientSalt: clientSalt,
            Signature: common.util.hexToBytes(signature),
          });
          break;
        default:
          console.warn("Unknown msg type:", msg.Action);
      }
    };

    ws.onclose = () => {
      if (this.shouldReconnect) {
        console.warn("WebSocket unexpectedly closed.");
        this._reconnect();
      } else if (!this.isClosed) {
        this._connectFailed();
      }
    };

    ws.onerror = (event) => {
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
    };
  }

  async _encryptPayload(
    payload: Uint8Array,
    dest: Destination,
  ): Promise<Array<common.pb.payloads.Message>> {
    if (Array.isArray(dest)) {
      let nonce = common.util.randomBytes(common.crypto.nonceLength);
      let key = common.util.randomBytes(common.crypto.keyLength);
      let encryptedPayload = await common.crypto.encryptSymmetric(
        payload,
        nonce,
        key,
      );

      let msgs: Array<common.pb.payloads.Message> = [];
      for (let i = 0; i < dest.length; i++) {
        let pk = message.addrToPubkey(dest[i]);
        let encryptedKey = await this.key.encrypt(key, pk);
        let mergedNonce = common.util.mergeTypedArrays(
          encryptedKey.nonce,
          nonce,
        );
        let msg = message.newMessage(
          encryptedPayload,
          true,
          mergedNonce,
          encryptedKey.message,
        );
        msgs.push(msg);
      }
      return msgs;
    } else {
      let pk = message.addrToPubkey(dest);
      let encrypted = await this.key.encrypt(payload, pk);
      return [message.newMessage(encrypted.message, true, encrypted.nonce)];
    }
  }

  async _decryptPayload(
    msg: common.pb.payloads.Message,
    srcAddr: string,
  ): Promise<Uint8Array> {
    let rawPayload = msg.getPayload();
    let srcPubkey = message.addrToPubkey(srcAddr);
    let nonce = msg.getNonce();
    let encryptedKey = msg.getEncryptedKey();
    let decryptedPayload;
    if (encryptedKey && encryptedKey.length > 0) {
      if (nonce.length != common.crypto.nonceLength * 2) {
        throw new common.errors.DecryptionError("invalid nonce length");
      }
      let sharedKey = await this.key.decrypt(
        encryptedKey,
        nonce.slice(0, common.crypto.nonceLength),
        srcPubkey,
      );
      if (sharedKey === null) {
        throw new common.errors.DecryptionError("decrypt shared key failed");
      }
      decryptedPayload = await common.crypto.decryptSymmetric(
        rawPayload,
        nonce.slice(common.crypto.nonceLength),
        sharedKey,
      );
      if (decryptedPayload === null) {
        throw new common.errors.DecryptionError("decrypt message failed");
      }
    } else {
      if (nonce.length != common.crypto.nonceLength) {
        throw new common.errors.DecryptionError("invalid nonce length");
      }
      decryptedPayload = await this.key.decrypt(rawPayload, nonce, srcPubkey);
      if (decryptedPayload === null) {
        throw new common.errors.DecryptionError("decrypt message failed");
      }
    }
    return decryptedPayload;
  }

  /**
   * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  async getLatestBlock(): Promise<{ height: number, hash: string }> {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await Wallet.getLatestBlock(this.options);
      } catch (e) {}
    }
    return await Wallet.getLatestBlock(this.options);
  }

  /**
   * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  async getRegistrant(
    name: string,
  ): Promise<{ registrant: string, expiresAt: number }> {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await Wallet.getRegistrant(name, this.wallet.options);
      } catch (e) {}
    }
    return await Wallet.getRegistrant(name, this.options);
  }

  /**
   * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
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
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await Wallet.getSubscribers(
          topic,
          Object.assign({}, this.wallet.options, options),
        );
      } catch (e) {}
    }
    return await Wallet.getSubscribers(
      topic,
      Object.assign({}, this.options, options),
    );
  }

  /**
   * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
   * this client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  async getSubscribersCount(topic: string): Promise<number> {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await Wallet.getSubscribersCount(topic, this.wallet.options);
      } catch (e) {}
    }
    return await Wallet.getSubscribersCount(topic, this.options);
  }

  /**
   * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  async getSubscription(
    topic: string,
    subscriber: string,
  ): Promise<{ meta: string, expiresAt: number }> {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await Wallet.getSubscription(
          topic,
          subscriber,
          this.wallet.options,
        );
      } catch (e) {}
    }
    return await Wallet.getSubscription(topic, subscriber, this.options);
  }

  /**
   * Same as [Wallet.getBalance](#walletgetbalance), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  async getBalance(address: ?string): Promise<common.Amount> {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await Wallet.getBalance(
          address || this.wallet.address,
          this.wallet.options,
        );
      } catch (e) {}
    }
    return await Wallet.getBalance(
      address || this.wallet.address,
      this.options,
    );
  }

  /**
   * Same as [Wallet.getNonce](#walletgetnonce), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  async getNonce(
    address: ?string,
    options: { txPool: boolean } = {},
  ): Promise<number> {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await Wallet.getNonce(
          address || this.wallet.address,
          Object.assign({}, this.wallet.options, options),
        );
      } catch (e) {}
    }
    return await Wallet.getNonce(
      address || this.wallet.address,
      Object.assign({}, this.options, options),
    );
  }

  /**
   * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  async sendTransaction(
    txn: common.pb.transaction.Transaction,
  ): Promise<string> {
    if (this.wallet.options.rpcServerAddr) {
      try {
        return await Wallet.sendTransaction(txn, this.wallet.options);
      } catch (e) {}
    }
    return await Wallet.sendTransaction(txn, this.options);
  }

  /**
   * Same as [wallet.transferTo](#wallettransferto), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
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
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  registerName(
    name: string,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.registerName.call(this, name, options);
  }

  /**
   * Same as [wallet.transferName](#wallettransfername), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
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
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
   */
  deleteName(
    name: string,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.deleteName.call(this, name, options);
  }

  /**
   * Same as [wallet.subscribe](#walletsubscribe), but using this
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
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
   * client's connected node as rpcServerAddr, followed by this client's
   * rpcServerAddr if failed.
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
    return this.wallet.createTransaction(pld, nonce, options);
  }
}

class ResponseProcessor {
  messageId: string;
  deadline: ?number;
  responseHandler: ResponseHandler;
  timeoutHandler: TimeoutHandler;

  constructor(
    messageId: Uint8Array | string,
    timeout: ?number,
    responseHandler: ResponseHandler,
    timeoutHandler: TimeoutHandler,
  ) {
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
      this.timeoutHandler(new Error("Message timeout"));
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

  respond(
    messageId: Uint8Array | string,
    data: ReplyData,
    payloadType?: common.pb.payloads.PayloadType,
  ) {
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

    timeoutProcessors.forEach((p) => {
      p.handleTimeout();
      this.responseProcessors.delete(p.messageId);
    });

    this.timer = setTimeout(
      this.checkTimeout.bind(this),
      consts.checkTimeoutInterval,
    );
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
 * @property {string} src - Message sender address.
 * @property {MessageData} payload - Message payload.
 * @property {nkn.pb.payloads.PayloadType} payloadType - Message payload type.
 * @property {boolean} isEncrypted - Whether message is end to end encrypted.
 * @property {Uint8Array} messageId - Unique message ID.
 * @property {boolean} noReply - Indicating no reply should be sent back as sender will not process it.
 */
export type Message = {
  src: string,
  payload: MessageData,
  payloadType: common.pb.payloads.PayloadType,
  isEncrypted: boolean,
  messageId: Uint8Array,
  noReply: boolean,
};

export type SaltAndSignature = {
  ClientSalt: Uint8Array,
  Signature: Uint8Array,
};

/**
 * Connect handler function type.
 */
export type ConnectHandler = ({ addr: string }) => void;

/**
 * Connect Failed handler function type.
 */
export type ConnectFailedHandler = () => void;

/**
 * Message handler function type.
 */
export type MessageHandler = (Message) =>
  | ReplyData
  | false
  | void
  | Promise<ReplyData | false | void>;

/**
 * Websocket error handler function type.
 */
export type WsErrorHandler = (Event) => void;

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
  messageId?: Uint8Array,
  replyToId?: Uint8Array,
};

/**
 * Publish message options type.
 * @property {boolean} [txPool=false] - Whether to send message to subscribers whose subscribe transaction is still in txpool. Enabling this will cause subscribers to receive message sooner after sending subscribe transaction, but might affect the correctness of subscribers because transactions in txpool is not guaranteed to be packed into a block.
 * @property {boolean} [encrypt] - Whether to end to end encrypt message.
 * @property {number} [msgHoldingSeconds] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 */
export type PublishOptions = {
  encrypt?: boolean,
  msgHoldingSeconds?: number,
  messageId?: Uint8Array,
  replyToId?: Uint8Array,
  txPool?: boolean,
  offset?: number,
  limit?: number,
};
