// @flow
"use strict";

import scrypt from "scrypt-js";

import Account from "./account";
import * as address from "./address";
import * as common from "../common";
import * as consts from "./consts";
import * as transaction from "./transaction";

/**
 * NKN client that sends data to and receives data from other NKN clients.
 * @param {Object} options - Wallet options.
 * @param {string} [options.seed=undefined] - Secret seed (64 hex characters). If empty, a random seed will be used.
 * @param {string} options.password - Wallet password.
 * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address.
 * @param {string} [options.iv=undefined] - AES iv, typically you should use Wallet.fromJSON instead of this field.
 * @param {string} [options.masterKey=undefined] - AES master key, typically you should use Wallet.fromJSON instead of this field.
 * @param {boolean|function} [options.worker=false] - Whether to use web workers (if available) to compute signatures. Can also be a function that returns web worker. Typically you only need to set it to a function if you import nkn-sdk as a module and are NOT using browserify or webpack worker-loader to bundle js file. The worker file is located at `lib/worker/webpack.worker.js`.
 */
export default class Wallet {
  options: {
    rpcServerAddr: string,
    scrypt?: ScryptParams,
    worker: boolean | (() => Worker | Promise<Worker>),
  };
  account: Account;
  iv: string;
  masterKey: string;
  /**
   * Wallet address, which is a string starts with 'NKN'.
   */
  address: string;
  programHash: string;
  seedEncrypted: string;
  scryptParams: ScryptParams;
  /**
   * Wallet version.
   */
  version: number;

  static version: number = 2;
  static minCompatibleVersion: number = 1;
  static maxCompatibleVersion: number = 2;

  constructor(
    options: {
      seed?: string,
      password?: string,
      rpcServerAddr?: string,
      iv?: string,
      masterKey?: string,
      scrypt?: ScryptParams,
      worker?: boolean | (() => Worker | Promise<Worker>),
      passwordKey?: { [string]: string },
      version?: number,
    } = {},
  ) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    this.version = options.version || Wallet.version;

    switch (this.version) {
      case 2:
        this.scryptParams = common.util.assignDefined(
          {},
          consts.scryptParams,
          options.scrypt,
        );
        this.scryptParams.salt =
          this.scryptParams.salt ||
          common.util.randomBytesHex(this.scryptParams.saltLen);
        break;
    }

    this.options = options;
    this.account = new Account(options.seed, { worker: options.worker });
    this.address = this.account.address;
    this.programHash = this.account.programHash;

    if (
      options.iv ||
      options.masterKey ||
      options.password ||
      options.passwordKey
    ) {
      this._completeWallet(Object.assign({}, options, { async: false }));
    }

    delete options.seed;
    delete options.iv;
    delete options.masterKey;
    delete options.password;
    delete options.passwordKey;
  }

  static _computePasswordKey(options: {
    version: number,
    password: string,
    scrypt?: ScryptParams,
    async: boolean,
  }) {
    // convert all keys to lowercase to be case insensitive
    options = common.util.toLowerKeys(options);

    if (!options.version) {
      throw new common.errors.InvalidArgumentError("missing version field");
    }

    let passwordKey;
    switch (options.version) {
      case 1:
        if (options.async) {
          return Promise.resolve(common.hash.doubleSha256(options.password));
        } else {
          return common.hash.doubleSha256(options.password);
        }
      case 2:
        if (!options.scrypt) {
          throw new common.errors.InvalidArgumentError("missing scrypt field");
        }
        if (
          !options.scrypt.salt ||
          !options.scrypt.n ||
          !options.scrypt.r ||
          !options.scrypt.p
        ) {
          throw new common.errors.InvalidArgumentError(
            "incomplete scrypt parameters",
          );
        }
        if (options.async) {
          return scrypt
            .scrypt(
              common.util.utf8ToBytes(options.password),
              common.util.hexToBytes(options.scrypt.salt),
              options.scrypt.n,
              options.scrypt.r,
              options.scrypt.p,
              32,
            )
            .then(common.util.bytesToHex);
        } else {
          return common.util.bytesToHex(
            scrypt.syncScrypt(
              common.util.utf8ToBytes(options.password),
              common.util.hexToBytes(options.scrypt.salt),
              options.scrypt.n,
              options.scrypt.r,
              options.scrypt.p,
              32,
            ),
          );
        }
      default:
        throw new common.errors.InvalidWalletFormatError(
          "unsupported wallet verison " + options.version,
        );
    }
  }

  static _decryptWallet(walletObj: any, options: any): Wallet {
    options.iv = walletObj.iv;
    options.masterKey = common.aes.decrypt(
      walletObj.masterkey,
      options.passwordKey,
      options.iv,
    );
    options.seed = common.aes.decrypt(
      walletObj.seedencrypted,
      options.masterKey,
      options.iv,
    );
    options.passwordKey = { [walletObj.version]: options.passwordKey };

    switch (walletObj.version) {
      case 2:
        options.scrypt = {
          salt: walletObj.scrypt.salt,
          N: walletObj.scrypt.n,
          r: walletObj.scrypt.r,
          p: walletObj.scrypt.p,
        };
    }

    let account = new Account(options.seed, { worker: false });
    if (account.address !== walletObj.address) {
      throw new common.errors.WrongPasswordError();
    }

    return new Wallet(options);
  }

  _completeWallet(
    options: {
      iv?: string,
      masterKey?: string,
      password?: string,
      passwordKey?: { [string]: string },
      async: boolean,
    } = {},
  ) {
    if (this.seedEncrypted) {
      if (options.async) {
        return Promise.resolve();
      } else {
        return;
      }
    }

    let completeWallet = (passwordKey) => {
      let iv = options.iv || common.util.randomBytesHex(16);
      let masterKey = options.masterKey || common.util.randomBytesHex(32);
      this.iv = iv;
      this.masterKey = common.aes.encrypt(masterKey, passwordKey, iv);
      this.seedEncrypted = common.aes.encrypt(
        this.account.getSeed(),
        masterKey,
        iv,
      );
    };

    let passwordKey;
    if (options.passwordKey && options.passwordKey["" + this.version]) {
      passwordKey = options.passwordKey["" + this.version];
    } else {
      if (options.async) {
        return Wallet._computePasswordKey({
          version: this.version,
          password: options.password || "",
          scrypt: this.scryptParams,
          async: true,
        }).then(completeWallet);
      } else {
        passwordKey = Wallet._computePasswordKey({
          version: this.version,
          password: options.password || "",
          scrypt: this.scryptParams,
          async: false,
        });
      }
    }

    completeWallet(passwordKey);

    if (options.async) {
      return Promise.resolve();
    } else {
      return;
    }
  }

  /**
   * Recover wallet from JSON string and password.
   * @param {string|Object} walletJson - Wallet JSON string or object.
   * @param {Object} options - Wallet options.
   * @param {string} options.password - Wallet password.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address.
   * @param {bool} [options.async=false] - If true, return value will be a promise that resolves with the wallet object, and more importantly, the underlying scrypt computation will not block eventloop.
   */
  static fromJSON(
    walletJson: string | WalletJson,
    options: {
      password: string,
      rpcServerAddr?: string,
      async?: boolean,
    } = {},
  ): Wallet | Promise<Wallet> {
    let walletObj: { [string]: any };
    if (typeof walletJson === "string") {
      walletObj = JSON.parse(walletJson);
    } else {
      walletObj = walletJson;
    }

    // convert all keys to lowercase to be case insensitive
    walletObj = common.util.toLowerKeys(walletObj);

    if (
      typeof walletObj.version !== "number" ||
      walletObj.version < Wallet.minCompatibleVersion ||
      walletObj.version > Wallet.maxCompatibleVersion
    ) {
      throw new common.errors.InvalidWalletVersionError(
        "invalid wallet version " +
          walletObj.version +
          ", should be between " +
          Wallet.minCompatibleVersion +
          " and " +
          Wallet.maxCompatibleVersion,
      );
    }

    if (!walletObj.masterkey) {
      throw new common.errors.InvalidWalletFormatError(
        "missing masterKey field",
      );
    }

    if (!walletObj.iv) {
      throw new common.errors.InvalidWalletFormatError("missing iv field");
    }

    if (!walletObj.seedencrypted) {
      throw new common.errors.InvalidWalletFormatError(
        "missing seedEncrypted field",
      );
    }

    if (!walletObj.address) {
      throw new common.errors.InvalidWalletFormatError("missing address field");
    }

    if (options.async) {
      return Wallet._computePasswordKey(
        Object.assign({}, walletObj, {
          password: options.password,
          async: true,
        }),
      ).then((passwordKey) => {
        return Wallet._decryptWallet(
          walletObj,
          Object.assign({}, options, { passwordKey }),
        );
      });
    } else {
      let passwordKey = Wallet._computePasswordKey(
        Object.assign({}, walletObj, {
          password: options.password,
          async: false,
        }),
      );
      return Wallet._decryptWallet(
        walletObj,
        Object.assign({}, options, { passwordKey }),
      );
    }
  }

  /**
   * Return the wallet object to be serialized by JSON.
   */
  toJSON(): WalletJson {
    this._completeWallet({ async: false });
    let walletJson: WalletJson = {
      Version: this.version,
      MasterKey: this.masterKey,
      IV: this.iv,
      SeedEncrypted: this.seedEncrypted,
      Address: this.address,
    };
    if (this.scryptParams) {
      walletJson.Scrypt = {
        Salt: this.scryptParams.salt,
        N: this.scryptParams.N,
        R: this.scryptParams.r,
        P: this.scryptParams.p,
      };
    }
    return walletJson;
  }

  /**
   * Get the secret seed of the wallet.
   * @returns Secret seed as hex string.
   */
  getSeed(): string {
    return this.account.getSeed();
  }

  /**
   * Get the public key of the wallet.
   * @returns Public key as hex string.
   */
  getPublicKey(): string {
    return this.account.getPublicKey();
  }

  /**
   * Verify whether an address is a valid NKN wallet address.
   */
  static verifyAddress(addr: string): boolean {
    return address.verifyAddress(addr);
  }

  _verifyPassword(passwordKey: string): boolean {
    this._completeWallet({ async: false });
    let masterKey = common.aes.decrypt(this.masterKey, passwordKey, this.iv);
    let seed = common.aes.decrypt(this.seedEncrypted, masterKey, this.iv);
    let account = new Account(seed, { worker: false });
    return account.address === this.address;
  }

  /**
   * Verify whether the password is the correct password of this wallet.
   * @param {Object} options - Verify password options.
   * @param {bool} [options.async=false] - If true, return value will be a promise, and more importantly, the underlying scrypt computation will not block eventloop.
   */
  verifyPassword(
    password: string,
    options: { async: boolean } = {},
  ): boolean | Promise<boolean> {
    let opts = {
      version: this.version,
      password,
      scrypt: this.scryptParams,
      async: options.async,
    };
    if (options.async) {
      let verifyPassword: (void) => Promise<boolean> = async () => {
        await this._completeWallet({ async: true });
        let passwordKey = await Wallet._computePasswordKey(opts);
        return this._verifyPassword(passwordKey);
      };
      return verifyPassword();
    } else {
      this._completeWallet({ async: false });
      let passwordKey = Wallet._computePasswordKey(opts);
      return this._verifyPassword(passwordKey);
    }
  }

  /**
   * Get latest block height and hash.
   * @param {Object} [options={}] - Get nonce options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */
  static getLatestBlock(
    options: { rpcServerAddr: string } = {},
  ): Promise<{ height: number, hash: string }> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getLatestBlock(options);
  }

  /**
   * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */
  getLatestBlock(): Promise<{ height: number, hash: string }> {
    return Wallet.getLatestBlock(this.options);
  }

  /**
   * Get the registrant's public key and expiration block height of a name. If
   * name is not registered, `registrant` will be '' and `expiresAt` will be 0.
   */
  static getRegistrant(
    name: string,
    options: { rpcServerAddr: string } = {},
  ): Promise<{ registrant: string, expiresAt: number }> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getRegistrant(name, options);
  }

  /**
   * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */
  getRegistrant(
    name: string,
  ): Promise<{ registrant: string, expiresAt: number }> {
    return Wallet.getRegistrant(name, this.options);
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
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getSubscribers(topic, options);
  }

  /**
   * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
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
    return Wallet.getSubscribers(
      topic,
      Object.assign({}, this.options, options),
    );
  }

  /**
   * Get subscribers count of a topic (not including txPool).
   */
  static getSubscribersCount(
    topic: string,
    options: { rpcServerAddr: string } = {},
  ): Promise<number> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getSubscribersCount(topic, options);
  }

  /**
   * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
   * this wallet's rpcServerAddr as rpcServerAddr.
   */
  getSubscribersCount(topic: string): Promise<number> {
    return Wallet.getSubscribersCount(topic, this.options);
  }

  /**
   * Get the subscription details of a subscriber in a topic.
   */
  static getSubscription(
    topic: string,
    subscriber: string,
    options: { rpcServerAddr: string } = {},
  ): Promise<{ meta: string, expiresAt: number }> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getSubscription(topic, subscriber, options);
  }

  /**
   * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */
  getSubscription(
    topic: string,
    subscriber: string,
  ): Promise<{ meta: string, expiresAt: number }> {
    return Wallet.getSubscription(topic, subscriber, this.options);
  }

  /**
   * Get the balance of a NKN wallet address.
   * @param {Object} [options={}] - Get nonce options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */
  static getBalance(
    address: string,
    options: { rpcServerAddr: string } = {},
  ): Promise<common.Amount> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getBalance(address, options);
  }

  /**
   * Same as [Wallet.getBalance](#walletgetbalance), but using this wallet's
   * rpcServerAddr as rpcServerAddr. If address is not given, this wallet's
   * address will be used.
   */
  getBalance(address: ?string): Promise<common.Amount> {
    return Wallet.getBalance(address || this.address, this.options);
  }

  /**
   * Get the next nonce of a NKN wallet address.
   * @param {Object} [options={}] - Get nonce options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   * @param {boolean} [options.txPool=true] - Whether to consider transactions in txPool. If true, will return the next nonce after last nonce in txPool, otherwise will return the next nonce after last nonce in ledger.
   */
  static getNonce(
    address: string,
    options: { rpcServerAddr: string, txPool: boolean } = {},
  ): Promise<number> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getNonce(address, options);
  }

  /**
   * Same as [Wallet.getNonce](#walletgetnonce), but using this wallet's
   * rpcServerAddr as rpcServerAddr. If address is not given, this wallet's
   * address will be used.
   */
  getNonce(
    address: ?string,
    options: { txPool: boolean } = {},
  ): Promise<number> {
    options = common.util.assignDefined({}, this.options, options);
    return Wallet.getNonce(address || this.address, options);
  }

  /**
   * Send a transaction to RPC server.
   * @param {Object} [options={}] - Send transaction options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */
  static sendTransaction(
    txn: common.pb.transaction.Transaction,
    options: { rpcServerAddr: string } = {},
  ): Promise<string> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.sendTransaction(txn, options);
  }

  /**
   * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */
  sendTransaction(txn: common.pb.transaction.Transaction): Promise<string> {
    return Wallet.sendTransaction(txn, this.options);
  }

  /**
   * Transfer token from this wallet to another wallet address.
   */
  transferTo(
    toAddress: string,
    amount: number | string | common.Amount,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.transferTo.call(this, toAddress, amount, options);
  }

  /**
   * Register a name for this wallet's public key at the cost of 10 NKN. The
   * name will be valid for 1,576,800 blocks (around 1 year). Register name
   * currently owned by this wallet will extend the duration of the name to
   * current block height + 1,576,800. Registration will fail if the name is
   * currently owned by another account.
   */
  registerName(
    name: string,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.registerName.call(this, name, options);
  }

  /**
   * Transfer a name owned by this wallet to another public key. Does not change
   * the expiration of the name.
   */
  transferName(
    name: string,
    recipient: string,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.transferName.call(this, name, recipient, options);
  }

  /**
   * Delete a name owned by this wallet.
   */
  deleteName(
    name: string,
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.deleteName.call(this, name, options);
  }

  /**
   * Subscribe to a topic with an identifier for a number of blocks. Client
   * using the same key pair and identifier will be able to receive messages
   * from this topic. If this (identifier, public key) pair is already
   * subscribed to this topic, the subscription expiration will be extended to
   * current block height + duration.
   * @param {number} duration - Duration in unit of blocks.
   * @param {string} identifier - Client identifier.
   * @param {string} meta - Metadata of this subscription.
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
   * Unsubscribe from a topic for an identifier. Client using the same key pair
   * and identifier will no longer receive messages from this topic.
   * @param {string} identifier - Client identifier.
   */
  unsubscribe(
    topic: string,
    identifier: string = "",
    options: TransactionOptions = {},
  ): Promise<TxnOrHash> {
    return common.rpc.unsubscribe.call(this, topic, identifier, options);
  }

  /**
   * Create or update a NanoPay channel. NanoPay transaction does not have
   * nonce and will not be sent until you call `sendTransaction` explicitly.
   * @param {number} expiration - NanoPay expiration height.
   * @param {number} id - NanoPay id, should be unique for (this.address, toAddress) pair.
   */
  async createOrUpdateNanoPay(
    toAddress: string,
    amount: number | string | common.Amount,
    expiration: number,
    id: number,
    options: TransactionOptions = {},
  ): Promise<common.pb.transaction.Transaction> {
    if (!address.verifyAddress(toAddress)) {
      throw new common.errors.InvalidAddressError("invalid recipient address");
    }

    if (!id) {
      id = common.util.randomUint64();
    }

    let pld = transaction.newNanoPayPayload(
      this.programHash,
      address.addressStringToProgramHash(toAddress),
      id,
      amount,
      expiration,
      expiration,
    );

    return await this.createTransaction(pld, 0, options);
  }

  createTransaction(
    pld: common.pb.transaction.Payload,
    nonce: number,
    options: CreateTransactionOptions = {},
  ): Promise<common.pb.transaction.Transaction> {
    return transaction.newTransaction(
      this.account,
      pld,
      nonce,
      options.fee,
      options.attrs,
    );
  }

  /**
   * Convert a NKN public key to NKN wallet address.
   */
  static publicKeyToAddress(publicKey: string): string {
    let signatureRedeem = address.publicKeyToSignatureRedeem(publicKey);
    let programHash = address.hexStringToProgramHash(signatureRedeem);
    return address.programHashStringToAddress(programHash);
  }
}

type ScryptParams = {
  salt: string,
  N: number,
  r: number,
  p: number,
};

type WalletJson = {
  Version: number,
  MasterKey: string,
  IV: string,
  SeedEncrypted: string,
  Address: string,
  Scrypt?: {
    Salt: string,
    N: number,
    R: number,
    P: number,
  },
};

/**
 * Create transaction options type.
 * @property {(number|string)} [fee=0] - Transaction fee.
 * @property {string} [attrs=''] - Transaction attributes, cannot exceed 100 bytes.
 * @property {boolean} [buildOnly=false] - Whether to only build transaction but not send it.
 */
type CreateTransactionOptions = {
  fee: number | string | common.Amount | null | void,
  attrs: ?string,
  buildOnly: ?boolean,
};

/**
 * Transaction options type.
 * @property {(number|string)} [fee=0] - Transaction fee.
 * @property {string} [attrs=''] - Transaction attributes, cannot exceed 100 bytes.
 * @property {boolean} [buildOnly=false] - Whether to only build transaction but not send it.
 * @property {number} [nonce] - Transaction nonce, will get from RPC node if not provided.
 */
type TransactionOptions = CreateTransactionOptions & { nonce: number };

/**
 * Transaction hash if `options.buildOnly=false`, otherwise the transaction object.
 */
type TxnOrHash = string | common.pb.transaction.Transaction;
