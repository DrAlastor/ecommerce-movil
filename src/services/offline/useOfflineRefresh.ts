import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { offlineStatus } from './connectivity';

export function useOfflineRefresh(refresh: () => unknown) {
  const callback = useRef(refresh);
  callback.current = refresh;
  useEffect(() => {
    let wasOffline = false;
    let running = false;
    const run = async () => {
      if (running) return;
      running = true;
      try { await callback.current(); } catch { /* La pantalla muestra su propio error. */ }
      finally { running = false; }
    };
    const network = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      if (wasOffline && !offline) void run();
      wasOffline = offline;
    });
    const foreground = AppState.addEventListener('change', state => { if (state === 'active') void run(); });
    const retry = setInterval(() => { if (offlineStatus().offline || offlineStatus().cachedAt) void run(); }, 30000);
    return () => { network(); foreground.remove(); clearInterval(retry); };
  }, []);
}
