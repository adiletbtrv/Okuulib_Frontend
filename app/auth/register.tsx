import { icons } from '@/constants/icons';
import { colors, commonStyles, radius, spacing, typography } from '@/constants/theme';
import { ErrorResponse } from '@/interfaces/interfaces';
import { authApi } from '@/lib/api';
import { registerSchema, type RegisterFormData } from '@/lib/validation';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { AxiosError } from 'axios';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ZodError } from 'zod';

export default function RegisterScreen() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleRegister = async () => {
    setErrors({});
    try {
      const validatedData: RegisterFormData = registerSchema.parse({
        email,
        username,
        password,
        confirmPassword,
      });

      setLoading(true);
      try {
        const registerRes = await authApi.register({
          username: validatedData.username,
          email: validatedData.email,
          password: validatedData.password,
          confirmPassword: validatedData.confirmPassword,
        });

        const jwtForStore = {
          accessToken: registerRes.accessToken,
          tokenType: 'Bearer',
        };

        await login(jwtForStore, { username: registerRes.username, email: registerRes.email });

        try {
          const userProfile = await authApi.me();
          setUser(userProfile);
        } catch {
          // Non-critical
        }

        router.replace('/(tabs)');
      } catch (error) {
        const err = error as AxiosError<ErrorResponse>;
        Alert.alert('Каттоо ийгиликсиз', err.response?.data?.message || 'Бир нерсе туура эмес кетти');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: typeof errors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof errors;
          if (field) fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        Alert.alert('Ката', 'Маалыматтарыңызды текшерип, кайра аракет кылыңыз');
      }
    }
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const fields = [
    {
      key: 'email' as const,
      label: 'Email',
      icon: 'mail-outline' as const,
      placeholder: 'email@example.com',
      value: email,
      onChangeText: (t: string) => { setEmail(t); clearError('email'); },
      keyboardType: 'email-address' as const,
    },
    {
      key: 'username' as const,
      label: 'Колдонуучу аты',
      icon: 'person-outline' as const,
      placeholder: 'Колдонуучу атыңыз',
      value: username,
      onChangeText: (t: string) => { setUsername(t); clearError('username'); },
    },
    {
      key: 'password' as const,
      label: 'Сырсөз',
      icon: 'lock-closed-outline' as const,
      placeholder: 'Мин. 8 тамга, 1 чоң, 1 кичине, 1 сан',
      value: password,
      onChangeText: (t: string) => { setPassword(t); clearError('password'); },
      secure: true,
    },
    {
      key: 'confirmPassword' as const,
      label: 'Сырсөздү ырастоо',
      icon: 'shield-checkmark-outline' as const,
      placeholder: 'Сырсөздү кайталаңыз',
      value: confirmPassword,
      onChangeText: (t: string) => { setConfirmPassword(t); clearError('confirmPassword'); },
      secure: true,
    },
  ];

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <Image source={icons.logo} style={{ width: 80, height: 80, marginBottom: 16 }} resizeMode="contain" />
            <Text style={s.title}>Аккаунт түзүү</Text>
            <Text style={s.subtitle}>Окуу жолуңузду баштаңыз</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            {fields.map((f) => (
              <View key={f.key} style={s.fieldGroup}>
                <Text style={s.label}>{f.label}</Text>
                <View style={[s.inputWrapper, errors[f.key] && s.inputError]}>
                  <Ionicons name={f.icon} size={18} color={colors.textMuted} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={f.value}
                    onChangeText={f.onChangeText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType={f.keyboardType}
                    secureTextEntry={f.secure && !showPassword}
                  />
                  {f.secure && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeButton}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {errors[f.key] && <Text style={s.errorText}>{errors[f.key]}</Text>}
              </View>
            ))}

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={[s.button, loading && s.buttonDisabled]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.textOnAccent} />
              ) : (
                <Text style={s.buttonText}>Каттоо</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>Аккаунтуңуз барбы? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={s.footerLink}>Кирүү</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },

  title: {
    ...typography.largeTitle,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs + 2,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginLeft: spacing.xs,
  },
  button: {
    ...commonStyles.buttonPrimary,
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...commonStyles.buttonPrimaryText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '700',
  },
});
