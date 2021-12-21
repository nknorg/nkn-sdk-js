'use strict';

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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const BITCOIN_BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
exports.BITCOIN_BASE58 = BITCOIN_BASE58;

const base58 = require('base-x')(BITCOIN_BASE58);

const ADDRESS_GEN_PREFIX = '02b825';
exports.ADDRESS_GEN_PREFIX = ADDRESS_GEN_PREFIX;
const ADDRESS_GEN_PREFIX_LEN = ADDRESS_GEN_PREFIX.length / 2;
exports.ADDRESS_GEN_PREFIX_LEN = ADDRESS_GEN_PREFIX_LEN;
const UINT160_LEN = 20;
exports.UINT160_LEN = UINT160_LEN;
const CHECKSUM_LEN = 4;
exports.CHECKSUM_LEN = CHECKSUM_LEN;
const ADDRESS_LEN = ADDRESS_GEN_PREFIX_LEN + UINT160_LEN + CHECKSUM_LEN;
exports.ADDRESS_LEN = ADDRESS_LEN;

function verifyAddress(address) {
  try {
    let addressBytes = base58.decode(address);

    if (addressBytes.length !== ADDRESS_LEN) {
      return false;
    }

    let addressPrefixBytes = addressBytes.slice(0, ADDRESS_GEN_PREFIX_LEN);
    let addressPrefix = common.util.bytesToHex(addressPrefixBytes);

    if (addressPrefix !== ADDRESS_GEN_PREFIX) {
      return false;
    }

    let programHash = addressStringToProgramHash(address);
    let addressVerifyCode = getAddressStringVerifyCode(address);
    let programHashVerifyCode = genAddressVerifyCodeFromProgramHash(programHash);
    return addressVerifyCode === programHashVerifyCode;
  } catch (e) {
    return false;
  }
}

function publicKeyToSignatureRedeem(publicKey) {
  return '20' + publicKey + 'ac';
}

function hexStringToProgramHash(hexStr) {
  return common.hash.ripemd160Hex(common.hash.sha256Hex(hexStr));
}

function programHashStringToAddress(programHash) {
  let addressVerifyBytes = genAddressVerifyBytesFromProgramHash(programHash);
  let addressBaseData = common.util.hexToBytes(ADDRESS_GEN_PREFIX + programHash);
  return base58.encode(Buffer.from(common.util.mergeTypedArrays(addressBaseData, addressVerifyBytes)));
}

function addressStringToProgramHash(address) {
  let addressBytes = base58.decode(address);
  let programHashBytes = addressBytes.slice(ADDRESS_GEN_PREFIX_LEN, addressBytes.length - CHECKSUM_LEN);
  return common.util.bytesToHex(programHashBytes);
}

function genAddressVerifyBytesFromProgramHash(programHash) {
  programHash = ADDRESS_GEN_PREFIX + programHash;
  let verifyBytes = common.util.hexToBytes(common.hash.doubleSha256Hex(programHash));
  return verifyBytes.slice(0, CHECKSUM_LEN);
}

function genAddressVerifyCodeFromProgramHash(programHash) {
  let verifyBytes = genAddressVerifyBytesFromProgramHash(programHash);
  return common.util.bytesToHex(verifyBytes);
}

function getAddressStringVerifyCode(address) {
  let addressBytes = base58.decode(address);
  let verifyBytes = addressBytes.slice(-CHECKSUM_LEN);
  return common.util.bytesToHex(verifyBytes);
}

function signatureToParameter(signatureHex) {
  return '40' + signatureHex;
}

function prefixByteCountToHexString(hexString) {
  let len = hexString.length;

  if (0 === len) {
    return '00';
  }

  if (1 === len % 2) {
    hexString = '0' + hexString;
    len += 1;
  }

  let byteCount = len / 2;
  byteCount = byteCount.toString(16);

  if (1 === byteCount.length % 2) {
    byteCount = '0' + byteCount;
  }

  return byteCount + hexString;
}