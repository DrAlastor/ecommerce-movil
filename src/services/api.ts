import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inyectar x-tenant-id si no fue provisto explícitamente en la llamada
    if (!config.headers['x-tenant-id']) {
      const storedTenant = (await AsyncStorage.getItem('current_tenant_id')) || 'dressly';
      config.headers['x-tenant-id'] = storedTenant;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de response: maneja expiración de sesión
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('authUser');
    }
    return Promise.reject(error);
  },
);

export default api;
