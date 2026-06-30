import type { Coro, FilledPrompt, Player, Prompt } from "./types";
import { pickOne, type Rng } from "./shuffle";

export interface RouteOptions {
  /** Anchor [A] to whoever's turn it is, so prompts feel personal. */
  turnPlayerId?: string;
  /** When on, spicy content stays within pairs/objetivos — no random awkward pairing. */
  antiAwkward: boolean;
  rng?: Rng;
}

function partnerOf(coro: Coro, playerId: string): string | undefined {
  for (const [a, b] of coro.pairs) {
    if (a === playerId) return b;
    if (b === playerId) return a;
  }
  return undefined;
}

function objetivoPartnersOf(coro: Coro, playerId: string): string[] {
  const out: string[] = [];
  for (const [a, b] of coro.objetivos) {
    if (a === playerId) out.push(b);
    else if (b === playerId) out.push(a);
  }
  return out;
}

const needsPlaceholder = (text: string, token: "[A]" | "[B]") => text.includes(token);

/**
 * Resolve a prompt's [A]/[B] placeholders to real people, respecting the coro,
 * pairs, objetivos and anti-awkward. Returns null when the prompt cannot be
 * routed for this coro (the selector then tries another prompt).
 */
export function fillPrompt(
  prompt: Prompt,
  coro: Coro,
  opts: RouteOptions,
): FilledPrompt | null {
  const { turnPlayerId, antiAwkward, rng = Math.random } = opts;
  const byId = new Map(coro.players.map((p) => [p.id, p] as const));
  if (coro.players.length === 0) return null;

  // A coro-authored prompt that names specific people is pinned to them: it can
  // only come out on a mentioned person's turn (factory prompts use [A]/[B], so
  // they never literally contain a coro member's name).
  if (prompt.fuente === "coro") {
    const mentioned = coro.players.filter((p) => prompt.texto.includes(p.name));
    if (
      mentioned.length > 0 &&
      turnPlayerId &&
      !mentioned.some((p) => p.id === turnPlayerId)
    ) {
      return null;
    }
  }

  // [A] is the turn player when we have one, otherwise random.
  const a =
    (turnPlayerId && byId.get(turnPlayerId)) || pickOne(coro.players, rng);
  if (!a) return null;

  // Collect highlight names from the final text: every coro member whose name
  // literally appears (covers [A]/[B] substitutions AND targeted custom names).
  const finish = (text: string): FilledPrompt => {
    const present = coro.players.filter((p) => text.includes(p.name));
    return {
      prompt,
      text,
      names: present.map((p) => p.name),
      playerIds: present.map((p) => p.id),
    };
  };

  const needsB = needsPlaceholder(prompt.texto, "[B]");
  if (!needsB) {
    return finish(prompt.texto.replaceAll("[A]", a.name));
  }

  const others = coro.players.filter((p) => p.id !== a.id);
  if (others.length === 0) return null;

  let b: Player | undefined;
  switch (prompt.tag) {
    case "solo-pareja": {
      const partnerId = partnerOf(coro, a.id);
      b = partnerId ? byId.get(partnerId) : undefined;
      break;
    }
    case "picante": {
      if (antiAwkward) {
        // Keep it inside the relationships the group already declared.
        const partnerId = partnerOf(coro, a.id);
        const candidateIds = [
          ...(partnerId ? [partnerId] : []),
          ...objetivoPartnersOf(coro, a.id),
        ];
        const candidates = candidateIds
          .map((id) => byId.get(id))
          .filter((p): p is Player => Boolean(p));
        b = pickOne(candidates, rng);
      } else {
        b = pickOne(others, rng);
      }
      break;
    }
    case "interactivo":
    case "neutral":
    default:
      b = pickOne(others, rng);
      break;
  }

  if (!b) return null;

  return finish(prompt.texto.replaceAll("[A]", a.name).replaceAll("[B]", b.name));
}
