import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
  Image,
  Platform,
  useWindowDimensions,
  type ListRenderItem,
} from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Spacing, Radius, Typography, cardShadow } from '@/constants/Design';
import type { FusionResult } from '@/data/themes';
import { getImageForWord } from '@/data/themes';

const CARD_PADDING = Spacing.lg;
const IMG_HEIGHT = 180;
const SLIDE_GAP = Spacing.sm;

type FusionResultCardProps = {
  fusion: FusionResult;
  onClose?: () => void;
};

export type FusionSlide = {
  id: string;
  word: string;
  meaning?: string;
  imageUrl: string;
};

function typeLabel(type: FusionResult['type']) {
  switch (type) {
    case 'compound': return '复合词 Compound';
    case 'phrase': return '场景搭配 Phrase';
    case 'creative': return '概念融合 Concept Fusion';
    default: return '融合 Fusion';
  }
}

function buildSlides(fusion: FusionResult): FusionSlide[] {
  const isCreative = fusion.type === 'creative';
  const mainMeaning = isCreative ? fusion.concept : fusion.meaning;
  const slides: FusionSlide[] = [
    {
      id: 'main',
      word: fusion.result,
      meaning: mainMeaning,
      imageUrl: fusion.imageUrl ?? getImageForWord(fusion.result),
    },
  ];
  (fusion.suggestedWords ?? []).forEach((w, i) => {
    slides.push({
      id: `suggest-${i}-${w}`,
      word: w,
      imageUrl: fusion.imageUrls?.[i] ?? getImageForWord(w),
    });
  });
  return slides;
}

export function FusionResultCard({ fusion, onClose }: FusionResultCardProps) {
  const { width: winWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const shadow = cardShadow(colorScheme ?? 'light');
  const slides = useMemo(() => buildSlides(fusion), [fusion]);
  const [index, setIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<string>>(() => new Set());

  const slideWidth = winWidth - CARD_PADDING * 2 - Spacing.lg * 2;
  const slideStep = slideWidth + SLIDE_GAP;

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / slideStep);
    if (i !== index && i >= 0 && i < slides.length) setIndex(i);
  };

  const getItemLayout = (_: FusionSlide[] | null, idx: number) => ({
    length: slideStep,
    offset: slideStep * idx,
    index: idx,
  });

  const onSlideImageError = (id: string) => {
    setImgErrors((prev) => new Set(prev).add(id));
  };

  const renderSlideContent = (item: FusionSlide) => {
    const showPlaceholder = !item.imageUrl || imgErrors.has(item.id);
    return (
      <View style={[styles.slide, { width: slideWidth }]}>
        {showPlaceholder ? (
          <View style={[styles.imgWrap, styles.imgWrapPlaceholder, { backgroundColor: c.borderSubtle }]}>
            <Text style={[styles.imgPlaceholderText, { color: c.textSecondary }]} numberOfLines={2}>
              {item.word}
            </Text>
          </View>
        ) : (
          <View style={[styles.imgWrap, { backgroundColor: c.borderSubtle }]}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.img}
              resizeMode="cover"
              onError={() => onSlideImageError(item.id)}
            />
          </View>
        )}
        <Text style={[styles.slideWord, { color: c.text }]}>{item.word}</Text>
        {item.meaning ? (
          <Text style={[styles.slideMeaning, { color: c.textSecondary }]} numberOfLines={2}>
            {item.meaning}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderSlide: ListRenderItem<FusionSlide> = ({ item }) => renderSlideContent(item);

  const isWeb = Platform.OS === 'web';
  const carouselContent = isWeb ? (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(e) => onScroll(e as Parameters<typeof onScroll>[0])}
      onScrollEndDrag={(e) => onScroll(e as Parameters<typeof onScroll>[0])}
      decelerationRate="fast"
      snapToInterval={slideStep}
      snapToAlignment="start"
      contentContainerStyle={styles.flatListContent}
      style={[styles.flatList, { width: slideWidth }]}
    >
      {slides.map((item) => (
        <View key={item.id} style={{ width: slideStep }}>{renderSlideContent(item)}</View>
      ))}
    </ScrollView>
  ) : (
    <FlatList
      data={slides}
      renderItem={renderSlide}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onScroll}
      onScrollEndDrag={onScroll}
      decelerationRate="fast"
      snapToInterval={slideStep}
      snapToAlignment="start"
      getItemLayout={getItemLayout}
      contentContainerStyle={styles.flatListContent}
      style={[styles.flatList, { width: slideWidth }]}
    />
  );

  return (
    <View style={[styles.card, { backgroundColor: c.card, ...shadow }]}>
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        {fusion.icon ? <Text style={styles.icon}>{fusion.icon}</Text> : null}
        <View style={styles.headerText}>
          <Text style={[styles.badge, { color: c.textTertiary }]}>
            {typeLabel(fusion.type)}
          </Text>
        </View>
        {onClose ? (
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Text style={{ color: c.textTertiary, fontSize: 22 }}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {carouselContent}

      {slides.length > 1 ? (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? c.primary : c.borderSubtle },
              ]}
            />
          ))}
        </View>
      ) : null}

      {fusion.association ? (
        <Text style={[styles.association, { color: c.textSecondary }]}>
          联想 Association: {fusion.association}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  icon: { fontSize: 26, marginRight: Spacing.sm },
  headerText: { flex: 1 },
  badge: { ...Typography.caption },
  closeBtn: { padding: Spacing.xxs },
  flatList: { flexGrow: 0 },
  flatListContent: { paddingVertical: Spacing.md },
  slide: {
    marginRight: SLIDE_GAP,
  },
  imgWrap: {
    width: '100%',
    height: IMG_HEIGHT,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  imgWrapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  imgPlaceholderText: {
    ...Typography.title3,
    textAlign: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  slideWord: {
    ...Typography.title3,
    marginTop: Spacing.sm,
  },
  slideMeaning: {
    ...Typography.subhead,
    marginTop: 4,
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  association: {
    ...Typography.subhead,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
