import api from '../../../../../services/api';
import type { ProcessDigitalPurchaseInput, DigitalPurchaseResult } from '../types/checkout.types';

export const CheckoutService = {
  async processPurchase(input: ProcessDigitalPurchaseInput): Promise<DigitalPurchaseResult> {
    try {
      const response = await api.post('/sales-billing/checkout/process', input);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Sesión Expirada. Por favor inicia sesión nuevamente para completar tu compra de forma segura.');
      }
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error procesando el pedido en el servidor';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
  },
};
