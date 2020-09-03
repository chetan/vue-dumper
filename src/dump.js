
// Original from vuejs/vue-devtools
// Copyright (c) 2014-present Evan You
// https://github.com/vuejs/vue-devtools/blob/6d8fee4d058716fe72825c9ae22cf831ef8f5172/packages/app-backend/src/index.js

import { camelize, getCustomRefDetails } from './util';

const isLegacy = false;
const propModes = ['default', 'sync', 'once'];

/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processProps(instance) {
  let props;
  if (isLegacy && (props = instance._props)) {
    // 1.x
    return Object.keys(props).map((key) => {
      const prop = props[key];
      const { options } = prop;
      return {
        type: 'props',
        key: prop.path,
        value: instance[prop.path],
        meta: options
          ? {
              type: options.type ? getPropType(options.type) : 'any',
              required: !!options.required,
              mode: propModes[prop.mode],
            }
          : {},
      };
    });
  }
  if ((props = instance.$options.props)) {
    // 2.0
    const propsData = [];
    for (let key in props) {
      const prop = props[key];
      key = camelize(key);
      propsData.push({
        type: 'props',
        key,
        value: instance[key],
        meta: prop
          ? {
              type: prop.type ? getPropType(prop.type) : 'any',
              required: !!prop.required,
            }
          : {
              type: 'invalid',
            },
      });
    }
    return propsData;
  }
  return [];
}

function processAttrs(instance) {
  return Object.entries(instance.$attrs || {}).map(([key, value]) => {
    return {
      type: '$attrs',
      key,
      value,
    };
  });
}

/**
 * Convert prop type constructor to string.
 *
 * @param {Function} fn
 */

const fnTypeRE = /^(?:function|class) (\w+)/;
function getPropType(type) {
  const match = type.toString().match(fnTypeRE);
  return typeof type === 'function' ? (match && match[1]) || 'any' : 'any';
}

/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processState(instance) {
  const props = isLegacy ? instance._props : instance.$options.props;
  const getters = instance.$options.vuex && instance.$options.vuex.getters;
  return Object.keys(instance._data)
    .filter((key) => !(props && key in props) && !(getters && key in getters))
    .map((key) => ({
      key,
      value: instance._data[key],
    }));
}

/**
 * Process refs
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processRefs(instance) {
  return Object.keys(instance.$refs)
    .filter((key) => instance.$refs[key])
    .map((key) => getCustomRefDetails(instance, key, instance.$refs[key]));
}

/**
 * Process the computed properties of an instance.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processComputed(instance) {
  const computed = [];
  const defs = instance.$options.computed || {};
  // use for...in here because if 'computed' is not defined
  // on component, computed properties will be placed in prototype
  // and Object.keys does not include
  // properties from object's prototype
  for (const key in defs) {
    const def = defs[key];
    const type = typeof def === 'function' && def.vuex ? 'vuex bindings' : 'computed';
    // use try ... catch here because some computed properties may
    // throw error during its evaluation
    let computedProp = null;
    try {
      computedProp = {
        type,
        key,
        value: instance[key],
      };
    } catch (e) {
      computedProp = {
        type,
        key,
        value: '(error during evaluation)',
      };
    }

    computed.push(computedProp);
  }

  return computed;
}

/**
 * Process Vuex getters.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processInjected(instance) {
  const injected = instance.$options.inject;

  if (injected) {
    return Object.keys(injected).map((key) => {
      return {
        key,
        type: 'injected',
        value: instance[key],
      };
    });
  }
  return [];
}

/**
 * Process possible vue-router $route context
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processRouteContext(instance) {
  try {
    const route = instance.$route;
    if (route) {
      const { path, query, params } = route;
      const value = { path, query, params };
      if (route.fullPath) value.fullPath = route.fullPath;
      if (route.hash) value.hash = route.hash;
      if (route.name) value.name = route.name;
      if (route.meta) value.meta = route.meta;
      return [
        {
          key: '$route',
          value: {
            _custom: {
              type: 'router',
              abstract: true,
              value,
            },
          },
        },
      ];
    }
  } catch (e) {
    // Invalid $router
  }
  return [];
}

/**
 * Process Vuex getters.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processVuexGetters(instance) {
  const getters = instance.$options.vuex && instance.$options.vuex.getters;
  if (getters) {
    return Object.keys(getters).map((key) => {
      return {
        type: 'vuex getters',
        key,
        value: instance[key],
      };
    });
  }
  return [];
}

/**
 * Process vue-rx observable bindings.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processObservables(instance) {
  const obs = instance.$observables;
  if (obs) {
    return Object.keys(obs).map((key) => {
      return {
        type: 'observables',
        key,
        value: instance[key],
      };
    });
  }
  return [];
}

export function getInstanceState(instance) {
  return {
    props: processProps(instance),
    data: processState(instance),
    computed: processComputed(instance),
    refs: processRefs(instance),
    injected: processInjected(instance),
    route: processRouteContext(instance),
    vuexGetters: processVuexGetters(instance),
    observables: processObservables(instance),
    attrs: processAttrs(instance),
  };
}
