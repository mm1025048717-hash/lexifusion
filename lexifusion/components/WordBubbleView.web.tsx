import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Radius } from '@/constants/Design';
import type { WordBubble } from '@/data/themes';
import { getImageForWord } from '@/data/themes';

const BUBBLE_SIZE = 66;
const BUBBLE_IMG_SIZE = 32;

type WordBubbleViewProps = {
  word: WordBubble;
  selected?: boolean;
  onPress: () => void;
  index?: number;
};

export function WordBubbleView({ word, selected, onPress }: WordBubbleViewProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const [imgError, setImgError] = useState(false);
  const imageUri = word.imageUrl ?? getImageForWord(word.word);

  return (
    <View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.bubble,
          {
            backgroundColor: selected ? c.primaryLight : c.bubbleBg,
            borderColor: selected ? c.primary : c.bubbleBorder,
            borderWidth: selected ? 2 : 1,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        {!imgError && imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.bubbleImg, { width: BUBBLE_IMG_SIZE, height: BUBBLE_IMG_SIZE }]}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.bubbleImgPlaceholder, { backgroundColor: c.borderSubtle }]}>
            <Text style={[styles.bubbleImgFallback, { color: c.textSecondary }]} numberOfLines={1}>
              {word.word.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.word, { color: c.text }]} numberOfLines={1}>
          {word.word}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  bubbleImg: {
    width: BUBBLE_IMG_SIZE,
    height: BUBBLE_IMG_SIZE,
    borderRadius: Radius.sm,
    marginBottom: 2,
  },
  bubbleImgPlaceholder: {
    width: BUBBLE_IMG_SIZE,
    height: BUBBLE_IMG_SIZE,
    borderRadius: Radius.sm,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleImgFallback: {
    fontSize: 16,
    fontWeight: '700',
  },
  word: { fontSize: 10, fontWeight: '600' },
});
