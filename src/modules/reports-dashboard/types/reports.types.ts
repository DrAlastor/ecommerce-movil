export type ReportTabType = 'dashboard' | 'reports' | 'qbe' | 'voz' | 'ml';

export interface DashboardMetrics {
  totalVentas: number;
  totalTransacciones: number;
  ticketPromedio: number;
  totalClientes: number;
  reservasActivas: number;
  ventasPorPeriodo: { fecha: string; total: number; cantidad: number }[];
  topProductos: { nombre: string; categoria: string; total: number; unidades: number }[];
  ventasPorSucursal: { sucursal: string; total: number; porcentaje: number }[];
  alertasStock?: { prenda: string; sucursal: string; stock: number; mensaje: string }[];
}

export interface ReportItemData {
  [key: string]: any;
}

export interface ReportData {
  reporte: string;
  totalFilas: number;
  columnas: { key: string; label: string }[];
  filas: ReportItemData[];
  resumen?: { [key: string]: any };
}

export interface QbeFieldMetadata {
  key: string;
  label: string;
  tipo: 'string' | 'number' | 'date';
}

export interface QbeFilterCondition {
  campo: string;
  operador: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contiene';
  valor: string;
}

export interface QbeQueryPayload {
  entidad: 'ventas' | 'productos' | 'reservas' | 'clientes';
  filtros: QbeFilterCondition[];
}

export interface VoiceChatMessage {
  id: string;
  emisor: 'usuario' | 'ia';
  texto: string;
  datos?: any;
  fecha: string;
}

export interface MlDemandPrediction {
  prenda: string;
  categoria: string;
  demandaHistorica: number;
  demandaProyectada: number;
  probabilidadExito: number;
  recomendacion: string;
}

export interface MlRfmCluster {
  segmento: string;
  clientesCount: number;
  valorPromedio: number;
  frecuenciaMedia: number;
  estrategia: string;
}

export interface MlScenarioSimulation {
  escenario: string;
  impactoPrecio: number;
  ventasEsperadas: number;
  ingresoProyectado: number;
  nivelRiesgo: 'Bajo' | 'Medio' | 'Alto';
}

export interface MlDemandResult {
  alerts: MlDemandPrediction[];
  verdict: string;
}

export interface MlRfmResult {
  clusters: MlRfmCluster[];
  verdict: string;
}

export interface MlScenarioResult {
  scenarios: MlScenarioSimulation[];
  verdict: string;
}
