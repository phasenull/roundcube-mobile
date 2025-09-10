module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated plugin (MUST be last!)
      'react-native-reanimated/plugin'
    ],
  };
};