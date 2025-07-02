import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../interfaces/product.interface';
import { Category } from '../../../interfaces/category.interface';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent {
  @Input() productList: Product[] = [];
  @Input() areActionsAvailable: boolean = false;
  @Output() callUpdateMethod = new EventEmitter<Product>();
  @Output() callDeleteMethod = new EventEmitter<number>();

  categoryMap: { [id: number]: string } = {};

  constructor(private categoryService: CategoryService) {
    this.categoryService.categories$.subscribe((categories: Category[]) => {
      categories.forEach(
        (cat: Category) => (this.categoryMap[cat.id!] = cat.name)
      );
    });
  }

  getCategoryName(categoryId: number | undefined): string {
    console.log('categoryId', categoryId);
    if (!categoryId) return 'Sin categoría';
    return this.categoryMap[categoryId] || 'Sin categoría';
  }

  edit(product: Product): void {
    this.callUpdateMethod.emit(product);
  }

  remove(id: number): void {
    this.callDeleteMethod.emit(id);
  }
}
