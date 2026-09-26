/**
 * @caso-de-uso CU25 — Utilizar vestidor virtual
 * @subsistema Experiencia Móvil
 * @capa Service/Gateway — Aplicación móvil
 * @responsabilidad Encapsula la comunicación con la API o integración externa y transforma su respuesta para la capa de presentación.
 * @secuencia Cliente -> vestidor virtual -> controlador de experiencia -> servicios de cámara y renderizado -> Producto/Variante/Recursos 3D.
 */
import api from '../../../../../services/api';
import type { ArVariantDetail, ArVariantsResponse } from '../types/virtual-fitting.types';

export const virtualFittingService = {
  /**
   * Obtiene todas las variantes compatibles con Realidad Aumentada de un producto.
   * Filtra únicamente las que cuenten con modelo_3d_url en el backend.
   */
  async getArVariantsByProduct(productId: number): Promise<ArVariantsResponse> {
    const response = await api.get<ArVariantsResponse>(
      `/virtual-fitting/product/${productId}/ar-variants`,
    );
    return response.data;
  },

  /**
   * Obtiene el detalle específico de una variante para el vestidor virtual.
   */
  async getVariantForFitting(variantId: number): Promise<ArVariantDetail> {
    const response = await api.get<ArVariantDetail>(`/virtual-fitting/variant/${variantId}`);
    return response.data;
  },

  /**
   * Registra analítica de interacción en el vestidor virtual (RN-M6-11).
   * No guarda fotos ni video personales, respetando la privacidad del usuario.
   */
  async registerInteraction(productId: number): Promise<{ registered: boolean }> {
    try {
      const response = await api.post<{ registered: boolean }>('/virtual-fitting/interaction', {
        id_producto: productId,
      });
      return response.data;
    } catch {
      // Si falla (por ejemplo usuario anónimo), no bloqueamos la experiencia
      return { registered: false };
    }
  },

  /**
   * Obtiene la primera prenda con soporte 3D en caso de ingresar al vestidor
   * directamente desde el menú principal sin producto seleccionado.
   */
  async getDefaultArProductId(): Promise<number> {
    try {
      const response = await api.get('/catalog/products', {
        params: { limit: 10 },
      });
      const items = response.data?.data || response.data?.productos || response.data || [];
      const arItem = items.find((p: any) => p.tiene_3d || p.tiene_modelo_3d);
      return arItem?.id_producto || 1;
    } catch {
      return 1;
    }
  },
};

export default virtualFittingService;
