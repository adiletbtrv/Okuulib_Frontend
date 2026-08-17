module.exports = {
  preset: "jest-expo",
  testMatch: [
    "**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)",
    "!**/__tests__/mocks/**",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack/.*))",
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo/src/winter/(.*)$': '<rootDir>/__tests__/mocks/emptyMock.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
