import { useLocalSearchParams, useRouter } from 'expo-router';
import { nanoid } from 'nanoid/non-secure';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { BackButton } from '@/components/back-button';
import { NameChip } from '@/components/name-chip';
import { PushButton } from '@/components/push-button';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Sheet } from '@/components/sheet';
import { Hairline, MicroLabel } from '@/components/ui';
import type { Coro, Objetivo, Pair, Player, Sexo } from '@/engine';
import { feel } from '@/lib/feel';
import { storage } from '@/lib/storage';
import { COLORS, text } from '@/lib/tokens';
import { useSession } from '@/store/session';

type SexoOpt = 'none' | Sexo;
const SEXO_OPTIONS: { value: SexoOpt; label: string }[] = [
  { value: 'none', label: '—' },
  { value: 'f', label: 'Ella' },
  { value: 'm', label: 'Él' },
  { value: 'x', label: 'Elle' },
];
const SEXO_LABEL: Record<Sexo, string> = { f: 'ella', m: 'él', x: 'elle' };

type PickMode = null | 'pair' | 'objetivo';

const dashedInput = {
  borderBottomWidth: 2,
  borderStyle: 'dashed' as const,
  borderColor: COLORS.separator,
  paddingBottom: 8,
  color: COLORS.ink,
  fontFamily: 'SpaceGrotesk_700Bold',
  fontSize: 36,
  letterSpacing: -1,
};

export default function CoroBuilder() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isPareja = mode === 'pareja';

  const existing = useSession((s) => s.coro);
  const setCoro = useSession((s) => s.setCoro);
  const loadCustomPrompts = useSession((s) => s.loadCustomPrompts);

  const [name, setName] = useState(isPareja ? 'Mi chic@ y yo' : 'Mi coro');
  const [players, setPlayers] = useState<Player[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pick, setPick] = useState<PickMode>(null);

  useEffect(() => {
    if (mode === 'editar' && existing) {
      setName(existing.name);
      setPlayers(existing.players);
      setPairs(existing.pairs);
      setObjetivos(existing.objetivos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const editing = editingId ? byId.get(editingId) : undefined;

  const addPlayer = () => {
    const value = draft.trim();
    if (!value) return;
    setPlayers((prev) => [...prev, { id: nanoid(), name: value }]);
    setDraft('');
    feel('tick');
  };

  const partnerOf = (id: string) => {
    for (const [a, b] of pairs) {
      if (a === id) return byId.get(b);
      if (b === id) return byId.get(a);
    }
    return undefined;
  };
  const objetivoOf = (id: string) => {
    for (const [a, b] of objetivos) {
      if (a === id) return byId.get(b);
      if (b === id) return byId.get(a);
    }
    return undefined;
  };
  const relationLabel = (id: string): string | undefined => {
    const partner = partnerOf(id);
    if (partner) return `con ${partner.name}`;
    const target = objetivoOf(id);
    if (target) return `objetivo: ${target.name}`;
    const sexo = byId.get(id)?.sexo;
    return sexo ? SEXO_LABEL[sexo] : undefined;
  };

  const dropRelations = (id: string) => {
    setPairs((prev) => prev.filter(([a, b]) => a !== id && b !== id));
    setObjetivos((prev) => prev.filter(([a, b]) => a !== id && b !== id));
  };
  const setSexo = (id: string, value: SexoOpt) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, sexo: value === 'none' ? undefined : value } : p)));
  };
  const rename = (id: string, value: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: value } : p)));
  };
  const linkPair = (a: string, b: string) => {
    dropRelations(a);
    dropRelations(b);
    setPairs((prev) => [...prev, [a, b]]);
    feel('medium');
  };
  const linkObjetivo = (a: string, b: string) => {
    setPairs((prev) => prev.filter(([x, y]) => x !== a && y !== a && x !== b && y !== b));
    setObjetivos((prev) => [...prev.filter(([x, y]) => x !== a && y !== a && x !== b && y !== b), [a, b]]);
    feel('medium');
  };
  const unlink = (id: string) => {
    dropRelations(id);
    feel('tick');
  };
  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    dropRelations(id);
    setEditingId(null);
    feel('medium');
  };

  const canSave = players.length >= 2;

  const save = async () => {
    if (!canSave) return;
    const isEdit = mode === 'editar' && existing;
    const finalPairs =
      isPareja && pairs.length === 0 && players.length === 2
        ? ([[players[0].id, players[1].id]] as Pair[])
        : pairs;
    const now = Date.now();
    const coro: Coro = {
      id: isEdit ? existing.id : nanoid(),
      name: name.trim() || 'Mi coro',
      players,
      pairs: finalPairs,
      objetivos,
      createdAt: isEdit ? existing.createdAt : now,
      updatedAt: now,
    };
    await storage.saveCoro(coro);
    setCoro(coro);
    await loadCustomPrompts(coro.id);
    feel('heavy');
    router.push('/jugar');
  };

  const others = editing ? players.filter((p) => p.id !== editing.id) : [];

  return (
    <>
      <Screen>
        <BackButton to="/" label="Inicio" />
        <MicroLabel>Nombre del coro · toca pa&apos; cambiar</MicroLabel>
        <TextInput value={name} onChangeText={setName} placeholder="Mi coro" placeholderTextColor={COLORS.inkFaint} style={[dashedInput, { marginTop: 4 }]} />

        <View style={{ marginTop: 24, flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addPlayer}
            placeholder="Agrega un nombre…"
            placeholderTextColor={COLORS.inkFaint}
            returnKeyType="done"
            style={{ flex: 1, borderRadius: 16, backgroundColor: COLORS.elevated, paddingHorizontal: 16, fontSize: 18, color: COLORS.ink }}
          />
          <PushButton accent="green" haptic="tick" label="Agregar" onPress={addPlayer} />
        </View>

        <View style={{ marginTop: 12 }}>
          <MicroLabel color={COLORS.inkFaint}>
            {players.length === 0
              ? 'Toca a una persona para enlazarla o editarla'
              : `${players.length} ${players.length === 1 ? 'persona' : 'personas'} · toca para editar`}
          </MicroLabel>
        </View>

        <View style={{ marginTop: 12, flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: 8 }}>
          {players.map((p) => (
            <NameChip
              key={p.id}
              name={p.name}
              relation={relationLabel(p.id)}
              editable
              selected={editingId === p.id}
              onPress={() => {
                setEditingId(p.id);
                setPick(null);
                feel('tick');
              }}
            />
          ))}
          {players.length === 0 ? <Text style={[text.body, { color: COLORS.inkFaint, marginTop: 8 }]}>Nadie en el coro todavía.</Text> : null}
        </View>

        <Hairline style={{ marginVertical: 20 }} />
        <PushButton accent="blue" disabled={!canSave} label={canSave ? 'Listo, a jugar' : 'Agrega al menos dos'} onPress={save} />
      </Screen>

      {/* Per-person editor */}
      <Sheet open={!!editing} onClose={() => { setEditingId(null); setPick(null); }} eyebrow="Editar persona">
        {editing ? (
          <View style={{ paddingBottom: 8 }}>
            <TextInput value={editing.name} onChangeText={(v) => rename(editing.id, v)} placeholder="Nombre" placeholderTextColor={COLORS.inkFaint} style={dashedInput} />

            <MicroLabel>Cómo se le habla · opcional, privado</MicroLabel>
            <View style={{ marginTop: 8 }}>
              <Segmented options={SEXO_OPTIONS} value={(editing.sexo ?? 'none') as SexoOpt} onChange={(v) => setSexo(editing.id, v)} />
            </View>

            <View style={{ marginTop: 28 }}>
              <MicroLabel>Con quién</MicroLabel>
            </View>
            <View style={{ marginTop: 8, gap: 8 }}>
              <RelationRow
                label="Pareja"
                partner={partnerOf(editing.id)?.name}
                active={pick === 'pair'}
                onAdd={() => { setPick(pick === 'pair' ? null : 'pair'); feel('tick'); }}
                onClear={partnerOf(editing.id) ? () => unlink(editing.id) : undefined}
              />
              <RelationRow
                label="Objetivo"
                hint="A quien el coro quiere juntar"
                partner={objetivoOf(editing.id)?.name}
                active={pick === 'objetivo'}
                onAdd={() => { setPick(pick === 'objetivo' ? null : 'objetivo'); feel('tick'); }}
                onClear={objetivoOf(editing.id) ? () => unlink(editing.id) : undefined}
              />
            </View>

            {pick ? (
              <View style={{ marginTop: 12 }}>
                <MicroLabel color={COLORS.inkFaint}>{pick === 'pair' ? 'Enlazar con' : 'Empujar hacia'}</MicroLabel>
                {others.length === 0 ? (
                  <Text style={[text.body, { color: COLORS.inkFaint, marginTop: 8 }]}>Agrega a alguien más primero.</Text>
                ) : (
                  <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {others.map((o) => (
                      <Pressable
                        key={o.id}
                        onPress={() => {
                          if (pick === 'pair') linkPair(editing.id, o.id);
                          else linkObjetivo(editing.id, o.id);
                          setPick(null);
                        }}
                        style={{ borderRadius: 999, backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 10 }}
                      >
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: COLORS.ink }}>{o.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ) : null}

            <Pressable onPress={() => removePlayer(editing.id)} style={{ marginTop: 32, paddingVertical: 12 }}>
              <Text style={[text.micro, { color: COLORS.red, textAlign: 'center' }]}>Quitar del coro</Text>
            </Pressable>
          </View>
        ) : null}
      </Sheet>
    </>
  );
}

function RelationRow({
  label,
  hint,
  partner,
  onAdd,
  onClear,
  active,
}: {
  label: string;
  hint?: string;
  partner?: string;
  onAdd: () => void;
  onClear?: () => void;
  active: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ flex: 1 }}>
        <Text style={text.label}>{label}</Text>
        <Text style={[text.micro, { marginTop: 2, color: COLORS.inkDim }]}>{partner ? `Con ${partner}` : hint ?? 'Nadie'}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {partner && onClear ? (
          <Pressable onPress={onClear} hitSlop={6}>
            <Text style={[text.micro, { color: COLORS.inkDim }]}>Quitar</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onAdd} style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: active ? COLORS.ink : COLORS.elevated }}>
          <Text style={[text.micro, { color: active ? COLORS.canvas : COLORS.ink }]}>{partner ? 'Cambiar' : 'Enlazar'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
