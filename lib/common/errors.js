"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rpcRespErrCodes = exports.WrongPasswordError = exports.UnknownError = exports.ServerError = exports.RpcTimeoutError = exports.RpcError = exports.NotEnoughBalanceError = exports.InvalidWalletVersionError = exports.InvalidWalletFormatError = exports.InvalidResponseError = exports.InvalidDestinationError = exports.InvalidArgumentError = exports.InvalidAddressError = exports.DecryptionError = exports.DataSizeTooLargeError = exports.ConnectToNodeTimeoutError = exports.ClientNotReadyError = exports.ChallengeTimeoutError = exports.AddrNotAllowedError = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
var rpcRespErrCodes = exports.rpcRespErrCodes = {
  success: 0,
  wrongNode: 48001,
  appendTxnPool: 45021,
  invalidMethod: 42001
};
var AddrNotAllowedError = exports.AddrNotAllowedError = /*#__PURE__*/function (_Error) {
  function AddrNotAllowedError() {
    var _this;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "address not allowed";
    _classCallCheck(this, AddrNotAllowedError);
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }
    _this = _callSuper(this, AddrNotAllowedError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this, AddrNotAllowedError);
    }
    _this.name = "AddrNotAllowedError";
    return _this;
  }
  _inherits(AddrNotAllowedError, _Error);
  return _createClass(AddrNotAllowedError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var ClientNotReadyError = exports.ClientNotReadyError = /*#__PURE__*/function (_Error2) {
  function ClientNotReadyError() {
    var _this2;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "client not ready";
    _classCallCheck(this, ClientNotReadyError);
    for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      params[_key2 - 1] = arguments[_key2];
    }
    _this2 = _callSuper(this, ClientNotReadyError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this2, ClientNotReadyError);
    }
    _this2.name = "ClientNotReadyError";
    return _this2;
  }
  _inherits(ClientNotReadyError, _Error2);
  return _createClass(ClientNotReadyError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var DataSizeTooLargeError = exports.DataSizeTooLargeError = /*#__PURE__*/function (_Error3) {
  function DataSizeTooLargeError() {
    var _this3;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "data size too large";
    _classCallCheck(this, DataSizeTooLargeError);
    for (var _len3 = arguments.length, params = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      params[_key3 - 1] = arguments[_key3];
    }
    _this3 = _callSuper(this, DataSizeTooLargeError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this3, DataSizeTooLargeError);
    }
    _this3.name = "DataSizeTooLargeError";
    return _this3;
  }
  _inherits(DataSizeTooLargeError, _Error3);
  return _createClass(DataSizeTooLargeError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var DecryptionError = exports.DecryptionError = /*#__PURE__*/function (_Error4) {
  function DecryptionError() {
    var _this4;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "decrypt message error";
    _classCallCheck(this, DecryptionError);
    for (var _len4 = arguments.length, params = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      params[_key4 - 1] = arguments[_key4];
    }
    _this4 = _callSuper(this, DecryptionError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this4, DecryptionError);
    }
    _this4.name = "DecryptionError";
    return _this4;
  }
  _inherits(DecryptionError, _Error4);
  return _createClass(DecryptionError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var UnknownError = exports.UnknownError = /*#__PURE__*/function (_Error5) {
  function UnknownError() {
    var _this5;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "unknown error";
    _classCallCheck(this, UnknownError);
    for (var _len5 = arguments.length, params = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      params[_key5 - 1] = arguments[_key5];
    }
    _this5 = _callSuper(this, UnknownError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this5, UnknownError);
    }
    _this5.name = "UnknownError";
    return _this5;
  }
  _inherits(UnknownError, _Error5);
  return _createClass(UnknownError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var NotEnoughBalanceError = exports.NotEnoughBalanceError = /*#__PURE__*/function (_Error6) {
  function NotEnoughBalanceError() {
    var _this6;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "not enough balance";
    _classCallCheck(this, NotEnoughBalanceError);
    for (var _len6 = arguments.length, params = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      params[_key6 - 1] = arguments[_key6];
    }
    _this6 = _callSuper(this, NotEnoughBalanceError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this6, NotEnoughBalanceError);
    }
    _this6.name = "NotEnoughBalanceError";
    return _this6;
  }
  _inherits(NotEnoughBalanceError, _Error6);
  return _createClass(NotEnoughBalanceError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var WrongPasswordError = exports.WrongPasswordError = /*#__PURE__*/function (_Error7) {
  function WrongPasswordError() {
    var _this7;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "wrong password";
    _classCallCheck(this, WrongPasswordError);
    for (var _len7 = arguments.length, params = new Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
      params[_key7 - 1] = arguments[_key7];
    }
    _this7 = _callSuper(this, WrongPasswordError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this7, WrongPasswordError);
    }
    _this7.name = "WrongPasswordError";
    return _this7;
  }
  _inherits(WrongPasswordError, _Error7);
  return _createClass(WrongPasswordError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var InvalidAddressError = exports.InvalidAddressError = /*#__PURE__*/function (_Error8) {
  function InvalidAddressError() {
    var _this8;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "invalid wallet address";
    _classCallCheck(this, InvalidAddressError);
    for (var _len8 = arguments.length, params = new Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
      params[_key8 - 1] = arguments[_key8];
    }
    _this8 = _callSuper(this, InvalidAddressError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this8, InvalidAddressError);
    }
    _this8.name = "InvalidAddressError";
    return _this8;
  }
  _inherits(InvalidAddressError, _Error8);
  return _createClass(InvalidAddressError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var InvalidWalletFormatError = exports.InvalidWalletFormatError = /*#__PURE__*/function (_Error9) {
  function InvalidWalletFormatError() {
    var _this9;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "invalid wallet format";
    _classCallCheck(this, InvalidWalletFormatError);
    for (var _len9 = arguments.length, params = new Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
      params[_key9 - 1] = arguments[_key9];
    }
    _this9 = _callSuper(this, InvalidWalletFormatError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this9, InvalidWalletFormatError);
    }
    _this9.name = "InvalidWalletFormatError";
    return _this9;
  }
  _inherits(InvalidWalletFormatError, _Error9);
  return _createClass(InvalidWalletFormatError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var InvalidWalletVersionError = exports.InvalidWalletVersionError = /*#__PURE__*/function (_Error10) {
  function InvalidWalletVersionError() {
    var _this10;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "invalid wallet version";
    _classCallCheck(this, InvalidWalletVersionError);
    for (var _len10 = arguments.length, params = new Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
      params[_key10 - 1] = arguments[_key10];
    }
    _this10 = _callSuper(this, InvalidWalletVersionError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this10, InvalidWalletVersionError);
    }
    _this10.name = "InvalidWalletVersionError";
    return _this10;
  }
  _inherits(InvalidWalletVersionError, _Error10);
  return _createClass(InvalidWalletVersionError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var InvalidArgumentError = exports.InvalidArgumentError = /*#__PURE__*/function (_Error11) {
  function InvalidArgumentError() {
    var _this11;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "invalid argument";
    _classCallCheck(this, InvalidArgumentError);
    for (var _len11 = arguments.length, params = new Array(_len11 > 1 ? _len11 - 1 : 0), _key11 = 1; _key11 < _len11; _key11++) {
      params[_key11 - 1] = arguments[_key11];
    }
    _this11 = _callSuper(this, InvalidArgumentError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this11, InvalidArgumentError);
    }
    _this11.name = "InvalidArgumentError";
    return _this11;
  }
  _inherits(InvalidArgumentError, _Error11);
  return _createClass(InvalidArgumentError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var InvalidResponseError = exports.InvalidResponseError = /*#__PURE__*/function (_Error12) {
  function InvalidResponseError() {
    var _this12;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "invalid response from RPC server";
    _classCallCheck(this, InvalidResponseError);
    for (var _len12 = arguments.length, params = new Array(_len12 > 1 ? _len12 - 1 : 0), _key12 = 1; _key12 < _len12; _key12++) {
      params[_key12 - 1] = arguments[_key12];
    }
    _this12 = _callSuper(this, InvalidResponseError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this12, InvalidResponseError);
    }
    _this12.name = "InvalidResponseError";
    return _this12;
  }
  _inherits(InvalidResponseError, _Error12);
  return _createClass(InvalidResponseError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var ServerError = exports.ServerError = /*#__PURE__*/function (_Error13) {
  function ServerError() {
    var _this13;
    var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "error from RPC server";
    _classCallCheck(this, ServerError);
    var message;
    if (_typeof(error) === "object") {
      message = error.message + ": " + error.data;
    } else {
      message = error;
    }
    for (var _len13 = arguments.length, params = new Array(_len13 > 1 ? _len13 - 1 : 0), _key13 = 1; _key13 < _len13; _key13++) {
      params[_key13 - 1] = arguments[_key13];
    }
    _this13 = _callSuper(this, ServerError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this13, ServerError);
    }
    _this13.name = "ServerError";
    if (error.code) {
      _this13.code = -error.code;
    }
    return _this13;
  }
  _inherits(ServerError, _Error13);
  return _createClass(ServerError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var InvalidDestinationError = exports.InvalidDestinationError = /*#__PURE__*/function (_Error14) {
  function InvalidDestinationError() {
    var _this14;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "invalid destination";
    _classCallCheck(this, InvalidDestinationError);
    for (var _len14 = arguments.length, params = new Array(_len14 > 1 ? _len14 - 1 : 0), _key14 = 1; _key14 < _len14; _key14++) {
      params[_key14 - 1] = arguments[_key14];
    }
    _this14 = _callSuper(this, InvalidDestinationError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this14, InvalidDestinationError);
    }
    _this14.name = "InvalidDestinationError";
    return _this14;
  }
  _inherits(InvalidDestinationError, _Error14);
  return _createClass(InvalidDestinationError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var RpcTimeoutError = exports.RpcTimeoutError = /*#__PURE__*/function (_Error15) {
  function RpcTimeoutError() {
    var _this15;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "rpc timeout";
    _classCallCheck(this, RpcTimeoutError);
    for (var _len15 = arguments.length, params = new Array(_len15 > 1 ? _len15 - 1 : 0), _key15 = 1; _key15 < _len15; _key15++) {
      params[_key15 - 1] = arguments[_key15];
    }
    _this15 = _callSuper(this, RpcTimeoutError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this15, RpcTimeoutError);
    }
    _this15.name = "RpcTimeoutError";
    return _this15;
  }
  _inherits(RpcTimeoutError, _Error15);
  return _createClass(RpcTimeoutError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var RpcError = exports.RpcError = /*#__PURE__*/function (_Error16) {
  function RpcError() {
    var _this16;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "rpc error";
    _classCallCheck(this, RpcError);
    for (var _len16 = arguments.length, params = new Array(_len16 > 1 ? _len16 - 1 : 0), _key16 = 1; _key16 < _len16; _key16++) {
      params[_key16 - 1] = arguments[_key16];
    }
    _this16 = _callSuper(this, RpcError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this16, RpcError);
    }
    _this16.name = "RpcError";
    return _this16;
  }
  _inherits(RpcError, _Error16);
  return _createClass(RpcError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var ChallengeTimeoutError = exports.ChallengeTimeoutError = /*#__PURE__*/function (_Error17) {
  function ChallengeTimeoutError() {
    var _this17;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "challenge timeout";
    _classCallCheck(this, ChallengeTimeoutError);
    for (var _len17 = arguments.length, params = new Array(_len17 > 1 ? _len17 - 1 : 0), _key17 = 1; _key17 < _len17; _key17++) {
      params[_key17 - 1] = arguments[_key17];
    }
    _this17 = _callSuper(this, ChallengeTimeoutError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this17, ChallengeTimeoutError);
    }
    _this17.name = "ChallengeTimeoutError";
    return _this17;
  }
  _inherits(ChallengeTimeoutError, _Error17);
  return _createClass(ChallengeTimeoutError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var ConnectToNodeTimeoutError = exports.ConnectToNodeTimeoutError = /*#__PURE__*/function (_Error18) {
  function ConnectToNodeTimeoutError() {
    var _this18;
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "connect to node timeout";
    _classCallCheck(this, ConnectToNodeTimeoutError);
    for (var _len18 = arguments.length, params = new Array(_len18 > 1 ? _len18 - 1 : 0), _key18 = 1; _key18 < _len18; _key18++) {
      params[_key18 - 1] = arguments[_key18];
    }
    _this18 = _callSuper(this, ConnectToNodeTimeoutError, [message].concat(params));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this18, ConnectToNodeTimeoutError);
    }
    _this18.name = "ConnectToNodeTimeoutError";
    return _this18;
  }
  _inherits(ConnectToNodeTimeoutError, _Error18);
  return _createClass(ConnectToNodeTimeoutError);
}(/*#__PURE__*/_wrapNativeSuper(Error));