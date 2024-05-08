"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addrToID = addrToID;
exports.addrToPubkey = addrToPubkey;
exports.messageIdSize = exports.maxClientMessageSize = void 0;
exports.newAckPayload = newAckPayload;
exports.newBinaryPayload = newBinaryPayload;
exports.newClientMessage = newClientMessage;
exports.newMessage = newMessage;
exports.newOutboundMessage = newOutboundMessage;
exports.newPayload = newPayload;
exports.newReceipt = newReceipt;
exports.newSessionPayload = newSessionPayload;
exports.newTextPayload = newTextPayload;
exports.serializeSigChainElem = serializeSigChainElem;
exports.serializeSigChainMetadata = serializeSigChainMetadata;

var _pako = _interopRequireDefault(require("pako"));

var common = _interopRequireWildcard(require("../common"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const messageIdSize = 8; // in bytes

exports.messageIdSize = messageIdSize;
const maxClientMessageSize = 4000000; // in bytes. NKN node is using 4*1024*1024 as limit, we give some additional space for serialization overhead.

exports.maxClientMessageSize = maxClientMessageSize;

function newPayload(type, replyToId, data, messageId) {
  let payload = new common.pb.payloads.Payload();
  payload.setType(type);

  if (replyToId) {
    payload.setReplyToId(replyToId);
  } else if (messageId) {
    payload.setMessageId(messageId);
  } else {
    payload.setMessageId(common.util.randomBytes(messageIdSize));
  }

  payload.setData(data);
  return payload;
}

function newBinaryPayload(data, replyToId, messageId) {
  return newPayload(common.pb.payloads.PayloadType.BINARY, replyToId, data, messageId);
}

function newTextPayload(text, replyToId, messageId) {
  let data = new common.pb.payloads.TextData();
  data.setText(text);
  return newPayload(common.pb.payloads.PayloadType.TEXT, replyToId, data.serializeBinary(), messageId);
}

function newAckPayload(replyToId, messageId) {
  return newPayload(common.pb.payloads.PayloadType.ACK, replyToId, null, messageId);
}

function newSessionPayload(data, sessionID) {
  return newPayload(common.pb.payloads.PayloadType.SESSION, null, data, sessionID);
}

function newMessage(payload, encrypted, nonce, encryptedKey) {
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

function newClientMessage(messageType, message, compressionType) {
  let msg = new common.pb.messages.ClientMessage();
  msg.setMessageType(messageType);
  msg.setCompressionType(compressionType);

  switch (compressionType) {
    case common.pb.messages.CompressionType.COMPRESSION_NONE:
      break;

    case common.pb.messages.CompressionType.COMPRESSION_ZLIB:
      message = _pako.default.deflate(message);
      break;

    default:
      throw new common.errors.InvalidArgumentError("unknown compression type " + compressionType);
  }

  msg.setMessage(message);
  return msg;
}

async function newOutboundMessage(client, dest, payload, maxHoldingSeconds) {
  if (!Array.isArray(dest)) {
    dest = [dest];
  }

  if (dest.length === 0) {
    throw new common.errors.InvalidArgumentError("no destination");
  }

  if (!Array.isArray(payload)) {
    payload = [payload];
  }

  if (payload.length === 0) {
    throw new common.errors.InvalidArgumentError("no payloads");
  }

  if (payload.length > 1 && payload.length !== dest.length) {
    throw new common.errors.InvalidArgumentError("invalid payload array length");
  }

  let sigChainElem = new common.pb.sigchain.SigChainElem();
  sigChainElem.setNextPubkey(Buffer.from(client.node.pubkey, "hex"));
  let sigChainElemSerialized = serializeSigChainElem(sigChainElem);
  let sigChain = new common.pb.sigchain.SigChain();
  sigChain.setNonce(common.util.randomInt32());

  if (client.sigChainBlockHash) {
    sigChain.setBlockHash(Buffer.from(client.sigChainBlockHash, "hex"));
  }

  sigChain.setSrcId(Buffer.from(addrToID(client.addr), "hex"));
  sigChain.setSrcPubkey(Buffer.from(client.key.publicKey, "hex"));
  let signatures = [];
  let hex, digest, signature;

  for (let i = 0; i < dest.length; i++) {
    sigChain.setDestId(Buffer.from(addrToID(dest[i]), "hex"));
    sigChain.setDestPubkey(Buffer.from(addrToPubkey(dest[i]), "hex"));

    if (payload.length > 1) {
      sigChain.setDataSize(payload[i].length);
    } else {
      sigChain.setDataSize(payload[0].length);
    }

    hex = serializeSigChainMetadata(sigChain);
    digest = common.hash.sha256Hex(hex);
    digest = common.hash.sha256Hex(digest + sigChainElemSerialized);
    signature = await client.key.sign(digest);
    signatures.push(Buffer.from(signature, "hex"));
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

async function newReceipt(client, prevSignature) {
  let sigChainElem = new common.pb.sigchain.SigChainElem();
  let sigChainElemSerialized = serializeSigChainElem(sigChainElem);
  let digest = common.hash.sha256Hex(prevSignature);
  digest = common.hash.sha256Hex(digest + sigChainElemSerialized);
  let signature = await client.key.sign(digest);
  let msg = new common.pb.messages.Receipt();
  msg.setPrevSignature(Buffer.from(prevSignature, "hex"));
  msg.setSignature(Buffer.from(signature, "hex"));
  return newClientMessage(common.pb.messages.ClientMessageType.RECEIPT, msg.serializeBinary(), common.pb.messages.CompressionType.COMPRESSION_NONE);
}

function serializeSigChainMetadata(sigChain) {
  let hex = "";
  hex += common.serialize.encodeUint32(sigChain.getNonce());
  hex += common.serialize.encodeUint32(sigChain.getDataSize());
  hex += common.serialize.encodeBytes(sigChain.getBlockHash());
  hex += common.serialize.encodeBytes(sigChain.getSrcId());
  hex += common.serialize.encodeBytes(sigChain.getSrcPubkey());
  hex += common.serialize.encodeBytes(sigChain.getDestId());
  hex += common.serialize.encodeBytes(sigChain.getDestPubkey());
  return hex;
}

function serializeSigChainElem(sigChainElem) {
  let hex = "";
  hex += common.serialize.encodeBytes(sigChainElem.getId());
  hex += common.serialize.encodeBytes(sigChainElem.getNextPubkey());
  hex += common.serialize.encodeBool(sigChainElem.getMining());
  return hex;
}

function addrToID(addr) {
  return common.hash.sha256(addr);
}

function addrToPubkey(addr) {
  let s = addr.split(".");
  return s[s.length - 1];
}