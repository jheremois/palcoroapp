import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PlayCard } from '@/components/play-card';
import { PushButton } from '@/components/push-button';
import { Screen } from '@/components/screen';
import { MicroLabel } from '@/components/ui';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, text } from '@/lib/tokens';
import { useSession } from '@/store/session';

/** ¿Quién Soy? — preliminary: runs on the shared engine (SEED preset characters).
 * The reveal roulette, timer and Puntos scoring wire up next. */
export default function QuienSoy() {
  const router = useRouter();
  const coro = useSession((s) => s.coro);
  const current = useSession((s) => s.current);
  const beginGame = useSession((s) => s.beginGame);
  const drawNext = useSession((s) => s.drawNext);

  useEffect(() => {
    if (!coro) {
      router.replace('/');
      return;
    }
    beginGame('quien-soy');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!coro) return null;

  const exit = () => {
    feel('tick');
    sound('tick');
    router.push('/jugar');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Pressable onPress={exit} hitSlop={10} style={{ paddingVertical: 8, paddingRight: 12 }}>
          <Text style={[text.micro, { color: COLORS.inkDim }]}>← Salir</Text>
        </Pressable>
        <MicroLabel color={COLORS.inkFaint}>Versión preliminar</MicroLabel>
      </View>

      <View style={{ marginTop: 16, flex: 1 }}>
        <PlayCard
          cardKey={current?.prompt.id}
          text={current?.text ?? '—'}
          accent="blue"
          eyebrow="Imita a"
          footer={<PushButton accent="blue" label="Siguiente" onPress={drawNext} />}
        />
      </View>
    </Screen>
  );
}
