export interface POSBranch {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  telefono?: string | null;
  ciudad?: {
    id_ciudad: number;
    nombre: string;
    pais: string;
  };
}

export interface POSProductVariant {
  id_producto_variante: number;
  sku: string;
  talla: string;
  color: string;
  color_hex: string;
  stock_disponible: number;
  precio_regular: number;
  precio_final: number;
  tiene_descuento: boolean;
}

export interface POSProduct {
  id_producto: number;
  nombre: string;
  categoria: string;
  id_categoria: number;
  imagen: string | null;
  precio_base: number;
  stock_sucursal_total: number;
  variantes: POSProductVariant[];
}

export interface POSCartItem {
  id_producto_variante: number;
  id_producto: number;
  nombre_producto: string;
  imagen: string | null;
  sku: string;
  talla: string;
  color: string;
  color_hex: string;
  cantidad: number;
  precio_regular: number;
  precio_unitario: number;
  descuento_unitario: number;
  subtotal: number;
  stock_max: number;
}

export interface POSClientResult {
  id_cliente: number;
  ci: string | null;
  nombre_completo: string;
  email: string | null;
  puntos_fidelidad?: number;
}

export interface CreatePresentialSalePayload {
  id_sucursal: number;
  items: {
    id_producto_variante: number;
    cantidad: number;
  }[];
  metodo_pago: 'efectivo' | 'tarjeta' | 'qr';
  monto_recibido?: number;
  id_cliente?: number;
  cliente_ci?: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  nit_factura?: string;
  razon_social_factura?: string;
  transaccion_externa?: string;
}

export interface PaymentConfirmationResult {
  id_venta: number;
  codigo_venta: string;
  total: number;
  subtotal: number;
  descuento_total: number;
  fecha: string;
  tipo_venta: string;
  estado: string;
  cliente: {
    id_cliente: number;
    nombre_completo: string;
    ci: string | null;
  };
  sucursal: {
    id_sucursal: number;
    nombre: string;
  };
  factura?: {
    numero_factura: string;
    autorizacion: string;
    nit_emisor: string;
    nit_cliente: string;
    razon_social: string;
    codigo_control?: string;
    qr_factura?: string;
  } | null;
  pago: {
    metodo: string;
    monto_pagado: number;
    cambio?: number;
    transaccion?: string;
  };
  items: {
    nombre_producto: string;
    sku: string;
    talla: string;
    color: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
}

export interface POSSaleHistoryItem {
  id_venta: number;
  codigo_venta: string;
  fecha: string;
  tipo_venta: string;
  estado: string;
  total: number;
  subtotal: number;
  cliente_nombre: string;
  cliente_ci?: string | null;
  sucursal_nombre: string;
  metodo_pago: string;
  factura_numero?: string | null;
  items_count: number;
}
