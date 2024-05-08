"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rpcRespErrCodes = exports.WrongPasswordError = exports.UnknownError = exports.ServerError = exports.RpcTimeoutError = exports.RpcError = exports.NotEnoughBalanceError = exports.InvalidWalletVersionError = exports.InvalidWalletFormatError = exports.InvalidResponseError = exports.InvalidDestinationError = exports.InvalidArgumentError = exports.InvalidAddressError = exports.DecryptionError = exports.DataSizeTooLargeError = exports.ClientNotReadyError = exports.ChallengeTimeoutError = exports.AddrNotAllowedError = void 0;
const rpcRespErrCodes = {
  success: 0,
  wrongNode: 48001,
  appendTxnPool: 45021
};
exports.rpcRespErrCodes = rpcRespErrCodes;

class AddrNotAllowedError extends Error {
  constructor(message = "address not allowed", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AddrNotAllowedError);
    }

    this.name = "AddrNotAllowedError";
  }

}

exports.AddrNotAllowedError = AddrNotAllowedError;

class ClientNotReadyError extends Error {
  constructor(message = "client not ready", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientNotReadyError);
    }

    this.name = "ClientNotReadyError";
  }

}

exports.ClientNotReadyError = ClientNotReadyError;

class DataSizeTooLargeError extends Error {
  constructor(message = "data size too large", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DataSizeTooLargeError);
    }

    this.name = "DataSizeTooLargeError";
  }

}

exports.DataSizeTooLargeError = DataSizeTooLargeError;

class DecryptionError extends Error {
  constructor(message = "decrypt message error", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DecryptionError);
    }

    this.name = "DecryptionError";
  }

}

exports.DecryptionError = DecryptionError;

class UnknownError extends Error {
  constructor(message = "unknown error", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownError);
    }

    this.name = "UnknownError";
  }

}

exports.UnknownError = UnknownError;

class NotEnoughBalanceError extends Error {
  constructor(message = "not enough balance", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotEnoughBalanceError);
    }

    this.name = "NotEnoughBalanceError";
  }

}

exports.NotEnoughBalanceError = NotEnoughBalanceError;

class WrongPasswordError extends Error {
  constructor(message = "wrong password", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WrongPasswordError);
    }

    this.name = "WrongPasswordError";
  }

}

exports.WrongPasswordError = WrongPasswordError;

class InvalidAddressError extends Error {
  constructor(message = "invalid wallet address", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidAddressError);
    }

    this.name = "InvalidAddressError";
  }

}

exports.InvalidAddressError = InvalidAddressError;

class InvalidWalletFormatError extends Error {
  constructor(message = "invalid wallet format", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidWalletFormatError);
    }

    this.name = "InvalidWalletFormatError";
  }

}

exports.InvalidWalletFormatError = InvalidWalletFormatError;

class InvalidWalletVersionError extends Error {
  constructor(message = "invalid wallet version", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidWalletVersionError);
    }

    this.name = "InvalidWalletVersionError";
  }

}

exports.InvalidWalletVersionError = InvalidWalletVersionError;

class InvalidArgumentError extends Error {
  constructor(message = "invalid argument", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidArgumentError);
    }

    this.name = "InvalidArgumentError";
  }

}

exports.InvalidArgumentError = InvalidArgumentError;

class InvalidResponseError extends Error {
  constructor(message = "invalid response from RPC server", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidResponseError);
    }

    this.name = "InvalidResponseError";
  }

}

exports.InvalidResponseError = InvalidResponseError;

class ServerError extends Error {
  constructor(error = "error from RPC server", ...params) {
    let message;

    if (typeof error === "object") {
      message = error.message + ": " + error.data;
    } else {
      message = error;
    }

    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }

    this.name = "ServerError";

    if (error.code) {
      this.code = -error.code;
    }
  }

}

exports.ServerError = ServerError;

class InvalidDestinationError extends Error {
  constructor(message = "invalid destination", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidDestinationError);
    }

    this.name = "InvalidDestinationError";
  }

}

exports.InvalidDestinationError = InvalidDestinationError;

class RpcTimeoutError extends Error {
  constructor(message = "rpc timeout", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcTimeoutError);
    }

    this.name = "RpcTimeoutError";
  }

}

exports.RpcTimeoutError = RpcTimeoutError;

class RpcError extends Error {
  constructor(message = "rpc error", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcError);
    }

    this.name = "RpcError";
  }

}

exports.RpcError = RpcError;

class ChallengeTimeoutError extends Error {
  constructor(message = "challenge timeout", ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ChallengeTimeoutError);
    }

    this.name = "ChallengeTimeoutError";
  }

}

exports.ChallengeTimeoutError = ChallengeTimeoutError;