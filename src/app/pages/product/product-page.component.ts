import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';

import { ProductFormComponent } from '../../components/product/product-form/product-form.component';
import { ProductListComponent } from '../../components/product/product-list/product-list.component';

@Component({
  selector: 'app-product-page',
  standalone: true,
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductFormComponent,
    ProductListComponent
  ]
})
export class ProductPageComponent implements OnInit {
  public fb = inject(FormBuilder);
  public productService = inject(ProductService);
  public categoryService = inject(CategoryService);
  public authService = inject(AuthService);
  areActionsAvailable = false;

  public form: FormGroup = this.fb.group({
    id: [undefined],
    name: [''],
    description: [''],
    price: [0],
    stock: [0],
    categoryId: [null],
  });

  public productList$ = this.productService.items$();
  public editMode = signal<boolean>(false);

  ngOnInit(): void {
    this.productService.loadProducts();
    this.areActionsAvailable = this.authService.isSuperAdmin();
    this.categoryService.loadCategories();
  }

  canModify(): boolean {
    return this.authService.hasRole("SUPER_ADMIN");
  }

  saveProduct(product: Product): void {
    if (product.categoryId)
      this.productService
        .addCustomSource(`product/${product.categoryId}`, product)
        .subscribe(() => {
          this.productService.loadProducts();
          this.form.reset();
        });
  }

  updateProduct(product: Product): void {
    if (product.id)
      this.productService.edit(product.id, product).subscribe(() => {
        this.productService.loadProducts();
        this.form.reset();
        this.editMode.set(false);
      });
  }

  openEditProductModal(product: Product): void {
    this.form.patchValue(product);
    this.editMode.set(true);
  }

  deleteProduct(productId: number): void {
    this.productService.del(productId).subscribe(() => {
      this.productService.loadProducts();
    });
  }
}
