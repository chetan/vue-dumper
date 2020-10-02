"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStoreState = getStoreState;

function getStoreState(store) {
  const state = {};

  for (var _len = arguments.length, modules = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    modules[_key - 1] = arguments[_key];
  }

  modules.forEach(s => {
    state[s] = store.get(s);
  });
  return state;
}