'use strict';

import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';
import work from 'webworkify';

import * as common from '../common';
import * as errors from './errors';

export const signatureLength = nacl.sign.signatureLength;
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
        seed = common.util.hexToBytes(seed);
      } catch (e) {
        throw new errors.InvalidArgumentError('seed is not a valid hex string');
      }
    } else {
      seed = common.util.randomBytes(nacl.sign.seedLength);
    }

    this.key = nacl.sign.keyPair.fromSeed(seed);
    this.publicKey = common.util.bytesToHex(this.key.publicKey);
    this.seed = common.util.bytesToHex(seed);
    this.curveSecretKey = ed2curve.convertSecretKey(this.key.secretKey);
    this.sharedKeyCache = new Map();
    this.useWorker = this._shouldUseWorker(options.worker);
    this.worker = null;
    this.workerMsgID = 0;
    this.workerMsgCache = new Map();

    if (this.useWorker) {
      try {
        this.worker = work(require('./worker.js'));
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
        this.worker.postMessage({ action: 'setSeed', seed: this.seed });
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
      this.workerMsgCache.set(id, { resolve, reject });
      this.worker.postMessage(Object.assign({ id }, data));
    });
  }

  _computeSharedKey(otherPubkey) {
    let otherCurvePubkey = ed2curve.convertPublicKey(common.util.hexToBytes(otherPubkey));
    return nacl.box.before(otherCurvePubkey, this.curveSecretKey);
  }

  async computeSharedKey(otherPubkey) {
    if (this.useWorker) {
      try {
        return await this._sendToWorker({ action: 'computeSharedKey', otherPubkey });
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
    let nonce = options.nonce || common.util.randomBytes(nacl.box.nonceLength);
    return {
      message: nacl.box.after(message, nonce, sharedKey),
      nonce: nonce,
    };
  }

  async decrypt(encryptedMessage, nonce, srcPubkey, options = {}) {
    let sharedKey = await this.getOrComputeSharedKey(srcPubkey);
    return nacl.box.open.after(encryptedMessage, nonce, sharedKey);
  }

  _sign(message) {
    let sig = nacl.sign.detached(Buffer.from(message, 'hex'), this.key.secretKey);
    return common.util.paddingSignature(common.util.bytesToHex(sig), signatureLength);
  }

  async sign(message) {
    if (this.useWorker) {
      try {
        return await this._sendToWorker({ action: 'sign', message });
      } catch (e) {
        console.warn('worker sign failed, fallback to main thread:', e);
      }
    }
    return await this._sign(message);
  }
}
