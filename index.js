/**
 * @format
 */

import 'react-native-screens';
import { enableScreens } from 'react-native-screens';
enableScreens();

import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Manejador en segundo plano cuando la app está completamente cerrada
try {
  const messagingInstance = getMessaging();
  setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
    console.log('Push recibido con la app cerrada / en segundo plano:', remoteMessage.notification);
  });
} catch (e) {
  console.log('Error registrando background handler:', e);
}

AppRegistry.registerComponent(appName, () => App);
