"use strict";

import errors from "./errors";

export const maxUintBits = 48;
export const maxUint = 2 ** maxUintBits;

export function encodeUint8(value) {
  let buf = Buffer.alloc(1, 0);
  buf.writeUInt8(value);
  return buf.toString("hex");
}

export function encodeUint16(value) {
  let buf = Buffer.alloc(2, 0);
  buf.writeUInt16LE(value);
  return buf.toString("hex");
}

export function encodeUint32(value) {
  let buf = Buffer.alloc(4, 0);
  buf.writeUInt32LE(value);
  return buf.toString("hex");
}

export function encodeUint64(value) {
  if (value > maxUint) {
    throw new RangeError("full 64 bit integer is not supported in JavaScript");
  }
  let buf = Buffer.alloc(8, 0);
  buf.writeUIntLE(value, 0, 6);
  return buf.toString("hex");
}

export function encodeUint(value) {
  if (value < 0xfd) {
    return encodeUint8(value);
  } else if (value <= 0xffff) {
    return "fd" + encodeUint16(value);
  } else if (value <= 0xffffffff) {
    return "fe" + encodeUint32(value);
  } else {
    return "ff" + encodeUint64(value);
  }
}

export function encodeBytes(value) {
  let buf = Buffer.from(value);
  return encodeUint(buf.length) + buf.toString("hex");
}

export function encodeString(value) {
  let buf = Buffer.from(value, "utf8");
  return encodeUint(buf.length) + buf.toString("hex");
}

export function encodeBool(value) {
  return encodeUint8(value ? 1 : 0);
}
