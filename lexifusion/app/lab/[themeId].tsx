import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Pressable,
  Animated as RNAnimated,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeDetail } from '@/hooks/useThemes';
import { useFusionStore } from '@/hooks/useFusionStore';
import { apiResolveFusion, FusionDTO } from '@/lib/api';
import { getFusionOrCreative, getThemeById as getLocalThemeById } from '@/data/themes';
import { WordBubbleView } from '@/components/WordBubbleView';
import { FusionResultCard } from '@/components/FusionResultCard';
import { MergeAnimation } from '@/components/MergeAnimation';
import type { WordBubble } from '@/data/themes';
import Colors from '@/constants/Colors';
import { Spacing, Typography, Radius, cardShadow } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';

/* ─── Animated fusion result ─────────────────────────────── */
function FusionResultCardAnimated({
  fusion,
  onClose,
}: {
  fusion: FusionDTO;
  onClose: () => void;
}) {
  const scale = useRef(new RNAnimated.Value(0.92)).current;
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(24)).current;
  const useNative = Platform.OS !== 'web';
  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.spring(scale, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 140 }),
      RNAnimated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: useNative }),
      RNAnimated.spring(translateY, { toValue: 0, useNativeDriver: useNative, damping: 20, stiffness: 160 }),
    ]).start();
  }, [useNative]);
  return (
    <RNAnimated.View style={{ opacity, transform: [{ scale }, { translateY }], width: '100%' }}>
      <FusionResultCard fusion={fusion} onClose={onClose} />
    </RNAnimated.View>
  );
}

/* ─── Selection Pill: shows selected word(s) at top ──────── */
function SelectionBar({
  wordA,
  wordB,
  onClearA,
  onClearB,
  resolving,
}: {
  wordA: WordBubble | null;
  wordB: WordBubble | null;
  onClearA: () => void;
  onClearB: () => void;
  resolving: boolean;
}) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <View style={[selStyles.bar, { backgroundColor: c.surface, borderColor: c.separator }]}>
      {/* Slot A */}
      <Pressable
        onPress={wordA ? onClearA : undefined}
        style={[
          selStyles.slot,
          {
            backgroundColor: wordA ? c.bubbleBgActive : c.cardInner,
            borderColor: wordA ? c.primary : c.border,
          },
        ]}
      >
        {wordA ? (
          <>
            <Text style={selStyles.slotIcon}>{wordA.icon || '?'}</Text>
            <Text style={[selStyles.slotWord, { color: c.text }]} numberOfLines={1}>{wordA.word}</Text>
            <Text style={[selStyles.slotClear, { color: c.textTertiary }]}>{'×'}</Text>
          </>
        ) : (
          <Text style={[selStyles.slotPlaceholder, { color: c.textTertiary }]}>选择第 1 个词</Text>
        )}
      </Pressable>

      {/* Plus sign */}
      <View style={[selStyles.plusWrap, { backgroundColor: resolving ? c.primary : c.tagBg }]}>
        {resolving ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={[selStyles.plus, { color: c.tagText }]}>{'+'}</Text>
        )}
      </View>

      {/* Slot B */}
      <Pressable
        onPress={wordB ? onClearB : undefined}
        style={[
          selStyles.slot,
          {
            backgroundColor: wordB ? c.bubbleBgActive : c.cardInner,
            borderColor: wordB ? c.primary : c.border,
          },
        ]}
      >
        {wordB ? (
          <>
            <Text style={selStyles.slotIcon}>{wordB.icon || '?'}</Text>
            <Text style={[selStyles.slotWord, { color: c.text }]} numberOfLines={1}>{wordB.word}</Text>
            <Text style={[selStyles.slotClear, { color: c.textTertiary }]}>{'×'}</Text>
          </>
        ) : (
          <Text style={[selStyles.slotPlaceholder, { color: c.textTertiary }]}>选择第 2 个词</Text>
        )}
      </Pressable>
    </View>
  );
}

const selStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
  },
  slot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.sm,
    gap: 6,
  },
  slotIcon: { fontSize: 18 },
  slotWord: { fontSize: 14, fontWeight: '600', flex: 1 },
  slotClear: { fontSize: 18, fontWeight: '300', paddingLeft: 4 },
  slotPlaceholder: { fontSize: 13, flex: 1, textAlign: 'center' },
  plusWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 18, fontWeight: '600' },
});

/* ─── Main Lab Screen ────────────────────────────────────── */
export default function LabScreen() {
  const params = useLocalSearchParams<{ themeId: string | string[] }>();
  const themeIdRaw = params.themeId;
  const themeId = Array.isArray(themeIdRaw) ? themeIdRaw[0] : themeIdRaw;
  const { theme, loading: themeLoading } = useThemeDetail(themeId);
  const { addDiscovered } = useFusionStore();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Selection state: two slots
  const [slotA, setSlotA] = useState<string | null>(null);
  const [slotB, setSlotB] = useState<string | null>(null);
  const [lastFusion, setLastFusion] = useState<FusionDTO | null>(null);
  const [mergingWords, setMergingWords] = useState<[WordBubble, WordBubble] | null>(null);
  const [resolving, setResolving] = useState(false);

  if (themeLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!theme) {
    return (
      <View style={[styles.centered, { backgroundColor: c.background }]}>
        <Text style={[Typography.body, { color: c.textSecondary }]}>主题不存在</Text>
      </View>
    );
  }

  const words: WordBubble[] = theme.words.map((w) => ({
    id: w.id,
    word: w.word,
    phonetic: w.phonetic ?? undefined,
    meaning: w.meaning,
    icon: w.icon ?? undefined,
    imageUrl: w.imageUrl ?? undefined,
    category: (w.category as any) ?? undefined,
  }));

  const wordAObj = slotA ? words.find((w) => w.id === slotA) ?? null : null;
  const wordBObj = slotB ? words.find((w) => w.id === slotB) ?? null : null;

  const doFusion = async (idA: string, idB: string) => {
    const wA = words.find((w) => w.id === idA)!;
    const wB = words.find((w) => w.id === idB)!;
    setMergingWords([wA, wB]);
    setLastFusion(null);
    setResolving(true);

    try {
      const fusion = await apiResolveFusion(idA, idB);
      setLastFusion(fusion);
      addDiscovered(fusion, idA, idB).catch(() => {});
    } catch {
      const localTheme = getLocalThemeById(themeId ?? '');
      if (localTheme) {
        const localFusion = getFusionOrCreative(localTheme, idA, idB);
        const fusionDTO: FusionDTO = {
          ...localFusion,
          imageUrl: localFusion.imageUrl ?? null,
          imageUrls: localFusion.imageUrls ?? null,
          suggestedWords: localFusion.suggestedWords ?? null,
          example: localFusion.example ?? null,
          concept: localFusion.concept ?? null,
          association: localFusion.association ?? null,
          icon: localFusion.icon ?? null,
        };
        setLastFusion(fusionDTO);
        addDiscovered(fusionDTO, idA, idB).catch(() => {});
      }
    }
    setResolving(false);
  };

  const handleBubblePress = (word: WordBubble) => {
    if (resolving) return;

    // If already selected, deselect
    if (slotA === word.id) { setSlotA(null); return; }
    if (slotB === word.id) { setSlotB(null); return; }

    if (slotA === null) {
      // Fill slot A
      setSlotA(word.id);
      setLastFusion(null);
    } else if (slotB === null) {
      // Fill slot B and trigger fusion
      setSlotB(word.id);
      doFusion(slotA, word.id);
    } else {
      // Both filled: replace A, clear B, set new A
      setSlotA(word.id);
      setSlotB(null);
      setLastFusion(null);
    }
  };

  const handleClearA = () => {
    if (resolving) return;
    setSlotA(slotB); // promote B to A
    setSlotB(null);
    setLastFusion(null);
  };
  const handleClearB = () => {
    if (resolving) return;
    setSlotB(null);
    setLastFusion(null);
  };
  const handleMergeComplete = () => setMergingWords(null);

  const handleCloseResult = () => {
    setLastFusion(null);
    setSlotA(null);
    setSlotB(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Selection Bar - always visible at top */}
      <SelectionBar
        wordA={wordAObj}
        wordB={wordBObj}
        onClearA={handleClearA}
        onClearB={handleClearB}
        resolving={resolving}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Spacing.xxxl + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Merge animation overlay or Result */}
        {mergingWords && !lastFusion ? (
          <View
            style={[
              styles.animationWrap,
              { backgroundColor: c.surface, borderColor: c.borderSubtle, ...cardShadow(colorScheme ?? 'light') },
            ]}
          >
            <MergeAnimation
              wordA={mergingWords[0]}
              wordB={mergingWords[1]}
              onComplete={handleMergeComplete}
            />
          </View>
        ) : resolving && !lastFusion ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={[styles.loadingText, { color: c.textTertiary }]}>
              {'AI 融合中... ✦'}
            </Text>
          </View>
        ) : lastFusion ? (
          <FusionResultCardAnimated fusion={lastFusion} onClose={handleCloseResult} />
        ) : null}

        {/* Instruction */}
        {!lastFusion && !resolving && (
          <View style={styles.instructionWrap}>
            <Text style={[styles.instruction, { color: c.textSecondary }]}>
              {slotA ? '再选一个词，完成融合' : '选择两个词，开始创意融合'}
            </Text>
            <Text style={[styles.instructionEn, { color: c.textTertiary }]}>
              {slotA ? 'Pick one more to fuse' : 'Choose any two words to fuse'}
            </Text>
          </View>
        )}

        {/* Word Grid - all words visible */}
        <View style={styles.grid}>
          {words.map((w, idx) => (
            <View key={w.id} style={styles.gridItem}>
              <WordBubbleView
                word={w}
                index={idx}
                selected={slotA === w.id || slotB === w.id}
                onPress={() => handleBubblePress(w)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  instructionWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  instruction: {
    ...Typography.callout,
    fontWeight: '500',
  },
  instructionEn: {
    ...Typography.caption,
    marginTop: 2,
  },

  /* Word Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  gridItem: {
    // Each item takes roughly 1/4 of width on mobile
  },

  /* Animation & loading */
  animationWrap: {
    width: '100%',
    maxWidth: 560,
    minHeight: 180,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.footnote,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
