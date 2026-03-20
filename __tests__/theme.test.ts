import { colors, spacing } from '../constants/theme';

describe('Theme Constants', () => {
  it('should have all required color keys defined strictly', () => {
    const requiredColors = [
      'background', 'surface', 'accent', 'accentLight', 'accentTint',
      'text', 'textSecondary', 'textMuted', 'textOnAccent',
      'border', 'borderFocus', 'error', 'errorTint', 'success', 'successTint', 'warning', 'skeleton'
    ] as const;
    requiredColors.forEach(key => {
      expect(colors[key]).toBeDefined();
    });
    expect(colors.accent).toBe('#E84326');
  });

  it('should have proper spacing scale', () => {
    expect(spacing.md).toBe(12);
    expect(spacing.lg).toBe(16);
  });
});
