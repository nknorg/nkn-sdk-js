'use strict';

import axios from 'axios'

import * as errors from './errors';
import * as util from './util';

const methods = {
  getWsAddr: { method: 'getwsaddr' },
  getWssAddr: { method: 'getwssaddr' },
  getSubscribers: { method: 'getsubscribers', defaultParams: {offset: 0, limit: 1000, meta: false, txPool: false} },
  getSubscribersCount: { method: 'getsubscriberscount' },
  getSubscription: { method: 'getsubscription' },
  getBalanceByAddr: { method: 'getbalancebyaddr' },
  getNonceByAddr: { method: 'getnoncebyaddr' },
  sendRawTransaction: { method: 'sendrawtransaction' },
}

var exported = {};
for (let method in methods) {
  if (methods.hasOwnProperty(method)) {
    exported[method] = (addr, params) => {
      params = util.assignDefined({}, methods[method].defaultParams, params)
      return rpcCall(addr, methods[method].method, params);
    }
  }
}

async function rpcCall(addr, method, params = {}) {
  let response = await axios({
    url: addr,
    method: 'POST',
    timeout: 10000,
    data: {
      id: 'nkn-sdk-js',
      jsonrpc: '2.0',
      method: method,
      params: params,
    },
  });

  let data = response.data;

  if(data.error) {
    throw new errors.ServerError(data.error);
  }

  if(data.result) {
    return data.result;
  }

  throw new errors.InvalidResponseError('rpc response contains no result or error field');
}

module.exports = exported;
