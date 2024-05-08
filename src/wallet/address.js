"use strict";

import * as common from "../common";

export const BITCOIN_BASE58 =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const base58 = require("base-x")(BITCOIN_BASE58);

export const ADDRESS_GEN_PREFIX = "02b825";
export const ADDRESS_GEN_PREFIX_LEN = ADDRESS_GEN_PREFIX.length / 2;
export const UINT160_LEN = 20;
export const CHECKSUM_LEN = 4;
export const ADDRESS_LEN = ADDRESS_GEN_PREFIX_LEN + UINT160_LEN + CHECKSUM_LEN;

export function verifyAddress(address) {
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
    let programHashVerifyCode =
      genAddressVerifyCodeFromProgramHash(programHash);

    return addressVerifyCode === programHashVerifyCode;
  } catch (e) {
    return false;
  }
}

export function publicKeyToSignatureRedeem(publicKey) {
  return "20" + publicKey + "ac";
}

export function hexStringToProgramHash(hexStr) {
  return common.hash.ripemd160Hex(common.hash.sha256Hex(hexStr));
}

export function programHashStringToAddress(programHash) {
  let addressVerifyBytes = genAddressVerifyBytesFromProgramHash(programHash);
  let addressBaseData = common.util.hexToBytes(
    ADDRESS_GEN_PREFIX + programHash,
  );
  return base58.encode(
    Buffer.from(
      common.util.mergeTypedArrays(addressBaseData, addressVerifyBytes),
    ),
  );
}

export function addressStringToProgramHash(address) {
  let addressBytes = base58.decode(address);
  let programHashBytes = addressBytes.slice(
    ADDRESS_GEN_PREFIX_LEN,
    addressBytes.length - CHECKSUM_LEN,
  );
  return common.util.bytesToHex(programHashBytes);
}

export function genAddressVerifyBytesFromProgramHash(programHash) {
  programHash = ADDRESS_GEN_PREFIX + programHash;
  let verifyBytes = common.util.hexToBytes(
    common.hash.doubleSha256Hex(programHash),
  );
  return verifyBytes.slice(0, CHECKSUM_LEN);
}

export function genAddressVerifyCodeFromProgramHash(programHash) {
  let verifyBytes = genAddressVerifyBytesFromProgramHash(programHash);
  return common.util.bytesToHex(verifyBytes);
}

export function getAddressStringVerifyCode(address) {
  let addressBytes = base58.decode(address);
  let verifyBytes = addressBytes.slice(-CHECKSUM_LEN);

  return common.util.bytesToHex(verifyBytes);
}

export function signatureToParameter(signatureHex) {
  return "40" + signatureHex;
}

export function prefixByteCountToHexString(hexString) {
  let len = hexString.length;
  if (0 === len) {
    return "00";
  }

  if (1 === len % 2) {
    hexString = "0" + hexString;
    len += 1;
  }

  let byteCount = len / 2;

  byteCount = byteCount.toString(16);
  if (1 === byteCount.length % 2) {
    byteCount = "0" + byteCount;
  }

  return byteCount + hexString;
}
