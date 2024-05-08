"use strict";

import * as address from "./address";
import * as common from "../common";

export const nameRegistrationFee = "10";

export function newTransferPayload(sender, recipient, amount) {
  let transfer = new common.pb.transaction.TransferAsset();
  transfer.setSender(Buffer.from(sender, "hex"));
  transfer.setRecipient(Buffer.from(recipient, "hex"));
  transfer.setAmount(new common.Amount(amount).value());

  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.TRANSFER_ASSET_TYPE);
  pld.setData(transfer.serializeBinary());

  return pld;
}

export function newRegisterNamePayload(
  registrant,
  name,
  registrationFee = nameRegistrationFee,
) {
  let registerName = new common.pb.transaction.RegisterName();
  registerName.setRegistrant(Buffer.from(registrant, "hex"));
  registerName.setName(name);
  registerName.setRegistrationFee(new common.Amount(registrationFee).value());

  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.REGISTER_NAME_TYPE);
  pld.setData(registerName.serializeBinary());

  return pld;
}

export function newTransferNamePayload(name, registrant, recipient) {
  let transferName = new common.pb.transaction.TransferName();
  transferName.setName(name);
  transferName.setRegistrant(Buffer.from(registrant, "hex"));
  transferName.setRecipient(Buffer.from(recipient, "hex"));

  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.TRANSFER_NAME_TYPE);
  pld.setData(transferName.serializeBinary());

  return pld;
}

export function newDeleteNamePayload(registrant, name) {
  let deleteName = new common.pb.transaction.DeleteName();
  deleteName.setRegistrant(Buffer.from(registrant, "hex"));
  deleteName.setName(name);

  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.DELETE_NAME_TYPE);
  pld.setData(deleteName.serializeBinary());

  return pld;
}

export function newSubscribePayload(
  subscriber,
  identifier,
  topic,
  duration,
  meta,
) {
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

export function newUnsubscribePayload(subscriber, identifier, topic) {
  let unsubscribe = new common.pb.transaction.Unsubscribe();
  unsubscribe.setSubscriber(Buffer.from(subscriber, "hex"));
  unsubscribe.setIdentifier(identifier);
  unsubscribe.setTopic(topic);

  let pld = new common.pb.transaction.Payload();
  pld.setType(common.pb.transaction.PayloadType.UNSUBSCRIBE_TYPE);
  pld.setData(unsubscribe.serializeBinary());

  return pld;
}

export function newNanoPayPayload(
  sender,
  recipient,
  id,
  amount,
  txnExpiration,
  nanoPayExpiration,
) {
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

export function serializePayload(payload) {
  let hex = "";
  hex += common.serialize.encodeUint32(payload.getType());
  hex += common.serialize.encodeBytes(payload.getData());
  return hex;
}

export async function newTransaction(
  account,
  pld,
  nonce,
  fee = "0",
  attrs = "",
) {
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

export function serializeUnsignedTx(unsignedTx) {
  let hex = "";
  hex += serializePayload(unsignedTx.getPayload());
  hex += common.serialize.encodeUint64(unsignedTx.getNonce());
  hex += common.serialize.encodeUint64(unsignedTx.getFee());
  hex += common.serialize.encodeBytes(unsignedTx.getAttributes());
  return hex;
}

export async function signTx(account, txn) {
  let unsignedTx = txn.getUnsignedTx();
  let hex = serializeUnsignedTx(unsignedTx);
  let digest = common.hash.sha256Hex(hex);
  let signature = await account.key.sign(digest);

  txn.hash = common.hash.doubleSha256Hex(hex);

  let prgm = new common.pb.transaction.Program();
  prgm.setCode(Buffer.from(account.signatureRedeem, "hex"));
  prgm.setParameter(
    Buffer.from(address.signatureToParameter(signature), "hex"),
  );

  txn.setProgramsList([prgm]);
}
