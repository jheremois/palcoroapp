import { localAdapter } from "./kv";
import type { StorageAdapter } from "./types";

// The active adapter (expo-sqlite, Expo Go friendly). Swapping platforms or
// engines = swapping this line.
export const storage: StorageAdapter = localAdapter;

export { DEFAULT_SETTINGS } from "./types";
export type { StorageAdapter } from "./types";
