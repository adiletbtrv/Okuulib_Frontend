import BookCard from "@/components/BookCard";
import PosterBanner from "@/components/PosterBanner";
import SearchBar from "@/components/SearchBar";
import { BookCarouselSkeleton } from "@/components/ui/Skeleton";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { colors, shadows, spacing, typography } from "@/constants/theme";
import { useBooks } from "@/hooks/useBooks";
import { useAuthStore } from "@/store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { user } = useAuthStore();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { data: books, isLoading } = useBooks();


  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const bottomPadding = Platform.OS === "android" ? insets.bottom + 40 : insets.bottom + 20;

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("userAvatar").then(setAvatar);
    }, [])
  );

  // Staggered spring animations so each section cascades in
  const headerAnim = useRef(new Animated.Value(0)).current;
  const section1 = useRef(new Animated.Value(0)).current;
  const section2 = useRef(new Animated.Value(0)).current;
  const section3 = useRef(new Animated.Value(0)).current;
  const section4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anims = [headerAnim, section1, section2, section3, section4];
    anims.forEach((a) => a.setValue(0));
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, damping: 20, stiffness: 200, useNativeDriver: true }),
      Animated.spring(section1, { toValue: 1, damping: 22, stiffness: 180, useNativeDriver: true }),
      Animated.spring(section2, { toValue: 1, damping: 22, stiffness: 180, useNativeDriver: true }),
      Animated.spring(section3, { toValue: 1, damping: 22, stiffness: 180, useNativeDriver: true }),
      Animated.spring(section4, { toValue: 1, damping: 22, stiffness: 180, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, section1, section2, section3, section4]);

  // Book sections
  const bestCollections = useMemo(() => (Array.isArray(books) ? books.slice(0, 5) : []), [books]);
  const recommended = useMemo(() => (Array.isArray(books) ? books.slice(5, 7) : []), [books]);
  const classics = useMemo(() => (Array.isArray(books) ? books.slice(7, 12) : []), [books]);
  const top10 = useMemo(() => (Array.isArray(books) ? books.slice(0, 10) : []), [books]);
  const latestBook = useMemo(() => (Array.isArray(books) && books.length > 0 ? books[books.length - 1] : null), [books]);

  // Loading skeleton
  if (isLoading) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="dark-content" />
        <View style={[s.headerBar, { paddingTop: insets.top }]}>
          <View style={s.skeletonLine} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPadding }}>
          <View style={{ marginTop: spacing.xl }}>
            <View style={[s.skeletonLine, { width: 200, marginLeft: spacing.lg, marginBottom: spacing.sm }]} />
            <BookCarouselSkeleton count={5} />
          </View>
          <View style={[s.skeletonBanner, { alignSelf: "center", marginVertical: spacing.xl }]} />
          <View style={{ marginTop: spacing.lg }}>
            <View style={[s.skeletonLine, { width: 180, marginLeft: spacing.lg, marginBottom: spacing.sm }]} />
            <BookCarouselSkeleton count={2} width={Dimensions.get("window").width - 48} height={130} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Animated.View
        style={[
          s.headerBar,
          { paddingTop: insets.top },
          { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] },
        ]}
      >
        <Image
          source={icons.logo}
          contentFit="contain"
          cachePolicy="memory-disk"
          style={s.logo}
        />
        <View style={s.searchContainer}>
          <SearchBar onSearchStatusChange={setIsSearching} />
        </View>
        {user && (
          <TouchableOpacity
            onPress={() => router.push("/profile" as any)}
            style={s.avatarButton}
            activeOpacity={0.8}
          >
            <Image
              source={avatar ? { uri: avatar } : icons.defaultAvatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              style={s.avatar}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Content */}
      {!isSearching && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        >
          <>
            {/* Best Collections */}
            <Animated.View style={{ opacity: section1, transform: [{ translateY: section1.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              <Section title="Эң мыкты жыйнактар">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.carouselScroll}
                >
                  {bestCollections.map((book) => (
                    <View key={book.id} style={s.bookCardWrap}>
                      <BookCard
                        id={book.id}
                        title={book.title}
                        subtitle={book.authorName}
                        coverUrl={book.imageUrl}
                      />
                    </View>
                  ))}
                </ScrollView>
              </Section>
            </Animated.View>

            {/* Banner */}
            {latestBook && (
              <Animated.View style={{ opacity: section2, transform: [{ translateY: section2.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
                <PosterBanner
                  title={latestBook.title}
                  description={latestBook.description || "Бул китепти биринчилерден болуп окуңуз."}
                  image={latestBook.imageUrl ? { uri: latestBook.imageUrl } : images.poster_manas_1}
                  link={`/books/${latestBook.id}`}
                />
              </Animated.View>
            )}

            {/* Recommended */}
            <Animated.View style={{ opacity: section2, transform: [{ translateY: section2.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              <Section title="Сизге жагуу мүмкүн">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.carouselScroll}
                >
                  {recommended.map((book) => (
                    <TouchableOpacity
                      key={book.id}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/books/${book.id}`)}
                      style={s.recommendedCard}
                    >
                      <Image
                        source={book.imageUrl ? { uri: book.imageUrl } : images.poster_manas_1}
                        style={s.recommendedImage}
                        contentFit="cover"
                        transition={300}
                        cachePolicy="memory-disk"
                      />
                      <View style={s.recommendedInfo}>
                        <Text style={s.recommendedTitle} numberOfLines={2}>{book.title}</Text>
                        <Text style={s.recommendedAuthor} numberOfLines={1}>{book.authorName}</Text>
                        <Text style={s.recommendedDesc} numberOfLines={4}>
                          {book.description || "Сүрөттөмө жок"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Section>
            </Animated.View>

            {/* Classics */}
            <Animated.View style={{ opacity: section3, transform: [{ translateY: section3.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              <Section title="Кыргыз классикалар">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.carouselScroll}
                >
                  {classics.map((book) => (
                    <View key={book.id} style={s.bookCardWrap}>
                      <BookCard
                        id={book.id}
                        title={book.title}
                        subtitle={book.authorName}
                        coverUrl={book.imageUrl}
                      />
                    </View>
                  ))}
                </ScrollView>
              </Section>
            </Animated.View>

            {/* Top 10 */}
            <Animated.View style={{ opacity: section4, transform: [{ translateY: section4.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              <Section title="Айдагы Топ-10">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[s.carouselScroll, { paddingBottom: spacing.xl }]}
                >
                  {top10.map((book) => (
                    <View key={book.id} style={s.bookCardWrap}>
                      <BookCard
                        id={book.id}
                        title={book.title}
                        subtitle={book.authorName}
                        coverUrl={book.imageUrl}
                      />
                    </View>
                  ))}
                </ScrollView>
              </Section>
            </Animated.View>
          </>
        </ScrollView>
      )}
    </View>
  );
}

// Section component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// Styles
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  logo: {
    width: 35,
    height: 35,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },

  // Sections
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.title,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  carouselScroll: {
    paddingLeft: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  bookCardWrap: {
    marginRight: spacing.md,
  },

  // Recommended cards
  recommendedCard: {
    flexDirection: "row",
    width: 300,
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: spacing.md,
    ...shadows.md,
  },
  recommendedImage: {
    width: 95,
    height: 140,
  },
  recommendedInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
  },
  recommendedTitle: {
    ...typography.headline,
    marginBottom: 4,
  },
  recommendedAuthor: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  recommendedDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  // Skeleton
  skeletonLine: {
    height: 20,
    width: 160,
    backgroundColor: colors.skeleton,
    borderRadius: 6,
  },
  skeletonBanner: {
    width: 342,
    height: 143,
    backgroundColor: colors.skeleton,
    borderRadius: 12,
  },
});
