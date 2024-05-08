"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nameRegistrationFee = void 0;
exports.newDeleteNamePayload = newDeleteNamePayload;
exports.newNanoPayPayload = newNanoPayPayload;
exports.newRegisterNamePayload = newRegisterNamePayload;
exports.newSubscribePayload = newSubscribePayload;
exports.newTransaction = newTransaction;
exports.newTransferNamePayload = newTransferNamePayload;
exports.newTransferPayload = newTransferPayload;
exports.newUnsubscribePayload = newUnsubscribePayload;
exports.serializePayload = serializePayload;
exports.serializeUnsignedTx = serializeUnsignedTx;
exports.signTx = signTx;

var address = _interopRequireWildcard(require("./address"));

var common = _interopRequireWildcard(require("../common"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const nameRegistrationFee = "10";
exports.nameRegistrationFee = nameRegistrationFee;

function newTransferPayload(sender, recipient, amount) {
  let transfer = new common.pb.transaction.TransferAsset();
  transfer.setSender(Buffer.from(sender, "hex"));
  transfer.setRecipient(Buffer.from(recipient, "hex"));
  transfer.setAmount(new common.Amount(amount).value());
  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.TRANSFER_ASSET_TYPE);
  pld.setData(transfer.serializeBinary());
  return pld;
}

function newRegisterNamePayload(registrant, name, registrationFee = nameRegistrationFee) {
  let registerName = new common.pb.transaction.RegisterName();
  registerName.setRegistrant(Buffer.from(registrant, "hex"));
  registerName.setName(name);
  registerName.setRegistrationFee(new common.Amount(registrationFee).value());
  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.REGISTER_NAME_TYPE);
  pld.setData(registerName.serializeBinary());
  return pld;
}

function newTransferNamePayload(name, registrant, recipient) {
  let transferName = new common.pb.transaction.TransferName();
  transferName.setName(name);
  transferName.setRegistrant(Buffer.from(registrant, "hex"));
  transferName.setRecipient(Buffer.from(recipient, "hex"));
  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.TRANSFER_NAME_TYPE);
  pld.setData(transferName.serializeBinary());
  return pld;
}

function newDeleteNamePayload(registrant, name) {
  let deleteName = new common.pb.transaction.DeleteName();
  deleteName.setRegistrant(Buffer.from(registrant, "hex"));
  deleteName.setName(name);
  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.DELETE_NAME_TYPE);
  pld.setData(deleteName.serializeBinary());
  return pld;
}

function newSubscribePayload(subscriber, identifier, topic, duration, meta) {
  let subscribe = new common.pb.transaction.Subscribe();
  subscribe.setSubscriber(Buffer.from(subscriber, "hex"));
  subscribe.setIdentifier(identifier);
  subscribe.setTopic(topic);
  subscribe.setDuration(duration);
  subscribe.setMeta(meta);
  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.SUBSCRIBE_TYPE);
  pld.setData(subscribe.serializeBinary());
  return pld;
}

function newUnsubscribePayload(subscriber, identifier, topic) {
  let unsubscribe = new common.pb.transaction.Unsubscribe();
  unsubscribe.setSubscriber(Buffer.from(subscriber, "hex"));
  unsubscribe.setIdentifier(identifier);
  unsubscribe.setTopic(topic);
  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.UNSUBSCRIBE_TYPE);
  pld.setData(unsubscribe.serializeBinary());
  return pld;
}

function newNanoPayPayload(sender, recipient, id, amount, txnExpiration, nanoPayExpiration) {
  let nanoPay = new common.pb.transaction.NanoPay();
  nanoPay.setSender(Buffer.from(sender, "hex"));
  nanoPay.setRecipient(Buffer.from(recipient, "hex"));
  nanoPay.setId(id);
  nanoPay.setAmount(new common.Amount(amount).value());
  nanoPay.setTxnExpiration(txnExpiration);
  nanoPay.setNanoPayExpiration(nanoPayExpiration);
  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.NANO_PAY_TYPE);
  pld.setData(nanoPay.serializeBinary());
  return pld;
}

function serializePayload(payload) {
  let hex = "";
  hex += common.serialize.encodeUint32(payload.getType());
  hex += common.serialize.encodeBytes(payload.getData());
  return hex;
}

async function newTransaction(account, pld, nonce, fee = "0", attrs = "") {
  let unsignedTx = new common.pb.transaction.UnsignedTx();
  unsignedTx.setPayload(pld);
  unsignedTx.setNonce(nonce);
  unsignedTx.setFee(new common.Amount(fee).value());
  unsignedTx.setAttributes(Buffer.from(attrs, "hex"));
  let txn = new common.pb.transaction.Transaction();
  txn.setUnsignedTx(unsignedTx);
  await signTx(account, txn);
  return txn;
}

function serializeUnsignedTx(unsignedTx) {
  let hex = "";
  hex += serializePayload(unsignedTx.getPayload());
  hex += common.serialize.encodeUint64(unsignedTx.getNonce());
  hex += common.serialize.encodeUint64(unsignedTx.getFee());
  hex += common.serialize.encodeBytes(unsignedTx.getAttributes());
  return hex;
}

async function signTx(account, txn) {
  let unsignedTx = txn.getUnsignedTx();
  let hex = serializeUnsignedTx(unsignedTx);
  let digest = common.hash.sha256Hex(hex);
  let signature = await account.key.sign(digest);
  txn.hash = common.hash.doubleSha256Hex(hex);
  let prgm = new common.pb.transaction.Program();
  prgm.setCode(Buffer.from(account.signatureRedeem, "hex"));
  prgm.setParameter(Buffer.from(address.signatureToParameter(signature), "hex"));
  txn.setProgramsList([prgm]);
}