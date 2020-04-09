'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webworkify = _interopRequireDefault(require("webworkify"));

var crypto = _interopRequireWildcard(require("./crypto"));

var errors = _interopRequireWildcard(require("./errors"));

var util = _interopRequireWildcard(require("./util"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Key {
  constructor(seed, options = {}) {
    _defineProperty(this, "seed", void 0);

    _defineProperty(this, "publicKey", void 0);

    _defineProperty(this, "privateKey", void 0);

    _defineProperty(this, "curvePrivateKey", void 0);

    _defineProperty(this, "sharedKeyCache", void 0);

    _defineProperty(this, "useWorker", void 0);

    _defineProperty(this, "worker", void 0);

    _defineProperty(this, "workerMsgID", void 0);

    _defineProperty(this, "workerMsgCache", void 0);

    if (seed) {
      try {
        seed = util.hexToBytes(seed);
      } catch (e) {
        throw new errors.InvalidArgumentError('seed is not a valid hex string');
      }
    } else {
      seed = util.randomBytes(crypto.seedLength);
    }

    let key = crypto.keyPair(seed);
    this.publicKey = util.bytesToHex(key.publicKey);
    this.privateKey = key.privateKey;
    this.curvePrivateKey = key.curvePrivateKey;
    this.seed = util.bytesToHex(seed);
    this.sharedKeyCache = new Map();
    this.useWorker = this._shouldUseWorker(options.worker);
    this.worker = null;
    this.workerMsgID = 0;
    this.workerMsgCache = new Map();

    if (this.useWorker) {
      (async () => {
        try {
          if (typeof options.worker === 'function') {
            this.worker = await options.worker();
          } else {
            try {
              this.worker = (0, _webworkify.default)(require('../worker/worker.js'));
            } catch (e) {
              try {
                let Worker = require('../worker/webpack.worker.js');

                this.worker = new Worker();
              } catch (e) {
                throw 'neither browserify nor webpack worker-loader is detected';
              }
            }
          }

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

          await this._sendToWorker({
            action: 'setSeed',
            seed: this.seed
          });
        } catch (e) {
          console.warn('Launch web worker failed:', e);
          this.useWorker = false;
        }
      })();
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

    return await crypto.computeSharedKey(this.curvePrivateKey, otherPubkey);
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
    sharedKey = Buffer.from(sharedKey, 'hex');
    let nonce = options.nonce || util.randomBytes(crypto.nonceLength);
    return {
      message: await crypto.encryptSymmetric(message, nonce, sharedKey),
      nonce: nonce
    };
  }

  async decrypt(message, nonce, srcPubkey, options = {}) {
    let sharedKey = await this.getOrComputeSharedKey(srcPubkey);
    sharedKey = Buffer.from(sharedKey, 'hex');
    return await crypto.decryptSymmetric(message, nonce, sharedKey);
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

    return await crypto.sign(this.privateKey, message);
  }

}

exports.default = Key;