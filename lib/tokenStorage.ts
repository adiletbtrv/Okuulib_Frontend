import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

async function secureSet(key: string, value: string): Promise<void> {
    if (isNative) {
        const SecureStore = require('expo-secure-store');
        await SecureStore.setItemAsync(key, value);
    } else {
        try { localStorage.setItem(key, value); } catch { /* SSR */ }
    }
}

async function secureDelete(key: string): Promise<void> {
    if (isNative) {
        const SecureStore = require('expo-secure-store');
        await SecureStore.deleteItemAsync(key);
    } else {
        try { localStorage.removeItem(key); } catch { /* SSR */ }
    }
}

async function secureGet(key: string): Promise<string | null> {
    if (isNative) {
        const SecureStore = require('expo-secure-store');
        return await SecureStore.getItemAsync(key);
    } else {
        try { return localStorage.getItem(key); } catch { return null; }
    }
}

export const setAuthToken = async (token: string): Promise<void> => {
    try {
        await secureSet(ACCESS_TOKEN_KEY, token);
    } catch (error) {
        if (__DEV__) console.error('[TokenStorage] Error storing access token:', error);
        throw new Error('Failed to store authentication token');
    }
};

export const setRefreshToken = async (token: string): Promise<void> => {
    try {
        await secureSet(REFRESH_TOKEN_KEY, token);
    } catch (error) {
        if (__DEV__) console.error('[TokenStorage] Error storing refresh token:', error);
    }
};

export const clearAuthToken = async (): Promise<void> => {
    try {
        await secureDelete(ACCESS_TOKEN_KEY);
    } catch (error) {
        if (__DEV__) console.error('[TokenStorage] Error clearing access token:', error);
    }
};

export const clearRefreshToken = async (): Promise<void> => {
    try {
        await secureDelete(REFRESH_TOKEN_KEY);
    } catch (error) {
        if (__DEV__) console.error('[TokenStorage] Error clearing refresh token:', error);
    }
};

export const getAuthToken = async (): Promise<string | null> => {
    try {
        return await secureGet(ACCESS_TOKEN_KEY);
    } catch (error) {
        if (__DEV__) console.error('[TokenStorage] Error retrieving access token:', error);
        return null;
    }
};