import { useState, useEffect, useCallback, useMemo } from 'react';
import { virtualFittingService } from '../services/virtual-fitting.service';
import type {
  ArVariant,
  ArVariantsResponse,
  FittingPhase,
  SilhouetteConfig,
  FittingTransform,
  FittingViewMode,
  PoseAngle,
} from '../types/virtual-fitting.types';
import { useShop } from '../../../../../shared/context/ShopContext';

interface UseMobileVirtualFittingProps {
  productId?: number;
  initialVariantId?: number;
}

export function useMobileVirtualFitting({
  productId: propProductId,
  initialVariantId,
}: UseMobileVirtualFittingProps) {
  const { addToCart } = useShop();

  const [effectiveProductId, setEffectiveProductId] = useState<number | null>(
    propProductId || null,
  );
  const [arData, setArData] = useState<ArVariantsResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ArVariant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<FittingPhase>('loading');

  // Filtros de Talla y Color seleccionados
  const [selectedTallaId, setSelectedTallaId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);

  // Configuración del avatar / silueta
  const [silhouette, setSilhouette] = useState<SilhouetteConfig>({
    bodyType: 'female',
    heightCm: 168,
    fitPreference: 'regular',
    currentAngle: 'front',
  });

  // Modo de visualización: Avatar interactivo 3D vs Fotografía de prenda 2D
  const [viewMode, setViewMode] = useState<FittingViewMode>('avatar-3d');

  // Puntos anatómicos visibles (hombros, pecho, cadera)
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);

  // Micro-ajustes manuales de la prenda
  const [transform, setTransform] = useState<FittingTransform>({
    scale: 1.0,
    offsetY: 0,
    rotation: 0,
  });

  // Estado de adición a la bolsa
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // 1. Cargar datos del producto
  const loadProductData = useCallback(async (targetId: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await virtualFittingService.getArVariantsByProduct(targetId);

      if (!data.variantes || data.variantes.length === 0) {
        setErrorMessage('Esta prenda no cuenta con variantes compatibles con el vestidor virtual 3D.');
        setPhase('error');
        return;
      }

      setArData(data);

      // Preseleccionar variante inicial
      let defaultVariant = data.variantes[0];
      if (initialVariantId) {
        const found = data.variantes.find((v) => v.id_producto_variante === initialVariantId);
        if (found) defaultVariant = found;
      }

      setSelectedVariant(defaultVariant);
      setSelectedTallaId(defaultVariant.talla.id_talla);
      setSelectedColorId(defaultVariant.color.id_color);
      setPhase('calibration');
    } catch (err: any) {
      console.error('Error cargando vestidor virtual:', err);
      setErrorMessage(
        err.response?.data?.message ||
          'No se pudo cargar la información del producto para el vestidor virtual.',
      );
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  }, [initialVariantId]);

  useEffect(() => {
    async function init() {
      let id = propProductId;
      if (!id) {
        id = await virtualFittingService.getDefaultArProductId();
      }
      setEffectiveProductId(id);
      loadProductData(id);
    }
    init();
  }, [propProductId, loadProductData]);

  // 2. Sincronizar variante activa cuando cambia talla o color
  useEffect(() => {
    if (!arData) return;

    // Buscar coincidencia exacta
    let match = arData.variantes.find(
      (v) => v.talla.id_talla === selectedTallaId && v.color.id_color === selectedColorId,
    );

    // Si no coincide, buscar la primera disponible para la talla o color
    if (!match && selectedColorId) {
      match = arData.variantes.find((v) => v.color.id_color === selectedColorId);
    }
    if (!match && selectedTallaId) {
      match = arData.variantes.find((v) => v.talla.id_talla === selectedTallaId);
    }

    if (match) {
      setSelectedVariant(match);
      if (match.talla.id_talla !== selectedTallaId) setSelectedTallaId(match.talla.id_talla);
      if (match.color.id_color !== selectedColorId) setSelectedColorId(match.color.id_color);
    }
  }, [selectedTallaId, selectedColorId, arData]);

  // 3. Tallas y Colores disponibles filtrados
  const availableTallasForColor = useMemo(() => {
    if (!arData || !selectedColorId) return arData?.tallas_disponibles || [];
    const validTallaIds = new Set(
      arData.variantes
        .filter((v) => v.color.id_color === selectedColorId)
        .map((v) => v.talla.id_talla),
    );
    return arData.tallas_disponibles.filter((t) => validTallaIds.has(t.id_talla));
  }, [arData, selectedColorId]);

  const availableColoresForTalla = useMemo(() => {
    if (!arData || !selectedTallaId) return arData?.colores_disponibles || [];
    const validColorIds = new Set(
      arData.variantes
        .filter((v) => v.talla.id_talla === selectedTallaId)
        .map((v) => v.color.id_color),
    );
    return arData.colores_disponibles.filter((c) => validColorIds.has(c.id_color));
  }, [arData, selectedTallaId]);

  // 4. Iniciar experiencia activa de vestidor
  const startFitting = useCallback(async () => {
    setPhase('fitting');
    if (effectiveProductId) {
      virtualFittingService.registerInteraction(effectiveProductId);
    }
  }, [effectiveProductId]);

  // 5. Recalibrar
  const recalibrate = useCallback(() => {
    setTransform({ scale: 1.0, offsetY: 0, rotation: 0 });
    setPhase('calibration');
  }, []);

  // 6. Cambiar ángulo de pose (frente, 3/4, perfil)
  const setPoseAngle = useCallback((angle: PoseAngle) => {
    setSilhouette((prev) => ({ ...prev, currentAngle: angle }));
    // Ajuste de rotación para dar dinamismo
    setTransform((prev) => ({
      ...prev,
      rotation: angle === 'front' ? 0 : angle === 'three-quarter' ? 15 : 45,
    }));
  }, []);

  // 7. Cambiar tipo de silueta
  const setBodyType = useCallback((bodyType: SilhouetteConfig['bodyType']) => {
    setSilhouette((prev) => ({ ...prev, bodyType }));
  }, []);

  // 8. Cambiar preferencia de calce
  const setFitPreference = useCallback((fitPreference: SilhouetteConfig['fitPreference']) => {
    setSilhouette((prev) => ({ ...prev, fitPreference }));
    setTransform((prev) => ({
      ...prev,
      scale: fitPreference === 'slim' ? 0.95 : fitPreference === 'relaxed' ? 1.06 : 1.0,
    }));
  }, []);

  // 9. Modificar escala y posición táctil
  const adjustScale = useCallback((delta: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.8, Math.min(1.3, Number((prev.scale + delta).toFixed(2)))),
    }));
  }, []);

  const adjustOffsetY = useCallback((delta: number) => {
    setTransform((prev) => ({
      ...prev,
      offsetY: Math.max(-40, Math.min(40, prev.offsetY + delta)),
    }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setTransform({ scale: 1.0, offsetY: 0, rotation: 0 });
  }, []);

  // 10. Agregar al carrito
  const handleAddToCart = useCallback(async () => {
    if (!arData || !selectedVariant) return false;

    setIsAddingToCart(true);
    try {
      addToCart(
        {
          id: arData.producto.id_producto,
          name: arData.producto.nombre,
          price: selectedVariant.precio_final,
          originalPrice: selectedVariant.precio_variante,
          category: arData.producto.categoria,
          categorySlug: arData.producto.categoria.toLowerCase().replace(/\s+/g, '-'),
          rating: 4.8,
          reviewsCount: 12,
          image:
            selectedVariant.imagen_url ||
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          description: arData.producto.descripcion || '',
        },
        1,
        selectedVariant.talla.codigo,
        selectedVariant.color.nombre,
        selectedVariant.id_producto_variante,
      );
      return true;
    } catch (err) {
      console.error('Error agregando variante al carrito:', err);
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  }, [arData, selectedVariant, addToCart]);

  return {
    effectiveProductId,
    arData,
    selectedVariant,
    isLoading,
    errorMessage,
    phase,
    selectedTallaId,
    selectedColorId,
    setSelectedTallaId,
    setSelectedColorId,
    availableTallasForColor,
    availableColoresForTalla,
    silhouette,
    viewMode,
    setViewMode,
    showLandmarks,
    setShowLandmarks,
    transform,
    isAddingToCart,
    loadProductData,
    startFitting,
    recalibrate,
    setPoseAngle,
    setBodyType,
    setFitPreference,
    adjustScale,
    adjustOffsetY,
    resetAdjustments,
    handleAddToCart,
  };
}

export default useMobileVirtualFitting;
