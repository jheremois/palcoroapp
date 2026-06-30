import { type Href, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, text } from '@/lib/tokens';

/** Text-only back affordance (no stock icons). Defaults to history; pass `to`
 * for an explicit destination. */
export function BackButton({ to, label = 'Volver' }: { to?: Href; label?: string }) {
  const router = useRouter();
  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        feel('tick');
        sound('tick');
        if (to) router.push(to);
        else router.back();
      }}
      style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12 }}
    >
      <Text style={[text.micro, { color: COLORS.inkDim }]}>← {label}</Text>
    </Pressable>
  );
}
