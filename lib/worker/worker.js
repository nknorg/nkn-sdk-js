'use strict';

var crypto = _interopRequireWildcard(require("../common/crypto"));

var util = _interopRequireWildcard(require("../common/util"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

module.exports = function (self) {
  let key;

  self.onmessage = async function (e) {
    try {
      let result = null;

      switch (e.data.action) {
        case 'setSeed':
          if (!key) {
            key = crypto.keyPair(e.data.seed);
          } else if (e.data.seed !== key.seed) {
            throw 'cannot set to different seed';
          }

          break;

        case 'computeSharedKey':
          if (key) {
            result = await crypto.computeSharedKey(key.curvePrivateKey, e.data.otherPubkey);
          } else {
            throw 'worker key not created';
          }

          break;

        case 'sign':
          if (key) {
            result = await crypto.sign(key.privateKey, e.data.message);
          } else {
            throw 'worker key not created';
          }

          break;

        default:
          throw 'unknown action: ' + e.data.action;
      }

      self.postMessage({
        id: e.data.id,
        result
      });
    } catch (err) {
      self.postMessage({
        id: e.data.id,
        error: err
      });
    }
  };
};