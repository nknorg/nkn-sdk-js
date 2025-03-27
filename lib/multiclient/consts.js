"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sessionIDSize = exports.multiclientIdentifierRe = exports.defaultSessionAllowAddr = exports.defaultOptions = exports.acceptSessionBufSize = void 0;
var defaultOptions = exports.defaultOptions = {
  numSubClients: 4,
  originalClient: false,
  msgCacheExpiration: 300 * 1000,
  sessionConfig: {}
};
var acceptSessionBufSize = exports.acceptSessionBufSize = 128;
var defaultSessionAllowAddr = exports.defaultSessionAllowAddr = /.*/;
var multiclientIdentifierRe = exports.multiclientIdentifierRe = /^__\d+__$/;
var sessionIDSize = exports.sessionIDSize = 8;