export interface PurchaseItemDetail {
  id_detalle_venta: number;
  id_producto: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  talla?: string;
  color?: string;
}

export interface PurchaseHistoryItem {
  id_venta: number;
  fecha: string;
  total: number;
  estado_venta: string;
  id_sucursal?: number;
  items_count: number;
  pago?: {
    id_pago: number;
    monto: number;
    metodo: string;
    transaccion_id?: string;
    estado: string;
  };
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
