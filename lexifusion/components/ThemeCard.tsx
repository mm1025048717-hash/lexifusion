import React from 'react';
import { Pressable, StyleSheet, View, Text, type GestureResponderEvent } from 'react-native';
import Colors from '@/constants/Colors';
import { Spacing, Radius, Typography, cardShadow } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';
import type { Theme } from '@/data/themes';

type ThemeCardProps = {
  theme: Theme;
  onPress: (e: GestureResponderEvent) => void;
};

export function ThemeCard({ theme, onPress }: ThemeCardProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const shadow = cardShadow(colorScheme ?? 'light');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderLeftColor: c.primary,
          opacity: pressed ? 0.97 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
          ...shadow,
        },
      ]}
    >
      <View style={[styles.cover, { backgroundColor: c.surface }]}>
        <View style={[styles.coverInner, { backgroundColor: c.bubbleBg }]}>
          <Text style={styles.emoji}>{theme.coverEmoji}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: c.text }]}>{theme.name}</Text>
        <Text style={[styles.nameEn, { color: c.textSecondary }]}>{theme.nameEn}</Text>
        <Text style={[styles.desc, { color: c.textSecondary }]} numberOfLines={2}>
          {theme.description}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: c.textTertiary }]}>
            {theme.words.length} 词 words
          </Text>
          <Text style={[styles.metaDot, { color: c.textTertiary }]}>{' · '}</Text>
          <Text style={[styles.metaText, { color: c.textTertiary }]}>
            {theme.fusions.length} 种融合 fusions
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    flexDirection: 'row',
    minHeight: 116,
    borderLeftWidth: 4,
  },
  cover: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  coverInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  body: {
    flex: 1,
    padding: Spacing.md,
    paddingLeft: Spacing.sm,
    justifyContent: 'space-between',
  },
  name: {
    ...Typography.title3,
  },
  nameEn: {
    ...Typography.footnote,
    marginTop: 2,
  },
  desc: {
    ...Typography.subhead,
    lineHeight: 21,
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
  },
  metaDot: {
    fontSize: 11,
    opacity: 0.7,
  },
});
