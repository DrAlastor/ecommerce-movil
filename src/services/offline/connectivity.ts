import NetInfo from '@react-native-community/netinfo';

export type OfflineStatus = { offline: boolean; cachedAt?: string; message?: string };
let status: OfflineStatus = { offline: false };
const listeners = new Set<() => void>();
export function offlineStatus() { return status; }
export function subscribeOffline(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function setOfflineStatus(next: OfflineStatus) { status = next; listeners.forEach(listener => listener()); }
export async function hasNetwork(): Promise<boolean> {
  const state = await NetInfo.fetch();
  // La API determina la disponibilidad real; un valor desconocido no prueba desconexión.
  return state.isConnected !== false && state.isInternetReachable !== false;
}
export async function requireNetwork(): Promise<void> {
  if (!(await hasNetwork())) throw new Error('Sin conexión. Conservamos tus datos; vuelve a intentarlo cuando tengas internet.');
}
