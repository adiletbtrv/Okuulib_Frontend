import { Platform } from 'react-native';
import { StateStorage } from 'zustand/middleware';

function isNative(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

const webStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(name, value);
      }
    } catch (err) {
      if (__DEV__) console.warn(`[Storage] localStorage.setItem failed (${name}):`, err);
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(name);
      }
    } catch (err) {
      if (__DEV__) console.warn(`[Storage] localStorage.removeItem failed (${name}):`, err);
    }
  },
};

const nativeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      if (__DEV__) console.error(`Error reading from secure storage (${name}):`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      if (__DEV__) console.error(`Error writing to secure storage (${name}):`, error);
      throw error;
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      if (__DEV__) console.error(`Error removing from secure storage (${name}):`, error);
      throw error;
    }
  },
};

export const secureStorage: StateStorage = isNative() ? nativeStorage : webStorage;