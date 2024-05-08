"use strict";

export const defaultOptions = {
  numSubClients: 4,
  originalClient: false,
  msgCacheExpiration: 300 * 1000,
  sessionConfig: {},
};

export const acceptSessionBufSize = 128;
export const defaultSessionAllowAddr = /.*/;
export const multiclientIdentifierRe = /^__\d+__$/;
export const sessionIDSize = 8;
