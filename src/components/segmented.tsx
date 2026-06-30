import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, DISPLAY_FONT } from '@/lib/tokens';

const PAD = 4;
const SLIDE = { stiffness: 600, damping: 34, mass: 0.7 } as const;

type Option<T extends string> = { value: T; label: string };

/** Switch-style segmented control: a solid pill slides under the selected option. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const [w, setW] = useState(0);
  const n = options.length;
  const segW = w > 0 ? (w - PAD * 2) / n : 0;
  const idx = Math.max(0, options.findIndex((o) => o.value === value));

  const x = useSharedValue(0);
  useEffect(() => {
    if (segW > 0) x.value = withSpring(PAD + idx * segW, SLIDE);
  }, [idx, segW, x]);
  const hl = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={{ flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: PAD }}
    >
      {segW > 0 ? (
        <Animated.View
          style={[
            { position: 'absolute', top: PAD, bottom: PAD, width: segW, borderRadius: 12, backgroundColor: COLORS.ink },
            hl,
          ]}
        />
      ) : null}
      {options.map((opt) => {
        const sel = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (!sel) {
                feel('tick');
                sound('tick');
                onChange(opt.value);
              }
            }}
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: 16,
                letterSpacing: -0.3,
                color: sel ? COLORS.canvas : COLORS.inkDim,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
