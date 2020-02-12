'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cryptoHexStringParse = cryptoHexStringParse;
exports.sha256 = sha256;
exports.sha256Hex = sha256Hex;
exports.doubleSha256 = doubleSha256;
exports.doubleSha256Hex = doubleSha256Hex;
exports.ripemd160 = ripemd160;
exports.ripemd160Hex = ripemd160Hex;

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cryptoHexStringParse(hexString) {
  return _cryptoJs.default.enc.Hex.parse(hexString);
}

function sha256(str) {
  return _cryptoJs.default.SHA256(str).toString();
}

function sha256Hex(hexStr) {
  return sha256(cryptoHexStringParse(hexStr));
}

function doubleSha256(str) {
  return _cryptoJs.default.SHA256(_cryptoJs.default.SHA256(str)).toString();
}

function doubleSha256Hex(hexStr) {
  return _cryptoJs.default.SHA256(_cryptoJs.default.SHA256(cryptoHexStringParse(hexStr))).toString();
}

function ripemd160(str) {
  return _cryptoJs.default.RIPEMD160(str).toString();
}

function ripemd160Hex(hexStr) {
  return _cryptoJs.default.RIPEMD160(cryptoHexStringParse(hexStr)).toString();
}