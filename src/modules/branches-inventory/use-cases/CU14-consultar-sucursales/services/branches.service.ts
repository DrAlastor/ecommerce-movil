import api from '../../../../../services/api';
import type { MobileBranch, MobileCity, BranchQueryParams } from '../types';

export const MobileBranchesService = {
  /**
   * Obtiene la lista de sucursales activas (con filtros opcionales de ciudad y búsqueda)
   */
  async getActiveBranches(params?: BranchQueryParams): Promise<MobileBranch[]> {
    const res = await api.get<MobileBranch[]>('/branches-inventory/public/branches', {
      params: {
        id_ciudad: params?.id_ciudad,
        search: params?.search?.trim() || undefined,
      },
    });
    return res.data;
  },

  /**
   * Obtiene el detalle de una sucursal específica
   */
  async getBranchDetail(id: number): Promise<MobileBranch> {
    const res = await api.get<MobileBranch>(`/branches-inventory/public/branches/${id}`);
    return res.data;
  },

  /**
   * Obtiene las ciudades con sucursales activas
   */
  async getActiveCities(): Promise<MobileCity[]> {
    const res = await api.get<MobileCity[]>('/branches-inventory/public/cities');
    return res.data;
  },
};
