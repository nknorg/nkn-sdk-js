"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteName = deleteName;
exports.getBalance = getBalance;
exports.getLatestBlock = getLatestBlock;
exports.getNodeState = getNodeState;
exports.getNonce = getNonce;
exports.getPeerAddr = getPeerAddr;
exports.getRegistrant = getRegistrant;
exports.getSubscribers = getSubscribers;
exports.getSubscribersCount = getSubscribersCount;
exports.getSubscription = getSubscription;
exports.getWsAddr = getWsAddr;
exports.getWssAddr = getWssAddr;
exports.registerName = registerName;
exports.rpcCall = rpcCall;
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
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var rpcTimeout = 10000;
var methods = {
  getWsAddr: {
    method: "getwsaddr"
  },
  getWssAddr: {
    method: "getwssaddr"
  },
  getSubscribers: {
    method: "getsubscribers",
    defaultParams: {
      offset: 0,
      limit: 1000,
      meta: false,
      txPool: false
    }
  },
  getSubscribersCount: {
    method: "getsubscriberscount"
  },
  getSubscription: {
    method: "getsubscription"
  },
  getBalanceByAddr: {
    method: "getbalancebyaddr"
  },
  getNonceByAddr: {
    method: "getnoncebyaddr"
  },
  getRegistrant: {
    method: "getregistrant"
  },
  getLatestBlockHash: {
    method: "getlatestblockhash"
  },
  sendRawTransaction: {
    method: "sendrawtransaction"
  },
  getNodeState: {
    method: "getnodestate"
  },
  getPeerAddr: {
    method: "getpeeraddr"
  }
};
var rpc = {};
var _loop = function _loop(method) {
  if (methods.hasOwnProperty(method)) {
    rpc[method] = function (addr, params) {
      params = util.assignDefined({}, methods[method].defaultParams, params);
      return rpcCall(addr, methods[method].method, params);
    };
  }
};
for (var method in methods) {
  _loop(method);
}
function rpcCall(_x, _x2) {
  return _rpcCall.apply(this, arguments);
}
function _rpcCall() {
  _rpcCall = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(addr, method) {
    var params,
      source,
      response,
      data,
      _args = arguments;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          params = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
          source = _axios["default"].CancelToken.source();
          response = null;
          setTimeout(function () {
            if (response === null) {
              source.cancel("rpc timeout");
            }
          }, rpcTimeout);
          _context.prev = 4;
          _context.next = 7;
          return (0, _axios["default"])({
            url: addr,
            method: "POST",
            timeout: rpcTimeout,
            cancelToken: source.token,
            data: {
              id: "nkn-sdk-js",
              jsonrpc: "2.0",
              method: method,
              params: params
            }
          });
        case 7:
          response = _context.sent;
          _context.next = 17;
          break;
        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](4);
          if (!_axios["default"].isCancel(_context.t0)) {
            _context.next = 16;
            break;
          }
          throw new errors.RpcTimeoutError(_context.t0.message);
        case 16:
          throw new errors.RpcError(_context.t0.message);
        case 17:
          data = response.data;
          if (!data.error) {
            _context.next = 20;
            break;
          }
          throw new errors.ServerError(data.error);
        case 20:
          if (!(data.result !== undefined)) {
            _context.next = 22;
            break;
          }
          return _context.abrupt("return", data.result);
        case 22:
          throw new errors.InvalidResponseError("rpc response contains no result or error field");
        case 23:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 10]]);
  }));
  return _rpcCall.apply(this, arguments);
}
function getWsAddr(_x3) {
  return _getWsAddr.apply(this, arguments);
}
function _getWsAddr() {
  _getWsAddr = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(address) {
    var options,
      _args2 = arguments;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          options = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {};
          return _context2.abrupt("return", rpc.getWsAddr(options.rpcServerAddr, {
            address: address
          }));
        case 2:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _getWsAddr.apply(this, arguments);
}
function getWssAddr(_x4) {
  return _getWssAddr.apply(this, arguments);
}
function _getWssAddr() {
  _getWssAddr = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(address) {
    var options,
      _args3 = arguments;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          options = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};
          return _context3.abrupt("return", rpc.getWssAddr(options.rpcServerAddr, {
            address: address
          }));
        case 2:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _getWssAddr.apply(this, arguments);
}
function getLatestBlock() {
  return _getLatestBlock.apply(this, arguments);
}
function _getLatestBlock() {
  _getLatestBlock = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
    var options,
      _args4 = arguments;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          options = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {};
          return _context4.abrupt("return", rpc.getLatestBlockHash(options.rpcServerAddr));
        case 2:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _getLatestBlock.apply(this, arguments);
}
function getRegistrant(_x5) {
  return _getRegistrant.apply(this, arguments);
}
function _getRegistrant() {
  _getRegistrant = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(name) {
    var options,
      _args5 = arguments;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          options = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {};
          return _context5.abrupt("return", rpc.getRegistrant(options.rpcServerAddr, {
            name: name
          }));
        case 2:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return _getRegistrant.apply(this, arguments);
}
function getSubscribers(_x6) {
  return _getSubscribers.apply(this, arguments);
}
function _getSubscribers() {
  _getSubscribers = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(topic) {
    var options,
      _args6 = arguments;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          options = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {};
          return _context6.abrupt("return", rpc.getSubscribers(options.rpcServerAddr, {
            topic: topic,
            offset: options.offset,
            limit: options.limit,
            meta: options.meta,
            txPool: options.txPool
          }));
        case 2:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _getSubscribers.apply(this, arguments);
}
function getSubscribersCount(_x7) {
  return _getSubscribersCount.apply(this, arguments);
}
function _getSubscribersCount() {
  _getSubscribersCount = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(topic) {
    var options,
      _args7 = arguments;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          options = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : {};
          return _context7.abrupt("return", rpc.getSubscribersCount(options.rpcServerAddr, {
            topic: topic
          }));
        case 2:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return _getSubscribersCount.apply(this, arguments);
}
function getSubscription(_x8, _x9) {
  return _getSubscription.apply(this, arguments);
}
function _getSubscription() {
  _getSubscription = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(topic, subscriber) {
    var options,
      _args8 = arguments;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          options = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : {};
          return _context8.abrupt("return", rpc.getSubscription(options.rpcServerAddr, {
            topic: topic,
            subscriber: subscriber
          }));
        case 2:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return _getSubscription.apply(this, arguments);
}
function getBalance(_x10) {
  return _getBalance.apply(this, arguments);
}
function _getBalance() {
  _getBalance = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(address) {
    var options,
      data,
      _args9 = arguments;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          options = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : {};
          if (address) {
            _context9.next = 3;
            break;
          }
          throw new errors.InvalidArgumentError("address is empty");
        case 3:
          _context9.next = 5;
          return rpc.getBalanceByAddr(options.rpcServerAddr, {
            address: address
          });
        case 5:
          data = _context9.sent;
          if (data.amount) {
            _context9.next = 8;
            break;
          }
          throw new errors.InvalidResponseError("amount is empty");
        case 8:
          return _context9.abrupt("return", new _amount["default"](data.amount));
        case 9:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return _getBalance.apply(this, arguments);
}
function getNonce(_x11) {
  return _getNonce.apply(this, arguments);
}
function _getNonce() {
  _getNonce = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(address) {
    var options,
      data,
      nonce,
      _args10 = arguments;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          options = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : {};
          if (address) {
            _context10.next = 3;
            break;
          }
          throw new errors.InvalidArgumentError("address is empty");
        case 3:
          options = util.assignDefined({
            txPool: true
          }, options);
          _context10.next = 6;
          return rpc.getNonceByAddr(options.rpcServerAddr, {
            address: address
          });
        case 6:
          data = _context10.sent;
          if (!(typeof data.nonce !== "number")) {
            _context10.next = 9;
            break;
          }
          throw new errors.InvalidResponseError("nonce is not a number");
        case 9:
          nonce = data.nonce;
          if (options.txPool && data.nonceInTxPool && data.nonceInTxPool > nonce) {
            nonce = data.nonceInTxPool;
          }
          return _context10.abrupt("return", nonce);
        case 12:
        case "end":
          return _context10.stop();
      }
    }, _callee10);
  }));
  return _getNonce.apply(this, arguments);
}
function sendTransaction(_x12) {
  return _sendTransaction.apply(this, arguments);
}
function _sendTransaction() {
  _sendTransaction = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(txn) {
    var options,
      _args11 = arguments;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          options = _args11.length > 1 && _args11[1] !== undefined ? _args11[1] : {};
          return _context11.abrupt("return", rpc.sendRawTransaction(options.rpcServerAddr, {
            tx: util.bytesToHex(txn.serializeBinary())
          }));
        case 2:
        case "end":
          return _context11.stop();
      }
    }, _callee11);
  }));
  return _sendTransaction.apply(this, arguments);
}
function transferTo(_x13, _x14) {
  return _transferTo.apply(this, arguments);
}
function _transferTo() {
  _transferTo = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(toAddress, amount) {
    var options,
      nonce,
      signatureRedeem,
      programHash,
      pld,
      txn,
      _args12 = arguments;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          options = _args12.length > 2 && _args12[2] !== undefined ? _args12[2] : {};
          if (address.verifyAddress(toAddress)) {
            _context12.next = 3;
            break;
          }
          throw new errors.InvalidAddressError("invalid recipient address");
        case 3:
          nonce = options.nonce;
          if (!(nonce === null || nonce === undefined)) {
            _context12.next = 8;
            break;
          }
          _context12.next = 7;
          return this.getNonce();
        case 7:
          nonce = _context12.sent;
        case 8:
          signatureRedeem = address.publicKeyToSignatureRedeem(this.getPublicKey());
          programHash = address.hexStringToProgramHash(signatureRedeem);
          pld = transaction.newTransferPayload(programHash, address.addressStringToProgramHash(toAddress), amount);
          _context12.next = 13;
          return this.createTransaction(pld, nonce, options);
        case 13:
          txn = _context12.sent;
          if (!options.buildOnly) {
            _context12.next = 18;
            break;
          }
          _context12.t0 = txn;
          _context12.next = 21;
          break;
        case 18:
          _context12.next = 20;
          return this.sendTransaction(txn);
        case 20:
          _context12.t0 = _context12.sent;
        case 21:
          return _context12.abrupt("return", _context12.t0);
        case 22:
        case "end":
          return _context12.stop();
      }
    }, _callee12, this);
  }));
  return _transferTo.apply(this, arguments);
}
function registerName(_x15) {
  return _registerName.apply(this, arguments);
}
function _registerName() {
  _registerName = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(name) {
    var options,
      nonce,
      pld,
      txn,
      _args13 = arguments;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          options = _args13.length > 1 && _args13[1] !== undefined ? _args13[1] : {};
          nonce = options.nonce;
          if (!(nonce === null || nonce === undefined)) {
            _context13.next = 6;
            break;
          }
          _context13.next = 5;
          return this.getNonce();
        case 5:
          nonce = _context13.sent;
        case 6:
          pld = transaction.newRegisterNamePayload(this.getPublicKey(), name);
          _context13.next = 9;
          return this.createTransaction(pld, nonce, options);
        case 9:
          txn = _context13.sent;
          if (!options.buildOnly) {
            _context13.next = 14;
            break;
          }
          _context13.t0 = txn;
          _context13.next = 17;
          break;
        case 14:
          _context13.next = 16;
          return this.sendTransaction(txn);
        case 16:
          _context13.t0 = _context13.sent;
        case 17:
          return _context13.abrupt("return", _context13.t0);
        case 18:
        case "end":
          return _context13.stop();
      }
    }, _callee13, this);
  }));
  return _registerName.apply(this, arguments);
}
function transferName(_x16, _x17) {
  return _transferName.apply(this, arguments);
}
function _transferName() {
  _transferName = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14(name, recipient) {
    var options,
      nonce,
      pld,
      txn,
      _args14 = arguments;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          options = _args14.length > 2 && _args14[2] !== undefined ? _args14[2] : {};
          nonce = options.nonce;
          if (!(nonce === null || nonce === undefined)) {
            _context14.next = 6;
            break;
          }
          _context14.next = 5;
          return this.getNonce();
        case 5:
          nonce = _context14.sent;
        case 6:
          pld = transaction.newTransferNamePayload(name, this.getPublicKey(), recipient);
          _context14.next = 9;
          return this.createTransaction(pld, nonce, options);
        case 9:
          txn = _context14.sent;
          if (!options.buildOnly) {
            _context14.next = 14;
            break;
          }
          _context14.t0 = txn;
          _context14.next = 17;
          break;
        case 14:
          _context14.next = 16;
          return this.sendTransaction(txn);
        case 16:
          _context14.t0 = _context14.sent;
        case 17:
          return _context14.abrupt("return", _context14.t0);
        case 18:
        case "end":
          return _context14.stop();
      }
    }, _callee14, this);
  }));
  return _transferName.apply(this, arguments);
}
function deleteName(_x18) {
  return _deleteName.apply(this, arguments);
}
function _deleteName() {
  _deleteName = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15(name) {
    var options,
      nonce,
      pld,
      txn,
      _args15 = arguments;
    return _regeneratorRuntime().wrap(function _callee15$(_context15) {
      while (1) switch (_context15.prev = _context15.next) {
        case 0:
          options = _args15.length > 1 && _args15[1] !== undefined ? _args15[1] : {};
          nonce = options.nonce;
          if (!(nonce === null || nonce === undefined)) {
            _context15.next = 6;
            break;
          }
          _context15.next = 5;
          return this.getNonce();
        case 5:
          nonce = _context15.sent;
        case 6:
          pld = transaction.newDeleteNamePayload(this.getPublicKey(), name);
          _context15.next = 9;
          return this.createTransaction(pld, nonce, options);
        case 9:
          txn = _context15.sent;
          if (!options.buildOnly) {
            _context15.next = 14;
            break;
          }
          _context15.t0 = txn;
          _context15.next = 17;
          break;
        case 14:
          _context15.next = 16;
          return this.sendTransaction(txn);
        case 16:
          _context15.t0 = _context15.sent;
        case 17:
          return _context15.abrupt("return", _context15.t0);
        case 18:
        case "end":
          return _context15.stop();
      }
    }, _callee15, this);
  }));
  return _deleteName.apply(this, arguments);
}
function subscribe(_x19, _x20, _x21, _x22) {
  return _subscribe.apply(this, arguments);
}
function _subscribe() {
  _subscribe = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee16(topic, duration, identifier, meta) {
    var options,
      nonce,
      pld,
      txn,
      _args16 = arguments;
    return _regeneratorRuntime().wrap(function _callee16$(_context16) {
      while (1) switch (_context16.prev = _context16.next) {
        case 0:
          options = _args16.length > 4 && _args16[4] !== undefined ? _args16[4] : {};
          nonce = options.nonce;
          if (!(nonce === null || nonce === undefined)) {
            _context16.next = 6;
            break;
          }
          _context16.next = 5;
          return this.getNonce();
        case 5:
          nonce = _context16.sent;
        case 6:
          pld = transaction.newSubscribePayload(this.getPublicKey(), identifier, topic, duration, meta);
          _context16.next = 9;
          return this.createTransaction(pld, nonce, options);
        case 9:
          txn = _context16.sent;
          if (!options.buildOnly) {
            _context16.next = 14;
            break;
          }
          _context16.t0 = txn;
          _context16.next = 17;
          break;
        case 14:
          _context16.next = 16;
          return this.sendTransaction(txn);
        case 16:
          _context16.t0 = _context16.sent;
        case 17:
          return _context16.abrupt("return", _context16.t0);
        case 18:
        case "end":
          return _context16.stop();
      }
    }, _callee16, this);
  }));
  return _subscribe.apply(this, arguments);
}
function unsubscribe(_x23, _x24) {
  return _unsubscribe.apply(this, arguments);
}
function _unsubscribe() {
  _unsubscribe = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee17(topic, identifier) {
    var options,
      nonce,
      pld,
      txn,
      _args17 = arguments;
    return _regeneratorRuntime().wrap(function _callee17$(_context17) {
      while (1) switch (_context17.prev = _context17.next) {
        case 0:
          options = _args17.length > 2 && _args17[2] !== undefined ? _args17[2] : {};
          nonce = options.nonce;
          if (!(nonce === null || nonce === undefined)) {
            _context17.next = 6;
            break;
          }
          _context17.next = 5;
          return this.getNonce();
        case 5:
          nonce = _context17.sent;
        case 6:
          pld = transaction.newUnsubscribePayload(this.getPublicKey(), identifier, topic);
          _context17.next = 9;
          return this.createTransaction(pld, nonce, options);
        case 9:
          txn = _context17.sent;
          if (!options.buildOnly) {
            _context17.next = 14;
            break;
          }
          _context17.t0 = txn;
          _context17.next = 17;
          break;
        case 14:
          _context17.next = 16;
          return this.sendTransaction(txn);
        case 16:
          _context17.t0 = _context17.sent;
        case 17:
          return _context17.abrupt("return", _context17.t0);
        case 18:
        case "end":
          return _context17.stop();
      }
    }, _callee17, this);
  }));
  return _unsubscribe.apply(this, arguments);
}
function getNodeState() {
  return _getNodeState.apply(this, arguments);
}
function _getNodeState() {
  _getNodeState = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee18() {
    var options,
      _args18 = arguments;
    return _regeneratorRuntime().wrap(function _callee18$(_context18) {
      while (1) switch (_context18.prev = _context18.next) {
        case 0:
          options = _args18.length > 0 && _args18[0] !== undefined ? _args18[0] : {};
          return _context18.abrupt("return", rpc.getNodeState(options.rpcServerAddr));
        case 2:
        case "end":
          return _context18.stop();
      }
    }, _callee18);
  }));
  return _getNodeState.apply(this, arguments);
}
function getPeerAddr(_x25) {
  return _getPeerAddr.apply(this, arguments);
}
function _getPeerAddr() {
  _getPeerAddr = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee19(address) {
    var options,
      _args19 = arguments;
    return _regeneratorRuntime().wrap(function _callee19$(_context19) {
      while (1) switch (_context19.prev = _context19.next) {
        case 0:
          options = _args19.length > 1 && _args19[1] !== undefined ? _args19[1] : {};
          return _context19.abrupt("return", rpc.getPeerAddr(options.rpcServerAddr, {
            address: address,
            offer: options.offer
          }));
        case 2:
        case "end":
          return _context19.stop();
      }
    }, _callee19);
  }));
  return _getPeerAddr.apply(this, arguments);
}