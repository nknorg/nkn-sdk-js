'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Key", {
  enumerable: true,
  get: function () {
    return _key.default;
  }
});
exports.util = exports.serialize = exports.rpc = exports.pb = exports.hash = exports.errors = exports.crypto = exports.key = void 0;

var _key = _interopRequireWildcard(require("./key"));

exports.key = _key;

var _crypto = _interopRequireWildcard(require("./crypto"));

exports.crypto = _crypto;

var _errors = _interopRequireWildcard(require("./errors"));

exports.errors = _errors;

var _hash = _interopRequireWildcard(require("./hash"));

exports.hash = _hash;

var _pb = _interopRequireWildcard(require("./pb"));

exports.pb = _pb;

var _rpc = _interopRequireWildcard(require("./rpc"));

exports.rpc = _rpc;

var _serialize = _interopRequireWildcard(require("./serialize"));

exports.serialize = _serialize;

var _util = _interopRequireWildcard(require("./util"));

exports.util = _util;

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }