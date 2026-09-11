import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import type { LoginRequest, LoginResponse } from './auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async saveAuth(data: LoginResponse): Promise<void> {
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem(
      'authUser',
      JSON.stringify({
        user: data.user,
        rol: data.rol,
        funciones: data.funciones,
      }),
    );
  },

  async getStoredAuth(): Promise<{
    user: LoginResponse['user'];
    rol: LoginResponse['rol'];
    funciones: LoginResponse['funciones'];
  } | null> {
    const stored = await AsyncStorage.getItem('authUser');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  async hasToken(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('authUser');
  },
};
