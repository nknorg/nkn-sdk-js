"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decrypt = decrypt;
exports.encrypt = encrypt;
var _cryptoJs = _interopRequireDefault(require("crypto-js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function encrypt(plaintext, password, iv) {
  return _cryptoJs["default"].AES.encrypt(_cryptoJs["default"].enc.Hex.parse(plaintext), _cryptoJs["default"].enc.Hex.parse(password), {
    iv: _cryptoJs["default"].enc.Hex.parse(iv),
    mode: _cryptoJs["default"].mode.CBC,
    padding: _cryptoJs["default"].pad.NoPadding
  }).ciphertext.toString(_cryptoJs["default"].enc.Hex);
}
function decrypt(ciphertext, password, iv) {
  return _cryptoJs["default"].AES.decrypt(_cryptoJs["default"].enc.Hex.parse(ciphertext).toString(_cryptoJs["default"].enc.Base64), _cryptoJs["default"].enc.Hex.parse(password), {
    iv: _cryptoJs["default"].enc.Hex.parse(iv),
    mode: _cryptoJs["default"].mode.CBC,
    padding: _cryptoJs["default"].pad.NoPadding
  }).toString();
}