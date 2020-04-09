'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyPair = keyPair;
exports.ed25519SkToCurve25519 = ed25519SkToCurve25519;
exports.ed25519PkToCurve25519 = ed25519PkToCurve25519;
exports.computeSharedKey = computeSharedKey;
exports.encryptSymmetric = encryptSymmetric;
exports.decryptSymmetric = decryptSymmetric;
exports.sign = sign;
exports.signatureLength = exports.seedLength = exports.publicKeyLength = exports.nonceLength = exports.keyLength = void 0;

var _ed2curve = _interopRequireDefault(require("ed2curve"));

var _libsodiumWrappers = _interopRequireDefault(require("libsodium-wrappers"));

var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

var util = _interopRequireWildcard(require("./util"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const keyLength = 32;
exports.keyLength = keyLength;
const nonceLength = 24;
exports.nonceLength = nonceLength;
const publicKeyLength = 32;
exports.publicKeyLength = publicKeyLength;
const seedLength = 32;
exports.seedLength = seedLength;
const signatureLength = 64;
exports.signatureLength = signatureLength;
let isReady = false;

function keyPair(seed) {
  try {
    let key = _libsodiumWrappers.default.crypto_sign_seed_keypair(seed);

    return {
      publicKey: key.publicKey,
      privateKey: key.privateKey,
      curvePrivateKey: ed25519SkToCurve25519(key.privateKey)
    };
  } catch (e) {
    // libsodium not ready yet
    let key = _tweetnacl.default.sign.keyPair.fromSeed(seed);

    return {
      publicKey: key.publicKey,
      privateKey: key.secretKey,
      curvePrivateKey: _ed2curve.default.convertSecretKey(key.secretKey)
    };
  }
}

function ed25519SkToCurve25519(sk) {
  try {
    return _libsodiumWrappers.default.crypto_sign_ed25519_sk_to_curve25519(sk);
  } catch (e) {
    // libsodium not ready yet
    return _ed2curve.default.convertSecretKey(sk);
  }
}

async function ed25519PkToCurve25519(pk) {
  try {
    if (!isReady) {
      await _libsodiumWrappers.default.ready;
      isReady = true;
    }

    return _libsodiumWrappers.default.crypto_sign_ed25519_pk_to_curve25519(pk);
  } catch (e) {
    console.warn(e);
    return _ed2curve.default.convertPublicKey(pk);
  }
}

async function computeSharedKey(myCurvePrivateKey, otherPubkey) {
  let otherCurvePubkey = await ed25519PkToCurve25519(Buffer.from(otherPubkey, 'hex'));
  let sharedKey;

  try {
    sharedKey = _libsodiumWrappers.default.crypto_box_beforenm(otherCurvePubkey, myCurvePrivateKey);
  } catch (e) {
    console.warn(e);
    sharedKey = _tweetnacl.default.box.before(otherCurvePubkey, myCurvePrivateKey);
  }

  return util.bytesToHex(sharedKey);
}

async function encryptSymmetric(message, nonce, key) {
  try {
    if (!isReady) {
      await _libsodiumWrappers.default.ready;
      isReady = true;
    }

    return _libsodiumWrappers.default.crypto_box_easy_afternm(message, nonce, key);
  } catch (e) {
    console.warn(e);
    return _tweetnacl.default.secretbox(message, nonce, key);
  }
}

async function decryptSymmetric(message, nonce, key) {
  try {
    if (!isReady) {
      await _libsodiumWrappers.default.ready;
      isReady = true;
    }

    return _libsodiumWrappers.default.crypto_box_open_easy_afternm(message, nonce, key);
  } catch (e) {
    console.warn(e);
    return _tweetnacl.default.secretbox.open(message, nonce, key);
  }
}

async function sign(privateKey, message) {
  let sig;

  try {
    if (!isReady) {
      await _libsodiumWrappers.default.ready;
      isReady = true;
    }

    sig = _libsodiumWrappers.default.crypto_sign_detached(Buffer.from(message, 'hex'), privateKey);
  } catch (e) {
    console.warn(e);
    sig = _tweetnacl.default.sign.detached(Buffer.from(message, 'hex'), privateKey);
  }

  return util.bytesToHex(sig);
}