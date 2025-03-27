"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UINT160_LEN = exports.CHECKSUM_LEN = exports.BITCOIN_BASE58 = exports.ADDRESS_LEN = exports.ADDRESS_GEN_PREFIX_LEN = exports.ADDRESS_GEN_PREFIX = void 0;
exports.addressStringToProgramHash = addressStringToProgramHash;
exports.genAddressVerifyBytesFromProgramHash = genAddressVerifyBytesFromProgramHash;
exports.genAddressVerifyCodeFromProgramHash = genAddressVerifyCodeFromProgramHash;
exports.getAddressStringVerifyCode = getAddressStringVerifyCode;
exports.hexStringToProgramHash = hexStringToProgramHash;
exports.prefixByteCountToHexString = prefixByteCountToHexString;
exports.programHashStringToAddress = programHashStringToAddress;
exports.publicKeyToSignatureRedeem = publicKeyToSignatureRedeem;
exports.signatureToParameter = signatureToParameter;
exports.verifyAddress = verifyAddress;
var common = _interopRequireWildcard(require("../common"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var BITCOIN_BASE58 = exports.BITCOIN_BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var base58 = require("base-x")(BITCOIN_BASE58);
var ADDRESS_GEN_PREFIX = exports.ADDRESS_GEN_PREFIX = "02b825";
var ADDRESS_GEN_PREFIX_LEN = exports.ADDRESS_GEN_PREFIX_LEN = ADDRESS_GEN_PREFIX.length / 2;
var UINT160_LEN = exports.UINT160_LEN = 20;
var CHECKSUM_LEN = exports.CHECKSUM_LEN = 4;
var ADDRESS_LEN = exports.ADDRESS_LEN = ADDRESS_GEN_PREFIX_LEN + UINT160_LEN + CHECKSUM_LEN;
function verifyAddress(address) {
  try {
    var addressBytes = base58.decode(address);
    if (addressBytes.length !== ADDRESS_LEN) {
      return false;
    }
    var addressPrefixBytes = addressBytes.slice(0, ADDRESS_GEN_PREFIX_LEN);
    var addressPrefix = common.util.bytesToHex(addressPrefixBytes);
    if (addressPrefix !== ADDRESS_GEN_PREFIX) {
      return false;
    }
    var programHash = addressStringToProgramHash(address);
    var addressVerifyCode = getAddressStringVerifyCode(address);
    var programHashVerifyCode = genAddressVerifyCodeFromProgramHash(programHash);
    return addressVerifyCode === programHashVerifyCode;
  } catch (e) {
    return false;
  }
}
function publicKeyToSignatureRedeem(publicKey) {
  return "20" + publicKey + "ac";
}
function hexStringToProgramHash(hexStr) {
  return common.hash.ripemd160Hex(common.hash.sha256Hex(hexStr));
}
function programHashStringToAddress(programHash) {
  var addressVerifyBytes = genAddressVerifyBytesFromProgramHash(programHash);
  var addressBaseData = common.util.hexToBytes(ADDRESS_GEN_PREFIX + programHash);
  return base58.encode(Buffer.from(common.util.mergeTypedArrays(addressBaseData, addressVerifyBytes)));
}
function addressStringToProgramHash(address) {
  var addressBytes = base58.decode(address);
  var programHashBytes = addressBytes.slice(ADDRESS_GEN_PREFIX_LEN, addressBytes.length - CHECKSUM_LEN);
  return common.util.bytesToHex(programHashBytes);
}
function genAddressVerifyBytesFromProgramHash(programHash) {
  programHash = ADDRESS_GEN_PREFIX + programHash;
  var verifyBytes = common.util.hexToBytes(common.hash.doubleSha256Hex(programHash));
  return verifyBytes.slice(0, CHECKSUM_LEN);
}
function genAddressVerifyCodeFromProgramHash(programHash) {
  var verifyBytes = genAddressVerifyBytesFromProgramHash(programHash);
  return common.util.bytesToHex(verifyBytes);
}
function getAddressStringVerifyCode(address) {
  var addressBytes = base58.decode(address);
  var verifyBytes = addressBytes.slice(-CHECKSUM_LEN);
  return common.util.bytesToHex(verifyBytes);
}
function signatureToParameter(signatureHex) {
  return "40" + signatureHex;
}
function prefixByteCountToHexString(hexString) {
  var len = hexString.length;
  if (0 === len) {
    return "00";
  }
  if (1 === len % 2) {
    hexString = "0" + hexString;
    len += 1;
  }
  var byteCount = len / 2;
  byteCount = byteCount.toString(16);
  if (1 === byteCount.length % 2) {
    byteCount = "0" + byteCount;
  }
  return byteCount + hexString;
}