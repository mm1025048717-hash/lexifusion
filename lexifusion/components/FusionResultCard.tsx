import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Spacing, Radius, Typography, elevatedShadow } from '@/constants/Design';

/** Generic fusion data shape */
export type FusionData = {
  result: string;
  meaning: string;
  type: string;
  icon?: string | null;
  concept?: string | null;
  suggestedWords?: string[] | null;
  association?: string | null;
  example?: string | null;
  etymology?: string | null;
  memoryTip?: string | null;
  [key: string]: any;
};

type FusionResultCardProps = {
  fusion: FusionData;
  onClose?: () => void;
  /** Called when user wants to use this fusion result for further fusion */
  onUseFusion?: (fusion: FusionData) => void;
  /** Hint for multi-result carousel, e.g. "优先推荐" */
  indexHint?: string;
};

function typeLabel(type: string) {
  switch (type) {
    case 'compound': return '复合词 Compound';
    case 'phrase': return '短语 Phrase';
    case 'creative': return '联想 Creative';
    default: return '融合 Fusion';
  }
}

function typeColor(type: string) {
  switch (type) {
    case 'compound': return { bg: '#DBEAFE', text: '#1D4ED8' };
    case 'phrase': return { bg: '#FEF3C7', text: '#B45309' };
    default: return { bg: '#F0FDF4', text: '#16A34A' };
  }
}

export function FusionResultCard({ fusion, onClose, onUseFusion, indexHint }: FusionResultCardProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const shadow = elevatedShadow(colorScheme ?? 'light');
  const tc = typeColor(fusion.type);
  const isAI = !!(fusion.etymology || fusion.memoryTip);

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.borderSubtle, ...shadow }]}>
      {/* Close button */}
      {onClose ? (
        <Pressable onPress={onClose} hitSlop={16} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: c.textTertiary }]}>{'×'}</Text>
        </Pressable>
      ) : null}

      {/* Hero: Big Emoji + Result Word */}
      <View style={styles.hero}>
        <View style={[styles.emojiCircle, { backgroundColor: c.bubbleBg }]}>
          <Text style={styles.heroEmoji}>{fusion.icon || '✨'}</Text>
        </View>
        <Text style={[styles.heroWord, { color: c.text }]}>{fusion.result}</Text>
        <Text style={[styles.heroMeaning, { color: c.textSecondary }]}>{fusion.meaning}</Text>

        {/* Badges row */}
        <View style={styles.badgesRow}>
          {indexHint ? (
            <View style={[styles.badge, { backgroundColor: c.primary + '22' }]}>
              <Text style={[styles.badgeText, { color: c.primary }]}>{`① ${indexHint}`}</Text>
            </View>
          ) : null}
          <View style={[styles.badge, { backgroundColor: tc.bg }]}>
            <Text style={[styles.badgeText, { color: tc.text }]}>{typeLabel(fusion.type)}</Text>
          </View>
          {isAI && (
            <View style={[styles.badge, { backgroundColor: c.tagBg }]}>
              <Text style={[styles.badgeText, { color: c.tagText }]}>{'✦ AI 融合'}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Concept - the creative description */}
      {fusion.concept && fusion.concept !== fusion.meaning ? (
        <View style={[styles.conceptBlock, { backgroundColor: c.cardInner, borderColor: c.separator }]}>
          <Text style={[styles.conceptText, { color: c.text }]}>
            {fusion.concept}
          </Text>
        </View>
      ) : null}

      {/* Example Sentence */}
      {fusion.example ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>{'📝'}</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: c.textTertiary }]}>例句 Example</Text>
            <Text style={[styles.infoValue, { color: c.text }]}>{fusion.example}</Text>
          </View>
        </View>
      ) : null}

      {/* Suggested Words */}
      {fusion.suggestedWords && fusion.suggestedWords.length > 0 ? (
        <View style={styles.suggestedSection}>
          <Text style={[styles.suggestedTitle, { color: c.textTertiary }]}>{'📖 相关词汇 Related'}</Text>
          <View style={styles.suggestedTags}>
            {fusion.suggestedWords.map((w, i) => (
              <View key={i} style={[styles.suggestedTag, { backgroundColor: c.tagBg, borderColor: c.bubbleBorder }]}>
                <Text style={[styles.suggestedTagText, { color: c.tagText }]}>{w}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Association */}
      {fusion.association ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>{'💡'}</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: c.textTertiary }]}>联想 Association</Text>
            <Text style={[styles.infoValueSmall, { color: c.textSecondary }]}>{fusion.association}</Text>
          </View>
        </View>
      ) : null}

      {/* Etymology & Memory Tip */}
      {(fusion.etymology || fusion.memoryTip) ? (
        <View style={[styles.tipsRow, { borderTopColor: c.separator }]}>
          {fusion.etymology ? (
            <View style={[styles.tipBox, { backgroundColor: c.cardInner }]}>
              <Text style={styles.tipIcon}>{'📚'}</Text>
              <Text style={[styles.tipLabel, { color: c.textTertiary }]}>词源</Text>
              <Text style={[styles.tipValue, { color: c.textSecondary }]}>{fusion.etymology}</Text>
            </View>
          ) : null}
          {fusion.memoryTip ? (
            <View style={[styles.tipBox, { backgroundColor: c.cardInner }]}>
              <Text style={styles.tipIcon}>{'🧠'}</Text>
              <Text style={[styles.tipLabel, { color: c.textTertiary }]}>记忆</Text>
              <Text style={[styles.tipValue, { color: c.textSecondary }]}>{fusion.memoryTip}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Chain fusion button */}
      {onUseFusion ? (
        <Pressable
          onPress={() => onUseFusion(fusion)}
          style={({ pressed }) => [
            styles.chainFusionBtn,
            {
              backgroundColor: pressed ? c.primary : c.tagBg,
              borderColor: c.primary,
            },
          ]}
        >
          <Text style={styles.chainFusionIcon}>{'🔗'}</Text>
          <Text style={[styles.chainFusionText, { color: c.primary }]}>
            {'用这个词继续融合'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
    padding: Spacing.xxs,
  },
  closeText: { fontSize: 26, fontWeight: '300', lineHeight: 26 },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroWord: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroMeaning: {
    ...Typography.callout,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  /* Concept block */
  conceptBlock: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  conceptText: {
    ...Typography.subhead,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...Typography.caption2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    ...Typography.subhead,
    lineHeight: 22,
  },
  infoValueSmall: {
    ...Typography.footnote,
    lineHeight: 18,
  },

  /* Suggested words */
  suggestedSection: {
    marginBottom: Spacing.md,
  },
  suggestedTitle: {
    ...Typography.caption2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  suggestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  suggestedTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  suggestedTagText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Tips row */
  tipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  tipBox: {
    flex: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 3,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipValue: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 16,
  },

  /* Chain fusion button */
  chainFusionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    ...(Platform.OS === 'web'
      ? { cursor: 'pointer' as any, transition: 'all 0.15s ease' }
      : {}),
  },
  chainFusionIcon: {
    fontSize: 16,
  },
  chainFusionText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
