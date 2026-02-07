/**
 * 顶级绿白配色：和谐、克制、高端
 * 全链路绿白统一，无冷灰打断
 */

export const LexiGreen = {
  primary: '#2D9D6B',
  primaryLight: '#3DB87D',
  primaryDark: '#1E7A4C',
  /** 气泡、标签等浅绿 */
  soft: '#E8F3EE',
  softBorder: '#B8D4C4',
  /** 深绿文案、强调 */
  ink: '#1C2E26',
  /** 极浅背景绿 */
  bg: '#F6FAF8',
  /** 分隔、边框（带绿相） */
  border: '#E2EBE6',
  borderLight: '#EEF3F0',
} as const;

const tintLight = LexiGreen.primary;
const tintDark = LexiGreen.primaryLight;

export default {
  light: {
    text: LexiGreen.ink,
    textSecondary: '#5C6B63',
    textTertiary: '#8A9A92',
    background: LexiGreen.bg,
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: LexiGreen.border,
    borderSubtle: LexiGreen.borderLight,
    tint: tintLight,
    tabIconDefault: '#8A9A92',
    tabIconSelected: tintLight,
    primary: LexiGreen.primary,
    primaryLight: LexiGreen.primaryLight,
    primaryDark: LexiGreen.primaryDark,
    bubbleBg: LexiGreen.soft,
    bubbleBorder: LexiGreen.softBorder,
    separator: LexiGreen.border,
  },
  dark: {
    text: '#F2F7F4',
    textSecondary: '#B8C9BF',
    textTertiary: '#7A8E84',
    background: '#0D1612',
    surface: '#162019',
    card: '#1C2822',
    border: '#2A3B32',
    borderSubtle: '#243229',
    tint: tintDark,
    tabIconDefault: '#7A8E84',
    tabIconSelected: tintDark,
    primary: LexiGreen.primaryLight,
    primaryLight: '#4DD18A',
    primaryDark: LexiGreen.primary,
    bubbleBg: '#1E3228',
    bubbleBorder: '#2A4034',
    separator: '#2A3B32',
  },
};
