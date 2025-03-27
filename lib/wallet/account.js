"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var address = _interopRequireWildcard(require("./address"));
var common = _interopRequireWildcard(require("../common"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Account = exports["default"] = /*#__PURE__*/function () {
  function Account(seed) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, Account);
    _defineProperty(this, "key", void 0);
    _defineProperty(this, "signatureRedeem", void 0);
    _defineProperty(this, "programHash", void 0);
    _defineProperty(this, "address", void 0);
    _defineProperty(this, "contract", void 0);
    this.key = new common.Key(seed, {
      worker: options.worker
    });
    this.signatureRedeem = address.publicKeyToSignatureRedeem(this.key.publicKey);
    this.programHash = address.hexStringToProgramHash(this.signatureRedeem);
    this.address = address.programHashStringToAddress(this.programHash);
    this.contract = genAccountContractString(this.signatureRedeem, this.programHash);
  }
  return _createClass(Account, [{
    key: "getPublicKey",
    value: function getPublicKey() {
      return this.key.publicKey;
    }
  }, {
    key: "getSeed",
    value: function getSeed() {
      return this.key.seed;
    }
  }]);
}();
function genAccountContractString(signatureRedeem, programHash) {
  var contract = address.prefixByteCountToHexString(signatureRedeem);
  contract += address.prefixByteCountToHexString("00");
  contract += programHash;
  return contract;
}