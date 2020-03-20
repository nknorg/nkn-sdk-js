'use strict';

import Key from './key';

module.exports = function(self) {
  let key;
  self.onmessage = function(e) {
    try {
      let result;
      switch (e.data.action) {
        case 'setSeed':
          if (!key) {
            key = new Key(e.data.seed, { worker: false });
          }
          break;
        case 'computeSharedKey':
          if (key) {
            result = key._computeSharedKey(e.data.otherPubkey);
          } else {
            throw 'worker key not created';
          }
          break;
        case 'sign':
          if (key) {
            result = key._sign(e.data.message);
          } else {
            throw 'worker key not created';
          }
          break;
        default:
          throw 'unknown action: ' + e.data.action;
      }
      if (result !== undefined) {
        self.postMessage({ id: e.data.id, result });
      }
    } catch (e) {
      self.postMessage({ id: e.data.id, error: e });
    }
  }
};
