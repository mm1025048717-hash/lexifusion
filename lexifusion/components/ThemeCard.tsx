import React from 'react';
import { Pressable, StyleSheet, View, Text, type GestureResponderEvent, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { Spacing, Radius, Typography, cardShadow } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';

type ThemeCardData = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  coverEmoji: string;
  wordCount?: number;
  fusionCount?: number;
  words?: any[];
  fusions?: any[];
};

type ThemeCardProps = {
  theme: ThemeCardData;
  onPress: (e: GestureResponderEvent) => void;
};

export function ThemeCard({ theme, onPress }: ThemeCardProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const shadow = cardShadow(colorScheme ?? 'light');
  const wordCount = theme.wordCount ?? theme.words?.length ?? 0;
  const fusionCount = theme.fusionCount ?? theme.fusions?.length ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.borderSubtle,
          opacity: pressed ? 0.97 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          ...shadow,
        },
      ]}
    >
      {/* Emoji Cover */}
      <View style={[styles.emojiWrap, { backgroundColor: c.bubbleBg }]}>
        <Text style={styles.emoji}>{theme.coverEmoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: c.text }]}>{theme.name}</Text>
          <Text style={[styles.nameEn, { color: c.textTertiary }]}>{theme.nameEn}</Text>
        </View>
        <Text style={[styles.desc, { color: c.textSecondary }]} numberOfLines={2}>
          {theme.description}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.metaTag, { backgroundColor: c.tagBg }]}>
            <Text style={[styles.metaTagText, { color: c.tagText }]}>
              {wordCount} 词
            </Text>
          </View>
          <View style={[styles.metaTag, { backgroundColor: c.tagBg }]}>
            <Text style={[styles.metaTagText, { color: c.tagText }]}>
              {fusionCount} 融合
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.arrowWrap}>
        <Text style={[styles.arrow, { color: c.textTertiary }]}>{'›'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any, transition: 'all 0.2s ease' } : {}),
  },
  emojiWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  emoji: {
    fontSize: 32,
  },
  body: {
    flex: 1,
    paddingVertical: Spacing.xxs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  name: {
    ...Typography.headline,
  },
  nameEn: {
    ...Typography.caption,
  },
  desc: {
    ...Typography.footnote,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  metaTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  metaTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrowWrap: {
    paddingLeft: Spacing.sm,
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
  },
});
