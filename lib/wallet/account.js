'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var address = _interopRequireWildcard(require("./address"));

var common = _interopRequireWildcard(require("../common"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Account {
  constructor(seed, options = {}) {
    _defineProperty(this, "key", void 0);

    _defineProperty(this, "signatureRedeem", void 0);

    _defineProperty(this, "programHash", void 0);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "contract", void 0);

    this.key = new common.Key(seed, {
      worker: options.worker
    });
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

exports.default = Account;

function genAccountContractString(signatureRedeem, programHash) {
  let contract = address.prefixByteCountToHexString(signatureRedeem);
  contract += address.prefixByteCountToHexString('00');
  contract += programHash;
  return contract;
}