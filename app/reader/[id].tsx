import { useBookDetails } from "@/hooks/useBookDetails";
import { getCoverUrl } from "@/interfaces/helpers";
import type { ChapterResponse, ChunkResponse } from "@/interfaces/interfaces";
import { useReaderThemeStore } from "@/store/useReaderThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");
const CONTENT_W = SCREEN_W - 48;

const darkC = {
  bg: "#0E0E0E",
  surface: "#161616",
  border: "rgba(255,255,255,0.06)",
  accent: "#E8341A",
  white: "#FFFFFF",
  offWhite: "#EDE9E3",
  body: "#C8C3BB",
  muted: "#5C5C5C",
  mutedLight: "#8A8A8A",
};

const lightC = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  border: "#E4E4E7",
  accent: "#E84326",
  white: "#FFFFFF",
  offWhite: "#18181B",
  body: "#3F3F46",
  muted: "#9CA3AF",
  mutedLight: "#6B7280",
};

type ThemeColors = typeof darkC;

interface ChapterChunkItemProps {
  chunk: ChunkResponse;
  contentWidth: number;
  htmlBase: React.ComponentProps<typeof RenderHtml>["baseStyle"];
  htmlTags: React.ComponentProps<typeof RenderHtml>["tagsStyles"];
  coverUrl: string | null | undefined;
}

const ChapterChunkItem = React.memo<ChapterChunkItemProps>(
  ({ chunk, contentWidth, htmlBase, htmlTags, coverUrl }) => {
    return (
      <View style={{ marginBottom: 16 }}>
        {chunk.chunkType === "image" ? (
          <Image
            source={{ uri: chunk.text || coverUrl || "" }}
            style={{ width: contentWidth, height: contentWidth * 0.6, borderRadius: 12 }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <RenderHtml
            contentWidth={contentWidth}
            source={{ html: chunk.text || "" }}
            baseStyle={htmlBase}
            tagsStyles={htmlTags}
            renderersProps={{ img: { enableExperimentalPercentWidth: true } }}
          />
        )}
      </View>
    );
  },
  (prev, next) =>
    prev.chunk.chunkId === next.chunk.chunkId &&
    prev.chunk.text === next.chunk.text &&
    prev.chunk.chunkType === next.chunk.chunkType &&
    prev.contentWidth === next.contentWidth &&
    prev.coverUrl === next.coverUrl &&
    prev.htmlBase === next.htmlBase &&
    prev.htmlTags === next.htmlTags
);

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const workId = id ? Number(id) : 0;

  const themeMode = useReaderThemeStore((state) => state.theme);
  const isLight = themeMode === "light";
  const C = isLight ? lightC : darkC;
  const s = useMemo(() => createStyles(C, isLight), [C, isLight]);
  const { htmlBase, htmlTags } = useMemo(() => createHtmlStyles(C), [C]);

  const { data: book, isLoading, error } = useBookDetails(workId);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const flatListRef = useRef<FlatList<ChunkResponse>>(null);
  const lastScrollY = useRef(0);
  const headerAnim = useRef(new Animated.Value(1)).current;

  const sortedChapters = useMemo(() => {
    if (!book?.chapters) return [];
    return [...book.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [book]);

  const chapter: ChapterResponse | undefined = sortedChapters[chapterIdx];
  const sortedChunks = useMemo(() => {
    if (!chapter?.chunks) return [];
    return [...chapter.chunks].sort((a, b) => a.chunkNumber - b.chunkNumber);
  }, [chapter]);

  const isFirst = chapterIdx === 0;
  const isLast = chapterIdx === sortedChapters.length - 1;

  const goChapter = (dir: 1 | -1) => {
    setChapterIdx((i) => i + dir);
  };

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [chapterIdx]);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      const diff = y - lastScrollY.current;
      lastScrollY.current = y;

      if (Math.abs(diff) < 4 && y >= 40) return;

      const shouldShow = diff < -6 || y < 40;
      if (shouldShow !== headerVisible) {
        setHeaderVisible(shouldShow);
        Animated.spring(headerAnim, {
          toValue: shouldShow ? 1 : 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 180,
        }).start();
      }
    },
    [headerVisible, headerAnim]
  );

  const coverUrl = useMemo(() => (book ? getCoverUrl(book) : null), [book]);

  const renderChunk: ListRenderItem<ChunkResponse> = useCallback(
    ({ item }) => (
      <ChapterChunkItem
        chunk={item}
        contentWidth={CONTENT_W}
        htmlBase={htmlBase}
        htmlTags={htmlTags}
        coverUrl={coverUrl}
      />
    ),
    [htmlBase, htmlTags, coverUrl]
  );

  if (isLoading)
    return (
      <View style={[s.flex, { backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={C.accent} />
      </View>
    );

  if (error || !book)
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: C.muted, marginBottom: 20 }}>Китеп жүктөлгөн жок</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backPill}>
          <Text style={{ color: C.white, fontWeight: "600" }}>Арка</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  if (sortedChapters.length === 0)
    return (
      <SafeAreaView style={[s.flex, { backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: C.muted, marginBottom: 20 }}>Бул китепте бөлүмдөр жок.</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backPill}>
          <Text style={{ color: C.white, fontWeight: "600" }}>Арка</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  const headerComponent = (
    <View style={s.chapterHeading}>
      <Text style={s.chapterEyebrow}>Бөлүм {chapterIdx + 1}</Text>
      <Text style={s.chapterName}>{chapter?.chapterTitle}</Text>
      <View style={s.chapterRule} />
    </View>
  );

  const footerComponent = (
    <View style={s.navRow}>
      <TouchableOpacity
        style={[s.navBtn, isFirst && s.navBtnDisabled]}
        onPress={() => goChapter(-1)}
        disabled={isFirst}
        activeOpacity={0.75}
      >
        <Ionicons name="chevron-back" size={16} color={isFirst ? C.muted : C.offWhite} />
        <Text style={[s.navBtnText, isFirst && { color: C.muted }]}>Мурунку</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.navBtnPrimary, isLast && s.navBtnDisabled]}
        onPress={() => goChapter(1)}
        disabled={isLast}
        activeOpacity={0.8}
      >
        <Text style={[s.navBtnPrimaryText, isLast && { color: C.muted }]}>Кийинки</Text>
        <Ionicons name="chevron-forward" size={16} color={isLast ? C.muted : C.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[s.flex, { backgroundColor: C.bg }]}>
      {/* Auto-hide top bar */}
      <Animated.View
        style={[
          s.topBar,
          {
            paddingTop: insets.top,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-(insets.top + 60), 0],
                }),
              },
            ],
          },
        ]}
      >
        {!isLight && <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />}
        <View style={s.topBarInner}>
          <TouchableOpacity onPress={() => router.back()} style={s.topBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={isLight ? "#FFFFFF" : C.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={s.topTitle} numberOfLines={1}>
              {book.title}
            </Text>
            <Text style={s.topSub} numberOfLines={1}>
              {chapter?.chapterTitle ?? `Бөлүм ${chapterIdx + 1}`}
            </Text>
          </View>
          {/* Chapter count badge */}
          <View style={s.chapterBadge}>
            <Text style={s.chapterBadgeText}>
              {chapterIdx + 1} / {sortedChapters.length}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Virtualized Reading Area */}
      <FlatList
        ref={flatListRef}
        style={s.flex}
        contentContainerStyle={{
          paddingTop: insets.top + 68,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 24,
        }}
        data={sortedChunks}
        keyExtractor={(item) => String(item.chunkId)}
        renderItem={renderChunk}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        initialNumToRender={5}
        maxToRenderPerBatch={7}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      />
    </View>
  );
}

const createHtmlStyles = (C: ThemeColors) => ({
  htmlBase: {
    color: C.body,
    fontSize: 18,
    lineHeight: 30,
    letterSpacing: 0.1,
  } as React.ComponentProps<typeof RenderHtml>["baseStyle"],

  htmlTags: {
    p: { marginBottom: 0, marginTop: 0 },
    h1: { color: C.offWhite, fontSize: 22, fontWeight: "700", marginBottom: 16, marginTop: 8 },
    h2: { color: C.offWhite, fontSize: 19, fontWeight: "600", marginBottom: 12, marginTop: 8 },
    h3: { color: C.offWhite, fontSize: 17, fontWeight: "600", marginBottom: 8, marginTop: 4 },
    em: { fontStyle: "italic", color: C.offWhite },
    strong: { fontWeight: "700", color: C.offWhite },
    blockquote: { borderLeftWidth: 3, borderLeftColor: C.accent, paddingLeft: 16, color: C.mutedLight, fontStyle: "italic" },
  } as React.ComponentProps<typeof RenderHtml>["tagsStyles"],
});

const createStyles = (C: ThemeColors, isLight: boolean) =>
  StyleSheet.create({
    flex: { flex: 1 },
    // Top bar
    topBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: isLight ? C.accent : "transparent",
    },
    topBarInner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 4,
      gap: 12,
    },
    topBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isLight ? "rgba(255,255,255,0.2)" : "rgba(100,100,100,0.2)",
    },
    topTitle: {
      color: isLight ? "#FFFFFF" : C.offWhite,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    topSub: {
      color: isLight ? "rgba(255,255,255,0.8)" : C.muted,
      fontSize: 12,
      marginTop: 2,
    },
    chapterBadge: {
      backgroundColor: isLight ? "rgba(255,255,255,0.25)" : C.surface,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: isLight ? "rgba(255,255,255,0.1)" : C.border,
    },
    chapterBadgeText: {
      color: isLight ? "#FFFFFF" : C.mutedLight,
      fontSize: 12,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
    // Chapter heading
    chapterHeading: {
      marginBottom: 28,
      paddingTop: 8,
    },
    chapterEyebrow: {
      color: C.accent,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.4,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    chapterName: {
      color: C.offWhite,
      fontSize: 26,
      fontWeight: "700",
      letterSpacing: -0.4,
      lineHeight: 32,
    },
    chapterRule: {
      height: 1,
      backgroundColor: C.border,
      marginTop: 20,
    },
    // Nav
    navRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 40,
    },
    navBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 50,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface,
    },
    navBtnPrimary: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 50,
      borderRadius: 25,
      backgroundColor: C.accent,
    },
    navBtnDisabled: {
      opacity: 0.3,
    },
    navBtnText: {
      color: C.offWhite,
      fontWeight: "500",
      fontSize: 14,
    },
    navBtnPrimaryText: {
      color: C.white,
      fontWeight: "600",
      fontSize: 14,
    },
    // Back pill
    backPill: {
      backgroundColor: C.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
  });