import { Dirs, FileSystem } from 'react-native-file-access';

const root = `${Dirs.DocumentDir}/offline-assets-v1`;
const inFlight = new Map<string, Promise<string>>();
// Se codifica la URL íntegra, evitando colisiones entre imágenes con el mismo nombre.
function fileName(url: string) {
  let hash1 = 2166136261, hash2 = 5381;
  for (let i = 0; i < url.length; i++) { hash1 = Math.imul(hash1 ^ url.charCodeAt(i), 16777619); hash2 = Math.imul(hash2, 33) ^ url.charCodeAt(i); }
  const extension = url.match(/\.(png|jpe?g|webp|gif|glb)(?:[?#]|$)/i)?.[1] || 'asset';
  return `${(hash1 >>> 0).toString(16)}-${(hash2 >>> 0).toString(16)}.${extension}`;
}
function supported(url: string) { return /^https:\/\//.test(url) && (/\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(url) || /^https:\/\/images\.unsplash\.com\//.test(url)); }
export async function localAsset(url: string): Promise<string> {
  if (!supported(url)) return url;
  const path = `${root}/${fileName(url)}`;
  try { if (await FileSystem.exists(path)) return `file://${path}`; } catch { /* Mantener URL si el almacenamiento no responde. */ }
  return url;
}
async function download(url: string): Promise<string> {
  const cached = await localAsset(url);
  if (cached !== url) return cached;
  await FileSystem.mkdir(root);
  const path = `${root}/${fileName(url)}`;
  const pending = `${path}.partial`;
  const request = FileSystem.fetchManaged(url, { path: pending }, (bytes, length) => {
    if (bytes > 20_000_000 || length > 20_000_000) void request.cancel();
  });
  const timer = setTimeout(() => { void request.cancel(); }, 20000);
  try {
    const response = await request.result;
    if (!response.ok) throw new Error('No se pudo guardar el recurso');
    await FileSystem.mv(pending, path);
    return `file://${path}`;
  } finally {
    clearTimeout(timer);
    if (await FileSystem.exists(pending)) await FileSystem.unlink(pending);
  }
}
export async function mapAssets<T>(data: T, save = false): Promise<T> {
  const urls = new Set<string>();
  function find(value: any) {
    if (typeof value === 'string' && supported(value)) urls.add(value);
    else if (Array.isArray(value)) value.forEach(find);
    else if (value && typeof value === 'object') Object.values(value).forEach(find);
  }
  find(data);
  const replacements = new Map<string, string>();
  // Máximo dos descargas simultáneas y límites de espacio antes de comenzar un lote.
  let canSave = save;
  if (save) {
    try {
      const files = await FileSystem.statDir(root);
      canSave = files.reduce((total, file) => total + file.size, 0) < 150_000_000;
    } catch { /* Primera descarga. */ }
  }
  const queue = [...urls];
  await Promise.all([0, 1].map(async () => {
    while (queue.length) {
      const url = queue.shift()!;
      try {
        if (canSave) {
          let operation = inFlight.get(url);
          if (!operation) { operation = download(url); inFlight.set(url, operation); }
          try { replacements.set(url, await operation); } finally { inFlight.delete(url); }
        } else replacements.set(url, await localAsset(url));
      } catch { replacements.set(url, url); }
    }
  }));
  function replace(value: any): any {
    if (typeof value === 'string') return replacements.get(value) || value;
    if (Array.isArray(value)) return value.map(replace);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item)]));
    return value;
  }
  return replace(data);
}
