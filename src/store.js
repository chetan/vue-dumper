
export function getStoreState(store, ...modules) {
  const state = {};
  modules.forEach((s) => {
    state[s] = store.get(s);
  });
  return state;
}
