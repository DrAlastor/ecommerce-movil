import api from '../../../../../services/api';
import type { PurchaseHistoryItem } from '../types/purchases.types';

export const PurchasesService = {
  async getMyPurchases(params?: { estado?: string }): Promise<PurchaseHistoryItem[]> {
    try {
      const response = await api.get('/sales-billing/purchases', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener compras:', error);
      return [];
    }
  },

  async getPurchaseDetail(id: number): Promise<PurchaseHistoryItem | null> {
    try {
      const response = await api.get(`/sales-billing/purchases/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error al obtener detalle de compra ${id}:`, error);
      return null;
    }
  },
};
