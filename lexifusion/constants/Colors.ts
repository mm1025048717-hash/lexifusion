/**
 * 顶级设计系统 · Apple-grade · 绿白极简
 * 灵感来源：苹果 Health、Mint、自然光影
 * 色彩哲学：绿色代表生长与融合，白色代表纯净与呼吸
 */

export const LexiGreen = {
  /** 主色调：深邃的翡翠绿 */
  primary: '#22C55E',
  /** 主色浅色变体 */
  primaryLight: '#4ADE80',
  /** 主色深色变体 */
  primaryDark: '#16A34A',
  /** 极深绿 - 用于标题 */
  primaryDeep: '#15803D',
  /** 气泡、标签等浅绿 */
  soft: '#F0FDF4',
  softMid: '#DCFCE7',
  softBorder: '#BBF7D0',
  /** 深绿文案、强调 */
  ink: '#14532D',
  /** 极浅背景绿——几乎白色 */
  bg: '#FAFDFB',
  /** 纯白 */
  white: '#FFFFFF',
  /** 分隔、边框（极淡绿相） */
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  /** 玻璃态背景 */
  glass: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(34,197,94,0.12)',
} as const;

const tintLight = LexiGreen.primary;
const tintDark = LexiGreen.primaryLight;

export default {
  light: {
    text: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    background: LexiGreen.bg,
    surface: LexiGreen.white,
    card: LexiGreen.white,
    border: '#E5E7EB',
    borderSubtle: '#F3F4F6',
    tint: tintLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintLight,
    primary: LexiGreen.primary,
    primaryLight: LexiGreen.primaryLight,
    primaryDark: LexiGreen.primaryDark,
    primaryDeep: LexiGreen.primaryDeep,
    bubbleBg: LexiGreen.soft,
    bubbleBgActive: LexiGreen.softMid,
    bubbleBorder: LexiGreen.softBorder,
    separator: '#F3F4F6',
    /** 渐变起点 */
    gradientStart: '#F0FDF4',
    gradientEnd: LexiGreen.bg,
    /** 成功色 */
    success: '#22C55E',
    /** 高亮标签背景 */
    tagBg: '#F0FDF4',
    tagText: '#16A34A',
    /** 卡片内部浅灰背景 */
    cardInner: '#F9FAFB',
    /** AI 标签专用 */
    aiBadgeBg: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    aiBadgeText: '#FFFFFF',
    /** glass */
    glass: LexiGreen.glass,
    glassBorder: LexiGreen.glassBorder,
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#6B7280',
    background: '#030712',
    surface: '#111827',
    card: '#1F2937',
    border: '#374151',
    borderSubtle: '#1F2937',
    tint: tintDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintDark,
    primary: LexiGreen.primaryLight,
    primaryLight: '#86EFAC',
    primaryDark: LexiGreen.primary,
    primaryDeep: LexiGreen.primaryLight,
    bubbleBg: '#1A2E1E',
    bubbleBgActive: '#1E3A24',
    bubbleBorder: '#2D4A33',
    separator: '#1F2937',
    gradientStart: '#0A1F0E',
    gradientEnd: '#030712',
    success: '#4ADE80',
    tagBg: '#1A2E1E',
    tagText: '#4ADE80',
    cardInner: '#111827',
    aiBadgeBg: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
    aiBadgeText: '#030712',
    glass: 'rgba(17,24,39,0.72)',
    glassBorder: 'rgba(74,222,128,0.15)',
  },
};
