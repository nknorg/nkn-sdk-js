'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkTimeoutInterval = exports.defaultOptions = void 0;
const defaultOptions = {
  reconnectIntervalMin: 1000,
  reconnectIntervalMax: 64000,
  responseTimeout: 5000,
  msgHoldingSeconds: 0,
  encrypt: true,
  rpcServerAddr: 'https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet',
  worker: false
};
exports.defaultOptions = defaultOptions;
const checkTimeoutInterval = 250;
exports.checkTimeoutInterval = checkTimeoutInterval;