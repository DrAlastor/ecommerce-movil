/**
 * @caso-de-uso CU20 — Gestionar carrito de compras
 * @subsistema Ventas, Pagos y Compras
 * @capa Entity/DTO — Aplicación móvil
 * @responsabilidad Define los contratos de datos intercambiados entre la interfaz, los servicios y el backend.
 * @secuencia Cliente -> carrito -> controlador de carrito -> servicio de carrito -> Carrito/DetalleCarrito/Variante/Inventario.
 */
export interface CartItemProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
}

export interface CartItem {
  product: CartItemProduct;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
