'use strict';

import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';

import * as crypto from '../common/crypto';
import * as util from '../common/util';

module.exports = function(self) {
  let key, curveSecretKey;
  self.onmessage = function(e) {
    try {
      let result = null;
      switch (e.data.action) {
        case 'setSeed':
          if (!key) {
            key = nacl.sign.keyPair.fromSeed(util.hexToBytes(e.data.seed));
            curveSecretKey = ed2curve.convertSecretKey(key.secretKey);
          }
          break;
        case 'computeSharedKey':
          if (key) {
            result = crypto.computeSharedKey(curveSecretKey, e.data.otherPubkey);
          } else {
            throw 'worker key not created';
          }
          break;
        case 'sign':
          if (key) {
            result = crypto.sign(key.secretKey, e.data.message)
          } else {
            throw 'worker key not created';
          }
          break;
        default:
          throw 'unknown action: ' + e.data.action;
      }
      self.postMessage({ id: e.data.id, result });
    } catch (err) {
      self.postMessage({ id: e.data.id, error: err });
    }
  }
};
