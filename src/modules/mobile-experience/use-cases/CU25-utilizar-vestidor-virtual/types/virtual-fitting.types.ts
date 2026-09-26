/**
 * @caso-de-uso CU25 — Utilizar vestidor virtual
 * @subsistema Experiencia Móvil
 * @capa Entity/DTO — Aplicación móvil
 * @responsabilidad Define los contratos de datos intercambiados entre la interfaz, los servicios y el backend.
 * @secuencia Cliente -> vestidor virtual -> controlador de experiencia -> servicios de cámara y renderizado -> Producto/Variante/Recursos 3D.
 */
/* ═══════════════════════════════════════════════════════════════
   CU25 — Utilizar Vestidor Virtual (Móvil) — Types
   ═══════════════════════════════════════════════════════════════ */

export interface ArVariant {
  id_producto_variante: number;
  sku: string;
  precio_variante: number;
  precio_final: number;
  tiene_descuento: boolean;
  descuento_porcentaje: number;
  modelo_3d_url: string;
  imagen_url: string | null;
  estado: string;
  talla: { id_talla: number; codigo: string };
  color: { id_color: number; nombre: string; codigo_hex: string | null };
  total_stock: number;
}

export interface ArVariantDetail extends ArVariant {
  producto: ProductSummary;
}

export interface ProductSummary {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  categoria: string;
}

export interface ArVariantsResponse {
  producto: ProductSummary;
  variantes: ArVariant[];
  tallas_disponibles: Array<{ id_talla: number; codigo: string }>;
  colores_disponibles: Array<{ id_color: number; nombre: string; codigo_hex: string | null }>;
}

export type FittingPhase = 'loading' | 'calibration' | 'fitting' | 'error';

export type BodySilhouetteType = 'female' | 'male' | 'neutral';

export type FittingViewMode = 'avatar-3d' | 'photo-2d';

export type PoseAngle = 'front' | 'three-quarter' | 'profile';

export interface SilhouetteConfig {
  bodyType: BodySilhouetteType;
  heightCm: number;
  fitPreference: 'slim' | 'regular' | 'relaxed';
  currentAngle: PoseAngle;
}

export interface FittingTransform {
  scale: number;
  offsetY: number;
  rotation: number;
}

export interface BodyLandmark {
  name: string;
  xPercent: number; // 0..100
  yPercent: number; // 0..100
  label: string;
}
