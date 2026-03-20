import { icons } from '@/constants/icons';
import { colors, commonStyles, radius, spacing, typography } from '@/constants/theme';
import { ErrorResponse } from '@/interfaces/interfaces';
import { authApi } from '@/lib/api';
import { loginSchema, type LoginFormData } from '@/lib/validation';
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const handleLogin = async () => {
    setErrors({});
    try {
      const validatedData: LoginFormData = loginSchema.parse({ username, password });

      setLoading(true);
      try {
        const jwt = await authApi.login({
          username: validatedData.username,
          password: validatedData.password,
        });

        await login(jwt, { username: validatedData.username });

        try {
          const userProfile = await authApi.me();
          setUser(userProfile);
        } catch {
          // Profile fetch failed will proceed with basic username
        }

        router.replace('/(tabs)');
      } catch (error) {
        const err = error as AxiosError<ErrorResponse>;
        Alert.alert('Кирүү ийгиликсиз', err.response?.data?.message || 'Логин же сырсөз туура эмес');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: { username?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'username') fieldErrors.username = err.message;
          else if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      } else {
        Alert.alert('Ката', 'Маалыматтарыңызды текшерип, кайра аракет кылыңыз');
      }
    }
  };

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
            <Text style={s.title}>Кайра кош келиңиз</Text>
            <Text style={s.subtitle}>Окууну улантуу үчүн кириңиз</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            {/* Username */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Колдонуучу аты</Text>
              <View style={[s.inputWrapper, errors.username && s.inputError]}>
                <Ionicons name="person-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Колдонуучу атыңыз"
                  placeholderTextColor={colors.textMuted}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username && <Text style={s.errorText}>{errors.username}</Text>}
            </View>

            {/* Password */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Сырсөз</Text>
              <View style={[s.inputWrapper, errors.password && s.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Сырсөзүңүз"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeButton}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={s.errorText}>{errors.password}</Text>}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[s.button, loading && s.buttonDisabled]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.textOnAccent} />
              ) : (
                <Text style={s.buttonText}>Кирүү</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>Аккаунтуңуз жокпу? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={s.footerLink}>Каттоо</Text>
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
    marginBottom: spacing.xxxl,
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
    gap: spacing.lg,
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
