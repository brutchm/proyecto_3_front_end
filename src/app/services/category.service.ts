import { Injectable } from '@angular/core';
import { Category } from '../interfaces/category.interface';

import { BehaviorSubject } from 'rxjs';
import { BaseService } from './base-service';

@Injectable({ providedIn: 'root' })
export class CategoryService extends BaseService<Category> {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    super();
    this.source = 'categories'; 
  }

public loadCategories(): void {
  this.findAll().subscribe(res => {
    this.categoriesSubject.next(res.data);
  });
}

  public createCategory(category: Category) {
    return this.addCustomSource('category', category);
  }


  public updateCategory(id: number, category: Category) {
    return this.edit(id, category);
  }


  public deleteCategory(id: number) {
    return this.del(id);
  }
}
