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
