"use strict";

const nkn = require("../lib");

const useMultiClient = true;

(async function () {
  let Client = useMultiClient ? nkn.MultiClient : nkn.Client;
  let alice = new Client({ identifier: "alice" });
  let bob = new Client({ identifier: "bob" });

  console.log("Secret seed:", alice.getSeed());

  alice.onConnectFailed(() => {
    console.error("Alice connect failed");
  });

  if (useMultiClient) {
    for (let clientID of Object.keys(alice.clients)) {
      alice.clients[clientID].onConnectFailed(() => {
        console.error("Alice client", clientID, "connect failed");
      });
    }
  }

  await Promise.all([
    new Promise((resolve, reject) => alice.onConnect(resolve)),
    new Promise((resolve, reject) => bob.onConnect(resolve)),
  ]);

  await new Promise((resolve, reject) => setTimeout(resolve, 1000));

  let timeSent = Date.now();

  bob.onMessage(async ({ src, payload, isEncrypted }) => {
    console.log(
      "Receive",
      isEncrypted ? "encrypted" : "unencrypted",
      "message",
      '"' + payload + '"',
      "from",
      src,
      "after",
      Date.now() - timeSent,
      "ms",
    );
    // For byte array response:
    // return Uint8Array.from([1,2,3,4,5])
    return "Well received!";
  });

  try {
    console.log("Send message from", alice.addr, "to", bob.addr);
    // For byte array data:
    // let reply = await alice.send(bob.addr, Uint8Array.from([1,2,3,4,5]));
    let reply = await alice.send(bob.addr, "Hello world!");
    console.log(
      "Receive reply",
      '"' + reply + '"',
      "from",
      bob.addr,
      "after",
      Date.now() - timeSent,
      "ms",
    );
  } catch (e) {
    console.error(e);
  }

  alice.close();
  bob.close();
})();
