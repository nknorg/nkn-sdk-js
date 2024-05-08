"use strict";

import workify from "./worker";

if (
  typeof WorkerGlobalScope !== "undefined" &&
  self instanceof WorkerGlobalScope
) {
  workify(self);
}
