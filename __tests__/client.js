'use strict';

const nkn = require('../lib');

class ClientTest {
  constructor(name, config) {
    this.name = name;
    this.config = config;
  }

  run() {
    console.log('Testing ' + this.name + '...');

    test(`[${this.name}] create`, async () => {
      let Client = this.config.useMultiClient ? nkn.MultiClient : nkn.Client;
      this.alice = new Client({
        identifier: 'alice',
        numSubClients: this.config.numSubClients,
        originalClient: this.config.originalClient,
      });
      this.bob = new Client({
        seed: this.alice.getSeed(),
        identifier: 'bob',
        numSubClients: this.config.numSubClients,
        originalClient: this.config.originalClient,
      });
      await Promise.all([
        new Promise(resolve => this.alice.onConnect(resolve)),
        new Promise(resolve => this.bob.onConnect(resolve)),
      ]);
      await new Promise(resolve => setTimeout(resolve, 10000));
      expect(this.alice.isReady).toBe(true);
      expect(this.bob.isReady).toBe(true);
    });

    test(`[${this.name}] send`, async () => {
      let data = this.config.binaryData ? Uint8Array.from([1,2,3,4,5]) : 'hello';
      let reply = this.config.binaryData ? Uint8Array.from([6,7,8,9,0]) : 'world';
      this.bob.onMessage(async ({ src, payload}) => {
        expect(src).toBe(this.alice.addr);
        expect(payload).toEqual(data);
        return reply;
      });
      let receivedReply = await this.alice.send(this.bob.addr, data);
      expect(receivedReply).toEqual(reply);
    });

    test(`[${this.name}] close`, async () => {
      await Promise.all([this.alice.close(), this.bob.close()]);
      expect(this.alice.isClosed).toBe(true);
      expect(this.bob.isClosed).toBe(true);
    });
  }
}

for (let binaryData of [false, true]) {
  new ClientTest(`client (${binaryData ? 'binary' : 'text'})`, {
    useMultiClient: false,
    binaryData,
  }).run();

  new ClientTest(`multiclient (${binaryData ? 'binary' : 'text'})`, {
    useMultiClient: true,
    numSubClients: 4,
    originalClient: false,
    binaryData,
  }).run();

  new ClientTest(`multiclient with original (${binaryData ? 'binary' : 'text'})`, {
    useMultiClient: true,
    numSubClients: 4,
    originalClient: true,
    binaryData,
  }).run();

  new ClientTest(`multiclient with only original (${binaryData ? 'binary' : 'text'})`, {
    useMultiClient: true,
    numSubClients: 0,
    originalClient: true,
    binaryData,
  }).run();
}
