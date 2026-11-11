jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map<string, string>();
  return {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => { values.set(key, value); }),
    getAllKeys: jest.fn(async () => [...values.keys()]),
    removeItem: jest.fn(async (key: string) => { values.delete(key); }),
    clear: jest.fn(async () => { values.clear(); }),
  };
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheable, readKey, saveRead, loadRead, loadCatalogFallback } from '../src/services/offline/readCache';

const scope = { tenant: 'dressly', account: '17', server: 'https://test.invalid' };
beforeEach(async () => { await AsyncStorage.clear(); });

test('una lectura sobrevive al almacenamiento y no cruza usuario, tienda o servidor', async () => {
  const key = readKey(scope, 'get', '/catalog/products', { limit: 30, page: 1 });
  await saveRead(key, { data: [{ id_producto: 1 }] });
  expect((await loadRead(key))?.data).toEqual({ data: [{ id_producto: 1 }] });
  expect(await loadRead(readKey({ ...scope, tenant: 'other' }, 'get', '/catalog/products', { limit: 30, page: 1 }))).toBeNull();
  expect(await loadRead(readKey({ ...scope, account: '18' }, 'get', '/catalog/products', { limit: 30, page: 1 }))).toBeNull();
  expect(await loadRead(readKey({ ...scope, server: 'https://other.invalid' }, 'get', '/catalog/products', { limit: 30, page: 1 }))).toBeNull();
});

test('el orden de filtros no cambia la identidad de la consulta', () => {
  expect(readKey(scope, 'get', '/catalog/products', { limit: 30, search: 'camisa' })).toBe(readKey(scope, 'get', '/catalog/products', { search: 'camisa', limit: 30 }));
});

test('no se guarda ni simula el éxito de pagos, reservas o cambios de perfil', () => {
  expect(cacheable('post', '/sales-billing/checkout/process')).toBe(false);
  expect(cacheable('post', '/reservations')).toBe(false);
  expect(cacheable('patch', '/auth/profile')).toBe(false);
  expect(cacheable('get', '/sales-billing/cart')).toBe(false);
  expect(cacheable('post', '/catalog/recommendations')).toBe(true);
});

test('filtra el catálogo guardado sin inventar productos no descargados', async () => {
  await saveRead(readKey(scope, 'get', '/catalog/products', { limit: 30 }), { data: [
    { id_producto: 1, nombre: 'Camisa azul', precio_final: 100, categoria: { nombre: 'Camisas' } },
    { id_producto: 2, nombre: 'Pantalón', precio_final: 200, categoria: { nombre: 'Pantalones' } },
  ] });
  const entry = await loadCatalogFallback(readKey(scope, 'get', '/catalog/products', { search: 'camisa', max_price: 150 }));
  expect((entry?.data as any).data.map((p: any) => p.id_producto)).toEqual([1]);
  expect((entry?.data as any).meta.offlinePartial).toBe(true);
});

test('datos vencidos o corruptos no producen lecturas falsas', async () => {
  const key = readKey(scope, 'get', '/catalog/filters');
  await AsyncStorage.setItem(key, '{bad json');
  expect(await loadRead(key)).toBeNull();
  await AsyncStorage.setItem(key, JSON.stringify({ savedAt: '2000-01-01T00:00:00Z', data: [] }));
  expect(await loadRead(key)).toBeNull();
});
