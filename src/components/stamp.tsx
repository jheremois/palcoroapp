import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { ACCENTS, type Accent } from '@/lib/accents';
import { COLORS, text } from '@/lib/tokens';

/**
 * A rotated, outlined poster stamp — a hairline box with tracked caps, tilted.
 * Used for intensity tags, eyebrows and brand marks. No fill, no glow.
 */
export function Stamp({
  children,
  accent,
  color,
  rotate = -4,
}: {
  children: ReactNode;
  accent?: Accent;
  color?: string;
  rotate?: number;
}) {
  const ink = color ?? (accent ? ACCENTS[accent].face : COLORS.ink);
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderWidth: 2,
        borderColor: ink,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        transform: [{ rotate: `${rotate}deg` }],
      }}
    >
      <Text style={[text.micro, { color: ink }]}>{children}</Text>
    </View>
  );
}
