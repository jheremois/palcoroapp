import type { Coro, Prompt, Settings } from "@/engine/types";

/*
  Storage adapter interface. The game never talks to a database directly —
  it talks to this. Web uses Dexie/IndexedDB; swap the implementation for
  MMKV/SQLite on React Native and the engine and UI stay untouched.
  Everything stays on-device. Nothing leaves the phone.
*/
export interface StorageAdapter {
  // Coros
  saveCoro(coro: Coro): Promise<void>;
  loadCoro(id: string): Promise<Coro | undefined>;
  listCoros(): Promise<Coro[]>;
  deleteCoro(id: string): Promise<void>;

  // Custom prompts (the coro's own content, local and private to that coro)
  saveCustomPrompt(coroId: string, prompt: Prompt): Promise<void>;
  listCustomPrompts(coroId: string): Promise<Prompt[]>;
  deleteCustomPrompt(id: string): Promise<void>;
  deleteCustomPrompts(coroId: string): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultIntensity: "picante",
  antiAwkward: true,
  hapticsEnabled: true,
};
