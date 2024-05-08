"use strict";

import CryptoJS from "crypto-js";

export function encrypt(plaintext, password, iv) {
  return CryptoJS.AES.encrypt(
    CryptoJS.enc.Hex.parse(plaintext),
    CryptoJS.enc.Hex.parse(password),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
    },
  ).ciphertext.toString(CryptoJS.enc.Hex);
}

export function decrypt(ciphertext, password, iv) {
  return CryptoJS.AES.decrypt(
    CryptoJS.enc.Hex.parse(ciphertext).toString(CryptoJS.enc.Base64),
    CryptoJS.enc.Hex.parse(password),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
    },
  ).toString();
}
