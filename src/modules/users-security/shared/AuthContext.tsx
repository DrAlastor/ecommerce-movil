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

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (functionName: string) => boolean;
  getAccessLevel: (functionName: string) => string | null;
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

  // Restaurar sesión al iniciar
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const hasToken = await authService.hasToken();
        const stored = await authService.getStoredAuth();

        if (hasToken && stored) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: stored.user,
            rol: stored.rol,
            funciones: stored.funciones,
          });

          // Sincronizar en segundo plano con la base de datos para obtener funciones y rol actualizados
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
          } catch {
            // Si el token expiró o falló la sincronización
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.login(credentials);
      await authService.saveAuth(response);

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
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({
      ...initialState,
      isLoading: false,
    });
  }, []);

  const hasPermission = useCallback(
    (functionName: string) => {
      return state.funciones.some((f) => f.nombre === functionName);
    },
    [state.funciones],
  );

  const getAccessLevel = useCallback(
    (functionName: string): string | null => {
      const found = state.funciones.find((f) => f.nombre === functionName);
      return found ? found.nivel_acceso : null;
    },
    [state.funciones],
  );

  const value = useMemo(
    () => ({ ...state, login, logout, hasPermission, getAccessLevel }),
    [state, login, logout, hasPermission, getAccessLevel],
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
