/**
 * @caso-de-uso CU14 — Consultar sucursales
 * @subsistema Sucursales e Inventario
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> listado de sucursales -> controlador de consulta -> servicio de sucursales -> Ciudad/Sucursal/Disponibilidad.
 */
export { default as BranchesScreen } from './screens/BranchesScreen';
export { useMobileBranches, isBranchOpenNow } from './hooks/useMobileBranches';
export { MobileBranchesService } from './services/branches.service';
export { BranchCard } from './components/BranchCard';
export { BranchesHeader } from './components/BranchesHeader';
export { CityChips } from './components/CityChips';
export type { MobileBranch, MobileCity, BranchQueryParams } from './types';
