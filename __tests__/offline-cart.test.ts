import { reconcileCart } from '../src/services/offline/cartDraft';
import type { DraftTransport, RemoteItem } from '../src/services/offline/cartDraft';
import type { CartItem } from '../src/types/shop.types';

const draft = [{ product: { id: 1, name: 'Camisa', price: 10 }, variantId: 5, quantity: 2 }] as CartItem[];
function server(initial: RemoteItem[] = []) {
  const items = [...initial];
  const transport: DraftTransport = {
    get: jest.fn(async () => ({ items: items.map(item => ({ ...item })), todos_disponibles: true })),
    resolve: jest.fn(async () => 5),
    add: jest.fn(async (variant, quantity) => { items.push({ id_item_carrito: 1, id_producto_variante: variant, cantidad: quantity, precio_vigente: 10, disponible: true }); }),
    update: jest.fn(async (id, quantity) => { items.find(item => item.id_item_carrito === id)!.cantidad = quantity; }),
    remove: jest.fn(async id => { items.splice(items.findIndex(item => item.id_item_carrito === id), 1); }),
  };
  return { items, transport };
}

test('un reintento después de perder la respuesta no duplica cantidades', async () => {
  const { items, transport } = server();
  const add = transport.add;
  transport.add = jest.fn(async (variant, quantity) => { await add(variant, quantity); throw new Error('respuesta perdida'); });
  await expect(reconcileCart(draft, transport)).rejects.toThrow('respuesta perdida');
  await reconcileCart(draft, transport);
  expect(items[0].cantidad).toBe(2);
  expect(transport.add).toHaveBeenCalledTimes(1);
});

test('actualiza cantidades absolutas y elimina solo las prendas retiradas del borrador', async () => {
  const { items, transport } = server([
    { id_item_carrito: 1, id_producto_variante: 5, cantidad: 1, precio_vigente: 10, disponible: true },
    { id_item_carrito: 2, id_producto_variante: 6, cantidad: 1, precio_vigente: 10, disponible: true },
  ]);
  await reconcileCart(draft, transport);
  expect(items.map(item => [item.id_producto_variante, item.cantidad])).toEqual([[5, 2]]);
  expect(transport.add).not.toHaveBeenCalled();
});

test('conserva el borrador al fallar el servidor y señala cambios de precio', async () => {
  const { transport } = server([{ id_item_carrito: 1, id_producto_variante: 5, cantidad: 2, precio_vigente: 12, disponible: true }]);
  const result = await reconcileCart(draft, transport);
  expect(result.priceChanged).toBe(true);
  expect(result.items[0].product.price).toBe(12);
  expect(draft[0].product.price).toBe(10);
  transport.get = jest.fn().mockRejectedValue(new Error('offline'));
  await expect(reconcileCart(draft, transport)).rejects.toThrow('offline');
  expect(draft[0].quantity).toBe(2);
});

test('un carrito vacío reconcilia también las eliminaciones hechas sin internet', async () => {
  const { items, transport } = server([{ id_item_carrito: 1, id_producto_variante: 5, cantidad: 2, precio_vigente: 10, disponible: true }]);
  await reconcileCart([], transport);
  expect(items).toEqual([]);
});
