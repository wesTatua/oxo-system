module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@core':         './src/core',
          '@domain':       './src/domain',
          '@data':         './src/data',
          '@presentation': './src/presentation',
          '@shared':       './src/shared',
          '@assets':       './assets',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
