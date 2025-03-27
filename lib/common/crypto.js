"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeSharedKey = computeSharedKey;
exports.decryptSymmetric = decryptSymmetric;
exports.ed25519PkToCurve25519 = ed25519PkToCurve25519;
exports.ed25519SkToCurve25519 = ed25519SkToCurve25519;
exports.encryptSymmetric = encryptSymmetric;
exports.keyLength = void 0;
exports.keyPair = keyPair;
exports.seedLength = exports.publicKeyLength = exports.nonceLength = void 0;
exports.setDisableWASM = setDisableWASM;
exports.sign = sign;
exports.signatureLength = void 0;
var _ed2curve = _interopRequireDefault(require("ed2curve"));
var _libsodiumWrappers = _interopRequireDefault(require("libsodium-wrappers"));
var _tweetnacl = _interopRequireDefault(require("tweetnacl"));
var util = _interopRequireWildcard(require("./util"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var keyLength = exports.keyLength = 32;
var nonceLength = exports.nonceLength = 24;
var publicKeyLength = exports.publicKeyLength = 32;
var seedLength = exports.seedLength = 32;
var signatureLength = exports.signatureLength = 64;
var isReady = false;
var disableWASM = false;
function setDisableWASM(disable) {
  disableWASM = !!disable;
}
function keyPair(seed) {
  var seedBytes = util.hexToBytes(seed);
  var key;
  if (!disableWASM && isReady) {
    try {
      key = _libsodiumWrappers["default"].crypto_sign_seed_keypair(seedBytes);
      return {
        seed: seed,
        publicKey: key.publicKey,
        privateKey: key.privateKey,
        curvePrivateKey: ed25519SkToCurve25519(key.privateKey)
      };
    } catch (e) {
      console.warn(e);
    }
  }
  key = _tweetnacl["default"].sign.keyPair.fromSeed(seedBytes);
  return {
    seed: seed,
    publicKey: key.publicKey,
    privateKey: key.secretKey,
    curvePrivateKey: _ed2curve["default"].convertSecretKey(key.secretKey)
  };
}
function ed25519SkToCurve25519(sk) {
  if (!disableWASM && isReady) {
    try {
      return _libsodiumWrappers["default"].crypto_sign_ed25519_sk_to_curve25519(sk);
    } catch (e) {
      console.warn(e);
    }
  }
  return _ed2curve["default"].convertSecretKey(sk);
}
function ed25519PkToCurve25519(_x) {
  return _ed25519PkToCurve.apply(this, arguments);
}
function _ed25519PkToCurve() {
  _ed25519PkToCurve = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(pk) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (disableWASM) {
            _context.next = 12;
            break;
          }
          _context.prev = 1;
          if (isReady) {
            _context.next = 6;
            break;
          }
          _context.next = 5;
          return _libsodiumWrappers["default"].ready;
        case 5:
          isReady = true;
        case 6:
          return _context.abrupt("return", _libsodiumWrappers["default"].crypto_sign_ed25519_pk_to_curve25519(pk));
        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](1);
          console.warn(_context.t0);
        case 12:
          return _context.abrupt("return", _ed2curve["default"].convertPublicKey(pk));
        case 13:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 9]]);
  }));
  return _ed25519PkToCurve.apply(this, arguments);
}
function computeSharedKey(_x2, _x3) {
  return _computeSharedKey.apply(this, arguments);
}
function _computeSharedKey() {
  _computeSharedKey = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(myCurvePrivateKey, otherPubkey) {
    var otherCurvePubkey, sharedKey;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return ed25519PkToCurve25519(Buffer.from(otherPubkey, "hex"));
        case 2:
          otherCurvePubkey = _context2.sent;
          if (disableWASM) {
            _context2.next = 15;
            break;
          }
          _context2.prev = 4;
          if (isReady) {
            _context2.next = 9;
            break;
          }
          _context2.next = 8;
          return _libsodiumWrappers["default"].ready;
        case 8:
          isReady = true;
        case 9:
          sharedKey = _libsodiumWrappers["default"].crypto_box_beforenm(otherCurvePubkey, myCurvePrivateKey);
          _context2.next = 15;
          break;
        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](4);
          console.warn(_context2.t0);
        case 15:
          if (!sharedKey) {
            sharedKey = _tweetnacl["default"].box.before(otherCurvePubkey, myCurvePrivateKey);
          }
          return _context2.abrupt("return", util.bytesToHex(sharedKey));
        case 17:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[4, 12]]);
  }));
  return _computeSharedKey.apply(this, arguments);
}
function encryptSymmetric(_x4, _x5, _x6) {
  return _encryptSymmetric.apply(this, arguments);
}
function _encryptSymmetric() {
  _encryptSymmetric = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(message, nonce, key) {
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          if (disableWASM) {
            _context3.next = 12;
            break;
          }
          _context3.prev = 1;
          if (isReady) {
            _context3.next = 6;
            break;
          }
          _context3.next = 5;
          return _libsodiumWrappers["default"].ready;
        case 5:
          isReady = true;
        case 6:
          return _context3.abrupt("return", _libsodiumWrappers["default"].crypto_box_easy_afternm(message, nonce, key));
        case 9:
          _context3.prev = 9;
          _context3.t0 = _context3["catch"](1);
          console.warn(_context3.t0);
        case 12:
          return _context3.abrupt("return", _tweetnacl["default"].secretbox(message, nonce, key));
        case 13:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[1, 9]]);
  }));
  return _encryptSymmetric.apply(this, arguments);
}
function decryptSymmetric(_x7, _x8, _x9) {
  return _decryptSymmetric.apply(this, arguments);
}
function _decryptSymmetric() {
  _decryptSymmetric = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(message, nonce, key) {
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          if (disableWASM) {
            _context4.next = 12;
            break;
          }
          _context4.prev = 1;
          if (isReady) {
            _context4.next = 6;
            break;
          }
          _context4.next = 5;
          return _libsodiumWrappers["default"].ready;
        case 5:
          isReady = true;
        case 6:
          return _context4.abrupt("return", _libsodiumWrappers["default"].crypto_box_open_easy_afternm(message, nonce, key));
        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](1);
          console.warn(_context4.t0);
        case 12:
          return _context4.abrupt("return", _tweetnacl["default"].secretbox.open(message, nonce, key));
        case 13:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[1, 9]]);
  }));
  return _decryptSymmetric.apply(this, arguments);
}
function sign(_x10, _x11) {
  return _sign.apply(this, arguments);
}
function _sign() {
  _sign = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(privateKey, message) {
    var sig;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          if (disableWASM) {
            _context5.next = 13;
            break;
          }
          _context5.prev = 1;
          if (isReady) {
            _context5.next = 6;
            break;
          }
          _context5.next = 5;
          return _libsodiumWrappers["default"].ready;
        case 5:
          isReady = true;
        case 6:
          sig = _libsodiumWrappers["default"].crypto_sign_detached(Buffer.from(message, "hex"), privateKey);
          return _context5.abrupt("return", util.bytesToHex(sig));
        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](1);
          console.warn(_context5.t0);
        case 13:
          sig = _tweetnacl["default"].sign.detached(Buffer.from(message, "hex"), privateKey);
          return _context5.abrupt("return", util.bytesToHex(sig));
        case 15:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[1, 10]]);
  }));
  return _sign.apply(this, arguments);
}