import axios, { AxiosError, AxiosHeaders } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheable, readKey, saveRead, loadRead, loadCatalogFallback } from './offline/readCache';
import { hasNetwork, setOfflineStatus } from './offline/connectivity';
import { mapAssets } from './offline/assets';
import { sessionInvalid } from './offline/sessionEvents';

declare module 'axios' {
  interface AxiosRequestConfig {
    offlineReadKey?: string;
    offlineSession?: string | null;
    offlineTenant?: string;
  }
}

// URL base del backend centralizado en Microsoft Azure (SaaS Multi-Tenant)
const API_BASE_URL = 'https://dressly-api-gjajasdeb8b0ethf.chilecentral-01.azurewebsites.net';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor de request: inyecta token JWT y contexto de aislamiento de Tenant
api.interceptors.request.use(
  async (config) => {
    // 1. Inyectar token JWT si existe sesión activa
    const token = await AsyncStorage.getItem('accessToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers.Authorization && config.headers.Authorization !== `Bearer ${token}`) throw new AxiosError('La sesión cambió antes del envío. Reintenta con la cuenta actual.', 'ERR_CANCELED', config);

    // 2. Inyectar x-tenant-id si no fue provisto explícitamente en la llamada
    if (!config.headers['x-tenant-id']) {
      const storedTenant = (await AsyncStorage.getItem('current_tenant_id')) || 'dressly';
      config.headers['x-tenant-id'] = storedTenant;
    }

    config.offlineSession = token;
    config.offlineTenant = String(config.headers['x-tenant-id']);
    if (cacheable(config.method, config.url || '')) {
      const rawUser = await AsyncStorage.getItem('authUser');
      let account = 'guest';
      let bound = !token;
      try {
        const stored = rawUser ? JSON.parse(rawUser) : null;
        if (token && stored?.tenant === config.offlineTenant && stored?.user?.id_usuario) { account = String(stored.user.id_usuario); bound = true; }
      } catch { /* Sin identidad: nunca usar la caché privada. */ }
      if (bound) config.offlineReadKey = readKey({ server: config.baseURL || '', tenant: config.offlineTenant, account }, config.method, config.url || '', config.params, config.data);
    }
    if (!(await hasNetwork())) throw new AxiosError('Sin conexión. Tus cambios locales se conservan.', 'ERR_NETWORK', config);

    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de response: maneja expiración de sesión
api.interceptors.response.use(
  async (response) => {
    const isLoginUrl = response.config.url?.endsWith('/login') || response.config.url?.includes('/auth/login');
    if (!isLoginUrl) {
      const currentToken = await AsyncStorage.getItem('accessToken');
      if (currentToken && response.config.offlineSession && currentToken !== response.config.offlineSession) {
        throw new Error('La sesión cambió durante la consulta. Vuelve a abrir esta pantalla.');
      }
    }
    if (response.config.offlineReadKey) {
      setOfflineStatus({ offline: false });
      await saveRead(response.config.offlineReadKey, response.data).catch(() => {
        setOfflineStatus({ offline: false, message: 'No se pudo guardar esta consulta para uso sin conexión.' });
      });
      // Las descargas no retrasan las consultas; solo se sustituyen archivos ya completos.
      void mapAssets(response.data, true);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    const networkFailure = !error.response && error.code !== 'ERR_CANCELED';
    const unavailable = networkFailure || error.response?.status >= 500;
    if (unavailable) {
      setOfflineStatus({ offline: true, message: 'Sin acceso al servidor. Se muestran datos guardados; los cambios de carrito se conservan en el dispositivo.' });
      if (config?.offlineReadKey && config.offlineSession === await AsyncStorage.getItem('accessToken') && config.offlineTenant === (await AsyncStorage.getItem('current_tenant_id') || 'dressly')) {
        const cached = await loadRead(config.offlineReadKey) || await loadCatalogFallback(config.offlineReadKey);
        if (cached) {
          setOfflineStatus({ offline: true, cachedAt: cached.savedAt });
          return { data: await mapAssets(cached.data), status: 200, statusText: 'Offline cache', config, headers: new AxiosHeaders({ 'x-offline-cache': cached.savedAt }) };
        }
      }
      error.message = config?.offlineReadKey ? 'Sin conexión y sin datos guardados para esta consulta. Ábrela con internet antes de usarla offline.' : 'Sin conexión. La operación no fue confirmada; conserva tus datos y verifica su estado antes de reintentar.';
    }
    const isLoginEndpoint = config?.url?.endsWith('/login') || config?.url?.includes('/auth/login') || config?.url?.includes('/saas/auth/login');
    const isNotificationEndpoint = config?.url?.includes('/notifications/');
    if (error.response?.status === 401 && !isLoginEndpoint && !isNotificationEndpoint && config?.offlineSession && config?.offlineSession === await AsyncStorage.getItem('accessToken')) {
      await Promise.all(['accessToken', 'authUser'].map(key => AsyncStorage.removeItem(key)));
      sessionInvalid();
    }
    return Promise.reject(error);
  },
);

export default api;
