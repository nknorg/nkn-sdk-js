"use strict";

import nacl from "tweetnacl";

import { maxUintBits } from "./serialize";

const hexRe = /^[0-9a-f]+$/i;

export function hexToBytes(hex) {
  if (hex.length % 2 === 1) {
    throw new RangeError("invalid hex string length " + hex.length);
  }
  if (!hexRe.test(hex)) {
    throw new RangeError("invalid hex string");
  }
  let bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
}

export function bytesToHex(bytes) {
  return Array.from(bytes, (b) => {
    if (b < 0 || b > 255) {
      throw new RangeError("invalid byte " + b);
    }
    return ("0" + (b & 0xff).toString(16)).slice(-2);
  }).join("");
}

export var randomBytes = nacl.randomBytes;

export function setPRNG(f) {
  nacl.setPRNG(f);
}

export function randomBytesHex(len) {
  return bytesToHex(randomBytes(len));
}

export function randomInt32() {
  let b = randomBytes(4);
  b[0] &= 127;
  return (b[0] << 24) + (b[1] << 16) + (b[2] << 8) + b[3];
}

export function randomUint64() {
  let hex = randomBytesHex(maxUintBits / 8);
  return parseInt(hex, 16);
}

export function mergeTypedArrays(a, b) {
  let c = new a.constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
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

export function utf8ToBytes(s) {
  if (!s) {
    return new Uint8Array();
  }
  return new Uint8Array(Buffer.from(s, "utf8"));
}

// convert all keys to lowercase recursively
export function toLowerKeys(obj) {
  return Object.keys(obj).reduce(
    (merged, key) =>
      Object.assign(merged, {
        [key.toLowerCase()]:
          typeof obj[key] === "object" ? toLowerKeys(obj[key]) : obj[key],
      }),
    {},
  );
}

export function sleep(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function isBrowser() {
  return ![typeof window, typeof document].includes("undefined");
}
