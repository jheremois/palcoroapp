import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ACCENTS, type Accent } from '@/lib/accents';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS } from '@/lib/tokens';

const SPRING = { stiffness: 700, damping: 30, mass: 0.6 } as const;

/** iOS-style switch: a white knob slides across an accent-filled track. */
export function Toggle({
  value,
  onChange,
  accent = 'green',
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  accent?: Accent;
}) {
  const x = useSharedValue(value ? 20 : 0);
  useEffect(() => {
    x.value = withSpring(value ? 20 : 0, SPRING);
  }, [value, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable
      onPress={() => {
        feel('tick');
        sound('tick');
        onChange(!value);
      }}
      style={{
        width: 52,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        backgroundColor: value ? ACCENTS[accent].face : COLORS.separator,
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 4,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#ffffff',
          },
          knob,
        ]}
      />
    </Pressable>
  );
}
