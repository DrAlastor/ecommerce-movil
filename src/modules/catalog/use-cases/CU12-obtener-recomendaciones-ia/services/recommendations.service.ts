/**
 * @caso-de-uso CU12 — Obtener recomendaciones de prendas mediante IA
 * @subsistema Experiencia Inteligente
 * @capa Service/Gateway — Aplicación móvil
 * @responsabilidad Encapsula la comunicación con la API o integración externa y transforma su respuesta para la capa de presentación.
 * @secuencia Cliente -> asistente de recomendaciones -> controlador de IA -> servicio de recomendaciones -> Catálogo/Preferencias/Proveedor de IA.
 */
import api from '../../../../../services/api';
import type { MobileCatalogProduct } from '../../../services/catalog.service';

export interface MobileRecommendedProduct extends MobileCatalogProduct {
  razon_recomendacion: string;
  stock_total?: number;
}

export interface MobileRecommendationsResponse {
  data: MobileRecommendedProduct[];
  meta: {
    total: number;
    personalized: boolean;
    source: 'ai' | 'local';
  };
}

export const MobileRecommendationsService = {
  async getRecommendations(data?: { prompt?: string; limit?: number }): Promise<MobileRecommendationsResponse> {
    const response = await api.post<MobileRecommendationsResponse>('/catalog/recommendations', data || {});
    return response.data;
  },
};
