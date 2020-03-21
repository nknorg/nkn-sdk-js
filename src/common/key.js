'use strict';

import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';
import work from 'webworkify';

import * as crypto from './crypto';
import * as errors from './errors';
import * as util from './util';

export const publicKeyLength = nacl.box.publicKeyLength;

export default class Key {
  key;
  seed;
  publicKey;
  curveSecretKey;
  sharedKeyCache;
  useWorker;
  worker;
  workerMsgID;
  workerMsgCache;

  constructor(seed, options = {}) {
    if (seed) {
      try {
        seed = util.hexToBytes(seed);
      } catch (e) {
        throw new errors.InvalidArgumentError('seed is not a valid hex string');
      }
    } else {
      seed = util.randomBytes(nacl.sign.seedLength);
    }

    this.key = nacl.sign.keyPair.fromSeed(seed);
    this.publicKey = util.bytesToHex(this.key.publicKey);
    this.seed = util.bytesToHex(seed);
    this.curveSecretKey = ed2curve.convertSecretKey(this.key.secretKey);
    this.sharedKeyCache = new Map();
    this.useWorker = this._shouldUseWorker(options.worker);
    this.worker = null;
    this.workerMsgID = 0;
    this.workerMsgCache = new Map();

    if (this.useWorker) {
      (async () => {
        try {
          try {
            this.worker = work(require('../worker/worker.js'));
          } catch (e) {
            try {
              let Worker = require('../worker/webpack.worker.js');
              this.worker = new Worker();
            } catch (e) {
              throw 'neither browserify nor webpack worker-loader is detected'
            }
          }
          this.worker.onmessage = (e) => {
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
          await this._sendToWorker({ action: 'setSeed', seed: this.seed });
        } catch (e) {
          console.warn('Launch web worker failed:', e);
          this.useWorker = false;
        }
      })()
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
      this.workerMsgCache.set(id, { resolve, reject });
      this.worker.postMessage(Object.assign({ id }, data));
    });
  }

  async computeSharedKey(otherPubkey) {
    if (this.useWorker) {
      try {
        return await this._sendToWorker({ action: 'computeSharedKey', otherPubkey });
      } catch (e) {
        console.warn('worker computeSharedKey failed, fallback to main thread:', e);
      }
    }
    return crypto.computeSharedKey(this.curveSecretKey, otherPubkey);
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
    sharedKey = util.hexToBytes(sharedKey);
    let nonce = options.nonce || util.randomBytes(nacl.box.nonceLength);
    return {
      message: nacl.box.after(message, nonce, sharedKey),
      nonce: nonce,
    };
  }

  async decrypt(encryptedMessage, nonce, srcPubkey, options = {}) {
    let sharedKey = await this.getOrComputeSharedKey(srcPubkey);
    sharedKey = util.hexToBytes(sharedKey);
    return nacl.box.open.after(encryptedMessage, nonce, sharedKey);
  }

  async sign(message) {
    if (this.useWorker) {
      try {
        return await this._sendToWorker({ action: 'sign', message });
      } catch (e) {
        console.warn('worker sign failed, fallback to main thread:', e);
      }
    }
    return await crypto.sign(this.key.secretKey, message);
  }
}
