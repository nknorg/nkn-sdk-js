'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _account = _interopRequireDefault(require("./account"));

var _amount = _interopRequireDefault(require("./amount"));

var address = _interopRequireWildcard(require("./address"));

var aes = _interopRequireWildcard(require("./aes"));

var common = _interopRequireWildcard(require("../common"));

var consts = _interopRequireWildcard(require("./consts"));

var transaction = _interopRequireWildcard(require("./transaction"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * NKN client that sends data to and receives data from other NKN clients.
 * @param {Object} options - Wallet options.
 * @param {string} [options.seed=undefined] - Secret seed (64 hex characters). If empty, a random seed will be used.
 * @param {string} options.password - Wallet password.
 * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address.
 * @param {string} [options.iv=undefined] - AES iv, typically you should use Wallet.fromJSON instead of this field.
 * @param {string} [options.masterKey=undefined] - AES master key, typically you should use Wallet.fromJSON instead of this field.
 */
class Wallet {
  /**
   * Wallet address, which is a string starts with 'NKN'.
   */

  /**
   * Wallet version.
   */
  constructor(options) {
    _defineProperty(this, "options", void 0);

    _defineProperty(this, "account", void 0);

    _defineProperty(this, "passwordHash", void 0);

    _defineProperty(this, "iv", void 0);

    _defineProperty(this, "masterKey", void 0);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "programHash", void 0);

    _defineProperty(this, "seedEncrypted", void 0);

    _defineProperty(this, "contractData", void 0);

    _defineProperty(this, "version", void 0);

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let account = new _account.default(options.seed);
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


  static fromJSON(walletJson, password) {
    let walletObj;

    if (typeof walletJson === 'string') {
      walletObj = JSON.parse(walletJson);
    } else {
      walletObj = walletJson;
    } // convert all keys to lowercase


    walletObj = Object.keys(walletObj).reduce((merged, key) => Object.assign(merged, {
      [key.toLowerCase()]: walletObj[key]
    }), {});

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
      iv: walletObj.iv
    });
  }
  /**
   * Serialize wallet to JSON string format.
   */


  toJSON() {
    return JSON.stringify({
      Version: this.version,
      PasswordHash: this.passwordHash,
      MasterKey: this.masterKey,
      IV: this.iv,
      SeedEncrypted: this.seedEncrypted,
      Address: this.address,
      ProgramHash: this.programHash,
      ContractData: this.contractData
    });
  }
  /**
   * Get the secret seed of the wallet.
   * @returns Secret seed as hex string.
   */


  getSeed() {
    return this.account.getSeed();
  }
  /**
   * Get the public key of the wallet.
   * @returns Public key as hex string.
   */


  getPublicKey() {
    return this.account.getPublicKey();
  }
  /**
   * Verify whether an address is a valid NKN wallet address.
   */


  static verifyAddress(addr) {
    return address.verifyAddress(addr);
  }
  /**
   * Verify whether the password is the correct password of this wallet.
   */


  verifyPassword(password) {
    let pswdHash = common.hash.doubleSha256(password);
    return this.passwordHash === common.hash.sha256Hex(pswdHash);
  }
  /**
   * Get the balance of a NKN wallet address.
   */


  static async getBalance(address, options = {}) {
    if (!address) {
      throw new common.errors.InvalidArgumentError('address is empty');
    }

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let data = await common.rpc.getBalanceByAddr(options.rpcServerAddr, {
      address
    });

    if (!data.amount) {
      throw new common.errors.InvalidResponseError('amount is empty');
    }

    return new _amount.default(data.amount);
  }
  /**
   * Get the balance of a NKN wallet address. If address is not given, will use
   * the address of this wallet.
   */


  getBalance(address) {
    return Wallet.getBalance(address || this.address, this.options);
  }
  /**
   * Get the next nonce of a NKN wallet address.
   * @param {Object} [options={}] - Get nonce options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   * @param {boolean} [options.txPool=true] - Whether to consider transactions in txPool. If true, will return the next nonce after last nonce in txPool, otherwise will return the next nonce after last nonce in ledger.
   */


  static async getNonce(address, options = {}) {
    if (!address) {
      throw new common.errors.InvalidArgumentError('address is empty');
    }

    options = common.util.assignDefined({
      txPool: true
    }, consts.defaultOptions, options);
    let data = await common.rpc.getNonceByAddr(options.rpcServerAddr, {
      address
    });

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


  getNonce(address, options = {}) {
    options = common.util.assignDefined({}, this.options, options);
    return Wallet.getNonce(address || this.address, options);
  }
  /**
   * Transfer token from this wallet to another wallet address.
   */


  async transferTo(toAddress, amount, options = {}) {
    if (!address.verifyAddress(toAddress)) {
      throw new common.errors.InvalidAddressError('invalid recipient address');
    }

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newTransferPayload(this.programHash, address.addressStringToProgramHash(toAddress), amount);
    return await this.createTransaction(pld, nonce, options);
  }
  /**
   * Register name for this wallet.
   */


  async registerName(name, options = {}) {
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newRegisterNamePayload(this.getPublicKey(), name);
    return await this.createTransaction(pld, nonce, options);
  }
  /**
   * Delete name for this wallet.
   */


  async deleteName(name, options = {}) {
    let nonce = options.nonce || (await this.getNonce());
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


  async subscribe(topic, duration, identifier = '', meta = '', options = {}) {
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newSubscribePayload(this.getPublicKey(), identifier, topic, duration, meta);
    return await this.createTransaction(pld, nonce, options);
  }
  /**
   * Unsubscribe from a topic for an identifier. Client using the same key pair
   * and identifier will no longer receive messages from this topic.
   * @param {string} identifier - Client identifier.
   */


  async unsubscribe(topic, identifier = '', options = {}) {
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newUnsubscribePayload(this.getPublicKey(), identifier, topic);
    return await this.createTransaction(pld, nonce, options);
  }
  /**
   * Create or update a NanoPay channel. NanoPay transaction does not have
   * nonce and will not be sent until you call `sendTransaction` explicitly.
   * @param {number} expiration - NanoPay expiration height.
   * @param {number} id - NanoPay id, should be unique for (this.address, toAddress) pair.
   */


  async createOrUpdateNanoPay(toAddress, amount, expiration, id, options = {}) {
    if (!address.verifyAddress(toAddress)) {
      throw new common.errors.InvalidAddressError('invalid recipient address');
    }

    if (!id) {
      id = common.util.randomUint64();
    }

    let pld = transaction.newNanoPayPayload(this.programHash, address.addressStringToProgramHash(toAddress), id, amount, expiration, expiration);
    return await this.createTransaction(pld, 0, common.util.assignDefined({}, options, {
      buildOnly: true
    }));
  }

  async createTransaction(pld, nonce, options = {}) {
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


  static sendTransaction(txn, options = {}) {
    options = common.util.assignDefined({
      txPool: true
    }, consts.defaultOptions, options);
    return common.rpc.sendRawTransaction(options.rpcServerAddr, {
      tx: common.util.bytesToHex(txn.serializeBinary())
    });
  }
  /**
   * Send a transaction to RPC server.
   */


  sendTransaction(txn) {
    return Wallet.sendTransaction(txn, this.options);
  }
  /**
   * Convert a NKN public key to NKN wallet address.
   */


  static publicKeyToAddress(publicKey) {
    let signatureRedeem = address.publicKeyToSignatureRedeem(publicKey);
    let programHash = address.hexStringToProgramHash(signatureRedeem);
    return address.programHashStringToAddress(programHash);
  }

}

exports.default = Wallet;

_defineProperty(Wallet, "version", 1);

_defineProperty(Wallet, "minCompatibleVersion", 1);

_defineProperty(Wallet, "maxCompatibleVersion", 1);