"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addrToID = addrToID;
exports.addrToPubkey = addrToPubkey;
exports.messageIdSize = exports.maxClientMessageSize = void 0;
exports.newAckPayload = newAckPayload;
exports.newBinaryPayload = newBinaryPayload;
exports.newClientMessage = newClientMessage;
exports.newMessage = newMessage;
exports.newOutboundMessage = newOutboundMessage;
exports.newPayload = newPayload;
exports.newReceipt = newReceipt;
exports.newSessionPayload = newSessionPayload;
exports.newTextPayload = newTextPayload;
exports.serializeSigChainElem = serializeSigChainElem;
exports.serializeSigChainMetadata = serializeSigChainMetadata;
var _pako = _interopRequireDefault(require("pako"));
var common = _interopRequireWildcard(require("../common"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var messageIdSize = exports.messageIdSize = 8; // in bytes
var maxClientMessageSize = exports.maxClientMessageSize = 4000000; // in bytes. NKN node is using 4*1024*1024 as limit, we give some additional space for serialization overhead.

function newPayload(type, replyToId, data, messageId) {
  var payload = new common.pb.payloads.Payload();
  payload.setType(type);
  if (replyToId) {
    payload.setReplyToId(replyToId);
  } else if (messageId) {
    payload.setMessageId(messageId);
  } else {
    payload.setMessageId(common.util.randomBytes(messageIdSize));
  }
  payload.setData(data);
  return payload;
}
function newBinaryPayload(data, replyToId, messageId) {
  return newPayload(common.pb.payloads.PayloadType.BINARY, replyToId, data, messageId);
}
function newTextPayload(text, replyToId, messageId) {
  var data = new common.pb.payloads.TextData();
  data.setText(text);
  return newPayload(common.pb.payloads.PayloadType.TEXT, replyToId, data.serializeBinary(), messageId);
}
function newAckPayload(replyToId, messageId) {
  return newPayload(common.pb.payloads.PayloadType.ACK, replyToId, null, messageId);
}
function newSessionPayload(data, sessionID) {
  return newPayload(common.pb.payloads.PayloadType.SESSION, null, data, sessionID);
}
function newMessage(payload, encrypted, nonce, encryptedKey) {
  var msg = new common.pb.payloads.Message();
  msg.setPayload(payload);
  msg.setEncrypted(encrypted);
  if (nonce) {
    msg.setNonce(nonce);
  }
  if (encryptedKey) {
    msg.setEncryptedKey(encryptedKey);
  }
  return msg;
}
function newClientMessage(messageType, message, compressionType) {
  var msg = new common.pb.messages.ClientMessage();
  msg.setMessageType(messageType);
  msg.setCompressionType(compressionType);
  switch (compressionType) {
    case common.pb.messages.CompressionType.COMPRESSION_NONE:
      break;
    case common.pb.messages.CompressionType.COMPRESSION_ZLIB:
      message = _pako["default"].deflate(message);
      break;
    default:
      throw new common.errors.InvalidArgumentError("unknown compression type " + compressionType);
  }
  msg.setMessage(message);
  return msg;
}
function newOutboundMessage(_x, _x2, _x3, _x4) {
  return _newOutboundMessage.apply(this, arguments);
}
function _newOutboundMessage() {
  _newOutboundMessage = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(client, dest, payload, maxHoldingSeconds) {
    var sigChainElem, sigChainElemSerialized, sigChain, signatures, hex, digest, signature, i, msg, compressionType;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!Array.isArray(dest)) {
            dest = [dest];
          }
          if (!(dest.length === 0)) {
            _context.next = 3;
            break;
          }
          throw new common.errors.InvalidArgumentError("no destination");
        case 3:
          if (!Array.isArray(payload)) {
            payload = [payload];
          }
          if (!(payload.length === 0)) {
            _context.next = 6;
            break;
          }
          throw new common.errors.InvalidArgumentError("no payloads");
        case 6:
          if (!(payload.length > 1 && payload.length !== dest.length)) {
            _context.next = 8;
            break;
          }
          throw new common.errors.InvalidArgumentError("invalid payload array length");
        case 8:
          sigChainElem = new common.pb.sigchain.SigChainElem();
          sigChainElem.setNextPubkey(Buffer.from(client.node.pubkey, "hex"));
          sigChainElemSerialized = serializeSigChainElem(sigChainElem);
          sigChain = new common.pb.sigchain.SigChain();
          sigChain.setNonce(common.util.randomInt32());
          if (client.sigChainBlockHash) {
            sigChain.setBlockHash(Buffer.from(client.sigChainBlockHash, "hex"));
          }
          sigChain.setSrcId(Buffer.from(addrToID(client.addr), "hex"));
          sigChain.setSrcPubkey(Buffer.from(client.key.publicKey, "hex"));
          signatures = [];
          i = 0;
        case 18:
          if (!(i < dest.length)) {
            _context.next = 32;
            break;
          }
          sigChain.setDestId(Buffer.from(addrToID(dest[i]), "hex"));
          sigChain.setDestPubkey(Buffer.from(addrToPubkey(dest[i]), "hex"));
          if (payload.length > 1) {
            sigChain.setDataSize(payload[i].length);
          } else {
            sigChain.setDataSize(payload[0].length);
          }
          hex = serializeSigChainMetadata(sigChain);
          digest = common.hash.sha256Hex(hex);
          digest = common.hash.sha256Hex(digest + sigChainElemSerialized);
          _context.next = 27;
          return client.key.sign(digest);
        case 27:
          signature = _context.sent;
          signatures.push(Buffer.from(signature, "hex"));
        case 29:
          i++;
          _context.next = 18;
          break;
        case 32:
          msg = new common.pb.messages.OutboundMessage();
          msg.setDestsList(dest);
          msg.setPayloadsList(payload);
          msg.setMaxHoldingSeconds(maxHoldingSeconds);
          msg.setNonce(sigChain.getNonce());
          msg.setBlockHash(sigChain.getBlockHash());
          msg.setSignaturesList(signatures);
          if (payload.length > 1) {
            compressionType = common.pb.messages.CompressionType.COMPRESSION_ZLIB;
          } else {
            compressionType = common.pb.messages.CompressionType.COMPRESSION_NONE;
          }
          return _context.abrupt("return", newClientMessage(common.pb.messages.ClientMessageType.OUTBOUND_MESSAGE, msg.serializeBinary(), compressionType));
        case 41:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _newOutboundMessage.apply(this, arguments);
}
function newReceipt(_x5, _x6) {
  return _newReceipt.apply(this, arguments);
}
function _newReceipt() {
  _newReceipt = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(client, prevSignature) {
    var sigChainElem, sigChainElemSerialized, digest, signature, msg;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          sigChainElem = new common.pb.sigchain.SigChainElem();
          sigChainElemSerialized = serializeSigChainElem(sigChainElem);
          digest = common.hash.sha256Hex(prevSignature);
          digest = common.hash.sha256Hex(digest + sigChainElemSerialized);
          _context2.next = 6;
          return client.key.sign(digest);
        case 6:
          signature = _context2.sent;
          msg = new common.pb.messages.Receipt();
          msg.setPrevSignature(Buffer.from(prevSignature, "hex"));
          msg.setSignature(Buffer.from(signature, "hex"));
          return _context2.abrupt("return", newClientMessage(common.pb.messages.ClientMessageType.RECEIPT, msg.serializeBinary(), common.pb.messages.CompressionType.COMPRESSION_NONE));
        case 11:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _newReceipt.apply(this, arguments);
}
function serializeSigChainMetadata(sigChain) {
  var hex = "";
  hex += common.serialize.encodeUint32(sigChain.getNonce());
  hex += common.serialize.encodeUint32(sigChain.getDataSize());
  hex += common.serialize.encodeBytes(sigChain.getBlockHash());
  hex += common.serialize.encodeBytes(sigChain.getSrcId());
  hex += common.serialize.encodeBytes(sigChain.getSrcPubkey());
  hex += common.serialize.encodeBytes(sigChain.getDestId());
  hex += common.serialize.encodeBytes(sigChain.getDestPubkey());
  return hex;
}
function serializeSigChainElem(sigChainElem) {
  var hex = "";
  hex += common.serialize.encodeBytes(sigChainElem.getId());
  hex += common.serialize.encodeBytes(sigChainElem.getNextPubkey());
  hex += common.serialize.encodeBool(sigChainElem.getMining());
  return hex;
}
function addrToID(addr) {
  return common.hash.sha256(addr);
}
function addrToPubkey(addr) {
  var s = addr.split(".");
  return s[s.length - 1];
}