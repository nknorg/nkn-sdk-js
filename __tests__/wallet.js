'use strict';

const nkn = require('../lib');

const password = '42';

test('from seed', () => {
  let wallet = new nkn.Wallet({ password: '42' });
  let walletFromSeed = new nkn.Wallet({ seed: wallet.getSeed(), password: '42' });
  expect(walletFromSeed.address).toBe(wallet.address);
});

test('from/to json', () => {
  let wallet = new nkn.Wallet({ password: '42' });
  let walletFromJson = nkn.Wallet.fromJSON(JSON.stringify(wallet), { password: '42' });
  expect(walletFromJson.address).toBe(wallet.address);
  expect(() => {
    nkn.Wallet.fromJSON(JSON.stringify(wallet), { password: '233' });
  }).toThrow();
});

test('from json async', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  let walletFromJson = await nkn.Wallet.fromJSON(JSON.stringify(wallet), { password: '42', async: true });
  expect(walletFromJson.address).toBe(wallet.address);
  expect(nkn.Wallet.fromJSON(JSON.stringify(wallet), { password: '233', async: true })).rejects.toEqual(new nkn.errors.WrongPasswordError())
});

test('verify password', () => {
  let wallet = new nkn.Wallet({ password: '42' });
  expect(wallet.verifyPassword('42')).toBe(true);
  expect(wallet.verifyPassword('233')).toBe(false);
});

test('verify password async', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  expect(await wallet.verifyPassword('42', { async: true })).toBe(true);
  expect(await wallet.verifyPassword('233', { async: true })).toBe(false);
});

test('verify address', () => {
  let wallet = new nkn.Wallet({ password: '42' });
  expect(nkn.Wallet.verifyAddress(wallet.address)).toBe(true);
  expect(nkn.Wallet.verifyAddress(wallet.address.slice(1))).toBe(false);
  expect(nkn.Wallet.verifyAddress(wallet.address.slice(0, -1))).toBe(false);
});

test('get balance', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  expect((await wallet.getBalance()).toString()).toBe('0');
  expect((await wallet.getBalance(wallet.address)).toString()).toBe('0');
  expect((await nkn.Wallet.getBalance(wallet.address)).toString()).toBe('0');
});

test('get nonce', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  expect(await wallet.getNonce()).toBe(0);
  expect(await wallet.getNonce(wallet.address)).toBe(0);
  expect(await nkn.Wallet.getNonce(wallet.address)).toBe(0);
});

test('transfer', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  try {
    await wallet.transferTo(wallet.address, '1', { fee: '0.1', attrs: 'hello world' });
  } catch (e) {
    expect(e).toBeInstanceOf(nkn.errors.ServerError);
    expect(e.code).toBe(nkn.errors.rpcRespErrCodes.appendTxnPool);
  }
});

test('subscribe', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  try {
    await wallet.subscribe('topic', 100, 'identifier', 'meta', { fee: '0.1' });
  } catch (e) {
    expect(e).toBeInstanceOf(nkn.errors.ServerError);
    expect(e.code).toBe(nkn.errors.rpcRespErrCodes.appendTxnPool);
  }
});

test('unsubscribe', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  try {
    await wallet.unsubscribe('topic', 'identifier');
  } catch (e) {
    expect(e).toBeInstanceOf(nkn.errors.ServerError);
    expect(e.code).toBe(nkn.errors.rpcRespErrCodes.appendTxnPool);
  }
});

test('register name', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  try {
    await wallet.registerName(wallet.address);
  } catch (e) {
    expect(e).toBeInstanceOf(nkn.errors.ServerError);
    expect(e.code).toBe(nkn.errors.rpcRespErrCodes.appendTxnPool);
  }
});

test('transfer name', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  try {
    await wallet.transferName(wallet.address, new nkn.Wallet({ password: '42' }).getPublicKey());
  } catch (e) {
    expect(e).toBeInstanceOf(nkn.errors.ServerError);
    expect(e.code).toBe(nkn.errors.rpcRespErrCodes.appendTxnPool);
  }
});

test('delete name', async () => {
  let wallet = new nkn.Wallet({ password: '42' });
  try {
    await wallet.deleteName(wallet.address);
  } catch (e) {
    expect(e).toBeInstanceOf(nkn.errors.ServerError);
    expect(e.code).toBe(nkn.errors.rpcRespErrCodes.appendTxnPool);
  }
});
