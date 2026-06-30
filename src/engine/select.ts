import type {
  Coro,
  FilledPrompt,
  Game,
  Intensity,
  Prompt,
  PromptSource,
  VRType,
} from "./types";
import { fillPrompt, type RouteOptions } from "./routing";
import { shuffle, type Rng } from "./shuffle";

const INTENSITY_RANK: Record<Intensity, number> = {
  suave: 0,
  picante: 1,
  "sin-filtro": 2,
};

/** Selecting a level includes every prompt at or below it on the ladder. */
function withinIntensity(promptLevel: Intensity, ceiling: Intensity): boolean {
  return INTENSITY_RANK[promptLevel] <= INTENSITY_RANK[ceiling];
}

export interface SelectOptions extends RouteOptions {
  game: Game;
  intensity: Intensity;
  coro: Coro;
  /** Restrict to truths or dares (Verdad o Reto). */
  tipo?: VRType;
  /** Restrict to factory and/or coro content (Yo Nunca deck modes). */
  sources?: readonly PromptSource[];
  /** Prompt ids already played this session — avoided until the pool is exhausted. */
  usedIds?: ReadonlySet<string>;
  /** When false, return null once every prompt has been seen instead of looping
   * back (Yo Nunca runs the deck out, then offers a breather). Default true. */
  recycle?: boolean;
  rng?: Rng;
}

/**
 * Pick the next playable prompt for the current game, intensity and coro.
 * The coro's own prompts weigh a little more. Returns null only when no prompt
 * in the deck can be routed for this coro at all.
 */
export function selectPrompt(deck: readonly Prompt[], opts: SelectOptions): FilledPrompt | null {
  const { game, intensity, coro, tipo, sources, usedIds, recycle = true, rng = Math.random } =
    opts;

  const eligible = deck.filter(
    (p) =>
      p.juego === game &&
      withinIntensity(p.intensidad, intensity) &&
      (tipo ? p.tipo === tipo : true) &&
      (!sources || sources.includes(p.fuente)),
  );

  // Prefer prompts not yet seen this session. When exhausted, either loop back
  // to the full pool (default) or signal "run out" by leaving the pool empty.
  const fresh = usedIds ? eligible.filter((p) => !usedIds.has(p.id)) : eligible;
  const pool = fresh.length > 0 ? fresh : recycle ? eligible : [];

  // Shuffle, then nudge the coro's own prompts toward the front.
  const ordered = shuffle(pool, rng).sort((a, b) => weight(b) - weight(a));

  for (const prompt of ordered) {
    const filled = fillPrompt(prompt, coro, opts);
    if (filled) return filled;
  }
  return null;
}

/** Small bias so coro-authored content surfaces a bit more than factory. */
function weight(p: Prompt): number {
  return p.fuente === "coro" ? 1 : 0;
}
