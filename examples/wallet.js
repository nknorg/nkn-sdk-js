"use strict";

const nkn = require("../lib");

const password = "42";

(async function () {
  // random new wallet
  let wallet = new nkn.Wallet({ password });

  // wallet from seed
  wallet = new nkn.Wallet({ seed: wallet.getSeed(), password });

  // save wallet to json
  let walletJson = JSON.stringify(wallet);

  // load wallet from json and password
  wallet = nkn.Wallet.fromJSON(walletJson, { password });

  // or load wallet asynchronously to avoid blocking eventloop
  wallet = await nkn.Wallet.fromJSON(walletJson, { password, async: true });

  // verify password of a wallet
  console.log("verify password", wallet.verifyPassword(password));

  // verify password of a wallet asynchronously to avoid blocking eventloop
  console.log(
    "verify password",
    await wallet.verifyPassword(password, { async: true }),
  );

  // verify whether an address is a valid NKN wallet address (static method)
  console.log("verify address:", nkn.Wallet.verifyAddress(wallet.address));

  // get balance of this wallet
  console.log("balance:", await wallet.getBalance());

  // get balance of an address
  console.log("balance:", await wallet.getBalance(wallet.address));

  // get balance of an address (static method)
  console.log("balance:", await nkn.Wallet.getBalance(wallet.address));

  // get nonce for next transaction of this wallet
  console.log("nonce:", await wallet.getNonce());

  // get nonce of an address, does not include nonce in rpc node's transaction pool
  console.log(
    "nonce:",
    await wallet.getNonce(wallet.address, { txPool: false }),
  );

  // get nonce of an address (static method)
  console.log(
    "nonce:",
    await nkn.Wallet.getNonce(wallet.address, { txPool: false }),
  );

  // call below will fail because a new account has no balance
  try {
    // transfer token to some address
    console.log(
      "transfer txn hash:",
      await wallet.transferTo(wallet.address, 1, {
        fee: 0.1,
        attrs: "hello world",
      }),
    );

    // amount and fee can also be string to prevent accuracy loss
    console.log(
      "transfer txn hash:",
      await wallet.transferTo(wallet.address, "1", { fee: "0.1" }),
    );

    // subscribe to a topic for ths pubkey of the wallet for next 100 blocks
    console.log(
      "subscribe txn hash:",
      await wallet.subscribe("topic", 100, "identifier", "meta", {
        fee: "0.1",
      }),
    );

    // unsubscribe from a topic
    console.log(
      "unsubscribe txn hash:",
      await wallet.unsubscribe("topic", "identifier", { fee: "0.1" }),
    );

    // register name
    console.log("register name txn hash:", await wallet.registerName("name"));

    // transfer name
    console.log(
      "transfer name txn hash:",
      await wallet.transferName("name", wallet.getPublicKey()),
    );

    // delete name
    console.log("delete name txn hash:", await wallet.deleteName("name"));
  } catch (e) {
    console.error(e);
  }
})();
