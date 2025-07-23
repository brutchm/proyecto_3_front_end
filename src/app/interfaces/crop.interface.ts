/**
 * @fileoverview Define la estructura de datos para un objeto Crop (Cultivo).
 * Esta interfaz se utiliza tanto en el frontend como en la comunicación con el backend.
 */
export interface ICrop {
  id?: number;
  cropName: string;
  cropPicture?: string | null;
  cropType?: string | null;
  cropVariety?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * @interface SelectItem
 * @description Estructura estándar para las opciones de los dropdowns de PrimeNG.
 */
interface SelectItem {
  label: string;
  value: string;
}

/**
 * @const CROP_TYPES
 * @description
 * Lista predefinida de tipos de cultivo. Se utiliza para poblar el dropdown
 * en el formulario de creación/edición de cultivos, asegurando la consistencia de los datos.
 */
export const CROP_TYPES: SelectItem[] = [
  { label: 'Hortaliza', value: 'Hortaliza' },
  { label: 'Grano', value: 'Grano' },
  { label: 'Fruta', value: 'Fruta' },
  { label: 'Cereal', value: 'Cereal' },
  { label: 'Legumbre', value: 'Legumbre' },
  { label: 'Tubérculo', value: 'Tubérculo' },
  { label: 'Forraje', value: 'Forraje' },
  { label: 'Otro', value: 'Otro' },
];
