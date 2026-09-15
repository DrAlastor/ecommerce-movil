import api from '../../../services/api';

export interface MobileCatalogProduct {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  precio_final: number;
  tiene_descuento: boolean;
  descuento_porcentaje: number;
  genero: string | null;
  categoria: { id_categoria: number; nombre: string } | null;
  coleccion: { id_coleccion: number; nombre: string; temporada: string | null } | null;
  imagen_principal: string | null;
  disponible: boolean;
  total_variantes: number;
  colores_disponibles: Array<{ id_color: number; nombre: string; codigo_hex: string | null }>;
  tallas_disponibles: Array<{ id_talla: number; codigo: string }>;
}

export interface MobileCatalogFilterMeta {
  categorias: Array<{ id_categoria: number; nombre: string; total_productos: number }>;
  colecciones: Array<{ id_coleccion: number; nombre: string }>;
  tallas: Array<{ id_talla: number; codigo: string }>;
  colores: Array<{ id_color: number; nombre: string; codigo_hex: string | null }>;
  generos: string[];
  precio_rango: { min: number; max: number };
}

export interface MobileCatalogResponse {
  data: MobileCatalogProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const MobileCatalogService = {
  async getProducts(params?: Record<string, any>): Promise<MobileCatalogResponse> {
    const cleanParams: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          cleanParams[key] = value;
        }
      });
    }

    const response = await api.get<MobileCatalogResponse>('/catalog/products', {
      params: cleanParams,
    });
    return response.data;
  },

  async getFilterMetadata(): Promise<MobileCatalogFilterMeta> {
    const response = await api.get<MobileCatalogFilterMeta>('/catalog/filters');
    return response.data;
  },
};
