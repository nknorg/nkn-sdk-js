"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitForChallengeTimeout = exports.defaultPublishOptions = exports.defaultOptions = exports.checkTimeoutInterval = void 0;
var defaultOptions = exports.defaultOptions = {
  reconnectIntervalMin: 1000,
  reconnectIntervalMax: 64000,
  responseTimeout: 5000,
  connectTimeout: 10000,
  msgHoldingSeconds: 0,
  encrypt: true,
  rpcServerAddr: "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet",
  stunServerAddr: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478", "stun:stunserver.stunprotocol.org:3478"],
  worker: false
};
var defaultPublishOptions = exports.defaultPublishOptions = {
  txPool: false,
  offset: 0,
  limit: 1000
};
var checkTimeoutInterval = exports.checkTimeoutInterval = 250;
var waitForChallengeTimeout = exports.waitForChallengeTimeout = 5000;