import { colors, commonStyles, radius, shadows, spacing, typography } from "@/constants/theme";
import { useBookmarks } from "@/hooks/useAppQuery";
import { BookmarkResponse } from "@/interfaces/interfaces";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Saved() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const bottomPadding = Platform.OS === "android" ? insets.bottom + 40 : insets.bottom + 20;
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: bookmarks, isLoading, refetch } = useBookmarks();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const bookmarkItems = bookmarks || [];

  const runAnimations = useCallback(() => {
    headerAnim.setValue(0);
    cardAnim.setValue(0);
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: 500, delay: 150, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, cardAnim]);

  useFocusEffect(useCallback(() => { runAnimations(); if (accessToken) refetch(); }, [runAnimations, accessToken, refetch]));

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View
        style={[
          s.header,
          { height: 96 + statusBarHeight, paddingTop: statusBarHeight },
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
      >
        <Text style={s.headerTitle}>Белгиленгендер</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingTop: spacing.xl, paddingBottom: bottomPadding, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Auth guard */}
        {!accessToken ? (
          <Animated.View style={[s.authGuard, { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <View style={s.authIconCircle}>
              <Ionicons name="bookmark-outline" size={36} color={colors.accent} />
            </View>
            <Text style={s.authTitle}>Кирүү керек</Text>
            <Text style={s.authSubtitle}>
              Белгиленген китептерди көрүү үчүн аккаунтуңузга кириңиз
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              style={s.authButton}
              activeOpacity={0.85}
            >
              <Text style={s.authButtonText}>Кирүү</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/auth/register')} style={s.authLink}>
              <Text style={s.authLinkText}>Аккаунт түзүү</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : isLoading ? (
          <View style={s.centered}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : bookmarkItems.length === 0 ? (
          <Animated.View style={[s.emptyState, { opacity: cardAnim }]}>
            <View style={s.iconCircle}>
              <Ionicons name="bookmark-outline" size={36} color={colors.textMuted} />
            </View>
            <Text style={s.emptyTitle}>Белгиленгендер жок</Text>
            <Text style={s.emptySubtitle}>Китепти белгилегенде бул жерде көрүнөт</Text>
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <Text style={s.sectionTitle}>Белгиленген китептер</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: spacing.lg, paddingBottom: spacing.xl }}
            >
              {bookmarkItems.map((bookmark: BookmarkResponse) => (
                <TouchableOpacity
                  key={bookmark.id}
                  onPress={() => router.push(`/books/${bookmark.workId}`)}
                  style={s.bookCard}
                  activeOpacity={0.8}
                >
                  {bookmark.workImageUrl ? (
                    <Image
                      source={{ uri: bookmark.workImageUrl }}
                      style={s.bookImage}
                      contentFit="cover"
                      transition={300}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={s.bookPlaceholder}>
                      <Ionicons name="book-outline" size={24} color={colors.textMuted} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    ...commonStyles.headerBar,
  },
  headerTitle: { ...commonStyles.headerTitle },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },

  // Auth guard
  authGuard: { alignItems: "center", paddingHorizontal: spacing.xxl, paddingTop: 60 },
  authIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.accentTint,
    alignItems: "center", justifyContent: "center",
    marginBottom: spacing.lg,
  },
  authTitle: { ...typography.title, textAlign: "center" },
  authSubtitle: { ...typography.bodySecondary, textAlign: "center", marginTop: spacing.sm },
  authButton: {
    ...commonStyles.buttonPrimary,
    paddingHorizontal: 48,
    marginTop: spacing.xl,
  },
  authButtonText: { ...commonStyles.buttonPrimaryText },
  authLink: { marginTop: spacing.md },
  authLinkText: { ...typography.body, color: colors.accent, fontWeight: "600" },

  // Empty state
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xxl, paddingBottom: 80 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.skeleton,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: { ...typography.headline, marginTop: spacing.lg },
  emptySubtitle: { ...typography.bodySecondary, marginTop: spacing.xs },

  // Bookmark cards
  sectionTitle: {
    fontWeight: "800", fontSize: 16, lineHeight: 19,
    color: colors.text, marginLeft: spacing.lg, marginBottom: spacing.md,
  },
  bookCard: {
    width: 100, height: 145, borderRadius: radius.md,
    overflow: "hidden", marginRight: spacing.md,
    ...shadows.md,
  },
  bookImage: { width: "100%", height: "100%" },
  bookPlaceholder: {
    width: "100%", height: "100%",
    backgroundColor: colors.skeleton, alignItems: "center", justifyContent: "center",
  },
});
