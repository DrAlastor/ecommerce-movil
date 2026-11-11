import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './services/auth.service';
import type { AuthState, LoginRequest } from './types/auth.types';
import { useTenant } from '../../../shared/context/TenantContext';
import { notificationService } from '../../../services/notification.service';
import { onSessionInvalid } from '../../../services/offline/sessionEvents';
import { useOfflineRefresh } from '../../../services/offline/useOfflineRefresh';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (functionName: string) => boolean;
  getAccessLevel: (functionName: string) => string | null;
  isGuest: boolean;
  continueAsGuest: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  rol: null,
  funciones: [],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const { selectTenant, tenantKey } = useTenant();
  const [sessionTenant, setSessionTenant] = useState<string | null>(null);
  useEffect(() => onSessionInvalid(() => {
    setState({ ...initialState, isLoading: false });
    setIsGuest(false);
  }), []);
  useOfflineRefresh(async () => {
    if (!state.isAuthenticated || (state.rol?.nombre || '').toUpperCase() === 'SUPER_ADMIN') return;
    try {
      const profile = await authService.getProfile();
      setState(previous => previous.isAuthenticated && previous.user?.id_usuario === profile.user.id_usuario ? { ...previous, user: profile.user, rol: profile.rol, funciones: profile.funciones } : previous);
    } catch { /* Un fallo de red conserva la sesión; la API notifica un rechazo de autenticación. */ }
  });

  // Restaurar sesión al iniciar
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const hasToken = await authService.hasToken();
        const stored = await authService.getStoredAuth();
        const storedTenant = await AsyncStorage.getItem('current_tenant_id');

        if (storedTenant) {
          await selectTenant(storedTenant);
        }

        if (hasToken && stored) {
          setSessionTenant(storedTenant || tenantKey);
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: stored.user,
            rol: stored.rol,
            funciones: stored.funciones,
          });

          // Asegurar que el FCM token del dispositivo quede vinculado al usuario actual
          notificationService.syncDeviceTokenWithBackend(
            storedTenant || undefined,
            stored.user?.id_usuario ?? null,
          );

          // Sincronizar en segundo plano con la base de datos si no es superadmin
          const isSuper = (stored.user as any)?.rolGlobal === 'SUPER_ADMIN' || stored.rol?.nombre === 'SUPER_ADMIN';
          if (!isSuper) {
            try {
              const profile = await authService.getProfile();
              if (profile && profile.funciones) {
                setState(prev => ({
                  ...prev,
                  user: profile.user,
                  rol: profile.rol,
                  funciones: profile.funciones,
                }));
                await authService.saveAuth({
                  accessToken: (await AsyncStorage.getItem('accessToken')) || '',
                  user: profile.user,
                  rol: profile.rol,
                  funciones: profile.funciones,
                });
              }
            } catch (error: any) {
              if (error?.response?.status === 401) setState({ ...initialState, isLoading: false });
              // Un fallo de red conserva la sesión local; un rechazo del servidor la invalida.
            }
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    restoreSession();
  }, [selectTenant]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.login(credentials);
      await authService.saveAuth(response);

      const targetTenant = (response as any).matchedTenant || tenantKey;

      // Si se descubrió el tenant específico del usuario, sincronizarlo automáticamente
      if (targetTenant) {
        await selectTenant(targetTenant);
      }

      // Sincronizar el token de notificaciones push de este dispositivo
      notificationService.syncDeviceTokenWithBackend(targetTenant);

      setIsGuest(false);
      setSessionTenant(targetTenant);
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        rol: response.rol,
        funciones: response.funciones,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [selectTenant, tenantKey]);

  const logout = useCallback(async () => {
    await authService.logout();
    setIsGuest(false);
    setSessionTenant(null);
    setState({
      ...initialState,
      isLoading: false,
    });
  }, []);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
  }, []);

  const isSuperAdmin = useMemo(() => {
    return Boolean(
      (state.user as any)?.rolGlobal === 'SUPER_ADMIN' ||
      (state.rol?.nombre || '').toUpperCase() === 'SUPER_ADMIN' ||
      state.user?.email?.toLowerCase().includes('superadmin') ||
      state.user?.email?.toLowerCase() === 'admin@fashionstore.com'
    );
  }, [state.user, state.rol]);

  const hasPermission = useCallback(
    (functionName: string) => {
      if (isSuperAdmin) return true;
      return state.funciones.some((f) => f.nombre === functionName);
    },
    [state.funciones, isSuperAdmin],
  );

  const getAccessLevel = useCallback(
    (functionName: string): string | null => {
      if (isSuperAdmin) return 'TOTAL';
      const found = state.funciones.find((f) => f.nombre === functionName);
      return found ? found.nivel_acceso : null;
    },
    [state.funciones, isSuperAdmin],
  );

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      hasPermission,
      getAccessLevel,
      isGuest,
      continueAsGuest,
      isSuperAdmin,
    }),
    [state, login, logout, hasPermission, getAccessLevel, isGuest, continueAsGuest, isSuperAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
