"use strict";

require("core-js/modules/es.string.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getComponentName = getComponentName;
exports.getCustomRefDetails = getCustomRefDetails;
exports.camelize = exports.classify = void 0;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Original from vuejs/vue-devtools
// Copyright (c) 2014-present Evan You
// https://github.com/vuejs/vue-devtools/blob/6d8fee4d058716fe72825c9ae22cf831ef8f5172/packages/shared-utils/src/util.js
function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

const classifyRE = /(?:^|[-_/])(\w)/g;
const classify = cached(str => {
  return str && str.replace(classifyRE, toUpper);
});
exports.classify = classify;

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

const camelizeRE = /-(\w)/g;
const camelize = cached(str => {
  return str.replace(camelizeRE, toUpper);
}); // Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows

exports.camelize = camelize;

function basename(filename, ext) {
  return _path.default.basename(filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'), ext);
}

function getComponentName(options) {
  const name = options.name || options._componentTag;

  if (name) {
    return name;
  }

  const file = options.__file; // injected by vue-loader

  if (file) {
    return classify(basename(file, '.vue'));
  }

  return undefined;
}

function getCustomRefDetails(instance, key, ref) {
  let value;

  if (Array.isArray(ref)) {
    value = ref.map(r => getCustomRefDetails(instance, key, r)).map(data => data.value);
  } else {
    let name;

    if (ref._isVue) {
      name = getComponentName(ref.$options);
    } else {
      name = ref.tagName.toLowerCase();
    }

    value = {
      _custom: {
        display: "&lt;".concat(name).concat(ref.id ? " <span class=\"attr-title\">id</span>=\"".concat(ref.id, "\"") : '').concat(ref.className ? " <span class=\"attr-title\">class</span>=\"".concat(ref.className, "\"") : '', "&gt;"),
        uid: instance.__VUE_DEVTOOLS_UID__,
        type: 'reference'
      }
    };
  }

  return {
    type: '$refs',
    key,
    value,
    editable: false
  };
}