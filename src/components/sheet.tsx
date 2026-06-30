import { useEffect, useState, type ReactNode } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { feel } from '@/lib/feel';
import { COLORS, text } from '@/lib/tokens';

const H = Dimensions.get('window').height;
const SPRING = { stiffness: 520, damping: 38, mass: 0.8 } as const;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Bottom sheet — the native surface for a focused task. Springs up from the
 * bottom; drag the handle down (or tap the backdrop) to dismiss. RN port of the
 * web <Sheet>, kept mounted through its exit so the close animation plays.
 */
export function Sheet({
  open,
  onClose,
  eyebrow,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(open);
  const ty = useSharedValue(H);
  const bg = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      bg.value = withTiming(1, { duration: 180 });
      ty.value = withSpring(0, SPRING);
    } else if (mounted) {
      bg.value = withTiming(0, { duration: 180 });
      ty.value = withTiming(H, { duration: 220 }, (f) => {
        if (f) runOnJS(setMounted)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lift the panel above the keyboard so inputs (custom prompts, renaming a
  // person) stay visible while typing.
  const keyboard = useAnimatedKeyboard();
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value - keyboard.height.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: bg.value }));

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      ty.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 600) {
        runOnJS(feel)('tick');
        runOnJS(onClose)();
      } else {
        ty.value = withSpring(0, SPRING);
      }
    });

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <AnimatedPressable
          onPress={onClose}
          style={[
            { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
            backdropStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              backgroundColor: COLORS.elevated,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              maxHeight: H * 0.86,
              paddingBottom: insets.bottom + 20,
            },
            panelStyle,
          ]}
        >
          <GestureDetector gesture={pan}>
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 6 }}>
              <View style={{ width: 40, height: 6, borderRadius: 3, backgroundColor: COLORS.separator }} />
            </View>
          </GestureDetector>

          <ScrollView
            style={{ paddingHorizontal: 24 }}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {eyebrow || title ? (
              <View style={{ marginBottom: 20 }}>
                {eyebrow ? <Text style={text.micro}>{eyebrow}</Text> : null}
                {title ? <Text style={[text.h3, { marginTop: 4 }]}>{title}</Text> : null}
              </View>
            ) : null}
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
