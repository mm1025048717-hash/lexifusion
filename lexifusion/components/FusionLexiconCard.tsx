import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Spacing, Radius, Typography, cardShadow } from '@/constants/Design';
import { getImageForWord } from '@/data/themes';

type FusionData = {
  result: string;
  meaning: string;
  type: string;
  concept?: string | null;
  association?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  etymology?: string | null;
  memoryTip?: string | null;
};

type FusionLexiconCardProps = {
  fusion: FusionData;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

function typeLabel(type: string) {
  switch (type) {
    case 'compound': return 'Compound';
    case 'phrase': return 'Phrase';
    case 'creative': return 'Concept';
    default: return 'Fusion';
  }
}

function typeColor(type: string) {
  switch (type) {
    case 'compound': return { bg: '#DBEAFE', text: '#1D4ED8' };
    case 'phrase': return { bg: '#FEF3C7', text: '#B45309' };
    default: return { bg: '#F0FDF4', text: '#16A34A' };
  }
}

export function FusionLexiconCard({ fusion, isFavorite, onToggleFavorite }: FusionLexiconCardProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const shadow = cardShadow(colorScheme ?? 'light');
  const imageUrl = fusion.imageUrl ?? getImageForWord(fusion.result);
  const [imgError, setImgError] = useState(false);
  const tc = typeColor(fusion.type);
  const isAI = !!(fusion.etymology || fusion.memoryTip);

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.borderSubtle, ...shadow }]}>
      {/* Image or Placeholder */}
      {!imgError ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.thumb}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: c.bubbleBg }]}>
          {fusion.icon ? (
            <Text style={styles.thumbIcon}>{fusion.icon}</Text>
          ) : (
            <Text style={[styles.thumbLetter, { color: c.primary }]}>
              {fusion.result.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      )}

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.result, { color: c.text }]} numberOfLines={1}>{fusion.result}</Text>
          <View style={styles.badges}>
            <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
              <Text style={[styles.typeBadgeText, { color: tc.text }]}>{typeLabel(fusion.type)}</Text>
            </View>
            {isAI && (
              <View style={[styles.aiBadge, { backgroundColor: c.tagBg }]}>
                <Text style={[styles.aiBadgeText, { color: c.tagText }]}>{'✦ AI'}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.meaning, { color: c.textSecondary }]} numberOfLines={2}>
          {fusion.type === 'creative' ? (fusion.concept || fusion.meaning) : fusion.meaning}
        </Text>
        {fusion.association ? (
          <Text style={[styles.association, { color: c.textTertiary }]} numberOfLines={1}>
            {'💡 '}{fusion.association}
          </Text>
        ) : null}
      </View>

      {/* Favorite Button */}
      <Pressable
        onPress={onToggleFavorite}
        style={({ pressed }) => [styles.favBtn, { opacity: pressed ? 0.7 : 1 }]}
        hitSlop={12}
      >
        <FontAwesome
          name={isFavorite ? 'heart' : 'heart-o'}
          size={18}
          color={isFavorite ? '#EF4444' : c.textTertiary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } : {}),
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: {
    fontSize: 22,
  },
  thumbLetter: {
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    marginLeft: Spacing.md,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  result: {
    ...Typography.headline,
    flex: 0,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  meaning: {
    ...Typography.footnote,
    lineHeight: 18,
  },
  association: {
    fontSize: 11,
    marginTop: 1,
  },
  favBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
