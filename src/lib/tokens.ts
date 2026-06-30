import { StyleSheet } from "react-native";

/*
  Design tokens as plain values + RN text styles. Text color/spacing/family are
  applied via `style` (not NativeWind className) because className text styles
  don't apply reliably on iOS. Display styles use Space Grotesk (loaded at
  startup); system styles use weights. When a font family is set we omit
  fontWeight (Android resolves the weight from the family name).
*/
export const COLORS = {
  canvas: "#000000",
  surface: "#1c1c1e",
  elevated: "#2c2c2e",
  separator: "#38383a",
  ink: "#ffffff",
  inkDim: "#8e8e93",
  inkFaint: "#48484a",
  blue: "#00b6ff",
  purple: "#cb9fd2",
  green: "#24cb71",
  red: "#ff3737",
} as const;

const DISPLAY = "SpaceGrotesk_700Bold";

export const text = StyleSheet.create({
  // Tiny tracked uppercase label — the editorial signature.
  micro: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: COLORS.inkDim,
  },
  // Step number "03 / 10".
  step: {
    fontFamily: DISPLAY,
    fontSize: 13,
    letterSpacing: 2,
    color: COLORS.inkDim,
  },
  // Screen title.
  h1: {
    fontFamily: DISPLAY,
    fontSize: 40,
    lineHeight: 38,
    letterSpacing: -1.2,
    color: COLORS.ink,
  },
  // Sheet / section title.
  h3: {
    fontFamily: DISPLAY,
    fontSize: 30,
    letterSpacing: -0.6,
    color: COLORS.ink,
  },
  // Big solid-block label (game blocks, intensity, choices).
  slab: {
    fontFamily: DISPLAY,
    fontSize: 40,
    letterSpacing: -1,
    textTransform: "uppercase",
    color: COLORS.ink,
  },
  // Coro card / chip name.
  cardName: {
    fontFamily: DISPLAY,
    fontSize: 22,
    letterSpacing: -0.3,
    color: COLORS.ink,
  },
  // Body copy (sheet info, empty states).
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.inkDim,
  },
  // Semibold label on a surface (toggles, etc.).
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.ink,
  },
  dots: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 20,
    color: COLORS.inkDim,
  },
  button: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

/** Space Grotesk family name, for inline display text that needs a custom size. */
export const DISPLAY_FONT = DISPLAY;
