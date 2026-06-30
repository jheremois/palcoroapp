import { Text, View } from 'react-native';

import { COLORS, text } from '@/lib/tokens';

/** Tiny uppercase tracked label — the editorial signature. */
export function MicroLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return <Text style={[text.micro, color ? { color } : null]}>{children}</Text>;
}

/** Hairline divider. */
export function Hairline({ style }: { style?: object }) {
  return <View style={[{ height: 1, backgroundColor: COLORS.separator }, style]} />;
}
