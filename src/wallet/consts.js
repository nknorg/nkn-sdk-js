"use strict";

export const defaultOptions = {
  rpcServerAddr: "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet",
  worker: false,
};

export const scryptParams = {
  saltLen: 8,
  N: 1 << 15,
  r: 8,
  p: 1,
};
