import api from '../../../services/api';
import type { ProcessDigitalPurchaseInput, DigitalPurchaseResult } from '../use-cases/CU21-realizar-compra-digital';
import type { PurchaseHistoryItem } from '../use-cases/CU22-consultar-historial-compras';

export interface PurchasesFilterParams {
  estado?: string;
  limit?: number;
  offset?: number;
}

export const MobileSalesBillingService = {
  /**
   * CU21: Procesa la compra digital y registra el pago atómicamente
   */
  async processPurchase(input: ProcessDigitalPurchaseInput): Promise<DigitalPurchaseResult> {
    const res = await api.post<DigitalPurchaseResult>('/sales-billing/checkout/process', input);
    return res.data;
  },

  /**
   * CU21/CU23: Inicializa Stripe PaymentIntent
   */
  async createPaymentIntent(): Promise<{ clientSecret: string; amount: number }> {
    const res = await api.post<{ clientSecret: string; amount: number }>('/sales-billing/checkout/payment-intent');
    return res.data;
  },

  /**
   * CU22: Obtiene el historial de compras del cliente
   */
  async getMyPurchases(params?: PurchasesFilterParams): Promise<PurchaseHistoryItem[]> {
    const res = await api.get<PurchaseHistoryItem[]>('/sales-billing/purchases', {
      params: {
        estado: params?.estado && params.estado !== 'todos' ? params.estado : undefined,
        limit: params?.limit || 50,
        offset: params?.offset || 0,
      },
    });
    return res.data;
  },

  /**
   * CU22: Obtiene el detalle / comprobante oficial de una compra
   */
  async getPurchaseDetail(idVenta: number): Promise<PurchaseHistoryItem> {
    const res = await api.get<PurchaseHistoryItem>(`/sales-billing/purchases/${idVenta}`);
    return res.data;
  },
};
