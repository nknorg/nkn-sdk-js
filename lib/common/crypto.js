'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeSharedKey = computeSharedKey;
exports.sign = sign;

var _tweetnacl = _interopRequireDefault(require("tweetnacl"));

var _ed2curve = _interopRequireDefault(require("ed2curve"));

var util = _interopRequireWildcard(require("./util"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function computeSharedKey(myCurveSecretKey, otherPubkey) {
  let otherCurvePubkey = _ed2curve.default.convertPublicKey(util.hexToBytes(otherPubkey));

  let sharedKey = _tweetnacl.default.box.before(otherCurvePubkey, myCurveSecretKey);

  return util.bytesToHex(sharedKey);
}

function sign(secretKey, message) {
  let sig = _tweetnacl.default.sign.detached(Buffer.from(message, 'hex'), secretKey);

  return util.bytesToHex(sig);
}