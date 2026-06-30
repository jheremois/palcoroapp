import type { Player } from "./types";

/** playerId -> points. */
export type Scoreboard = Record<string, number>;

export function emptyScoreboard(players: Player[]): Scoreboard {
  return Object.fromEntries(players.map((p) => [p.id, 0]));
}

function add(board: Scoreboard, playerId: string, points: number): Scoreboard {
  return { ...board, [playerId]: (board[playerId] ?? 0) + points };
}

// --- ¿Quién Soy? ---
// The scoring fixes the incentive: you win when they guess you, so it pays to
// perform. Actor +2 when guessed; first guesser +1; nobody guesses → zero for all.

export interface QuienSoyTurn {
  actorId: string;
  /** Who guessed first, or null if nobody did. */
  firstGuesserId: string | null;
}

export function applyQuienSoyTurn(board: Scoreboard, turn: QuienSoyTurn): Scoreboard {
  if (turn.firstGuesserId === null) return board; // zero penalizes hiding
  let next = add(board, turn.actorId, 2);
  next = add(next, turn.firstGuesserId, 1);
  return next;
}

export const QUIEN_SOY_ROUNDS = 3;

// --- Yo Nunca Nunca ---
// The app never collects answers; people react in the open. Counting is optional
// and only feeds the final card ("el más santo / el más sucio de la noche").

export function tallyYoNunca(board: Scoreboard, playerIds: string[]): Scoreboard {
  // Each tallied player "lo hizo" once → +1 toward the final card.
  return playerIds.reduce((acc, id) => add(acc, id, 1), board);
}

// --- Final-card helpers ---

export interface Ranked {
  playerId: string;
  points: number;
}

export function ranking(board: Scoreboard): Ranked[] {
  return Object.entries(board)
    .map(([playerId, points]) => ({ playerId, points }))
    .sort((a, b) => b.points - a.points);
}

export function leader(board: Scoreboard): Ranked | undefined {
  return ranking(board)[0];
}
