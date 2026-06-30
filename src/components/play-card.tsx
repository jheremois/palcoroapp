import { type ReactNode } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ACCENTS, type Accent } from '@/lib/accents';
import { Pips } from './pips';
import { Stamp } from './stamp';
import { COLORS, DISPLAY_FONT, text } from '@/lib/tokens';

type PlayCardProps = {
  text: string;
  names?: string[];
  accent?: Accent;
  eyebrow?: string;
  turn?: string;
  step?: { current: number; total: number };
  footer?: ReactNode;
  cardKey?: string;
};

/** The card IS the screen: a solid color slab on a stacked deck, carrying one
 * enormous phrase. Routed names land in inverted print boxes. */
export function PlayCard({ text: body, names = [], accent = 'red', eyebrow, turn, step, footer, cardKey }: PlayCardProps) {
  const { face, on } = ACCENTS[accent];
  const { width } = useWindowDimensions();
  const fontSize = Math.min(Math.max(width * 0.115, 30), 52);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* The deck underneath — two offset slabs give the card depth */}
        <View style={{ position: 'absolute', left: 12, right: 12, top: 16, bottom: 4, borderRadius: 32, backgroundColor: COLORS.surface }} />
        <View style={{ position: 'absolute', left: 6, right: 6, top: 8, bottom: 8, borderRadius: 32, backgroundColor: COLORS.elevated }} />

        <Animated.View
          key={cardKey}
          entering={FadeInDown.springify().damping(26).mass(0.95)}
          style={{ flex: 1, backgroundColor: face, borderRadius: 32, padding: 24 }}
        >
          {eyebrow || step ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {eyebrow ? (
                <Stamp color={on} rotate={-5}>
                  {eyebrow}
                </Stamp>
              ) : (
                <View />
              )}
              {step ? <Pips current={step.current} total={step.total} tone="onColor" on={on} /> : null}
            </View>
          ) : null}

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
            <Text
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize,
                lineHeight: fontSize * 1.03,
                letterSpacing: -1,
                textAlign: 'center',
                color: on,
              }}
            >
              {highlight(body, names, face, on)}
            </Text>
          </View>

          {turn ? (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <Text style={[text.micro, { color: on, opacity: 0.7 }]}>Le toca a</Text>
              <Text
                style={{ fontFamily: DISPLAY_FONT, fontSize: 24, letterSpacing: -0.3, color: on, flexShrink: 1, textAlign: 'right' }}
                numberOfLines={1}
              >
                {turn}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </View>

      {footer ? <View style={{ marginTop: 16 }}>{footer}</View> : null}
    </View>
  );
}

/** Routed names as inverted print boxes (the `on` color, text in `face`). */
function highlight(body: string, names: string[], face: string, on: string): ReactNode {
  const clean = names.filter(Boolean);
  if (clean.length === 0) return body;
  const escaped = clean
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'g');
  return body.split(re).map((part, i) =>
    clean.includes(part) ? (
      <Text key={i} style={{ backgroundColor: on, color: face }}>
        {' '}
        {part}{' '}
      </Text>
    ) : (
      <Text key={i}>{part}</Text>
    ),
  );
}
