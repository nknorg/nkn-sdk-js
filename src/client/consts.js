'use strict';

export const defaultOptions = {
  reconnectIntervalMin: 1000,
  reconnectIntervalMax: 64000,
  responseTimeout: 5000,
  msgHoldingSeconds: 0,
  encrypt: true,
  rpcServerAddr: 'https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet',
  worker: false,
}

export const defaultPublishOptions = {
  txPool: false,
  offset: 0,
  limit: 1000,
}

export const checkTimeoutInterval = 250;

export const waitForChallengeTimeout = 5000;
