/**
 * Define los tipos de transacciones posibles para evitar errores de tipeo.
 */
export enum TransactionType {
  Venta = "VENTA",
  Compra = "COMPRA",
}

/**
 * Enum para las unidades de medida. Mantiene la consistencia con el backend.
 */
export enum MeasureUnit {
  KILOGRAMO = "KILOGRAMO",
  GRAMO = "GRAMO",
  LITRO = "LITRO",
  MILILITRO = "MILILITRO",
  TONELADA = "TONELADA",
  SACO = "SACO",
  BOLSA = "BOLSA",
  CAJA = "CAJA",
  UNIDAD = "UNIDAD",
}

/**
 * @interface ITransaction
 * @description Estructura de datos que coincide con el TransactionDTO del backend.
 * Se utiliza para listar y mostrar transacciones.
 */
export interface ITransaction {
  id?: number;
  farmId: number | null;
  farmName: string | null;
  cropId: number | null;
  cropName: string | null;
  transactionType: TransactionType;
  quantity: number;
  measureUnit: string;
  pricePerUnit: number;
  totalValue: number;
  transactionDate: string; // Usamos string para manejar fechas ISO
}

/**
 * @interface ITransactionPayload
 * @description Estructura de datos para ENVIAR al backend al crear/actualizar.
 * Coincide con la entidad JPA que espera el backend.
 */
export interface ITransactionPayload {
  id?: number;
  farm: { id: number } | null;
  crop: { id: number } | null;
  transactionType: TransactionType;
  quantity: number;
  measureUnit: string;
  pricePerUnit: number;
  totalValue: number;
  transactionDate: string;
}
