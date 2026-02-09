import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Spacing, Radius } from '@/constants/Design';
import type { WordBubble } from '@/data/themes';

const BUBBLE_SIZE = 52;

type MergeAnimationProps = {
  wordA: WordBubble;
  wordB: WordBubble;
  onComplete: () => void;
};

export function MergeAnimation({ wordA, wordB, onComplete }: MergeAnimationProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const [phase, setPhase] = useState<'start' | 'merge' | 'glow'>('start');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('merge'), 100);
    const t2 = setTimeout(() => setPhase('glow'), 500);
    const t3 = setTimeout(onComplete, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const merging = phase === 'merge' || phase === 'glow';
  const glowing = phase === 'glow';

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]} pointerEvents="none">
      {/* Center glow */}
      {glowing && (
        <View style={[styles.centerGlow, { backgroundColor: c.primary, opacity: 0.15 }]} />
      )}

      <View style={styles.row}>
        {/* Word A */}
        <View
          style={[
            styles.bubbleWrap,
            styles.bubbleWrapLeft,
            merging && styles.bubbleMergedLeft,
          ]}
        >
          <View style={[styles.bubble, { backgroundColor: c.bubbleBg, borderColor: c.bubbleBorder }]}>
            {wordA.icon ? <Text style={styles.iconText}>{wordA.icon}</Text> : null}
            <Text style={[styles.word, { color: c.text }]} numberOfLines={1}>{wordA.word}</Text>
          </View>
        </View>

        {/* Fusion indicator */}
        {merging && (
          <View style={[styles.fusionIcon, { opacity: glowing ? 1 : 0.5 }]}>
            <Text style={[styles.fusionText, { color: c.primary }]}>{'✦'}</Text>
          </View>
        )}

        {/* Word B */}
        <View
          style={[
            styles.bubbleWrap,
            styles.bubbleWrapRight,
            merging && styles.bubbleMergedRight,
          ]}
        >
          <View style={[styles.bubble, { backgroundColor: c.bubbleBg, borderColor: c.bubbleBorder }]}>
            {wordB.icon ? <Text style={styles.iconText}>{wordB.icon}</Text> : null}
            <Text style={[styles.word, { color: c.text }]} numberOfLines={1}>{wordB.word}</Text>
          </View>
        </View>
      </View>

      {/* Label */}
      <Text style={[styles.label, { color: c.textTertiary, opacity: glowing ? 1 : 0.4 }]}>
        {'融合中 Fusing...'}
      </Text>
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
  centerGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    ...(Platform.OS === 'web' ? { filter: 'blur(40px)', transition: 'opacity 0.3s ease' } : {}),
  },
  row: {
    position: 'relative',
    width: '100%',
    height: BUBBLE_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  bubbleWrap: {
    position: 'absolute',
    ...(Platform.OS === 'web' ? { transition: 'all 0.5s cubic-bezier(.4,0,.2,1)' } : {}),
  },
  bubbleWrapLeft: {
    left: '15%',
  },
  bubbleWrapRight: {
    right: '15%',
  },
  bubbleMergedLeft: {
    left: '38%',
  },
  bubbleMergedRight: {
    right: '38%',
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    padding: 4,
  },
  iconText: { fontSize: 20, marginBottom: 0 },
  word: { fontSize: 10, fontWeight: '600' },
  fusionIcon: {
    zIndex: 10,
    ...(Platform.OS === 'web' ? { transition: 'opacity 0.3s ease' } : {}),
  },
  fusionText: {
    fontSize: 24,
  },
  label: {
    marginTop: Spacing.md,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    ...(Platform.OS === 'web' ? { transition: 'opacity 0.3s ease' } : {}),
  },
});
