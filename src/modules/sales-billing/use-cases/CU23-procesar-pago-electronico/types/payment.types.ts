/**
 * @caso-de-uso CU23 — Procesar pago electrónico
 * @subsistema Ventas, Pagos y Compras
 * @capa Entity/DTO — Aplicación móvil
 * @responsabilidad Define los contratos de datos intercambiados entre la interfaz, los servicios y el backend.
 * @secuencia Cliente -> interfaz de pago -> controlador de pagos -> servicio de pago -> Pasarela de Pago/Pago/Venta.
 */
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
  onNavigateLogin?: () => void;
}
