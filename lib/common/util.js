"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assignDefined = assignDefined;
exports.bytesToHex = bytesToHex;
exports.hexToBytes = hexToBytes;
exports.isBrowser = isBrowser;
exports.mergeTypedArrays = mergeTypedArrays;
exports.randomBytes = void 0;
exports.randomBytesHex = randomBytesHex;
exports.randomInt32 = randomInt32;
exports.randomUint64 = randomUint64;
exports.setPRNG = setPRNG;
exports.sleep = sleep;
exports.toLowerKeys = toLowerKeys;
exports.utf8ToBytes = utf8ToBytes;
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var _serialize = require("./serialize");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var hexRe = /^[0-9a-f]+$/i;
function hexToBytes(hex) {
  if (hex.length % 2 === 1) {
    throw new RangeError("invalid hex string length " + hex.length);
  }
  if (!hexRe.test(hex)) {
    throw new RangeError("invalid hex string");
  }
  var bytes = [];
  for (var c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
}
function bytesToHex(bytes) {
  return Array.from(bytes, function (b) {
    if (b < 0 || b > 255) {
      throw new RangeError("invalid byte " + b);
    }
    return ("0" + (b & 0xff).toString(16)).slice(-2);
  }).join("");
}
var randomBytes = exports.randomBytes = _tweetnacl["default"].randomBytes;
function setPRNG(f) {
  _tweetnacl["default"].setPRNG(f);
}
function randomBytesHex(len) {
  return bytesToHex(randomBytes(len));
}
function randomInt32() {
  var b = randomBytes(4);
  b[0] &= 127;
  return (b[0] << 24) + (b[1] << 16) + (b[2] << 8) + b[3];
}
function randomUint64() {
  var hex = randomBytesHex(_serialize.maxUintBits / 8);
  return parseInt(hex, 16);
}
function mergeTypedArrays(a, b) {
  var c = new a.constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}
function assignDefined(target) {
  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }
  for (var _i = 0, _sources = sources; _i < _sources.length; _i++) {
    var source = _sources[_i];
    if (source) {
      for (var _i2 = 0, _Object$keys = Object.keys(source); _i2 < _Object$keys.length; _i2++) {
        var key = _Object$keys[_i2];
        if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}
function utf8ToBytes(s) {
  if (!s) {
    return new Uint8Array();
  }
  return new Uint8Array(Buffer.from(s, "utf8"));
}

// convert all keys to lowercase recursively
function toLowerKeys(obj) {
  return Object.keys(obj).reduce(function (merged, key) {
    return Object.assign(merged, _defineProperty({}, key.toLowerCase(), _typeof(obj[key]) === "object" ? toLowerKeys(obj[key]) : obj[key]));
  }, {});
}
function sleep(duration) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, duration);
  });
}
function isBrowser() {
  return ![typeof window === "undefined" ? "undefined" : _typeof(window), typeof document === "undefined" ? "undefined" : _typeof(document)].includes("undefined");
}