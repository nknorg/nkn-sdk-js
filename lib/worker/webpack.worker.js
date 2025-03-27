"use strict";

var _worker = _interopRequireDefault(require("./worker"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  (0, _worker["default"])(self);
}