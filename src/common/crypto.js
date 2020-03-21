'use strict';

import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';

import * as util from './util';

export function computeSharedKey(myCurveSecretKey, otherPubkey) {
  let otherCurvePubkey = ed2curve.convertPublicKey(util.hexToBytes(otherPubkey));
  let sharedKey = nacl.box.before(otherCurvePubkey, myCurveSecretKey);
  return util.bytesToHex(sharedKey);
}

export function sign(secretKey, message) {
  let sig = nacl.sign.detached(Buffer.from(message, 'hex'), secretKey);
  return util.bytesToHex(sig);
}
