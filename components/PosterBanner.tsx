import { colors, radius, shadows, spacing } from "@/constants/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PosterBannerProps {
  title: string;
  description: string;
  image: any;
  link: `/${string}`;
}

export default function PosterBanner({ title, description, image, link }: PosterBannerProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(link as any)}
    >
      <LinearGradient
        colors={[colors.accent, '#D63A20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.container}
      >
        <View style={s.content}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.description} numberOfLines={3}>{description}</Text>
          <View style={s.button}>
            <Text style={s.buttonText}>Окууну баштоо</Text>
          </View>
        </View>
        <View style={s.imageContainer}>
          <Image
            source={image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            style={s.image}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    overflow: "hidden",
    alignItems: "center",
    ...shadows.md,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingRight: 10,
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  description: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    alignSelf: "flex-start",
    ...shadows.sm,
  },
  buttonText: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 13,
  },
  imageContainer: {
    width: 140,
    height: 180,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  image: {
    width: 120,
    height: 160,
    borderRadius: radius.md,
    transform: [{ rotate: "-4deg" }, { translateX: 10 }],
    ...shadows.lg,
  },
});
