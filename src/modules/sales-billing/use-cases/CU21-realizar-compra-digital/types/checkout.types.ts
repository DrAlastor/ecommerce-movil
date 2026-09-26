/**
 * @caso-de-uso CU21 — Realizar compra digital
 * @subsistema Ventas, Pagos y Compras
 * @capa Entity/DTO — Aplicación móvil
 * @responsabilidad Define los contratos de datos intercambiados entre la interfaz, los servicios y el backend.
 * @secuencia Cliente -> checkout -> controlador de compra -> servicios de compra y pago -> Venta/DetalleVenta/Pago/Inventario.
 */
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

export interface NuevaDireccionPayload {
  destinatario: string;
  telefono: string;
  calle: string;
  detalle?: string;
  id_ciudad: number;
}

export interface ProcessDigitalPurchaseInput {
  metodo_pago: 'stripe' | 'qr' | 'transferencia';
  tipo_entrega: 'domicilio' | 'retiro_sucursal';
  id_direccion?: number;
  nueva_direccion?: NuevaDireccionPayload;
  id_sucursal_retiro?: number;
  transaccion_externa?: string;
  nit_factura?: string;
  razon_social_factura?: string;
}

export interface DigitalPurchaseResult {
  success?: boolean;
  message?: string;
  id_venta: number;
  codigo_factura?: string;
  tipo_venta?: string;
  estado?: string;
  total?: number;
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
