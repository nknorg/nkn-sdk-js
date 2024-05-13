"use strict";

export const defaultOptions = {
  reconnectIntervalMin: 1000,
  reconnectIntervalMax: 64000,
  responseTimeout: 5000,
  connectTimeout: 10000,
  msgHoldingSeconds: 0,
  encrypt: true,
  rpcServerAddr: "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet",
  stunServerAddr: [
    "stun:stun.l.google.com:19302",
    "stun:stun.cloudflare.com:3478",
    "stun:stunserver.stunprotocol.org:3478",
  ],
  worker: false,
};

export const defaultPublishOptions = {
  txPool: false,
  offset: 0,
  limit: 1000,
};

export const checkTimeoutInterval = 250;

export const waitForChallengeTimeout = 5000;
