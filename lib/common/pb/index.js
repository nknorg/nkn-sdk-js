'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transaction = exports.sigchain = exports.payloads = exports.messages = void 0;

var _messages = _interopRequireWildcard(require("./messages_pb"));

exports.messages = _messages;

var _payloads = _interopRequireWildcard(require("./payloads_pb"));

exports.payloads = _payloads;

var _sigchain = _interopRequireWildcard(require("./sigchain_pb"));

exports.sigchain = _sigchain;

var _transaction = _interopRequireWildcard(require("./transaction_pb"));

exports.transaction = _transaction;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }