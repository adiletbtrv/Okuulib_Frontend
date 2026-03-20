import { colors, shadows } from "@/constants/theme";
import { useBookDetails } from "@/hooks/useBookDetails";
import { getCoverUrl } from "@/interfaces/helpers";
import { bookmarksApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");
const COVER_W = 140;
const COVER_H = 210;
const FALLBACK = "https://placehold.co/260x390/ddd/555?text=No+Cover";

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workId = id ? Number(id) : 0;
  const { user } = useAuthStore();

  const { data: book, isLoading, error } = useBookDetails(workId);
  const [bookmarking, setBookmarking] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);

  React.useEffect(() => {
    if (user && book) {
      checkIsBookmarked();
    }
  }, [user, book]);

  const checkIsBookmarked = async () => {
    try {
      const res = await bookmarksApi.getAll({ size: 100 });
      const existing = res.content.find((b) => b.workId === workId);
      if (existing) {
        setBookmarked(true);
        setBookmarkId(existing.id);
      } else {
        setBookmarked(false);
        setBookmarkId(null);
      }
    } catch (err) {
      if (__DEV__) console.warn("[Bookmark] check error:", err);
    }
  };

  const scrollY = useRef(new Animated.Value(0)).current;
  const chapters = useMemo(() => book?.chapters ?? [], [book]);
  const coverUrl = book ? (getCoverUrl(book) ?? FALLBACK) : FALLBACK;

  // Header parallax
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, 1], extrapolate: "clamp" });
  const coverScale = scrollY.interpolate({ inputRange: [-80, 0], outputRange: [1.12, 1], extrapolate: "clamp" });

  const handleBookmark = async () => {
    if (!user) {
      Alert.alert("Кирүү талап кылынат", "Белгилөө үчүн кирип алыңыз.");
      return;
    }
    if (!book || bookmarking) return;

    if (bookmarked && bookmarkId) {
      // Unbookmark logic
      setBookmarking(true);
      try {
        await bookmarksApi.delete(bookmarkId);
        setBookmarked(false);
        setBookmarkId(null);
        Alert.alert("Ийгиликтүү", "Китеп китепканадан өчүрүлдү!");
      } catch (err: any) {
        if (__DEV__) console.error("[Bookmark] Delete error:", err);
        Alert.alert("Ката", "Өчүрүү учурунда ката кетти.");
      } finally {
        setBookmarking(false);
      }
      return;
    }

    if (chapters.length === 0) {
      Alert.alert("Ката", "Бул китепте бөлүмдөр жок, белгилөө мүмкүн эмес.");
      return;
    }
    const firstChapter = chapters[0];
    const payload = {
      workId: book.workId,
      chapterId: firstChapter.chapterNumber,
      chunkId: firstChapter.chunks?.[0]?.chunkId ?? 1,
      startOffset: 0,
      endOffset: 1,
    };
    setBookmarking(true);
    try {
      const res = await bookmarksApi.create(payload);
      setBookmarked(true);
      setBookmarkId(res.id);
      Alert.alert("Ийгиликтүү", "Китеп белгиленди!");
    } catch (err: any) {
      if (__DEV__) console.error("[Bookmark] Error:", err?.response?.data || err?.message || err);
      const serverMsg = err?.response?.data?.error?.message;
      Alert.alert("Ката", serverMsg || "Белгилөө учурунда ката кетти.");
    } finally {
      setBookmarking(false);
    }
  };

  // States
  if (!workId) return (
    <SafeAreaView style={[s.flex, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ color: colors.textMuted }}>Китеп табылган жок.</Text>
    </SafeAreaView>
  );

  if (isLoading) return (
    <SafeAreaView style={[s.flex, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
      <ActivityIndicator color={colors.accent} />
    </SafeAreaView>
  );

  if (error || !book) return (
    <SafeAreaView style={[s.flex, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }]}>
      <Text style={{ color: colors.textMuted, textAlign: "center", marginBottom: 24, lineHeight: 22 }}>
        Китеп жүктөлгөн жок. Кийинчерээк аракет кылыңыз.
      </Text>
      <TouchableOpacity style={s.pill} onPress={() => router.back()}>
        <Text style={s.pillText}>Артка</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const authorName = book.author?.name ?? "Автор белгисиз";

  return (
    <View style={[s.flex, { backgroundColor: colors.background }]}>
      {/* Floating sticky header */}
      <Animated.View style={[s.stickyHeader, { opacity: headerOpacity }]} pointerEvents="none">
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={s.stickyTitle} numberOfLines={1}>{book.title}</Text>
      </Animated.View>

      {/* Back button */}
      <SafeAreaView style={s.backWrap} edges={["top"]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={s.hero}>
          <Animated.View style={[s.heroBg, { transform: [{ scale: coverScale }] }]}>
            <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={40} />
            <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.8)", colors.background]} style={StyleSheet.absoluteFill} />
          </Animated.View>

          {/* Cover card */}
          <View style={s.coverCard}>
            <Image source={{ uri: coverUrl }} style={s.cover} contentFit="cover" transition={300} cachePolicy="memory-disk" />
          </View>
        </View>

        {/* Meta block */}
        <View style={s.meta}>
          <Text style={s.title}>{book.title}</Text>
          <Text style={s.author}>{authorName}</Text>

          {/* Genre pills */}
          {book.genres?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 8 }}>
              {book.genres.map((g) => (
                <View key={g.id} style={s.genrePill}>
                  <Text style={s.genreText}>{g.name}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* CTA row */}
          <View style={s.ctaRow}>
            <TouchableOpacity
              style={s.readBtn}
              onPress={() => router.push(`/reader/${workId}`)}
              activeOpacity={0.85}
            >
              <Text style={s.readBtnText}>Окуу</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.bookmarkBtn, bookmarked && { backgroundColor: colors.accentTint, borderColor: colors.accent }]}
              onPress={handleBookmark}
              disabled={bookmarking}
              activeOpacity={0.7}
            >
              {bookmarking ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Аннотация</Text>
          <Text style={s.body}>{book.description || "Сыпаттама жок."}</Text>
        </View>

        {/* Other works */}
        {book.otherWorks && book.otherWorks.length > 0 && (
          <>
            <View style={s.divider} />
            <View style={s.section}>
              <Text style={s.sectionLabel}>Автордун башка чыгармалары</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 12 }}>
                {book.otherWorks.map((w) => (
                  <TouchableOpacity key={w.id} onPress={() => router.push(`/books/${w.id}`)} activeOpacity={0.8}>
                    <Image source={{ uri: w.coverUrl ?? FALLBACK }} style={s.otherCover} contentFit="cover" cachePolicy="memory-disk" />
                    <Text style={s.otherTitle} numberOfLines={2}>{w.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* Chapters */}
        {chapters.length > 0 && (
          <>
            <View style={s.divider} />
            <View style={s.section}>
              <Text style={s.sectionLabel}>Мазмуну — {chapters.length} бөлүм</Text>
              <View style={{ marginTop: 12, gap: 2 }}>
                {chapters.map((ch, idx) => (
                  <TouchableOpacity
                    key={ch.chapterNumber}
                    style={[s.chapterRow, idx === chapters.length - 1 && { borderBottomWidth: 0 }]}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/reader/${workId}`)}
                  >
                    <Text style={s.chapterNum}>{String(ch.chapterNumber).padStart(2, "0")}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.chapterTitle}>{ch.chapterTitle}</Text>
                      <Text style={s.chapterMeta}>{ch.chunks?.length ?? 0} бөлүк</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </Animated.ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  // Sticky header
  stickyHeader: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, height: 100, alignItems: "center", justifyContent: "flex-end", paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  stickyTitle: { color: colors.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  // Back button
  backWrap: { position: "absolute", top: 0, left: 0, zIndex: 200, paddingLeft: 16, paddingTop: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.7)" },
  // Hero
  hero: { height: 340, alignItems: "center", justifyContent: "flex-end", paddingBottom: 0 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  coverCard: {
    width: COVER_W, height: COVER_H,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.15, shadowRadius: 24,
    elevation: 12,
    marginBottom: -COVER_H / 2,
  },
  cover: { width: "100%", height: "100%" },
  // Meta
  meta: { paddingTop: COVER_H / 2 + 24, paddingHorizontal: 24, paddingBottom: 8, alignItems: "center" },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.5, textAlign: "center", lineHeight: 32, marginBottom: 8 },
  author: { color: colors.accent, fontSize: 15, fontWeight: "600", letterSpacing: 0.2 },
  genrePill: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  genreText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  ctaRow: { flexDirection: "row", marginTop: 28, gap: 14, width: "100%" },
  readBtn: { flex: 1, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", ...shadows.md },
  readBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", letterSpacing: 0.2 },
  bookmarkBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  // Sections
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 24, marginVertical: 24 },
  section: { paddingHorizontal: 24 },
  sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 },
  body: { color: colors.text, fontSize: 15, lineHeight: 24, marginTop: 10 },
  // Other works
  otherCover: { width: 90, height: 135, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  otherTitle: { color: colors.textMuted, fontSize: 12, marginTop: 8, width: 90, lineHeight: 16, fontWeight: "500" },
  // Chapters
  chapterRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  chapterNum: { color: colors.textMuted, fontSize: 14, fontWeight: "700", width: 28, fontVariant: ["tabular-nums"] },
  chapterTitle: { color: colors.text, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  chapterMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  // Generic
  pill: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  pillText: { color: "#FFFFFF", fontWeight: "700" },
});