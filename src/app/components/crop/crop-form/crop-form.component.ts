import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

/**
 * @class CropFormComponent
 * @description
 * Componente de presentación ("tonto") para crear o editar un cultivo.
 * Recibe el FormGroup desde un componente padre y emite un evento al guardar.
 */
@Component({
  selector: 'app-crop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './crop-form.component.html',
  styleUrls: ['./crop-form.component.scss']
})
export class CropFormComponent {
  /** El FormGroup a ser utilizado por el formulario. */
  @Input() form!: FormGroup;
  /** Un flag para cambiar el texto del botón (Crear/Actualizar). */
  @Input() isEditMode: boolean = false;
  /** Evento emitido cuando el usuario hace clic en el botón de guardar. */
  @Output() save: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Emite el evento de guardado al componente padre.
   */
  onSave(): void {
    this.save.emit();
  }
}
