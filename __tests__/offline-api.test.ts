import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AxiosError, AxiosHeaders } from 'axios';
import api from '../src/services/api';

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem('current_tenant_id', 'dressly');
  await AsyncStorage.setItem('accessToken', 'token-user-7');
  await AsyncStorage.setItem('authUser', JSON.stringify({ tenant: 'dressly', user: { id_usuario: 7 } }));
  jest.mocked(NetInfo.fetch).mockResolvedValue({ isConnected: true, isInternetReachable: true } as any);
});

test('lee de la API y luego recupera exactamente esa consulta sin conexión', async () => {
  const adapter = jest.fn(async (config: any) => ({ data: { data: [{ id_producto: 1, nombre: 'Camisa' }] }, status: 200, statusText: 'OK', config, headers: new AxiosHeaders() }));
  await api.get('/catalog/products', { adapter, params: { limit: 30 } });
  jest.mocked(NetInfo.fetch).mockResolvedValue({ isConnected: false, isInternetReachable: false } as any);
  const cached = await api.get('/catalog/products', { adapter, params: { limit: 30 } });
  expect(cached.data.data[0].nombre).toBe('Camisa');
  expect(cached.headers['x-offline-cache']).toBeDefined();
  expect(adapter).toHaveBeenCalledTimes(1);
});

test('no confirma pagos ni envía mutaciones cuando no hay conexión', async () => {
  jest.mocked(NetInfo.fetch).mockResolvedValue({ isConnected: false, isInternetReachable: false } as any);
  const adapter = jest.fn();
  await expect(api.post('/sales-billing/checkout/process', {}, { adapter })).rejects.toThrow('Sin conexión');
  expect(adapter).not.toHaveBeenCalled();
});

test('un rechazo de autenticación no utiliza la copia privada guardada', async () => {
  const adapter = jest.fn(async (config: any) => ({ data: { user: { id_usuario: 7 } }, status: 200, statusText: 'OK', config, headers: new AxiosHeaders() }));
  await api.get('/auth/profile', { adapter });
  const denied = async (config: any) => { throw new AxiosError('Sesión rechazada', 'ERR_BAD_REQUEST', config, undefined, { status: 401, data: {}, statusText: 'Unauthorized', headers: new AxiosHeaders(), config }); };
  await expect(api.get('/auth/profile', { adapter: denied })).rejects.toThrow('Sesión rechazada');
  expect(await AsyncStorage.getItem('accessToken')).toBeNull();
});

test('no recupera compras guardadas de otro usuario', async () => {
  const adapter = jest.fn(async (config: any) => ({ data: [{ id_venta: 99 }], status: 200, statusText: 'OK', config, headers: new AxiosHeaders() }));
  await api.get('/sales-billing/purchases', { adapter });
  await AsyncStorage.setItem('accessToken', 'token-user-8');
  await AsyncStorage.setItem('authUser', JSON.stringify({ tenant: 'dressly', user: { id_usuario: 8 } }));
  jest.mocked(NetInfo.fetch).mockResolvedValue({ isConnected: false, isInternetReachable: false } as any);
  await expect(api.get('/sales-billing/purchases', { adapter })).rejects.toThrow('sin datos guardados');
});

test('un cambio de tienda sin una sesión de esa tienda no recupera datos privados', async () => {
  const adapter = jest.fn(async (config: any) => ({ data: [{ id_venta: 99 }], status: 200, statusText: 'OK', config, headers: new AxiosHeaders() }));
  await api.get('/sales-billing/purchases', { adapter });
  await AsyncStorage.setItem('current_tenant_id', 'urbanly');
  jest.mocked(NetInfo.fetch).mockResolvedValue({ isConnected: false, isInternetReachable: false } as any);
  await expect(api.get('/sales-billing/purchases', { adapter })).rejects.toThrow('Sin conexión');
  expect(adapter).toHaveBeenCalledTimes(1);
});

test('una operación capturada por otra sesión no se envía con las credenciales nuevas', async () => {
  const adapter = jest.fn();
  await expect(api.post('/sales-billing/cart/items', {}, { headers: { Authorization: 'Bearer token-anterior' }, adapter })).rejects.toThrow('La sesión cambió');
  expect(adapter).not.toHaveBeenCalled();
});
