"use strict";

import * as consts from "./consts";

export function addIdentifierPrefix(base, prefix) {
  if (base === "") {
    return "" + prefix;
  }
  if (prefix === "") {
    return "" + base;
  }
  return prefix + "." + base;
}

export function addIdentifier(addr, id) {
  if (id === "") {
    return addr;
  }
  return addIdentifierPrefix(addr, "__" + id + "__");
}

export function removeIdentifier(src) {
  let s = src.split(".");
  if (consts.multiclientIdentifierRe.test(s[0])) {
    return { addr: s.slice(1).join("."), clientID: s[0] };
  }
  return { addr: src, clientID: "" };
}

export function addIdentifierPrefixAll(dest, clientID) {
  if (Array.isArray(dest)) {
    return dest.map((addr) => addIdentifierPrefix(addr, clientID));
  }
  return addIdentifierPrefix(dest, clientID);
}

export function sessionKey(remoteAddr, sessionID) {
  return remoteAddr + sessionID;
}
