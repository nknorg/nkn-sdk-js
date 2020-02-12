'use strict';

export const defaultOptions = {
  reconnectIntervalMin: 1000,
  reconnectIntervalMax: 64000,
  responseTimeout: 5000,
  msgHoldingSeconds: 0,
  encrypt: true,
  seedRpcServerAddr: 'https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet',
}

export const checkTimeoutInterval = 250;
