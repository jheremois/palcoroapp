import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { PushButton } from './push-button';
import { Sheet } from './sheet';
import type { Prompt } from '@/engine';
import { feel } from '@/lib/feel';
import { sound } from '@/lib/sound';
import { storage } from '@/lib/storage';
import { COLORS, text } from '@/lib/tokens';
import { useSession } from '@/store/session';

/** Round-robin composer for Yo Nunca: the phone goes around, each adds their own.
 * The content stays redacted — it's a surprise. */
export function YoNuncaComposer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const coro = useSession((s) => s.coro);
  const addCustomPrompt = useSession((s) => s.addCustomPrompt);
  const loadCustomPrompts = useSession((s) => s.loadCustomPrompts);
  const [draft, setDraft] = useState('');
  const [customs, setCustoms] = useState<Prompt[]>([]);

  const refresh = async () => {
    if (!coro) return;
    const list = (await storage.listCustomPrompts(coro.id)).filter((p) => p.juego === 'yo-nunca');
    setCustoms(list);
  };
  useEffect(() => {
    if (open) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, coro?.id]);

  if (!coro) return null;
  const count = customs.length;

  const save = async () => {
    const value = draft.trim();
    if (!value) return;
    const full = /^yo nunca/i.test(value) ? value : `Yo nunca nunca ${value}`;
    await addCustomPrompt(full);
    setDraft('');
    await refresh();
  };

  const remove = async (id: string) => {
    await storage.deleteCustomPrompt(id);
    await loadCustomPrompts(coro.id);
    feel('tick');
    sound('tick');
    await refresh();
  };

  return (
    <Sheet open={open} onClose={onClose} eyebrow="Pásense el teléfono" title="Sus Yo Nunca Nunca">
      <Text style={text.body}>
        En ronda: cada quien escribe el suyo y le pasa el teléfono al de al lado. Nadie ve lo de
        los demás — es sorpresa cuando salgan.
      </Text>

      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Yo nunca nunca…"
        placeholderTextColor={COLORS.inkFaint}
        multiline
        style={{
          marginTop: 16,
          minHeight: 84,
          borderRadius: 16,
          backgroundColor: COLORS.surface,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          color: COLORS.ink,
          textAlignVertical: 'top',
        }}
      />
      <View style={{ marginTop: 12 }}>
        <PushButton accent="purple" label="Agregar y pasar" onPress={save} />
      </View>

      {count > 0 ? (
        <View style={{ marginTop: 24 }}>
          <Text style={[text.micro, { color: COLORS.inkFaint }]}>
            {count} en el mazo · ocultos pa&apos; sorpresa
          </Text>
          <View style={{ marginTop: 8, gap: 8 }}>
            {customs.map((c, i) => (
              <View
                key={c.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  borderRadius: 16,
                  backgroundColor: COLORS.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={[text.micro, { color: COLORS.inkDim }]}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <View style={{ height: 8, width: 112, borderRadius: 4, backgroundColor: COLORS.inkFaint }} />
                </View>
                <Pressable onPress={() => remove(c.id)} hitSlop={8}>
                  <Text style={[text.micro, { color: COLORS.red }]}>Borrar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}
