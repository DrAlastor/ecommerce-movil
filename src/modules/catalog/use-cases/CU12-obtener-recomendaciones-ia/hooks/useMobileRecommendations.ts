import { useCallback, useEffect, useState } from 'react';
import type { Product } from '../../../../../types/shop.types';
import {
  MobileRecommendedProduct,
  MobileRecommendationsService,
} from '../services/recommendations.service';

export function useMobileRecommendations() {
  const [products, setProducts] = useState<MobileRecommendedProduct[]>([]);
  const [prompt, setPrompt] = useState('');
  const [source, setSource] = useState<'ai' | 'local'>('local');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (isRefresh = false, customPrompt?: string) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage(null);
    try {
      const response = await MobileRecommendationsService.getRecommendations({
        prompt: customPrompt ?? prompt,
        limit: 8,
      });
      setProducts(response.data);
      setSource(response.meta.source);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'No se pudieron cargar recomendaciones.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [prompt]);

  useEffect(() => {
    loadRecommendations(false, '');
  }, [loadRecommendations]);

  const submitPrompt = () => {
    loadRecommendations(false, prompt);
  };

  const toShopProduct = (item: MobileRecommendedProduct): Product => ({
    id: item.id_producto,
    name: item.nombre,
    category: item.categoria?.nombre || 'General',
    categorySlug: item.categoria?.nombre.toLowerCase() || 'general',
    price: item.precio_final,
    originalPrice: item.tiene_descuento ? item.precio_base : undefined,
    rating: 4.8,
    reviewsCount: 12,
    image:
      item.imagen_principal ||
      'https://fashionstorestorage.blob.core.windows.net/productos/hero-model.jpg',
    isNew: item.id_producto > 15,
    isSale: item.tiene_descuento,
    description: item.descripcion || '',
    sizes: item.tallas_disponibles.map((size) => size.codigo),
    colors: item.colores_disponibles.map((color) => color.nombre),
  });

  return {
    products,
    prompt,
    setPrompt,
    source,
    loading,
    refreshing,
    errorMessage,
    loadRecommendations,
    submitPrompt,
    toShopProduct,
  };
}
