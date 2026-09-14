import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../services/api';
import type { LoginRequest, LoginResponse, AuthUser, RolInfo, FuncionInfo } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async getProfile(): Promise<{ user: AuthUser; rol: RolInfo; funciones: FuncionInfo[] }> {
    const response = await api.get('/auth/profile');
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
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Error al notificar cierre de sesión al servidor:', error);
    } finally {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('authUser');
    }
  },
};
