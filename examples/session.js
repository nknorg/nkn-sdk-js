"use strict";

const nkn = require("../lib");

const numBytes = 16 << 20;
const numSubClients = 4;
const writeChunkSize = 1024;

(async function () {
  let alice = new nkn.MultiClient({ numSubClients, identifier: "alice" });
  let bob = new nkn.MultiClient({
    numSubClients,
    identifier: "bob",
    seed: alice.getSeed(),
  });

  console.log("Secret seed:", alice.getSeed());

  await Promise.all([
    new Promise((resolve, reject) => alice.onConnect(resolve)),
    new Promise((resolve, reject) => bob.onConnect(resolve)),
  ]);

  await new Promise((resolve, reject) => setTimeout(resolve, 1000));

  bob.onSession(async (session) => {
    console.log(session.localAddr, "accepted a sesison");
    await read(session);
  });

  bob.listen();
  console.log("bob listening at", bob.addr);

  let session = await alice.dial(bob.addr);
  console.log(session.localAddr, "dialed a session");

  await write(session, numBytes);
})();

async function read(session) {
  let timeStart = Date.now();
  let buf = new Uint8Array(0);
  while (buf.length < 4) {
    buf = nkn.util.mergeTypedArrays(buf, await session.read(4 - buf.length));
  }
  let dv = new DataView(buf.buffer);
  let numBytes = dv.getUint32(0, true);
  for (let n = 0; n < numBytes; n += buf.length) {
    buf = await session.read();
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] !== byteAt(n + i)) {
        throw "wrong value at" + (n + i) + "byte";
      }
    }
    if (
      Math.floor(((n + buf.length) * 10) / numBytes) !==
      Math.floor((n * 10) / numBytes)
    ) {
      console.log(
        session.localAddr,
        "received",
        n + buf.length,
        "bytes",
        ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000,
        "MB/s",
      );
    }
  }
  console.log(
    session.localAddr,
    "finished receiving",
    numBytes,
    "bytes",
    (numBytes / (1 << 20) / (Date.now() - timeStart)) * 1000,
    "MB/s",
  );
  process.exit();
}

async function write(session, numBytes) {
  let timeStart = Date.now();
  let buffer = new ArrayBuffer(4);
  let dv = new DataView(buffer);
  dv.setUint32(0, numBytes, true);
  await session.write(new Uint8Array(buffer));
  let buf;
  for (let n = 0; n < numBytes; n += buf.length) {
    buf = new Uint8Array(Math.min(numBytes - n, writeChunkSize));
    for (let i = 0; i < buf.length; i++) {
      buf[i] = byteAt(n + i);
    }
    await session.write(buf);
    if (
      Math.floor(((n + buf.length) * 10) / numBytes) !==
      Math.floor((n * 10) / numBytes)
    ) {
      console.log(
        session.localAddr,
        "sent",
        n + buf.length,
        "bytes",
        ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000,
        "MB/s",
      );
    }
  }
  console.log(
    session.localAddr,
    "finished sending",
    numBytes,
    "bytes",
    (numBytes / (1 << 20) / (Date.now() - timeStart)) * 1000,
    "MB/s",
  );
}

function byteAt(n) {
  return n % 256;
}
