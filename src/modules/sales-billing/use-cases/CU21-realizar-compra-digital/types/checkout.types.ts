export interface DeliveryAddress {
  direccion: string;
  ciudad: string;
  telefono: string;
  destinatario: string;
  notas?: string;
}

export interface PaymentCardData {
  numero_tarjeta?: string;
  titular?: string;
  expiracion?: string;
  cvc?: string;
}

export interface ProcessDigitalPurchaseInput {
  direccion_envio: DeliveryAddress;
  metodo_pago: 'tarjeta' | 'qr' | 'transferencia';
  datos_pago?: PaymentCardData;
}

export interface DigitalPurchaseResult {
  success: boolean;
  message: string;
  venta?: {
    id_venta: number;
    codigo_venta: string;
    total: number;
    fecha: string;
    estado: string;
  };
  pago?: {
    id_pago: number;
    monto: number;
    metodo: string;
    transaccion_id?: string;
    estado: string;
  };
  factura?: {
    id_factura: number;
    numero_autorizacion: string;
    codigo_control: string;
    monto_total: number;
  };
}
