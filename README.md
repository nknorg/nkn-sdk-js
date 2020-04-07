# nkn-sdk-js [![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/nknorg/nkn-sdk-js/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/nkn-sdk.svg?style=flat)](https://www.npmjs.com/package/nkn-sdk) [![CircleCI Status](https://circleci.com/gh/nknorg/nkn-sdk-js.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/nknorg/nkn-sdk-js) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

![nkn](logo.png)

JavaScript implementation of NKN client and wallet SDK. The SDK consists of a
few components:

* [NKN Client](#client): Send and receive data for free between any NKN clients
  regardless their network condition without setting up a server or relying on
  any third party services. Data are end to end encrypted by default. Typically
  you might want to use [multiclient](#multiclient) instead of using client
  directly.

* [NKN MultiClient](#multiclient): Send and receive data using multiple NKN
  clients concurrently to improve reliability and latency. In addition, it
  supports session mode, a reliable streaming protocol similar to TCP based
  on [ncp](https://github.com/nknorg/ncp-js).

* [NKN Wallet](#wallet): Wallet SDK for [NKN
  blockchain](https://github.com/nknorg/nkn). It can be used to create wallet,
  transfer token to NKN wallet address, register name, subscribe to topic,
  etc.

Advantages of using NKN client/multiclient for data transmission:

* Network agnostic: Neither sender nor receiver needs to have public IP address
  or port forwarding. NKN clients only establish outbound (websocket)
  connections, so Internet access is all they need. This is ideal for client
  side peer to peer communication.

* Top level security: All data are end to end authenticated and encrypted. No
  one else in the world except sender and receiver can see or modify the content
  of the data. The same public key is used for both routing and encryption,
  eliminating the possibility of man in the middle attack.

* Decent performance: By aggregating multiple overlay paths concurrently,
  multiclient can get ~100ms end to end latency and 10+mbps end to end session
  throughput between international devices.

* Everything is free, open source and decentralized. (If you are curious, node
  relay traffic for clients for free to earn mining rewards in NKN blockchain.)

Documentation:
[https://docs.nkn.org/nkn-sdk-js](https://docs.nkn.org/nkn-sdk-js).

## Install

For npm:

```shell
npm install nkn-sdk
```

And then in your code:

```javascript
const nkn = require('nkn-sdk');
```

For browser, use `dist/nkn.js` or `dist/nkn.min.js`.

If you use it in React Native, you also need to follow the installation guide in
[react-native-crypto](https://github.com/tradle/react-native-crypto).

## Client

NKN client provides the basic functions of sending and receiving data between
NKN clients or topics regardless their network condition without setting up a
server or relying on any third party services. Typically you might want to use
[multiclient](#multiclient) instead of using client directly.

Create a client with a generated key pair:

```javascript
let client = new nkn.Client();
```

Or with an identifier (used to distinguish different clients sharing the same
key pair):

```javascript
let client = new nkn.Client({
  identifier: 'any-string',
});
```

Get client secret seed and public key:

```javascript
console.log(client.getSeed(), client.getPublicKey());
```

Create a client using an existing secret seed:

```javascript
let client = new nkn.Client({
  seed: '2bc5501d131696429264eb7286c44a29dd44dd66834d9471bd8b0eb875a1edb0',
});
```

Secret key should be kept **SECRET**! Never put it in version control system
like here.

By default the client will use bootstrap RPC server (for getting node address)
provided by nkn.org. Any NKN full node can serve as a bootstrap RPC server. You
can create a client using customized bootstrap RPC server:

```javascript
let client = new nkn.Client({
  rpcServerAddr: 'https://ip:port',
});
```

Get client NKN address, which is used to receive data from other clients:

```javascript
console.log(client.addr);
```

Listen for connection established:

```javascript
client.onConnect(() => {
  console.log('Client ready.');
});
```

Send text message to other clients:

```javascript
client.send(
  'another-client-address',
  'hello world!',
);
```

You can also send byte array directly:

```javascript
client.send(
  'another-client-address',
  Uint8Array.from([1,2,3,4,5]),
);
```

The destination address can also be a name registered using [wallet](#wallet).

Publish text message to all subscribers of a topic (subscribe is done through
[wallet](#wallet)):

```javascript
client.publish(
  'topic',
  'hello world!',
);
```

Receive data from other clients:

```javascript
client.onMessage(({ src, payload }) => {
  console.log('Receive message', payload, 'from', src);
});
```

If a valid data (string or Uint8Array) is returned at the end of the handler,
the data will be sent back to sender as reply:

```javascript
client.onMessage(({ src, payload }) => {
  return 'Well received!';
});
```

Handler can also be an async function, and reply can be byte array as well:

```javascript
client.onMessage(async ({ src, payload }) => {
  return Uint8Array.from([1,2,3,4,5]);
});
```

Note that if multiple message handlers are added, the result returned by the
first handler (in the order of being added) will be sent as reply.

The `send` method will return a Promise that will be resolved when sender
receives a reply, or rejected if not receiving reply or acknowledgement within
timeout period. Similar to message, reply can be either string or byte array:

```javascript
client.send(
  'another-client-address',
  'hello world!',
).then((reply) => {
  // The reply here can be either string or Uint8Array
  console.log('Receive reply:', reply);
}).catch((e) => {
  // This will most likely to be timeout
  console.log('Catch:', e);
});
```

Client receiving data will automatically send an acknowledgement back to sender
if message handler returns `null` or `undefined` so that sender will be able to
know if the packet has been delivered. On the sender's side, it's almost the
same as receiving a reply, except that the Promise is resolved with `null`:

```javascript
client.send(
  'another-client-address',
  'hello world!',
).then(() => {
  console.log('Receive ACK');
}).catch((e) => {
  // This will most likely to be timeout
  console.log('Catch:', e);
});
```

If handler returns `false`, no reply or ACK will be sent.

Check [examples/client.js](examples/client.js) for complete examples and
[https://docs.nkn.org/nkn-sdk-js](https://docs.nkn.org/nkn-sdk-js) for full
documentation.

## MultiClient

MultiClient creates multiple NKN client instances by adding identifier prefix
(`__0__.`, `__1__.`, `__2__.`, ...) to a NKN address and send/receive packets
concurrently. This will greatly increase reliability and reduce latency at the
cost of more bandwidth usage (proportional to the number of clients).

MultiClient basically has the same API as [client](#client), with a few
additional initial configurations and session mode:

```javascript
let multiclient = new nkn.MultiClient({
  numSubClients: 4,
  originalClient: false,
});
```

where `originalClient` controls whether a client with original identifier
(without adding any additional identifier prefix) will be created, and
`numSubClients` controls how many sub-clients to create by adding prefix
`__0__.`, `__1__.`, `__2__.`, etc. Using `originalClient: true` and
`numSubClients: 0` is equivalent to using a standard NKN Client without any
modification to the identifier. Note that if you use `originalClient: true` and
`numSubClients` is greater than 0, your identifier should not starts with
`__X__` where `X` is any number, otherwise you may end up with identifier
collision.

Any additional options will be passed to NKN client.

MultiClient instance shares most of the public API as regular NKN client, see
[client](#client) for usage and examples. If you need low-level property or API,
you can use `multiclient.defaultClient` to get the default client and
`multiclient.clients` to get all clients.

Check [examples/client.js](examples/client.js) for complete examples and
[https://docs.nkn.org/nkn-sdk-js](https://docs.nkn.org/nkn-sdk-js) for full
documentation.

### Session

In addition to the default packet mode, multiclient also supports session mode,
a reliable streaming protocol similar to TCP based on
[ncp](https://github.com/nknorg/ncp-js).

Listens for incoming sessions (without `listen()` no sessions will be accepted):

```javascript
multiclient.listen();
```

Dial a session:

```javascript
multiclient.dial('another-client-address').then((session) => {
  console.log(session.localAddr, 'dialed a session to', session.remoteAddr);
});
```

Accepts for incoming sessions:

```javascript
multiclient.onSession((session) => {
  console.log(session.localAddr, 'accepted a session from', session.remoteAddr);
});
```

Write to session:

```javascript
session.write(Uint8Array.from([1,2,3,4,5])).then(() => {
  console.log('write success');
});
```

Read from session:

```javascript
session.read().then((data) => {
  console.log('read', data);
});
```

`session.read` also accepts a `maxSize` parameter, e.g. `session.read(maxSize)`.
If `maxSize > 0`, at most `maxSize` bytes will be returned. If `maxSize == 0` or
not set, the first batch of received data will be returned. If `maxSize < 0`,
all received data will be concatenated and returned together.

Session can be converted to WebStream using `session.getReadableStream()` and
`session.getWritableStream(closeSessionOnEnd = false)`. Note that WebStream is
not fully supported by all browser, so you might need to polyfill it globally or
setting `session.ReadableStream` and `session.WritableStream` constructors.

Check [examples/session.js](examples/session.js) for complete example or try
demo file transfer web app at [https://nftp.nkn.org](https://nftp.nkn.org) and
its source code at
[https://github.com/nknorg/nftp-js](https://github.com/nknorg/nftp-js).

## Wallet

NKN Wallet SDK.

Create a new wallet with a generated key pair:

```javascript
let wallet = new nkn.Wallet({ password: 'password' });
```

Create wallet from a secret seed:

```javascript
let wallet = new nkn.Wallet({
  seed: wallet.getSeed(),
  password: 'new-wallet-password',
});
```

Export wallet to JSON string:

```javascript
let walletJson = wallet.toJSON();
```

Load wallet from JSON and password:

```javascript
let wallet = nkn.Wallet.fromJSON(walletJson, { password: 'password' });
```

By default the wallet will use RPC server provided by nkn.org. Any NKN full node
can serve as a RPC server. You can create a wallet using customized RPC server:

```javascript
let wallet = new nkn.Wallet({
  password: 'password',
  rpcServerAddr: 'https://ip:port',
});
```

Verify whether an address is a valid NKN wallet address:

```javascript
console.log(nkn.Wallet.verifyAddress(wallet.address));
```

Verify password of the wallet:

```javascript
console.log(wallet.verifyPassword('password'));
```

Get balance of this wallet:

```javascript
wallet.getBalance().then((value) => {
  console.log('Balance for this wallet is:', value.toString());
});
```

Transfer token to another wallet address:

```javascript
wallet.transferTo(wallet.address, 1, { fee: 0.1, attrs: 'hello world' }).then((txnHash) => {
  console.log('Transfer transaction hash:', txnHash);
});
```

Subscribe to a topic for this wallet for next 100 blocks (around 20 seconds per
block), client using the same key pair (seed) as this wallet and same identifier
as passed to `subscribe` will be able to receive messages from this topic:

```javascript
wallet.subscribe('topic', 100, 'identifier', 'metadata', { fee: '0.1' }).then((txnHash) => {
  console.log('Subscribe transaction hash:', txnHash);
});
```

Check [examples/wallet.js](examples/wallet.js) for complete examples and
[https://docs.nkn.org/nkn-sdk-js](https://docs.nkn.org/nkn-sdk-js) for full
documentation.

## Contributing

**Can I submit a bug, suggestion or feature request?**

Yes. Please open an issue for that.

**Can I contribute patches?**

Yes, we appreciate your help! To make contributions, please fork the repo, push
your changes to the forked repo with signed-off commits, and open a pull request
here.

Please sign off your commit. This means adding a line "Signed-off-by: Name
<email>" at the end of each commit, indicating that you wrote the code and have
the right to pass it on as an open source patch. This can be done automatically
by adding -s when committing:

```shell
git commit -s
```

## Community

* [Discord](https://discord.gg/c7mTynX)
* [Telegram](https://t.me/nknorg)
* [Reddit](https://www.reddit.com/r/nknblockchain/)
* [Twitter](https://twitter.com/NKN_ORG)
