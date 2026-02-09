/**
 * 首页 = 融合实验室（统一入口）
 * 搜索 + 分类 + 随机融合 + 词汇网格
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  Animated as RNAnimated,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ensureAuth } from '@/lib/auth';
import {
  apiSearchWords,
  apiResolveFusionByText,
  WordItem,
  FusionDTO,
} from '@/lib/api';
import { useFusionStore } from '@/hooks/useFusionStore';
import { FusionResultCard } from '@/components/FusionResultCard';
import Colors from '@/constants/Colors';
import { Spacing, Typography, Radius, cardShadow } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';

/* ─── SlotWord: 支持虚拟词（融合结果用于继续融合） ──── */
type SlotWord = WordItem & {
  isVirtual?: boolean;
  /** 虚拟词的中文含义（用于文本融合） */
  virtualMeaning?: string;
  /** 虚拟词的类别 */
  virtualCategory?: string;
};

/* ─── Category tabs ──────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all', label: '全部', icon: '✦' },
  { id: 'animal', label: '动物', icon: '🐾' },
  { id: 'food', label: '食物', icon: '🍽️' },
  { id: 'nature', label: '自然', icon: '🌿' },
  { id: 'object', label: '物品', icon: '🔑' },
  { id: 'place', label: '地点', icon: '🏠' },
  { id: 'abstract', label: '抽象', icon: '✨' },
  { id: 'body', label: '身体', icon: '💖' },
  { id: 'transport', label: '交通', icon: '🚀' },
  { id: 'color', label: '颜色', icon: '🌈' },
  { id: 'sport', label: '运动', icon: '⚽' },
  { id: 'weather', label: '季节', icon: '🌸' },
  { id: 'science', label: '科学', icon: '🔬' },
  { id: 'emotion', label: '情绪', icon: '😊' },
  { id: 'action', label: '动作', icon: '🏃' },
  { id: 'material', label: '材料', icon: '🪨' },
  { id: 'cosmic', label: '宇宙', icon: '🌌' },
];

/* ─── Fusion Carousel: 多结果横向滑动 ──────────────────── */
function FusionCarousel({
  fusions,
  onClose,
  onUseFusion,
  colors,
}: {
  fusions: FusionDTO[];
  onClose: () => void;
  onUseFusion: (fusion: any) => void;
  colors: any;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth - Spacing.md * 2, 520);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  // Entrance animation
  const scale = useRef(new RNAnimated.Value(0.94)).current;
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(20)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.spring(scale, { toValue: 1, useNativeDriver: useNative, damping: 18, stiffness: 160 }),
      RNAnimated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: useNative }),
      RNAnimated.spring(translateY, { toValue: 0, useNativeDriver: useNative, damping: 22, stiffness: 180 }),
    ]).start();
  }, [useNative]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const idx = Math.round(offsetX / cardWidth);
      setActiveIndex(Math.max(0, Math.min(idx, fusions.length - 1)));
    },
    [cardWidth, fusions.length]
  );

  const scrollToIndex = useCallback(
    (idx: number) => {
      carouselRef.current?.scrollTo({ x: idx * cardWidth, animated: true });
      setActiveIndex(idx);
    },
    [cardWidth]
  );

  if (fusions.length === 0) return null;

  // Single result — no carousel needed
  if (fusions.length === 1) {
    return (
      <RNAnimated.View style={{ opacity, transform: [{ scale }, { translateY }], width: '100%' }}>
        <FusionResultCard fusion={fusions[0]} onClose={onClose} onUseFusion={onUseFusion} />
      </RNAnimated.View>
    );
  }

  return (
    <RNAnimated.View style={{ opacity, transform: [{ scale }, { translateY }], width: '100%' }}>
      {/* Header: 滑动提示 */}
      <View style={carouselStyles.header}>
        <Text style={[carouselStyles.headerText, { color: colors.textTertiary }]}>
          {'左右滑动查看更多融合结果'}
        </Text>
        <Text style={[carouselStyles.counter, { color: colors.primary }]}>
          {activeIndex + 1}/{fusions.length}
        </Text>
      </View>

      {/* Horizontal scroll cards */}
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={cardWidth}
        snapToAlignment="center"
        contentContainerStyle={{ paddingRight: 0 }}
        style={{ marginHorizontal: 0 }}
      >
        {fusions.map((fusion, idx) => (
          <View
            key={fusion.id || idx}
            style={{ width: cardWidth }}
          >
            <FusionResultCard
              fusion={fusion}
              onClose={onClose}
              onUseFusion={onUseFusion}
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={carouselStyles.dotsRow}>
        {fusions.map((_, idx) => (
          <Pressable key={idx} onPress={() => scrollToIndex(idx)} hitSlop={8}>
            <View
              style={[
                carouselStyles.dot,
                {
                  backgroundColor: idx === activeIndex ? colors.primary : colors.borderSubtle,
                  width: idx === activeIndex ? 20 : 8,
                },
              ]}
            />
          </Pressable>
        ))}
      </View>
    </RNAnimated.View>
  );
}

const carouselStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xxs,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  counter: {
    fontSize: 13,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    ...(Platform.OS === 'web'
      ? { transition: 'all 0.2s ease', cursor: 'pointer' as any }
      : {}),
  },
});

/* ─── Word chip ──────────────────────────────────────────── */
function WordChip({
  word,
  selected,
  onPress,
  colors,
}: {
  word: WordItem;
  selected: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        chipStyles.chip,
        {
          backgroundColor: selected ? colors.bubbleBgActive : colors.surface,
          borderColor: selected ? colors.primary : colors.borderSubtle,
          borderWidth: selected ? 1.5 : 1,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <Text style={chipStyles.icon}>{word.icon || '📝'}</Text>
      <View style={chipStyles.textWrap}>
        <Text style={[chipStyles.word, { color: selected ? colors.primaryDeep : colors.text }]} numberOfLines={1}>
          {word.word}
        </Text>
        <Text style={[chipStyles.meaning, { color: colors.textTertiary }]} numberOfLines={1}>
          {word.meaning}
        </Text>
      </View>
      {selected && (
        <View style={[chipStyles.check, { backgroundColor: colors.primary }]}>
          <Text style={chipStyles.checkText}>{'✓'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    gap: 8,
    ...(Platform.OS === 'web'
      ? { cursor: 'pointer' as any, transition: 'all 0.15s ease' }
      : {}),
  },
  icon: { fontSize: 22 },
  textWrap: { flex: 1, gap: 1 },
  word: { fontSize: 14, fontWeight: '600', letterSpacing: 0.1 },
  meaning: { fontSize: 11 },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});

/* ─── Main Screen ────────────────────────────────────────── */
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { addDiscovered } = useFusionStore();

  // Data
  const [allWords, setAllWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  // Selection (supports virtual words from fusion results)
  const [slotA, setSlotA] = useState<SlotWord | null>(null);
  const [slotB, setSlotB] = useState<SlotWord | null>(null);
  const [resolving, setResolving] = useState(false);
  const [lastFusions, setLastFusions] = useState<FusionDTO[]>([]);

  // Refs
  const scrollRef = useRef<ScrollView>(null);

  // Init
  useEffect(() => {
    ensureAuth().catch(() => {});
    loadWords();
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const words = await apiSearchWords('', 'all');
      setAllWords(words);
    } catch (err) {
      console.error('Failed to load words:', err);
    }
    setLoading(false);
  };

  // Filtered words
  const filteredWords = useMemo(() => {
    let result = allWords;
    if (category !== 'all') {
      result = result.filter((w) => w.category === category);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (w) => w.word.toLowerCase().includes(q) || w.meaning.includes(q)
      );
    }
    return result;
  }, [allWords, category, query]);

  // Fusion logic — 统一使用文本 API（Vercel Serverless Function）
  const doFusion = useCallback(
    async (wA: SlotWord, wB: SlotWord) => {
      setResolving(true);
      setLastFusions([]);
      try {
        // 统一使用文本 API，直接调用 DeepSeek
        const fusions = await apiResolveFusionByText(
          {
            word: wA.word,
            meaning: wA.virtualMeaning || wA.meaning,
            category: wA.virtualCategory || wA.category || 'other',
          },
          {
            word: wB.word,
            meaning: wB.virtualMeaning || wB.meaning,
            category: wB.virtualCategory || wB.category || 'other',
          }
        );

        setLastFusions(fusions);
        // Record the first discovery (本地存储)
        const aIsVirtual = !!wA.isVirtual;
        const bIsVirtual = !!wB.isVirtual;
        if (fusions.length > 0 && !aIsVirtual && !bIsVirtual) {
          addDiscovered(fusions[0], wA.id, wB.id).catch(() => {});
        }
      } catch (err) {
        console.error('Fusion failed:', err);
      }
      setResolving(false);
    },
    [addDiscovered]
  );

  const handleWordPress = useCallback(
    (word: WordItem) => {
      if (resolving) return;
      // Deselect
      if (slotA?.id === word.id && !slotA.isVirtual) {
        setSlotA(slotB);
        setSlotB(null);
        setLastFusions([]);
        return;
      }
      if (slotB?.id === word.id && !slotB?.isVirtual) {
        setSlotB(null);
        setLastFusions([]);
        return;
      }
      // Fill slots
      if (!slotA) {
        setSlotA(word);
        setLastFusions([]);
      } else if (!slotB) {
        setSlotB(word);
        doFusion(slotA, word);
      } else {
        // Both slots full — replace slotA, clear slotB
        setSlotA(word);
        setSlotB(null);
        setLastFusions([]);
      }
    },
    [slotA, slotB, resolving, doFusion]
  );

  const handleRandom = useCallback(async () => {
    if (resolving) return;
    setLastFusions([]);
    try {
      const { wordA, wordB } = await apiGetRandomPair();
      setSlotA(wordA);
      setSlotB(wordB);
      doFusion(wordA, wordB);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      console.error('Random pair failed:', err);
    }
  }, [resolving, doFusion]);

  const handleCloseResult = () => {
    setLastFusions([]);
    setSlotA(null);
    setSlotB(null);
  };

  /** 链式融合：将融合结果放入 slotA，继续融合 */
  const handleUseFusion = useCallback(
    (fusion: FusionDTO) => {
      const virtualWord: SlotWord = {
        id: `virtual-${fusion.result.toLowerCase()}-${Date.now()}`,
        word: fusion.result,
        meaning: fusion.meaning,
        icon: fusion.icon || '🔗',
        category: 'other',
        isVirtual: true,
        virtualMeaning: fusion.meaning,
        virtualCategory: 'other',
      };
      setSlotA(virtualWord);
      setSlotB(null);
      setLastFusions([]);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    },
    []
  );

  const wordCount = allWords.length;
  const topPad = Platform.OS === 'web' ? Spacing.lg : insets.top + Spacing.xs;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPad, paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>LexiFusion</Text>
          <Text style={[styles.subtitle, { color: c.textTertiary }]}>
            {wordCount} 词汇 · AI 创意融合
          </Text>
        </View>

        {/* ── Search Bar ── */}
        <View style={[styles.searchBar, { backgroundColor: c.surface, borderColor: c.borderSubtle }]}>
          <Text style={styles.searchIcon}>{'🔍'}</Text>
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="搜索单词 / Search words..."
            placeholderTextColor={c.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={12}>
              <Text style={[styles.clearBtn, { color: c.textTertiary }]}>{'×'}</Text>
            </Pressable>
          )}
        </View>

        {/* ── Category chips (horizontal scroll) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catContent}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setCategory(cat.id)}
              style={[
                styles.catChip,
                {
                  backgroundColor: category === cat.id ? c.primary : c.surface,
                  borderColor: category === cat.id ? c.primary : c.borderSubtle,
                },
              ]}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.catLabel,
                  { color: category === cat.id ? '#FFF' : c.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Selection Slots ── */}
        <View style={[styles.slotBar, { backgroundColor: c.surface, borderColor: c.borderSubtle }]}>
          <Pressable
            onPress={() => { if (!resolving && slotA) { setSlotA(slotB); setSlotB(null); setLastFusions([]); } }}
            style={[
              styles.slot,
              {
                backgroundColor: slotA ? c.bubbleBgActive : c.cardInner,
                borderColor: slotA ? (slotA.isVirtual ? '#F59E0B' : c.primary) : c.border,
              },
            ]}
          >
            {slotA ? (
              <>
                <Text style={styles.slotEmoji}>{slotA.icon || '?'}</Text>
                <Text style={[styles.slotWord, { color: c.text }]} numberOfLines={1}>{slotA.word}</Text>
                {slotA.isVirtual && (
                  <View style={[styles.virtualBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.virtualBadgeText}>{'🔗'}</Text>
                  </View>
                )}
                <Text style={[styles.slotX, { color: c.textTertiary }]}>{'×'}</Text>
              </>
            ) : (
              <Text style={[styles.slotPlaceholder, { color: c.textTertiary }]}>词 A</Text>
            )}
          </Pressable>

          <View style={[styles.plusCircle, { backgroundColor: resolving ? c.primary : c.tagBg }]}>
            {resolving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={[styles.plusText, { color: c.tagText }]}>{'+'}</Text>
            )}
          </View>

          <Pressable
            onPress={() => { if (!resolving && slotB) { setSlotB(null); setLastFusions([]); } }}
            style={[
              styles.slot,
              {
                backgroundColor: slotB ? c.bubbleBgActive : c.cardInner,
                borderColor: slotB ? (slotB.isVirtual ? '#F59E0B' : c.primary) : c.border,
              },
            ]}
          >
            {slotB ? (
              <>
                <Text style={styles.slotEmoji}>{slotB.icon || '?'}</Text>
                <Text style={[styles.slotWord, { color: c.text }]} numberOfLines={1}>{slotB.word}</Text>
                {slotB.isVirtual && (
                  <View style={[styles.virtualBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.virtualBadgeText}>{'🔗'}</Text>
                  </View>
                )}
                <Text style={[styles.slotX, { color: c.textTertiary }]}>{'×'}</Text>
              </>
            ) : (
              <Text style={[styles.slotPlaceholder, { color: c.textTertiary }]}>词 B</Text>
            )}
          </Pressable>

          {/* Random button */}
          <Pressable
            onPress={handleRandom}
            style={({ pressed }) => [
              styles.randomBtn,
              { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.randomIcon}>{'🎲'}</Text>
          </Pressable>
        </View>

        {/* ── Chain fusion hint ── */}
        {slotA?.isVirtual && !slotB && !resolving && (
          <View style={[styles.chainHint, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Text style={styles.chainHintIcon}>{'🔗'}</Text>
            <Text style={styles.chainHintText}>
              正在用融合词 <Text style={styles.chainHintWord}>{slotA.word}</Text> 继续融合，选一个词搭配吧
            </Text>
          </View>
        )}

        {/* ── Fusion Results (multi-carousel) ── */}
        {resolving && lastFusions.length === 0 && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={[styles.loadingText, { color: c.textTertiary }]}>{'AI 融合中...'}</Text>
          </View>
        )}
        {lastFusions.length > 0 && (
          <FusionCarousel
            fusions={lastFusions}
            onClose={handleCloseResult}
            onUseFusion={handleUseFusion}
            colors={c}
          />
        )}

        {/* ── Instruction ── */}
        {lastFusions.length === 0 && !resolving && (
          <Text style={[styles.hint, { color: c.textTertiary }]}>
            {slotA ? '再选一个词完成融合 · 或点 🎲 随机' : '选择两个词开始融合'}
          </Text>
        )}

        {/* ── Word Grid ── */}
        {loading ? (
          <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.wordGrid}>
            {filteredWords.map((w) => (
              <View key={w.id} style={styles.wordGridItem}>
                <WordChip
                  word={w}
                  selected={slotA?.id === w.id || slotB?.id === w.id}
                  onPress={() => handleWordPress(w)}
                  colors={c}
                />
              </View>
            ))}
            {filteredWords.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: c.textTertiary }]}>
                  {'没有找到匹配的词汇'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },

  /* Header */
  header: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xxs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: Spacing.sm,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  clearBtn: { fontSize: 22, fontWeight: '300' },

  /* Category chips */
  catScroll: { marginTop: Spacing.sm },
  catContent: {
    gap: 6,
    paddingVertical: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 4,
  },
  catIcon: { fontSize: 14 },
  catLabel: { fontSize: 12, fontWeight: '600' },

  /* Selection slots */
  slotBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  slot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: Radius.xs,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    gap: 6,
  },
  slotEmoji: { fontSize: 18 },
  slotWord: { fontSize: 13, fontWeight: '600', flex: 1 },
  slotX: { fontSize: 18, fontWeight: '300' },
  slotPlaceholder: { fontSize: 13, flex: 1, textAlign: 'center' },
  virtualBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 2,
  },
  virtualBadgeText: { fontSize: 10 },
  plusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: { fontSize: 16, fontWeight: '700' },
  randomBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  randomIcon: { fontSize: 20 },

  /* Chain fusion hint */
  chainHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  chainHintIcon: { fontSize: 16 },
  chainHintText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 },
  chainHintWord: { fontWeight: '700', color: '#B45309' },

  /* Loading & hint */
  loadingWrap: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: 10 },
  loadingText: { fontSize: 13, fontWeight: '500' },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },

  /* Word grid */
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
  },
  wordGridItem: {
    // roughly half width minus gap
    ...(Platform.OS === 'web'
      ? { flexBasis: 'calc(50% - 4px)' as any }
      : { width: '48%' }),
  },
  emptyWrap: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: { fontSize: 14 },
});
