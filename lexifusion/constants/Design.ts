/**
 * 顶级和谐设计系统：绿白 · 极简 · 高端
 * 8pt 栅格 · 柔和阴影 · 统一圆角
 */

import { Platform } from 'react-native';
import { LexiGreen } from './Colors';

/** 间距（8pt 栅格） */
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

/** 圆角：柔和统一 */
export const Radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  full: 9999,
} as const;

/** 字阶：清晰层级、略松字距 */
export const Typography = {
  largeTitle: { fontSize: 32, fontWeight: '600' as const, letterSpacing: -0.3 },
  title: { fontSize: 26, fontWeight: '600' as const, letterSpacing: -0.2 },
  title2: { fontSize: 22, fontWeight: '600' as const },
  title3: { fontSize: 19, fontWeight: '600' as const },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  callout: { fontSize: 15, fontWeight: '400' as const },
  subhead: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  footnote: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  caption2: { fontSize: 11, fontWeight: '500' as const },
};

/** 卡片阴影：极柔、带绿相（光感和谐） */
export function cardShadow(colorScheme: 'light' | 'dark') {
  const isDark = colorScheme === 'dark';
  if (Platform.OS === 'ios') {
    return {
      shadowColor: isDark ? '#000' : LexiGreen.ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.25 : 0.06,
      shadowRadius: 16,
    };
  }
  if (Platform.OS === 'android') {
    return { elevation: isDark ? 6 : 3 };
  }
  return {};
}

export function subtleShadow(colorScheme: 'light' | 'dark') {
  const isDark = colorScheme === 'dark';
  if (Platform.OS === 'ios') {
    return {
      shadowColor: isDark ? '#000' : LexiGreen.ink,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.15 : 0.04,
      shadowRadius: 8,
    };
  }
  if (Platform.OS === 'android') {
    return { elevation: isDark ? 3 : 1 };
  }
  return {};
}
