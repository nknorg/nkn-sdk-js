"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  setPRNG: true,
  ready: true,
  Client: true,
  MultiClient: true,
  Wallet: true
};
Object.defineProperty(exports, "Client", {
  enumerable: true,
  get: function get() {
    return _client["default"];
  }
});
Object.defineProperty(exports, "MultiClient", {
  enumerable: true,
  get: function get() {
    return _multiclient["default"];
  }
});
Object.defineProperty(exports, "Wallet", {
  enumerable: true,
  get: function get() {
    return _wallet["default"];
  }
});
exports["default"] = void 0;
Object.defineProperty(exports, "ready", {
  enumerable: true,
  get: function get() {
    return _libsodiumWrappers.ready;
  }
});
exports.setPRNG = void 0;
var _libsodiumWrappers = require("libsodium-wrappers");
var nkn = _interopRequireWildcard(require("./common"));
Object.keys(nkn).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === nkn[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return nkn[key];
    }
  });
});
var _client = _interopRequireDefault(require("./client"));
var _multiclient = _interopRequireDefault(require("./multiclient"));
var _wallet = _interopRequireDefault(require("./wallet"));
var address = _interopRequireWildcard(require("./wallet/address"));
var _crypto = require("./common/crypto");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var setPRNG = exports.setPRNG = nkn.util.setPRNG;
nkn.ready = _libsodiumWrappers.ready;
nkn.Client = _client["default"];
nkn.MultiClient = _multiclient["default"];
nkn.Wallet = _wallet["default"];
nkn.setPRNG = setPRNG;
nkn.address = address;
nkn.setDisableWASM = _crypto.setDisableWASM;
var _default = exports["default"] = nkn;