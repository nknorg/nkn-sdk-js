'use strict';

import CryptoJS from 'crypto-js';

import * as common from '../common';

export function encrypt(plaintext, password, iv) {
  return CryptoJS.AES.encrypt(
    plaintext,
    common.hash.cryptoHexStringParse(password),
    {
      iv: common.hash.cryptoHexStringParse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding
    }
  ).ciphertext.toString(CryptoJS.enc.Hex);
}

export function decrypt(ciphertext, password, iv) {
  return CryptoJS.AES.decrypt(
    CryptoJS.enc.Base64.stringify(ciphertext),
    common.hash.cryptoHexStringParse(password),
    {
      iv: common.hash.cryptoHexStringParse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding
    }
  ).toString();
}
