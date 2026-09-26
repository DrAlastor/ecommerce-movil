/**
 * @caso-de-uso CU22 — Consultar historial de compras
 * @subsistema Ventas, Pagos y Compras
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> historial -> controlador de compras -> servicio de historial -> Venta/DetalleVenta/Pago.
 */
export { default as MyPurchasesScreen } from './screens/MyPurchasesScreen';
export * from './types/purchases.types';
export * from './services/purchases.service';
export * from './hooks/useMyPurchases';
export * from './components/PurchaseFilterTabs';
export * from './components/PurchaseOrderCard';
export * from './components/PurchaseReceiptModal';
export * from './components/PurchasesEmptyState';
