'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addIdentifier = addIdentifier;
exports.addIdentifierPrefix = addIdentifierPrefix;
exports.addIdentifierPrefixAll = addIdentifierPrefixAll;
exports.removeIdentifier = removeIdentifier;
exports.sessionKey = sessionKey;

var consts = _interopRequireWildcard(require("./consts"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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