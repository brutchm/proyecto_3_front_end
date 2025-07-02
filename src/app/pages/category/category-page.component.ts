import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category } from '../../interfaces/category.interface';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CategoryFormComponent } from '../../components/category/category-form/category-form.component';
import { CategoryListComponent } from '../../components/category/category-list/category-list.component';

@Component({
  selector: 'app-category-page',
  standalone: true,
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.scss'],
  imports: [CommonModule, CategoryFormComponent, CategoryListComponent]
})
export class CategoryPageComponent implements OnInit {
  categoryForm!: FormGroup;
  areActionsAvailable = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.areActionsAvailable = this.authService.isSuperAdmin();
    this.loadCategories();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      id: [],
      name: ['', Validators.required],
      description: ['']
    });
  }

  private loadCategories(): void {
    this.categoryService.loadCategories();
    this.categoryService.categories$.subscribe(data => {
      this.categories = data;
    });
  }

  saveCategory(category: Category): void {
    this.categoryService.createCategory(category).subscribe(() => {
      this.categoryForm.reset();
      this.loadCategories();
    });
  }

  updateCategory(category: Category): void {
    if (!category.id) return;

    this.categoryService.updateCategory(category.id, category).subscribe(() => {
      this.categoryForm.reset();
      this.loadCategories();
    });
  }

  openEditCategoryModal(category: Category): void {
    this.categoryForm.patchValue(category);
  }

  deleteCategory(id: number): void {
    if (confirm('¿Seguro que quieres eliminar esta categoría?')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}
