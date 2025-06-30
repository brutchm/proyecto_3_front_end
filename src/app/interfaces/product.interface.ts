import { Category } from './category.interface';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: number;
  category?: Category;
}
