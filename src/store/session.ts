import { SEED_PROMPTS } from "@/content/seed";
import {
    selectPrompt,
    shuffle,
    type Coro,
    type FilledPrompt,
    type Game,
    type Intensity,
    type Prompt,
    type PromptSource,
    type VRType,
} from "@/engine";
import { feel } from "@/lib/feel";
import { storage } from "@/lib/storage";
import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";

/** Yo Nunca deck source: factory + coro, only the coro's own, or only factory. */
export type YoNuncaMode = "mixto" | "solo" | "auto";

const YO_NUNCA_SOURCES: Record<YoNuncaMode, readonly PromptSource[] | undefined> = {
  mixto: undefined, // both
  solo: ["coro"],
  auto: ["fabrica"],
};

/** One Verdad o Reto outcome, for the final scoreboard. */
export interface VRResult {
  playerId: string;
  name: string;
  tipo: VRType; // what they were dealt: "verdad" | "reto"
  didIt: boolean; // "lo hizo" (true) | "Shot" / drank a shot (false)
}

/**
 * Verdad o Reto sub-phase: spin the roulette to land on whose turn it is, then
 * pick truth/dare, then play the card. The spin is ceremony between turns — the
 * night is the experience, not the speed.
 */
export type VRPhase = "spin" | "choose" | "play";

interface SessionState {
  coro: Coro | null;
  game: Game | null;
  intensity: Intensity;
  antiAwkward: boolean;
  shots: boolean; // "Shot" becomes "tomó un shot"
  yoNuncaMode: YoNuncaMode;

  deck: Prompt[]; // factory + this coro's custom prompts
  turnOrder: string[]; // player ids
  turnIndex: number;
  usedIds: Set<string>;
  round: number; // cards shown so far this game
  current: FilledPrompt | null;
  vrPhase: VRPhase;
  vrResults: VRResult[];

  // setup
  setCoro: (coro: Coro) => void;
  setGame: (game: Game) => void;
  setIntensity: (intensity: Intensity) => void;
  setAntiAwkward: (value: boolean) => void;
  setShots: (value: boolean) => void;
  setYoNuncaMode: (value: YoNuncaMode) => void;

  // lifecycle
  loadCustomPrompts: (coroId: string) => Promise<void>;
  beginGame: (game: Game) => void;
  drawNext: () => void;
  finishSpin: () => void;
  chooseVR: (tipo: VRType) => void;
  recordVR: (didIt: boolean) => void;
  skipTurn: () => void;
  addCustomPrompt: (texto: string, tipo?: VRType) => Promise<void>;
  resetGame: () => void;
}

export const useSession = create<SessionState>((set, get) => ({
  coro: null,
  game: null,
  intensity: "picante",
  antiAwkward: true,
  shots: false,
  yoNuncaMode: "mixto",

  deck: SEED_PROMPTS,
  turnOrder: [],
  turnIndex: 0,
  usedIds: new Set(),
  round: 0,
  current: null,
  vrPhase: "choose",
  vrResults: [],

  setCoro: (coro) => set({ coro }),
  setGame: (game) => set({ game }),
  setIntensity: (intensity) => set({ intensity }),
  setAntiAwkward: (antiAwkward) => set({ antiAwkward }),
  setShots: (shots) => set({ shots }),
  setYoNuncaMode: (yoNuncaMode) => set({ yoNuncaMode }),

  loadCustomPrompts: async (coroId) => {
    const custom = await storage.listCustomPrompts(coroId);
    set({ deck: [...SEED_PROMPTS, ...custom] });
  },

  beginGame: (game) => {
    const { coro } = get();
    const order = coro ? shuffle(coro.players.map((p) => p.id)) : [];
    set({
      game,
      turnOrder: order,
      turnIndex: 0,
      usedIds: new Set(),
      round: 0,
      current: null,
      // Verdad o Reto opens by spinning the roulette to pick who starts.
      vrPhase: game === "verdad-reto" ? "spin" : "choose",
      vrResults: [],
    });
    // The other games deal a card immediately.
    if (game !== "verdad-reto") get().drawNext();
  },

  finishSpin: () => set({ vrPhase: "choose" }),

  drawNext: () => {
    const { deck, game, intensity, antiAwkward, coro, turnOrder, turnIndex, usedIds, yoNuncaMode } =
      get();
    if (!game || !coro) return;

    const turnPlayerId = turnOrder[turnIndex % Math.max(turnOrder.length, 1)];
    const filled = selectPrompt(deck, {
      game,
      intensity,
      coro,
      turnPlayerId,
      antiAwkward,
      usedIds,
      sources: game === "yo-nunca" ? YO_NUNCA_SOURCES[yoNuncaMode] : undefined,
      // Yo Nunca runs the deck out (then a breather); the others loop.
      recycle: game !== "yo-nunca",
    });

    set((s) => ({
      current: filled,
      round: s.round + 1,
      usedIds: filled ? new Set(s.usedIds).add(filled.prompt.id) : s.usedIds,
    }));
  },

  chooseVR: (tipo) => {
    const { deck, intensity, antiAwkward, coro, turnOrder, turnIndex, usedIds } = get();
    if (!coro) return;
    feel("medium");

    const turnPlayerId = turnOrder[turnIndex % Math.max(turnOrder.length, 1)];
    const filled = selectPrompt(deck, {
      game: "verdad-reto",
      intensity,
      coro,
      tipo,
      turnPlayerId,
      antiAwkward,
      usedIds,
    });

    set((s) => ({
      current: filled,
      vrPhase: "play",
      round: s.round + 1,
      usedIds: filled ? new Set(s.usedIds).add(filled.prompt.id) : s.usedIds,
    }));
  },

  recordVR: (didIt) => {
    const { current, coro, turnOrder, turnIndex } = get();
    feel(didIt ? "medium" : "tick");

    if (current && coro) {
      const turnPlayerId = turnOrder[turnIndex % Math.max(turnOrder.length, 1)];
      const player = coro.players.find((p) => p.id === turnPlayerId);
      if (player) {
        const tipo = current.prompt.tipo ?? "reto";
        set((s) => ({
          vrResults: [
            ...s.vrResults,
            { playerId: player.id, name: player.name, tipo, didIt },
          ],
        }));
      }
    }

    // Open-ended: advance the turn and spin the roulette for the next person.
    // The session ends only when the coro taps "Salir" → the scoreboard.
    set((s) => ({ turnIndex: s.turnIndex + 1, current: null, vrPhase: "spin" }));
  },

  // Next person without recording an outcome (e.g. a tipo ran out of cards).
  skipTurn: () =>
    set((s) => ({ turnIndex: s.turnIndex + 1, current: null, vrPhase: "spin" })),

  addCustomPrompt: async (texto, tipo) => {
    const { coro, game, deck, intensity } = get();
    if (!coro || !game) return;
    const prompt: Prompt = {
      id: nanoid(),
      juego: game,
      texto,
      tag: texto.includes("[B]") ? "interactivo" : "neutral",
      // Yo Nunca customs are always eligible regardless of the intensity ceiling
      // (the coro owns their own content); VR customs honor the chosen level.
      intensidad: game === "yo-nunca" ? "suave" : intensity,
      fuente: "coro",
      tipo: game === "verdad-reto" ? (tipo ?? "reto") : undefined,
    };
    await storage.saveCustomPrompt(coro.id, prompt);
    feel("medium");
    set({ deck: [...deck, prompt] });
  },

  resetGame: () =>
    set({
      game: null,
      turnOrder: [],
      turnIndex: 0,
      usedIds: new Set(),
      round: 0,
      current: null,
      vrPhase: "choose",
      vrResults: [],
    }),
}));
