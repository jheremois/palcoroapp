import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BackButton } from '@/components/back-button';
import { GameBlock } from '@/components/game-block';
import { Screen } from '@/components/screen';
import { MicroLabel } from '@/components/ui';
import type { Game } from '@/engine';
import { COLORS, text } from '@/lib/tokens';
import { useSession } from '@/store/session';

export default function Jugar() {
  const router = useRouter();
  const coro = useSession((s) => s.coro);
  const setGame = useSession((s) => s.setGame);

  useEffect(() => {
    if (!coro) router.replace('/');
  }, [coro, router]);

  if (!coro) return null;
  const isPair = coro.players.length === 2;

  const go = (game: Game, path: Href) => {
    setGame(game);
    router.push(path);
  };

  return (
    <Screen>
      <BackButton to="/" label="Coros" />
      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <MicroLabel>Elige tu veneno · 01–03</MicroLabel>
          <Text style={[text.slab, { marginTop: 4, fontSize: 34 }]} numberOfLines={1}>
            {coro.name}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push({ pathname: '/coro', params: { mode: 'editar' } })}
          style={{ borderWidth: 1, borderColor: COLORS.separator, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Text style={[text.micro, { color: COLORS.inkDim }]}>Editar</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 20, flex: 1, gap: 12 }}>
        <GameBlock
          index="01"
          title="Verdad o Reto"
          tagline="Retos con nombres de los que están aquí."
          accent="red"
          delay={0}
          onPress={() => go('verdad-reto', '/intensidad')}
        />
        <View className='flex-1'>

        </View>
        <View className='flex-1'>

        </View>
       {/*  <GameBlock
          index="02"
          title="Yo Nunca Nunca"
          tagline="Baja el dedo si lo hiciste. El chisme sale solo."
          accent="purple"
          dimmed={isPair}
          delay={70}
          onPress={() => go('yo-nunca', '/intensidad')}
        />
        <GameBlock
          index="03"
          title="¿Quién Soy?"
          tagline="Imita a un pana o a un personaje."
          accent="blue"
          dimmed={isPair}
          delay={140}
          onPress={() => go('quien-soy', '/quien-soy')}
        /> */}
      </View>

      {isPair ? (
        <View style={{ marginTop: 16 }}>
          <MicroLabel color={COLORS.inkFaint}>Coro de dos: Verdad o Reto es lo suyo</MicroLabel>
        </View>
      ) : null}
    </Screen>
  );
}
