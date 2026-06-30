/*
  Pal Coro engine — domain types.
  Pure TypeScript, no React, no DOM. Extractable to a shared package for
  React Native later. This module owns the rules; the UI only renders them.
*/

export type Game = "verdad-reto" | "yo-nunca" | "quien-soy";

/** Within Verdad o Reto, a prompt is either a truth or a dare. */
export type VRType = "verdad" | "reto";

/** How a prompt routes people. */
export type PromptTag = "neutral" | "interactivo" | "picante" | "solo-pareja";

/** Intensity ladder. Selecting a level includes everything at or below it. */
export type Intensity = "suave" | "picante" | "sin-filtro";

export type PromptSource = "fabrica" | "coro";

/** The prompt as an object — the model that makes fine routing possible. */
export interface Prompt {
  id: string;
  juego: Game;
  /** Text with [A]/[B] placeholders. */
  texto: string;
  tag: PromptTag;
  intensidad: Intensity;
  fuente: PromptSource;
  /** Truth or dare — only meaningful for Verdad o Reto. */
  tipo?: VRType;
}

// --- The people: the real engine ---

export type Sexo = "f" | "m" | "x";
export type Orientacion = "hetero" | "gay" | "bi" | "otro";

export interface Player {
  id: string;
  name: string;
  /** Optional fine-routing layer. Never required, never shown to the coro. */
  sexo?: Sexo;
  orientacion?: Orientacion;
}

/** Two linked names. Spicy content respects who is with whom. */
export type Pair = [playerIdA: string, playerIdB: string];

/** Two NON-paired names the group wants to push together. */
export type Objetivo = [playerIdA: string, playerIdB: string];

export interface Coro {
  id: string;
  name: string;
  players: Player[];
  pairs: Pair[];
  objetivos: Objetivo[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  defaultIntensity: Intensity;
  antiAwkward: boolean;
  hapticsEnabled: boolean;
}

/** A prompt with its [A]/[B] placeholders resolved to real names. */
export interface FilledPrompt {
  prompt: Prompt;
  text: string;
  /** Names routed in, in [A], [B] order — for highlighting and the final card. */
  names: string[];
  /** Player ids used, same order as names. */
  playerIds: string[];
}
