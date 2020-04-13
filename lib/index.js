'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  ready: true,
  Client: true,
  MultiClient: true,
  Wallet: true
};
Object.defineProperty(exports, "ready", {
  enumerable: true,
  get: function () {
    return _libsodiumWrappers.ready;
  }
});
Object.defineProperty(exports, "Client", {
  enumerable: true,
  get: function () {
    return _client.default;
  }
});
Object.defineProperty(exports, "MultiClient", {
  enumerable: true,
  get: function () {
    return _multiclient.default;
  }
});
Object.defineProperty(exports, "Wallet", {
  enumerable: true,
  get: function () {
    return _wallet.default;
  }
});
exports.default = void 0;

var _libsodiumWrappers = require("libsodium-wrappers");

var nkn = _interopRequireWildcard(require("./common"));

Object.keys(nkn).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return nkn[key];
    }
  });
});

var _client = _interopRequireDefault(require("./client"));

var _multiclient = _interopRequireDefault(require("./multiclient"));

var _wallet = _interopRequireDefault(require("./wallet"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

nkn.ready = _libsodiumWrappers.ready;
nkn.Client = _client.default;
nkn.MultiClient = _multiclient.default;
nkn.Wallet = _wallet.default;
var _default = nkn;
exports.default = _default;