'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.publicKeyLength = exports.signatureLength = void 0;

var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

var _ed2curve = _interopRequireDefault(require("ed2curve"));

var _webworkify = _interopRequireDefault(require("webworkify"));

var common = _interopRequireWildcard(require("../common"));

var errors = _interopRequireWildcard(require("./errors"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const signatureLength = _tweetnacl.default.sign.signatureLength;
exports.signatureLength = signatureLength;
const publicKeyLength = _tweetnacl.default.box.publicKeyLength;
exports.publicKeyLength = publicKeyLength;

class Key {
  constructor(seed, options = {}) {
    _defineProperty(this, "key", void 0);

    _defineProperty(this, "seed", void 0);

    _defineProperty(this, "publicKey", void 0);

    _defineProperty(this, "curveSecretKey", void 0);

    _defineProperty(this, "sharedKeyCache", void 0);

    _defineProperty(this, "useWorker", void 0);

    _defineProperty(this, "worker", void 0);

    _defineProperty(this, "workerMsgID", void 0);

    _defineProperty(this, "workerMsgCache", void 0);

    if (seed) {
      try {
        seed = common.util.hexToBytes(seed);
      } catch (e) {
        throw new errors.InvalidArgumentError('seed is not a valid hex string');
      }
    } else {
      seed = common.util.randomBytes(_tweetnacl.default.sign.seedLength);
    }

    this.key = _tweetnacl.default.sign.keyPair.fromSeed(seed);
    this.publicKey = common.util.bytesToHex(this.key.publicKey);
    this.seed = common.util.bytesToHex(seed);
    this.curveSecretKey = _ed2curve.default.convertSecretKey(this.key.secretKey);
    this.sharedKeyCache = new Map();
    this.useWorker = this._shouldUseWorker(options.worker);
    this.worker = null;
    this.workerMsgID = 0;
    this.workerMsgCache = new Map();

    if (this.useWorker) {
      try {
        this.worker = (0, _webworkify.default)(require('./worker.js'));

        this.worker.onmessage = e => {
          if (e.data.id !== undefined && this.workerMsgCache.has(e.data.id)) {
            let msgPromise = this.workerMsgCache.get(e.data.id);

            if (e.data.error) {
              msgPromise.reject(e.data.error);
            } else {
              msgPromise.resolve(e.data.result);
            }

            this.workerMsgCache.delete(e.data.id);
          }
        };

        this.worker.postMessage({
          action: 'setSeed',
          seed: this.seed
        });
      } catch (e) {
        console.warn('Launch web worker failed:', e);
        this.useWorker = false;
      }
    }
  }

  _shouldUseWorker(useWorker) {
    if (!useWorker) {
      return false;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    if (!window.Worker) {
      return false;
    }

    return true;
  }

  _sendToWorker(data) {
    return new Promise((resolve, reject) => {
      let id = this.workerMsgID;
      this.workerMsgID++;
      this.workerMsgCache.set(id, {
        resolve,
        reject
      });
      this.worker.postMessage(Object.assign({
        id
      }, data));
    });
  }

  _computeSharedKey(otherPubkey) {
    let otherCurvePubkey = _ed2curve.default.convertPublicKey(common.util.hexToBytes(otherPubkey));

    return _tweetnacl.default.box.before(otherCurvePubkey, this.curveSecretKey);
  }

  async computeSharedKey(otherPubkey) {
    if (this.useWorker) {
      try {
        return await this._sendToWorker({
          action: 'computeSharedKey',
          otherPubkey
        });
      } catch (e) {
        console.warn('worker computeSharedKey failed, fallback to main thread:', e);
      }
    }

    return this._computeSharedKey(otherPubkey);
  }

  async getOrComputeSharedKey(otherPubkey) {
    let sharedKey = this.sharedKeyCache.get(otherPubkey);

    if (!sharedKey) {
      sharedKey = await this.computeSharedKey(otherPubkey);
      this.sharedKeyCache.set(otherPubkey, sharedKey);
    }

    return sharedKey;
  }

  async encrypt(message, destPubkey, options = {}) {
    let sharedKey = await this.getOrComputeSharedKey(destPubkey);
    let nonce = options.nonce || common.util.randomBytes(_tweetnacl.default.box.nonceLength);
    return {
      message: _tweetnacl.default.box.after(message, nonce, sharedKey),
      nonce: nonce
    };
  }

  async decrypt(encryptedMessage, nonce, srcPubkey, options = {}) {
    let sharedKey = await this.getOrComputeSharedKey(srcPubkey);
    return _tweetnacl.default.box.open.after(encryptedMessage, nonce, sharedKey);
  }

  _sign(message) {
    let sig = _tweetnacl.default.sign.detached(Buffer.from(message, 'hex'), this.key.secretKey);

    return common.util.paddingSignature(common.util.bytesToHex(sig), signatureLength);
  }

  async sign(message) {
    if (this.useWorker) {
      try {
        return await this._sendToWorker({
          action: 'sign',
          message
        });
      } catch (e) {
        console.warn('worker sign failed, fallback to main thread:', e);
      }
    }

    return await this._sign(message);
  }

}

exports.default = Key;