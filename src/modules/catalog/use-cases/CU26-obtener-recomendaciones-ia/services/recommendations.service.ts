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
