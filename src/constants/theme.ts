import { Platform } from 'react-native';

export const CalculatorColors = {
  background: '#000000',
  displayBackground: '#000000',
  displayText: '#FFFFFF',
  expressionText: '#8E8E93',
  lockedResultText: '#F59E0B',
  
  // Buttons
  numberButton: '#2C2C2E',
  numberButtonPressed: '#48484A',
  numberText: '#FFFFFF',

  functionButton: '#505054',
  functionButtonPressed: '#707074',
  functionText: '#FFFFFF',

  operatorButton: '#FF9F0A',
  operatorButtonPressed: '#CC7F08',
  operatorActiveBackground: '#FFFFFF',
  operatorActiveText: '#FF9F0A',
  operatorText: '#FFFFFF',

  // Pro Paywall UI
  proCardBackground: '#16161A',
  proCardBorder: '#2E2E36',
  proGold: '#FBBF24',
  proGoldLight: '#FEF08A',
  proGoldDark: '#B45309',
  proAccentGradientStart: '#FF9F0A',
  proAccentGradientEnd: '#F43F5E',
  successGreen: '#10B981',
  dangerRed: '#EF4444',
  overlayBackground: 'rgba(0, 0, 0, 0.82)',
  sheetHandle: '#3F3F46',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
};
