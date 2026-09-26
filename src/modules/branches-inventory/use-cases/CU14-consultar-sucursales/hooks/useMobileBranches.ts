/**
 * @caso-de-uso CU14 — Consultar sucursales
 * @subsistema Sucursales e Inventario
 * @capa Control (presentación) — Aplicación móvil
 * @responsabilidad Coordina estado, validaciones y acciones de la interfaz antes de delegar la operación al servicio o API.
 * @secuencia Cliente -> listado de sucursales -> controlador de consulta -> servicio de sucursales -> Ciudad/Sucursal/Disponibilidad.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Linking } from 'react-native';
import { MobileBranchesService } from '../services/branches.service';
import type { MobileBranch, MobileCity } from '../types';
import { ElegantAlert } from '../../../../../shared/context/AlertContext';

/**
 * Calcula si la sucursal se encuentra abierta actualmente
 */
export function isBranchOpenNow(openTime?: string | null, closeTime?: string | null): {
  isOpen: boolean;
  message: string;
} {
  if (!openTime || !closeTime) {
    return { isOpen: true, message: 'Horario regular en tienda' };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);

  const startMinutes = openH * 60 + (openM || 0);
  const endMinutes = closeH * 60 + (closeM || 0);

  if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
    return {
      isOpen: true,
      message: `Abierto ahora hasta las ${closeTime.substring(0, 5)}`,
    };
  } else {
    return {
      isOpen: false,
      message: `Cerrado · Abre a las ${openTime.substring(0, 5)}`,
    };
  }
}

export function useMobileBranches() {
  const [branches, setBranches] = useState<MobileBranch[]>([]);
  const [cities, setCities] = useState<MobileCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setErrorMessage(null);

      const [citiesData, branchesData] = await Promise.all([
        MobileBranchesService.getActiveCities(),
        MobileBranchesService.getActiveBranches(),
      ]);

      setCities(citiesData);
      setBranches(branchesData);
    } catch (error: any) {
      console.error('Error al cargar sucursales en móvil:', error);
      setErrorMessage('No pudimos conectar con el servidor para obtener las sucursales.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(true);
  }, [loadData]);

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      // Filtro por ciudad
      if (selectedCityId !== null && branch.id_ciudad !== selectedCityId) {
        return false;
      }
      // Filtro por búsqueda de texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = branch.nombre.toLowerCase().includes(q);
        const matchesAddress = branch.direccion.toLowerCase().includes(q);
        const matchesCity = branch.ciudad.nombre.toLowerCase().includes(q);
        return matchesName || matchesAddress || matchesCity;
      }
      return true;
    });
  }, [branches, selectedCityId, searchQuery]);

  const handleCall = useCallback((phone: string) => {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleaned}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          ElegantAlert.show('Teléfono de Contacto', `Comunícate directamente al: ${phone}`, 'info');
        }
      })
      .catch(() => {
        ElegantAlert.show('Teléfono de Contacto', `Comunícate directamente al: ${phone}`, 'info');
      });
  }, []);

  const handleOpenMaps = useCallback((branch: MobileBranch) => {
    const query = encodeURIComponent(`${branch.nombre}, ${branch.direccion}, ${branch.ciudad.nombre}, Bolivia`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {
      ElegantAlert.show('Ubicación de Sucursal', branch.direccion, 'info');
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedCityId(null);
    setSearchQuery('');
  }, []);

  return {
    branches,
    cities,
    filteredBranches,
    isLoading,
    isRefreshing,
    errorMessage,
    selectedCityId,
    setSelectedCityId,
    searchQuery,
    setSearchQuery,
    loadData,
    handleCall,
    handleOpenMaps,
    handleResetFilters,
  };
}
