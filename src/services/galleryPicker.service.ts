import { NativeModules, Platform } from 'react-native';

export interface GalleryImageResult {
  cancelled: boolean;
  dataUrl?: string;
  uri?: string;
  width?: number;
  height?: number;
}

export const galleryPickerService = {
  /**
   * Abre la galería nativa de fotos de Android para seleccionar un código QR
   * y retorna el resultado como dataUrl (data:image/png;base64,...).
   */
  async pickQrImageFromGallery(): Promise<GalleryImageResult> {
    if (Platform.OS !== 'android') {
      return { cancelled: true };
    }

    const nativePicker = NativeModules.ImageGalleryPicker;
    if (!nativePicker || !nativePicker.pickImageFromGallery) {
      throw new Error('El módulo de galería nativo no está disponible en este dispositivo.');
    }

    return await nativePicker.pickImageFromGallery();
  },
};
