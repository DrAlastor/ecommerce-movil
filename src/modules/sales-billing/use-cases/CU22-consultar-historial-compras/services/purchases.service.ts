import api from '../../../../../services/api';
import type { PurchaseHistoryItem } from '../types/purchases.types';

export const PurchasesService = {
  async getMyPurchases(params?: { estado?: string }): Promise<PurchaseHistoryItem[]> {
    try {
      const response = await api.get('/sales-billing/purchases', { params });
      const rawList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      return rawList.map((raw: any) => ({
        id_venta: raw.id_venta,
        codigo_factura: raw.codigo_factura,
        fecha: raw.fecha_venta || raw.fecha || new Date().toISOString(),
        fecha_venta: raw.fecha_venta,
        total: Number(raw.total || 0),
        subtotal: Number(raw.subtotal || 0),
        descuento: Number(raw.descuento || 0),
        estado_venta: raw.estado || raw.estado_venta || 'Pagada',
        estado: raw.estado,
        tipo_venta: raw.tipo_venta,
        items_count: raw.total_articulos || raw.items_count || (raw.items ? raw.items.length : 0),
        total_articulos: raw.total_articulos,
        pago: raw.pago
          ? {
              id_pago: raw.pago.id_pago,
              monto: Number(raw.pago.importe ?? raw.pago.monto ?? 0),
              importe: Number(raw.pago.importe ?? raw.pago.monto ?? 0),
              metodo: raw.pago.metodo_pago || raw.pago.metodo || 'tarjeta',
              metodo_pago: raw.pago.metodo_pago,
              transaccion_id: raw.pago.transaccion_externa || raw.pago.transaccion_id,
              transaccion_externa: raw.pago.transaccion_externa,
              estado: raw.pago.estado,
              fecha_pago: raw.pago.fecha_pago,
            }
          : undefined,
        envio: raw.envio,
        items: (raw.items || []).map((it: any) => ({
          id_detalle_venta: it.id_detalle_venta,
          id_producto: it.id_producto,
          nombre_producto: it.nombre_producto,
          cantidad: it.cantidad,
          precio_unitario: Number(it.precio_unitario),
          subtotal: Number(it.subtotal),
          sku: it.sku,
          talla: it.talla,
          color: it.color,
          imagen: it.imagen,
        })),
      }));
    } catch (error: any) {
      console.error('Error al obtener compras:', error);
      return [];
    }
  },

  async getPurchaseDetail(id: number): Promise<PurchaseHistoryItem | null> {
    try {
      const response = await api.get(`/sales-billing/purchases/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error al obtener detalle de compra ${id}:`, error);
      return null;
    }
  },
};
