import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { Spacing, Radius } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';
import type { WordBubble } from '@/data/themes';

const BUBBLE_SIZE = 56;
const DURATION_MOVE = 520;
const WHEN_FLASH_STARTS = 460;
const DURATION_FLASH_IN = 140;
const DURATION_FLASH_OUT = 320;
const WHEN_FADE_STARTS = WHEN_FLASH_STARTS + DURATION_FLASH_IN + 80;
const DURATION_FADE = 260;

type MergeAnimationProps = {
  wordA: WordBubble;
  wordB: WordBubble;
  onComplete: () => void;
};

export function MergeAnimation({ wordA, wordB, onComplete }: MergeAnimationProps) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const leftX = useSharedValue(-95);
  const rightX = useSharedValue(95);
  const bubbleScale = useSharedValue(1);
  const bubbleOpacity = useSharedValue(1);
  const flashScale = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const flashHaloScale = useSharedValue(0);
  const flashHaloOpacity = useSharedValue(0);

  useEffect(() => {
    // 两气泡向中心靠拢，缓动更顺滑
    leftX.value = withTiming(0, { duration: DURATION_MOVE, easing: Easing.out(Easing.cubic) });
    rightX.value = withTiming(0, { duration: DURATION_MOVE, easing: Easing.out(Easing.cubic) });

    // 相遇时轻微放大再收回，更有「碰撞」感
    bubbleScale.value = withDelay(
      WHEN_FLASH_STARTS - 100,
      withSequence(
        withSpring(1.2, { damping: 11, stiffness: 180 }),
        withTiming(1, { duration: 140, easing: Easing.inOut(Easing.ease) })
      )
    );

    // 中心闪光：内层亮圈
    flashScale.value = withDelay(
      WHEN_FLASH_STARTS,
      withTiming(1.35, { duration: DURATION_FLASH_IN, easing: Easing.out(Easing.cubic) })
    );
    flashOpacity.value = withDelay(
      WHEN_FLASH_STARTS,
      withSequence(
        withTiming(0.5, { duration: DURATION_FLASH_IN }),
        withTiming(0, { duration: DURATION_FLASH_OUT, easing: Easing.in(Easing.ease) })
      )
    );
    // 外层光晕：更大、更柔
    flashHaloScale.value = withDelay(
      WHEN_FLASH_STARTS + 20,
      withTiming(1.9, { duration: DURATION_FLASH_IN + 40, easing: Easing.out(Easing.cubic) })
    );
    flashHaloOpacity.value = withDelay(
      WHEN_FLASH_STARTS + 20,
      withSequence(
        withTiming(0.28, { duration: DURATION_FLASH_IN + 40 }),
        withTiming(0, { duration: DURATION_FLASH_OUT - 40, easing: Easing.in(Easing.ease) })
      )
    );

    const finish = () => runOnJS(onComplete)();
    bubbleOpacity.value = withDelay(
      WHEN_FADE_STARTS,
      withTiming(0, { duration: DURATION_FADE }, (finished) => {
        'worklet';
        if (finished) finish();
      })
    );
  }, []);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftX.value }, { scale: bubbleScale.value }],
    opacity: bubbleOpacity.value,
  }));
  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightX.value }, { scale: bubbleScale.value }],
    opacity: bubbleOpacity.value,
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));
  const flashHaloStyle = useAnimatedStyle(() => ({
    opacity: flashHaloOpacity.value,
    transform: [{ scale: flashHaloScale.value }],
  }));

  const bubbleShadow = Platform.select({
    ios: {
      shadowColor: c.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: { elevation: 6 },
    default: {},
  });

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]} pointerEvents="none">
      <Animated.View style={[styles.flash, flashHaloStyle]}>
        <View style={[styles.flashHalo, { backgroundColor: c.primaryLight }]} />
      </Animated.View>
      <Animated.View style={[styles.flash, flashStyle]}>
        <View style={[styles.flashInner, { backgroundColor: c.primaryLight }]} />
      </Animated.View>
      <View style={styles.row}>
        <Animated.View style={[styles.bubbleWrap, styles.bubbleWrapLeft, leftStyle]}>
          <View style={[styles.bubble, { backgroundColor: c.bubbleBg, borderColor: c.bubbleBorder }, bubbleShadow]}>
            {wordA.icon ? <Text style={styles.icon}>{wordA.icon}</Text> : null}
            <Text style={[styles.word, { color: c.text }]} numberOfLines={1}>{wordA.word}</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.bubbleWrap, styles.bubbleWrapRight, rightStyle]}>
          <View style={[styles.bubble, { backgroundColor: c.bubbleBg, borderColor: c.bubbleBorder }, bubbleShadow]}>
            {wordB.icon ? <Text style={styles.icon}>{wordB.icon}</Text> : null}
            <Text style={[styles.word, { color: c.text }]} numberOfLines={1}>{wordB.word}</Text>
          </View>
        </Animated.View>
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
  flash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 1,
  },
  flashHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 1,
  },
  row: {
    position: 'relative',
    width: '100%',
    height: BUBBLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleWrap: {
    position: 'absolute',
    top: 0,
  },
  bubbleWrapLeft: { left: Spacing.lg },
  bubbleWrapRight: { right: Spacing.lg },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    padding: 8,
  },
  icon: { fontSize: 22, marginBottom: 0 },
  word: { fontSize: 11, fontWeight: '600' },
});
