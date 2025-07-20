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
