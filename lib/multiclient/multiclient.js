"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var ncp = _interopRequireWildcard(require("@nkn/ncp"));
var _memoryCache = require("memory-cache");
var _promise = _interopRequireDefault(require("core-js-pure/features/promise"));
var _client = _interopRequireDefault(require("../client"));
var _wallet = _interopRequireDefault(require("../wallet"));
var _consts = require("../client/consts");
var common = _interopRequireWildcard(require("../common"));
var consts = _interopRequireWildcard(require("./consts"));
var message = _interopRequireWildcard(require("../client/message"));
var util = _interopRequireWildcard(require("./util"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
/**
 * NKN client that sends data to and receives data from other NKN clients.
 * @param {Object} [options={}] - Client configuration
 * @param {string} [options.seed=undefined] - Secret seed (64 hex characters). If empty, a random seed will be used.
 * @param {string} [options.identifier=undefined] - Identifier used to differentiate multiple clients sharing the same secret seed.
 * @param {number} [options.reconnectIntervalMin=1000] - Minimal reconnect interval in ms.
 * @param {number} [options.reconnectIntervalMax=64000] - Maximal reconnect interval in ms.
 * @param {number} [options.responseTimeout=5000] - Message response timeout in ms. Zero disables timeout.
 * @param {number} [options.msgHoldingSeconds=0] - Maximal message holding time in second. Message might be cached and held by node up to this duration if destination client is not online. Zero disables cache.
 * @param {boolean} [options.encrypt=true] - Whether to end to end encrypt message.
 * @param {string} [options.rpcServerAddr='https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'] - RPC server address used to join the network.
 * @param {boolean} [options.webrtc=undefined] - Force to use/not use web rtc if defined. By default, webrtc is used only in https location when tls is undefined.
 * @param {boolean} [options.tls=undefined] - Force to use ws or wss if defined. This option is only used when webrtc is not used. Default is true in https location, otherwise false.
 * @param {string|Array<string>} [options.stunServerAddr=["stun:stun.l.google.com:19302","stun:stun.cloudflare.com:3478","stun:stunserver.stunprotocol.org:3478"]] - Stun server address for webrtc.
 * @param {boolean|function} [options.worker=false] - Whether to use web workers (if available) to compute signatures. Can also be a function that returns web worker. Typically you only need to set it to a function if you import nkn-sdk as a module and are NOT using browserify or webpack worker-loader to bundle js file. The worker file is located at `lib/worker/webpack.worker.js`.
 * @param {number} [options.numSubClients=4] - Number of sub clients to create.
 * @param {boolean} [options.originalClient=false] - Whether to create client with no additional identifier prefix added. This client is not counted towards sub clients controlled by `options.numSubClients`.
 * @param {number} [options.msgCacheExpiration=300000] - Message cache expiration time in ms. This cache is used to remove duplicate messages received by different clients.
 * @param {Object} [options.sessionConfig={}] - Session configuration
 */
var MultiClient = exports["default"] = /*#__PURE__*/function () {
  function MultiClient() {
    var _this = this;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, MultiClient);
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
    /**
     * Underlying NKN clients used to send/receive data.
     */
    _defineProperty(this, "clients", void 0);
    /**
     * Default NKN client for low level API access.
     */
    _defineProperty(this, "defaultClient", void 0);
    _defineProperty(this, "msgCache", void 0);
    _defineProperty(this, "acceptAddrs", void 0);
    _defineProperty(this, "sessions", void 0);
    /**
     * Whether multiclient is ready (at least one underylying client is ready).
     */
    _defineProperty(this, "isReady", void 0);
    /**
     * Whether multiclient fails to connect to node (all underlying clients failed).
     */
    _defineProperty(this, "isFailed", void 0);
    /**
     * Whether multiclient is closed.
     */
    _defineProperty(this, "isClosed", void 0);
    options = common.util.assignDefined({}, consts.defaultOptions, options);
    var baseIdentifier = options.identifier || "";
    var clients = {};
    if (options.originalClient) {
      var clientID = util.addIdentifier("", "");
      clients[clientID] = new _client["default"](options);
      if (!options.seed) {
        options = common.util.assignDefined({}, options, {
          seed: clients[clientID].key.seed
        });
      }
    }
    for (var i = 0; i < options.numSubClients; i++) {
      clients[util.addIdentifier("", i)] = new _client["default"](common.util.assignDefined({}, options, {
        identifier: util.addIdentifier(baseIdentifier, i)
      }));
      if (i === 0 && !options.seed) {
        options = common.util.assignDefined({}, options, {
          seed: clients[util.addIdentifier("", i)].key.seed
        });
      }
    }
    var clientIDs = Object.keys(clients).sort();
    if (clientIDs.length === 0) {
      throw new RangeError("should have at least one client");
    }
    this.options = options;
    this.clients = clients;
    this.defaultClient = clients[clientIDs[0]];
    this.key = this.defaultClient.key;
    this.identifier = baseIdentifier;
    this.addr = (baseIdentifier ? baseIdentifier + "." : "") + this.key.publicKey;
    this.eventListeners = {
      connect: [],
      connectFailed: [],
      wsError: [],
      message: [],
      session: []
    };
    this.msgCache = new _memoryCache.Cache();
    this.acceptAddrs = [];
    this.sessions = new Map();
    this.isReady = false;
    this.isFailed = false;
    this.isClosed = false;
    var _loop = function _loop() {
      var clientID = _Object$keys[_i];
      clients[clientID].onMessage(/*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(_ref) {
          var src, payload, payloadType, isEncrypted, messageId, noReply, key, responses, responded, _iterator, _step, response, _i2, _Object$keys2, _clientID;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                src = _ref.src, payload = _ref.payload, payloadType = _ref.payloadType, isEncrypted = _ref.isEncrypted, messageId = _ref.messageId, noReply = _ref.noReply;
                if (!_this.isClosed) {
                  _context2.next = 3;
                  break;
                }
                return _context2.abrupt("return", false);
              case 3:
                if (!(payloadType === common.pb.payloads.PayloadType.SESSION)) {
                  _context2.next = 16;
                  break;
                }
                if (isEncrypted) {
                  _context2.next = 6;
                  break;
                }
                return _context2.abrupt("return", false);
              case 6:
                _context2.prev = 6;
                _context2.next = 9;
                return _this._handleSessionMsg(clientID, src, messageId, payload);
              case 9:
                _context2.next = 15;
                break;
              case 11:
                _context2.prev = 11;
                _context2.t0 = _context2["catch"](6);
                if (_context2.t0 instanceof ncp.errors.SessionClosedError || _context2.t0 instanceof common.errors.AddrNotAllowedError) {
                  _context2.next = 15;
                  break;
                }
                throw _context2.t0;
              case 15:
                return _context2.abrupt("return", false);
              case 16:
                key = common.util.bytesToHex(messageId);
                if (!(_this.msgCache.get(key) !== null)) {
                  _context2.next = 19;
                  break;
                }
                return _context2.abrupt("return", false);
              case 19:
                _this.msgCache.put(key, clientID, options.msgCacheExpiration);
                src = util.removeIdentifier(src).addr;
                if (!(_this.eventListeners.message.length > 0)) {
                  _context2.next = 51;
                  break;
                }
                _context2.next = 24;
                return _promise["default"].all(_this.eventListeners.message.map(/*#__PURE__*/function () {
                  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(f) {
                    return _regeneratorRuntime().wrap(function _callee$(_context) {
                      while (1) switch (_context.prev = _context.next) {
                        case 0:
                          _context.prev = 0;
                          _context.next = 3;
                          return f({
                            src: src,
                            payload: payload,
                            payloadType: payloadType,
                            isEncrypted: isEncrypted,
                            messageId: messageId,
                            noReply: noReply
                          });
                        case 3:
                          return _context.abrupt("return", _context.sent);
                        case 6:
                          _context.prev = 6;
                          _context.t0 = _context["catch"](0);
                          console.log("Message handler error:", _context.t0);
                          return _context.abrupt("return", null);
                        case 10:
                        case "end":
                          return _context.stop();
                      }
                    }, _callee, null, [[0, 6]]);
                  }));
                  return function (_x2) {
                    return _ref3.apply(this, arguments);
                  };
                }()));
              case 24:
                responses = _context2.sent;
                if (noReply) {
                  _context2.next = 51;
                  break;
                }
                responded = false;
                _iterator = _createForOfIteratorHelper(responses);
                _context2.prev = 28;
                _iterator.s();
              case 30:
                if ((_step = _iterator.n()).done) {
                  _context2.next = 42;
                  break;
                }
                response = _step.value;
                if (!(response === false)) {
                  _context2.next = 36;
                  break;
                }
                return _context2.abrupt("return", false);
              case 36:
                if (!(response !== undefined && response !== null)) {
                  _context2.next = 40;
                  break;
                }
                _this.send(src, response, {
                  encrypt: isEncrypted,
                  msgHoldingSeconds: 0,
                  replyToId: messageId
                })["catch"](function (e) {
                  console.log("Send response error:", e);
                });
                responded = true;
                return _context2.abrupt("break", 42);
              case 40:
                _context2.next = 30;
                break;
              case 42:
                _context2.next = 47;
                break;
              case 44:
                _context2.prev = 44;
                _context2.t1 = _context2["catch"](28);
                _iterator.e(_context2.t1);
              case 47:
                _context2.prev = 47;
                _iterator.f();
                return _context2.finish(47);
              case 50:
                if (!responded) {
                  for (_i2 = 0, _Object$keys2 = Object.keys(clients); _i2 < _Object$keys2.length; _i2++) {
                    _clientID = _Object$keys2[_i2];
                    if (clients[_clientID].isReady) {
                      clients[_clientID]._sendACK(util.addIdentifierPrefixAll(src, _clientID), messageId, isEncrypted)["catch"](function (e) {
                        console.log("Send ack error:", e);
                      });
                    }
                  }
                }
              case 51:
                return _context2.abrupt("return", false);
              case 52:
              case "end":
                return _context2.stop();
            }
          }, _callee2, null, [[6, 11], [28, 44, 47, 50]]);
        }));
        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      }());
    };
    for (var _i = 0, _Object$keys = Object.keys(clients); _i < _Object$keys.length; _i++) {
      _loop();
    }
    var connectPromises = Object.keys(this.clients).map(function (clientID) {
      return new _promise["default"](function (resolve, reject) {
        _this.clients[clientID].onConnect(resolve);
      });
    });
    _promise["default"].any(connectPromises).then(function (r) {
      _this.isReady = true;
      if (_this.eventListeners.connect.length > 0) {
        _this.eventListeners.connect.forEach(/*#__PURE__*/function () {
          var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(f) {
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.prev = 0;
                  _context3.next = 3;
                  return f(r);
                case 3:
                  _context3.next = 8;
                  break;
                case 5:
                  _context3.prev = 5;
                  _context3.t0 = _context3["catch"](0);
                  console.log("Connect handler error:", _context3.t0);
                case 8:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, null, [[0, 5]]);
          }));
          return function (_x3) {
            return _ref4.apply(this, arguments);
          };
        }());
      }
    });
    var connectFailedPromises = Object.keys(this.clients).map(function (clientID) {
      return new _promise["default"](function (resolve, reject) {
        _this.clients[clientID].onConnectFailed(resolve);
      });
    });
    _promise["default"].all(connectFailedPromises).then(function () {
      _this.isFailed = true;
      if (_this.eventListeners.connectFailed.length > 0) {
        _this.eventListeners.connectFailed.forEach(/*#__PURE__*/function () {
          var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(f) {
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;
                  _context4.next = 3;
                  return f();
                case 3:
                  _context4.next = 8;
                  break;
                case 5:
                  _context4.prev = 5;
                  _context4.t0 = _context4["catch"](0);
                  console.log("Connect failed handler error:", _context4.t0);
                case 8:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, null, [[0, 5]]);
          }));
          return function (_x4) {
            return _ref5.apply(this, arguments);
          };
        }());
      } else {
        console.log("All clients connect failed");
      }
    });
    Object.keys(this.clients).map(function (clientID) {
      _this.clients[clientID].onWsError(function (event) {
        if (_this.eventListeners.wsError.length > 0) {
          _this.eventListeners.wsError.forEach(/*#__PURE__*/function () {
            var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(f) {
              return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                while (1) switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.prev = 0;
                    _context5.next = 3;
                    return f(event);
                  case 3:
                    _context5.next = 8;
                    break;
                  case 5:
                    _context5.prev = 5;
                    _context5.t0 = _context5["catch"](0);
                    console.log("WsError handler error:", _context5.t0);
                  case 8:
                  case "end":
                    return _context5.stop();
                }
              }, _callee5, null, [[0, 5]]);
            }));
            return function (_x5) {
              return _ref6.apply(this, arguments);
            };
          }());
        } else {
          console.log(event.message);
        }
      });
    });
  }

  /**
   * Get the secret seed of the client.
   * @returns Secret seed as hex string.
   */
  return _createClass(MultiClient, [{
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
    key: "_shouldAcceptAddr",
    value: function _shouldAcceptAddr(addr) {
      var _iterator2 = _createForOfIteratorHelper(this.acceptAddrs),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var allowAddr = _step2.value;
          if (allowAddr.test(addr)) {
            return true;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return false;
    }
  }, {
    key: "_handleSessionMsg",
    value: function () {
      var _handleSessionMsg2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(localClientID, src, sessionID, data) {
        var remote, remoteAddr, remoteClientID, sessionKey, session, existed;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              remote = util.removeIdentifier(src);
              remoteAddr = remote.addr;
              remoteClientID = remote.clientID;
              sessionKey = util.sessionKey(remoteAddr, sessionID);
              existed = this.sessions.has(sessionKey);
              if (!existed) {
                _context7.next = 9;
                break;
              }
              session = this.sessions.get(sessionKey);
              _context7.next = 13;
              break;
            case 9:
              if (this._shouldAcceptAddr(remoteAddr)) {
                _context7.next = 11;
                break;
              }
              throw new common.errors.AddrNotAllowedError();
            case 11:
              session = this._newSession(remoteAddr, sessionID, this.options.sessionConfig);
              this.sessions.set(sessionKey, session);
            case 13:
              session.receiveWith(localClientID, remoteClientID, data);
              if (existed) {
                _context7.next = 20;
                break;
              }
              _context7.next = 17;
              return session.accept();
            case 17:
              if (!(this.eventListeners.session.length > 0)) {
                _context7.next = 20;
                break;
              }
              _context7.next = 20;
              return _promise["default"].all(this.eventListeners.session.map(/*#__PURE__*/function () {
                var _ref7 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(f) {
                  return _regeneratorRuntime().wrap(function _callee6$(_context6) {
                    while (1) switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.prev = 0;
                        _context6.next = 3;
                        return f(session);
                      case 3:
                        return _context6.abrupt("return", _context6.sent);
                      case 6:
                        _context6.prev = 6;
                        _context6.t0 = _context6["catch"](0);
                        console.log("Session handler error:", _context6.t0);
                        return _context6.abrupt("return");
                      case 10:
                      case "end":
                        return _context6.stop();
                    }
                  }, _callee6, null, [[0, 6]]);
                }));
                return function (_x10) {
                  return _ref7.apply(this, arguments);
                };
              }()));
            case 20:
            case "end":
              return _context7.stop();
          }
        }, _callee7, this);
      }));
      function _handleSessionMsg(_x6, _x7, _x8, _x9) {
        return _handleSessionMsg2.apply(this, arguments);
      }
      return _handleSessionMsg;
    }()
  }, {
    key: "_newSession",
    value: function _newSession(remoteAddr, sessionID) {
      var _this2 = this;
      var sessionConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var clientIDs = this.readyClientIDs().sort();
      return new ncp.Session(this.addr, remoteAddr, clientIDs, null, /*#__PURE__*/function () {
        var _ref8 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(localClientID, remoteClientID, data) {
          var client, payload;
          return _regeneratorRuntime().wrap(function _callee8$(_context8) {
            while (1) switch (_context8.prev = _context8.next) {
              case 0:
                client = _this2.clients[localClientID];
                if (client.isReady) {
                  _context8.next = 3;
                  break;
                }
                throw new common.errors.ClientNotReadyError();
              case 3:
                payload = message.newSessionPayload(data, sessionID);
                _context8.next = 6;
                return client._send(util.addIdentifierPrefix(remoteAddr, remoteClientID), payload);
              case 6:
              case "end":
                return _context8.stop();
            }
          }, _callee8);
        }));
        return function (_x11, _x12, _x13) {
          return _ref8.apply(this, arguments);
        };
      }(), sessionConfig);
    }

    /**
     * Send byte or string data to a single or an array of destination using the
     * client with given clientID. Typically `send` should be used instead for
     * better reliability and lower latency.
     * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
     */
  }, {
    key: "sendWithClient",
    value: (function () {
      var _sendWithClient = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(clientID, dest, data) {
        var options,
          client,
          _args9 = arguments;
        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              options = _args9.length > 3 && _args9[3] !== undefined ? _args9[3] : {};
              client = this.clients[clientID];
              if (client) {
                _context9.next = 4;
                break;
              }
              throw new common.errors.InvalidArgumentError("no such clientID");
            case 4:
              if (client.isReady) {
                _context9.next = 6;
                break;
              }
              throw new common.errors.ClientNotReadyError();
            case 6:
              _context9.next = 8;
              return client.send(util.addIdentifierPrefixAll(dest, clientID), data, options);
            case 8:
              return _context9.abrupt("return", _context9.sent);
            case 9:
            case "end":
              return _context9.stop();
          }
        }, _callee9, this);
      }));
      function sendWithClient(_x14, _x15, _x16) {
        return _sendWithClient.apply(this, arguments);
      }
      return sendWithClient;
    }()
    /**
     * Get the list of clientID that are ready.
     */
    )
  }, {
    key: "readyClientIDs",
    value: function readyClientIDs() {
      var _this3 = this;
      return Object.keys(this.clients).filter(function (clientID) {
        return _this3.clients[clientID] && _this3.clients[clientID].isReady;
      });
    }

    /**
     * Send byte or string data to a single or an array of destination using all
     * available clients.
     * @returns A promise that will be resolved when reply or ACK from destination is received, or reject if send fail or message timeout. If dest is an array with more than one element, or `options.noReply=true`, the promise will resolve with null as soon as send success.
     */
  }, {
    key: "send",
    value: (function () {
      var _send = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(dest, data) {
        var _this4 = this;
        var options,
          readyClientID,
          _args10 = arguments;
        return _regeneratorRuntime().wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              options = _args10.length > 2 && _args10[2] !== undefined ? _args10[2] : {};
              options = common.util.assignDefined({}, options, {
                messageId: common.util.randomBytes(message.messageIdSize)
              });
              readyClientID = this.readyClientIDs();
              if (!(readyClientID.length === 0)) {
                _context10.next = 5;
                break;
              }
              throw new common.errors.ClientNotReadyError();
            case 5:
              _context10.next = 7;
              return this.defaultClient._processDests(dest);
            case 7:
              dest = _context10.sent;
              _context10.prev = 8;
              _context10.next = 11;
              return _promise["default"].any(readyClientID.map(function (clientID) {
                return _this4.sendWithClient(clientID, dest, data, options);
              }));
            case 11:
              return _context10.abrupt("return", _context10.sent);
            case 14:
              _context10.prev = 14;
              _context10.t0 = _context10["catch"](8);
              throw new Error("failed to send with any client: " + _context10.t0.errors);
            case 17:
            case "end":
              return _context10.stop();
          }
        }, _callee10, this, [[8, 14]]);
      }));
      function send(_x17, _x18) {
        return _send.apply(this, arguments);
      }
      return send;
    }()
    /**
     * Send byte or string data to all subscribers of a topic using all available
     * clients.
     * @returns A promise that will be resolved with null when send success.
     */
    )
  }, {
    key: "publish",
    value: (function () {
      var _publish = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(topic, data) {
        var options,
          offset,
          res,
          subscribers,
          subscribersInTxPool,
          _args11 = arguments;
        return _regeneratorRuntime().wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              options = _args11.length > 2 && _args11[2] !== undefined ? _args11[2] : {};
              options = common.util.assignDefined({}, _consts.defaultPublishOptions, options, {
                noReply: true
              });
              offset = options.offset;
              _context11.next = 5;
              return this.getSubscribers(topic, {
                offset: offset,
                limit: options.limit,
                txPool: options.txPool
              });
            case 5:
              res = _context11.sent;
              subscribers = res.subscribers;
              subscribersInTxPool = res.subscribersInTxPool;
            case 8:
              if (!(res.subscribers && res.subscribers.length >= options.limit)) {
                _context11.next = 16;
                break;
              }
              offset += options.limit;
              _context11.next = 12;
              return this.getSubscribers(topic, {
                offset: offset,
                limit: options.limit
              });
            case 12:
              res = _context11.sent;
              subscribers = subscribers.concat(res.subscribers);
              _context11.next = 8;
              break;
            case 16:
              if (options.txPool) {
                subscribers = subscribers.concat(subscribersInTxPool);
              }
              _context11.next = 19;
              return this.send(subscribers, data, options);
            case 19:
              return _context11.abrupt("return", _context11.sent);
            case 20:
            case "end":
              return _context11.stop();
          }
        }, _callee11, this);
      }));
      function publish(_x19, _x20) {
        return _publish.apply(this, arguments);
      }
      return publish;
    }()
    /**
     * @deprecated please use onConnect, onMessage, onSession, etc.
     */
    )
  }, {
    key: "on",
    value: function on(evt, func) {
      if (!this.eventListeners[evt]) {
        this.eventListeners[evt] = [];
      }
      this.eventListeners[evt].push(func);
    }

    /**
     * Add event listener function that will be called when at least one sub
     * client is connected to node. Multiple listeners will be called sequentially
     * in the order of added. Note that listeners added after client is connected
     * to node (i.e. `multiclient.isReady === true`) will not be called.
     */
  }, {
    key: "onConnect",
    value: function onConnect(func) {
      this.eventListeners.connect.push(func);
    }

    /**
     * Add event listener function that will be called when all sub clients fail
     * to connect to node. Multiple listeners will be called sequentially in the
     * order of added. Note that listeners added after client fails to connect to
     * node (i.e. `multiclient.isFailed === true`) will not be called.
     */
  }, {
    key: "onConnectFailed",
    value: function onConnectFailed(func) {
      this.eventListeners.connectFailed.push(func);
    }

    /**
     * Add event listener function that will be called when any client websocket
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

    /**
     * Add event listener function that will be called when client accepts a new
     * session.
     */
  }, {
    key: "onSession",
    value: function onSession(func) {
      this.eventListeners.session.push(func);
    }

    /**
     * Close the client and all sessions.
     */
  }, {
    key: "close",
    value: (function () {
      var _close = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12() {
        var _this5 = this;
        var promises, _iterator3, _step3, session;
        return _regeneratorRuntime().wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              promises = [];
              _iterator3 = _createForOfIteratorHelper(this.sessions.values());
              try {
                for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                  session = _step3.value;
                  promises.push(session.close());
                }
              } catch (err) {
                _iterator3.e(err);
              } finally {
                _iterator3.f();
              }
              _context12.prev = 3;
              _context12.next = 6;
              return _promise["default"].all(promises);
            case 6:
              _context12.next = 11;
              break;
            case 8:
              _context12.prev = 8;
              _context12.t0 = _context12["catch"](3);
              console.log(_context12.t0);
            case 11:
              Object.keys(this.clients).forEach(function (clientID) {
                try {
                  _this5.clients[clientID].close();
                } catch (e) {
                  console.log(e);
                }
              });
              this.msgCache.clear();
              this.isClosed = true;
            case 14:
            case "end":
              return _context12.stop();
          }
        }, _callee12, this, [[3, 8]]);
      }));
      function close() {
        return _close.apply(this, arguments);
      }
      return close;
    }()
    /**
     * Start accepting sessions from addresses, which could be one or an array of
     * RegExp. If addrs is a string or string array, each element will be
     * converted to RegExp. Session from NKN address that matches any RegExp in
     * addrs will be allowed. When addrs is null or undefined, any address will be
     * accepted. Each function call will overwrite previous listening addresses.
     */
    )
  }, {
    key: "listen",
    value: function listen(addrs) {
      if (addrs === null || addrs === undefined) {
        addrs = [consts.defaultSessionAllowAddr];
      } else if (!Array.isArray(addrs)) {
        if (addrs instanceof RegExp) {
          addrs = [addrs];
        } else {
          addrs = [addrs];
        }
      }
      this.acceptAddrs = [];
      for (var i = 0; i < addrs.length; i++) {
        if (addrs[i] instanceof RegExp) {
          this.acceptAddrs.push(addrs[i]);
        } else {
          this.acceptAddrs.push(new RegExp(addrs[i]));
        }
      }
    }

    /**
     * Dial a session to a remote NKN address.
     */
  }, {
    key: "dial",
    value: (function () {
      var _dial = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(remoteAddr) {
        var options,
          dialTimeout,
          sessionConfig,
          sessionID,
          sessionKey,
          session,
          _args13 = arguments;
        return _regeneratorRuntime().wrap(function _callee13$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              options = _args13.length > 1 && _args13[1] !== undefined ? _args13[1] : {};
              dialTimeout = options.dialTimeout;
              options = common.util.assignDefined({}, options);
              delete options.dialTimeout;
              sessionConfig = common.util.assignDefined({}, this.options.sessionConfig, options);
              sessionID = common.util.randomBytes(consts.sessionIDSize);
              sessionKey = util.sessionKey(remoteAddr, sessionID);
              session = this._newSession(remoteAddr, sessionID, sessionConfig);
              this.sessions.set(sessionKey, session);
              _context13.next = 11;
              return session.dial(dialTimeout);
            case 11:
              return _context13.abrupt("return", session);
            case 12:
            case "end":
              return _context13.stop();
          }
        }, _callee13, this);
      }));
      function dial(_x21) {
        return _dial.apply(this, arguments);
      }
      return dial;
    }()
    /**
     * Same as [Wallet.getLatestBlock](#walletgetlatestblock), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
    )
  }, {
    key: "getLatestBlock",
    value: (function () {
      var _getLatestBlock = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14() {
        var _i3, _Object$keys3, clientID;
        return _regeneratorRuntime().wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              _i3 = 0, _Object$keys3 = Object.keys(this.clients);
            case 1:
              if (!(_i3 < _Object$keys3.length)) {
                _context14.next = 15;
                break;
              }
              clientID = _Object$keys3[_i3];
              if (!this.clients[clientID].wallet.options.rpcServerAddr) {
                _context14.next = 12;
                break;
              }
              _context14.prev = 4;
              _context14.next = 7;
              return _wallet["default"].getLatestBlock(this.clients[clientID].wallet.options);
            case 7:
              return _context14.abrupt("return", _context14.sent);
            case 10:
              _context14.prev = 10;
              _context14.t0 = _context14["catch"](4);
            case 12:
              _i3++;
              _context14.next = 1;
              break;
            case 15:
              _context14.next = 17;
              return _wallet["default"].getLatestBlock(this.options);
            case 17:
              return _context14.abrupt("return", _context14.sent);
            case 18:
            case "end":
              return _context14.stop();
          }
        }, _callee14, this, [[4, 10]]);
      }));
      function getLatestBlock() {
        return _getLatestBlock.apply(this, arguments);
      }
      return getLatestBlock;
    }()
    /**
     * Same as [Wallet.getRegistrant](#walletgetregistrant), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
    )
  }, {
    key: "getRegistrant",
    value: (function () {
      var _getRegistrant = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15(name) {
        var _i4, _Object$keys4, clientID;
        return _regeneratorRuntime().wrap(function _callee15$(_context15) {
          while (1) switch (_context15.prev = _context15.next) {
            case 0:
              _i4 = 0, _Object$keys4 = Object.keys(this.clients);
            case 1:
              if (!(_i4 < _Object$keys4.length)) {
                _context15.next = 15;
                break;
              }
              clientID = _Object$keys4[_i4];
              if (!this.clients[clientID].wallet.options.rpcServerAddr) {
                _context15.next = 12;
                break;
              }
              _context15.prev = 4;
              _context15.next = 7;
              return _wallet["default"].getRegistrant(name, this.clients[clientID].wallet.options);
            case 7:
              return _context15.abrupt("return", _context15.sent);
            case 10:
              _context15.prev = 10;
              _context15.t0 = _context15["catch"](4);
            case 12:
              _i4++;
              _context15.next = 1;
              break;
            case 15:
              _context15.next = 17;
              return _wallet["default"].getRegistrant(name, this.options);
            case 17:
              return _context15.abrupt("return", _context15.sent);
            case 18:
            case "end":
              return _context15.stop();
          }
        }, _callee15, this, [[4, 10]]);
      }));
      function getRegistrant(_x22) {
        return _getRegistrant.apply(this, arguments);
      }
      return getRegistrant;
    }()
    /**
     * Same as [Wallet.getSubscribers](#walletgetsubscribers), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
    )
  }, {
    key: "getSubscribers",
    value: (function () {
      var _getSubscribers = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee16(topic) {
        var options,
          _i5,
          _Object$keys5,
          clientID,
          _args16 = arguments;
        return _regeneratorRuntime().wrap(function _callee16$(_context16) {
          while (1) switch (_context16.prev = _context16.next) {
            case 0:
              options = _args16.length > 1 && _args16[1] !== undefined ? _args16[1] : {};
              _i5 = 0, _Object$keys5 = Object.keys(this.clients);
            case 2:
              if (!(_i5 < _Object$keys5.length)) {
                _context16.next = 16;
                break;
              }
              clientID = _Object$keys5[_i5];
              if (!this.clients[clientID].wallet.options.rpcServerAddr) {
                _context16.next = 13;
                break;
              }
              _context16.prev = 5;
              _context16.next = 8;
              return _wallet["default"].getSubscribers(topic, Object.assign({}, this.clients[clientID].wallet.options, options));
            case 8:
              return _context16.abrupt("return", _context16.sent);
            case 11:
              _context16.prev = 11;
              _context16.t0 = _context16["catch"](5);
            case 13:
              _i5++;
              _context16.next = 2;
              break;
            case 16:
              _context16.next = 18;
              return _wallet["default"].getSubscribers(topic, Object.assign({}, this.options, options));
            case 18:
              return _context16.abrupt("return", _context16.sent);
            case 19:
            case "end":
              return _context16.stop();
          }
        }, _callee16, this, [[5, 11]]);
      }));
      function getSubscribers(_x23) {
        return _getSubscribers.apply(this, arguments);
      }
      return getSubscribers;
    }()
    /**
     * Same as [Wallet.getSubscribersCount](#walletgetsubscriberscount), but using
     * this multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
    )
  }, {
    key: "getSubscribersCount",
    value: (function () {
      var _getSubscribersCount = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee17(topic) {
        var _i6, _Object$keys6, clientID;
        return _regeneratorRuntime().wrap(function _callee17$(_context17) {
          while (1) switch (_context17.prev = _context17.next) {
            case 0:
              _i6 = 0, _Object$keys6 = Object.keys(this.clients);
            case 1:
              if (!(_i6 < _Object$keys6.length)) {
                _context17.next = 15;
                break;
              }
              clientID = _Object$keys6[_i6];
              if (!this.clients[clientID].wallet.options.rpcServerAddr) {
                _context17.next = 12;
                break;
              }
              _context17.prev = 4;
              _context17.next = 7;
              return _wallet["default"].getSubscribersCount(topic, this.clients[clientID].wallet.options);
            case 7:
              return _context17.abrupt("return", _context17.sent);
            case 10:
              _context17.prev = 10;
              _context17.t0 = _context17["catch"](4);
            case 12:
              _i6++;
              _context17.next = 1;
              break;
            case 15:
              _context17.next = 17;
              return _wallet["default"].getSubscribersCount(topic, this.options);
            case 17:
              return _context17.abrupt("return", _context17.sent);
            case 18:
            case "end":
              return _context17.stop();
          }
        }, _callee17, this, [[4, 10]]);
      }));
      function getSubscribersCount(_x24) {
        return _getSubscribersCount.apply(this, arguments);
      }
      return getSubscribersCount;
    }()
    /**
     * Same as [Wallet.getSubscription](#walletgetsubscription), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
    )
  }, {
    key: "getSubscription",
    value: (function () {
      var _getSubscription = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee18(topic, subscriber) {
        var _i7, _Object$keys7, clientID;
        return _regeneratorRuntime().wrap(function _callee18$(_context18) {
          while (1) switch (_context18.prev = _context18.next) {
            case 0:
              _i7 = 0, _Object$keys7 = Object.keys(this.clients);
            case 1:
              if (!(_i7 < _Object$keys7.length)) {
                _context18.next = 15;
                break;
              }
              clientID = _Object$keys7[_i7];
              if (!this.clients[clientID].wallet.options.rpcServerAddr) {
                _context18.next = 12;
                break;
              }
              _context18.prev = 4;
              _context18.next = 7;
              return _wallet["default"].getSubscription(topic, subscriber, this.clients[clientID].wallet.options);
            case 7:
              return _context18.abrupt("return", _context18.sent);
            case 10:
              _context18.prev = 10;
              _context18.t0 = _context18["catch"](4);
            case 12:
              _i7++;
              _context18.next = 1;
              break;
            case 15:
              _context18.next = 17;
              return _wallet["default"].getSubscription(topic, subscriber, this.options);
            case 17:
              return _context18.abrupt("return", _context18.sent);
            case 18:
            case "end":
              return _context18.stop();
          }
        }, _callee18, this, [[4, 10]]);
      }));
      function getSubscription(_x25, _x26) {
        return _getSubscription.apply(this, arguments);
      }
      return getSubscription;
    }()
    /**
     * Same as [Wallet.getBalance](#walletgetbalance), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
    )
  }, {
    key: "getBalance",
    value: (function () {
      var _getBalance = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee19(address) {
        var _i8, _Object$keys8, clientID;
        return _regeneratorRuntime().wrap(function _callee19$(_context19) {
          while (1) switch (_context19.prev = _context19.next) {
            case 0:
              _i8 = 0, _Object$keys8 = Object.keys(this.clients);
            case 1:
              if (!(_i8 < _Object$keys8.length)) {
                _context19.next = 15;
                break;
              }
              clientID = _Object$keys8[_i8];
              if (!this.clients[clientID].wallet.options.rpcServerAddr) {
                _context19.next = 12;
                break;
              }
              _context19.prev = 4;
              _context19.next = 7;
              return _wallet["default"].getBalance(address || this.defaultClient.wallet.address, this.clients[clientID].wallet.options);
            case 7:
              return _context19.abrupt("return", _context19.sent);
            case 10:
              _context19.prev = 10;
              _context19.t0 = _context19["catch"](4);
            case 12:
              _i8++;
              _context19.next = 1;
              break;
            case 15:
              _context19.next = 17;
              return _wallet["default"].getBalance(address || this.defaultClient.wallet.address, this.options);
            case 17:
              return _context19.abrupt("return", _context19.sent);
            case 18:
            case "end":
              return _context19.stop();
          }
        }, _callee19, this, [[4, 10]]);
      }));
      function getBalance(_x27) {
        return _getBalance.apply(this, arguments);
      }
      return getBalance;
    }()
    /**
     * Same as [Wallet.getNonce](#walletgetnonce), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
    )
  }, {
    key: "getNonce",
    value: (function () {
      var _getNonce = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee20(address) {
        var options,
          _i9,
          _Object$keys9,
          clientID,
          _args20 = arguments;
        return _regeneratorRuntime().wrap(function _callee20$(_context20) {
          while (1) switch (_context20.prev = _context20.next) {
            case 0:
              options = _args20.length > 1 && _args20[1] !== undefined ? _args20[1] : {};
              _i9 = 0, _Object$keys9 = Object.keys(this.clients);
            case 2:
              if (!(_i9 < _Object$keys9.length)) {
                _context20.next = 16;
                break;
              }
              clientID = _Object$keys9[_i9];
              if (!this.clients[clientID].wallet.options.rpcServerAddr) {
                _context20.next = 13;
                break;
              }
              _context20.prev = 5;
              _context20.next = 8;
              return _wallet["default"].getNonce(address || this.defaultClient.wallet.address, Object.assign({}, this.clients[clientID].wallet.options, options));
            case 8:
              return _context20.abrupt("return", _context20.sent);
            case 11:
              _context20.prev = 11;
              _context20.t0 = _context20["catch"](5);
            case 13:
              _i9++;
              _context20.next = 2;
              break;
            case 16:
              _context20.next = 18;
              return _wallet["default"].getNonce(address || this.defaultClient.wallet.address, Object.assign({}, this.options, options));
            case 18:
              return _context20.abrupt("return", _context20.sent);
            case 19:
            case "end":
              return _context20.stop();
          }
        }, _callee20, this, [[5, 11]]);
      }));
      function getNonce(_x28) {
        return _getNonce.apply(this, arguments);
      }
      return getNonce;
    }()
    /**
     * Same as [Wallet.sendTransaction](#walletsendtransaction), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
    )
  }, {
    key: "sendTransaction",
    value: (function () {
      var _sendTransaction = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee21(txn) {
        var clients;
        return _regeneratorRuntime().wrap(function _callee21$(_context21) {
          while (1) switch (_context21.prev = _context21.next) {
            case 0:
              clients = Object.values(this.clients).filter(function (client) {
                return client.wallet.options.rpcServerAddr;
              });
              if (!(clients.length > 0)) {
                _context21.next = 10;
                break;
              }
              _context21.prev = 2;
              _context21.next = 5;
              return _promise["default"].any(clients.map(function (client) {
                return _wallet["default"].sendTransaction(txn, client.wallet.options);
              }));
            case 5:
              return _context21.abrupt("return", _context21.sent);
            case 8:
              _context21.prev = 8;
              _context21.t0 = _context21["catch"](2);
            case 10:
              _context21.next = 12;
              return _wallet["default"].sendTransaction(txn, this.options);
            case 12:
              return _context21.abrupt("return", _context21.sent);
            case 13:
            case "end":
              return _context21.stop();
          }
        }, _callee21, this, [[2, 8]]);
      }));
      function sendTransaction(_x29) {
        return _sendTransaction.apply(this, arguments);
      }
      return sendTransaction;
    }()
    /**
     * Same as [wallet.transferTo](#wallettransferto), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
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
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
  }, {
    key: "registerName",
    value: function registerName(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return common.rpc.registerName.call(this, name, options);
    }

    /**
     * Same as [wallet.transferName](#wallettransfername), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
  }, {
    key: "transferName",
    value: function transferName(name, recipient) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return common.rpc.transferName.call(this, name, recipient, options);
    }

    /**
     * Same as [wallet.deleteName](#walletdeletename), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
     */
  }, {
    key: "deleteName",
    value: function deleteName(name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return common.rpc.deleteName.call(this, name, options);
    }

    /**
     * Same as [wallet.subscribe](#walletsubscribe), but using this
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
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
     * multiclient's connected node as rpcServerAddr, followed by this
     * multiclient's rpcServerAddr if failed.
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
      return this.defaultClient.wallet.createTransaction(pld, nonce, options);
    }
  }]);
}();
/**
 * Accept session handler function type.
 */
/**
 * Dial session options type.
 * @property {number} [dialTimeout] - Dial timeout in ms. Zero disables timeout.
 */