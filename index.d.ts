import { Decimal } from "decimal.js";

export as namespace nkn;

export = nkn;

declare namespace nkn {
  export class MultiClient {
    addr: string;
    identifier: string;
    isClosed: boolean;
    isReady: boolean;
    defaultClient: Client;

    constructor(options?: MultiClientOptions);

    close(): Promise<void>;

    deleteName(name: string, options?: TransactionOptions): Promise<TxnOrHash>;

    dial(remoteAddr: string, options?: DialOptions): Promise<Session>;

    getBalance(address?: string): Promise<Amount>;

    getLatestBlock(): Promise<{
      height: number;
      hash: string;
    }>;

    getNonce(address?: string, options?: { txPool: boolean }): Promise<number>;

    getPublicKey(): string;

    getRegistrant(name: string): Promise<{
      registrant: string;
      expiresAt: number;
    }>;

    getSeed(): string;

    getSubscribers(
      topic: string,
      options?: {
        offset?: number;
        limit?: number;
        meta?: boolean;
        txPool?: boolean;
      },
    ): Promise<{
      subscribers: Array<string> | Record<string, string>;
      subscribersInTxPool?: Array<string> | Record<string, string>;
    }>;

    getSubscribersCount(topic: string): Promise<number>;

    getSubscription(
      topic: string,
      subscriber: string,
    ): Promise<{
      meta: string;
      expiresAt: number;
    }>;

    listen(
      addrs: RegExp | Array<RegExp> | string | Array<string> | null | void,
    ): void;

    onConnect(f: ConnectHandler): void;

    onConnectFailed(f: ConnectFailedHandler): void;

    onMessage(func: MessageHandler): void;

    onSession(func: SessionHandler): void;

    publish(
      topic: string,
      data: MessageData,
      options?: PublishOptions,
    ): Promise<null>;

    readyClientIDs(): Array<string>;

    registerName(
      name: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    send(
      dest: Destination,
      data: MessageData,
      options?: SendOptions,
    ): Promise<ReplyData>;

    sendTransaction(txn: Transaction): Promise<string>;

    sendWithClient(
      clientID: string,
      dest: Destination,
      data: MessageData,
      options?: SendOptions,
    ): Promise<ReplyData>;

    subscribe(
      topic: string,
      duration: number,
      identifier?: string,
      meta?: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    transferName(
      name: string,
      recipient: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    transferTo(
      toAddress: string,
      amount: number | string | Amount,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    unsubscribe(
      topic: string,
      identifier: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;
  }

  export class Client {
    addr: string;
    identifier: string;

    constructor(options?: ClientOptions);

    close(): void;

    deleteName(name: string, options?: TransactionOptions): Promise<TxnOrHash>;

    getBalance(address?: string): Promise<Amount>;

    getLatestBlock(): Promise<{ height: number; hash: string }>;

    getNonce(
      address?: string,
      options?: {
        txPool: boolean;
      },
    ): Promise<number>;

    getPublicKey(): string;

    getRegistrant(name: string): Promise<{
      registrant: string;
      expiresAt: number;
    }>;

    getSeed(): string;

    getSubscribers(
      topic: string,
      options?: {
        offset?: number;
        limit?: number;
        meta?: boolean;
        txPool?: boolean;
      },
    ): Promise<{
      subscribers: Array<string> | Record<string, string>;
      subscribersInTxPool?: Array<string> | Record<string, string>;
    }>;

    getSubscribersCount(topic: string): Promise<number>;

    getSubscription(
      topic: string,
      subscriber: string,
    ): Promise<{
      meta: string;
      expiresAt: number;
    }>;

    onConnect(func: ConnectHandler): void;

    onConnectFailed(f: ConnectFailedHandler): void;

    onMessage(func: MessageHandler): void;

    publish(
      topic: string,
      data: MessageData,
      options?: PublishOptions,
    ): Promise<null>;

    registerName(
      name: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    send(
      dest: Destination,
      data: MessageData,
      options?: SendOptions,
    ): Promise<ReplyData>;

    sendTransaction(txn: Transaction): Promise<string>;

    subscribe(
      topic: string,
      duration: number,
      identifier?: string,
      meta?: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    transferName(
      name: string,
      recipient: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    transferTo(
      toAddress: string,
      amount: number | string | Amount,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    unsubscribe(
      topic: string,
      identifier: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;
  }

  export class Wallet {
    address: string;
    version: number;

    constructor(options?: {
      seed?: string;
      password?: string;
      rpcServerAddr?: string;
      iv?: string;
      masterKey?: string;
      scrypt?: ScryptParams;
      worker?: boolean | (() => Worker | Promise<Worker>);
      passwordKey?: Record<string, string>;
      version?: number;
    });

    createOrUpdateNanoPay(
      toAddress: string,
      amount: number | string | Amount,
      expiration: number,
      id: number,
      options?: TransactionOptions,
    ): Promise<Transaction>;

    deleteName(name: string, options?: TransactionOptions): Promise<TxnOrHash>;

    static fromJSON(
      walletJson: string | WalletJson,
      options?: {
        password: string;
        rpcServerAddr?: string;
        async?: boolean;
      },
    ): Wallet | Promise<Wallet>;

    static getBalance(
      address: string,
      options?: {
        rpcServerAddr: string;
      },
    ): Promise<Amount>;

    getBalance(address?: string): Promise<Amount>;

    static getLatestBlock(options?: { rpcServerAddr: string }): Promise<{
      height: number;
      hash: string;
    }>;

    getLatestBlock(): Promise<{
      height: number;
      hash: string;
    }>;

    static getNonce(
      address: string,
      options?: {
        rpcServerAddr: string;
        txPool: boolean;
      },
    ): Promise<number>;

    getNonce(address?: string, options?: { txPool: boolean }): Promise<number>;

    getPublicKey(): string;

    static getRegistrant(
      name: string,
      options?: {
        rpcServerAddr: string;
      },
    ): Promise<{
      registrant: string;
      expiresAt: number;
    }>;

    getRegistrant(name: string): Promise<{
      registrant: string;
      expiresAt: number;
    }>;

    getSeed(): string;

    static getSubscribers(
      topic: string,
      options?: {
        offset?: number;
        limit?: number;
        meta?: boolean;
        txPool?: boolean;
        rpcServerAddr?: string;
      },
    ): Promise<{
      subscribers: Array<string> | Record<string, string>;
      subscribersInTxPool?: Array<string> | Record<string, string>;
    }>;

    getSubscribers(
      topic: string,
      options?: {
        offset?: number;
        limit?: number;
        meta?: boolean;
        txPool?: boolean;
      },
    ): Promise<{
      subscribers: Array<string> | Record<string, string>;
      subscribersInTxPool?: Array<string> | Record<string, string>;
    }>;

    static getSubscribersCount(
      topic: string,
      options?: {
        rpcServerAddr: string;
      },
    ): Promise<number>;

    getSubscribersCount(topic: string): Promise<number>;

    static getSubscription(
      topic: string,
      subscriber: string,
      options?: {
        rpcServerAddr: string;
      },
    ): Promise<{
      meta: string;
      expiresAt: number;
    }>;

    getSubscription(
      topic: string,
      subscriber: string,
    ): Promise<{
      meta: string;
      expiresAt: number;
    }>;

    static publicKeyToAddress(publicKey: string): string;

    registerName(
      name: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    static sendTransaction(
      txn: Transaction,
      options?: {
        rpcServerAddr: string;
      },
    ): Promise<string>;

    sendTransaction(txn: Transaction): Promise<string>;

    subscribe(
      topic: string,
      duration: number,
      identifier: string,
      meta: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    toJSON(): WalletJson;

    transferName(
      name: string,
      recipient: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    transferTo(
      toAddress: string,
      amount: number | string | Amount,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    unsubscribe(
      topic: string,
      identifier: string,
      options?: TransactionOptions,
    ): Promise<TxnOrHash>;

    static verifyAddress(addr: string): boolean;

    verifyPassword(
      password: string,
      options?: {
        async: boolean;
      },
    ): boolean | Promise<boolean>;
  }

  export class Amount extends Decimal {}

  export class Key {
    seed: string;
    publicKey: string;
    privateKey: Uint8Array;
    curvePrivateKey: Uint8Array;
    useWorker: boolean;
    worker: Worker | null;
    workerMsgID: number;

    constructor(
      seed: string,
      options?: {
        worker?: boolean | (() => Worker | Promise<Worker>);
      },
    );

    computeSharedKey(otherPubkey: string): Promise<string>;

    getOrComputeSharedKey(otherPubkey: string): Promise<string>;

    encrypt(
      message: string,
      destPubkey: string,
      options?: {
        nonce?: Uint8Array;
      },
    ): Promise<{
      message: Uint8Array;
      nonce: Uint8Array;
    }>;

    decrypt(
      message: Uint8Array,
      nonce: Uint8Array,
      srcPubkey: string,
      options?: {},
    ): Promise<string>;

    sign(message: string): string;
  }

  export type ConnectHandler = (params: {
    node: {
      addr: string,
      id: string,
      pubkey: string,
      rpcAddr: string,
      sdp: string
    }
  }) => void;

  export type ConnectFailedHandler = () => void;

  export type CreateTransactionOptions = {
    fee: number | string | Amount | null | void;
    attrs: string | null | undefined;
    buildOnly: boolean | null | undefined;
  };

  export type Destination = string | Array<string>;

  type DialOptions = {
    dialTimeout?: number;
    sessionConfig?: SessionConfig;
  };

  export type Message = {
    src: string;
    payload: MessageData;
    payloadType: PayloadType;
    isEncrypted: boolean;
    messageId: Uint8Array;
    noReply: boolean;
  };

  export type MessageData = Uint8Array | string;

  export type MessageHandler = (
    message: Message,
  ) => ReplyData | false | void | Promise<ReplyData | false | void>;

  export type PublishOptions = {
    encrypt?: boolean;
    msgHoldingSeconds?: number;
    messageId?: Uint8Array;
    replyToId?: Uint8Array;
    txPool?: boolean;
    offset?: number;
    limit?: number;
  };

  export type ReplyData = MessageData | null;

  export type SendOptions = {
    responseTimeout?: number;
    encrypt?: boolean;
    msgHoldingSeconds?: number;
    noReply?: boolean;
    messageId?: Uint8Array;
    replyToId?: Uint8Array;
  };

  export type SessionHandler = (session: Session) => void;

  export type TransactionOptions = CreateTransactionOptions & {
    nonce?: number;
  };

  export type TxnOrHash = string | Transaction;

  // eslint-disable-next-line import/no-anonymous-default-export
  interface ClientOptions {
    identifier?: string;
    reconnectIntervalMin?: number;
    reconnectIntervalMax?: number;
    responseTimeout?: number;
    msgHoldingSeconds?: number;
    encrypt?: boolean;
    rpcServerAddr?: string;
    tls?: boolean;
    webrtc?: boolean;
    stunServerAddr?: string | Array<string>;
    worker?: boolean | (() => Worker | Promise<Worker>);
  }

  interface MultiClientOptions extends ClientOptions {
    seed?: string;
    numSubClients?: number;
    originalClient?: boolean;
    msgCacheExpiration?: number;
    sessionConfig?: SessionConfig;
  }

  enum PayloadType {
    BINARY = 0,
    TEXT = 1,
    ACK = 2,
    SESSION = 3,
  }

  type Session = Object; // TODO: import from NCP types

  type SessionConfig = Object; // TODO: import from NCP types

  type Transaction = Object; // TODO

  export type ScryptParams = {
    salt: string;
    N: number;
    r: number;
    p: number;
  };

  type WalletJson = {
    Version: number;
    MasterKey: string;
    IV: string;
    SeedEncrypted: string;
    Address: string;
    Scrypt?: ScryptParams;
  };

  export namespace aes {
    export function encrypt(
      plaintext: string,
      password: string,
      iv: string,
    ): string;

    export function decrypt(
      ciphertext: string,
      password: string,
      iv: string,
    ): string;
  }

  export namespace crypto {
    export const keyLength: number;
    export const nonceLength: number;
    export const publicKeyLength: number;
    export const seedLength: number;
    export const signatureLength: number;

    export function keyPair(seed: string): KeyPair;

    export function ed25519SkToCurve25519(sk: Uint8Array): Uint8Array;

    export function ed25519PkToCurve25519(pk: string): Promise<Uint8Array>;

    export function computeSharedKey(
      myCurvePrivateKey: Uint8Array,
      otherPubkey: string,
    ): Promise<string>;

    export function encryptSymmetric(
      message: Uint8Array,
      nonce: Uint8Array,
      key: Uint8Array,
    ): Promise<Uint8Array>;

    export function decryptSymmetric(
      message: Uint8Array,
      nonce: Uint8Array,
      key: Uint8Array,
    ): Promise<Uint8Array | null>;

    export function sign(
      privateKey: Uint8Array,
      message: string,
    ): Promise<string>;

    type KeyPair = {
      seed: string;
      publicKey: string;
      privateKey: Uint8Array;
      curvePrivateKey: Uint8Array;
    };
  }

  export namespace errors {
    const rpcRespErrCodes: Object;
    const AddrNotAllowedError: ErrorConstructor;
    const ClientNotReadyError: ErrorConstructor;
    const DataSizeTooLargeError: ErrorConstructor;
    const DecryptionError: ErrorConstructor;
    const UnknownError: ErrorConstructor;
    const NotEnoughBalanceError: ErrorConstructor;
    const WrongPasswordError: ErrorConstructor;
    const InvalidAddressError: ErrorConstructor;
    const InvalidWalletFormatError: ErrorConstructor;
    const InvalidWalletVersionError: ErrorConstructor;
    const InvalidArgumentError: ErrorConstructor;
    const InvalidResponseError: ErrorConstructor;
    const ServerError: ErrorConstructor;
    const InvalidDestinationError: ErrorConstructor;
    const RpcTimeoutError: ErrorConstructor;
    const RpcError: ErrorConstructor;
  }

  export namespace hash {
    export function cryptoHexStringParse(hexString: string): string;

    export function sha256(str: string): string;

    export function sha256Hex(hexStr: string): string;

    export function doubleSha256(str: string): string;

    export function doubleSha256Hex(hexStr: string): string;

    export function ripemd160(str: string): string;

    export function ripemd160Hex(hexStr: string): string;
  }

  export namespace serialize {
    export const maxUintBits: number;
    export const maxUint: number;

    export function encodeUint8(value: number): string;

    export function encodeUint16(value: number): string;

    export function encodeUint32(value: number): string;

    export function encodeUint64(value: number): string;

    export function encodeUint(value: number): string;

    export function encodeBytes(value: number): string;

    export function encodeString(value: number): string;

    export function encodeBool(value: number): string;
  }

  export namespace util {
    import TypedArray = NodeJS.TypedArray;

    export function hexToBytes(hex: string): Uint8Array;

    export function bytesToHex(bytes: Uint8Array): string;

    export function randomBytes(n: number): Uint8Array;

    export function setPRNG(fn: (x: Uint8Array, n: number) => void): void;

    export function randomBytesHex(len: number): string;

    export function randomInt32(): number;

    export function randomUint64(): number;

    export function mergeTypedArrays(a: TypedArray, b: TypedArray): TypedArray;

    export function assignDefined(target: Object, ...sources: Object[]): void;

    export function utf8ToBytes(s: string): Uint8Array;

    export function toLowerKeys(obj: Object): Object;
  }

  export function setPRNG(fn: (x: Uint8Array, n: number) => void): void;
}

declare interface nkn {
  MultiClient: nkn.MultiClient;
  Client: nkn.Client;
  Wallet: nkn.Wallet;
  Amount: nkn.Amount;
  ConnectHandler: nkn.ConnectHandler;
  ConnectFailedHandler: nkn.ConnectFailedHandler;
  CreateTransactionOptions: nkn.CreateTransactionOptions;
  Destination: nkn.Destination;
  DialOptions: nkn.DialOptions;
  Message: nkn.Message;
  MessageData: nkn.MessageData;
  MessageHandler: nkn.MessageHandler;
  PublishOptions: nkn.PublishOptions;
  ReplyData: nkn.ReplyData;
  SendOptions: nkn.SendOptions;
  SessionHandler: nkn.SessionHandler;
  TransactionOptions: nkn.TransactionOptions;
  TxnOrHash: nkn.TxnOrHash;
}
