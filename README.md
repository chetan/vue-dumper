# vue-dumper

A vue.js utility for dumping application state. Useful for debugging and error
reporting.

## Installation

```sh
npm save vue-dumper
# or
yarn add vue-dumper
```

## Usage

Install a global error handler:

```js
Vue.config.errorHandler = (err, vm) => {
  if (vm && vm.$options) {
    err.message += `\n\nComponent State:\n\n${JSON.stringify(dumper.getInstanceState(vm))}`;
  }
  if (vm && vm.$store) {
    err.message += `\n\nStore State:\n\n${JSON.stringify(
      dumper.getStoreState(vm.$store, 'moduleA', 'moduleB')
    )}`;
  }

  // Do something with the modified err like log to console or some error
  // reporting service.
  console.error(err);
};
```

## Sample output

```text
TypeError: foo is not a function

Component State:

{"props":[],"data":[],"computed":[],"refs":[],"injected":[],"route":[{"key":"$route",
  "value":{"_custom":{"type":"router","abstract":true,"value":{"path":"/home",
  "query":{},"params":{},"fullPath":"/home","name":"Home","meta":{}}}}}],
  "vuexGetters":[],"observables":[],"attrs":[]}

Store State:

{"moduleA":{},"moduleB":{}}
```
