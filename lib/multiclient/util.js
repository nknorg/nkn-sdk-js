"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addIdentifier = addIdentifier;
exports.addIdentifierPrefix = addIdentifierPrefix;
exports.addIdentifierPrefixAll = addIdentifierPrefixAll;
exports.removeIdentifier = removeIdentifier;
exports.sessionKey = sessionKey;
var consts = _interopRequireWildcard(require("./consts"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function addIdentifierPrefix(base, prefix) {
  if (base === "") {
    return "" + prefix;
  }
  if (prefix === "") {
    return "" + base;
  }
  return prefix + "." + base;
}
function addIdentifier(addr, id) {
  if (id === "") {
    return addr;
  }
  return addIdentifierPrefix(addr, "__" + id + "__");
}
function removeIdentifier(src) {
  var s = src.split(".");
  if (consts.multiclientIdentifierRe.test(s[0])) {
    return {
      addr: s.slice(1).join("."),
      clientID: s[0]
    };
  }
  return {
    addr: src,
    clientID: ""
  };
}
function addIdentifierPrefixAll(dest, clientID) {
  if (Array.isArray(dest)) {
    return dest.map(function (addr) {
      return addIdentifierPrefix(addr, clientID);
    });
  }
  return addIdentifierPrefix(dest, clientID);
}
function sessionKey(remoteAddr, sessionID) {
  return remoteAddr + sessionID;
}