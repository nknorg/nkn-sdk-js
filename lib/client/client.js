"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _isomorphicWs = _interopRequireDefault(require("isomorphic-ws"));
var _wallet = _interopRequireDefault(require("../wallet"));
var common = _interopRequireWildcard(require("../common"));
var _consts = _interopRequireWildcard(require("./consts"));
var consts = _consts;
var message = _interopRequireWildcard(require("./message"));
var _webrtc = _interopRequireDefault(require("./webrtc"));
var crypto = _interopRequireWildcard(require("../common/crypto"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Action = {
  setClient: "setClient",
  updateSigChainBlockHash: "updateSigChainBlockHash",
  authChallenge: "authChallenge"
};
/**
 * NKN client that sends data to and receives data from other NKN clients.
 * Typically you might want to use [MultiClient](#multiclient) for better
 * reliability and lower latency.
 * @param {Object} [options={}] - Client configuration
 * @param {string} [options.seed=undefined] - Secret seed (64 hex characters). If empty, a random seed will be used.
 * @param {string} [options.identifier=undefined] - Identifier used to differentiate multiple clients sharing the same secret seed.
 * @param {number} [options.reconnectIntervalMin=1000] - Minimal reconnect interval in ms.
 * @param {number} [options.reconnectIntervalMax=64000] - Maximal reconnect interval in ms.
 * @param {number} [options.responseTimeout=5000] - Message response timeout in ms. Zero disables timeout.
 * @param {number} [options.connectTimeout=10000] - Websocket/webrtc connect timeout in ms. Zero disables timeout.
 * @param {number} [options.msgHoldingSeconds=0] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 * @param {boolean} [options.encrypt=true] - Whether to end to end encrypt message.
 * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address used to join the network.
 * @param {boolean} [options.webrtc=undefined] - Force to use/not use web rtc if defined. By default, webrtc is used only in https location when tls is undefined.
 * @param {boolean} [options.tls=undefined] - Force to use ws or wss if defined. This option is only used when webrtc is not used. Default is true in https location, otherwise false.
 * @param {string|Array<string>} [options.stunServerAddr=["stun:stun.l.google.com:19302","stun:stun.cloudflare.com:3478","stun:stunserver.stunprotocol.org:3478"]] - Stun server address for webrtc.
 * @param {boolean|function} [options.worker=false] - Whether to use web workers (if available) to compute signatures. Can also be a function that returns web worker. Typically you only need to set it to a function if you import nkn-sdk as a module and are NOT using browserify or webpack worker-loader to bundle js file. The worker file is located at `lib/worker/webpack.worker.js`.
 */
var Client = exports["default"] = /*#__PURE__*/function () {
  function Client() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, Client);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "key", void 0);
    /**
     * Address identifier.
     */
    _defineProperty(this, "identifier", void 0);
    /**
     * Client address, which will be `identifier.pubicKeyHex` if `identifier` is not empty, otherwise just `pubicKeyHex`.
     */
    _defineProperty(this, "addr", void 0);
    _defineProperty(this, "eventListeners", void 0);
    _defineProperty(this, "sigChainBlockHash", void 0);
    _defineProperty(this, "shouldReconnect", void 0);
    _defineProperty(this, "reconnectInterval", void 0);
    _defineProperty(this, "responseManager", void 0);
    _defineProperty(this, "ws", void 0);
    _defineProperty(this, "node", void 0);
    /**
     * Whether client is ready (connected to a node).
     */
    _defineProperty(this, "isReady", void 0);
    /**
     * Whether client fails to connect to node.
     */
    _defineProperty(this, "isFailed", void 0);
    /**
     * Whether client is closed.
     */
    _defineProperty(this, "isClosed", void 0);
    _defineProperty(this, "wallet", void 0);
    /**
     * Webrtc peer end
     * @type {Peer}
     */
    _defineProperty(this, "peer", void 0);
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    var key = new common.Key(options.seed, {
      worker: options.worker
    });
    var identifier = options.identifier || "";
    var pubkey = key.publicKey;
    var addr = (identifier ? identifier + "." : "") + pubkey;
    var wallet = new _wallet["default"](Object.assign({}, options, {
      seed: key.seed,
      worker: false,
      version: 1
    }));
    delete options.seed;
    this.options = options;
    this.key = key;
    this.identifier = identifier;
    this.addr = addr;
    this.eventListeners = {
      connect: [],
      connectFailed: [],
      wsError: [],
      message: []
    };
    this.sigChainBlockHash = null;
    this.shouldReconnect = false;
    this.reconnectInterval = options.reconnectIntervalMin;
    this.responseManager = new ResponseManager();
    this.ws = null;
    this.node = null;
    this.isReady = false;
    this.isFailed = false;
    this.isClosed = false;
    this.wallet = wallet;
    if (options.webrtc === undefined && options.tls === undefined) {
      options.webrtc = this._shouldUseTls();
    }
    if (options.webrtc) {
      this.peer = new _webrtc["default"](options.stunServerAddr);
    }
    this._connect();
  }

  /**
   * Get the secret seed of the client.
   * @returns Secret seed as hex string.
   */
  return _createClass(Client, [{
    key: "getSeed",
    value: function getSeed() {
      return this.key.seed;
    }

    /**
     * Get the public key of the client.
     * @returns Public key as hex string.
     */
  }, {
    key: "getPublicKey",
    value: function getPublicKey() {
      return this.key.publicKey;
    }
  }, {
    key: "_connect",
    value: function () {
      var _connect2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var getAddr, res, error, i, offer;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              getAddr = this._shouldUseTls() ? common.rpc.getWssAddr : common.rpc.getWsAddr;
              i = 0;
            case 2:
              if (!(i < 3)) {
                _context.next = 29;
                break;
              }
              _context.prev = 3;
              if (!this.options.webrtc) {
                _context.next = 13;
                break;
              }
              _context.next = 7;
              return this.peer.offer(this.addr);
            case 7:
              offer = _context.sent;
              _context.next = 10;
              return common.rpc.getPeerAddr(this.addr, {
                rpcServerAddr: this.options.rpcServerAddr,
                offer: offer
              });
            case 10:
              res = _context.sent;
              _context.next = 16;
              break;
            case 13:
              _context.next = 15;
              return getAddr(this.addr, {
                rpcServerAddr: this.options.rpcServerAddr
              });
            case 15:
              res = _context.sent;
            case 16:
              _context.next = 24;
              break;
            case 18:
              _context.prev = 18;
              _context.t0 = _context["catch"](3);
              error = _context.t0;
              if (!(_context.t0 instanceof common.errors.ServerError && _context.t0.message.includes(common.errors.rpcRespErrCodes.invalidMethod.toString()))) {
                _context.next = 23;
                break;
              }
              return _context.abrupt("break", 29);
            case 23:
              return _context.abrupt("continue", 26);
            case 24:
              this._newWsAddr(res);
              return _context.abrupt("return");
            case 26:
              i++;
              _context.next = 2;
              break;
            case 29:
              console.log("RPC call failed,", error);
              if (this.shouldReconnect) {
                this._reconnect();
              } else if (!this.isClosed) {
                this._connectFailed();
              }
            case 31:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[3, 18]]);
      }));
      function _connect() {
        return _connect2.apply(this, arguments);
      }
      return _connect;
    }()
  }, {
    key: "_reconnect",
    value: function _reconnect() {
      var _this = this;
      console.log("Reconnecting in " + this.reconnectInterval / 1000 + "s...");
      setTimeout(function () {
        return _this._connect();
      }, this.reconnectInterval);
      this.reconnectInterval *= 2;
      if (this.reconnectInterval > this.options.reconnectIntervalMax) {
        this.reconnectInterval = this.options.reconnectIntervalMax;
      }
    }
  }, {
    key: "_connectFailed",
    value: function _connectFailed() {
      if (!this.isFailed) {
        this.isFailed = true;
        if (this.eventListeners.connectFailed.length > 0) {
          this.eventListeners.connectFailed.forEach(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(f) {
              return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.prev = 0;
                    _context2.next = 3;
                    return f();
                  case 3:
                    _context2.next = 8;
                    break;
                  case 5:
                    _context2.prev = 5;
                    _context2.t0 = _context2["catch"](0);
                    console.log("Connect failed handler error:", _context2.t0);
                  case 8:
                  case "end":
                    return _context2.stop();
                }
              }, _callee2, null, [[0, 5]]);
            }));
            return function (_x) {
              return _ref.apply(this, arguments);
            };
          }());
        } else {
          console.log("Client connect failed");
        }
      }
    }

    /**
     * @deprecated please use onConnect, onMessage, etc.
     */
  }, {
    key: "on",
    value: function on(evt, func) {
      if (!this.eventListeners[evt]) {
        this.eventListeners[evt] = [];
      }
      this.eventListeners[evt].push(func);
    }

    /**
     * Add event listener function that will be called when client is connected to
     * node. Multiple listeners will be called sequentially in the order of added.
     * Note that listeners added after client is connected to node (i.e.
     * `client.isReady === true`) will not be called.
     */
  }, {
    key: "onConnect",
    value: function onConnect(func) {
      this.eventListeners.connect.push(func);
    }

    /**
     * Add event listener function that will be called when client fails to
     * connect to node. Multiple listeners will be called sequentially in the
     * order of added. Note that listeners added after client fails to connect to
     * node (i.e. `client.isFailed === true`) will not be called.
     */
  }, {
    key: "onConnectFailed",
    value: function onConnectFailed(func) {
      this.eventListeners.connectFailed.push(func);
    }

    /**
     * Add event listener function that will be called when client websocket
     * connection throws an error. Multiple listeners will be called sequentially
     * in the order of added.
     */
  }, {
    key: "onWsError",
    value: function onWsError(func) {
      this.eventListeners.wsError.push(func);
    }

    /**
     * Add event listener function that will be called when client receives a
     * message. Multiple listeners will be called sequentially in the order of
     * added. Can be an async function, in which case each call will wait for
     * promise to resolve before calling next listener function. If the first
     * non-null and non-undefined returned value is `Uint8Array` or `string`,
     * the value will be sent back as reply; if the first non-null and
     * non-undefined returned value is `false`, no reply or ACK will be sent;
     * if all handler functions return `null` or `undefined`, an ACK indicating
     * msg received will be sent back. Receiving reply or ACK will not trigger
     * the event listener.
     */
  }, {
    key: "onMessage",
    value: function onMessage(func) {
      this.eventListeners.message.push(func);
    }
  }, {
    key: "_wsSend",
    value: function _wsSend(data) {
      if (!this.ws) {
        throw new common.errors.ClientNotReadyError();
      }
      this.ws.send(data);
    }
  }, {
    key: "_processDest",
    value: function () {
      var _processDest2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(dest) {
        var addr, res;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (!(dest.length === 0)) {
                _context3.next = 2;
                break;
              }
              throw new common.errors.InvalidDestinationError("destination is empty");
            case 2:
              addr = dest.split(".");
              if (!(addr[addr.length - 1].length < common.crypto.publicKeyLength * 2)) {
                _context3.next = 12;
                break;
              }
              _context3.next = 6;
              return this.getRegistrant(addr[addr.length - 1]);
            case 6:
              res = _context3.sent;
              if (!(res.registrant && res.registrant.length > 0)) {
                _context3.next = 11;
                break;
              }
              addr[addr.length - 1] = res.registrant;
              _context3.next = 12;
              break;
            case 11:
              throw new common.errors.InvalidDestinationError(dest + " is neither a valid public key nor a registered name");
            case 12:
              return _context3.abrupt("return", addr.join("."));
            case 13:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function _processDest(_x2) {
        return _processDest2.apply(this, arguments);
      }
      return _processDest;
    }()
  }, {
    key: "_processDests",
    value: function () {
      var _processDests2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(dest) {
        var _this2 = this;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              if (!Array.isArray(dest)) {
                _context5.next = 11;
                break;
              }
              if (!(dest.length === 0)) {
                _context5.next = 3;
                break;
              }
              throw new common.errors.InvalidDestinationError("no destinations");
            case 3:
              _context5.next = 5;
              return Promise.all(dest.map(/*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(addr) {
                  return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                    while (1) switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.prev = 0;
                        _context4.next = 3;
                        return _this2._processDest(addr);
                      case 3:
                        return _context4.abrupt("return", _context4.sent);
                      case 6:
                        _context4.prev = 6;
                        _context4.t0 = _context4["catch"](0);
                        console.warn(_context4.t0.message);
                        return _context4.abrupt("return", "");
                      case 10:
                      case "end":
                        return _context4.stop();
                    }
                  }, _callee4, null, [[0, 6]]);
                }));
                return function (_x4) {
                  return _ref2.apply(this, arguments);
                };
              }()));
            case 5:
              dest = _context5.sent;
              dest = dest.filter(function (addr) {
                return addr.length > 0;
              });
              if (!(dest.length === 0)) {
                _context5.next = 9;
                break;
              }
              throw new common.errors.InvalidDestinationError("all destinations are invalid");
            case 9:
              _context5.next = 14;
              break;
            case 11:
              _context5.next = 13;
              return this._processDest(dest);
            case 13:
              dest = _context5.sent;
            case 14:
              return _context5.abrupt("return", dest);
            case 15:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function _processDests(_x3) {
        return _processDests2.apply(this, arguments);
      }
      return _processDests;
    }()
  }, {
    key: "_send",
    value: function () {
      var _send2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(dest, payload) {
        var _this3 = this;
        var encrypt,
          maxHoldingSeconds,
          pldMsg,
          msgs,
          destList,
          pldList,
          totalSize,
          size,
          i,
          _size,
          _i,
          _args6 = arguments;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              encrypt = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : true;
              maxHoldingSeconds = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : 0;
              if (!Array.isArray(dest)) {
                _context6.next = 9;
                break;
              }
              if (!(dest.length === 0)) {
                _context6.next = 5;
                break;
              }
              return _context6.abrupt("return", null);
            case 5:
              if (!(dest.length === 1)) {
                _context6.next = 9;
                break;
              }
              _context6.next = 8;
              return this._send(dest[0], payload, encrypt, maxHoldingSeconds);
            case 8:
              return _context6.abrupt("return", _context6.sent);
            case 9:
              _context6.next = 11;
              return this._processDests(dest);
            case 11:
              dest = _context6.sent;
              _context6.next = 14;
              return this._messageFromPayload(payload, encrypt, dest);
            case 14:
              pldMsg = _context6.sent;
              pldMsg = pldMsg.map(function (pld) {
                return pld.serializeBinary();
              });
              msgs = [], destList = [], pldList = [];
              if (!(pldMsg.length > 1)) {
                _context6.next = 41;
                break;
              }
              totalSize = 0, size = 0;
              i = 0;
            case 20:
              if (!(i < pldMsg.length)) {
                _context6.next = 39;
                break;
              }
              size = pldMsg[i].length + dest[i].length + common.crypto.signatureLength;
              if (!(size > message.maxClientMessageSize)) {
                _context6.next = 24;
                break;
              }
              throw new common.errors.DataSizeTooLargeError("encoded message is greater than " + message.maxClientMessageSize + " bytes");
            case 24:
              if (!(totalSize + size > message.maxClientMessageSize)) {
                _context6.next = 33;
                break;
              }
              _context6.t0 = msgs;
              _context6.next = 28;
              return message.newOutboundMessage(this, destList, pldList, maxHoldingSeconds);
            case 28:
              _context6.t1 = _context6.sent;
              _context6.t0.push.call(_context6.t0, _context6.t1);
              destList = [];
              pldList = [];
              totalSize = 0;
            case 33:
              destList.push(dest[i]);
              pldList.push(pldMsg[i]);
              totalSize += size;
            case 36:
              i++;
              _context6.next = 20;
              break;
            case 39:
              _context6.next = 47;
              break;
            case 41:
              _size = pldMsg[0].length;
              if (Array.isArray(dest)) {
                for (_i = 0; _i < dest.length; _i++) {
                  _size += dest[_i].length + common.crypto.signatureLength;
                }
              } else {
                _size += dest.length + common.crypto.signatureLength;
              }
              if (!(_size > message.maxClientMessageSize)) {
                _context6.next = 45;
                break;
              }
              throw new common.errors.DataSizeTooLargeError("encoded message is greater than " + message.maxClientMessageSize + " bytes");
            case 45:
              destList = dest;
              pldList = pldMsg;
            case 47:
              _context6.t2 = msgs;
              _context6.next = 50;
              return message.newOutboundMessage(this, destList, pldList, maxHoldingSeconds);
            case 50:
              _context6.t3 = _context6.sent;
              _context6.t2.push.call(_context6.t2, _context6.t3);
              if (msgs.length > 1) {
                console.log("Client message size is greater than ".concat(message.maxClientMessageSize, " bytes, split into ").concat(msgs.length, " batches."));
              }
              msgs.forEach(function (msg) {
                _this3._wsSend(msg.serializeBinary());
              });
              return _context6.abrupt("return", payload.getMessageId() || null);
            case 55:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this);
      }));
      function _send(_x5, _x6) {
        return _send2.apply(this, arguments);
      }
      return _send;
    }()
    /**
     * Send byte or string data to a single or an array of destination.
     * @param options - Send options that will override client options.
     * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
     */
  }, {
    key: "send",
    value: (function () {
      var _send3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(dest, data) {
        var _this4 = this;
        var options,
          payload,
          messageId,
          _args7 = arguments;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              options = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : {};
              options = common.util.assignDefined({}, this.options, options);
              if (typeof data === "string") {
                payload = message.newTextPayload(data, options.replyToId, options.messageId);
              } else {
                payload = message.newBinaryPayload(data, options.replyToId, options.messageId);
              }
              _context7.next = 5;
              return this._send(dest, payload, options.encrypt, options.msgHoldingSeconds);
            case 5:
              messageId = _context7.sent;
              if (!(messageId === null || options.noReply)) {
                _context7.next = 8;
                break;
              }
              return _context7.abrupt("return", null);
            case 8:
              _context7.next = 10;
              return new Promise(function (resolve, reject) {
                _this4.responseManager.add(new ResponseProcessor(messageId, options.responseTimeout, resolve, reject));
              });
            case 10:
              return _context7.abrupt("return", _context7.sent);
            case 11:
            case "end":
              return _context7.stop();
          }
        }, _callee7, this);
      }));
      function send(_x7, _x8) {
        return _send3.apply(this, arguments);
      }
      return send;
    }())
  }, {
    key: "_sendACK",
    value: function () {
      var _sendACK2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(dest, messageId, encrypt) {
        var i, payload, pldMsg, msg;
        return _regeneratorRuntime().wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              if (!Array.isArray(dest)) {
                _context8.next = 17;
                break;
              }
              if (!(dest.length === 0)) {
                _context8.next = 3;
                break;
              }
              return _context8.abrupt("return");
            case 3:
              if (!(dest.length === 1)) {
                _context8.next = 7;
                break;
              }
              _context8.next = 6;
              return this._sendACK(dest[0], messageId, encrypt);
            case 6:
              return _context8.abrupt("return", _context8.sent);
            case 7:
              if (!(dest.length > 1 && encrypt)) {
                _context8.next = 17;
                break;
              }
              console.warn("Encrypted ACK with multicast is not supported, fallback to unicast.");
              i = 0;
            case 10:
              if (!(i < dest.length)) {
                _context8.next = 16;
                break;
              }
              _context8.next = 13;
              return this._sendACK(dest[i], messageId, encrypt);
            case 13:
              i++;
              _context8.next = 10;
              break;
            case 16:
              return _context8.abrupt("return");
            case 17:
              payload = message.newAckPayload(messageId);
              _context8.next = 20;
              return this._messageFromPayload(payload, encrypt, dest);
            case 20:
              pldMsg = _context8.sent;
              _context8.next = 23;
              return message.newOutboundMessage(this, dest, pldMsg[0].serializeBinary(), 0);
            case 23:
              msg = _context8.sent;
              this._wsSend(msg.serializeBinary());
            case 25:
            case "end":
              return _context8.stop();
          }
        }, _callee8, this);
      }));
      function _sendACK(_x9, _x10, _x11) {
        return _sendACK2.apply(this, arguments);
      }
      return _sendACK;
    }()
    /**
     * Send byte or string data to all subscribers of a topic.
     * @returns A promise that will be resolved with null when send success.
     */
  }, {
    key: "publish",
    value: (function () {
      var _publish = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(topic, data) {
        var options,
          offset,
          res,
          subscribers,
          subscribersInTxPool,
          _args9 = arguments;
        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              options = _args9.length > 2 && _args9[2] !== undefined ? _args9[2] : {};
              options = common.util.assignDefined({}, consts.defaultPublishOptions, options, {
                noReply: true
              });
              offset = options.offset;
              _context9.next = 5;
              return this.getSubscribers(topic, {
                offset: offset,
                limit: options.limit,
                txPool: options.txPool
              });
            case 5:
              res = _context9.sent;
              if (res.subscribers instanceof Array) {
                _context9.next = 8;
                break;
              }
              throw new common.errors.InvalidResponseError("subscribers should be an array");
            case 8:
              if (!(res.subscribersInTxPool && !(res.subscribersInTxPool instanceof Array))) {
                _context9.next = 10;
                break;
              }
              throw new common.errors.InvalidResponseError("subscribersInTxPool should be an array");
            case 10:
              subscribers = res.subscribers;
              subscribersInTxPool = res.subscribersInTxPool;
            case 12:
              if (!(res.subscribers && res.subscribers.length >= options.limit)) {
                _context9.next = 22;
                break;
              }
              offset += options.limit;
              _context9.next = 16;
              return this.getSubscribers(topic, {
                offset: offset,
                limit: options.limit
              });
            case 16:
              res = _context9.sent;
              if (res.subscribers instanceof Array) {
                _context9.next = 19;
                break;
              }
              throw new common.errors.InvalidResponseError("subscribers should be an array");
            case 19:
              subscribers = subscribers.concat(res.subscribers);
              _context9.next = 12;
              break;
            case 22:
              if (options.txPool && subscribersInTxPool) {
                subscribers = subscribers.concat(subscribersInTxPool);
              }
              _context9.next = 25;
              return this.send(subscribers, data, options);
            case 25:
              return _context9.abrupt("return", null);
            case 26:
            case "end":
              return _context9.stop();
          }
        }, _callee9, this);
      }));
      function publish(_x12, _x13) {
        return _publish.apply(this, arguments);
      }
      return publish;
    }()
    /**
     * Close the client.
     */
    )
  }, {
    key: "close",
    value: function close() {
      this.responseManager.stop();
      this.shouldReconnect = false;
      try {
        this.ws && this.ws.close();
      } catch (e) {}
      this.isClosed = true;
    }
  }, {
    key: "_messageFromPayload",
    value: function () {
      var _messageFromPayload2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(payload, encrypt, dest) {
        return _regeneratorRuntime().wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              if (!encrypt) {
                _context10.next = 4;
                break;
              }
              _context10.next = 3;
              return this._encryptPayload(payload.serializeBinary(), dest);
            case 3:
              return _context10.abrupt("return", _context10.sent);
            case 4:
              return _context10.abrupt("return", [message.newMessage(payload.serializeBinary(), false)]);
            case 5:
            case "end":
              return _context10.stop();
          }
        }, _callee10, this);
      }));
      function _messageFromPayload(_x14, _x15, _x16) {
        return _messageFromPayload2.apply(this, arguments);
      }
      return _messageFromPayload;
    }()
  }, {
    key: "_handleMsg",
    value: function () {
      var _handleMsg2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(rawMsg) {
        var msg;
        return _regeneratorRuntime().wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              msg = common.pb.messages.ClientMessage.deserializeBinary(rawMsg);
              _context11.t0 = msg.getMessageType();
              _context11.next = _context11.t0 === common.pb.messages.ClientMessageType.INBOUND_MESSAGE ? 4 : 7;
              break;
            case 4:
              _context11.next = 6;
              return this._handleInboundMsg(msg.getMessage());
            case 6:
              return _context11.abrupt("return", _context11.sent);
            case 7:
              return _context11.abrupt("return", false);
            case 8:
            case "end":
              return _context11.stop();
          }
        }, _callee11, this);
      }));
      function _handleMsg(_x17) {
        return _handleMsg2.apply(this, arguments);
      }
      return _handleMsg;
    }()
  }, {
    key: "_handleInboundMsg",
    value: function () {
      var _handleInboundMsg2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(rawMsg) {
        var msg, prevSignature, receipt, pldMsg, pldBytes, payload, data, textData, responses, responded, _iterator, _step, response;
        return _regeneratorRuntime().wrap(function _callee13$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              msg = common.pb.messages.InboundMessage.deserializeBinary(rawMsg);
              prevSignature = msg.getPrevSignature();
              if (!(prevSignature.length > 0)) {
                _context13.next = 8;
                break;
              }
              prevSignature = common.util.bytesToHex(prevSignature);
              _context13.next = 6;
              return message.newReceipt(this, prevSignature);
            case 6:
              receipt = _context13.sent;
              this._wsSend(receipt.serializeBinary());
            case 8:
              pldMsg = common.pb.payloads.Message.deserializeBinary(msg.getPayload());
              if (!pldMsg.getEncrypted()) {
                _context13.next = 15;
                break;
              }
              _context13.next = 12;
              return this._decryptPayload(pldMsg, msg.getSrc());
            case 12:
              pldBytes = _context13.sent;
              _context13.next = 16;
              break;
            case 15:
              pldBytes = pldMsg.getPayload();
            case 16:
              payload = common.pb.payloads.Payload.deserializeBinary(pldBytes);
              data = payload.getData(); // process data
              _context13.t0 = payload.getType();
              _context13.next = _context13.t0 === common.pb.payloads.PayloadType.TEXT ? 21 : _context13.t0 === common.pb.payloads.PayloadType.ACK ? 24 : 26;
              break;
            case 21:
              textData = common.pb.payloads.TextData.deserializeBinary(data);
              data = textData.getText();
              return _context13.abrupt("break", 26);
            case 24:
              this.responseManager.respond(payload.getReplyToId(), null, payload.getType());
              return _context13.abrupt("return", true);
            case 26:
              if (!payload.getReplyToId().length) {
                _context13.next = 29;
                break;
              }
              this.responseManager.respond(payload.getReplyToId(), data, payload.getType());
              return _context13.abrupt("return", true);
            case 29:
              _context13.t1 = payload.getType();
              _context13.next = _context13.t1 === common.pb.payloads.PayloadType.TEXT ? 32 : _context13.t1 === common.pb.payloads.PayloadType.BINARY ? 32 : _context13.t1 === common.pb.payloads.PayloadType.SESSION ? 32 : 65;
              break;
            case 32:
              if (!(this.eventListeners.message.length > 0)) {
                _context13.next = 64;
                break;
              }
              _context13.next = 35;
              return Promise.all(this.eventListeners.message.map(/*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(f) {
                  return _regeneratorRuntime().wrap(function _callee12$(_context12) {
                    while (1) switch (_context12.prev = _context12.next) {
                      case 0:
                        _context12.prev = 0;
                        _context12.next = 3;
                        return f({
                          src: msg.getSrc(),
                          payload: data,
                          payloadType: payload.getType(),
                          isEncrypted: pldMsg.getEncrypted(),
                          messageId: payload.getMessageId(),
                          noReply: payload.getNoReply()
                        });
                      case 3:
                        return _context12.abrupt("return", _context12.sent);
                      case 6:
                        _context12.prev = 6;
                        _context12.t0 = _context12["catch"](0);
                        console.log("Message handler error:", _context12.t0);
                        return _context12.abrupt("return", null);
                      case 10:
                      case "end":
                        return _context12.stop();
                    }
                  }, _callee12, null, [[0, 6]]);
                }));
                return function (_x19) {
                  return _ref3.apply(this, arguments);
                };
              }()));
            case 35:
              responses = _context13.sent;
              if (payload.getNoReply()) {
                _context13.next = 64;
                break;
              }
              responded = false;
              _iterator = _createForOfIteratorHelper(responses);
              _context13.prev = 39;
              _iterator.s();
            case 41:
              if ((_step = _iterator.n()).done) {
                _context13.next = 53;
                break;
              }
              response = _step.value;
              if (!(response === false)) {
                _context13.next = 47;
                break;
              }
              return _context13.abrupt("return", true);
            case 47:
              if (!(response !== undefined && response !== null)) {
                _context13.next = 51;
                break;
              }
              this.send(msg.getSrc(), response, {
                encrypt: pldMsg.getEncrypted(),
                msgHoldingSeconds: 0,
                replyToId: payload.getMessageId()
              })["catch"](function (e) {
                console.log("Send response error:", e);
              });
              responded = true;
              return _context13.abrupt("break", 53);
            case 51:
              _context13.next = 41;
              break;
            case 53:
              _context13.next = 58;
              break;
            case 55:
              _context13.prev = 55;
              _context13.t2 = _context13["catch"](39);
              _iterator.e(_context13.t2);
            case 58:
              _context13.prev = 58;
              _iterator.f();
              return _context13.finish(58);
            case 61:
              if (responded) {
                _context13.next = 64;
                break;
              }
              _context13.next = 64;
              return this._sendACK(msg.getSrc(), payload.getMessageId(), pldMsg.getEncrypted());
            case 64:
              return _context13.abrupt("return", true);
            case 65:
              return _context13.abrupt("return", false);
            case 66:
            case "end":
              return _context13.stop();
          }
        }, _callee13, this, [[39, 55, 58, 61]]);
      }));
      function _handleInboundMsg(_x18) {
        return _handleInboundMsg2.apply(this, arguments);
      }
      return _handleInboundMsg;
    }()
  }, {
    key: "_shouldUseTls",
    value: function _shouldUseTls() {
      if (this.options.tls !== undefined) {
        return !!this.options.tls;
      }
      if (typeof window === "undefined") {
        return false;
      }
      if (window.location && window.location.protocol === "https:") {
        return true;
      }
      return false;
    }
  }, {
    key: "_newWsAddr",
    value: function () {
      var _newWsAddr2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee18(nodeInfo) {
        var _this5 = this;
        var tls, ws, addr, wsConnectResolve, wsConnectTimer, challengeDone, challengeHandler;
        return _regeneratorRuntime().wrap(function _callee18$(_context18) {
          while (1) switch (_context18.prev = _context18.next) {
            case 0:
              if (nodeInfo.addr) {
                _context18.next = 4;
                break;
              }
              console.log("No address in node info", nodeInfo);
              if (this.shouldReconnect) {
                this._reconnect();
              } else if (!this.isClosed) {
                this._connectFailed();
              }
              return _context18.abrupt("return");
            case 4:
              tls = this._shouldUseTls();
              _context18.prev = 5;
              if (this.options.webrtc) {
                ws = this.peer;
                this.peer.setRemoteDescription(nodeInfo.sdp);
              } else {
                ws = new _isomorphicWs["default"]((tls ? "wss" : "ws") + "://" + nodeInfo.addr);
                ws.binaryType = "arraybuffer";
              }
              _context18.next = 14;
              break;
            case 9:
              _context18.prev = 9;
              _context18.t0 = _context18["catch"](5);
              console.log("Create WebSocket or WebRTC failed,", _context18.t0);
              if (this.shouldReconnect) {
                this._reconnect();
              } else if (!this.isClosed) {
                this._connectFailed();
              }
              return _context18.abrupt("return");
            case 14:
              if (this.ws) {
                this.ws.onclose = function () {};
                try {
                  this.ws.close();
                } catch (e) {}
              }
              if (!this.isClosed) {
                _context18.next = 18;
                break;
              }
              try {
                ws.close();
              } catch (e) {}
              return _context18.abrupt("return");
            case 18:
              this.ws = ws;
              this.node = nodeInfo;
              this.wallet.options.rpcServerAddr = "";
              if (!tls && nodeInfo.rpcAddr) {
                addr = "http://" + nodeInfo.rpcAddr;
                common.rpc.getNodeState({
                  rpcServerAddr: addr
                }).then(function (nodeState) {
                  if (nodeState.syncState === "PERSIST_FINISHED") {
                    _this5.wallet.options.rpcServerAddr = addr;
                  }
                })["catch"](function (e) {
                  console.log(e);
                });
              }
              new Promise(function (resolve, reject) {
                wsConnectResolve = resolve;
                wsConnectTimer = setTimeout(function () {
                  if (_this5.ws === ws) {
                    reject(new common.errors.ConnectToNodeTimeoutError());
                  } else {
                    resolve();
                  }
                }, _this5.options.connectTimeout);
              }).then(function () {
                clearTimeout(wsConnectTimer);
              })["catch"](function (e) {
                if (!_this5.isClosed) {
                  console.log("WebSocket or WebRTC connect timeout,", e);
                }
                if (_this5.shouldReconnect) {
                  _this5._reconnect();
                } else if (!_this5.isClosed) {
                  _this5._connectFailed();
                }
              });
              challengeHandler = new Promise(function (resolve, reject) {
                challengeDone = resolve;
                setTimeout(function () {
                  if (_this5.ws === ws) {
                    // Some nodejs version might terminate the whole process if we call reject here
                    resolve(new common.errors.ChallengeTimeoutError());
                  }
                }, _consts.waitForChallengeTimeout);
              });
              ws.onopen = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14() {
                var data, req;
                return _regeneratorRuntime().wrap(function _callee14$(_context14) {
                  while (1) switch (_context14.prev = _context14.next) {
                    case 0:
                      wsConnectResolve();
                      data = {
                        Action: Action.setClient,
                        Addr: _this5.addr
                      };
                      _context14.next = 4;
                      return challengeHandler;
                    case 4:
                      req = _context14.sent;
                      if (!!req && !(req instanceof common.errors.ChallengeTimeoutError)) {
                        data.ClientSalt = common.util.bytesToHex(req.ClientSalt);
                        data.Signature = common.util.bytesToHex(req.Signature);
                      }
                      ws.send(JSON.stringify(data));
                      _this5.shouldReconnect = true;
                      _this5.reconnectInterval = _this5.options.reconnectIntervalMin;
                    case 9:
                    case "end":
                      return _context14.stop();
                  }
                }, _callee14);
              }));
              ws.onmessage = /*#__PURE__*/function () {
                var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee16(event) {
                  var data, handled, msg, challenge, byteChallenge, clientSalt, hash, signature;
                  return _regeneratorRuntime().wrap(function _callee16$(_context16) {
                    while (1) switch (_context16.prev = _context16.next) {
                      case 0:
                        data = event.data;
                        if (!(data instanceof ArrayBuffer || data instanceof Blob)) {
                          _context16.next = 19;
                          break;
                        }
                        _context16.prev = 2;
                        if (!(data instanceof Blob)) {
                          _context16.next = 9;
                          break;
                        }
                        _context16.t0 = Uint8Array;
                        _context16.next = 7;
                        return data.arrayBuffer();
                      case 7:
                        _context16.t1 = _context16.sent;
                        data = new _context16.t0(_context16.t1);
                      case 9:
                        _context16.next = 11;
                        return _this5._handleMsg(data);
                      case 11:
                        handled = _context16.sent;
                        if (!handled) {
                          console.warn("Unhandled msg.");
                        }
                        _context16.next = 18;
                        break;
                      case 15:
                        _context16.prev = 15;
                        _context16.t2 = _context16["catch"](2);
                        console.log(_context16.t2);
                      case 18:
                        return _context16.abrupt("return");
                      case 19:
                        msg = JSON.parse(data);
                        if (!(msg.Error !== undefined && msg.Error !== common.errors.rpcRespErrCodes.success)) {
                          _context16.next = 24;
                          break;
                        }
                        console.log(msg);
                        if (msg.Error === common.errors.rpcRespErrCodes.wrongNode) {
                          _this5._newWsAddr(msg.Result);
                        } else if (msg.Action === Action.setClient) {
                          try {
                            _this5.ws && _this5.ws.close();
                          } catch (e) {}
                        }
                        return _context16.abrupt("return");
                      case 24:
                        _context16.t3 = msg.Action;
                        _context16.next = _context16.t3 === Action.setClient ? 27 : _context16.t3 === Action.updateSigChainBlockHash ? 30 : _context16.t3 === Action.authChallenge ? 32 : 42;
                        break;
                      case 27:
                        _this5.sigChainBlockHash = msg.Result.sigChainBlockHash;
                        if (!_this5.isReady) {
                          _this5.isReady = true;
                          if (_this5.eventListeners.connect.length > 0) {
                            _this5.eventListeners.connect.forEach(/*#__PURE__*/function () {
                              var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15(f) {
                                return _regeneratorRuntime().wrap(function _callee15$(_context15) {
                                  while (1) switch (_context15.prev = _context15.next) {
                                    case 0:
                                      _context15.prev = 0;
                                      _context15.next = 3;
                                      return f(msg.Result);
                                    case 3:
                                      _context15.next = 8;
                                      break;
                                    case 5:
                                      _context15.prev = 5;
                                      _context15.t0 = _context15["catch"](0);
                                      console.log("Connect handler error:", _context15.t0);
                                    case 8:
                                    case "end":
                                      return _context15.stop();
                                  }
                                }, _callee15, null, [[0, 5]]);
                              }));
                              return function (_x22) {
                                return _ref6.apply(this, arguments);
                              };
                            }());
                          }
                        }
                        return _context16.abrupt("break", 43);
                      case 30:
                        _this5.sigChainBlockHash = msg.Result;
                        return _context16.abrupt("break", 43);
                      case 32:
                        challenge = msg.Challenge;
                        byteChallenge = common.util.hexToBytes(challenge);
                        clientSalt = common.util.randomBytes(32);
                        byteChallenge = common.util.mergeTypedArrays(byteChallenge, clientSalt);
                        hash = common.hash.sha256Hex(common.util.bytesToHex(byteChallenge));
                        _context16.next = 39;
                        return crypto.sign(_this5.key.privateKey, hash);
                      case 39:
                        signature = _context16.sent;
                        challengeDone({
                          ClientSalt: clientSalt,
                          Signature: common.util.hexToBytes(signature)
                        });
                        return _context16.abrupt("break", 43);
                      case 42:
                        console.warn("Unknown msg type:", msg.Action);
                      case 43:
                      case "end":
                        return _context16.stop();
                    }
                  }, _callee16, null, [[2, 15]]);
                }));
                return function (_x21) {
                  return _ref5.apply(this, arguments);
                };
              }();
              ws.onclose = function () {
                if (_this5.shouldReconnect) {
                  console.warn("WebSocket unexpectedly closed.");
                  _this5._reconnect();
                } else if (!_this5.isClosed) {
                  _this5._connectFailed();
                }
              };
              ws.onerror = function (event) {
                if (_this5.eventListeners.wsError.length > 0) {
                  _this5.eventListeners.wsError.forEach(/*#__PURE__*/function () {
                    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee17(f) {
                      return _regeneratorRuntime().wrap(function _callee17$(_context17) {
                        while (1) switch (_context17.prev = _context17.next) {
                          case 0:
                            _context17.prev = 0;
                            _context17.next = 3;
                            return f(event);
                          case 3:
                            _context17.next = 8;
                            break;
                          case 5:
                            _context17.prev = 5;
                            _context17.t0 = _context17["catch"](0);
                            console.log("WsError handler error:", _context17.t0);
                          case 8:
                          case "end":
                            return _context17.stop();
                        }
                      }, _callee17, null, [[0, 5]]);
                    }));
                    return function (_x23) {
                      return _ref7.apply(this, arguments);
                    };
                  }());
                } else {
                  console.log(event.message);
                }
              };
            case 28:
            case "end":
              return _context18.stop();
          }
        }, _callee18, this, [[5, 9]]);
      }));
      function _newWsAddr(_x20) {
        return _newWsAddr2.apply(this, arguments);
      }
      return _newWsAddr;
    }()
  }, {
    key: "_encryptPayload",
    value: function () {
      var _encryptPayload2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee19(payload, dest) {
        var nonce, key, encryptedPayload, msgs, i, pk, encryptedKey, mergedNonce, msg, _pk, encrypted;
        return _regeneratorRuntime().wrap(function _callee19$(_context19) {
          while (1) switch (_context19.prev = _context19.next) {
            case 0:
              if (!Array.isArray(dest)) {
                _context19.next = 22;
                break;
              }
              nonce = common.util.randomBytes(common.crypto.nonceLength);
              key = common.util.randomBytes(common.crypto.keyLength);
              _context19.next = 5;
              return common.crypto.encryptSymmetric(payload, nonce, key);
            case 5:
              encryptedPayload = _context19.sent;
              msgs = [];
              i = 0;
            case 8:
              if (!(i < dest.length)) {
                _context19.next = 19;
                break;
              }
              pk = message.addrToPubkey(dest[i]);
              _context19.next = 12;
              return this.key.encrypt(key, pk);
            case 12:
              encryptedKey = _context19.sent;
              mergedNonce = common.util.mergeTypedArrays(encryptedKey.nonce, nonce);
              msg = message.newMessage(encryptedPayload, true, mergedNonce, encryptedKey.message);
              msgs.push(msg);
            case 16:
              i++;
              _context19.next = 8;
              break;
            case 19:
              return _context19.abrupt("return", msgs);
            case 22:
              _pk = message.addrToPubkey(dest);
              _context19.next = 25;
              return this.key.encrypt(payload, _pk);
            case 25:
              encrypted = _context19.sent;
              return _context19.abrupt("return", [message.newMessage(encrypted.message, true, encrypted.nonce)]);
            case 27:
            case "end":
              return _context19.stop();
          }
        }, _callee19, this);
      }));
      function _encryptPayload(_x24, _x25) {
        return _encryptPayload2.apply(this, arguments);
      }
      return _encryptPayload;
    }()
  }, {
    key: "_decryptPayload",
    value: function () {
      var _decryptPayload2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee20(msg, srcAddr) {
        var rawPayload, srcPubkey, nonce, encryptedKey, decryptedPayload, sharedKey;
        return _regeneratorRuntime().wrap(function _callee20$(_context20) {
          while (1) switch (_context20.prev = _context20.next) {
            case 0:
              rawPayload = msg.getPayload();
              srcPubkey = message.addrToPubkey(srcAddr);
              nonce = msg.getNonce();
              encryptedKey = msg.getEncryptedKey();
              if (!(encryptedKey && encryptedKey.length > 0)) {
                _context20.next = 19;
                break;
              }
              if (!(nonce.length != common.crypto.nonceLength * 2)) {
                _context20.next = 7;
                break;
              }
              throw new common.errors.DecryptionError("invalid nonce length");
            case 7:
              _context20.next = 9;
              return this.key.decrypt(encryptedKey, nonce.slice(0, common.crypto.nonceLength), srcPubkey);
            case 9:
              sharedKey = _context20.sent;
              if (!(sharedKey === null)) {
                _context20.next = 12;
                break;
              }
              throw new common.errors.DecryptionError("decrypt shared key failed");
            case 12:
              _context20.next = 14;
              return common.crypto.decryptSymmetric(rawPayload, nonce.slice(common.crypto.nonceLength), sharedKey);
            case 14:
              decryptedPayload = _context20.sent;
              if (!(decryptedPayload === null)) {
                _context20.next = 17;
                break;
              }
              throw new common.errors.DecryptionError("decrypt message failed");
            case 17:
              _context20.next = 26;
              break;
            case 19:
              if (!(nonce.length != common.crypto.nonceLength)) {
                _context20.next = 21;
                break;
              }
              throw new common.errors.DecryptionError("invalid nonce length");
            case 21:
              _context20.next = 23;
              return this.key.decrypt(rawPayload, nonce, srcPubkey);
            case 23:
              decryptedPayload = _context20.sent;
              if (!(decryptedPayload === null)) {
                _context20.next = 26;
                break;
              }
              throw new common.errors.DecryptionError("decrypt message failed");
            case 26:
              return _context20.abrupt("return", decryptedPayload);
            case 27:
            case "end":
              return _context20.stop();
          }
        }, _callee20, this);
      }));
      function _decryptPayload(_x26, _x27) {
        return _decryptPayload2.apply(this, arguments);
      }
      return _decryptPayload;
    }()
    /**
     * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
  }, {
    key: "getLatestBlock",
    value: (function () {
      var _getLatestBlock = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee21() {
        return _regeneratorRuntime().wrap(function _callee21$(_context21) {
          while (1) switch (_context21.prev = _context21.next) {
            case 0:
              if (!this.wallet.options.rpcServerAddr) {
                _context21.next = 9;
                break;
              }
              _context21.prev = 1;
              _context21.next = 4;
              return _wallet["default"].getLatestBlock(this.options);
            case 4:
              return _context21.abrupt("return", _context21.sent);
            case 7:
              _context21.prev = 7;
              _context21.t0 = _context21["catch"](1);
            case 9:
              _context21.next = 11;
              return _wallet["default"].getLatestBlock(this.options);
            case 11:
              return _context21.abrupt("return", _context21.sent);
            case 12:
            case "end":
              return _context21.stop();
          }
        }, _callee21, this, [[1, 7]]);
      }));
      function getLatestBlock() {
        return _getLatestBlock.apply(this, arguments);
      }
      return getLatestBlock;
    }()
    /**
     * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
    )
  }, {
    key: "getRegistrant",
    value: (function () {
      var _getRegistrant = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee22(name) {
        return _regeneratorRuntime().wrap(function _callee22$(_context22) {
          while (1) switch (_context22.prev = _context22.next) {
            case 0:
              if (!this.wallet.options.rpcServerAddr) {
                _context22.next = 9;
                break;
              }
              _context22.prev = 1;
              _context22.next = 4;
              return _wallet["default"].getRegistrant(name, this.wallet.options);
            case 4:
              return _context22.abrupt("return", _context22.sent);
            case 7:
              _context22.prev = 7;
              _context22.t0 = _context22["catch"](1);
            case 9:
              _context22.next = 11;
              return _wallet["default"].getRegistrant(name, this.options);
            case 11:
              return _context22.abrupt("return", _context22.sent);
            case 12:
            case "end":
              return _context22.stop();
          }
        }, _callee22, this, [[1, 7]]);
      }));
      function getRegistrant(_x28) {
        return _getRegistrant.apply(this, arguments);
      }
      return getRegistrant;
    }()
    /**
     * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
    )
  }, {
    key: "getSubscribers",
    value: (function () {
      var _getSubscribers = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee23(topic) {
        var options,
          _args23 = arguments;
        return _regeneratorRuntime().wrap(function _callee23$(_context23) {
          while (1) switch (_context23.prev = _context23.next) {
            case 0:
              options = _args23.length > 1 && _args23[1] !== undefined ? _args23[1] : {};
              if (!this.wallet.options.rpcServerAddr) {
                _context23.next = 10;
                break;
              }
              _context23.prev = 2;
              _context23.next = 5;
              return _wallet["default"].getSubscribers(topic, Object.assign({}, this.wallet.options, options));
            case 5:
              return _context23.abrupt("return", _context23.sent);
            case 8:
              _context23.prev = 8;
              _context23.t0 = _context23["catch"](2);
            case 10:
              _context23.next = 12;
              return _wallet["default"].getSubscribers(topic, Object.assign({}, this.options, options));
            case 12:
              return _context23.abrupt("return", _context23.sent);
            case 13:
            case "end":
              return _context23.stop();
          }
        }, _callee23, this, [[2, 8]]);
      }));
      function getSubscribers(_x29) {
        return _getSubscribers.apply(this, arguments);
      }
      return getSubscribers;
    }()
    /**
     * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
     * this client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
    )
  }, {
    key: "getSubscribersCount",
    value: (function () {
      var _getSubscribersCount = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee24(topic) {
        return _regeneratorRuntime().wrap(function _callee24$(_context24) {
          while (1) switch (_context24.prev = _context24.next) {
            case 0:
              if (!this.wallet.options.rpcServerAddr) {
                _context24.next = 9;
                break;
              }
              _context24.prev = 1;
              _context24.next = 4;
              return _wallet["default"].getSubscribersCount(topic, this.wallet.options);
            case 4:
              return _context24.abrupt("return", _context24.sent);
            case 7:
              _context24.prev = 7;
              _context24.t0 = _context24["catch"](1);
            case 9:
              _context24.next = 11;
              return _wallet["default"].getSubscribersCount(topic, this.options);
            case 11:
              return _context24.abrupt("return", _context24.sent);
            case 12:
            case "end":
              return _context24.stop();
          }
        }, _callee24, this, [[1, 7]]);
      }));
      function getSubscribersCount(_x30) {
        return _getSubscribersCount.apply(this, arguments);
      }
      return getSubscribersCount;
    }()
    /**
     * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
    )
  }, {
    key: "getSubscription",
    value: (function () {
      var _getSubscription = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee25(topic, subscriber) {
        return _regeneratorRuntime().wrap(function _callee25$(_context25) {
          while (1) switch (_context25.prev = _context25.next) {
            case 0:
              if (!this.wallet.options.rpcServerAddr) {
                _context25.next = 9;
                break;
              }
              _context25.prev = 1;
              _context25.next = 4;
              return _wallet["default"].getSubscription(topic, subscriber, this.wallet.options);
            case 4:
              return _context25.abrupt("return", _context25.sent);
            case 7:
              _context25.prev = 7;
              _context25.t0 = _context25["catch"](1);
            case 9:
              _context25.next = 11;
              return _wallet["default"].getSubscription(topic, subscriber, this.options);
            case 11:
              return _context25.abrupt("return", _context25.sent);
            case 12:
            case "end":
              return _context25.stop();
          }
        }, _callee25, this, [[1, 7]]);
      }));
      function getSubscription(_x31, _x32) {
        return _getSubscription.apply(this, arguments);
      }
      return getSubscription;
    }()
    /**
     * Same as [Wallet.getBalance](#walletgetbalance), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
    )
  }, {
    key: "getBalance",
    value: (function () {
      var _getBalance = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee26(address) {
        return _regeneratorRuntime().wrap(function _callee26$(_context26) {
          while (1) switch (_context26.prev = _context26.next) {
            case 0:
              if (!this.wallet.options.rpcServerAddr) {
                _context26.next = 9;
                break;
              }
              _context26.prev = 1;
              _context26.next = 4;
              return _wallet["default"].getBalance(address || this.wallet.address, this.wallet.options);
            case 4:
              return _context26.abrupt("return", _context26.sent);
            case 7:
              _context26.prev = 7;
              _context26.t0 = _context26["catch"](1);
            case 9:
              _context26.next = 11;
              return _wallet["default"].getBalance(address || this.wallet.address, this.options);
            case 11:
              return _context26.abrupt("return", _context26.sent);
            case 12:
            case "end":
              return _context26.stop();
          }
        }, _callee26, this, [[1, 7]]);
      }));
      function getBalance(_x33) {
        return _getBalance.apply(this, arguments);
      }
      return getBalance;
    }()
    /**
     * Same as [Wallet.getNonce](#walletgetnonce), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
    )
  }, {
    key: "getNonce",
    value: (function () {
      var _getNonce = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee27(address) {
        var options,
          _args27 = arguments;
        return _regeneratorRuntime().wrap(function _callee27$(_context27) {
          while (1) switch (_context27.prev = _context27.next) {
            case 0:
              options = _args27.length > 1 && _args27[1] !== undefined ? _args27[1] : {};
              if (!this.wallet.options.rpcServerAddr) {
                _context27.next = 10;
                break;
              }
              _context27.prev = 2;
              _context27.next = 5;
              return _wallet["default"].getNonce(address || this.wallet.address, Object.assign({}, this.wallet.options, options));
            case 5:
              return _context27.abrupt("return", _context27.sent);
            case 8:
              _context27.prev = 8;
              _context27.t0 = _context27["catch"](2);
            case 10:
              _context27.next = 12;
              return _wallet["default"].getNonce(address || this.wallet.address, Object.assign({}, this.options, options));
            case 12:
              return _context27.abrupt("return", _context27.sent);
            case 13:
            case "end":
              return _context27.stop();
          }
        }, _callee27, this, [[2, 8]]);
      }));
      function getNonce(_x34) {
        return _getNonce.apply(this, arguments);
      }
      return getNonce;
    }()
    /**
     * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
    )
  }, {
    key: "sendTransaction",
    value: (function () {
      var _sendTransaction = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee28(txn) {
        return _regeneratorRuntime().wrap(function _callee28$(_context28) {
          while (1) switch (_context28.prev = _context28.next) {
            case 0:
              if (!this.wallet.options.rpcServerAddr) {
                _context28.next = 9;
                break;
              }
              _context28.prev = 1;
              _context28.next = 4;
              return _wallet["default"].sendTransaction(txn, this.wallet.options);
            case 4:
              return _context28.abrupt("return", _context28.sent);
            case 7:
              _context28.prev = 7;
              _context28.t0 = _context28["catch"](1);
            case 9:
              _context28.next = 11;
              return _wallet["default"].sendTransaction(txn, this.options);
            case 11:
              return _context28.abrupt("return", _context28.sent);
            case 12:
            case "end":
              return _context28.stop();
          }
        }, _callee28, this, [[1, 7]]);
      }));
      function sendTransaction(_x35) {
        return _sendTransaction.apply(this, arguments);
      }
      return sendTransaction;
    }()
    /**
     * Same as [wallet.transferTo](#wallettransferto), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
    )
  }, {
    key: "transferTo",
    value: function transferTo(toAddress, amount) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return common.rpc.transferTo.call(this, toAddress, amount, options);
    }

    /**
     * Same as [wallet.registerName](#walletregistername), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
  }, {
    key: "registerName",
    value: function registerName(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return common.rpc.registerName.call(this, name, options);
    }

    /**
     * Same as [wallet.transferName](#wallettransfername), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
  }, {
    key: "transferName",
    value: function transferName(name, recipient) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return common.rpc.transferName.call(this, name, recipient, options);
    }

    /**
     * Same as [wallet.deleteName](#walletdeletename), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
  }, {
    key: "deleteName",
    value: function deleteName(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return common.rpc.deleteName.call(this, name, options);
    }

    /**
     * Same as [wallet.subscribe](#walletsubscribe), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
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
     * Same as [wallet.unsubscribe](#walletunsubscribe), but using this
     * client's connected node as rpcServerAddr, followed by this client's
     * rpcServerAddr if failed.
     */
  }, {
    key: "unsubscribe",
    value: function unsubscribe(topic) {
      var identifier = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return common.rpc.unsubscribe.call(this, topic, identifier, options);
    }
  }, {
    key: "createTransaction",
    value: function createTransaction(pld, nonce) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.wallet.createTransaction(pld, nonce, options);
    }
  }]);
}();
var ResponseProcessor = /*#__PURE__*/function () {
  function ResponseProcessor(messageId, timeout, responseHandler, timeoutHandler) {
    _classCallCheck(this, ResponseProcessor);
    _defineProperty(this, "messageId", void 0);
    _defineProperty(this, "deadline", void 0);
    _defineProperty(this, "responseHandler", void 0);
    _defineProperty(this, "timeoutHandler", void 0);
    if (messageId instanceof Uint8Array) {
      messageId = common.util.bytesToHex(messageId);
    }
    this.messageId = messageId;
    if (timeout) {
      this.deadline = Date.now() + timeout;
    }
    this.responseHandler = responseHandler;
    this.timeoutHandler = timeoutHandler;
  }
  return _createClass(ResponseProcessor, [{
    key: "checkTimeout",
    value: function checkTimeout(now) {
      if (!this.deadline) {
        return false;
      }
      if (!now) {
        now = Date.now();
      }
      return now > this.deadline;
    }
  }, {
    key: "handleResponse",
    value: function handleResponse(data) {
      if (this.responseHandler) {
        this.responseHandler(data);
      }
    }
  }, {
    key: "handleTimeout",
    value: function handleTimeout() {
      if (this.timeoutHandler) {
        this.timeoutHandler(new Error("Message timeout"));
      }
    }
  }]);
}();
var ResponseManager = /*#__PURE__*/function () {
  function ResponseManager() {
    _classCallCheck(this, ResponseManager);
    _defineProperty(this, "responseProcessors", void 0);
    _defineProperty(this, "timer", void 0);
    this.responseProcessors = new Map();
    this.timer = null;
    this.checkTimeout();
  }
  return _createClass(ResponseManager, [{
    key: "add",
    value: function add(proceccor) {
      this.responseProcessors.set(proceccor.messageId, proceccor);
    }
  }, {
    key: "clear",
    value: function clear() {
      var _iterator2 = _createForOfIteratorHelper(this.responseProcessors.values()),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var processor = _step2.value;
          processor.handleTimeout();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.responseProcessors = new Map();
    }
  }, {
    key: "stop",
    value: function stop() {
      clearTimeout(this.timer);
      this.clear();
    }
  }, {
    key: "respond",
    value: function respond(messageId, data, payloadType) {
      if (messageId instanceof Uint8Array) {
        messageId = common.util.bytesToHex(messageId);
      }
      var responseProcessor = this.responseProcessors.get(messageId);
      if (responseProcessor) {
        responseProcessor.handleResponse(data);
        this.responseProcessors["delete"](messageId);
      }
    }
  }, {
    key: "checkTimeout",
    value: function checkTimeout() {
      var _this6 = this;
      var timeoutProcessors = [];
      var now = Date.now();
      var _iterator3 = _createForOfIteratorHelper(this.responseProcessors.values()),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var processor = _step3.value;
          if (processor.checkTimeout(now)) {
            timeoutProcessors.push(processor);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      timeoutProcessors.forEach(function (p) {
        p.handleTimeout();
        _this6.responseProcessors["delete"](p.messageId);
      });
      this.timer = setTimeout(this.checkTimeout.bind(this), consts.checkTimeoutInterval);
    }
  }]);
}();
/**
 * One or multiple NKN address type. Each NKN address should either be the form
 * of 'identifier.publicKey', or a name registered using wallet.
 */
/**
 * Message data type.
 */
/**
 * Reply data type, `null` means ACK instead of reply is received.
 */
/**
 * Message type.
 * @property {string} src - Message sender address.
 * @property {MessageData} payload - Message payload.
 * @property {nkn.pb.payloads.PayloadType} payloadType - Message payload type.
 * @property {boolean} isEncrypted - Whether message is end to end encrypted.
 * @property {Uint8Array} messageId - Unique message ID.
 * @property {boolean} noReply - Indicating no reply should be sent back as sender will not process it.
 */
/**
 * Connect handler function type.
 */
/**
 * Connect Failed handler function type.
 */
/**
 * Message handler function type.
 */
/**
 * Websocket error handler function type.
 */
/**
 * Send message options type.
 * @property {number} [responseTimeout] - Message response timeout in ms. Zero disables timeout.
 * @property {boolean} [encrypt] - Whether to end to end encrypt message.
 * @property {number} [msgHoldingSeconds] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 * @property {boolean} [noReply=false] - Do not allocate any resources to wait for reply. Returned promise will resolve with null immediately when send success.
 */
/**
 * Publish message options type.
 * @property {boolean} [txPool=false] - Whether to send message to subscribers whose subscribe transaction is still in txpool. Enabling this will cause subscribers to receive message sooner after sending subscribe transaction, but might affect the correctness of subscribers because transactions in txpool is not guaranteed to be packed into a block.
 * @property {boolean} [encrypt] - Whether to end to end encrypt message.
 * @property {number} [msgHoldingSeconds] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 */