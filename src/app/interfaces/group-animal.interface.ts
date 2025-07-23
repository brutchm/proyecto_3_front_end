import { IUser } from ".";
import { IFarm } from "../services/farm.service";

export enum ProductionTypeEnum {
  CARNE = 'CARNE',
  LECHE = 'LECHE',
  HUEVOS = 'HUEVOS',
  DERIVADOS = 'DERIVADOS',
}
export interface IGroupAnimal {
  groupName: string;
  id: number;
  species: string;
  count: number;
  measure: string;
  productionType: ProductionTypeEnum;
  isActive: boolean;
}
export interface IAnimal {
  id: number;
  user: IUser,
  farm: IFarm,
  species: string;
  breed: string,
  count: number;
  animalGroup: IGroupAnimal,
  isActive: boolean;
}
