import { type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/lib/tokens';

/**
 * Full-screen scaffold — owns the edge margins (safe-area + a generous inset)
 * and the dark canvas, so screens only describe their inner layout. RN port of
 * the web <Screen>. Pass `bleed` for screens that go edge to edge.
 */
export function Screen({
  children,
  className,
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={`flex-1 ${bleed ? '' : 'px-6'} ${className ?? ''}`}
      style={{
        backgroundColor: COLORS.canvas,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      {children}
    </View>
  );
}
