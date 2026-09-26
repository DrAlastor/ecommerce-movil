/**
 * @caso-de-uso CU22 — Consultar historial de compras
 * @subsistema Ventas, Pagos y Compras
 * @capa Entity/DTO — Aplicación móvil
 * @responsabilidad Define los contratos de datos intercambiados entre la interfaz, los servicios y el backend.
 * @secuencia Cliente -> historial -> controlador de compras -> servicio de historial -> Venta/DetalleVenta/Pago.
 */
export interface PurchaseItemDetail {
  id_detalle_venta: number;
  id_producto: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  sku?: string;
  talla?: string;
  color?: string;
  imagen?: string;
}

export interface PurchaseHistoryItem {
  id_venta: number;
  codigo_factura?: string;
  fecha: string;
  fecha_venta?: string;
  total: number;
  subtotal?: number;
  descuento?: number;
  estado_venta: string;
  estado?: string;
  tipo_venta?: string;
  id_sucursal?: number;
  items_count: number;
  total_articulos?: number;
  pago?: {
    id_pago: number;
    monto: number;
    importe?: number;
    metodo: string;
    metodo_pago?: string;
    transaccion_id?: string;
    transaccion_externa?: string;
    estado: string;
    fecha_pago?: string;
  };
  envio?: {
    id_envio: number;
    numero_guia?: string;
    transportista?: string;
    estado?: string;
    fecha_entrega?: string;
    direccion?: {
      destinatario?: string;
      telefono?: string;
      calle?: string;
      ciudad?: string;
    } | null;
  } | null;
  factura?: {
    id_factura: number;
    numero_factura: string;
    numero_autorizacion: string;
    codigo_control: string;
    monto_total: number;
    nit_emisor: string;
  };
  items?: PurchaseItemDetail[];
}

export type PurchaseFilter = 'todos' | 'pagada' | 'pendiente';
