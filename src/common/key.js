'use strict';

import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';

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

  constructor(seed) {
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
  }

  getOrComputeSharedKey(otherPubkey) {
    if (!this.sharedKeyCache.has(otherPubkey)) {
      let otherCurvePubkey = ed2curve.convertPublicKey(otherPubkey);
      this.sharedKeyCache.set(otherPubkey, nacl.box.before(otherCurvePubkey, this.curveSecretKey));
    }
    return this.sharedKeyCache.get(otherPubkey);
  }

  encrypt(message, destPubkey, options = {}) {
    let sharedKey = this.getOrComputeSharedKey(destPubkey);
    let nonce = options.nonce || common.util.randomBytes(nacl.box.nonceLength);
    return {
      message: nacl.box.after(message, nonce, sharedKey),
      nonce: nonce,
    };
  }

  decrypt(encryptedMessage, nonce, srcPubkey, options = {}) {
    let sharedKey = this.getOrComputeSharedKey(srcPubkey);
    return nacl.box.open.after(encryptedMessage, nonce, sharedKey);
  }

  async sign(message) {
    let sig = nacl.sign.detached(message, this.key.secretKey);
    return common.util.paddingSignature(common.util.bytesToHex(sig), signatureLength);
  }
}
