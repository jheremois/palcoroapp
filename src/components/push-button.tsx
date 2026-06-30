import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ACCENTS, lipColor, type Accent } from '@/lib/accents';
import { feel, type FeelType } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, text } from '@/lib/tokens';

const LIP = 8;
const FACE_H = 60;
const RADIUS = 16;
const PRESS = { stiffness: 1100, damping: 32, mass: 0.6 } as const;
const RELEASE = { stiffness: 650, damping: 15, mass: 0.7 } as const;

/**
 * Pushable button (Duolingo-style): a solid face over a darker lip — a real key
 * that drops into the lip on press and springs back, with a haptic + click.
 */
export function PushButton({
  label,
  accent = 'blue',
  variant = 'solid',
  onPress,
  disabled = false,
  haptic = 'medium',
}: {
  label: string;
  accent?: Accent;
  variant?: 'solid' | 'soft';
  onPress?: () => void;
  disabled?: boolean;
  haptic?: FeelType;
}) {
  const solid = variant === 'solid';
  const face = solid ? ACCENTS[accent].face : COLORS.elevated;
  const on = solid ? ACCENTS[accent].on : COLORS.ink;
  const lip = solid ? lipColor(ACCENTS[accent].face) : COLORS.surface;

  const y = useSharedValue(0);
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        if (disabled) return;
        y.value = withSpring(LIP, PRESS);
        feel(haptic);
        sound(haptic === 'tick' ? 'tick' : 'pop');
      }}
      onPressOut={() => {
        if (disabled) return;
        y.value = withSpring(0, RELEASE);
      }}
      onPress={disabled ? undefined : onPress}
      style={{ height: FACE_H + LIP, opacity: disabled ? 0.4 : 1 }}
    >
      <View
        style={{ position: 'absolute', top: LIP, left: 0, right: 0, height: FACE_H, backgroundColor: lip, borderRadius: RADIUS }}
      />
      <Animated.View
        style={[
          {
            height: FACE_H,
            backgroundColor: face,
            borderRadius: RADIUS,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          },
          faceStyle,
        ]}
      >
        <Text style={[text.button, { color: on }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
