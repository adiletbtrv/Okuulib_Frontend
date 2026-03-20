import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width,
  height = 20,
  borderRadius = 4,
  style
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width ?? '100%',
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function BookCardSkeleton({ width = 90, height = 130 }: { width?: number; height?: number }) {
  return (
    <View style={{ width, marginRight: 15 }}>
      <Skeleton width={width} height={height} borderRadius={10} />
      <Skeleton width={width} height={12} borderRadius={4} style={{ marginTop: 5 }} />
      <Skeleton width={width * 0.7} height={7} borderRadius={4} style={{ marginTop: 2 }} />
    </View>
  );
}

export function BookCarouselSkeleton({ count = 5, width = 90, height = 130 }: {
  count?: number;
  width?: number;
  height?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingTop: 10 }}>
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} width={width} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
});

