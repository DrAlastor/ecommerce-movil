import api from '../../../../../services/api';
import type {
  POSBranch,
  POSProduct,
  POSClientResult,
  CreatePresentialSalePayload,
  PaymentConfirmationResult,
  POSSaleHistoryItem,
} from '../types/pos.types';

export const mobilePosService = {
  /**
   * Obtiene la lista de sucursales autorizadas para el usuario en sesión
   */
  async getBranches(): Promise<POSBranch[]> {
    const response = await api.get<POSBranch[]>('/sales-billing/pos/branches');
    return response.data;
  },

  /**
   * Consulta prendas con existencias locales en la sucursal seleccionada
   */
  async getProducts(params: {
    id_sucursal: number;
    search?: string;
    id_categoria?: number;
  }): Promise<POSProduct[]> {
    const response = await api.get<POSProduct[]>('/sales-billing/pos/products', {
      params,
    });
    return response.data;
  },

  /**
   * Búsqueda rápida de clientes por CI, NIT o nombre
   */
  async searchClients(search: string): Promise<POSClientResult[]> {
    const response = await api.get<POSClientResult[]>('/sales-billing/pos/clients', {
      params: { search },
    });
    return response.data;
  },

  /**
   * Registra una venta física en mostrador, procesa el cobro y emite la factura electrónica
   */
  async registerSale(
    payload: CreatePresentialSalePayload,
  ): Promise<PaymentConfirmationResult> {
    const response = await api.post<PaymentConfirmationResult>(
      '/sales-billing/pos/sales',
      payload,
    );
    return response.data;
  },

  /**
   * Genera sesión de cobro con Stripe en POS
   */
  async createStripeSession(data: {
    total: number;
    sucursalNombre?: string;
    clienteNombre?: string;
  }): Promise<{ url: string; sessionId: string; amount: number }> {
    const response = await api.post<{ url: string; sessionId: string; amount: number }>(
      '/sales-billing/pos/stripe-session',
      data,
    );
    return response.data;
  },

  /**
   * Consulta el historial de ventas registradas en la sucursal
   */
  async getSalesHistory(params?: {
    id_sucursal?: number;
    search?: string;
    limit?: number;
  }): Promise<POSSaleHistoryItem[]> {
    const response = await api.get<POSSaleHistoryItem[]>('/sales-billing/pos/history', {
      params,
    });
    return response.data;
  },
};
