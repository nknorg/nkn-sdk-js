"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _scryptJs = _interopRequireDefault(require("scrypt-js"));
var _account = _interopRequireDefault(require("./account"));
var address = _interopRequireWildcard(require("./address"));
var common = _interopRequireWildcard(require("../common"));
var consts = _interopRequireWildcard(require("./consts"));
var transaction = _interopRequireWildcard(require("./transaction"));
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
/**
 * NKN client that sends data to and receives data from other NKN clients.
 * @param {Object} options - Wallet options.
 * @param {string} [options.seed=undefined] - Secret seed (64 hex characters). If empty, a random seed will be used.
 * @param {string} options.password - Wallet password.
 * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address.
 * @param {string} [options.iv=undefined] - AES iv, typically you should use Wallet.fromJSON instead of this field.
 * @param {string} [options.masterKey=undefined] - AES master key, typically you should use Wallet.fromJSON instead of this field.
 * @param {boolean|function} [options.worker=false] - Whether to use web workers (if available) to compute signatures. Can also be a function that returns web worker. Typically you only need to set it to a function if you import nkn-sdk as a module and are NOT using browserify or webpack worker-loader to bundle js file. The worker file is located at `lib/worker/webpack.worker.js`.
 */
var Wallet = exports["default"] = /*#__PURE__*/function () {
  function Wallet() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, Wallet);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "account", void 0);
    _defineProperty(this, "iv", void 0);
    _defineProperty(this, "masterKey", void 0);
    /**
     * Wallet address, which is a string starts with 'NKN'.
     */
    _defineProperty(this, "address", void 0);
    _defineProperty(this, "programHash", void 0);
    _defineProperty(this, "seedEncrypted", void 0);
    _defineProperty(this, "scryptParams", void 0);
    /**
     * Wallet version.
     */
    _defineProperty(this, "version", void 0);
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    this.version = options.version || Wallet.version;
    switch (this.version) {
      case 2:
        this.scryptParams = common.util.assignDefined({}, consts.scryptParams, options.scrypt);
        this.scryptParams.salt = this.scryptParams.salt || common.util.randomBytesHex(this.scryptParams.saltLen);
        break;
    }
    this.options = options;
    this.account = new _account["default"](options.seed, {
      worker: options.worker
    });
    this.address = this.account.address;
    this.programHash = this.account.programHash;
    if (options.iv || options.masterKey || options.password || options.passwordKey) {
      this._completeWallet(Object.assign({}, options, {
        async: false
      }));
    }
    delete options.seed;
    delete options.iv;
    delete options.masterKey;
    delete options.password;
    delete options.passwordKey;
  }
  return _createClass(Wallet, [{
    key: "_completeWallet",
    value: function _completeWallet() {
      var _this = this;
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (this.seedEncrypted) {
        if (options.async) {
          return Promise.resolve();
        } else {
          return;
        }
      }
      var completeWallet = function completeWallet(passwordKey) {
        var iv = options.iv || common.util.randomBytesHex(16);
        var masterKey = options.masterKey || common.util.randomBytesHex(32);
        _this.iv = iv;
        _this.masterKey = common.aes.encrypt(masterKey, passwordKey, iv);
        _this.seedEncrypted = common.aes.encrypt(_this.account.getSeed(), masterKey, iv);
      };
      var passwordKey;
      if (options.passwordKey && options.passwordKey["" + this.version]) {
        passwordKey = options.passwordKey["" + this.version];
      } else {
        if (options.async) {
          return Wallet._computePasswordKey({
            version: this.version,
            password: options.password || "",
            scrypt: this.scryptParams,
            async: true
          }).then(completeWallet);
        } else {
          passwordKey = Wallet._computePasswordKey({
            version: this.version,
            password: options.password || "",
            scrypt: this.scryptParams,
            async: false
          });
        }
      }
      completeWallet(passwordKey);
      if (options.async) {
        return Promise.resolve();
      } else {
        return;
      }
    }

    /**
     * Recover wallet from JSON string and password.
     * @param {string|Object} walletJson - Wallet JSON string or object.
     * @param {Object} options - Wallet options.
     * @param {string} options.password - Wallet password.
     * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address.
     * @param {bool} [options.async=false] - If true, return value will be a promise that resolves with the wallet object, and more importantly, the underlying scrypt computation will not block eventloop.
     */
  }, {
    key: "toJSON",
    value:
    /**
     * Return the wallet object to be serialized by JSON.
     */
    function toJSON() {
      this._completeWallet({
        async: false
      });
      var walletJson = {
        Version: this.version,
        MasterKey: this.masterKey,
        IV: this.iv,
        SeedEncrypted: this.seedEncrypted,
        Address: this.address
      };
      if (this.scryptParams) {
        walletJson.Scrypt = {
          Salt: this.scryptParams.salt,
          N: this.scryptParams.N,
          R: this.scryptParams.r,
          P: this.scryptParams.p
        };
      }
      return walletJson;
    }

    /**
     * Get the secret seed of the wallet.
     * @returns Secret seed as hex string.
     */
  }, {
    key: "getSeed",
    value: function getSeed() {
      return this.account.getSeed();
    }

    /**
     * Get the public key of the wallet.
     * @returns Public key as hex string.
     */
  }, {
    key: "getPublicKey",
    value: function getPublicKey() {
      return this.account.getPublicKey();
    }

    /**
     * Verify whether an address is a valid NKN wallet address.
     */
  }, {
    key: "_verifyPassword",
    value: function _verifyPassword(passwordKey) {
      this._completeWallet({
        async: false
      });
      var masterKey = common.aes.decrypt(this.masterKey, passwordKey, this.iv);
      var seed = common.aes.decrypt(this.seedEncrypted, masterKey, this.iv);
      var account = new _account["default"](seed, {
        worker: false
      });
      return account.address === this.address;
    }

    /**
     * Verify whether the password is the correct password of this wallet.
     * @param {Object} options - Verify password options.
     * @param {bool} [options.async=false] - If true, return value will be a promise, and more importantly, the underlying scrypt computation will not block eventloop.
     */
  }, {
    key: "verifyPassword",
    value: function verifyPassword(password) {
      var _this2 = this;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var opts = {
        version: this.version,
        password: password,
        scrypt: this.scryptParams,
        async: options.async
      };
      if (options.async) {
        var _verifyPassword2 = /*#__PURE__*/function () {
          var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var passwordKey;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return _this2._completeWallet({
                    async: true
                  });
                case 2:
                  _context.next = 4;
                  return Wallet._computePasswordKey(opts);
                case 4:
                  passwordKey = _context.sent;
                  return _context.abrupt("return", _this2._verifyPassword(passwordKey));
                case 6:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          return function _verifyPassword2() {
            return _ref.apply(this, arguments);
          };
        }();
        return _verifyPassword2();
      } else {
        this._completeWallet({
          async: false
        });
        var passwordKey = Wallet._computePasswordKey(opts);
        return this._verifyPassword(passwordKey);
      }
    }

    /**
     * Get latest block height and hash.
     * @param {Object} [options={}] - Get nonce options.
     * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
     */
  }, {
    key: "getLatestBlock",
    value:
    /**
     * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
     * wallet's rpcServerAddr as rpcServerAddr.
     */
    function getLatestBlock() {
      return Wallet.getLatestBlock(this.options);
    }

    /**
     * Get the registrant's public key and expiration block height of a name. If
     * name is not registered, `registrant` will be '' and `expiresAt` will be 0.
     */
  }, {
    key: "getRegistrant",
    value:
    /**
     * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
     * wallet's rpcServerAddr as rpcServerAddr.
     */
    function getRegistrant(name) {
      return Wallet.getRegistrant(name, this.options);
    }

    /**
     * Get subscribers of a topic.
     * @param options - Get subscribers options.
     * @param {number} [options.offset=0] - Offset of subscribers to get.
     * @param {number} [options.limit=1000] - Max number of subscribers to get. This does not affect subscribers in txpool.
     * @param {boolean} [options.meta=false] - Whether to include metadata of subscribers in the topic.
     * @param {boolean} [options.txPool=false] - Whether to include subscribers whose subscribe transaction is still in txpool. Enabling this will get subscribers sooner after they send subscribe transactions, but might affect the correctness of subscribers because transactions in txpool is not guaranteed to be packed into a block.
     * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address.
     * @returns A promise that will be resolved with subscribers info. Note that `options.meta=false/true` will cause results to be an array (of subscriber address) or map (subscriber address -> metadata), respectively.
     */
  }, {
    key: "getSubscribers",
    value:
    /**
     * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
     * wallet's rpcServerAddr as rpcServerAddr.
     */
    function getSubscribers(topic) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return Wallet.getSubscribers(topic, Object.assign({}, this.options, options));
    }

    /**
     * Get subscribers count of a topic (not including txPool).
     */
  }, {
    key: "getSubscribersCount",
    value:
    /**
     * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
     * this wallet's rpcServerAddr as rpcServerAddr.
     */
    function getSubscribersCount(topic) {
      return Wallet.getSubscribersCount(topic, this.options);
    }

    /**
     * Get the subscription details of a subscriber in a topic.
     */
  }, {
    key: "getSubscription",
    value:
    /**
     * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
     * wallet's rpcServerAddr as rpcServerAddr.
     */
    function getSubscription(topic, subscriber) {
      return Wallet.getSubscription(topic, subscriber, this.options);
    }

    /**
     * Get the balance of a NKN wallet address.
     * @param {Object} [options={}] - Get nonce options.
     * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
     */
  }, {
    key: "getBalance",
    value:
    /**
     * Same as [Wallet.getBalance](#walletgetbalance), but using this wallet's
     * rpcServerAddr as rpcServerAddr. If address is not given, this wallet's
     * address will be used.
     */
    function getBalance(address) {
      return Wallet.getBalance(address || this.address, this.options);
    }

    /**
     * Get the next nonce of a NKN wallet address.
     * @param {Object} [options={}] - Get nonce options.
     * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
     * @param {boolean} [options.txPool=true] - Whether to consider transactions in txPool. If true, will return the next nonce after last nonce in txPool, otherwise will return the next nonce after last nonce in ledger.
     */
  }, {
    key: "getNonce",
    value:
    /**
     * Same as [Wallet.getNonce](#walletgetnonce), but using this wallet's
     * rpcServerAddr as rpcServerAddr. If address is not given, this wallet's
     * address will be used.
     */
    function getNonce(address) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = common.util.assignDefined({}, this.options, options);
      return Wallet.getNonce(address || this.address, options);
    }

    /**
     * Send a transaction to RPC server.
     * @param {Object} [options={}] - Send transaction options.
     * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address to query nonce.
     */
  }, {
    key: "sendTransaction",
    value:
    /**
     * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
     * wallet's rpcServerAddr as rpcServerAddr.
     */
    function sendTransaction(txn) {
      return Wallet.sendTransaction(txn, this.options);
    }

    /**
     * Transfer token from this wallet to another wallet address.
     */
  }, {
    key: "transferTo",
    value: function transferTo(toAddress, amount) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return common.rpc.transferTo.call(this, toAddress, amount, options);
    }

    /**
     * Register a name for this wallet's public key at the cost of 10 NKN. The
     * name will be valid for 1,576,800 blocks (around 1 year). Register name
     * currently owned by this wallet will extend the duration of the name to
     * current block height + 1,576,800. Registration will fail if the name is
     * currently owned by another account.
     */
  }, {
    key: "registerName",
    value: function registerName(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return common.rpc.registerName.call(this, name, options);
    }

    /**
     * Transfer a name owned by this wallet to another public key. Does not change
     * the expiration of the name.
     */
  }, {
    key: "transferName",
    value: function transferName(name, recipient) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return common.rpc.transferName.call(this, name, recipient, options);
    }

    /**
     * Delete a name owned by this wallet.
     */
  }, {
    key: "deleteName",
    value: function deleteName(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return common.rpc.deleteName.call(this, name, options);
    }

    /**
     * Subscribe to a topic with an identifier for a number of blocks. Client
     * using the same key pair and identifier will be able to receive messages
     * from this topic. If this (identifier, public key) pair is already
     * subscribed to this topic, the subscription expiration will be extended to
     * current block height + duration.
     * @param {number} duration - Duration in unit of blocks.
     * @param {string} identifier - Client identifier.
     * @param {string} meta - Metadata of this subscription.
     */
  }, {
    key: "subscribe",
    value: function subscribe(topic, duration) {
      var identifier = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
      var meta = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
      var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      return common.rpc.subscribe.call(this, topic, duration, identifier, meta, options);
    }

    /**
     * Unsubscribe from a topic for an identifier. Client using the same key pair
     * and identifier will no longer receive messages from this topic.
     * @param {string} identifier - Client identifier.
     */
  }, {
    key: "unsubscribe",
    value: function unsubscribe(topic) {
      var identifier = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return common.rpc.unsubscribe.call(this, topic, identifier, options);
    }

    /**
     * Create or update a NanoPay channel. NanoPay transaction does not have
     * nonce and will not be sent until you call `sendTransaction` explicitly.
     * @param {number} expiration - NanoPay expiration height.
     * @param {number} id - NanoPay id, should be unique for (this.address, toAddress) pair.
     */
  }, {
    key: "createOrUpdateNanoPay",
    value: (function () {
      var _createOrUpdateNanoPay = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(toAddress, amount, expiration, id) {
        var options,
          pld,
          _args2 = arguments;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              options = _args2.length > 4 && _args2[4] !== undefined ? _args2[4] : {};
              if (address.verifyAddress(toAddress)) {
                _context2.next = 3;
                break;
              }
              throw new common.errors.InvalidAddressError("invalid recipient address");
            case 3:
              if (!id) {
                id = common.util.randomUint64();
              }
              pld = transaction.newNanoPayPayload(this.programHash, address.addressStringToProgramHash(toAddress), id, amount, expiration, expiration);
              _context2.next = 7;
              return this.createTransaction(pld, 0, options);
            case 7:
              return _context2.abrupt("return", _context2.sent);
            case 8:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function createOrUpdateNanoPay(_x, _x2, _x3, _x4) {
        return _createOrUpdateNanoPay.apply(this, arguments);
      }
      return createOrUpdateNanoPay;
    }())
  }, {
    key: "createTransaction",
    value: function createTransaction(pld, nonce) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return transaction.newTransaction(this.account, pld, nonce, options.fee, options.attrs);
    }

    /**
     * Convert a NKN public key to NKN wallet address.
     */
  }], [{
    key: "_computePasswordKey",
    value: function _computePasswordKey(options) {
      // convert all keys to lowercase to be case insensitive
      options = common.util.toLowerKeys(options);
      if (!options.version) {
        throw new common.errors.InvalidArgumentError("missing version field");
      }
      var passwordKey;
      switch (options.version) {
        case 1:
          if (options.async) {
            return Promise.resolve(common.hash.doubleSha256(options.password));
          } else {
            return common.hash.doubleSha256(options.password);
          }
        case 2:
          if (!options.scrypt) {
            throw new common.errors.InvalidArgumentError("missing scrypt field");
          }
          if (!options.scrypt.salt || !options.scrypt.n || !options.scrypt.r || !options.scrypt.p) {
            throw new common.errors.InvalidArgumentError("incomplete scrypt parameters");
          }
          if (options.async) {
            return _scryptJs["default"].scrypt(common.util.utf8ToBytes(options.password), common.util.hexToBytes(options.scrypt.salt), options.scrypt.n, options.scrypt.r, options.scrypt.p, 32).then(common.util.bytesToHex);
          } else {
            return common.util.bytesToHex(_scryptJs["default"].syncScrypt(common.util.utf8ToBytes(options.password), common.util.hexToBytes(options.scrypt.salt), options.scrypt.n, options.scrypt.r, options.scrypt.p, 32));
          }
        default:
          throw new common.errors.InvalidWalletFormatError("unsupported wallet verison " + options.version);
      }
    }
  }, {
    key: "_decryptWallet",
    value: function _decryptWallet(walletObj, options) {
      options.iv = walletObj.iv;
      options.masterKey = common.aes.decrypt(walletObj.masterkey, options.passwordKey, options.iv);
      options.seed = common.aes.decrypt(walletObj.seedencrypted, options.masterKey, options.iv);
      options.passwordKey = _defineProperty({}, walletObj.version, options.passwordKey);
      switch (walletObj.version) {
        case 2:
          options.scrypt = {
            salt: walletObj.scrypt.salt,
            N: walletObj.scrypt.n,
            r: walletObj.scrypt.r,
            p: walletObj.scrypt.p
          };
      }
      var account = new _account["default"](options.seed, {
        worker: false
      });
      if (account.address !== walletObj.address) {
        throw new common.errors.WrongPasswordError();
      }
      return new Wallet(options);
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(walletJson) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var walletObj;
      if (typeof walletJson === "string") {
        walletObj = JSON.parse(walletJson);
      } else {
        walletObj = walletJson;
      }

      // convert all keys to lowercase to be case insensitive
      walletObj = common.util.toLowerKeys(walletObj);
      if (typeof walletObj.version !== "number" || walletObj.version < Wallet.minCompatibleVersion || walletObj.version > Wallet.maxCompatibleVersion) {
        throw new common.errors.InvalidWalletVersionError("invalid wallet version " + walletObj.version + ", should be between " + Wallet.minCompatibleVersion + " and " + Wallet.maxCompatibleVersion);
      }
      if (!walletObj.masterkey) {
        throw new common.errors.InvalidWalletFormatError("missing masterKey field");
      }
      if (!walletObj.iv) {
        throw new common.errors.InvalidWalletFormatError("missing iv field");
      }
      if (!walletObj.seedencrypted) {
        throw new common.errors.InvalidWalletFormatError("missing seedEncrypted field");
      }
      if (!walletObj.address) {
        throw new common.errors.InvalidWalletFormatError("missing address field");
      }
      if (options.async) {
        return Wallet._computePasswordKey(Object.assign({}, walletObj, {
          password: options.password,
          async: true
        })).then(function (passwordKey) {
          return Wallet._decryptWallet(walletObj, Object.assign({}, options, {
            passwordKey: passwordKey
          }));
        });
      } else {
        var passwordKey = Wallet._computePasswordKey(Object.assign({}, walletObj, {
          password: options.password,
          async: false
        }));
        return Wallet._decryptWallet(walletObj, Object.assign({}, options, {
          passwordKey: passwordKey
        }));
      }
    }
  }, {
    key: "verifyAddress",
    value: function verifyAddress(addr) {
      return address.verifyAddress(addr);
    }
  }, {
    key: "getLatestBlock",
    value: function getLatestBlock() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      options = common.util.assignDefined({}, consts.defaultOptions, options);
      return common.rpc.getLatestBlock(options);
    }
  }, {
    key: "getRegistrant",
    value: function getRegistrant(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = common.util.assignDefined({}, consts.defaultOptions, options);
      return common.rpc.getRegistrant(name, options);
    }
  }, {
    key: "getSubscribers",
    value: function getSubscribers(topic) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = common.util.assignDefined({}, consts.defaultOptions, options);
      return common.rpc.getSubscribers(topic, options);
    }
  }, {
    key: "getSubscribersCount",
    value: function getSubscribersCount(topic) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = common.util.assignDefined({}, consts.defaultOptions, options);
      return common.rpc.getSubscribersCount(topic, options);
    }
  }, {
    key: "getSubscription",
    value: function getSubscription(topic, subscriber) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options = common.util.assignDefined({}, consts.defaultOptions, options);
      return common.rpc.getSubscription(topic, subscriber, options);
    }
  }, {
    key: "getBalance",
    value: function getBalance(address) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = common.util.assignDefined({}, consts.defaultOptions, options);
      return common.rpc.getBalance(address, options);
    }
  }, {
    key: "getNonce",
    value: function getNonce(address) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = common.util.assignDefined({}, consts.defaultOptions, options);
      return common.rpc.getNonce(address, options);
    }
  }, {
    key: "sendTransaction",
    value: function sendTransaction(txn) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = common.util.assignDefined({}, consts.defaultOptions, options);
      return common.rpc.sendTransaction(txn, options);
    }
  }, {
    key: "publicKeyToAddress",
    value: function publicKeyToAddress(publicKey) {
      var signatureRedeem = address.publicKeyToSignatureRedeem(publicKey);
      var programHash = address.hexStringToProgramHash(signatureRedeem);
      return address.programHashStringToAddress(programHash);
    }
  }]);
}();
_defineProperty(Wallet, "version", 2);
_defineProperty(Wallet, "minCompatibleVersion", 1);
_defineProperty(Wallet, "maxCompatibleVersion", 2);
/**
 * Create transaction options type.
 * @property {(number|string)} [fee=0] - Transaction fee.
 * @property {string} [attrs=''] - Transaction attributes, cannot exceed 100 bytes.
 * @property {boolean} [buildOnly=false] - Whether to only build transaction but not send it.
 */
/**
 * Transaction options type.
 * @property {(number|string)} [fee=0] - Transaction fee.
 * @property {string} [attrs=''] - Transaction attributes, cannot exceed 100 bytes.
 * @property {boolean} [buildOnly=false] - Whether to only build transaction but not send it.
 * @property {number} [nonce] - Transaction nonce, will get from RPC node if not provided.
 */
/**
 * Transaction hash if `options.buildOnly=false`, otherwise the transaction object.
 */