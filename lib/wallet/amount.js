'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _decimal = require("decimal.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_decimal.Decimal.set({
  minE: -8
});
/**
 * Amount of NKN tokens. See documentation at
 * [decimal.js](https://mikemcl.github.io/decimal.js/).
 */


class Amount extends _decimal.Decimal {
  value() {
    return this.times(Amount.unit).floor();
  }

}

exports.default = Amount;

_defineProperty(Amount, "unit", new _decimal.Decimal('100000000'));