import { useState, useEffect, useCallback } from 'react';
import {
  MobileCatalogService,
  MobileCatalogProduct,
  MobileCatalogFilterMeta,
} from '../../../services/catalog.service';
import type { Product } from '../../../../../types/shop.types';

export function useMobileCatalog() {
  // Estados de datos
  const [products, setProducts] = useState<MobileCatalogProduct[]>([]);
  const [filterMeta, setFilterMeta] = useState<MobileCatalogFilterMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Cargar metadatos de filtros una vez
  useEffect(() => {
    let isMounted = true;
    MobileCatalogService.getFilterMetadata()
      .then((meta: MobileCatalogFilterMeta) => {
        if (isMounted) setFilterMeta(meta);
      })
      .catch((err: unknown) => {
        console.error('Error al cargar metadatos de filtros en móvil:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar catálogo de productos
  const loadProducts = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMessage(null);

      try {
        const params: Record<string, any> = {
          limit: 30,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedCategory && selectedCategory !== 'all') {
          params.categoria = selectedCategory;
        }

        if (activeFilters.gender && activeFilters.gender !== 'all') {
          params.genero = activeFilters.gender;
        }

        if (activeFilters.sizes && activeFilters.sizes.length > 0) {
          params.talla = activeFilters.sizes[0];
        }

        if (activeFilters.colors && activeFilters.colors.length > 0) {
          params.color = activeFilters.colors[0];
        }

        if (activeFilters.onlySale) {
          params.en_oferta = true;
        }

        if (activeFilters.minPrice && !isNaN(Number(activeFilters.minPrice))) {
          params.min_price = Number(activeFilters.minPrice);
        }

        if (activeFilters.maxPrice && !isNaN(Number(activeFilters.maxPrice))) {
          params.max_price = Number(activeFilters.maxPrice);
        }

        const res = await MobileCatalogService.getProducts(params);
        setProducts(res.data);
      } catch (err: any) {
        console.error('Error al consultar catálogo en móvil:', err);
        setErrorMessage(
          err?.response?.data?.message ||
            'No se pudo conectar con el catálogo. Desliza para reintentar.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, selectedCategory, activeFilters]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setActiveFilters({});
  };

  const toShopProduct = (item: MobileCatalogProduct): Product => ({
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
    sizes: item.tallas_disponibles.map((t: { id_talla: number; codigo: string }) => t.codigo),
    colors: item.colores_disponibles.map((c: { id_color: number; nombre: string; codigo_hex: string | null }) => c.nombre),
  });

  return {
    products,
    filterMeta,
    loading,
    refreshing,
    errorMessage,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filterModalVisible,
    setFilterModalVisible,
    activeFilters,
    loadProducts,
    handleApplyFilters,
    handleResetFilters,
    toShopProduct,
  };
}
