/**
 * @caso-de-uso CU14 — Consultar sucursales
 * @subsistema Sucursales e Inventario
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> listado de sucursales -> controlador de consulta -> servicio de sucursales -> Ciudad/Sucursal/Disponibilidad.
 */
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
