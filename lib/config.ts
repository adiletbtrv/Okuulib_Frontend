import Constants from 'expo-constants';
interface AppConfig {
  API_URL: string;
  WS_URL: string;
  IS_DEV: boolean;
  IS_PRODUCTION: boolean;
  APP_VERSION: string;
  BUILD_NUMBER: string | undefined;
}

function getApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (__DEV__) {
    const isAndroid = Constants.platform?.android != null;
    return isAndroid ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
  }

  throw new Error(
    '[Config] EXPO_PUBLIC_API_URL is required in production. ' +
    'Add it to your .env file or EAS secrets.'
  );
}

function buildWsUrl(apiUrl: string): string {
  return apiUrl.replace(/^http/, 'ws');
}

export const config: AppConfig = {
  API_URL: getApiUrl(),
  get WS_URL() {
    return buildWsUrl(this.API_URL);
  },
  IS_DEV: __DEV__,
  IS_PRODUCTION: !__DEV__,
  APP_VERSION: Constants.expoConfig?.version ?? '1.0.0',
  BUILD_NUMBER:
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode?.toString(),
};

function validateConfig(): void {
  if (!config.API_URL) {
    throw new Error('[Config] API_URL is required but not set');
  }
  try {
    new URL(config.API_URL);
  } catch {
    throw new Error(`[Config] Invalid API_URL: "${config.API_URL}"`);
  }

  if (__DEV__) {
    if (__DEV__) console.log('[Config] ✅ Configuration loaded:', {
      API_URL: config.API_URL,
      WS_URL: config.WS_URL,
      IS_DEV: config.IS_DEV,
      APP_VERSION: config.APP_VERSION,
    });
  }
}

validateConfig();