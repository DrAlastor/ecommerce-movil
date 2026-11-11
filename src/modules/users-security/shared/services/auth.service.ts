import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../services/api';
import type { LoginRequest, LoginResponse, AuthUser, RolInfo, FuncionInfo } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse & { matchedTenant?: string }> {
    const emailNorm = (credentials.email || '').toLowerCase().trim();
    const isSuperAdminEmail =
      emailNorm.includes('superadmin') ||
      emailNorm === 'admin@fashionstore.com' ||
      emailNorm.endsWith('@fashionstore.com');

    // 1. Si es correo conocido de Super Administrador, autenticar directamente con la API SaaS
    if (isSuperAdminEmail) {
      const saasRes = await api.post('/saas/auth/login', credentials);
      if (saasRes.data?.accessToken) {
        const saasUser = saasRes.data.user;
        await AsyncStorage.setItem('current_tenant_id', 'saas');
        api.defaults.headers.common['x-tenant-id'] = 'saas';
        return {
          accessToken: saasRes.data.accessToken,
          matchedTenant: 'saas',
          user: {
            id_usuario: saasUser.id,
            email: saasUser.email,
            nombre: saasUser.nombre,
            apellido: saasUser.apellido,
            rolGlobal: 'SUPER_ADMIN',
          } as any,
          rol: {
            id_rol: 999,
            nombre: 'SUPER_ADMIN',
          },
          funciones: [
            { id_funcion: 100, nombre: 'Dashboard de Super Admin', modulo: 'SaaS', nivel_acceso: 'TOTAL' },
            { id_funcion: 101, nombre: 'Monitoreo de Tenant', modulo: 'SaaS', nivel_acceso: 'TOTAL' },
            { id_funcion: 102, nombre: 'Gestionar Sistema SaaS', modulo: 'SaaS', nivel_acceso: 'TOTAL' },
          ],
        };
      }
    }

    // 2. Descubrimiento automático de Tenant por correo electrónico:
    // Probamos en paralelo en las boutiques activas del clúster (dressly, aura-sport, urbanly)
    const TENANTS_TO_CHECK = ['dressly', 'aura-sport', 'urbanly'];

    const results = await Promise.allSettled(
      TENANTS_TO_CHECK.map(async (tenantId) => {
        const res = await api.post<LoginResponse>('/auth/login', credentials, {
          headers: { 'x-tenant-id': tenantId },
        });
        return { data: res.data, tenantId };
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.data?.accessToken) {
        const matchedResponse = r.value.data;
        const matchedTenantId = r.value.tenantId;

        // Fijar el tenant descubierto como el tenant exclusivo del usuario
        await AsyncStorage.setItem('current_tenant_id', matchedTenantId);
        api.defaults.headers.common['x-tenant-id'] = matchedTenantId;

        return {
          ...matchedResponse,
          matchedTenant: matchedTenantId,
        };
      }
    }

    // 3. Resiliencia: si no estuvo en las tiendas regulares, verificar si era Super Admin en SaaS
    try {
      const saasRes = await api.post('/saas/auth/login', credentials);
      if (saasRes.data?.accessToken) {
        const saasUser = saasRes.data.user;
        await AsyncStorage.setItem('current_tenant_id', 'saas');
        api.defaults.headers.common['x-tenant-id'] = 'saas';
        return {
          accessToken: saasRes.data.accessToken,
          matchedTenant: 'saas',
          user: {
            id_usuario: saasUser.id,
            email: saasUser.email,
            nombre: saasUser.nombre,
            apellido: saasUser.apellido,
            rolGlobal: 'SUPER_ADMIN',
          } as any,
          rol: {
            id_rol: 999,
            nombre: 'SUPER_ADMIN',
          },
          funciones: [
            { id_funcion: 100, nombre: 'Dashboard de Super Admin', modulo: 'SaaS', nivel_acceso: 'TOTAL' },
            { id_funcion: 101, nombre: 'Monitoreo de Tenant', modulo: 'SaaS', nivel_acceso: 'TOTAL' },
          ],
        };
      }
    } catch {
      // Continuar al error de credenciales
    }

    const error: any = new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
    error.response = { status: 401, data: { message: 'Credenciales inválidas. Verifica tu correo y contraseña.' } };
    throw error;
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
