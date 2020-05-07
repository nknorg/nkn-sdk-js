'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encrypt = encrypt;
exports.decrypt = decrypt;

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

var hash = _interopRequireWildcard(require("./hash"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function encrypt(plaintext, password, iv) {
  return _cryptoJs.default.AES.encrypt(_cryptoJs.default.enc.Hex.parse(plaintext), _cryptoJs.default.enc.Hex.parse(password), {
    iv: _cryptoJs.default.enc.Hex.parse(iv),
    mode: _cryptoJs.default.mode.CBC,
    padding: _cryptoJs.default.pad.NoPadding
  }).ciphertext.toString(_cryptoJs.default.enc.Hex);
}

function decrypt(ciphertext, password, iv) {
  return _cryptoJs.default.AES.decrypt(_cryptoJs.default.enc.Hex.parse(ciphertext).toString(_cryptoJs.default.enc.Base64), _cryptoJs.default.enc.Hex.parse(password), {
    iv: _cryptoJs.default.enc.Hex.parse(iv),
    mode: _cryptoJs.default.mode.CBC,
    padding: _cryptoJs.default.pad.NoPadding
  }).toString();
}