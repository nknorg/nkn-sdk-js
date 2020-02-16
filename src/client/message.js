'use strict';

import pako from 'pako';

import * as common from '../common';

export const pidSize = 8; // in bytes
export const maxClientMessageSize = 4000000; // in bytes. NKN node is using 4*1024*1024 as limit, we give some additional space for serialization overhead.

export function newPayload(type, replyToPid, data, msgPid) {
  let payload = new common.pb.payloads.Payload();
  payload.setType(type);
  if (replyToPid) {
    payload.setReplyToPid(replyToPid);
  } else if (msgPid) {
    payload.setPid(msgPid);
  } else {
    payload.setPid(common.util.randomBytes(pidSize));
  }
  payload.setData(data);
  return payload;
}

export function newBinaryPayload(data, replyToPid, msgPid) {
  return newPayload(common.pb.payloads.PayloadType.BINARY, replyToPid, data, msgPid);
}

export function newTextPayload(text, replyToPid, msgPid) {
  let data = new common.pb.payloads.TextData();
  data.setText(text);
  return newPayload(common.pb.payloads.PayloadType.TEXT, replyToPid, data.serializeBinary(), msgPid);
}

export function newAckPayload(replyToPid, msgPid) {
  return newPayload(common.pb.payloads.PayloadType.ACK, replyToPid, null, msgPid);
}

export function newSessionPayload(data, sessionID) {
  return newPayload(common.pb.payloads.PayloadType.SESSION, null, data, sessionID);
}

export function newMessage(payload, encrypted, nonce, encryptedKey) {
  let msg = new common.pb.payloads.Message();
  msg.setPayload(payload);
  msg.setEncrypted(encrypted);
  if (nonce) {
    msg.setNonce(nonce);
  }
  if (encryptedKey) {
    msg.setEncryptedKey(encryptedKey);
  }
  return msg;
}

export function newClientMessage(messageType, message, compressionType) {
  let msg = new common.pb.messages.ClientMessage();
  msg.setMessageType(messageType);
  msg.setCompressionType(compressionType);
  switch (compressionType) {
    case common.pb.messages.CompressionType.COMPRESSION_NONE:
      break;
    case common.pb.messages.CompressionType.COMPRESSION_ZLIB:
      message = pako.deflate(message);
      break;
    default:
      throw new common.errors.InvalidArgumentError('unknown compression type ' + compressionType);
  }
  msg.setMessage(message);
  return msg;
}

export async function newOutboundMessage(client, dest, payload, maxHoldingSeconds) {
  if (!Array.isArray(dest)) {
    dest = [dest];
  }
  if (dest.length === 0) {
    throw new common.errors.InvalidArgumentError('no destination');
  }

  if (!Array.isArray(payload)) {
    payload = [payload];
  }
  if (payload.length === 0) {
    throw new common.errors.InvalidArgumentError('no payloads');
  }

  if (payload.length > 1 && payload.length !== dest.length) {
    throw new common.errors.InvalidArgumentError('invalid payload array length');
  }

  let sigChainElem = new common.pb.sigchain.SigChainElem();
  sigChainElem.setNextPubkey(common.util.hexToBytes(client.node.pubkey));
  let sigChainElemSerialized = serializeSigChainElem(sigChainElem);

  let sigChain = new common.pb.sigchain.SigChain();
  sigChain.setNonce(common.util.randomInt32());
  if (client.sigChainBlockHash) {
    sigChain.setBlockHash(common.util.hexToBytes(client.sigChainBlockHash));
  }
  sigChain.setSrcId(common.util.hexToBytes(addrToID(client.addr)));
  sigChain.setSrcPubkey(common.util.hexToBytes(client.key.publicKey));

  let signatures = [];
  let hex, digest, signature;
  for (let i = 0; i < dest.length; i++) {
    sigChain.setDestId(common.util.hexToBytes(addrToID(dest[i])));
    sigChain.setDestPubkey(common.util.hexToBytes(addrToPubkey(dest[i])));
    if (payload.length > 1) {
      sigChain.setDataSize(payload[i].length);
    } else {
      sigChain.setDataSize(payload[0].length);
    }
    hex = serializeSigChainMetadata(sigChain);
    digest = common.hash.sha256Hex(hex);
    digest = common.hash.sha256Hex(digest + sigChainElemSerialized);
    signature = await client.key.sign(Buffer.from(digest, 'hex'));
    signatures.push(common.util.hexToBytes(signature));
  }

  let msg = new common.pb.messages.OutboundMessage();
  msg.setDestsList(dest);
  msg.setPayloadsList(payload);
  msg.setMaxHoldingSeconds(maxHoldingSeconds);
  msg.setNonce(sigChain.getNonce());
  msg.setBlockHash(sigChain.getBlockHash());
  msg.setSignaturesList(signatures);

  let compressionType;
  if (payload.length > 1) {
    compressionType = common.pb.messages.CompressionType.COMPRESSION_ZLIB;
  } else {
    compressionType = common.pb.messages.CompressionType.COMPRESSION_NONE;
  }

  return newClientMessage(common.pb.messages.ClientMessageType.OUTBOUND_MESSAGE, msg.serializeBinary(), compressionType);
}

export async function newReceipt(client, prevSignature) {
  let sigChainElem = new common.pb.sigchain.SigChainElem();
  let sigChainElemSerialized = serializeSigChainElem(sigChainElem);
  let digest = common.hash.sha256Hex(prevSignature);
  digest = common.hash.sha256Hex(digest + sigChainElemSerialized);
  let signature = await client.key.sign(Buffer.from(digest, 'hex'));
  let msg = new common.pb.messages.Receipt();
  msg.setPrevSignature(common.util.hexToBytes(prevSignature));
  msg.setSignature(common.util.hexToBytes(signature));
  return newClientMessage(common.pb.messages.ClientMessageType.RECEIPT, msg.serializeBinary(), common.pb.messages.CompressionType.COMPRESSION_NONE);
}

export function serializeSigChainMetadata(sigChain) {
  let hex = '';
  hex += common.serialize.encodeUint32(sigChain.getNonce());
  hex += common.serialize.encodeUint32(sigChain.getDataSize());
  hex += common.serialize.encodeBytes(sigChain.getBlockHash());
  hex += common.serialize.encodeBytes(sigChain.getSrcId());
  hex += common.serialize.encodeBytes(sigChain.getSrcPubkey());
  hex += common.serialize.encodeBytes(sigChain.getDestId());
  hex += common.serialize.encodeBytes(sigChain.getDestPubkey());
  return hex;
}

export function serializeSigChainElem(sigChainElem) {
  let hex = '';
  hex += common.serialize.encodeBytes(sigChainElem.getId());
  hex += common.serialize.encodeBytes(sigChainElem.getNextPubkey());
  hex += common.serialize.encodeBool(sigChainElem.getMining());
  return hex;
}

export function addrToID(addr) {
  return common.hash.sha256(addr)
}

export function addrToPubkey(addr) {
  let s = addr.split('.');
  return s[s.length - 1];
}
