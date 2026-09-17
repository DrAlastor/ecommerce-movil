import type { DigitalPurchaseResult } from '../../CU21-realizar-compra-digital/types/checkout.types';

export type PaymentMethod = 'tarjeta' | 'qr' | 'transferencia';

export interface PaymentFormPayload {
  metodo_pago: PaymentMethod;
  numero_tarjeta?: string;
  titular?: string;
  expiracion?: string;
  cvc?: string;
}

export interface MobilePaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onClose: () => void;
  onConfirmPayment: (paymentData: PaymentFormPayload) => Promise<DigitalPurchaseResult>;
  onSuccess?: (result: DigitalPurchaseResult) => void;
  onNavigateHome?: () => void;
  onNavigateOrders?: () => void;
}
