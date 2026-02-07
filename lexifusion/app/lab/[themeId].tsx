import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getThemeById, getFusionOrCreative } from '@/data/themes';
import { addDiscoveredFusion } from '@/lib/fusionStore';
import { WordBubbleView } from '@/components/WordBubbleView';
import { FusionResultCard } from '@/components/FusionResultCard';
import { MergeAnimation } from '@/components/MergeAnimation';
import type { WordBubble, FusionResult } from '@/data/themes';
import Colors from '@/constants/Colors';
import { Spacing, Typography, Radius, cardShadow } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';

function FusionResultCardAnimated({
  fusion,
  onClose,
}: {
  fusion: FusionResult;
  onClose: () => void;
}) {
  const scale = useRef(new RNAnimated.Value(0.92)).current;
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(20)).current;
  const useNative = Platform.OS !== 'web';
  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.spring(scale, {
        toValue: 1,
        useNativeDriver: useNative,
        damping: 14,
        stiffness: 120,
      }),
      RNAnimated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: useNative,
      }),
      RNAnimated.spring(translateY, {
        toValue: 0,
        useNativeDriver: useNative,
        damping: 16,
        stiffness: 140,
      }),
    ]).start();
  }, [useNative]);
  return (
    <RNAnimated.View
      style={{
        opacity,
        transform: [{ scale }, { translateY }],
      }}
    >
      <FusionResultCard fusion={fusion} onClose={onClose} />
    </RNAnimated.View>
  );
}

export default function LabScreen() {
  const params = useLocalSearchParams<{ themeId: string | string[] }>();
  const themeIdRaw = params.themeId;
  const themeId = Array.isArray(themeIdRaw) ? themeIdRaw[0] : themeIdRaw;
  const theme = useMemo(() => getThemeById(themeId ?? ''), [themeId]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastFusion, setLastFusion] = useState<FusionResult | null>(null);
  const [mergingWords, setMergingWords] = useState<[WordBubble, WordBubble] | null>(null);
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  if (!theme) {
    return (
      <View style={[styles.centered, { backgroundColor: c.background }]}>
        <Text style={[Typography.body, { color: c.textSecondary }]}>主题不存在 Theme not found</Text>
      </View>
    );
  }

  const handleBubblePress = (word: WordBubble) => {
    if (selectedId === null) {
      setSelectedId(word.id);
      setLastFusion(null);
      return;
    }
    if (selectedId === word.id) {
      setSelectedId(null);
      return;
    }
    const fusion = getFusionOrCreative(theme, selectedId, word.id);
    const wordA = theme.words.find((w) => w.id === selectedId)!;
    const wordB = word;
    setMergingWords([wordA, wordB]);
    setLastFusion(fusion);
    setSelectedId(null);
    addDiscoveredFusion(fusion).catch(() => {});
  };

  const handleMergeComplete = () => setMergingWords(null);

  const isWeb = Platform.OS === 'web';
  const containerStyle = [
    styles.container,
    { backgroundColor: c.background },
    isWeb && styles.containerWeb,
  ];

  return (
    <View style={containerStyle}>
      <View style={[styles.section, { borderBottomColor: c.borderSubtle }]}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
          选一个气泡，再点另一个 —— 任意组合都会产生融合
        </Text>
        <Text style={[styles.sectionTitleEn, { color: c.textTertiary }]}>
          Choose one bubble, then tap another — any combination will produce a fusion.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bubbleRow}
          style={[styles.bubbleScrollView, isWeb && { maxWidth: win.width - Spacing.lg * 2 }]}
        >
          {theme.words.map((w, idx) => (
            <View key={w.id} style={styles.bubbleWrap}>
              <WordBubbleView
                word={w}
                index={idx}
                selected={selectedId === w.id}
                onPress={() => handleBubblePress(w)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.main}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: Spacing.xxl + insets.bottom },
          isWeb && styles.mainContentWeb,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.unifiedArea}>
          {mergingWords ? (
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
          ) : lastFusion ? (
            <FusionResultCardAnimated
              fusion={lastFusion}
              onClose={() => setLastFusion(null)}
            />
          ) : (
            <Text style={[styles.hint, { color: c.textTertiary }]}>
              选两个气泡，查看融合结果 / Select two bubbles to see the fusion result.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const win = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1 },
  containerWeb: {},
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    ...Typography.footnote,
    marginBottom: 2,
  },
  sectionTitleEn: {
    fontSize: 11,
    opacity: 0.9,
    marginBottom: Spacing.md,
  },
  bubbleScrollView: {
    width: '100%',
  },
  bubbleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  bubbleWrap: {},
  main: { flex: 1 },
  mainContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  mainContentWeb: {
    flexGrow: 0,
  },
  unifiedArea: {
    minHeight: 80,
    alignItems: 'center',
  },
  animationWrap: {
    width: '100%',
    minHeight: 220,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  hint: {
    ...Typography.footnote,
  },
});
