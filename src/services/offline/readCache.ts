import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReadScope { tenant: string; account: string; server: string }
export interface ReadEntry { savedAt: string; data: unknown }
const PREFIX = '@offline:read:v1:';
const MAX_ENTRIES = 120;
// El almacenamiento solo guarda lecturas de rutas explícitas; nunca pagos ni contraseñas.
export function cacheable(method: string | undefined, url: string): boolean {
  if ((method || 'get').toLowerCase() === 'post') return url === '/catalog/recommendations';
  if ((method || 'get').toLowerCase() !== 'get') return false;
  return /^\/catalog\/(products(?:\/\d+)?|filters)$/.test(url)
    || /^\/branches-inventory\/public\/(branches(?:\/\d+)?|cities)$/.test(url)
    || /^\/sales-billing\/purchases(?:\/\d+)?$/.test(url)
    || /^\/reservations\/(my-reservations|\d+|branch-availability\/\d+)$/.test(url)
    || /^\/virtual-fitting\/(product\/\d+\/ar-variants|variant\/\d+)$/.test(url)
    || url === '/auth/profile';
}
function canonical(value: any): any {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().filter(key => value[key] !== undefined).map(key => [key, canonical(value[key])]));
  return value;
}
export function readKey(scope: ReadScope, method: string | undefined, url: string, params?: unknown, body?: unknown): string {
  return PREFIX + JSON.stringify([scope.server, scope.tenant, scope.account, (method || 'get').toLowerCase(), url, canonical(params ?? {}), canonical(body ?? null)]);
}
let writes: Promise<void> = Promise.resolve();
export function saveRead(key: string, data: unknown): Promise<void> {
  const operation = writes.catch(() => {}).then(async () => {
    const serialized = JSON.stringify({ savedAt: new Date().toISOString(), data });
    if (serialized.length > 400_000) return;
    await AsyncStorage.setItem(key, serialized);
    const keys = (await AsyncStorage.getAllKeys()).filter(k => k.startsWith(PREFIX));
    if (keys.length > MAX_ENTRIES) {
      const entries = await Promise.all(keys.map(async key => [key, await AsyncStorage.getItem(key)] as const));
      const sorted = entries.sort((a, b) => {
        try { return JSON.parse(a[1] || '{}').savedAt.localeCompare(JSON.parse(b[1] || '{}').savedAt); } catch { return 0; }
      });
      await Promise.all(sorted.slice(0, keys.length - MAX_ENTRIES).map(([key]) => AsyncStorage.removeItem(key)));
    }
  });
  writes = operation;
  return operation;
}
export async function loadRead(key: string): Promise<ReadEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!Number.isFinite(Date.parse(entry.savedAt)) || Date.now() - Date.parse(entry.savedAt) > 30 * 86400_000) return null;
    return entry;
  } catch { return null; }
}

/** Los filtros offline operan únicamente sobre productos ya consultados. */
export async function loadCatalogFallback(key: string): Promise<ReadEntry | null> {
  try {
    const target = JSON.parse(key.slice(PREFIX.length));
    if (target[3] !== 'get' || target[4] !== '/catalog/products') return null;
    const keys = (await AsyncStorage.getAllKeys()).filter(candidate => {
      if (!candidate.startsWith(PREFIX)) return false;
      try {
        const parsed = JSON.parse(candidate.slice(PREFIX.length));
        return parsed.slice(0, 5).every((value: unknown, index: number) => value === target[index]);
      } catch { return false; }
    });
    const entries = (await Promise.all(keys.map(loadRead))).filter((entry): entry is ReadEntry => Boolean(entry));
    const products = new Map<number, any>();
    entries.sort((a, b) => a.savedAt.localeCompare(b.savedAt)).forEach(entry => {
      for (const product of (entry.data as any)?.data || []) products.set(product.id_producto, product);
    });
    if (!products.size) return null;
    const params = target[5];
    const normalize = (value: unknown) => String(value ?? '').toLowerCase();
    const filtered = [...products.values()].filter(product => {
      return (!params.search || normalize(`${product.nombre} ${product.descripcion}`).includes(normalize(params.search)))
        && (!params.categoria || normalize(product.categoria?.nombre) === normalize(params.categoria) || String(product.categoria?.id_categoria) === String(params.categoria))
        && (!params.genero || normalize(product.genero) === normalize(params.genero))
        && (!params.talla || product.tallas_disponibles?.some((size: any) => normalize(size.codigo) === normalize(params.talla)))
        && (!params.color || product.colores_disponibles?.some((color: any) => normalize(color.nombre) === normalize(params.color)))
        && (!params.en_oferta || product.tiene_descuento)
        && (params.min_price === undefined || product.precio_final >= Number(params.min_price))
        && (params.max_price === undefined || product.precio_final <= Number(params.max_price));
    });
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 30);
    return { savedAt: entries[0].savedAt, data: { data: filtered.slice((page - 1) * limit, page * limit), meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit), offlinePartial: true } } };
  } catch { return null; }
}
