import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, text } from '@/lib/tokens';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

/** A person in the coro. New chips drop in with weight; selection grows it. */
export function NameChip({
  name,
  onPress,
  selected = false,
  relation,
  editable = false,
}: {
  name: string;
  onPress?: () => void;
  selected?: boolean;
  relation?: string;
  editable?: boolean;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSpring(selected ? 1.06 : 1, { stiffness: 700, damping: 24 });
  }, [selected, scale]);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).mass(1)}
      layout={LinearTransition.springify()}
    >
      <AnimPressable
        onPress={onPress}
        onPressIn={() => {
          feel('tick');
          sound('tick');
        }}
        style={[
          {
            borderRadius: 16,
            paddingVertical: 12,
            paddingLeft: 16,
            paddingRight: 36,
            backgroundColor: selected ? COLORS.ink : COLORS.elevated,
            borderWidth: selected ? 0 : 1,
            borderColor: COLORS.separator,
          },
          aStyle,
        ]}
      >
        {editable ? (
          <Text
            style={{
              position: 'absolute',
              right: 12,
              top: 8,
              fontSize: 18,
              fontWeight: '700',
              color: selected ? 'rgba(0,0,0,0.5)' : COLORS.inkFaint,
            }}
          >
            ···
          </Text>
        ) : null}
        <Text style={[text.cardName, { fontSize: 20, color: selected ? COLORS.canvas : COLORS.ink }]}>
          {name}
        </Text>
        <Text style={[text.micro, { marginTop: 2, color: selected ? 'rgba(0,0,0,0.6)' : COLORS.inkDim }]}>
          {relation ?? "toca pa' editar"}
        </Text>
      </AnimPressable>
    </Animated.View>
  );
}
