import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { BookCarouselSkeleton } from "@/components/ui/Skeleton";
import { icons } from "@/constants/icons";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useBooks, useGenres } from "@/hooks/useAppQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Library() {
  const { user } = useAuthStore();
  const [avatar, setAvatar] = useState<string | null>(null);
  const { data: genresList } = useGenres();
  const genres = (genresList || []).map((g) => g.name);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: books, isLoading, error } = useBooks();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    AsyncStorage.getItem("userAvatar").then(setAvatar);
  }, []);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    headerAnim.setValue(0);
    contentAnim.setValue(0);
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 500, delay: 150, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, contentAnim]);

  const getBooksByGenre = useCallback(
    (genreName: string) => {
      if (!books || !Array.isArray(books)) return [];
      return books.filter((b) =>
        b?.genres?.some(
          (g) => g?.name?.includes(genreName) || genreName.includes(g?.name || "")
        )
      );
    },
    [books]
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={s.container}>
        <View style={[s.headerBar, { paddingTop: insets.top }]}>
          <View style={{ height: 20, width: 160, backgroundColor: colors.skeleton, borderRadius: 6 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={{ marginTop: spacing.xl }}>
            <View style={{ height: 36, backgroundColor: colors.skeleton, borderRadius: 8, marginHorizontal: spacing.lg, marginBottom: spacing.lg }} />
            <BookCarouselSkeleton count={5} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[typography.headline, { marginTop: spacing.md }]}>Китептер жүктөлбөдү</Text>
        <Text style={[typography.bodySecondary, { marginTop: spacing.xs }]}>Интернетти текшерип, кайра аракет кылыңыз</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <Animated.View
        style={[
          s.headerBar,
          { paddingTop: insets.top },
          { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] },
        ]}
      >
        <Image source={icons.logo} contentFit="contain" cachePolicy="memory-disk" style={s.logo} />
        <View style={s.searchContainer}>
          <SearchBar onSearchStatusChange={setIsSearching} />
        </View>
        {user && (
          <TouchableOpacity onPress={() => router.push("/profile" as any)} style={s.avatarButton} activeOpacity={0.8}>
            <Image source={avatar ? { uri: avatar } : icons.defaultAvatar} contentFit="cover" cachePolicy="memory-disk" style={s.avatar} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Content */}
      {!isSearching && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          <Animated.View style={{ opacity: contentAnim }}>
            {/* Genre Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.genreScroll}
            >
              <TouchableOpacity
                style={[s.genrePill, !selectedGenre && s.genrePillActive]}
                onPress={() => setSelectedGenre(null)}
                activeOpacity={0.7}
              >
                <Text style={[s.genrePillText, !selectedGenre && s.genrePillTextActive]}>Бардыгы</Text>
              </TouchableOpacity>
              {genres.map((genre, i) => {
                const active = selectedGenre === genre;
                return (
                  <TouchableOpacity
                    key={genre + i}
                    style={[s.genrePill, active && s.genrePillActive]}
                    onPress={() => setSelectedGenre(active ? null : genre)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.genrePillText, active && s.genrePillTextActive]}>{genre}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Book carousels */}
            {selectedGenre ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>{selectedGenre}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carouselScroll}>
                  {getBooksByGenre(selectedGenre).length > 0 ? (
                    getBooksByGenre(selectedGenre).map((book) => (
                      <View key={book.id} style={s.bookCardWrap}>
                        <BookCard id={book.id} title={book.title} subtitle={book.authorName} coverUrl={book.imageUrl} />
                      </View>
                    ))
                  ) : (
                    <View style={s.emptyGenre}>
                      <Ionicons name="book-outline" size={32} color={colors.textMuted} />
                      <Text style={s.emptyGenreText}>Бул жанрда китептер жок</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            ) : (
              genres.map((genre, index) => {
                const genreBooks = getBooksByGenre(genre);
                if (genreBooks.length === 0) return null;
                return (
                  <View key={genre + index} style={s.section}>
                    <Text style={s.sectionTitle}>{genre}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carouselScroll}>
                      {genreBooks.map((book) => (
                        <View key={book.id} style={s.bookCardWrap}>
                          <BookCard id={book.id} title={book.title} subtitle={book.authorName} isShowTitle={false} coverUrl={book.imageUrl} />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                );
              })
            )}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

// Styles
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  logo: { width: 35, height: 35 },
  searchContainer: { flex: 1, marginHorizontal: spacing.md },
  avatarButton: { width: 36, height: 36, borderRadius: 18, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },

  // Genre pills
  genreScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  genrePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genrePillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  genrePillText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  genrePillTextActive: {
    color: colors.textOnAccent,
    fontWeight: "600",
  },

  // Sections
  section: { marginTop: spacing.lg },
  sectionTitle: {
    ...typography.title,
    fontSize: 20,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  carouselScroll: {
    paddingLeft: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  bookCardWrap: { marginRight: spacing.md },

  // Empty genre
  emptyGenre: {
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.get("window").width - spacing.lg * 2,
    paddingVertical: spacing.xxl,
  },
  emptyGenreText: {
    ...typography.bodySecondary,
    marginTop: spacing.sm,
  },
});
