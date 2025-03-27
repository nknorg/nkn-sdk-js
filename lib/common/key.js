"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _webworkify = _interopRequireDefault(require("webworkify"));
var crypto = _interopRequireWildcard(require("./crypto"));
var errors = _interopRequireWildcard(require("./errors"));
var util = _interopRequireWildcard(require("./util"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Key = exports["default"] = /*#__PURE__*/function () {
  function Key(seed) {
    var _this = this;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, Key);
    _defineProperty(this, "seed", void 0);
    _defineProperty(this, "publicKey", void 0);
    _defineProperty(this, "privateKey", void 0);
    _defineProperty(this, "curvePrivateKey", void 0);
    _defineProperty(this, "sharedKeyCache", void 0);
    _defineProperty(this, "useWorker", void 0);
    _defineProperty(this, "worker", void 0);
    _defineProperty(this, "workerMsgID", void 0);
    _defineProperty(this, "workerMsgCache", void 0);
    if (!seed) {
      seed = util.randomBytesHex(crypto.seedLength);
    }
    var key = crypto.keyPair(seed);
    this.seed = seed;
    this.publicKey = util.bytesToHex(key.publicKey);
    this.privateKey = key.privateKey;
    this.curvePrivateKey = key.curvePrivateKey;
    this.sharedKeyCache = new Map();
    this.useWorker = this._shouldUseWorker(options.worker);
    this.worker = null;
    this.workerMsgID = 0;
    this.workerMsgCache = new Map();
    if (this.useWorker) {
      _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var Worker;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              if (!(typeof options.worker === "function")) {
                _context.next = 7;
                break;
              }
              _context.next = 4;
              return options.worker();
            case 4:
              _this.worker = _context.sent;
              _context.next = 21;
              break;
            case 7:
              _context.prev = 7;
              _this.worker = (0, _webworkify["default"])(require("../worker/worker.js"));
              _context.next = 21;
              break;
            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](7);
              _context.prev = 13;
              Worker = require("../worker/webpack.worker.js");
              _this.worker = new Worker();
              _context.next = 21;
              break;
            case 18:
              _context.prev = 18;
              _context.t1 = _context["catch"](13);
              throw "neither browserify nor webpack worker-loader is detected";
            case 21:
              _this.worker.onmessage = function (e) {
                if (e.data.id !== undefined && _this.workerMsgCache.has(e.data.id)) {
                  var msgPromise = _this.workerMsgCache.get(e.data.id);
                  if (e.data.error) {
                    msgPromise.reject(e.data.error);
                  } else {
                    msgPromise.resolve(e.data.result);
                  }
                  _this.workerMsgCache["delete"](e.data.id);
                }
              };
              _context.next = 24;
              return _this._sendToWorker({
                action: "setSeed",
                seed: _this.seed
              });
            case 24:
              _context.next = 30;
              break;
            case 26:
              _context.prev = 26;
              _context.t2 = _context["catch"](0);
              console.warn("Launch web worker failed:", _context.t2);
              _this.useWorker = false;
            case 30:
            case "end":
              return _context.stop();
          }
        }, _callee, null, [[0, 26], [7, 11], [13, 18]]);
      }))();
    }
  }
  return _createClass(Key, [{
    key: "_shouldUseWorker",
    value: function _shouldUseWorker(useWorker) {
      if (!useWorker) {
        return false;
      }
      if (typeof window === "undefined") {
        return false;
      }
      if (!window.Worker) {
        return false;
      }
      return true;
    }
  }, {
    key: "_sendToWorker",
    value: function _sendToWorker(data) {
      var _this2 = this;
      return new Promise(function (resolve, reject) {
        var id = _this2.workerMsgID;
        _this2.workerMsgID++;
        _this2.workerMsgCache.set(id, {
          resolve: resolve,
          reject: reject
        });
        _this2.worker.postMessage(Object.assign({
          id: id
        }, data));
      });
    }
  }, {
    key: "computeSharedKey",
    value: function () {
      var _computeSharedKey = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(otherPubkey) {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (!this.useWorker) {
                _context2.next = 10;
                break;
              }
              _context2.prev = 1;
              _context2.next = 4;
              return this._sendToWorker({
                action: "computeSharedKey",
                otherPubkey: otherPubkey
              });
            case 4:
              return _context2.abrupt("return", _context2.sent);
            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2["catch"](1);
              console.warn("worker computeSharedKey failed, fallback to main thread:", _context2.t0);
            case 10:
              _context2.next = 12;
              return crypto.computeSharedKey(this.curvePrivateKey, otherPubkey);
            case 12:
              return _context2.abrupt("return", _context2.sent);
            case 13:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[1, 7]]);
      }));
      function computeSharedKey(_x) {
        return _computeSharedKey.apply(this, arguments);
      }
      return computeSharedKey;
    }()
  }, {
    key: "getOrComputeSharedKey",
    value: function () {
      var _getOrComputeSharedKey = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(otherPubkey) {
        var sharedKey;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              sharedKey = this.sharedKeyCache.get(otherPubkey);
              if (sharedKey) {
                _context3.next = 6;
                break;
              }
              _context3.next = 4;
              return this.computeSharedKey(otherPubkey);
            case 4:
              sharedKey = _context3.sent;
              this.sharedKeyCache.set(otherPubkey, sharedKey);
            case 6:
              return _context3.abrupt("return", sharedKey);
            case 7:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function getOrComputeSharedKey(_x2) {
        return _getOrComputeSharedKey.apply(this, arguments);
      }
      return getOrComputeSharedKey;
    }()
  }, {
    key: "encrypt",
    value: function () {
      var _encrypt = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(message, destPubkey) {
        var options,
          sharedKey,
          nonce,
          _args4 = arguments;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              options = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : {};
              _context4.next = 3;
              return this.getOrComputeSharedKey(destPubkey);
            case 3:
              sharedKey = _context4.sent;
              sharedKey = Buffer.from(sharedKey, "hex");
              nonce = options.nonce || util.randomBytes(crypto.nonceLength);
              _context4.next = 8;
              return crypto.encryptSymmetric(message, nonce, sharedKey);
            case 8:
              _context4.t0 = _context4.sent;
              _context4.t1 = nonce;
              return _context4.abrupt("return", {
                message: _context4.t0,
                nonce: _context4.t1
              });
            case 11:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function encrypt(_x3, _x4) {
        return _encrypt.apply(this, arguments);
      }
      return encrypt;
    }()
  }, {
    key: "decrypt",
    value: function () {
      var _decrypt = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(message, nonce, srcPubkey) {
        var options,
          sharedKey,
          _args5 = arguments;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              options = _args5.length > 3 && _args5[3] !== undefined ? _args5[3] : {};
              _context5.next = 3;
              return this.getOrComputeSharedKey(srcPubkey);
            case 3:
              sharedKey = _context5.sent;
              sharedKey = Buffer.from(sharedKey, "hex");
              _context5.next = 7;
              return crypto.decryptSymmetric(message, nonce, sharedKey);
            case 7:
              return _context5.abrupt("return", _context5.sent);
            case 8:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function decrypt(_x5, _x6, _x7) {
        return _decrypt.apply(this, arguments);
      }
      return decrypt;
    }()
  }, {
    key: "sign",
    value: function () {
      var _sign = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(message) {
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              if (!this.useWorker) {
                _context6.next = 10;
                break;
              }
              _context6.prev = 1;
              _context6.next = 4;
              return this._sendToWorker({
                action: "sign",
                message: message
              });
            case 4:
              return _context6.abrupt("return", _context6.sent);
            case 7:
              _context6.prev = 7;
              _context6.t0 = _context6["catch"](1);
              console.warn("worker sign failed, fallback to main thread:", _context6.t0);
            case 10:
              _context6.next = 12;
              return crypto.sign(this.privateKey, message);
            case 12:
              return _context6.abrupt("return", _context6.sent);
            case 13:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this, [[1, 7]]);
      }));
      function sign(_x8) {
        return _sign.apply(this, arguments);
      }
      return sign;
    }()
  }]);
}();