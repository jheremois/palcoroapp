import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Toggle } from './toggle';
import type { Accent } from '@/lib/accents';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, text } from '@/lib/tokens';

/** A labelled setting with an iOS switch and a tap-to-reveal info line. */
export function SettingToggle({
  label,
  info,
  value,
  onChange,
  accent = 'green',
}: {
  label: string;
  info: string;
  value: boolean;
  onChange: (value: boolean) => void;
  accent?: Accent;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={text.label}>{label}</Text>
          <Pressable
            hitSlop={8}
            onPress={() => {
              setOpen((o) => !o);
              feel('tick');
              sound('tick');
            }}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: open ? COLORS.ink : COLORS.separator,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: open ? COLORS.ink : COLORS.inkDim }}>?</Text>
          </Pressable>
        </View>
        <Toggle value={value} onChange={onChange} accent={accent} />
      </View>

      {open ? (
        <Animated.View entering={FadeIn.duration(160)}>
          <Text style={[text.body, { paddingTop: 12 }]}>{info}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
