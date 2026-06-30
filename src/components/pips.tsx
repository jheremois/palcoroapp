import { View } from 'react-native';

import { ACCENTS, type Accent } from '@/lib/accents';
import { COLORS } from '@/lib/tokens';

/** Segmented progress — thin print bars instead of a ring or spinner. */
export function Pips({
  current,
  total,
  tone = 'onDark',
  accent = 'red',
  on = '#ffffff',
}: {
  current: number;
  total: number;
  tone?: 'onColor' | 'onDark';
  accent?: Accent;
  on?: string;
}) {
  const filled = tone === 'onColor' ? on : ACCENTS[accent].face;
  const track = tone === 'onColor' ? `${on}47` : COLORS.separator;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 4,
            width: 10,
            borderRadius: 2,
            backgroundColor: i < current ? filled : track,
          }}
        />
      ))}
    </View>
  );
}
