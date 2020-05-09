'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _scryptJs = _interopRequireDefault(require("scrypt-js"));

var _account = _interopRequireDefault(require("./account"));

var address = _interopRequireWildcard(require("./address"));

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
 * @param {boolean|function} [options.worker=false] - Whether to use web workers (if available) to compute signatures. Can also be a function that returns web worker. Typically you only need to set it to a function if you import nkn-sdk as a module and are NOT using browserify or webpack worker-loader to bundle js file. The worker file is located at `lib/worker/webpack.worker.js`.
 */
class Wallet {
  /**
   * Wallet address, which is a string starts with 'NKN'.
   */

  /**
   * Wallet version.
   */
  constructor(options = {}) {
    _defineProperty(this, "options", void 0);

    _defineProperty(this, "account", void 0);

    _defineProperty(this, "iv", void 0);

    _defineProperty(this, "masterKey", void 0);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "programHash", void 0);

    _defineProperty(this, "seedEncrypted", void 0);

    _defineProperty(this, "scryptParams", void 0);

    _defineProperty(this, "version", void 0);

    options = common.util.assignDefined({}, consts.defaultOptions, options);
    this.version = Wallet.version;

    switch (this.version) {
      case 2:
        this.scryptParams = common.util.assignDefined({}, consts.scryptParams, options.scrypt);
        this.scryptParams.salt = this.scryptParams.salt || common.util.randomBytesHex(this.scryptParams.saltLen);
        break;
    }

    let passwordKey;

    if (options.passwordKey && options.passwordKey[this.version]) {
      passwordKey = options.passwordKey[this.version];
    } else {
      passwordKey = Wallet._computePasswordKey({
        version: this.version,
        password: options.password,
        scrypt: this.scryptParams,
        async: false
      });
    }

    let iv = options.iv || common.util.randomBytesHex(16);
    let masterKey = options.masterKey || common.util.randomBytesHex(32);
    this.options = options;
    this.account = new _account.default(options.seed, {
      worker: options.worker
    });
    this.iv = iv;
    this.masterKey = common.aes.encrypt(masterKey, passwordKey, iv);
    this.address = this.account.address;
    this.programHash = this.account.programHash;
    this.seedEncrypted = common.aes.encrypt(this.account.getSeed(), masterKey, iv);
    delete options.seed;
    delete options.password;
    delete options.iv;
    delete options.masterKey;
  }

  static _computePasswordKey(options) {
    // convert all keys to lowercase to be case insensitive
    options = common.util.toLowerKeys(options);

    if (!options.version) {
      throw new common.errors.InvalidArgumentError('missing version field');
    }

    if (!options.password) {
      throw new common.errors.InvalidArgumentError('missing password field');
    }

    let passwordKey;

    switch (options.version) {
      case 1:
        return common.hash.doubleSha256(options.password);

      case 2:
        if (!options.scrypt) {
          throw new common.errors.InvalidArgumentError('missing scrypt field');
        }

        if (!options.scrypt.salt || !options.scrypt.n || !options.scrypt.r || !options.scrypt.p) {
          throw new common.errors.InvalidArgumentError('incomplete scrypt parameters');
        }

        if (options.async) {
          return _scryptJs.default.scrypt(common.util.utf8ToBytes(options.password), common.util.hexToBytes(options.scrypt.salt), options.scrypt.n, options.scrypt.r, options.scrypt.p, 32).then(common.util.bytesToHex);
        } else {
          return common.util.bytesToHex(_scryptJs.default.syncScrypt(common.util.utf8ToBytes(options.password), common.util.hexToBytes(options.scrypt.salt), options.scrypt.n, options.scrypt.r, options.scrypt.p, 32));
        }

      default:
        throw new common.errors.InvalidWalletFormatError('unsupported wallet verison ' + options.version);
    }
  }

  static _decryptWallet(walletObj, options) {
    options.iv = walletObj.iv;
    options.masterKey = common.aes.decrypt(walletObj.masterkey, options.passwordKey, options.iv);
    options.seed = common.aes.decrypt(walletObj.seedencrypted, options.masterKey, options.iv);
    options.passwordKey = {
      [walletObj.version]: options.passwordKey
    };

    switch (walletObj.version) {
      case 2:
        options.scrypt = {
          salt: walletObj.scrypt.salt,
          N: walletObj.scrypt.n,
          r: walletObj.scrypt.r,
          p: walletObj.scrypt.p
        };
    }

    let account = new _account.default(options.seed, {
      worker: false
    });

    if (account.address !== walletObj.address) {
      throw new common.errors.WrongPasswordError();
    }

    return new Wallet(options);
  }
  /**
   * Recover wallet from JSON string and password.
   * @param {string|Object} walletJson - Wallet JSON string or object.
   * @param {Object} options - Wallet options.
   * @param {string} options.password - Wallet password.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address.
   * @param {bool} [options.async=false] - If true, return value will be a promise that resolves with the wallet object, and more importantly, the underlying scrypt computation will not block eventloop.
   */


  static fromJSON(walletJson, options = {}) {
    let walletObj;

    if (typeof walletJson === 'string') {
      walletObj = JSON.parse(walletJson);
    } else {
      walletObj = walletJson;
    } // convert all keys to lowercase to be case insensitive


    walletObj = common.util.toLowerKeys(walletObj);

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

    if (!walletObj.address) {
      throw new common.errors.InvalidWalletFormatError('missing address field');
    }

    if (options.async) {
      return Wallet._computePasswordKey(Object.assign({}, walletObj, {
        password: options.password,
        async: true
      })).then(passwordKey => {
        return Wallet._decryptWallet(walletObj, Object.assign({}, options, {
          passwordKey
        }));
      });
    } else {
      let passwordKey = Wallet._computePasswordKey(Object.assign({}, walletObj, {
        password: options.password,
        async: false
      }));

      return Wallet._decryptWallet(walletObj, Object.assign({}, options, {
        passwordKey
      }));
    }
  }
  /**
   * Return the wallet object to be serialized by JSON.
   */


  toJSON() {
    let walletJson = {
      Version: this.version,
      MasterKey: this.masterKey,
      IV: this.iv,
      SeedEncrypted: this.seedEncrypted,
      Address: this.address
    };

    if (this.scryptParams) {
      walletJson.Scrypt = {
        Salt: this.scryptParams.salt,
        N: this.scryptParams.N,
        R: this.scryptParams.r,
        P: this.scryptParams.p
      };
    }

    return walletJson;
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


  async verifyPassword(password) {
    let passwordKey = await Wallet._computePasswordKey({
      version: this.version,
      password,
      scrypt: this.scryptParams,
      async: true
    });
    let masterKey = common.aes.decrypt(this.masterKey, passwordKey, this.iv);
    let seed = common.aes.decrypt(this.seedEncrypted, masterKey, this.iv);
    let account = new _account.default(seed, {
      worker: false
    });
    return account.address === this.address;
  }
  /**
   * Get latest block height and hash.
   * @param {Object} [options={}] - Get nonce options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */


  static getLatestBlock(options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getLatestBlock(options);
  }
  /**
   * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */


  getLatestBlock() {
    return Wallet.getLatestBlock(this.options);
  }
  /**
   * Get the registrant's public key and expiration block height of a name. If
   * name is not registered, `registrant` will be '' and `expiresAt` will be 0.
   */


  static getRegistrant(name, options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getRegistrant(name, options);
  }
  /**
   * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */


  getRegistrant(name) {
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


  static getSubscribers(topic, options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getSubscribers(topic, options);
  }
  /**
   * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */


  getSubscribers(topic, options = {}) {
    return Wallet.getSubscribers(topic, Object.assign({}, this.options, options));
  }
  /**
   * Get subscribers count of a topic (not including txPool).
   */


  static getSubscribersCount(topic, options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getSubscribersCount(topic, options);
  }
  /**
   * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
   * this wallet's rpcServerAddr as rpcServerAddr.
   */


  getSubscribersCount(topic) {
    return Wallet.getSubscribersCount(topic, this.options);
  }
  /**
   * Get the subscription details of a subscriber in a topic.
   */


  static getSubscription(topic, subscriber, options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getSubscription(topic, subscriber, options);
  }
  /**
   * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */


  getSubscription(topic, subscriber) {
    return Wallet.getSubscription(topic, subscriber, this.options);
  }
  /**
   * Get the balance of a NKN wallet address.
   * @param {Object} [options={}] - Get nonce options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */


  static getBalance(address, options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getBalance(address, options);
  }
  /**
   * Same as [Wallet.getBalance](#walletgetbalance), but using this wallet's
   * rpcServerAddr as rpcServerAddr. If address is not given, this wallet's
   * address will be used.
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


  static getNonce(address, options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.getNonce(address, options);
  }
  /**
   * Same as [Wallet.getNonce](#walletgetnonce), but using this wallet's
   * rpcServerAddr as rpcServerAddr. If address is not given, this wallet's
   * address will be used.
   */


  getNonce(address, options = {}) {
    options = common.util.assignDefined({}, this.options, options);
    return Wallet.getNonce(address || this.address, options);
  }
  /**
   * Send a transaction to RPC server.
   * @param {Object} [options={}] - Send transaction options.
   * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
   */


  static sendTransaction(txn, options = {}) {
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    return common.rpc.sendTransaction(txn, options);
  }
  /**
   * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
   * wallet's rpcServerAddr as rpcServerAddr.
   */


  sendTransaction(txn) {
    return Wallet.sendTransaction(txn, this.options);
  }
  /**
   * Transfer token from this wallet to another wallet address.
   */


  transferTo(toAddress, amount, options = {}) {
    return common.rpc.transferTo.call(this, toAddress, amount, options);
  }
  /**
   * Register a name for this wallet's public key at the cost of 10 NKN. The
   * name will be valid for 1,576,800 blocks (around 1 year). Register name
   * currently owned by this wallet will extend the duration of the name to
   * current block height + 1,576,800. Registration will fail if the name is
   * currently owned by another account.
   */


  registerName(name, options = {}) {
    return common.rpc.registerName.call(this, name, options);
  }
  /**
   * Transfer a name owned by this wallet to another public key. Does not change
   * the expiration of the name.
   */


  transferName(name, recipient, options = {}) {
    return common.rpc.transferName.call(this, name, recipient, options);
  }
  /**
   * Delete a name owned by this wallet.
   */


  deleteName(name, options = {}) {
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


  subscribe(topic, duration, identifier = '', meta = '', options = {}) {
    return common.rpc.subscribe.call(this, topic, duration, identifier, meta, options);
  }
  /**
   * Unsubscribe from a topic for an identifier. Client using the same key pair
   * and identifier will no longer receive messages from this topic.
   * @param {string} identifier - Client identifier.
   */


  unsubscribe(topic, identifier = '', options = {}) {
    return common.rpc.unsubscribe.call(this, topic, identifier, options);
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
    return await this.createTransaction(pld, 0, options);
  }

  createTransaction(pld, nonce, options = {}) {
    return transaction.newTransaction(this.account, pld, nonce, options.fee, options.attrs);
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

_defineProperty(Wallet, "version", 2);

_defineProperty(Wallet, "minCompatibleVersion", 1);

_defineProperty(Wallet, "maxCompatibleVersion", 2);