'use strict';

import nacl from 'tweetnacl';

import { maxUintBits } from './serialize';

export function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
}

export function bytesToHex(bytes) {
  return Array.from(bytes, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2)
  }).join('');
}

export var randomBytes;
if (typeof navigator != 'undefined' && navigator.product === 'ReactNative') {
  randomBytes = require('crypto').randomBytes;
} else {
  randomBytes = nacl.randomBytes;
}

export function randomBytesHex(len) {
  return bytesToHex(randomBytes(len));
}

export function randomInt32() {
  let b = randomBytes(4);
  b[0] &= 127
  return (b[0]<<24) + (b[1]<<16) + (b[2]<<8) + b[3];
}

export function randomUint64() {
  let hex = randomBytesHex(maxUintBits/8);
  return parseInt(hex, 16);
}

export function mergeTypedArrays(a, b) {
  var c = new a.constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}

export function paddingSignature(data, len) {
  for(let i = 0; i < len - data.length; i++){
    data = '0' + data
  }
  return data
}

export function assignDefined(target, ...sources) {
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
