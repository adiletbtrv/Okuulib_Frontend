import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

/**
 * Displays a subtle banner when the device is offline
 * Automatically hides when connection is restored
 */
export function NetworkStatusBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [opacity] = React.useState(new Animated.Value(0));

  const isOffline = !isConnected || isInternetReachable === false;

  React.useEffect(() => {
    if (isOffline) {
      // Fade in when offline
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out when online
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, opacity]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E74026',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

