"use strict";

import ed2curve from "ed2curve";
import sodium from "libsodium-wrappers";
import nacl from "tweetnacl";

import * as util from "./util";

export const keyLength = 32;
export const nonceLength = 24;
export const publicKeyLength = 32;
export const seedLength = 32;
export const signatureLength = 64;

let isReady = false;
let disableWASM = false;

export function setDisableWASM(disable) {
  disableWASM = !!disable;
}

export function keyPair(seed) {
  let seedBytes = util.hexToBytes(seed);
  let key;
  if (!disableWASM && isReady) {
    try {
      key = sodium.crypto_sign_seed_keypair(seedBytes);
      return {
        seed: seed,
        publicKey: key.publicKey,
        privateKey: key.privateKey,
        curvePrivateKey: ed25519SkToCurve25519(key.privateKey),
      };
    } catch (e) {
      console.warn(e);
    }
  }
  key = nacl.sign.keyPair.fromSeed(seedBytes);
  return {
    seed: seed,
    publicKey: key.publicKey,
    privateKey: key.secretKey,
    curvePrivateKey: ed2curve.convertSecretKey(key.secretKey),
  };
}

export function ed25519SkToCurve25519(sk) {
  if (!disableWASM && isReady) {
    try {
      return sodium.crypto_sign_ed25519_sk_to_curve25519(sk);
    } catch (e) {
      console.warn(e);
    }
  }
  return ed2curve.convertSecretKey(sk);
}

export async function ed25519PkToCurve25519(pk) {
  if (!disableWASM) {
    try {
      if (!isReady) {
        await sodium.ready;
        isReady = true;
      }
      return sodium.crypto_sign_ed25519_pk_to_curve25519(pk);
    } catch (e) {
      console.warn(e);
    }
  }
  return ed2curve.convertPublicKey(pk);
}

export async function computeSharedKey(myCurvePrivateKey, otherPubkey) {
  let otherCurvePubkey = await ed25519PkToCurve25519(Buffer.from(otherPubkey, "hex"));
  let sharedKey;
  if (!disableWASM) {
    try {
      if (!isReady) {
        await sodium.ready;
        isReady = true;
      }
      sharedKey = sodium.crypto_box_beforenm(otherCurvePubkey, myCurvePrivateKey);
    } catch (e) {
      console.warn(e);
    }
  }
  if (!sharedKey) {
    sharedKey = nacl.box.before(otherCurvePubkey, myCurvePrivateKey);
  }
  return util.bytesToHex(sharedKey);
}

export async function encryptSymmetric(message, nonce, key) {
  if (!disableWASM) {
    try {
      if (!isReady) {
        await sodium.ready;
        isReady = true;
      }
      return sodium.crypto_box_easy_afternm(message, nonce, key);
    } catch (e) {
      console.warn(e);
    }
  }
  return nacl.secretbox(message, nonce, key);
}

export async function decryptSymmetric(message, nonce, key) {
  if (!disableWASM) {
    try {
      if (!isReady) {
        await sodium.ready;
        isReady = true;
      }
      return sodium.crypto_box_open_easy_afternm(message, nonce, key);
    } catch (e) {
      console.warn(e);
    }
  }
  return nacl.secretbox.open(message, nonce, key);
}

export async function sign(privateKey, message) {
  let sig;
  if (!disableWASM) {
    try {
      if (!isReady) {
        await sodium.ready;
        isReady = true;
      }
      sig = sodium.crypto_sign_detached(Buffer.from(message, "hex"), privateKey);
      return util.bytesToHex(sig);
    } catch (e) {
      console.warn(e);
    }
  }
  sig = nacl.sign.detached(Buffer.from(message, "hex"), privateKey);
  return util.bytesToHex(sig);
}
