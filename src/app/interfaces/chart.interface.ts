/**
 * @interface IChartData
 * @description Define la estructura de datos para los gráficos del dashboard.
 * Coincide con el ChartDataDTO del backend.
 */
export interface IChartData {
  labels: string[];
  incomeData: number[];
  expensesData: number[];
}


/**
 * Nova interface para os dados do gráfico circular (doughnut).
 */
export interface IDoughnutChartData {
  labels: string[];
  data: number[];
}

/**
 * Interface para los datos del gráfico de rendimiento de cultivos.
 */
export interface ICropYieldChartData {
  labels: string[];
  data: number[];
}