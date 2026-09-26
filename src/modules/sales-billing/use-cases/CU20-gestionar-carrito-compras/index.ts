/**
 * @caso-de-uso CU20 — Gestionar carrito de compras
 * @subsistema Ventas, Pagos y Compras
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> carrito -> controlador de carrito -> servicio de carrito -> Carrito/DetalleCarrito/Variante/Inventario.
 */
export { default as CartScreen } from './screens/CartScreen';
export * from './types/cart.types';
export * from './hooks/useCartScreen';
export * from './components/CartItemCard';
export * from './components/CartSummaryFooter';
export * from './components/CartBenefitsBanner';
export * from './components/CartEmptyState';
