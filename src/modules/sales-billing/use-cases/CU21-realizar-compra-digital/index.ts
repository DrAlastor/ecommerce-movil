/**
 * @caso-de-uso CU21 — Realizar compra digital
 * @subsistema Ventas, Pagos y Compras
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> checkout -> controlador de compra -> servicios de compra y pago -> Venta/DetalleVenta/Pago/Inventario.
 */
export { default as CheckoutScreen } from './screens/CheckoutScreen';
export * from './types/checkout.types';
export * from './services/checkout.service';
export * from './hooks/useCheckout';
export * from './components/DeliveryAddressForm';
export * from './components/OrderSummaryList';
export * from './components/CheckoutTotalsCard';
export * from './components/CheckoutFooter';
