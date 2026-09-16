export interface MobileCity {
  id_ciudad: number;
  nombre: string;
  pais: string;
  total_sucursales: number;
}

export interface MobileBranch {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  telefono: string;
  hora_apertura: string | null;
  hora_cierre: string | null;
  estado: string;
  id_ciudad: number;
  ciudad: {
    id_ciudad: number;
    nombre: string;
    pais: string;
  };
}

export interface BranchQueryParams {
  id_ciudad?: number;
  search?: string;
}
