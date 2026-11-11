import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AVAILABLE_TENANTS, DEFAULT_TENANT_ID, TenantInfo } from '../types/tenant.types';
import api from '../../services/api';

interface TenantContextType {
  currentTenant: TenantInfo;
  tenantKey: string;
  availableTenants: TenantInfo[];
  selectTenant: (id: string) => Promise<void>;
  isSelectorVisible: boolean;
  openSelector: () => void;
  closeSelector: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const STORAGE_KEY = 'current_tenant_id';

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantKey, setTenantKey] = useState<string>(DEFAULT_TENANT_ID);
  const [isSelectorVisible, setIsSelectorVisible] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Cargar tenant guardado en AsyncStorage al iniciar
  useEffect(() => {
    const loadStoredTenant = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && AVAILABLE_TENANTS[stored]) {
          setTenantKey(stored);
          api.defaults.headers.common['x-tenant-id'] = stored;
        } else {
          api.defaults.headers.common['x-tenant-id'] = DEFAULT_TENANT_ID;
        }
      } catch (err) {
        console.warn('Error cargando tenant almacenado en móvil:', err);
        api.defaults.headers.common['x-tenant-id'] = DEFAULT_TENANT_ID;
      } finally {
        setIsLoaded(true);
      }
    };
    loadStoredTenant();
  }, []);

  const selectTenant = useCallback(async (id: string) => {
    if (!AVAILABLE_TENANTS[id]) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, id);
      setTenantKey(id);
      api.defaults.headers.common['x-tenant-id'] = id;
      setIsSelectorVisible(false);
    } catch (err) {
      console.error('Error guardando nuevo tenant:', err);
    }
  }, []);

  const openSelector = useCallback(() => setIsSelectorVisible(true), []);
  const closeSelector = useCallback(() => setIsSelectorVisible(false), []);

  const currentTenant = useMemo(() => {
    return AVAILABLE_TENANTS[tenantKey] || AVAILABLE_TENANTS[DEFAULT_TENANT_ID];
  }, [tenantKey]);

  const availableTenants = useMemo(() => {
    return Object.values(AVAILABLE_TENANTS);
  }, []);

  const value = useMemo(
    () => ({
      currentTenant,
      tenantKey,
      availableTenants,
      selectTenant,
      isSelectorVisible,
      openSelector,
      closeSelector,
    }),
    [currentTenant, tenantKey, availableTenants, selectTenant, isSelectorVisible, openSelector, closeSelector],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant debe ser usado dentro de un TenantProvider');
  }
  return context;
}

