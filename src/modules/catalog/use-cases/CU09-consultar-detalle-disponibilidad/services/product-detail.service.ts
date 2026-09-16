import api from '../../../../../services/api';

export interface MobileBranchStock {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  ciudad?: string;
  stock_disponible: number;
  disponible: boolean;
}

export interface MobileSizeGuideItem {
  id_guia_talla: number;
  parte_cuerpo: string;
  talla_etiqueta: string;
  min_cm: number;
  max_cm: number;
}

export interface MobileProductVariant {
  id_producto_variante: number;
  sku: string;
  precio_adicional: number;
  precio_variante: number;
  precio_final: number;
  tiene_descuento: boolean;
  descuento_porcentaje: number;
  modelo_3d_url: string | null;
  imagen_url: string | null;
  estado: string;
  talla: {
    id_talla: number;
    codigo: string;
  };
  color: {
    id_color: number;
    nombre: string;
    codigo_hex: string | null;
  };
  total_stock: number;
  disponibilidad_sucursales: MobileBranchStock[];
}

export interface MobileProductDetail {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  precio_final_base: number;
  tiene_descuento: boolean;
  descuento_porcentaje: number;
  promocion?: {
    id_promocion: number;
    nombre: string;
    tipo_descuento: string;
    valor_descuento: number;
    fecha_fin: string;
  };
  genero: string | null;
  estado: string;
  categoria: {
    id_categoria: number;
    nombre: string;
    descripcion: string | null;
  };
  coleccion?: {
    id_coleccion: number;
    nombre: string;
    descripcion: string | null;
    temporada?: {
      id_temporada: number;
      nombre: string;
    };
  };
  imagenes: Array<{
    id_imagen_producto: number;
    url: string;
    texto_alternativo: string | null;
    es_principal: boolean;
    orden: number;
  }>;
  guia_tallas: MobileSizeGuideItem[];
  tallas_disponibles: Array<{ id_talla: number; codigo: string }>;
  colores_disponibles: Array<{ id_color: number; nombre: string; codigo_hex: string | null }>;
  variantes: MobileProductVariant[];
  tiene_modelo_3d: boolean;
  total_stock_global: number;
}

export const MobileProductDetailService = {
  async getProductById(id: number): Promise<MobileProductDetail> {
    const response = await api.get<MobileProductDetail>(`/catalog/products/${id}`);
    return response.data;
  },
};
