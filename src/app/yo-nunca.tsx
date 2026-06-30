import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { PlayCard } from '@/components/play-card';
import { PushButton } from '@/components/push-button';
import { Screen } from '@/components/screen';
import { MicroLabel } from '@/components/ui';
import { YoNuncaComposer } from '@/components/yo-nunca-composer';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, text } from '@/lib/tokens';
import { useSession } from '@/store/session';

export default function YoNunca() {
  const router = useRouter();
  const coro = useSession((s) => s.coro);
  const current = useSession((s) => s.current);
  const round = useSession((s) => s.round);
  const drawNext = useSession((s) => s.drawNext);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!coro) router.replace('/');
  }, [coro, router]);

  if (!coro) return null;

  const exit = () => {
    feel('tick');
    sound('tick');
    router.push('/jugar');
  };

  return (
    <>
      <Screen>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Pressable onPress={exit} hitSlop={10} style={{ paddingVertical: 8, paddingRight: 12 }}>
            <Text style={[text.micro, { color: COLORS.inkDim }]}>← Salir</Text>
          </Pressable>
          <MicroLabel color={COLORS.inkFaint}>
            {round} {round === 1 ? 'carta' : 'cartas'}
          </MicroLabel>
        </View>

        {current ? (
          <Animated.View key="play" entering={FadeIn} style={{ marginTop: 16, flex: 1 }}>
            <PlayCard
              cardKey={current.prompt.id}
              text={current.text}
              accent="purple"
              eyebrow="Yo nunca nunca"
              footer={<PushButton accent="purple" label="Siguiente" onPress={drawNext} />}
            />
          </Animated.View>
        ) : (
          <Animated.View
            key="respiro"
            entering={FadeIn}
            style={{ marginTop: 16, flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <MicroLabel>Se acabaron</MicroLabel>
            <Text style={[text.h1, { marginTop: 12, fontSize: 48, lineHeight: 44, textTransform: 'uppercase', textAlign: 'center' }]}>
              Toma un{'\n'}respiro
            </Text>
            <Text style={[text.body, { marginTop: 16, textAlign: 'center', maxWidth: 280 }]}>
              Ya pasaron todos. Agreguen más en ronda o vuelvan al inicio.
            </Text>
            <View style={{ marginTop: 32, alignSelf: 'stretch', gap: 12 }}>
              <PushButton
                accent="purple"
                label="Agregar más"
                onPress={() => {
                  setAddOpen(true);
                  feel('tick');
                }}
              />
              <PushButton variant="soft" label="Volver al inicio" onPress={() => router.push('/')} />
            </View>
          </Animated.View>
        )}
      </Screen>

      <YoNuncaComposer
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          drawNext();
        }}
      />
    </>
  );
}
