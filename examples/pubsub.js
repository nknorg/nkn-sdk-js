"use strict";

const nkn = require("../lib");

(async function () {
  // client 1
  const wallet1 = new nkn.Wallet({ password: "password1" });
  const client1 = new nkn.Client({
    identifier: "my-identifier",
    seed: wallet1.getSeed(),
  });
  client1.onMessage(({ src, payload }) => {
    console.log("got data on client 1", { src, payload });
  });

  // client 2
  const wallet2 = new nkn.Wallet({ password: "password2" });
  const client2 = new nkn.Client({
    identifier: "my-identifier",
    seed: wallet2.getSeed(),
  });
  client2.onMessage(({ src, payload }) => {
    console.log("got data on client 2", { src, payload });
  });

  await Promise.all([
    new Promise((resolve) => client1.onConnect(resolve)),
    new Promise((resolve) => client2.onConnect(resolve)),
  ]);
  await Promise.all([
    new Promise((resolve) =>
      wallet1.subscribe("some-topic", 100, "my-identifier").then(resolve),
    ),
    new Promise((resolve) =>
      wallet2.subscribe("some-topic", 100, "my-identifier").then(resolve),
    ),
  ]);

  const num = await client1.getSubscribersCount("some-topic");
  const subs = await client1.getSubscribers("some-topic");
  console.log({ num, subs });

  // publish
  client1.publish("some-topic", "hello world", { txPool: true });
})();
