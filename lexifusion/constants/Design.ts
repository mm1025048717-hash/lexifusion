/**
 * 顶级设计系统 · Apple-grade · 绿白极简
 * SF Pro 字阶 · 8pt 栅格 · 毛玻璃 · 微动效
 */

import { Platform } from 'react-native';

/** 间距（8pt 栅格） */
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** 圆角：Apple 级柔和 */
export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
  full: 9999,
} as const;

/** 字阶：SF Pro 灵感 · 精确层级 */
export const Typography = {
  /** 32pt 粗标题 */
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    lineHeight: 41,
  },
  /** 28pt 页面标题 */
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  /** 22pt 模块标题 */
  title2: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  /** 20pt 卡片标题 */
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    lineHeight: 25,
  },
  /** 17pt 强调 */
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  /** 17pt 正文 */
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  /** 16pt 辅助正文 */
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  /** 15pt 副标题 */
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  /** 13pt 注脚 */
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  /** 12pt 标签 */
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  /** 11pt 小标签 */
  caption2: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 13,
  },
};

/** 卡片阴影：Apple 标准 - 极柔和、有深度 */
export function cardShadow(colorScheme: 'light' | 'dark') {
  const isDark = colorScheme === 'dark';
  if (Platform.OS === 'web') {
    // Web 用 CSS boxShadow
    return isDark
      ? { boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25)' }
      : { boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' };
  }
  if (Platform.OS === 'ios') {
    return {
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 16,
    };
  }
  return { elevation: isDark ? 8 : 3 };
}

export function subtleShadow(colorScheme: 'light' | 'dark') {
  const isDark = colorScheme === 'dark';
  if (Platform.OS === 'web') {
    return isDark
      ? { boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }
      : { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' };
  }
  if (Platform.OS === 'ios') {
    return {
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 6,
    };
  }
  return { elevation: isDark ? 2 : 1 };
}

/** 浮起阴影 - 用于 hover / pressed 状态 */
export function elevatedShadow(colorScheme: 'light' | 'dark') {
  const isDark = colorScheme === 'dark';
  if (Platform.OS === 'web') {
    return isDark
      ? { boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)' }
      : { boxShadow: '0 4px 20px rgba(34,197,94,0.08), 0 12px 40px rgba(0,0,0,0.08)' };
  }
  if (Platform.OS === 'ios') {
    return {
      shadowColor: isDark ? '#000' : '#22C55E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 24,
    };
  }
  return { elevation: isDark ? 12 : 8 };
}

/** 动画时长常量 */
export const Duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  entrance: 400,
} as const;

/** 动画缓动 */
export const Easing = {
  /** Apple 标准弹性 */
  spring: { damping: 20, stiffness: 180, mass: 1 },
  /** 柔和弹性 */
  gentle: { damping: 28, stiffness: 120, mass: 1 },
} as const;
