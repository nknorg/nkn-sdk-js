'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sessionIDSize = exports.multiclientIdentifierRe = exports.defaultSessionAllowAddr = exports.acceptSessionBufSize = exports.defaultOptions = void 0;
const defaultOptions = {
  numSubClients: 4,
  originalClient: false,
  msgCacheExpiration: 300 * 1000,
  sessionConfig: {}
};
exports.defaultOptions = defaultOptions;
const acceptSessionBufSize = 128;
exports.acceptSessionBufSize = acceptSessionBufSize;
const defaultSessionAllowAddr = /.*/;
exports.defaultSessionAllowAddr = defaultSessionAllowAddr;
const multiclientIdentifierRe = /^__\d+__$/;
exports.multiclientIdentifierRe = multiclientIdentifierRe;
const sessionIDSize = 8;
exports.sessionIDSize = sessionIDSize;