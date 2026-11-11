jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map();
  return {
    getItem: jest.fn(async key => values.get(key) ?? null),
    setItem: jest.fn(async (key, value) => { values.set(key, value); }),
    removeItem: jest.fn(async key => { values.delete(key); }),
    getAllKeys: jest.fn(async () => [...values.keys()]),
    clear: jest.fn(async () => { values.clear(); }),
  };
});
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
  refresh: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
  addEventListener: jest.fn(() => () => {}),
}));
jest.mock('react-native-file-access', () => ({
  Dirs: { DocumentDir: '/test-documents' },
  FileSystem: {
    exists: jest.fn(async () => false),
    statDir: jest.fn(async () => []),
    mkdir: jest.fn(async () => '/test-documents'),
    fetchManaged: jest.fn(() => ({ cancel: jest.fn(), result: Promise.resolve({ ok: true }) })),
    mv: jest.fn(async () => {}),
    unlink: jest.fn(async () => {}),
  },
}));
jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: (props: any) => React.createElement(View, props),
  };
});
