import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PushButton } from '@/components/push-button';
import { Sheet } from '@/components/sheet';
import { Wordmark } from '@/components/wordmark';
import type { Coro } from '@/engine';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { storage } from '@/lib/storage';
import { COLORS, text } from '@/lib/tokens';
import { useSession } from '@/store/session';

// The four official colors as a thin print band — the brand mark.
const SPECTRUM = [COLORS.blue, COLORS.purple, COLORS.green, COLORS.red];

function Label({ children }: { children: string }) {
  return <Text style={text.micro}>{children}</Text>;
}

function SpectrumBand() {
  return (
    <View className="h-1.5 w-full flex-row overflow-hidden rounded-full">
      {SPECTRUM.map((c, i) => (
        <BandSegment key={c} color={c} delay={i * 70} />
      ))}
    </View>
  );
}

function BandSegment({ color, delay }: { color: string; delay: number }) {
  const sx = useSharedValue(0);
  useEffect(() => {
    sx.value = withDelay(delay, withSpring(1, { stiffness: 420, damping: 26 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: sx.value }] }));
  return <Animated.View style={[{ flex: 1, backgroundColor: color, transformOrigin: 'left' }, style]} />;
}

function CorosCard({
  coro,
  index,
  onPress,
  onMenu,
}: {
  coro: Coro;
  index: number;
  onPress: () => void;
  onMenu: () => void;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const n = coro.players.length;
  return (
    <Animated.View style={aStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.95, { stiffness: 900, damping: 26 });
          feel('tick');
          sound('tick');
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { stiffness: 600, damping: 16 });
        }}
        onPress={onPress}
        onLongPress={onMenu}
        className="relative min-w-44 justify-between rounded-2xl px-4 py-4"
        style={{ backgroundColor: COLORS.elevated }}
      >
        <Pressable onPress={onMenu} hitSlop={10} className="absolute right-2 top-1 px-2 py-1">
          <Text style={text.dots}>···</Text>
        </Pressable>
        <Text style={[text.cardName, { paddingTop: 24 }]} numberOfLines={1}>
          {coro.name}
        </Text>
        <Text style={[text.micro, { marginTop: 24 }]}>
          {String(index).padStart(2, '0')} · {n} {n === 1 ? 'persona' : 'personas'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setCoro = useSession((s) => s.setCoro);
  const loadCustomPrompts = useSession((s) => s.loadCustomPrompts);
  const [coros, setCoros] = useState<Coro[]>([]);
  const [menuCoro, setMenuCoro] = useState<Coro | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refresh = useCallback(() => {
    storage.listCoros().then(setCoros);
  }, []);

  // Refresh saved coros whenever the home regains focus.
  useFocusEffect(refresh);

  const openCoro = async (coro: Coro) => {
    feel('medium');
    setCoro(coro);
    await loadCustomPrompts(coro.id);
    router.push('/jugar');
  };

  const editCoro = async (coro: Coro) => {
    feel('tick');
    setCoro(coro);
    await loadCustomPrompts(coro.id);
    setMenuCoro(null);
    router.push({ pathname: '/coro', params: { mode: 'editar' } });
  };

  const deleteCoro = async (coro: Coro) => {
    await storage.deleteCoro(coro.id);
    feel('heavy');
    setMenuCoro(null);
    setConfirmDelete(false);
    refresh();
  };

  const openMenu = (coro: Coro) => {
    feel('tick');
    sound('tick');
    setConfirmDelete(false);
    setMenuCoro(coro);
  };

  const openPrivacy = () => {
    feel('tick');
    WebBrowser.openBrowserAsync('https://palcoroweb.vercel.app/privacy');
  };

  return (
    <>
    <View className="flex-1 pb-24" style={{ backgroundColor: COLORS.canvas, paddingTop: insets.top + 12 }}>
      <View className="mt-12 px-6">
        <SpectrumBand />
      </View>

      <Animated.View entering={FadeInDown.duration(500).springify().delay(120)} className="mt-5">
        <Wordmark />
      </Animated.View>

      <View className="flex-1" />

      <View style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="px-6">
          <Animated.View entering={FadeInDown.duration(400).springify().delay(280)}>
            <Label>¿Con quién juegas?</Label>
          </Animated.View>

          <View className="mt-3 gap-3">
            <Animated.View entering={FadeInDown.duration(400).springify().delay(340)}>
              <PushButton
                accent="red"
                label="Estoy con mi chic@"
                onPress={() => router.push({ pathname: '/coro', params: { mode: 'pareja' } })}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(400).springify().delay(400)}>
              <PushButton
                accent="blue"
                label="Un coro nuevo"
                onPress={() => router.push({ pathname: '/coro', params: { mode: 'nuevo' } })}
              />
            </Animated.View>
          </View>

          {coros.length > 0 ? (
            <Animated.View entering={FadeInDown.duration(400).springify().delay(470)} className="mb-3 mt-6">
              <Label>Tus coros</Label>
            </Animated.View>
          ) : null}
        </View>

        {coros.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
            {coros.map((coro, i) => (
              <Animated.View key={coro.id} entering={FadeInDown.duration(400).springify().delay(540 + i * 80)}>
                <CorosCard coro={coro} index={i + 1} onPress={() => openCoro(coro)} onMenu={() => openMenu(coro)} />
              </Animated.View>
            ))}
          </ScrollView>
        ) : null}

        <Pressable
          onPress={openPrivacy}
          hitSlop={8}
          style={{ marginTop: 18, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16 }}
        >
          <Text style={[text.micro, { color: COLORS.inkFaint }]}>Política de privacidad</Text>
        </Pressable>
      </View>
    </View>

      <Sheet open={!!menuCoro} onClose={() => setMenuCoro(null)} eyebrow="Tu coro" title={menuCoro?.name}>
        {menuCoro ? (
          <View style={{ gap: 12, paddingBottom: 8 }}>
            <PushButton
              accent="blue"
              label="Jugar"
              onPress={() => {
                setMenuCoro(null);
                openCoro(menuCoro);
              }}
            />
            <PushButton variant="soft" label="Editar nombres" onPress={() => editCoro(menuCoro)} />
            {confirmDelete ? (
              <PushButton accent="red" haptic="heavy" label="Sí, bórralo" onPress={() => deleteCoro(menuCoro)} />
            ) : (
              <Pressable
                onPress={() => {
                  setConfirmDelete(true);
                  feel('tick');
                }}
                style={{ paddingVertical: 12 }}
              >
                <Text style={[text.micro, { color: COLORS.red, textAlign: 'center' }]}>Borrar coro</Text>
              </Pressable>
            )}
          </View>
        ) : null}
      </Sheet>
    </>
  );
}
