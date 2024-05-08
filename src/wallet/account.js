"use strict";

import * as address from "./address";
import * as common from "../common";

export default class Account {
  key;
  signatureRedeem;
  programHash;
  address;
  contract;

  constructor(seed, options = {}) {
    this.key = new common.Key(seed, { worker: options.worker });
    this.signatureRedeem = address.publicKeyToSignatureRedeem(
      this.key.publicKey,
    );
    this.programHash = address.hexStringToProgramHash(this.signatureRedeem);
    this.address = address.programHashStringToAddress(this.programHash);
    this.contract = genAccountContractString(
      this.signatureRedeem,
      this.programHash,
    );
  }

  getPublicKey() {
    return this.key.publicKey;
  }

  getSeed() {
    return this.key.seed;
  }
}

function genAccountContractString(signatureRedeem, programHash) {
  let contract = address.prefixByteCountToHexString(signatureRedeem);
  contract += address.prefixByteCountToHexString("00");
  contract += programHash;
  return contract;
}
