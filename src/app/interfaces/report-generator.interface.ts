/**
 * Enum para identificar de forma única cada tipo de reporte.
 * Esto se usará en el backend para saber qué lógica ejecutar.
 */
export enum ReportType {
  INCOME_VS_EXPENSES = "INCOME_VS_EXPENSES",
  CROP_YIELD = "CROP_YIELD",
  OPERATIONAL_COSTS = "OPERATIONAL_COSTS",
  PLOT_YIELD = "PLOT_YIELD",
  CROP_COSTS = "CROP_COSTS",
  FARM_COSTS = "FARM_COSTS",
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
    label: "Ingresos vs Egresos",
    value: ReportType.INCOME_VS_EXPENSES,
    params: { dateRange: true, farmId: true },
  },
  {
    label: "Rendimiento por Cultivo",
    value: ReportType.CROP_YIELD,
    params: { dateRange: true, farmId: true, cropId: true },
  },
  {
    label: "Rendimiento por Parcela",
    value: ReportType.PLOT_YIELD,
    params: { dateRange: true, farmId: true },
  },
  {
    label: "Costos Operativos por Mes",
    value: ReportType.OPERATIONAL_COSTS,
    params: { dateRange: true, farmId: true },
  },
  {
    label: "Costos por Cultivo",
    value: ReportType.CROP_COSTS,
    params: { dateRange: true, farmId: true },
  },
  {
    label: "Costos por Finca",
    value: ReportType.FARM_COSTS,
    params: { dateRange: true },
  },
];

/**
 * @interface IIncomeVsExpensesData
 * @description Define la estructura de datos para el reporte de Ingresos vs Egresos.
 * Coincide con el DTO del backend.
 */
export interface IIncomeVsExpensesData {
  labels: string[];
  incomeData: number[];
  expensesData: number[];
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

/**
 * @interface ICropYieldData
 * @description Define la estructura de una fila en el reporte de rendimiento por cultivo.
 */
export interface ICropYieldData {
  cropName: string;
  totalQuantitySold: number;
  measureUnit: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

/**
 * @interface ICropCostData
 * @description Define la estructura de una fila en el reporte de costos por cultivo.
 */
export interface ICropCostData {
  cropName: string;
  totalCost: number;
}

/**
 * @interface IOperationalCostData
 * @description Define la estructura de una fila en el reporte de costos operativos.
 */
export interface IOperationalCostData {
  month: string;
  totalCost: number;
}

/**
 * @interface IFarmCostData
 * @description Define la estructura de una fila en el reporte de costos por finca.
 */
export interface IFarmCostData {
  farmName: string;
  totalCost: number;
}
