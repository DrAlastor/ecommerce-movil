import { useState, useEffect, useMemo, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { MobileBranchesService } from '../services/branches.service';
import type { MobileBranch, MobileCity } from '../types';

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
      message: `Abierto hoy hasta las ${closeTime}`,
    };
  } else {
    return {
      isOpen: false,
      message: `Cerrado ahora (Abre ${openTime})`,
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
    } catch (error) {
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

  // Filtrado reactivo optimizado
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      if (selectedCityId && branch.id_ciudad !== selectedCityId) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = branch.nombre.toLowerCase().includes(query);
        const matchCity = branch.ciudad.nombre.toLowerCase().includes(query);
        const matchAddress = branch.direccion.toLowerCase().includes(query);
        return matchName || matchCity || matchAddress;
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
          Alert.alert('Teléfono', `Número de contacto: ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Teléfono', `Número de contacto: ${phone}`);
      });
  }, []);

  const handleOpenMaps = useCallback((branch: MobileBranch) => {
    const query = encodeURIComponent(`${branch.nombre}, ${branch.direccion}, ${branch.ciudad.nombre}, Bolivia`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Ubicación', branch.direccion);
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
