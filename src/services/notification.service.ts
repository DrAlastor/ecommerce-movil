import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import type { RemoteMessage } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const notificationService = {
  /**
   * Solicita permisos de notificación al usuario (Android 13+ y iOS)
   */
  async requestUserPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notificaciones Fashion Store',
              message:
                'Activa las notificaciones para recibir alertas de tus compras, reservas y estado de pedidos incluso con la app cerrada.',
              buttonNeutral: 'Preguntar luego',
              buttonNegative: 'Cancelar',
              buttonPositive: 'Aceptar',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } else {
        const messagingInstance = getMessaging();
        const authStatus = await requestPermission(messagingInstance);
        return (
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (error) {
      console.warn('Error solicitando permisos de notificación:', error);
      return false;
    }
  },

  /**
   * Obtiene el token FCM exclusivo de este dispositivo
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestUserPermission();
      if (!hasPermission) {
        console.log('Permiso de notificaciones no otorgado');
        return null;
      }

      const messagingInstance = getMessaging();
      const token = await getToken(messagingInstance);
      if (token) {
        await AsyncStorage.setItem('fcm_token', token);
        console.log('FCM Device Token obtenido:', token);
        return token;
      }
      return null;
    } catch (error) {
      console.warn('Error obteniendo FCM Token:', error);
      return null;
    }
  },

  /**
   * Envía el token de este dispositivo al backend de Azure para vincularlo al usuario
   */
  async syncDeviceTokenWithBackend(tenantId?: string, explicitUserId?: number | null): Promise<void> {
    try {
      const token = await this.getDeviceToken();
      if (!token) return;

      let userId = explicitUserId ?? null;
      if (userId === null) {
        const storedUser = await AsyncStorage.getItem('authUser');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            userId = parsed.user?.id_usuario || parsed.id_usuario || null;
          } catch {
            // ignore
          }
        }
      }

      const activeTenant =
        tenantId || (await AsyncStorage.getItem('current_tenant_id')) || 'dressly';

      // Enviar registro al endpoint de notificaciones del backend
      await api.post(
        '/notifications/device-token',
        {
          token,
          platform: Platform.OS,
          id_usuario: userId,
          tenant: activeTenant,
        },
        {
          headers: activeTenant ? { 'x-tenant-id': activeTenant } : {},
        },
      );
      console.log(`✅ Token FCM sincronizado con backend (User: ${userId ?? 'anónimo'}, Tenant: ${activeTenant})`);
    } catch (error: any) {
      console.log('Aviso: Sincronización de token con backend:', error?.message || error);
    }
  },

  /**
   * Configura los listeners en primer plano y cuando el usuario toca la notificación
   */
  initializeListeners(onNotificationPress?: (data: any) => void) {
    try {
      const messagingInstance = getMessaging();

      // 1. Mensajes recibidos mientras la app está abierta en primer plano
      const unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage: RemoteMessage) => {
        console.log('Notificación en primer plano recibida:', remoteMessage);
        const title = remoteMessage.notification?.title || (remoteMessage.data as any)?.title || 'Fashion Store';
        const body = remoteMessage.notification?.body || (remoteMessage.data as any)?.body || '';

        // Disparar la notificación nativa en la barra superior del sistema (Heads-Up Banner)
        if (Platform.OS === 'android' && NativeModules.LocalNotification?.displayNotification) {
          NativeModules.LocalNotification.displayNotification(title, body);
        }
      });

      // 2. Notificación presionada mientras la app estaba en segundo plano (minimizada)
      const unsubscribeOpenedApp = onNotificationOpenedApp(messagingInstance, (remoteMessage: RemoteMessage) => {
        console.log('App abierta desde notificación en segundo plano:', remoteMessage);
        if (onNotificationPress && remoteMessage?.data) {
          onNotificationPress(remoteMessage.data);
        }
      });

      // 3. Notificación presionada mientras la app estaba completamente cerrada (quit state)
      getInitialNotification(messagingInstance).then((remoteMessage: RemoteMessage | null) => {
        if (remoteMessage) {
          console.log('App iniciada desde notificación con app cerrada:', remoteMessage);
          if (onNotificationPress && remoteMessage?.data) {
            onNotificationPress(remoteMessage.data);
          }
        }
      });

      // 4. Renovación automática de token por Firebase
      const unsubscribeRefresh = onTokenRefresh(messagingInstance, (newToken: string) => {
        console.log('FCM Token refrescado:', newToken);
        AsyncStorage.setItem('fcm_token', newToken);
        this.syncDeviceTokenWithBackend();
      });

      return () => {
        unsubscribeForeground();
        unsubscribeOpenedApp();
        unsubscribeRefresh();
      };
    } catch (e) {
      console.warn('Error inicializando listeners de notificaciones:', e);
      return () => { };
    }
  },
};
