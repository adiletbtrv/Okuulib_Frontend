import { colors, radius, shadows, spacing, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  book: {
    id?: number;
    title?: string;
    authorName?: string;
    description?: string;
    imageUrl?: string;
  };
}

export default function SearchResultCard({ book }: Props) {
  return (
    <View style={s.container}>
      {book.imageUrl ? (
        <Image
          source={{ uri: book.imageUrl }}
          style={s.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[s.image, s.placeholder]}>
          <Ionicons name="book-outline" size={24} color={colors.textMuted} />
        </View>
      )}
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>
          {book.title || "Аталышсыз"}
        </Text>
        <Text style={s.author} numberOfLines={1}>
          {book.authorName || "Белгисиз"}
        </Text>
        <Text style={s.description} numberOfLines={3}>
          {book.description || "Сүрөттөмө жок"}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.md,
  },
  image: {
    width: 85,
    height: 120,
  },
  placeholder: {
    backgroundColor: colors.skeleton,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
  },
  title: {
    ...typography.headline,
    marginBottom: 4,
  },
  author: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
