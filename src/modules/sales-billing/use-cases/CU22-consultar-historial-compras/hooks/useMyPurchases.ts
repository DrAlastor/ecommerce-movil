import { useState, useEffect, useCallback } from 'react';
import { PurchasesService } from '../services/purchases.service';
import type { PurchaseHistoryItem, PurchaseFilter } from '../types/purchases.types';

export function useMyPurchases() {
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PurchaseFilter>('todos');
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseHistoryItem | null>(null);

  const loadPurchases = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const data = await PurchasesService.getMyPurchases({
        estado: selectedFilter !== 'todos' ? selectedFilter : undefined,
      });
      setPurchases(data);
    } catch (err) {
      console.error('Error cargando historial de compras:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleRefresh = () => {
    loadPurchases(true);
  };

  const formatPrice = (amount: number) => `${amount.toFixed(2)} Bs`;

  return {
    purchases,
    isLoading,
    isRefreshing,
    selectedFilter,
    setSelectedFilter,
    selectedReceipt,
    setSelectedReceipt,
    handleRefresh,
    formatPrice,
  };
}
