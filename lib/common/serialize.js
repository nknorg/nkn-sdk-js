'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodeUint8 = encodeUint8;
exports.encodeUint16 = encodeUint16;
exports.encodeUint32 = encodeUint32;
exports.encodeUint64 = encodeUint64;
exports.encodeUint = encodeUint;
exports.encodeBytes = encodeBytes;
exports.encodeString = encodeString;
exports.encodeBool = encodeBool;
exports.maxUint = exports.maxUintBits = void 0;

var _errors = _interopRequireDefault(require("./errors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const maxUintBits = 48;
exports.maxUintBits = maxUintBits;
const maxUint = 2 ** maxUintBits;
exports.maxUint = maxUint;

function encodeUint8(value) {
  let buf = Buffer.alloc(1, 0);
  buf.writeUInt8(value);
  return buf.toString('hex');
}

function encodeUint16(value) {
  let buf = Buffer.alloc(2, 0);
  buf.writeUInt16LE(value);
  return buf.toString('hex');
}

function encodeUint32(value) {
  let buf = Buffer.alloc(4, 0);
  buf.writeUInt32LE(value);
  return buf.toString('hex');
}

function encodeUint64(value) {
  if (value > maxUint) {
    throw new RangeError('full 64 bit integer is not supported in JavaScript');
  }

  let buf = Buffer.alloc(8, 0);
  buf.writeUIntLE(value, 0, 6);
  return buf.toString('hex');
}

function encodeUint(value) {
  if (value < 0xfd) {
    return encodeUint8(value);
  } else if (value <= 0xffff) {
    return 'fd' + encodeUint16(value);
  } else if (value <= 0xffffffff) {
    return 'fe' + encodeUint32(value);
  } else {
    return 'ff' + encodeUint64(value);
  }
}

function encodeBytes(value) {
  let buf = Buffer.from(value);
  return encodeUint(buf.length) + buf.toString('hex');
}

function encodeString(value) {
  let buf = Buffer.from(value, 'utf8');
  return encodeUint(buf.length) + buf.toString('hex');
}

function encodeBool(value) {
  return encodeUint8(value ? 1 : 0);
}