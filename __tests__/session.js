'use strict';

const nkn = require('../lib');

class SessionTest {
  constructor(name, config) {
    this.name = name;
    this.config = config;
  }

  byteAt(n) {
    return n % 256;
  }

  async read(session) {
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
        if (buf[i] !== this.byteAt(n + i)) {
          throw 'wrong value at byte ' + (n + i);
        }
      }
      if (this.config.verbose && Math.floor((n + buf.length) * 10 / numBytes) !== Math.floor(n * 10 / numBytes)) {
        console.log(session.localAddr, 'received', n + buf.length, 'bytes', (n + buf.length) / (1<<20) / (Date.now() - timeStart) * 1000, 'MB/s');
      }
    }
    console.log(session.localAddr, 'finished receiving', numBytes, 'bytes', numBytes / (1<<20) / (Date.now() - timeStart) * 1000, 'MB/s');
  }

  async write(session, numBytes) {
    let timeStart = Date.now();
    let buffer = new ArrayBuffer(4);
    let dv = new DataView(buffer);
    dv.setUint32(0, numBytes, true);
    await session.write(new Uint8Array(buffer));
    let buf;
    for (let n = 0; n < numBytes; n += buf.length) {
      buf = new Uint8Array(Math.min(numBytes - n, this.config.writeChunkSize));
      for (let i = 0; i < buf.length; i++) {
        buf[i] = this.byteAt(n + i);
      }
      await session.write(buf);
      if (this.config.verbose && Math.floor((n + buf.length) * 10 / numBytes) !== Math.floor(n * 10 / numBytes)) {
        console.log(session.localAddr, 'sent', n + buf.length, 'bytes', (n + buf.length) / (1<<20) / (Date.now() - timeStart) * 1000, 'MB/s');
      }
    }
    console.log(session.localAddr, 'finished sending', numBytes, 'bytes', numBytes / (1<<20) / (Date.now() - timeStart) * 1000, 'MB/s');
  }

  run() {
    console.log('Testing ' + this.name + '...');

    test(`[${this.name}] create`, async () => {
      this.alice = new nkn.MultiClient({
        identifier: 'alice',
        numSubClients: this.config.numClients - (this.config.originalClient ? 1 : 0),
        originalClient: this.config.originalClient,
        sessionConfig: this.config.sessionConfig,
      });
      this.bob = new nkn.MultiClient({
        seed: this.alice.getSeed(),
        identifier: 'bob',
        numSubClients: this.config.numClients - (this.config.originalClient ? 1 : 0),
        originalClient: this.config.originalClient,
        sessionConfig: this.config.sessionConfig,
      });
      await Promise.all([
        new Promise(resolve => this.alice.onConnect(resolve)),
        new Promise(resolve => this.bob.onConnect(resolve)),
      ]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(this.alice.isReady).toBe(true);
      expect(this.bob.isReady).toBe(true);
    });

    test(`[${this.name}] dial`, async () => {
      this.bob.listen();
      [this.aliceSession, this.bobSession] = await Promise.all([
        this.alice.dial(this.bob.addr),
        new Promise(resolve => this.bob.onSession(resolve)),
      ]);
      expect(this.aliceSession.remoteAddr).toBe(this.bobSession.localAddr);
      expect(this.bobSession.remoteAddr).toBe(this.aliceSession.localAddr);
    });

    test(`[${this.name}] send`, async () => {
      let promises = [
        this.write(this.aliceSession, this.config.numBytes),
        this.read(this.bobSession),
        this.write(this.bobSession, this.config.numBytes),
        this.read(this.aliceSession),
      ];
      let r = await Promise.all(promises);
      expect(r.length).toBe(promises.length);
    });

    test(`[${this.name}] close`, async () => {
      await Promise.all([this.alice.close(), this.bob.close()]);
      expect(this.aliceSession.isClosed).toBe(true);
      expect(this.bobSession.isClosed).toBe(true);
      expect(this.alice.isClosed).toBe(true);
      expect(this.bob.isClosed).toBe(true);
    });
  }
}

new SessionTest('default', {
  numClients: 4,
  numBytes: 1 << 14,
  writeChunkSize: 1024,
}).run();

// new SessionTest('single client', {
//   numClients: 1,
//   numBytes: 1 << 14,
//   writeChunkSize: 1024,
// }).run();
//
// new SessionTest('original client', {
//   numClients: 2,
//   originalClient: true,
//   numBytes: 1 << 14,
//   writeChunkSize: 1024,
// }).run();
//
// new SessionTest('minimal session window', {
//   numClients: 4,
//   numBytes: 1 << 4,
//   writeChunkSize: 1,
//   sessionConfig: { sessionWindowSize: 1 },
// }).run();
//
// new SessionTest('big write chunk size', {
//   numClients: 4,
//   numBytes: 1 << 14,
//   writeChunkSize: 2048,
// }).run();
//
// new SessionTest('non stream', {
//   numClients: 4,
//   numBytes: 1 << 24,
//   writeChunkSize: 1000,
//   sessionConfig: { nonStream: true },
// }).run();
