"use strict";

export const rpcRespErrCodes = {
  success: 0,
  wrongNode: 48001,
  appendTxnPool: 45021,
  invalidMethod: 42001,
};

export class AddrNotAllowedError extends Error {
  constructor(message = "address not allowed", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AddrNotAllowedError);
    }
    this.name = "AddrNotAllowedError";
  }
}

export class ClientNotReadyError extends Error {
  constructor(message = "client not ready", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientNotReadyError);
    }
    this.name = "ClientNotReadyError";
  }
}

export class DataSizeTooLargeError extends Error {
  constructor(message = "data size too large", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DataSizeTooLargeError);
    }
    this.name = "DataSizeTooLargeError";
  }
}

export class DecryptionError extends Error {
  constructor(message = "decrypt message error", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DecryptionError);
    }
    this.name = "DecryptionError";
  }
}

export class UnknownError extends Error {
  constructor(message = "unknown error", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownError);
    }
    this.name = "UnknownError";
  }
}

export class NotEnoughBalanceError extends Error {
  constructor(message = "not enough balance", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotEnoughBalanceError);
    }
    this.name = "NotEnoughBalanceError";
  }
}

export class WrongPasswordError extends Error {
  constructor(message = "wrong password", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WrongPasswordError);
    }
    this.name = "WrongPasswordError";
  }
}

export class InvalidAddressError extends Error {
  constructor(message = "invalid wallet address", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidAddressError);
    }
    this.name = "InvalidAddressError";
  }
}

export class InvalidWalletFormatError extends Error {
  constructor(message = "invalid wallet format", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidWalletFormatError);
    }
    this.name = "InvalidWalletFormatError";
  }
}

export class InvalidWalletVersionError extends Error {
  constructor(message = "invalid wallet version", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidWalletVersionError);
    }
    this.name = "InvalidWalletVersionError";
  }
}

export class InvalidArgumentError extends Error {
  constructor(message = "invalid argument", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidArgumentError);
    }
    this.name = "InvalidArgumentError";
  }
}

export class InvalidResponseError extends Error {
  constructor(message = "invalid response from RPC server", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidResponseError);
    }
    this.name = "InvalidResponseError";
  }
}

export class ServerError extends Error {
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

export class InvalidDestinationError extends Error {
  constructor(message = "invalid destination", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidDestinationError);
    }
    this.name = "InvalidDestinationError";
  }
}

export class RpcTimeoutError extends Error {
  constructor(message = "rpc timeout", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcTimeoutError);
    }
    this.name = "RpcTimeoutError";
  }
}

export class RpcError extends Error {
  constructor(message = "rpc error", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcError);
    }
    this.name = "RpcError";
  }
}

export class ChallengeTimeoutError extends Error {
  constructor(message = "challenge timeout", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ChallengeTimeoutError);
    }
    this.name = "ChallengeTimeoutError";
  }
}

export class ConnectToNodeTimeoutError extends Error {
  constructor(message = "connect to node timeout", ...params) {
    super(message, ...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConnectToNodeTimeoutError);
    }
    this.name = "ConnectToNodeTimeoutError";
  }
}
