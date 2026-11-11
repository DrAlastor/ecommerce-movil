import type { CartItem } from '../../types/shop.types';

export interface RemoteItem { id_item_carrito: number; id_producto_variante: number; cantidad: number; precio_vigente: number; disponible: boolean }
export interface RemoteCart { items: RemoteItem[]; todos_disponibles: boolean }
export interface DraftTransport {
  get(): Promise<RemoteCart>;
  resolve(item: CartItem): Promise<number>;
  add(variant: number, quantity: number): Promise<unknown>;
  update(id: number, quantity: number): Promise<unknown>;
  remove(id: number): Promise<unknown>;
}

/** Cantidades absolutas y lectura antes de cada reintento; nunca vaciar y reconstruir. */
export async function reconcileCart(items: CartItem[], transport: DraftTransport): Promise<{ items: CartItem[]; priceChanged: boolean }> {
  const resolved = await Promise.all(items.map(async item => {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new Error('Cantidad inválida en el carrito');
    return { ...item, variantId: item.variantId || await transport.resolve(item) };
  }));
  const desired = new Map<number, number>();
  for (const item of resolved) desired.set(item.variantId, (desired.get(item.variantId) || 0) + item.quantity);
  const remote = await transport.get();
  for (const [variant, quantity] of desired) {
    const existing = remote.items.find(item => item.id_producto_variante === variant);
    if (!existing) await transport.add(variant, quantity);
    else if (existing.cantidad !== quantity) await transport.update(existing.id_item_carrito, quantity);
  }
  for (const item of remote.items) if (!desired.has(item.id_producto_variante)) await transport.remove(item.id_item_carrito);
  const confirmed = await transport.get();
  if (confirmed.items.length !== desired.size || confirmed.items.some(item => item.cantidad !== desired.get(item.id_producto_variante))) throw new Error('El carrito cambió en el servidor. Reintenta para conciliar tus cambios.');
  if (!confirmed.todos_disponibles) throw new Error('Hay prendas sin existencias suficientes. Revisa tu carrito; conservamos tus selecciones.');
  let priceChanged = false;
  const result = resolved.map(item => {
    const price = confirmed.items.find(remoteItem => remoteItem.id_producto_variante === item.variantId)?.precio_vigente;
    if (typeof price !== 'number' || !Number.isFinite(price)) throw new Error('No se pudo verificar el precio vigente');
    if (Math.round(price * 100) !== Math.round(item.product.price * 100)) priceChanged = true;
    return { ...item, product: { ...item.product, price } };
  });
  return { items: result, priceChanged };
}
