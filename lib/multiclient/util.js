'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addIdentifierPrefix = addIdentifierPrefix;
exports.addIdentifier = addIdentifier;
exports.removeIdentifier = removeIdentifier;
exports.addIdentifierPrefixAll = addIdentifierPrefixAll;
exports.sessionKey = sessionKey;

var consts = _interopRequireWildcard(require("./consts"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function addIdentifierPrefix(base, prefix) {
  if (base === '') {
    return '' + prefix;
  }

  if (prefix === '') {
    return '' + base;
  }

  return prefix + '.' + base;
}

function addIdentifier(addr, id) {
  if (id === '') {
    return addr;
  }

  return addIdentifierPrefix(addr, '__' + id + '__');
}

function removeIdentifier(src) {
  let s = src.split('.');

  if (consts.multiclientIdentifierRe.test(s[0])) {
    return {
      addr: s.slice(1).join('.'),
      clientID: s[0]
    };
  }

  return {
    addr: src,
    clientID: ''
  };
}

function addIdentifierPrefixAll(dest, clientID) {
  if (Array.isArray(dest)) {
    return dest.map(addr => addIdentifierPrefix(addr, clientID));
  }

  return addIdentifierPrefix(dest, clientID);
}

function sessionKey(remoteAddr, sessionID) {
  return remoteAddr + sessionID;
}