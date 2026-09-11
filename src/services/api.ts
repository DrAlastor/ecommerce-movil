import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambiar la URL base según el entorno
// Para Android emulador: http://10.0.2.2:3000
// Para dispositivo físico: usar la IP de la máquina
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000'
  : 'https://api.dressly.com';

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
