import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Spacing, Radius, Typography } from '@/constants/Design';
import type { FusionResult } from '@/data/themes';
import { getImageForWord } from '@/data/themes';

type FusionLexiconCardProps = {
  fusion: FusionResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

function typeLabel(type: FusionResult['type']) {
  switch (type) {
    case 'compound': return '复合词 Compound';
    case 'phrase': return '场景搭配 Phrase';
    case 'creative': return '概念融合 Concept Fusion';
    default: return '融合 Fusion';
  }
}

export function FusionLexiconCard({ fusion, isFavorite, onToggleFavorite }: FusionLexiconCardProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const imageUrl = fusion.imageUrl ?? getImageForWord(fusion.result);

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.borderSubtle }]}>
      <Image source={{ uri: imageUrl }} style={styles.thumb} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={[styles.result, { color: c.text }]} numberOfLines={1}>{fusion.result}</Text>
        <Text style={[styles.meaning, { color: c.textSecondary }]} numberOfLines={2}>
          {fusion.type === 'creative' ? fusion.concept : fusion.meaning}
        </Text>
        {fusion.association ? (
          <Text style={[styles.association, { color: c.textTertiary }]} numberOfLines={1}>
            联想 Association: {fusion.association}
          </Text>
        ) : null}
        <Text style={[styles.typeLabel, { color: c.textTertiary }]}>{typeLabel(fusion.type)}</Text>
      </View>
      <Pressable
        onPress={onToggleFavorite}
        style={({ pressed }) => [styles.favBtn, { opacity: pressed ? 0.7 : 1 }]}
        hitSlop={12}
      >
        <FontAwesome
          name={isFavorite ? 'heart' : 'heart-o'}
          size={20}
          color={isFavorite ? c.primary : c.textTertiary}
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
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
  },
  body: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  result: {
    ...Typography.headline,
    marginBottom: 2,
  },
  meaning: {
    ...Typography.footnote,
    marginBottom: 2,
  },
  association: {
    fontSize: 11,
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 10,
  },
  favBtn: {
    padding: Spacing.xs,
  },
});
