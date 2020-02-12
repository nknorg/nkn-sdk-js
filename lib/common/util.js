'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hexToBytes = hexToBytes;
exports.bytesToHex = bytesToHex;
exports.randomBytesHex = randomBytesHex;
exports.randomInt32 = randomInt32;
exports.randomUint64 = randomUint64;
exports.mergeTypedArrays = mergeTypedArrays;
exports.paddingSignature = paddingSignature;
exports.assignDefined = assignDefined;
exports.randomBytes = void 0;

var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

var _serialize = require("./serialize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return new Uint8Array(bytes);
}

function bytesToHex(bytes) {
  return Array.from(bytes, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

var randomBytes;
exports.randomBytes = randomBytes;

if (typeof navigator != 'undefined' && navigator.product === 'ReactNative') {
  exports.randomBytes = randomBytes = require('crypto').randomBytes;
} else {
  exports.randomBytes = randomBytes = _tweetnacl.default.randomBytes;
}

function randomBytesHex(len) {
  return bytesToHex(randomBytes(len));
}

function randomInt32() {
  let b = randomBytes(4);
  b[0] &= 127;
  return (b[0] << 24) + (b[1] << 16) + (b[2] << 8) + b[3];
}

function randomUint64() {
  let hex = randomBytesHex(_serialize.maxUintBits / 8);
  return parseInt(hex, 16);
}

function mergeTypedArrays(a, b) {
  var c = new a.constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}

function paddingSignature(data, len) {
  for (let i = 0; i < len - data.length; i++) {
    data = '0' + data;
  }

  return data;
}

function assignDefined(target, ...sources) {
  for (let source of sources) {
    if (source) {
      for (let key of Object.keys(source)) {
        if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    }
  }

  return target;
}