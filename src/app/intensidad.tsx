import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { BackButton } from '@/components/back-button';
import { PushButton } from '@/components/push-button';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Sheet } from '@/components/sheet';
import { Stamp } from '@/components/stamp';
import { Hairline, MicroLabel } from '@/components/ui';
import { YoNuncaComposer } from '@/components/yo-nunca-composer';
import type { Game, Intensity, Prompt, VRType } from '@/engine';
import { ACCENTS, type Accent } from '@/lib/accents';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { storage } from '@/lib/storage';
import { COLORS, text } from '@/lib/tokens';
import { useSession, type YoNuncaMode } from '@/store/session';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

const LEVELS: { value: Intensity; label: string; accent: Accent }[] = [
  { value: 'suave', label: 'Suave', accent: 'green' },
  { value: 'picante', label: 'Picante', accent: 'purple' },
  { value: 'sin-filtro', label: 'Sin filtro', accent: 'red' },
];

const PLAY_ROUTE: Record<Game, Href> = {
  'verdad-reto': '/verdad-reto',
  'yo-nunca': '/yo-nunca',
  'quien-soy': '/quien-soy',
};

const YN_MODES: { value: YoNuncaMode; label: string }[] = [
  { value: 'mixto', label: 'Mixto' },
  { value: 'solo', label: 'Solo míos' },
  { value: 'auto', label: 'Auto' },
];

export default function IntensityScreen() {
  const router = useRouter();
  const game = useSession((s) => s.game);
  const coro = useSession((s) => s.coro);
  const intensity = useSession((s) => s.intensity);
  const antiAwkward = useSession((s) => s.antiAwkward);
  const shots = useSession((s) => s.shots);
  const yoNuncaMode = useSession((s) => s.yoNuncaMode);
  const setIntensity = useSession((s) => s.setIntensity);
  const setAntiAwkward = useSession((s) => s.setAntiAwkward);
  const setShots = useSession((s) => s.setShots);
  const setYoNuncaMode = useSession((s) => s.setYoNuncaMode);
  const beginGame = useSession((s) => s.beginGame);
  const addCustomPrompt = useSession((s) => s.addCustomPrompt);
  const loadCustomPrompts = useSession((s) => s.loadCustomPrompts);

  const [composerOpen, setComposerOpen] = useState(false);
  const [ynComposerOpen, setYnComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftTipo, setDraftTipo] = useState<VRType>('reto');
  const [customs, setCustoms] = useState<Prompt[]>([]);

  useEffect(() => {
    if (!coro || !game) router.replace('/');
  }, [coro, game, router]);

  const refresh = async () => {
    if (!coro) return;
    setCustoms(await storage.listCustomPrompts(coro.id));
  };
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coro?.id]);

  if (!coro || !game) return null;

  const isVR = game === 'verdad-reto';
  const isYN = game === 'yo-nunca';
  const showIntensity = isVR || yoNuncaMode !== 'solo';
  const gameCustoms = customs.filter((c) => c.juego === game);
  const customCount = gameCustoms.length;
  const levelLabel = LEVELS.find((l) => l.value === intensity);

  const insertName = (name: string) => {
    feel('tick');
    const sep = draft.length === 0 || draft.endsWith(' ') ? '' : ' ';
    setDraft(draft + sep + name + ' ');
  };

  const saveCustom = async () => {
    const value = draft.trim();
    if (!value) return;
    await addCustomPrompt(value, draftTipo);
    setDraft('');
    await refresh();
  };

  const removeCustom = async (id: string) => {
    await storage.deleteCustomPrompt(id);
    await loadCustomPrompts(coro.id);
    feel('tick');
    await refresh();
  };

  const start = async () => {
    feel('heavy');
    await loadCustomPrompts(coro.id);
    beginGame(game);
    router.push(PLAY_ROUTE[game]);
  };

  return (
    <>
      <Screen>
        <BackButton to="/jugar" label="Juegos" />
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <View>
            <MicroLabel>{isYN ? 'Yo Nunca Nunca' : 'Una decisión'}</MicroLabel>
            <Text style={[text.h1, { marginTop: 8, fontSize: 44, lineHeight: 46, textTransform: 'uppercase' }]}>
              {isYN ? 'Arma\nel mazo' : '¿Qué tan\nfuerte?'}
            </Text>
          </View>
          {showIntensity && levelLabel ? (
            <Stamp accent={levelLabel.accent} rotate={2}>
              {levelLabel.label}
            </Stamp>
          ) : null}
        </View>

        {isYN ? (
          <View style={{ marginTop: 24 }}>
            <MicroLabel>De dónde salen</MicroLabel>
            <View style={{ marginTop: 8 }}>
              <Segmented options={YN_MODES} value={yoNuncaMode} onChange={setYoNuncaMode} />
            </View>
          </View>
        ) : null}

        {showIntensity ? (
          <View style={{ marginTop: 24, flex: 1, gap: 12 }}>
            {LEVELS.map((lvl, i) => (
              <IntensitySlab
                key={lvl.value}
                lvl={lvl}
                index={String(i + 1).padStart(2, '0')}
                selected={intensity === lvl.value}
                onPress={() => setIntensity(lvl.value)}
              />
            ))}
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* {isVR ? (
          <View style={{ marginTop: 24, gap: 12 }}>
            <SettingToggle
              label="Anti-awkward"
              info="Lo picante se queda entre parejas y objetivos. Nadie termina en una situación incómoda sin querer. Apágalo pa'l caos total."
              value={antiAwkward}
              onChange={setAntiAwkward}
              accent="green"
            />
            <SettingToggle
              label="Con shots"
              info="En vez de 'Shot', el que no cumple se toma un shot. Al final la tabla cuenta los shots de cada quien."
              value={shots}
              onChange={setShots}
              accent="red"
            />
          </View>
        ) : null} */}

        {isVR ? (
          <ComposerRow
            title="Tus verdades y retos"
            sub={customCount > 0 ? `${customCount} personalizada${customCount === 1 ? '' : 's'} en el mazo` : 'Opcional · se mezclan con sorpresa'}
            count={customCount}
            onPress={() => {
              setComposerOpen(true);
              feel('tick');
            }}
          />
        ) : null}

        {isYN && yoNuncaMode !== 'auto' ? (
          <ComposerRow
            title="Sus Yo Nunca Nunca"
            sub={customCount > 0 ? `${customCount} en el mazo` : 'Pásense el teléfono y agreguen los suyos'}
            count={customCount}
            onPress={() => {
              setYnComposerOpen(true);
              feel('tick');
            }}
          />
        ) : null}

        <Hairline style={{ marginVertical: 20 }} />
        <PushButton accent="red" label="Empezar" onPress={start} />
      </Screen>

      {/* VR custom composer */}
      <Sheet open={composerOpen} onClose={() => setComposerOpen(false)} eyebrow="Solo para tu coro" title="Verdades y retos">
        <Segmented
          options={[
            { value: 'reto', label: 'Reto' },
            { value: 'verdad', label: 'Verdad' },
          ]}
          value={draftTipo}
          onChange={setDraftTipo}
        />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Escríbela… toca un nombre pa' que solo le salga a esa persona, o usa [A]/[B] pa' que rote."
          placeholderTextColor={COLORS.inkFaint}
          multiline
          style={{ marginTop: 12, minHeight: 84, borderRadius: 16, backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: COLORS.ink, textAlignVertical: 'top' }}
        />
        <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {coro.players.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => insertName(p.name)}
              style={{ borderRadius: 999, backgroundColor: COLORS.surface, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.ink }}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ marginTop: 16 }}>
          <PushButton accent="green" label="Guardar al coro" onPress={saveCustom} />
        </View>

        {customCount > 0 ? (
          <View style={{ marginTop: 24 }}>
            <Text style={[text.micro, { color: COLORS.inkFaint }]}>
              En el mazo · {customCount} · ocultas pa&apos; sorpresa
            </Text>
            <View style={{ marginTop: 8, gap: 8 }}>
              {gameCustoms.map((c) => (
                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 16, backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={[text.micro, { color: COLORS.inkDim }]}>{c.tipo === 'verdad' ? 'Verdad' : 'Reto'}</Text>
                    <View style={{ height: 8, width: 112, borderRadius: 4, backgroundColor: COLORS.inkFaint }} />
                  </View>
                  <Pressable onPress={() => removeCustom(c.id)} hitSlop={8}>
                    <Text style={[text.micro, { color: COLORS.red }]}>Borrar</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </Sheet>

      <YoNuncaComposer
        open={ynComposerOpen}
        onClose={() => {
          setYnComposerOpen(false);
          refresh();
        }}
      />
    </>
  );
}

function IntensitySlab({
  lvl,
  index,
  selected,
  onPress,
}: {
  lvl: { value: Intensity; label: string; accent: Accent };
  index: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { face, on } = ACCENTS[lvl.accent];
  const flex = useSharedValue(selected ? 2.4 : 1);
  const op = useSharedValue(selected ? 1 : 0.5);
  useEffect(() => {
    flex.value = withSpring(selected ? 2.4 : 1, { stiffness: 520, damping: 30 });
    op.value = withSpring(selected ? 1 : 0.5, { stiffness: 520, damping: 30 });
  }, [selected, flex, op]);
  const aStyle = useAnimatedStyle(() => ({ flexGrow: flex.value, opacity: op.value }));

  return (
    <AnimPressable
      onPress={onPress}
      onPressIn={() => {
        feel('tick');
        sound('tick');
      }}
      style={[
        {
          flexBasis: 0,
          borderRadius: 24,
          paddingHorizontal: 24,
          paddingVertical: 24,
          justifyContent: 'flex-end',
          overflow: 'hidden',
          backgroundColor: selected ? face : COLORS.elevated,
        },
        aStyle,
      ]}
    >
      <Text style={[text.micro, { position: 'absolute', right: 20, top: 20, opacity: 0.6, color: selected ? on : COLORS.inkDim }]}>
        {index}
      </Text>
      <Text style={[text.slab, { fontSize: 38, color: selected ? on : COLORS.ink }]}>{lvl.label}</Text>
    </AnimPressable>
  );
}

function ComposerRow({ title, sub, count, onPress }: { title: string; sub: string; count: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 16, backgroundColor: COLORS.surface, paddingHorizontal: 20, paddingVertical: 16 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={text.label}>{title}</Text>
        <Text style={[text.micro, { marginTop: 2, color: COLORS.inkDim }]}>{sub}</Text>
      </View>
      <View style={{ borderRadius: 999, backgroundColor: COLORS.elevated, paddingHorizontal: 12, paddingVertical: 6 }}>
        <Text style={[text.micro, { color: COLORS.ink }]}>{count > 0 ? 'Ver' : 'Agregar'}</Text>
      </View>
    </Pressable>
  );
}
