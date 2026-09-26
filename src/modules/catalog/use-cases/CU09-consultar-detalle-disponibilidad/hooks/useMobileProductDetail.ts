/**
 * @caso-de-uso CU09 — Consultar detalle y disponibilidad de producto
 * @subsistema Catálogo e Inventario
 * @capa Control (presentación) — Aplicación móvil
 * @responsabilidad Coordina estado, validaciones y acciones de la interfaz antes de delegar la operación al servicio o API.
 * @secuencia Cliente -> detalle del producto -> controlador de detalle -> servicios de catálogo e inventario -> Producto/Variante/Inventario/Sucursal.
 */
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
    if (!product || selectedColorId === null) return null;
    if (selectedTallaId !== null) {
      const exactMatch = product.variantes.find(
        (v) => v.color.id_color === selectedColorId && v.talla.id_talla === selectedTallaId,
      );
      if (exactMatch) return exactMatch;
    }
    return product.variantes.find((v) => v.color.id_color === selectedColorId) || null;
  }, [product, selectedColorId, selectedTallaId]);

  // Lista dinámica de imágenes:
  // - Posición 0: Imagen de la variante seleccionada (según color activo)
  // - Posiciones siguientes: Galería de imágenes generales del producto
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [...product.imagenes];
    if (selectedVariant?.imagen_url) {
      const existingIdx = list.findIndex((img) => img.url === selectedVariant.imagen_url);
      if (existingIdx !== -1) {
        const [found] = list.splice(existingIdx, 1);
        list.unshift(found);
      } else {
        list.unshift({
          id_imagen_producto: -selectedVariant.id_producto_variante,
          url: selectedVariant.imagen_url,
          texto_alternativo: `${product.nombre} - ${selectedVariant.color.nombre}`,
          es_principal: true,
          orden: 0,
        });
      }
    }
    return list;
  }, [product, selectedVariant]);

  // Manejador inteligente de cambio de color
  const handleSelectColor = (colorId: number) => {
    setSelectedColorId(colorId);
    if (product) {
      const validForColor = product.variantes.filter((v) => v.color.id_color === colorId);
      const isCurrentTallaValid = validForColor.some((v) => v.talla.id_talla === selectedTallaId);
      if (!isCurrentTallaValid && validForColor.length > 0) {
        const inStock = validForColor.find((v) => v.total_stock > 0) || validForColor[0];
        setSelectedTallaId(inStock.talla.id_talla);
      }
    }
    // Al cambiar color, enfocar de inmediato la imagen de la variante
    setActiveImageIndex(0);
  };

  // Manejador inteligente de cambio de talla
  const handleSelectTalla = (tallaId: number) => {
    setSelectedTallaId(tallaId);
    if (product) {
      const validForTalla = product.variantes.filter((v) => v.talla.id_talla === tallaId);
      const isCurrentColorValid = validForTalla.some((v) => v.color.id_color === selectedColorId);
      if (!isCurrentColorValid && validForTalla.length > 0) {
        const inStock = validForTalla.find((v) => v.total_stock > 0) || validForTalla[0];
        setSelectedColorId(inStock.color.id_color);
      }
    }
  };

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
      image: galleryImages[activeImageIndex]?.url || galleryImages[0]?.url || '',
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
    addToCart(
      shopProd,
      quantity,
      selectedVariant.talla.codigo,
      selectedVariant.color.nombre,
      selectedVariant.id_producto_variante
    );
  };

  const isFavorited = product ? isInWishlist(product.id_producto) : false;

  const handleToggleWishlist = () => {
    if (!product) return;
    const prod = toShopProduct();
    toggleWishlist(product.id_producto, prod || undefined);
  };

  return {
    product,
    galleryImages,
    loading,
    errorMessage,
    selectedColorId,
    setSelectedColorId: handleSelectColor,
    selectedTallaId,
    setSelectedTallaId: handleSelectTalla,
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
