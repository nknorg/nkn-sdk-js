"use strict";

import axios from "axios";

import Amount from "./amount";
import * as address from "../wallet/address";
import * as errors from "./errors";
import * as transaction from "../wallet/transaction";
import * as util from "./util";

const rpcTimeout = 10000;

const methods = {
  getWsAddr: { method: "getwsaddr" },
  getWssAddr: { method: "getwssaddr" },
  getSubscribers: {
    method: "getsubscribers",
    defaultParams: { offset: 0, limit: 1000, meta: false, txPool: false },
  },
  getSubscribersCount: { method: "getsubscriberscount" },
  getSubscription: { method: "getsubscription" },
  getBalanceByAddr: { method: "getbalancebyaddr" },
  getNonceByAddr: { method: "getnoncebyaddr" },
  getRegistrant: { method: "getregistrant" },
  getLatestBlockHash: { method: "getlatestblockhash" },
  sendRawTransaction: { method: "sendrawtransaction" },
  getNodeState: { method: "getnodestate" },
  getPeerAddr: { method: "getpeeraddr" },
};

var rpc = {};
for (let method in methods) {
  if (methods.hasOwnProperty(method)) {
    rpc[method] = (addr, params) => {
      params = util.assignDefined({}, methods[method].defaultParams, params);
      return rpcCall(addr, methods[method].method, params);
    };
  }
}

export async function rpcCall(addr, method, params = {}) {
  const source = axios.CancelToken.source();
  let response = null;

  setTimeout(() => {
    if (response === null) {
      source.cancel("rpc timeout");
    }
  }, rpcTimeout);

  try {
    response = await axios({
      url: addr,
      method: "POST",
      timeout: rpcTimeout,
      cancelToken: source.token,
      data: {
        id: "nkn-sdk-js",
        jsonrpc: "2.0",
        method: method,
        params: params,
      },
    });
  } catch (e) {
    if (axios.isCancel(e)) {
      throw new errors.RpcTimeoutError(e.message);
    } else {
      throw new errors.RpcError(e.message);
    }
  }

  let data = response.data;

  if (data.error) {
    throw new errors.ServerError(data.error);
  }

  if (data.result !== undefined) {
    return data.result;
  }

  throw new errors.InvalidResponseError(
    "rpc response contains no result or error field",
  );
}

export async function getWsAddr(address, options = {}) {
  return rpc.getWsAddr(options.rpcServerAddr, { address });
}

export async function getWssAddr(address, options = {}) {
  return rpc.getWssAddr(options.rpcServerAddr, { address });
}

export async function getLatestBlock(options = {}) {
  return rpc.getLatestBlockHash(options.rpcServerAddr);
}

export async function getRegistrant(name, options = {}) {
  return rpc.getRegistrant(options.rpcServerAddr, { name });
}

export async function getSubscribers(topic, options = {}) {
  return rpc.getSubscribers(options.rpcServerAddr, {
    topic,
    offset: options.offset,
    limit: options.limit,
    meta: options.meta,
    txPool: options.txPool,
  });
}

export async function getSubscribersCount(topic, options = {}) {
  return rpc.getSubscribersCount(options.rpcServerAddr, { topic });
}

export async function getSubscription(topic, subscriber, options = {}) {
  return rpc.getSubscription(options.rpcServerAddr, { topic, subscriber });
}

export async function getBalance(address, options = {}) {
  if (!address) {
    throw new errors.InvalidArgumentError("address is empty");
  }
  let data = await rpc.getBalanceByAddr(options.rpcServerAddr, { address });
  if (!data.amount) {
    throw new errors.InvalidResponseError("amount is empty");
  }
  return new Amount(data.amount);
}

export async function getNonce(address, options = {}) {
  if (!address) {
    throw new errors.InvalidArgumentError("address is empty");
  }
  options = util.assignDefined({ txPool: true }, options);
  let data = await rpc.getNonceByAddr(options.rpcServerAddr, { address });
  if (typeof data.nonce !== "number") {
    throw new errors.InvalidResponseError("nonce is not a number");
  }
  let nonce = data.nonce;
  if (options.txPool && data.nonceInTxPool && data.nonceInTxPool > nonce) {
    nonce = data.nonceInTxPool;
  }
  return nonce;
}

export async function sendTransaction(txn, options = {}) {
  return rpc.sendRawTransaction(options.rpcServerAddr, {
    tx: util.bytesToHex(txn.serializeBinary()),
  });
}

export async function transferTo(toAddress, amount, options = {}) {
  if (!address.verifyAddress(toAddress)) {
    throw new errors.InvalidAddressError("invalid recipient address");
  }
  let nonce = options.nonce;
  if (nonce === null || nonce === undefined) {
    nonce = await this.getNonce();
  }
  let signatureRedeem = address.publicKeyToSignatureRedeem(this.getPublicKey());
  let programHash = address.hexStringToProgramHash(signatureRedeem);
  let pld = transaction.newTransferPayload(
    programHash,
    address.addressStringToProgramHash(toAddress),
    amount,
  );
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

export async function registerName(name, options = {}) {
  let nonce = options.nonce;
  if (nonce === null || nonce === undefined) {
    nonce = await this.getNonce();
  }
  let pld = transaction.newRegisterNamePayload(this.getPublicKey(), name);
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

export async function transferName(name, recipient, options = {}) {
  let nonce = options.nonce;
  if (nonce === null || nonce === undefined) {
    nonce = await this.getNonce();
  }
  let pld = transaction.newTransferNamePayload(
    name,
    this.getPublicKey(),
    recipient,
  );
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

export async function deleteName(name, options = {}) {
  let nonce = options.nonce;
  if (nonce === null || nonce === undefined) {
    nonce = await this.getNonce();
  }
  let pld = transaction.newDeleteNamePayload(this.getPublicKey(), name);
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

export async function subscribe(
  topic,
  duration,
  identifier,
  meta,
  options = {},
) {
  let nonce = options.nonce;
  if (nonce === null || nonce === undefined) {
    nonce = await this.getNonce();
  }
  let pld = transaction.newSubscribePayload(
    this.getPublicKey(),
    identifier,
    topic,
    duration,
    meta,
  );
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

export async function unsubscribe(topic, identifier, options = {}) {
  let nonce = options.nonce;
  if (nonce === null || nonce === undefined) {
    nonce = await this.getNonce();
  }
  let pld = transaction.newUnsubscribePayload(
    this.getPublicKey(),
    identifier,
    topic,
  );
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

export async function getNodeState(options = {}) {
  return rpc.getNodeState(options.rpcServerAddr);
}

export async function getPeerAddr(address, options = {}) {
  return rpc.getPeerAddr(options.rpcServerAddr, {
    address,
    offer: options.offer,
  });
}
