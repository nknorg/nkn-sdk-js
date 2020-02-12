'use strict';

import { Decimal } from 'decimal.js';

Decimal.set({ minE: -8 });

export default class Amount extends Decimal {
  static unit = new Decimal('100000000');

  value() {
    return this.times(Amount.unit).floor();
  }
}
