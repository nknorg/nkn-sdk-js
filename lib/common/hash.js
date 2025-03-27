"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cryptoHexStringParse = cryptoHexStringParse;
exports.doubleSha256 = doubleSha256;
exports.doubleSha256Hex = doubleSha256Hex;
exports.ripemd160 = ripemd160;
exports.ripemd160Hex = ripemd160Hex;
exports.sha256 = sha256;
exports.sha256Hex = sha256Hex;
var _cryptoJs = _interopRequireDefault(require("crypto-js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function cryptoHexStringParse(hexString) {
  return _cryptoJs["default"].enc.Hex.parse(hexString);
}
function sha256(str) {
  return _cryptoJs["default"].SHA256(str).toString();
}
function sha256Hex(hexStr) {
  return sha256(cryptoHexStringParse(hexStr));
}
function doubleSha256(str) {
  return _cryptoJs["default"].SHA256(_cryptoJs["default"].SHA256(str)).toString();
}
function doubleSha256Hex(hexStr) {
  return doubleSha256(cryptoHexStringParse(hexStr));
}
function ripemd160(str) {
  return _cryptoJs["default"].RIPEMD160(str).toString();
}
function ripemd160Hex(hexStr) {
  return ripemd160(cryptoHexStringParse(hexStr));
}