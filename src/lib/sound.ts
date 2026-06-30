import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

/*
  sound() — UI sound effects (RN). The bonus layer in the feedback hierarchy:
  visual first, haptic second, sound third. Mixes with the user's music and
  respects the silent switch, so it never intrudes. Degrades silently.

  Placeholder .wav files live in assets/sounds — swap them for designed sounds.
*/
export type SoundType = "tick" | "pop";

const SOURCES: Record<SoundType, number> = {
  tick: require("../../assets/sounds/tick.wav"),
  pop: require("../../assets/sounds/pop.wav"),
};

let enabled = true;
const players: Partial<Record<SoundType, AudioPlayer>> = {};
let ready = false;

function init() {
  if (ready || Platform.OS === "web") return;
  ready = true;
  setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: "mixWithOthers",
  }).catch(() => {});
  (Object.keys(SOURCES) as SoundType[]).forEach((k) => {
    try {
      players[k] = createAudioPlayer(SOURCES[k]);
    } catch {
      // ignore — sound is a bonus
    }
  });
}
init();

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export function sound(type: SoundType): void {
  if (!enabled || Platform.OS === "web") return;
  const p = players[type];
  if (!p) return;
  try {
    // Restart from the top so rapid taps each click.
    p.seekTo(0)
      .then(() => p.play())
      .catch(() => p.play());
  } catch {
    // Degrade silently.
  }
}
