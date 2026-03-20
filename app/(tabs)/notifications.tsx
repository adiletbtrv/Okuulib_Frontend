import { colors, commonStyles, spacing, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, Platform, StatusBar, StyleSheet, Text, View } from "react-native";

export default function Notifications() {
  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      headerAnim.setValue(0);
      contentAnim.setValue(0);
      Animated.parallel([
        Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(contentAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      ]).start();
    }, [headerAnim, contentAnim])
  );

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
        <Text style={s.headerTitle}>Билдирүүлөр</Text>
      </Animated.View>

      {/* Empty state */}
      <Animated.View
        style={[
          s.emptyState,
          {
            opacity: contentAnim,
            transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        <View style={s.iconCircle}>
          <Ionicons name="notifications-outline" size={36} color={colors.textMuted} />
        </View>
        <Text style={s.emptyTitle}>Билдирүүлөр жок</Text>
        <Text style={s.emptySubtitle}>
          Жаңы китептер жана жаңылыктар пайда болгондо бул жерде көрүнөт
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { ...commonStyles.headerBar },
  headerTitle: { ...commonStyles.headerTitle },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingBottom: 80,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.skeleton,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.title,
    textAlign: "center",
  },
  emptySubtitle: {
    ...typography.bodySecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
