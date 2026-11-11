import React, { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { offlineStatus, setOfflineStatus, subscribeOffline } from './connectivity';

export function OfflineBanner() {
  const [status, setStatus] = useState(offlineStatus);
  useEffect(() => {
    const unsubscribe = subscribeOffline(() => setStatus(offlineStatus()));
    const network = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setOfflineStatus({ ...offlineStatus(), offline });
    });
    const foreground = AppState.addEventListener('change', state => { if (state === 'active') void NetInfo.refresh(); });
    return () => { unsubscribe(); network(); foreground.remove(); };
  }, []);
  if (!status.offline && !status.message && !status.cachedAt) return null;
  return <View accessibilityRole="alert" style={{ backgroundColor: '#fff3cd', padding: 10 }}>
    <Text style={{ color: '#543d00', fontSize: 12 }}>
      {status.offline ? 'Sin acceso al servidor. ' : ''}
      {status.cachedAt ? `Datos guardados del ${new Date(status.cachedAt).toLocaleString()}. Solo se incluyen consultas descargadas. Precios y disponibilidad pendientes de verificar.` : status.message || 'Puedes consultar los datos guardados y modificar tu carrito. Compra y reservas necesitan conexión.'}
    </Text>
  </View>;
}
