module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['react-native-gesture-handler/jestSetup.js', '<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-[^/]+)?|@react-native(-community|-async-storage|-firebase)?|@react-navigation)/)',
  ],
};
