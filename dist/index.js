"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dump = require("./dump");

var _store = require("./store");

var _default = {
  getInstanceState: _dump.getInstanceState,
  getStoreState: _store.getStoreState
};
exports.default = _default;