"use strict";

import { ready } from "libsodium-wrappers";

import * as nkn from "./common";
import Client from "./client";
import MultiClient from "./multiclient";
import Wallet from "./wallet";
import * as address from "./wallet/address";
import { setDisableWASM } from "./common/crypto";

var setPRNG = nkn.util.setPRNG;

nkn.ready = ready;
nkn.Client = Client;
nkn.MultiClient = MultiClient;
nkn.Wallet = Wallet;
nkn.setPRNG = setPRNG;
nkn.address = address;
nkn.setDisableWASM = setDisableWASM;

export default nkn;

export * from "./common";
export { ready, Client, MultiClient, Wallet, setPRNG };
