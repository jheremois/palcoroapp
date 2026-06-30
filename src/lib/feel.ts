import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/*
  feel() — the haptic vocabulary for Pal Coro (RN port of the web helper).
  Visual feedback is always primary; haptics degrade silently where unavailable
  (web, unsupported devices). Few, consistent weights.
*/
export type FeelType = "tick" | "medium" | "heavy" | "pattern";

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function feel(type: FeelType = "tick"): void {
  if (!enabled || Platform.OS === "web") return;
  try {
    switch (type) {
      case "tick":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "pattern":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  } catch {
    // Degrade silently — visual feedback already covered the interaction.
  }
}
