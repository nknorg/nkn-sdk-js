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

class Wallet {
  constructor(options = {}) {
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

  static fromJSON(walletJson, password) {
    if (typeof walletJson === 'string') {
      walletJson = JSON.parse(walletJson);
    } // convert all keys to lowercase


    walletJson = Object.keys(walletJson).reduce((merged, key) => Object.assign(merged, {
      [key.toLowerCase()]: walletJson[key]
    }), {});

    if (typeof walletJson.version !== 'number' || walletJson.version < Wallet.minCompatibleVersion || walletJson.version > Wallet.maxCompatibleVersion) {
      throw new common.errors.InvalidWalletVersionError('invalid wallet version ' + walletJson.version + ', should be between ' + wallet.minCompatibleVersion + ' and ' + wallet.maxCompatibleVersion);
    }

    if (!walletJson.masterkey) {
      throw new common.errors.InvalidWalletFormatError('missing masterKey field');
    }

    if (!walletJson.iv) {
      throw new common.errors.InvalidWalletFormatError('missing iv field');
    }

    if (!walletJson.seedencrypted) {
      throw new common.errors.InvalidWalletFormatError('missing seedEncrypted field');
    }

    let pswdHash = common.hash.doubleSha256(password);

    if (walletJson.passwordhash !== common.hash.sha256Hex(pswdHash)) {
      throw new common.errors.WrongPasswordError();
    }

    let masterKey = aes.decrypt(common.hash.cryptoHexStringParse(walletJson.masterkey), pswdHash, walletJson.iv);
    let seed = aes.decrypt(common.hash.cryptoHexStringParse(walletJson.seedencrypted), masterKey, walletJson.iv);
    return new Wallet({
      seed,
      password,
      masterKey,
      iv: walletJson.iv
    });
  }

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

  getPublicKey() {
    return this.account.getPublicKey();
  }

  getSeed() {
    return this.account.getSeed();
  }

  static verifyAddress(addr) {
    return address.verifyAddress(addr);
  }

  verifyPassword(password) {
    let pswdHash = common.hash.doubleSha256(password);
    return this.passwordHash === common.hash.sha256Hex(pswdHash);
  }

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

  getBalance(address) {
    return Wallet.getBalance(address || this.address, this.options);
  }

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

  getNonce(address, options = {}) {
    options = common.util.assignDefined({}, this.options, options);
    return Wallet.getNonce(address || this.address, options);
  }

  async transferTo(toAddress, amount, options = {}) {
    if (!address.verifyAddress(toAddress)) {
      throw new common.errors.InvalidAddressError('invalid recipient address');
    }

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newTransferPayload(this.programHash, address.addressStringToProgramHash(toAddress), amount);
    return await this.createTransaction(pld, nonce, options);
  }

  async registerName(name, options = {}) {
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newRegisterNamePayload(this.getPublicKey(), name);
    return await this.createTransaction(pld, nonce, options);
  }

  async deleteName(name, options = {}) {
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newDeleteNamePayload(this.getPublicKey(), name);
    return await this.createTransaction(pld, nonce, options);
  }

  async subscribe(topic, duration, identifier = '', meta = '', options = {}) {
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newSubscribePayload(this.getPublicKey(), identifier, topic, duration, meta);
    return await this.createTransaction(pld, nonce, options);
  }

  async unsubscribe(topic, identifier = '', options = {}) {
    let nonce = options.nonce || (await this.getNonce());
    let pld = transaction.newUnsubscribePayload(this.getPublicKey(), identifier, topic);
    return await this.createTransaction(pld, nonce, options);
  }

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
    let txn = await transaction.newTransaction(this.account, pld, nonce, options.fee || 0, options.attrs || '');

    if (options.buildOnly) {
      return txn;
    }

    return await this.sendTransaction(txn);
  }

  static sendTransaction(txn, options = {}) {
    options = common.util.assignDefined({
      txPool: true
    }, consts.defaultOptions, options);
    return common.rpc.sendRawTransaction(options.rpcServerAddr, {
      tx: common.util.bytesToHex(txn.serializeBinary())
    });
  }

  sendTransaction(txn) {
    return Wallet.sendTransaction(txn, this.options);
  }

  static publicKeyToAddress(publicKey) {
    signatureRedeem = address.publicKeyToSignatureRedeem(publicKey);
    programHash = address.hexStringToProgramHash(signatureRedeem);
    return address.programHashStringToAddress(programHash);
  }

}

exports.default = Wallet;

_defineProperty(Wallet, "version", 1);

_defineProperty(Wallet, "minCompatibleVersion", 1);

_defineProperty(Wallet, "maxCompatibleVersion", 1);