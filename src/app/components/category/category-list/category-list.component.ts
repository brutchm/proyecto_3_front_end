import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../interfaces/category.interface';


@Component({
  selector: 'app-category-list',
  standalone: true,
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  imports: [CommonModule]
})
export class CategoryListComponent {
  @Input() pCategoryList: Category[] = [];
  @Input() areActionsAvailable: boolean = false;

  @Output() callUpdateModalMethod = new EventEmitter<Category>();
  @Output() callDeleteMethod = new EventEmitter<number>();

  edit(category: Category): void {
    this.callUpdateModalMethod.emit(category);
  }

  delete(id: number): void {
    this.callDeleteMethod.emit(id);
  }
}
