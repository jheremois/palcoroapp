/** @type {import('tailwindcss').Config} */
// Pal Coro design tokens, ported from the web (src/styles/globals.css).
// Editorial discipline over a native iOS dark canvas — the four official colors
// plus iOS dark surfaces and text. Keep this the single source of brand tokens.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Surfaces (iOS dark, real system values)
        canvas: "#000000",
        surface: "#1c1c1e",
        elevated: "#2c2c2e",
        separator: "#38383a",
        // Text (solid iOS-safe equivalents of the secondary/tertiary labels)
        ink: "#ffffff",
        "ink-dim": "#8e8e93",
        "ink-faint": "#48484a",
        // The four official accents
        blue: "#00b6ff",
        purple: "#cb9fd2",
        green: "#24cb71",
        red: "#ff3737",
      },
      fontFamily: {
        // Loaded via @expo-google-fonts/space-grotesk at app start.
        display: ["SpaceGrotesk_700Bold"],
        "display-medium": ["SpaceGrotesk_500Medium"],
        "display-regular": ["SpaceGrotesk_400Regular"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
