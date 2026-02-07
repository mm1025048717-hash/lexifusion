import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing, Radius } from '@/constants/Design';
import type { WordBubble } from '@/data/themes';

const BUBBLE_SIZE = 44;

type MergeAnimationProps = {
  wordA: WordBubble;
  wordB: WordBubble;
  onComplete: () => void;
};

export function MergeAnimation({ wordA, wordB, onComplete }: MergeAnimationProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const t = setTimeout(onComplete, 900);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]} pointerEvents="none">
      <View style={styles.row}>
        <View style={[styles.bubbleWrap, styles.bubbleWrapLeft]}>
          <View style={[styles.bubble, { backgroundColor: c.bubbleBg, borderColor: c.bubbleBorder }]}>
            {wordA.icon ? <Text style={styles.icon}>{wordA.icon}</Text> : null}
            <Text style={[styles.word, { color: c.text }]} numberOfLines={1}>{wordA.word}</Text>
          </View>
        </View>
        <View style={[styles.bubbleWrap, styles.bubbleWrapRight]}>
          <View style={[styles.bubble, { backgroundColor: c.bubbleBg, borderColor: c.bubbleBorder }]}>
            {wordB.icon ? <Text style={styles.icon}>{wordB.icon}</Text> : null}
            <Text style={[styles.word, { color: c.text }]} numberOfLines={1}>{wordB.word}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  row: {
    position: 'relative',
    width: '100%',
    height: BUBBLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleWrap: { position: 'absolute', top: 0 },
  bubbleWrapLeft: { left: Spacing.xl },
  bubbleWrapRight: { right: Spacing.xl },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    padding: 4,
  },
  icon: { fontSize: 18, marginBottom: 0 },
  word: { fontSize: 10, fontWeight: '600' },
});
