import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MobileProductDetailService,
  type MobileProductDetail,
  type MobileProductVariant,
} from '../services/product-detail.service';
import { useShop } from '../../../../../shared/context/ShopContext';
import type { Product } from '../../../../../types/shop.types';

export function useMobileProductDetail(productId: number) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();

  const [product, setProduct] = useState<MobileProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedTallaId, setSelectedTallaId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sizeGuideVisible, setSizeGuideVisible] = useState(false);
  const [branchStockVisible, setBranchStockVisible] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await MobileProductDetailService.getProductById(productId);
      setProduct(data);

      if (data.variantes.length > 0) {
        const inStock = data.variantes.find((v) => v.total_stock > 0) || data.variantes[0];
        setSelectedColorId(inStock.color.id_color);
        setSelectedTallaId(inStock.talla.id_talla);
      } else {
        if (data.colores_disponibles.length > 0) setSelectedColorId(data.colores_disponibles[0].id_color);
        if (data.tallas_disponibles.length > 0) setSelectedTallaId(data.tallas_disponibles[0].id_talla);
      }
    } catch (err: any) {
      console.error('Error al cargar detalle de producto en móvil:', err);
      setErrorMessage(err.response?.data?.message || 'No se pudo cargar el producto.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Variante seleccionada
  const selectedVariant: MobileProductVariant | null = useMemo(() => {
    if (!product || selectedColorId === null || selectedTallaId === null) return null;
    return (
      product.variantes.find(
        (v) => v.color.id_color === selectedColorId && v.talla.id_talla === selectedTallaId,
      ) || null
    );
  }, [product, selectedColorId, selectedTallaId]);

  // Sincronizar imagen de la variante si existe
  useEffect(() => {
    if (selectedVariant?.imagen_url && product?.imagenes) {
      const idx = product.imagenes.findIndex((img) => img.url === selectedVariant.imagen_url);
      if (idx !== -1) {
        setActiveImageIndex(idx);
      }
    }
  }, [selectedVariant, product]);

  const currentPrice = selectedVariant ? selectedVariant.precio_final : product?.precio_final_base || 0;
  const originalPrice = selectedVariant ? selectedVariant.precio_variante : product?.precio_base || 0;
  const hasDiscount = selectedVariant ? selectedVariant.tiene_descuento : product?.tiene_descuento || false;
  const isAvailable = Boolean(selectedVariant && selectedVariant.total_stock > 0);

  const toShopProduct = (): Product | null => {
    if (!product) return null;
    return {
      id: product.id_producto,
      name: product.nombre,
      category: product.categoria.nombre,
      categorySlug: product.categoria.nombre.toLowerCase().replace(/\s+/g, '-'),
      price: currentPrice,
      originalPrice: hasDiscount ? originalPrice : undefined,
      rating: 4.8,
      reviewsCount: 12,
      image: product.imagenes[activeImageIndex]?.url || product.imagenes[0]?.url || '',
      isNew: Boolean(product.coleccion),
      isSale: hasDiscount,
      description: product.descripcion || undefined,
      sizes: product.tallas_disponibles.map((t) => t.codigo),
      colors: product.colores_disponibles.map((c) => c.nombre),
    };
  };

  const handleAddToCart = () => {
    const shopProd = toShopProduct();
    if (!shopProd || !selectedVariant) return;
    addToCart(shopProd, quantity, selectedVariant.talla.codigo, selectedVariant.color.nombre);
  };

  const isFavorited = product ? isInWishlist(product.id_producto) : false;

  const handleToggleWishlist = () => {
    if (!product) return;
    const prod = toShopProduct();
    toggleWishlist(product.id_producto, prod || undefined);
  };

  return {
    product,
    loading,
    errorMessage,
    selectedColorId,
    setSelectedColorId,
    selectedTallaId,
    setSelectedTallaId,
    selectedVariant,
    quantity,
    setQuantity,
    activeImageIndex,
    setActiveImageIndex,
    sizeGuideVisible,
    setSizeGuideVisible,
    branchStockVisible,
    setBranchStockVisible,
    currentPrice,
    originalPrice,
    hasDiscount,
    isAvailable,
    isFavorited,
    fetchProduct,
    handleAddToCart,
    handleToggleWishlist,
  };
}
