// @flow
'use strict';

import Account from './account';
import Amount from './amount';
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
 */
export default class Wallet {
  options: { rpcServerAddr: string };
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
  }) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);

    let account = new Account(options.seed);
    let pswdHash = common.hash.doubleSha256(options.password);
    let iv = options.iv || common.util.randomBytesHex(16);
    let masterKey = options.masterKey || common.util.randomBytesHex(32);
    masterKey = common.hash.cryptoHexStringParse(masterKey);
    let seed = common.hash.cryptoHexStringParse(account.getSeed());

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
  static fromJSON(walletJson: string | WalletJson, password: string) {
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

    let pswdHash = common.hash.doubleSha256(password);
    if (walletObj.passwordhash !== common.hash.sha256Hex(pswdHash)) {
      throw new common.errors.WrongPasswordError();
    }

    let masterKey = aes.decrypt(common.hash.cryptoHexStringParse(walletObj.masterkey), pswdHash, walletObj.iv);
    let seed = aes.decrypt(common.hash.cryptoHexStringParse(walletObj.seedencrypted), masterKey, walletObj.iv);

    return new Wallet({
      seed,
      password,
      masterKey,
      iv: walletObj.iv,
    });
  }

  /**
   * Serialize wallet to JSON string format.
   */
  toJSON(): string {
    return JSON.stringify({
      Version: this.version,
      PasswordHash: this.passwordHash,
      MasterKey: this.masterKey,
      IV: this.iv,
      SeedEncrypted: this.seedEncrypted,
      Address: this.address,
      ProgramHash: this.programHash,
      ContractData: this.contractData,
    })
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
   * Get the balance of a NKN wallet address.
   */
  static async getBalance(address: string, options: { rpcServerAddr: string } = {}): Promise<Amount> {
    if (!address) {
      throw new common.errors.InvalidArgumentError('address is empty')
    }
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let data = await common.rpc.getBalanceByAddr(options.rpcServerAddr, { address });
    if (!data.amount) {
      throw new common.errors.InvalidResponseError('amount is empty');
    }
    return new Amount(data.amount);
  }

  /**
   * Get the balance of a NKN wallet address. If address is not given, will use
   * the address of this wallet.
   */
  getBalance(address: ?string): Promise<Amount> {
    return Wallet.getBalance(address || this.address, this.options);
  }

  /**
   * Get the next nonce of a NKN wallet address.
   * @param {Object} [options={}] - Get nonce options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   * @param {boolean} [options.txPool=true] - Whether to consider transactions in txPool. If true, will return the next nonce after last nonce in txPool, otherwise will return the next nonce after last nonce in ledger.
   */
  static async getNonce(address: string, options: { rpcServerAddr: string, txPool: boolean } = {}): Promise<number> {
    if (!address) {
      throw new common.errors.InvalidArgumentError('address is empty')
    }
    options = common.util.assignDefined({ txPool: true }, consts.defaultOptions, options);
    let data = await common.rpc.getNonceByAddr(options.rpcServerAddr, { address });
    if (typeof data.nonce !== 'number') {
      throw new common.errors.InvalidResponseError('nonce is not a number');
    }
    let nonce = data.nonce;
    if (options.txPool && data.nonceInTxPool && data.nonceInTxPool > nonce) {
      nonce = data.nonceInTxPool;
    }
    return nonce;
  }

  /**
   * Get the next nonce of a NKN wallet address. If address is not given, will use
   * the address of this wallet.
   * @param {Object} [options={}] - Get nonce options.
   * @param {boolean} [options.txPool=true] - Whether to consider transactions in txPool. If true, will return the next nonce after last nonce in txPool, otherwise will return the next nonce after last nonce in ledger.
   */
  getNonce(address: ?string, options: { txPool: boolean } = {}): Promise<number> {
    options = common.util.assignDefined({}, this.options, options);
    return Wallet.getNonce(address || this.address, options);
  }

  /**
   * Transfer token from this wallet to another wallet address.
   */
  async transferTo(toAddress: string, amount: number | string | Amount, options: TransactionOptions = {}): Promise<TxnOrHash> {
    if(!address.verifyAddress(toAddress)) {
      throw new common.errors.InvalidAddressError('invalid recipient address')
    }

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let nonce = options.nonce || await this.getNonce();

    let pld = transaction.newTransferPayload(
      this.programHash,
      address.addressStringToProgramHash(toAddress),
      amount,
    );

    return await this.createTransaction(pld, nonce, options);
  }

  /**
   * Register name for this wallet.
   */
  async registerName(name: string, options: TransactionOptions = {}): Promise<TxnOrHash> {
    let nonce = options.nonce || await this.getNonce();
    let pld = transaction.newRegisterNamePayload(this.getPublicKey(), name);
    return await this.createTransaction(pld, nonce, options);
  }

  /**
   * Delete name for this wallet.
   */
  async deleteName(name: string, options: TransactionOptions = {}): Promise<TxnOrHash> {
    let nonce = options.nonce || await this.getNonce();
    let pld = transaction.newDeleteNamePayload(this.getPublicKey(), name);
    return await this.createTransaction(pld, nonce, options);
  }

  /**
   * Subscribe to a topic with an identifier for a number of blocks. Client
   * using the same key pair and identifier will be able to receive messages
   * from this topic.
   * @param {number} duration - Duration in unit of blocks.
   * @param {string} identifier - Client identifier.
   * @param {string} meta - Metadata of this subscription.
   */
  async subscribe(topic: string, duration: number, identifier: ?string = '', meta: ?string = '', options: TransactionOptions = {}): Promise<TxnOrHash> {
    let nonce = options.nonce || await this.getNonce();
    let pld = transaction.newSubscribePayload(this.getPublicKey(), identifier, topic, duration, meta);
    return await this.createTransaction(pld, nonce, options);
  }

  /**
   * Unsubscribe from a topic for an identifier. Client using the same key pair
   * and identifier will no longer receive messages from this topic.
   * @param {string} identifier - Client identifier.
   */
  async unsubscribe(topic: string, identifier: string = '', options: TransactionOptions = {}): Promise<TxnOrHash> {
    let nonce = options.nonce || await this.getNonce();
    let pld = transaction.newUnsubscribePayload(this.getPublicKey(), identifier, topic);
    return await this.createTransaction(pld, nonce, options);
  }

  /**
   * Create or update a NanoPay channel. NanoPay transaction does not have
   * nonce and will not be sent until you call `sendTransaction` explicitly.
   * @param {number} expiration - NanoPay expiration height.
   * @param {number} id - NanoPay id, should be unique for (this.address, toAddress) pair.
   */
  async createOrUpdateNanoPay(toAddress: string, amount: number | string | Amount, expiration: number, id: number, options: TransactionOptions = {}): Promise<common.pb.transaction.Transaction> {
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

    return await this.createTransaction(pld, 0, common.util.assignDefined({}, options, { buildOnly: true }));
  }

  async createTransaction(pld: common.pb.transaction.Payload, nonce: number, options: CreateTransactionOptions = {}): Promise<string|common.pb.transaction.Transaction> {
    let txn = await transaction.newTransaction(this.account, pld, nonce, options.fee, options.attrs);
    if (options.buildOnly) {
      return txn;
    }
    return await this.sendTransaction(txn);
  }

  /**
   * Send a transaction to RPC server.
   * @param {Object} [options={}] - Send transaction options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */
  static sendTransaction(txn: common.pb.transaction.Transaction, options: { rpcServerAddr: string } = {}): Promise<string> {
    options = common.util.assignDefined({ txPool: true }, consts.defaultOptions, options);
    return common.rpc.sendRawTransaction(options.rpcServerAddr, { tx: common.util.bytesToHex(txn.serializeBinary()) });
  }

  /**
   * Send a transaction to RPC server.
   */
  sendTransaction(txn: common.pb.transaction.Transaction): Promise<string> {
    return Wallet.sendTransaction(txn, this.options);
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
  fee: number | string | Amount | null | void,
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
