

/**
 * Enum para identificar de forma única cada tipo de reporte.
 * Esto se usará en el backend para saber qué lógica ejecutar.
 */
export enum ReportType {
  INCOME_VS_EXPENSES = 'INCOME_VS_EXPENSES',
  CROP_YIELD = 'CROP_YIELD',
  OPERATIONAL_COSTS = 'OPERATIONAL_COSTS',
  PLOT_YIELD = 'PLOT_YIELD',
  // Añadir más tipos de reporte aquí en el futuro
}

/**
 * Define los parámetros de filtro que un reporte puede necesitar.
 */
export interface ReportParameters {
  dateRange?: boolean;
  farmId?: boolean;
  cropId?: boolean;
}

/**
 * Define la estructura completa de un tipo de reporte, incluyendo su nombre,
 * tipo y los filtros que requiere.
 */
export interface ReportDefinition {
  label: string;
  value: ReportType;
  params: ReportParameters;
}

/**
 * Constante que contiene la lista de todos los reportes disponibles en la aplicación.
 * Esta lista alimenta el dropdown principal del generador de reportes.
 */
export const AVAILABLE_REPORTS: ReportDefinition[] = [
  {
    label: 'Ingresos vs Egresos (Gráfico)',
    value: ReportType.INCOME_VS_EXPENSES,
    params: { dateRange: true, farmId: true }
  },
  {
    label: 'Rendimiento por Cultivo (Gráfico)',
    value: ReportType.CROP_YIELD,
    params: { dateRange: true, farmId: true, cropId: true }
  },
  { // <-- NUEVO REPORTE AÑADIDO A LA LISTA
    label: 'Rendimiento por Parcela (Tabla)',
    value: ReportType.PLOT_YIELD,
    params: { dateRange: true, farmId: true }
  },
  {
    label: 'Costos Operativos',
    value: ReportType.OPERATIONAL_COSTS,
    params: { dateRange: true }
  }
];

/**
 * @interface IIncomeVsExpensesData
 * @description Define la estructura de datos para el reporte de Ingresos vs. Egresos.
 * Coincide con el DTO del backend.
 */
export interface IIncomeVsExpensesData {
  labels: string[];       // Eje X: Meses (ej: "2025-07")
  incomeData: number[];   // Datos de Ingresos
  expensesData: number[]; // Datos de Egresos
}

/**
 * @interface IPlotYieldData
 * @description Define la estructura de una fila en el reporte de rendimiento por parcela.
 */
export interface IPlotYieldData {
  plotName: string;
  cropName: string;
  totalQuantitySold: number;
  measureUnit: string;
}
