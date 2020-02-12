'use strict';

import Key from '../common/key';
import * as address from './address';
import * as errors from '../common/errors';

export default class Account {
  key;
  signatureRedeem;
  programHash;
  address;
  contract;

  constructor(seed) {
    this.key = new Key(seed);
    this.signatureRedeem = address.publicKeyToSignatureRedeem(this.key.publicKey);
    this.programHash = address.hexStringToProgramHash(this.signatureRedeem);
    this.address = address.programHashStringToAddress(this.programHash);
    this.contract = genAccountContractString(this.signatureRedeem, this.programHash);
  }

  getPublicKey() {
    return this.key.publicKey;
  }

  getSeed() {
    return this.key.seed;
  }
}

function genAccountContractString(signatureRedeem, programHash) {
  let contract = ''

  contract += address.prefixByteCountToHexString(signatureRedeem)
  contract += address.prefixByteCountToHexString('00')
  contract += programHash

  return contract
}
