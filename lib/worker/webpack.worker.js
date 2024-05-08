"use strict";

var _worker = _interopRequireDefault(require("./worker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  (0, _worker.default)(self);
}