import { makeAdapter, type KV } from "./kv-core";

/*
  Web fallback: an in-memory store. Keeps the web bundle free of expo-sqlite's
  wasm worker. Persistence on web is out of scope (the app targets Expo Go).
*/
const mem = new Map<string, string>();

const kv: KV = {
  get: async (k) => mem.get(k) ?? null,
  set: async (k, v) => void mem.set(k, v),
  del: async (k) => void mem.delete(k),
  keys: async () => [...mem.keys()],
};

export const localAdapter = makeAdapter(kv);
