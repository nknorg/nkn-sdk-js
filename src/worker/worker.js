"use strict";

import * as crypto from "../common/crypto";
import * as util from "../common/util";

module.exports = function (self) {
  let key;
  self.onmessage = async function (e) {
    try {
      let result = null;
      switch (e.data.action) {
        case "setSeed":
          if (!key) {
            key = crypto.keyPair(e.data.seed);
          } else if (e.data.seed !== key.seed) {
            throw "cannot set to different seed";
          }
          break;
        case "computeSharedKey":
          if (key) {
            result = await crypto.computeSharedKey(
              key.curvePrivateKey,
              e.data.otherPubkey,
            );
          } else {
            throw "worker key not created";
          }
          break;
        case "sign":
          if (key) {
            result = await crypto.sign(key.privateKey, e.data.message);
          } else {
            throw "worker key not created";
          }
          break;
        default:
          throw "unknown action: " + e.data.action;
      }
      self.postMessage({ id: e.data.id, result });
    } catch (err) {
      self.postMessage({ id: e.data.id, error: err });
    }
  };
};
