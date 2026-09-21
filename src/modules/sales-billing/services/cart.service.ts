import api from '../../../services/api';

export interface CartItemSync {
  id_producto_variante: number;
  cantidad: number;
}

export interface BackendCartItem {
  id_item_carrito: number;
  id_producto_variante: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  disponible: boolean;
  producto_variante?: any;
}

export interface BackendCart {
  id_carrito: number;
  id_cliente: number;
  actualizado: string;
  items: BackendCartItem[];
  cantidad_articulos: number;
  subtotal: number;
  ahorro_total: number;
  total: number;
  todos_disponibles: boolean;
}

export const CartService = {
  /**
   * Consulta el carrito activo del cliente en la base de datos
   */
  async getCart(): Promise<BackendCart> {
    const response = await api.get<BackendCart>('/sales-billing/cart');
    return response.data;
  },

  /**
   * Agrega un producto variante al carrito en la base de datos
   */
  async addToCart(dto: { id_producto_variante?: number; id_producto?: number; cantidad: number }): Promise<BackendCart> {
    const response = await api.post<BackendCart>('/sales-billing/cart/items', dto);
    return response.data;
  },

  /**
   * Modifica la cantidad de un ítem en el carrito
   */
  async updateItemQuantity(idItem: number, cantidad: number): Promise<BackendCart> {
    const response = await api.patch<BackendCart>(`/sales-billing/cart/items/${idItem}`, { cantidad });
    return response.data;
  },

  /**
   * Elimina un ítem del carrito
   */
  async removeItem(idItem: number): Promise<BackendCart> {
    const response = await api.delete<BackendCart>(`/sales-billing/cart/items/${idItem}`);
    return response.data;
  },

  /**
   * Vacía el carrito del cliente en el backend
   */
  async clearCart(): Promise<BackendCart> {
    const response = await api.delete<BackendCart>('/sales-billing/cart/clear');
    return response.data;
  },

  /**
   * Sincroniza la lista de ítems locales con el carrito en base de datos
   */
  async syncCart(items: CartItemSync[]): Promise<BackendCart> {
    const response = await api.post<BackendCart>('/sales-billing/cart/sync', { items });
    return response.data;
  },
};
