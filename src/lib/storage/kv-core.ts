import type { Coro, Prompt, Settings } from "@/engine/types";
import { DEFAULT_SETTINGS, type StorageAdapter } from "./types";

/*
  Shared adapter logic over a tiny async key-value contract. Custom prompts are
  stored as rows keyed by their own id, so a prompt can be deleted by id and a
  coro's prompts swept on delete — mirrors the web Dexie behavior. The concrete
  KV is provided per-platform (expo-sqlite on native, in-memory on web) so the
  web bundle never reaches for expo-sqlite's wasm worker.
*/

export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

const CORO = "coro:";
const CUSTOM = "custom:";
const SETTINGS = "settings";

interface CustomRow {
  coroId: string;
  prompt: Prompt;
}

function read<T>(raw: string | null | undefined): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function makeAdapter(kv: KV): StorageAdapter {
  async function readAll<T>(prefix: string): Promise<T[]> {
    const keys = (await kv.keys()).filter((k) => k.startsWith(prefix));
    const raws = await Promise.all(keys.map((k) => kv.get(k)));
    return raws.map((r) => read<T>(r)).filter((x): x is T => x !== undefined);
  }

  async function sweepCustoms(predicate: (row: CustomRow) => boolean) {
    const keys = (await kv.keys()).filter((k) => k.startsWith(CUSTOM));
    for (const k of keys) {
      const row = read<CustomRow>(await kv.get(k));
      if (row && predicate(row)) await kv.del(k);
    }
  }

  return {
    async saveCoro(coro) {
      await kv.set(CORO + coro.id, JSON.stringify(coro));
    },
    async loadCoro(id) {
      return read<Coro>(await kv.get(CORO + id));
    },
    async listCoros() {
      const coros = await readAll<Coro>(CORO);
      return coros.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    async deleteCoro(id) {
      await kv.del(CORO + id);
      await sweepCustoms((r) => r.coroId === id);
    },
    async saveCustomPrompt(coroId, prompt) {
      await kv.set(CUSTOM + prompt.id, JSON.stringify({ coroId, prompt } satisfies CustomRow));
    },
    async listCustomPrompts(coroId) {
      const rows = await readAll<CustomRow>(CUSTOM);
      return rows.filter((r) => r.coroId === coroId).map((r) => r.prompt);
    },
    async deleteCustomPrompt(id) {
      await kv.del(CUSTOM + id);
    },
    async deleteCustomPrompts(coroId) {
      await sweepCustoms((r) => r.coroId === coroId);
    },
    async getSettings() {
      return read<Settings>(await kv.get(SETTINGS)) ?? DEFAULT_SETTINGS;
    },
    async saveSettings(settings) {
      await kv.set(SETTINGS, JSON.stringify(settings));
    },
  };
}
