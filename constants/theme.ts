export const colors = {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    accent: '#E84326',
    accentLight: '#FF5C3A',
    accentTint: 'rgba(232, 67, 38, 0.08)',

    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textOnAccent: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#E84326',

    error: '#EF4444',
    errorTint: 'rgba(239, 68, 68, 0.08)',
    success: '#34C759',
    successTint: 'rgba(52, 199, 89, 0.08)',
    warning: '#FF9500',
    skeleton: '#F3F4F6',
} as const;
export const typography = {
    largeTitle: {
        fontSize: 28,
        fontWeight: '800' as const,
        letterSpacing: -0.5,
        color: colors.text,
    },

    title: {
        fontSize: 22,
        fontWeight: '700' as const,
        letterSpacing: -0.3,
        color: colors.text,
    },

    headline: {
        fontSize: 17,
        fontWeight: '600' as const,
        color: colors.text,
    },

    body: {
        fontSize: 15,
        fontWeight: '400' as const,
        lineHeight: 22,
        color: colors.text,
    },

    bodySecondary: {
        fontSize: 15,
        fontWeight: '400' as const,
        lineHeight: 22,
        color: colors.textSecondary,
    },

    caption: {
        fontSize: 13,
        fontWeight: '400' as const,
        color: colors.textSecondary,
    },

    small: {
        fontSize: 11,
        fontWeight: '500' as const,
        letterSpacing: 0.3,
        color: colors.textMuted,
    },
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 20,
    full: 9999,
} as const;

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
} as const;

export const commonStyles = {
    input: {
        height: 52,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    buttonPrimary: {
        height: 52,
        backgroundColor: colors.accent,
        borderRadius: radius.lg,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    buttonPrimaryText: {
        color: colors.textOnAccent,
        fontSize: 17,
        fontWeight: '600' as const,
    },
    headerBar: {
        backgroundColor: colors.accent,
        justifyContent: 'flex-end' as const,
        paddingHorizontal: spacing.lg + 3,
        paddingBottom: 18,
    },
    headerTitle: {
        fontWeight: '800' as const,
        fontSize: 20,
        lineHeight: 24,
        color: colors.textOnAccent,
    },
} as const;
