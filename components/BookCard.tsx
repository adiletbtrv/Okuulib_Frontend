import { images } from "@/constants/images";
import { colors, radius, shadows } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  id: number;
  title: string;
  isShowTitle?: boolean;
  subtitle?: string;
  coverUrl?: string;
  width?: number;
  height?: number;
}

export default function BookCard({
  id,
  title,
  subtitle,
  coverUrl,
  isShowTitle = true,
  width = 100,
  height = 145,
}: Props) {
  const imageSource = coverUrl ? { uri: coverUrl } : images.poster_manas_1;
  const displayTitle = title || "Аталышсыз";
  const displaySubtitle = subtitle || "";

  return (
    <TouchableOpacity
      style={[s.container, { width }]}
      onPress={() => router.push(`/books/${id}`)}
      activeOpacity={0.8}
    >
      <View style={[s.imageWrap, { width, height }]}>
        <Image
          source={imageSource}
          style={s.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          placeholder={images.poster_manas_1}
          recyclingKey={`book-${id}`}
        />
      </View>
      {isShowTitle && (
        <Text style={s.title} numberOfLines={1}>
          {displayTitle}
        </Text>
      )}
      {displaySubtitle !== "" && (
        <Text style={s.subtitle} numberOfLines={1}>
          {displaySubtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {},
  imageWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.textSecondary,
    marginTop: 2,
  },
});
