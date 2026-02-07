import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Radius } from '@/constants/Design';
import type { WordBubble } from '@/data/themes';
import { getImageForWord } from '@/data/themes';

const BUBBLE_SIZE = 66;
const BUBBLE_IMG_SIZE = 32;
const FLOAT_RANGE = 3;
const FLOAT_DURATION = 2800;
const BREATH_SCALE = 0.02;

type WordBubbleViewProps = {
  word: WordBubble;
  selected?: boolean;
  onPress: () => void;
  index?: number;
};

export function WordBubbleView({ word, selected, onPress, index = 0 }: WordBubbleViewProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const float = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: FLOAT_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: FLOAT_DURATION / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(float.value, [0, 1], [FLOAT_RANGE, -FLOAT_RANGE]);
    const scale = 1 + interpolate(breath.value, [0, 1], [0, BREATH_SCALE]);
    return { transform: [{ translateY }, { scale }] };
  }, []);

  return (
    <Animated.View style={animatedStyle}>
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
        <Image
          source={{ uri: word.imageUrl ?? getImageForWord(word.word) }}
          style={styles.bubbleImg}
          resizeMode="cover"
        />
        <Text style={[styles.word, { color: c.text }]} numberOfLines={1}>
          {word.word}
        </Text>
      </Pressable>
    </Animated.View>
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
  word: {
    fontSize: 10,
    fontWeight: '600',
  },
});
