import { makeAdapter, type KV } from "./kv-core";

/*
  Native key-value store backed by expo-sqlite (works in Expo Go — no native
  build needed). Web uses kv.web.ts instead, so expo-sqlite is never bundled
  for web.
*/
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Storage = require("expo-sqlite/kv-store").default;

const kv: KV = {
  get: (k) => Storage.getItem(k),
  set: (k, v) => Storage.setItem(k, v),
  del: async (k) => {
    await Storage.removeItem(k);
  },
  keys: () => Storage.getAllKeys(),
};

export const localAdapter = makeAdapter(kv);
