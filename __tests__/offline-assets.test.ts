import { FileSystem } from 'react-native-file-access';
import { localAsset, mapAssets } from '../src/services/offline/assets';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(FileSystem.exists).mockResolvedValue(false);
  jest.mocked(FileSystem.fetchManaged).mockReturnValue({ cancel: jest.fn().mockResolvedValue(undefined), result: Promise.resolve({ ok: true } as any) });
});

test('solo usa un archivo local cuando existe la descarga completa', async () => {
  jest.mocked(FileSystem.exists).mockResolvedValue(true);
  expect(await localAsset('https://test.invalid/image.jpg')).toMatch(/^file:\/\/\/test-documents\/offline-assets-v1\/.*\.jpg$/);
  expect(FileSystem.fetchManaged).not.toHaveBeenCalled();
});

test('descarga a un archivo temporal y lo publica al completarse', async () => {
  const result = await mapAssets({ imagen: 'https://test.invalid/image.jpg' }, true);
  expect(result.imagen).toMatch(/^file:\/\//);
  expect(FileSystem.fetchManaged).toHaveBeenCalledWith('https://test.invalid/image.jpg', expect.objectContaining({ path: expect.stringMatching(/\.partial$/) }), expect.any(Function));
  expect(FileSystem.mv).toHaveBeenCalledWith(expect.stringMatching(/\.partial$/), expect.stringMatching(/\.jpg$/));
});

test('una descarga fallida no se presenta como disponible offline', async () => {
  jest.mocked(FileSystem.fetchManaged).mockReturnValue({ cancel: jest.fn().mockResolvedValue(undefined), result: Promise.reject(new Error('network')) });
  jest.mocked(FileSystem.exists).mockImplementation(async path => path.endsWith('.partial'));
  const result = await mapAssets({ imagen: 'https://test.invalid/failed.jpg' }, true);
  expect(result.imagen).toBe('https://test.invalid/failed.jpg');
  expect(FileSystem.mv).not.toHaveBeenCalled();
  expect(FileSystem.unlink).toHaveBeenCalledWith(expect.stringMatching(/\.partial$/));
});

test('conserva los recursos empaquetados y no descarga URLs ajenas a las imágenes', async () => {
  const result = await mapAssets({ source: 123, url: 'https://test.invalid/login', modelo: 'https://test.invalid/model.glb' }, true);
  expect(result.source).toBe(123);
  expect(FileSystem.fetchManaged).not.toHaveBeenCalled();
});
