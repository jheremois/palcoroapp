import { useEffect, useMemo, useRef } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ACCENTS, type Accent } from '@/lib/accents';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, DISPLAY_FONT } from '@/lib/tokens';

const VISIBLE = 3;
const SPIN_ROWS = 28;
const H = Dimensions.get('window').height;
const ROW_H = Math.max(108, Math.min(Math.round(H * 0.15), 175));

function buildStrip(names: string[], target: string) {
  const pool = names.length > 0 ? names : [target];
  const pick = (avoid: string) => {
    const choices = pool.filter((n) => n !== avoid);
    return choices[Math.floor(Math.random() * choices.length)] ?? pool[0];
  };
  const strip: string[] = [];
  let last = '';
  for (let i = 0; i < SPIN_ROWS; i++) {
    const n = pick(last);
    strip.push(n);
    last = n;
  }
  if (pool.length > 1 && strip[strip.length - 1] === target) {
    strip[strip.length - 1] = pick(target);
  }
  const targetRow = strip.length;
  strip.push(target);
  strip.push(pick(target));
  return { strip, targetRow };
}

/**
 * A classic jackpot reel: a window of three names, the strip scrolling fast,
 * decelerating, ticking name by name, then landing on the winner at the payline
 * with a "ka-chunk" bounce. The turn change made into a moment.
 */
export function SlotReel({
  names,
  target,
  accent = 'red',
  onDone,
}: {
  names: string[];
  target: string;
  accent?: Accent;
  onDone: () => void;
}) {
  const { face } = ACCENTS[accent];
  const { strip, targetRow } = useMemo(() => buildStrip(names, target), [names, target]);
  const y = useSharedValue(0);
  const started = useRef(false);
  const lastRow = useRef(0);
  const lastTickAt = useRef(0);

  const tickJS = () => {
    const now = Date.now();
    if (now - lastTickAt.current > 45) {
      lastTickAt.current = now;
      feel('tick');
    }
  };

  const land = () => {
    feel('heavy');
    sound('pop');
    onDone();
  };

  // Tick as each name crosses the payline.
  useAnimatedReaction(
    () => y.value,
    (v) => {
      const row = Math.round(-v / ROW_H);
      if (row !== lastRow.current) {
        lastRow.current = row;
        runOnJS(tickJS)();
      }
    },
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const final = -(targetRow - 1) * ROW_H;
    const past = final - ROW_H * 0.16;
    y.value = withTiming(
      past,
      { duration: 2600, easing: Easing.bezier(0.1, 0.78, 0.2, 1) },
      (finished) => {
        if (finished) {
          y.value = withSpring(final, { stiffness: 700, damping: 16 }, (f2) => {
            if (f2) runOnJS(land)();
          });
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stripStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View
        style={{
          height: ROW_H * VISIBLE,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 24,
          backgroundColor: COLORS.elevated,
        }}
      >
        <Animated.View style={stripStyle}>
          {strip.map((name, i) => (
            <View key={i} style={{ height: ROW_H, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <Text
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontSize: 46,
                  letterSpacing: -1,
                  textTransform: 'uppercase',
                  color: COLORS.ink,
                }}
                numberOfLines={1}
              >
                {name}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Payline — accent hairlines mark the winning row */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: ROW_H,
          marginTop: -ROW_H / 2,
          borderTopWidth: 2,
          borderBottomWidth: 2,
          borderColor: face,
        }}
      />
    </View>
  );
}
