'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteName = deleteName;
exports.getBalance = getBalance;
exports.getLatestBlock = getLatestBlock;
exports.getNonce = getNonce;
exports.getRegistrant = getRegistrant;
exports.getSubscribers = getSubscribers;
exports.getSubscribersCount = getSubscribersCount;
exports.getSubscription = getSubscription;
exports.getWsAddr = getWsAddr;
exports.getWssAddr = getWssAddr;
exports.registerName = registerName;
exports.sendTransaction = sendTransaction;
exports.subscribe = subscribe;
exports.transferName = transferName;
exports.transferTo = transferTo;
exports.unsubscribe = unsubscribe;

var _axios = _interopRequireDefault(require("axios"));

var _amount = _interopRequireDefault(require("./amount"));

var address = _interopRequireWildcard(require("../wallet/address"));

var errors = _interopRequireWildcard(require("./errors"));

var transaction = _interopRequireWildcard(require("../wallet/transaction"));

var util = _interopRequireWildcard(require("./util"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rpcTimeout = 10000;
const methods = {
  getWsAddr: {
    method: 'getwsaddr'
  },
  getWssAddr: {
    method: 'getwssaddr'
  },
  getSubscribers: {
    method: 'getsubscribers',
    defaultParams: {
      offset: 0,
      limit: 1000,
      meta: false,
      txPool: false
    }
  },
  getSubscribersCount: {
    method: 'getsubscriberscount'
  },
  getSubscription: {
    method: 'getsubscription'
  },
  getBalanceByAddr: {
    method: 'getbalancebyaddr'
  },
  getNonceByAddr: {
    method: 'getnoncebyaddr'
  },
  getRegistrant: {
    method: 'getregistrant'
  },
  getLatestBlockHash: {
    method: 'getlatestblockhash'
  },
  sendRawTransaction: {
    method: 'sendrawtransaction'
  }
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

async function rpcCall(addr, method, params = {}) {
  const source = _axios.default.CancelToken.source();

  let response = null;
  setTimeout(() => {
    if (response === null) {
      source.cancel('rpc timeout');
    }
  }, rpcTimeout);

  try {
    response = await (0, _axios.default)({
      url: addr,
      method: 'POST',
      timeout: rpcTimeout,
      cancelToken: source.token,
      data: {
        id: 'nkn-sdk-js',
        jsonrpc: '2.0',
        method: method,
        params: params
      }
    });
  } catch (e) {
    if (_axios.default.isCancel(e)) {
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

  throw new errors.InvalidResponseError('rpc response contains no result or error field');
}

async function getWsAddr(address, options = {}) {
  return rpc.getWsAddr(options.rpcServerAddr, {
    address
  });
}

async function getWssAddr(address, options = {}) {
  return rpc.getWssAddr(options.rpcServerAddr, {
    address
  });
}

async function getLatestBlock(options = {}) {
  return rpc.getLatestBlockHash(options.rpcServerAddr);
}

async function getRegistrant(name, options = {}) {
  return rpc.getRegistrant(options.rpcServerAddr, {
    name
  });
}

async function getSubscribers(topic, options = {}) {
  return rpc.getSubscribers(options.rpcServerAddr, {
    topic,
    offset: options.offset,
    limit: options.limit,
    meta: options.meta,
    txPool: options.txPool
  });
}

async function getSubscribersCount(topic, options = {}) {
  return rpc.getSubscribersCount(options.rpcServerAddr, {
    topic
  });
}

async function getSubscription(topic, subscriber, options = {}) {
  return rpc.getSubscription(options.rpcServerAddr, {
    topic,
    subscriber
  });
}

async function getBalance(address, options = {}) {
  if (!address) {
    throw new errors.InvalidArgumentError('address is empty');
  }

  let data = await rpc.getBalanceByAddr(options.rpcServerAddr, {
    address
  });

  if (!data.amount) {
    throw new errors.InvalidResponseError('amount is empty');
  }

  return new _amount.default(data.amount);
}

async function getNonce(address, options = {}) {
  if (!address) {
    throw new errors.InvalidArgumentError('address is empty');
  }

  options = util.assignDefined({
    txPool: true
  }, options);
  let data = await rpc.getNonceByAddr(options.rpcServerAddr, {
    address
  });

  if (typeof data.nonce !== 'number') {
    throw new errors.InvalidResponseError('nonce is not a number');
  }

  let nonce = data.nonce;

  if (options.txPool && data.nonceInTxPool && data.nonceInTxPool > nonce) {
    nonce = data.nonceInTxPool;
  }

  return nonce;
}

async function sendTransaction(txn, options = {}) {
  return rpc.sendRawTransaction(options.rpcServerAddr, {
    tx: util.bytesToHex(txn.serializeBinary())
  });
}

async function transferTo(toAddress, amount, options = {}) {
  if (!address.verifyAddress(toAddress)) {
    throw new errors.InvalidAddressError('invalid recipient address');
  }

  let nonce = options.nonce || (await this.getNonce());
  let signatureRedeem = address.publicKeyToSignatureRedeem(this.getPublicKey());
  let programHash = address.hexStringToProgramHash(signatureRedeem);
  let pld = transaction.newTransferPayload(programHash, address.addressStringToProgramHash(toAddress), amount);
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

async function registerName(name, options = {}) {
  let nonce = options.nonce || (await this.getNonce());
  let pld = transaction.newRegisterNamePayload(this.getPublicKey(), name);
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

async function transferName(name, recipient, options = {}) {
  let nonce = options.nonce || (await this.getNonce());
  let pld = transaction.newTransferNamePayload(name, this.getPublicKey(), recipient);
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

async function deleteName(name, options = {}) {
  let nonce = options.nonce || (await this.getNonce());
  let pld = transaction.newDeleteNamePayload(this.getPublicKey(), name);
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

async function subscribe(topic, duration, identifier, meta, options = {}) {
  let nonce = options.nonce || (await this.getNonce());
  let pld = transaction.newSubscribePayload(this.getPublicKey(), identifier, topic, duration, meta);
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}

async function unsubscribe(topic, identifier, options = {}) {
  let nonce = options.nonce || (await this.getNonce());
  let pld = transaction.newUnsubscribePayload(this.getPublicKey(), identifier, topic);
  let txn = await this.createTransaction(pld, nonce, options);
  return options.buildOnly ? txn : await this.sendTransaction(txn);
}