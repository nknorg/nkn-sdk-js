'use strict';

var _axios = _interopRequireDefault(require("axios"));

var errors = _interopRequireWildcard(require("./errors"));

var util = _interopRequireWildcard(require("./util"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  sendRawTransaction: {
    method: 'sendrawtransaction'
  }
};
var exported = {};

for (let method in methods) {
  if (methods.hasOwnProperty(method)) {
    exported[method] = (addr, params) => {
      params = util.assignDefined({}, methods[method].defaultParams, params);
      return rpcCall(addr, methods[method].method, params);
    };
  }
}

async function rpcCall(addr, method, params = {}) {
  let response = await (0, _axios.default)({
    url: addr,
    method: 'POST',
    timeout: 10000,
    data: {
      id: 'nkn-sdk-js',
      jsonrpc: '2.0',
      method: method,
      params: params
    }
  });
  let data = response.data;

  if (data.error) {
    throw new errors.ServerError(data.error);
  }

  if (data.result !== undefined) {
    return data.result;
  }

  throw new errors.InvalidResponseError('rpc response contains no result or error field');
}

module.exports = exported;