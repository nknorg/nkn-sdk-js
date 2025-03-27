"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scryptParams = exports.defaultOptions = void 0;
var defaultOptions = exports.defaultOptions = {
  rpcServerAddr: "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet",
  worker: false
};
var scryptParams = exports.scryptParams = {
  saltLen: 8,
  N: 1 << 15,
  r: 8,
  p: 1
};