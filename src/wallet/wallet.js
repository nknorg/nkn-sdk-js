// @flow
'use strict';

import Account from './account';
import * as address from './address';
import * as aes from './aes';
import * as common from '../common';
import * as consts from './consts';
import * as transaction from './transaction';

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
    worker: boolean | () => Worker | Promise<Worker>,
  };
  account: Account;
  passwordHash: string;
  iv: string;
  masterKey: string;
  /**
   * Wallet address, which is a string starts with 'NKN'.
   */
  address: string;
  programHash: string;
  seedEncrypted: string;
  contractData: string;
  /**
   * Wallet version.
   */
  version: number;

  static version: number = 1;
  static minCompatibleVersion: number = 1;
  static maxCompatibleVersion: number = 1;

  constructor(options: {
    seed?: string,
    password: string,
    rpcServerAddr?: string,
    iv?: string,
    masterKey?: string,
    worker?: boolean | () => Worker | Promise<Worker>,
  }) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    let account = new Account(options.seed, { worker: options.worker });
    let pswdHash = common.hash.doubleSha256(options.password);
    let iv = options.iv || common.util.randomBytesHex(16);
    let masterKey = options.masterKey || common.util.randomBytesHex(32);
    masterKey = common.hash.cryptoHexStringParse(masterKey);
    let seed = common.hash.cryptoHexStringParse(account.getSeed());

    delete options.seed;
    delete options.password;
    delete options.iv;
    delete options.masterKey;

    this.options = options;
    this.account = account;
    this.passwordHash = common.hash.sha256Hex(pswdHash);
    this.iv = iv;
    this.masterKey = aes.encrypt(masterKey, pswdHash, iv);
    this.address = account.address;
    this.programHash = account.programHash;
    this.seedEncrypted = aes.encrypt(seed, masterKey.toString(), iv);
    this.contractData = account.contract;
    this.version = Wallet.version;
  }

  /**
   * Recover wallet from JSON string and password.
   */
  static fromJSON(walletJson: string | WalletJson, options: {
    password: string,
    rpcServerAddr?: string,
  }) {
    let walletObj: { [string]: any };
    if (typeof walletJson === 'string') {
      walletObj = JSON.parse(walletJson);
    } else {
      walletObj = walletJson;
    }

    // convert all keys to lowercase
    walletObj = Object.keys(walletObj).reduce((merged, key) => Object.assign(merged, {[key.toLowerCase()]: walletObj[key]}), {});

    if (typeof walletObj.version !== 'number' || walletObj.version < Wallet.minCompatibleVersion || walletObj.version > Wallet.maxCompatibleVersion) {
      throw new common.errors.InvalidWalletVersionError('invalid wallet version ' + walletObj.version + ', should be between ' + Wallet.minCompatibleVersion + ' and ' + Wallet.maxCompatibleVersion);
    }

    if (!walletObj.masterkey) {
      throw new common.errors.InvalidWalletFormatError('missing masterKey field');
    }

    if (!walletObj.iv) {
      throw new common.errors.InvalidWalletFormatError('missing iv field');
    }

    if (!walletObj.seedencrypted) {
      throw new common.errors.InvalidWalletFormatError('missing seedEncrypted field');
    }

    let pswdHash = common.hash.doubleSha256(options.password);
    if (walletObj.passwordhash !== common.hash.sha256Hex(pswdHash)) {
      throw new common.errors.WrongPasswordError();
    }

    let masterKey = aes.decrypt(common.hash.cryptoHexStringParse(walletObj.masterkey), pswdHash, walletObj.iv);
    let seed = aes.decrypt(common.hash.cryptoHexStringParse(walletObj.seedencrypted), masterKey, walletObj.iv);

    return new Wallet(Object.assign({}, options, {
      seed,
      masterKey,
      iv: walletObj.iv,
    }));
  }

  /**
   * Return the wallet object to be serialized by JSON.
   */
  toJSON(): {} {
    return {
      Version: this.version,
      PasswordHash: this.passwordHash,
      MasterKey: this.masterKey,
      IV: this.iv,
      SeedEncrypted: this.seedEncrypted,
      Address: this.address,
      ProgramHash: this.programHash,
      ContractData: this.contractData,
    }
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

  /**
   * Verify whether the password is the correct password of this wallet.
   */
  verifyPassword(password: string): boolean {
    let pswdHash = common.hash.doubleSha256(password);
    return this.passwordHash === common.hash.sha256Hex(pswdHash);
  }

  /**
   * Get latest block height and hash.
   * @param {Object} [options={}] - Get nonce options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */
  static getLatestBlock(options: { rpcServerAddr: string } = {}): Promise<{ height: number, hash: string }> {
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
  static getRegistrant(name: string, options: { rpcServerAddr: string } = {}): Promise<{ registrant: string, expiresAt: number }> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getRegistrant(name, options);
  }

  /**
   * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */
  getRegistrant(name: string): Promise<{ registrant: string, expiresAt: number }> {
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
    return Wallet.getSubscribers(topic, Object.assign({}, this.options, options));
  }

  /**
   * Get subscribers count of a topic (not including txPool).
   */
  static getSubscribersCount(topic: string, options: { rpcServerAddr: string } = {}): Promise<number> {
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
  static getBalance(address: string, options: { rpcServerAddr: string } = {}): Promise<common.Amount> {
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
  static getNonce(address: string, options: { rpcServerAddr: string, txPool: boolean } = {}): Promise<number> {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getNonce(address, options);
  }

  /**
   * Same as [Wallet.getNonce](#walletgetnonce), but using this wallet's
   * rpcServerAddr as rpcServerAddr. If address is not given, this wallet's
   * address will be used.
   */
  getNonce(address: ?string, options: { txPool: boolean } = {}): Promise<number> {
    options = common.util.assignDefined({}, this.options, options);
    return Wallet.getNonce(address || this.address, options);
  }

  /**
   * Send a transaction to RPC server.
   * @param {Object} [options={}] - Send transaction options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */
  static sendTransaction(txn: common.pb.transaction.Transaction, options: { rpcServerAddr: string } = {}): Promise<string> {
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
  transferTo(toAddress: string, amount: number | string | common.Amount, options: TransactionOptions = {}): Promise<TxnOrHash> {
    return common.rpc.transferTo.call(this, toAddress, amount, options);
  }

  /**
   * Register a name for this wallet's public key at the cost of 10 NKN. The
   * name will be valid for 1,576,800 blocks (around 1 year). Register name
   * currently owned by this wallet will extend the duration of the name to
   * current block height + 1,576,800. Registration will fail if the name is
   * currently owned by another account.
   */
  registerName(name: string, options: TransactionOptions = {}): Promise<TxnOrHash> {
    return common.rpc.registerName.call(this, name, options);
  }

  /**
   * Transfer a name owned by this wallet to another public key. Does not change
   * the expiration of the name.
   */
  transferName(name: string, recipient: string, options: TransactionOptions = {}): Promise<TxnOrHash> {
    return common.rpc.transferName.call(this, name, recipient, options);
  }

  /**
   * Delete a name owned by this wallet.
   */
  deleteName(name: string, options: TransactionOptions = {}): Promise<TxnOrHash> {
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
  subscribe(topic: string, duration: number, identifier: ?string = '', meta: ?string = '', options: TransactionOptions = {}): Promise<TxnOrHash> {
    return common.rpc.subscribe.call(this, topic, duration, identifier, meta, options);
  }

  /**
   * Unsubscribe from a topic for an identifier. Client using the same key pair
   * and identifier will no longer receive messages from this topic.
   * @param {string} identifier - Client identifier.
   */
  unsubscribe(topic: string, identifier: string = '', options: TransactionOptions = {}): Promise<TxnOrHash> {
    return common.rpc.unsubscribe.call(this, topic, identifier, options);
  }

  /**
   * Create or update a NanoPay channel. NanoPay transaction does not have
   * nonce and will not be sent until you call `sendTransaction` explicitly.
   * @param {number} expiration - NanoPay expiration height.
   * @param {number} id - NanoPay id, should be unique for (this.address, toAddress) pair.
   */
  async createOrUpdateNanoPay(toAddress: string, amount: number | string | common.Amount, expiration: number, id: number, options: TransactionOptions = {}): Promise<common.pb.transaction.Transaction> {
    if(!address.verifyAddress(toAddress)) {
      throw new common.errors.InvalidAddressError('invalid recipient address');
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

  createTransaction(pld: common.pb.transaction.Payload, nonce: number, options: CreateTransactionOptions = {}): Promise<common.pb.transaction.Transaction> {
    return transaction.newTransaction(this.account, pld, nonce, options.fee, options.attrs);
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

type WalletJson = {
  Version: number,
  PasswordHash: string,
  MasterKey: string,
  IV: string,
  SeedEncrypted: string,
  Address?: string,
  ProgramHash?: string,
  ContractData?: string,
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
 * @property {number} [nonce] - Transaction nonce, will get from RPC node if not provided.
 */
type TransactionOptions = CreateTransactionOptions & { nonce: number };

/**
 * Transaction hash if `options.buildOnly=false`, otherwise the transaction object.
 */
type TxnOrHash = string|common.pb.transaction.Transaction;
