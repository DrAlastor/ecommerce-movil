/**
 * @caso-de-uso CU09 — Consultar detalle y disponibilidad de producto
 * @subsistema Catálogo e Inventario
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> detalle del producto -> controlador de detalle -> servicios de catálogo e inventario -> Producto/Variante/Inventario/Sucursal.
 */
export * from './screens/ProductDetailScreen';
export * from './hooks/useMobileProductDetail';
export * from './services/product-detail.service';
export * from './components/MobileProductGallery';
export * from './components/MobileVariantSelector';
export * from './components/MobileBranchStockSheet';
export * from './components/MobileSizeGuideModal';
export * from './components/VirtualFittingButton';
