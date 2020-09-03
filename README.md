# vuex-dumper

A vue.js utility for dumping application state. Useful for debugging and error
reporting.

## Installation

```sh
npm save vuex-dumper
# or
yarn add vuex-dumper
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
