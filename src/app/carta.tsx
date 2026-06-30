import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useRef } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { PushButton } from '@/components/push-button';
import { Screen } from '@/components/screen';
import { Stamp } from '@/components/stamp';
import { MicroLabel } from '@/components/ui';
import { ACCENTS } from '@/lib/accents';
import { feel } from '@/lib/feel';
import { COLORS, DISPLAY_FONT, text } from '@/lib/tokens';
import { useSession, type VRResult } from '@/store/session';

interface Row {
  playerId: string;
  name: string;
  retos: number;
  verdades: number;
  fallos: number;
  cumplio: number;
}

function tally(results: VRResult[]) {
  const map = new Map<string, Row>();
  for (const r of results) {
    const e =
      map.get(r.playerId) ??
      { playerId: r.playerId, name: r.name, retos: 0, verdades: 0, fallos: 0, cumplio: 0 };
    if (r.didIt) {
      if (r.tipo === 'reto') e.retos += 1;
      else e.verdades += 1;
      e.cumplio += 1;
    } else {
      e.fallos += 1;
    }
    map.set(r.playerId, e);
  }
  const rows = [...map.values()].sort((a, b) => b.cumplio - a.cumplio || b.fallos - a.fallos);
  const maxBy = (key: 'retos' | 'verdades' | 'fallos'): Row | null => {
    let best: Row | null = null;
    for (const r of rows) if (r[key] > 0 && (!best || r[key] > best[key])) best = r;
    return best;
  };
  return { rows, masRetos: maxBy('retos'), masVerdades: maxBy('verdades'), masFallos: maxBy('fallos'), total: results.length };
}

export default function FinalCard() {
  const router = useRouter();
  const coro = useSession((s) => s.coro);
  const shots = useSession((s) => s.shots);
  const vrResults = useSession((s) => s.vrResults);
  const { width } = useWindowDimensions();

  const cardRef = useRef<View>(null);
  const stats = useMemo(() => tally(vrResults), [vrResults]);
  const accent = ACCENTS.red;
  const on = accent.on;

  const failLabel = shots ? 'Más shots' : 'Más rajao';
  const failTail = (n: number) => (shots ? `shots ${n}` : `Shots ${n}`);

  useEffect(() => {
    if (!coro) router.replace('/');
  }, [coro, router]);

  if (!coro) return null;
  const hero = stats.rows[0];
  const heroSize = Math.min(width * 0.16, 72);

  const share = async () => {
    feel('heavy');
    try {
      // Lazy: react-native-view-shot is a native module (works in a dev build;
      // gracefully unavailable inside Expo Go).
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { captureRef } = require('react-native-view-shot');
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: coro.name });
      }
    } catch {
      // Sharing is best-effort — never blocks the night.
    }
  };

  const keepPlaying = () => {
    feel('medium');
    router.push('/verdad-reto');
  };

  return (
    <Screen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        <View ref={cardRef} collapsable={false} style={{ backgroundColor: accent.face, borderRadius: 32, padding: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <Stamp color={on}>{coro.name}</Stamp>
            {stats.total > 0 ? (
              <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 30, color: on, opacity: 0.9 }}>{stats.total}</Text>
            ) : null}
          </View>

          {hero ? (
            <>
              <View style={{ marginTop: 24 }}>
                <Text style={[text.micro, { color: on, opacity: 0.7 }]}>El más lanzao de la noche</Text>
                <Text style={{ fontFamily: DISPLAY_FONT, fontSize: heroSize, lineHeight: heroSize * 0.92, letterSpacing: -1.5, textTransform: 'uppercase', color: on, marginTop: 4 }}>
                  {hero.name}
                </Text>
                <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: on, opacity: 0.85, marginTop: 8 }}>
                  cumplió {hero.cumplio} · {failTail(hero.fallos)}
                </Text>
              </View>

              <View style={{ marginTop: 24, gap: 8, borderTopWidth: 1, borderColor: on, paddingTop: 20 }}>
                <Leader label="Más retos" row={stats.masRetos} value={(r) => r.retos} on={on} />
                <Leader label="Más verdades" row={stats.masVerdades} value={(r) => r.verdades} on={on} />
                <Leader label={failLabel} row={stats.masFallos} value={(r) => r.fallos} on={on} />
              </View>

              <View style={{ marginTop: 20, gap: 8, borderTopWidth: 1, borderColor: on, paddingTop: 20 }}>
                {stats.rows.map((r, i) => (
                  <View key={r.playerId} style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flex: 1 }}>
                      <Text style={[text.micro, { color: on, opacity: 0.6 }]}>{String(i + 1).padStart(2, '0')}</Text>
                      <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 20, letterSpacing: -0.3, color: on }} numberOfLines={1}>
                        {r.name}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 14, color: on, opacity: 0.85 }}>
                      cumplió {r.cumplio} · {failTail(r.fallos)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 36, lineHeight: 34, textTransform: 'uppercase', color: on, marginTop: 24 }}>
              Esta junta no terminó.
            </Text>
          )}

          <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 16, color: on, opacity: 0.7, marginTop: 24 }}>Pal Coro</Text>
        </View>
      </ScrollView>

      <View style={{ marginTop: 16, gap: 12 }}>
        <PushButton accent="blue" label="Compartir" onPress={share} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <PushButton variant="soft" label="Seguir jugando" onPress={keepPlaying} />
          </View>
          <View style={{ flex: 1 }}>
            <PushButton variant="soft" label="Volver al coro" onPress={() => router.push('/jugar')} />
          </View>
        </View>
      </View>

      <View style={{ marginTop: 12, alignItems: 'center' }}>
        <MicroLabel color={COLORS.inkFaint}>La carta se arma en tu teléfono. Nada se sube.</MicroLabel>
      </View>
    </Screen>
  );
}

function Leader({ label, row, value, on }: { label: string; row: Row | null; value: (r: Row) => number; on: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
      <Text style={[text.micro, { color: on, opacity: 0.7 }]}>{label}</Text>
      <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 18, letterSpacing: -0.3, color: on }}>
        {row ? `${row.name} · ${value(row)}` : '—'}
      </Text>
    </View>
  );
}
