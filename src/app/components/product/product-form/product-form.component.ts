import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../../interfaces/product.interface';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../interfaces/category.interface';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent {
  fb = inject(FormBuilder);
  categoryService = inject(CategoryService);

  @Input() form!: FormGroup;
  @Output() callSaveMethod = new EventEmitter<Product>();
  @Output() callUpdateMethod = new EventEmitter<Product>();

  categories: Category[] = [];

  ngOnInit(): void {
    this.categoryService.loadCategories();
    this.categoryService.categories$.subscribe(cats => this.categories = cats);
  }

  callSave(): void {
    const product: Product = this.form.getRawValue();
    if (product.id) this.callUpdateMethod.emit(product);
    else this.callSaveMethod.emit(product);
  }
}