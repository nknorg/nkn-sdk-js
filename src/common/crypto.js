'use strict';

import ed2curve from 'ed2curve';
import sodium from 'libsodium-wrappers';
import nacl from 'tweetnacl';

import * as util from './util';

export const keyLength = 32;
export const nonceLength = 24;
export const publicKeyLength = 32;
export const seedLength = 32;
export const signatureLength = 64;

let isReady = false;

export function keyPair(seed) {
  try {
    let key = sodium.crypto_sign_seed_keypair(seed);
    return {
      publicKey: key.publicKey,
      privateKey: key.privateKey,
      curvePrivateKey: ed25519SkToCurve25519(key.privateKey),
    };
  } catch (e) { // libsodium not ready yet
    let key = nacl.sign.keyPair.fromSeed(seed);
    return {
      publicKey: key.publicKey,
      privateKey: key.secretKey,
      curvePrivateKey: ed2curve.convertSecretKey(key.secretKey),
    };
  }
}

export function ed25519SkToCurve25519(sk) {
  try {
    return sodium.crypto_sign_ed25519_sk_to_curve25519(sk);
  } catch (e) { // libsodium not ready yet
    return ed2curve.convertSecretKey(sk);
  }
}

export async function ed25519PkToCurve25519(pk) {
  try {
    if (!isReady) {
      await sodium.ready;
      isReady = true;
    }
    return sodium.crypto_sign_ed25519_pk_to_curve25519(pk);
  } catch (e) {
    console.warn(e);
    return ed2curve.convertPublicKey(pk);
  }
}

export async function computeSharedKey(myCurvePrivateKey, otherPubkey) {
  let otherCurvePubkey = await ed25519PkToCurve25519(Buffer.from(otherPubkey, 'hex'));
  let sharedKey;
  try {
    sharedKey = sodium.crypto_box_beforenm(otherCurvePubkey, myCurvePrivateKey);
  } catch (e) {
    console.warn(e);
    sharedKey = nacl.box.before(otherCurvePubkey, myCurvePrivateKey);
  }
  return util.bytesToHex(sharedKey);
}

export async function encryptSymmetric(message, nonce, key) {
  try {
    if (!isReady) {
      await sodium.ready;
      isReady = true;
    }
    return sodium.crypto_box_easy_afternm(message, nonce, key);
  } catch (e) {
    console.warn(e);
    return nacl.secretbox(message, nonce, key);
  }
}

export async function decryptSymmetric(message, nonce, key) {
  try {
    if (!isReady) {
      await sodium.ready;
      isReady = true;
    }
    return sodium.crypto_box_open_easy_afternm(message, nonce, key);
  } catch (e) {
    console.warn(e);
    return nacl.secretbox.open(message, nonce, key);
  }
}

export async function sign(privateKey, message) {
  let sig;
  try {
    if (!isReady) {
      await sodium.ready;
      isReady = true;
    }
    sig = sodium.crypto_sign_detached(Buffer.from(message, 'hex'), privateKey);
  } catch (e) {
    console.warn(e);
    sig = nacl.sign.detached(Buffer.from(message, 'hex'), privateKey);
  }
  return util.bytesToHex(sig);
}
