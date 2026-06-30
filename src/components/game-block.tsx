import { Pressable, Text } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ACCENTS, type Accent } from '@/lib/accents';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { text } from '@/lib/tokens';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

/** A large solid print slab — one game per block, color from the official palette. */
export function GameBlock({
  title,
  tagline,
  accent,
  index,
  onPress,
  dimmed = false,
  delay = 0,
}: {
  title: string;
  tagline?: string;
  accent: Accent;
  index?: string;
  onPress?: () => void;
  dimmed?: boolean;
  delay?: number;
}) {
  const { face, on } = ACCENTS[accent];
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: dimmed ? 0.4 : 1,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(400).springify().delay(delay)} style={{ flex: 1 }}>
      <AnimPressable
        onPressIn={() => {
          scale.value = withSpring(0.97, { stiffness: 900, damping: 26 });
          feel('medium');
          sound('pop');
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { stiffness: 600, damping: 15 });
        }}
        onPress={onPress}
        style={[
          { flex: 1, backgroundColor: face, borderRadius: 24, padding: 24, justifyContent: 'flex-end', overflow: 'hidden' },
          aStyle,
        ]}
      >
        {index ? (
          <Text style={[text.micro, { position: 'absolute', right: 20, top: 20, color: on, opacity: 0.7 }]}>
            {index}
          </Text>
        ) : null}
        <Text style={[text.slab, { color: on, fontSize: 38, lineHeight: 39 }]}>{title}</Text>
        {tagline ? (
          <Text style={{ marginTop: 12, fontSize: 14, fontWeight: '500', color: on, opacity: 0.8, maxWidth: '80%' }}>
            {tagline}
          </Text>
        ) : null}
      </AnimPressable>
    </Animated.View>
  );
}
