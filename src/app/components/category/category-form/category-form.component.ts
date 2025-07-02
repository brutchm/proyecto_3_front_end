import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category } from '../../../interfaces/category.interface';

@Component({
  selector: 'app-category-form',
  standalone: true,
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class CategoryFormComponent {
  fb = inject(FormBuilder);

  @Input() form!: FormGroup;
  @Output() callSaveMethod = new EventEmitter<Category>();
  @Output() callUpdateMethod = new EventEmitter<Category>();

  callSave(): void {
    const item: Category = {
      name: this.form.controls['name'].value,
      description: this.form.controls['description'].value
    };

    if (this.form.controls['id']?.value) {
      item.id = this.form.controls['id'].value;
      this.callUpdateMethod.emit(item);
    } else {
      this.callSaveMethod.emit(item);
    }
  }
}
