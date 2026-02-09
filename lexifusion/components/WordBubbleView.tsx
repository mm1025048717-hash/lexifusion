import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Radius, Spacing } from '@/constants/Design';
import type { WordBubble } from '@/data/themes';

type WordBubbleViewProps = {
  word: WordBubble;
  selected?: boolean;
  onPress: () => void;
  index?: number;
  compact?: boolean;
};

export function WordBubbleView({ word, selected, onPress, compact }: WordBubbleViewProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.bubble,
        compact && styles.bubbleCompact,
        {
          backgroundColor: selected ? c.bubbleBgActive : c.card,
          borderColor: selected ? c.primary : c.borderSubtle,
          borderWidth: selected ? 2 : 1,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.93 : selected ? 1.03 : 1 }],
        },
      ]}
    >
      <Text style={[styles.icon, compact && styles.iconCompact]}>
        {word.icon || word.word.charAt(0).toUpperCase()}
      </Text>
      <Text
        style={[
          styles.word,
          compact && styles.wordCompact,
          { color: selected ? c.primaryDeep : c.text },
        ]}
        numberOfLines={1}
      >
        {word.word}
      </Text>
      {!compact && (
        <Text style={[styles.meaning, { color: c.textTertiary }]} numberOfLines={1}>
          {word.meaning}
        </Text>
      )}
      {selected && (
        <View style={[styles.checkmark, { backgroundColor: c.primary }]}>
          <Text style={styles.checkmarkText}>{'✓'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    position: 'relative',
    minWidth: 80,
  },
  bubbleCompact: {
    minWidth: 68,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
  },
  icon: {
    fontSize: 30,
    marginBottom: 4,
  },
  iconCompact: {
    fontSize: 24,
    marginBottom: 2,
  },
  word: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  wordCompact: {
    fontSize: 11,
  },
  meaning: {
    fontSize: 10,
    marginTop: 1,
    opacity: 0.7,
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
