/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
jest.mock('../src/shared/layouts/AdminNavigator', () => () => null);
jest.mock('../src/services/notification.service', () => ({
  notificationService: {
    syncDeviceTokenWithBackend: jest.fn(),
    requestUserPermission: jest.fn().mockResolvedValue(false),
    initializeListeners: jest.fn(() => () => {}),
  },
}));
import App from '../App';

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(async () => { renderer!.unmount(); });
});
