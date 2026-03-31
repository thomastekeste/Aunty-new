const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow react-native-svg to resolve its web variant
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add web-specific extensions for react-native-svg
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'web.ts',
  'web.tsx',
  'web.js',
];

module.exports = config;
