import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';

import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './globals.css';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NetworkStatusBanner />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="books/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="reader/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="profile/index" options={{ headerShown: false }} />
            <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}