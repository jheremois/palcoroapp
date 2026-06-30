// Pal Coro's four official colors (ported from web). The whole UI draws only
// from these. `face` is the block color; `on` is readable text on that block.
export type Accent = "blue" | "purple" | "green" | "red";

export const ACCENTS: Record<Accent, { face: string; on: string }> = {
  blue: { face: "#00b6ff", on: "#000000" },
  purple: { face: "#cb9fd2", on: "#000000" },
  green: { face: "#24cb71", on: "#000000" },
  red: { face: "#ff3737", on: "#ffffff" },
};

/** Darker "lip" shade for the pushable (Duolingo-style) key effect. */
export function lipColor(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.round(((n >> 16) & 255) * 0.72);
  const g = Math.round(((n >> 8) & 255) * 0.72);
  const b = Math.round((n & 255) * 0.72);
  return `rgb(${r}, ${g}, ${b})`;
}
