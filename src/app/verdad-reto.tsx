import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { PlayCard } from '@/components/play-card';
import { PushButton } from '@/components/push-button';
import { Screen } from '@/components/screen';
import { SlotReel } from '@/components/slot-reel';
import { MicroLabel } from '@/components/ui';
import type { Intensity } from '@/engine';
import { ACCENTS, type Accent } from '@/lib/accents';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { COLORS, text } from '@/lib/tokens';
import { useSession } from '@/store/session';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

const INTENSITY_ACCENT: Record<Intensity, Accent> = {
  suave: 'green',
  picante: 'purple',
  'sin-filtro': 'red',
};

export default function VerdadReto() {
  const router = useRouter();
  const coro = useSession((s) => s.coro);
  const current = useSession((s) => s.current);
  const round = useSession((s) => s.round);
  const intensity = useSession((s) => s.intensity);
  const shots = useSession((s) => s.shots);
  const vrPhase = useSession((s) => s.vrPhase);
  const vrResults = useSession((s) => s.vrResults);
  const turnOrder = useSession((s) => s.turnOrder);
  const turnIndex = useSession((s) => s.turnIndex);
  const chooseVR = useSession((s) => s.chooseVR);
  const recordVR = useSession((s) => s.recordVR);
  const skipTurn = useSession((s) => s.skipTurn);
  const finishSpin = useSession((s) => s.finishSpin);

  useEffect(() => {
    if (!coro) router.replace('/');
  }, [coro, router]);

  if (!coro) return null;
  const turnPlayer = coro.players.find(
    (p) => p.id === turnOrder[turnIndex % Math.max(turnOrder.length, 1)],
  );
  const accent = INTENSITY_ACCENT[intensity];

  const exit = () => {
    feel('tick');
    sound('tick');
    router.push(vrResults.length > 0 ? '/carta' : '/jugar');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Pressable onPress={exit} hitSlop={10} style={{ paddingVertical: 8, paddingRight: 12 }}>
          <Text style={[text.micro, { color: COLORS.inkDim }]}>← Salir</Text>
        </Pressable>
        <MicroLabel color={COLORS.inkFaint}>
          {round === 0 ? 'Empezando' : `${round} ${round === 1 ? 'carta' : 'cartas'}`}
        </MicroLabel>
      </View>

      {vrPhase === 'spin' ? (
        <Animated.View key="spin" entering={FadeIn} style={{ marginTop: 16, flex: 1 }}>
          <MicroLabel>¿A quién le toca?</MicroLabel>
          <SlotReel
            key={turnIndex}
            names={coro.players.map((p) => p.name)}
            target={turnPlayer?.name ?? ''}
            accent={accent}
            onDone={finishSpin}
          />
        </Animated.View>
      ) : vrPhase === 'choose' ? (
        <Animated.View key="choose" entering={FadeIn} style={{ marginTop: 16, flex: 1 }}>
          {turnPlayer ? (
            <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <MicroLabel>Le toca a</MicroLabel>
              <Text style={[text.h3, { fontSize: 30, flexShrink: 1, textAlign: 'right' }]} numberOfLines={1}>
                {turnPlayer.name}
              </Text>
            </View>
          ) : null}
          <View style={{ flex: 1, gap: 12 }}>
            <ChoiceSlab label="Verdad" accent="blue" onPress={() => chooseVR('verdad')} />
            <ChoiceSlab label="Reto" accent={accent} onPress={() => chooseVR('reto')} />
          </View>
        </Animated.View>
      ) : current ? (
        <Animated.View key="play" entering={FadeIn} style={{ marginTop: 16, flex: 1 }}>
          <PlayCard
            cardKey={current.prompt.id + round}
            text={current.text}
            names={current.names}
            accent={accent}
            eyebrow={current.prompt.tipo === 'verdad' ? 'Verdad' : 'Reto'}
            turn={turnPlayer?.name}
            footer={
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <PushButton variant="soft" haptic="tick" label={shots ? 'Shot' : 'Shot'} onPress={() => recordVR(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <PushButton accent={accent} label="Lo hizo" onPress={() => recordVR(true)} />
                </View>
              </View>
            }
          />
        </Animated.View>
      ) : (
        <View key="empty" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 }}>
          <Text style={[text.body, { textAlign: 'center' }]}>
            No hay más cartas de ese tipo para este coro.
          </Text>
          <View style={{ alignSelf: 'stretch' }}>
            <PushButton variant="soft" label="Pasar turno" onPress={skipTurn} />
          </View>
        </View>
      )}
    </Screen>
  );
}

function ChoiceSlab({ label, accent, onPress }: { label: string; accent: Accent; onPress: () => void }) {
  const { face, on } = ACCENTS[accent];
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimPressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { stiffness: 900, damping: 26 });
        feel('tick');
        sound('tick');
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 600, damping: 15 });
      }}
      onPress={onPress}
      style={[{ flex: 1, backgroundColor: face, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, aStyle]}
    >
      <Text style={[text.slab, { color: on }]}>{label}</Text>
    </AnimPressable>
  );
}
