import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base del backend en Azure (accesible sin necesidad de cable o localhost)
const API_BASE_URL = 'https://dressly-api-2026.azurewebsites.net';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor de request: inyecta token JWT
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de response: maneja errores de autenticación
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
