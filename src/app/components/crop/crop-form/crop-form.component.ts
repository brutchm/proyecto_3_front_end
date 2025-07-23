import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ICrop, CROP_TYPES } from '../../../interfaces/crop.interface';

/**
 * @class CropFormComponent
 * @description
 * Componente de presentación ("tonto") para crear o editar un cultivo.
 * Recibe el FormGroup desde un componente padre y emite un evento al guardar.
 */
@Component({
  selector: 'app-crop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, DropdownModule],
  templateUrl: './crop-form.component.html',
  styleUrls: ['./crop-form.component.scss']
})
export class CropFormComponent {
  @Input() form!: FormGroup;
  @Input() isEditMode: boolean = false;
  @Output() save: EventEmitter<void> = new EventEmitter<void>();

  public cropTypeOptions: { label: string, value: string }[] = [];

  ngOnInit(): void {
    this.cropTypeOptions = CROP_TYPES;
  }

  /**
   * Emite el evento de guardado al componente padre.
   */
  onSave(): void {
    this.save.emit();
  }

  /**
   * @getter isOtherTypeSelected
   * @description
   * Un getter computado que devuelve `true` si la opción 'Otro' está seleccionada
   * en el dropdown de tipo de cultivo. Se usa para mostrar condicionalmente el campo de texto.
   */
  get isOtherTypeSelected(): boolean {
    return this.form.get('cropType')?.value === 'Otro';
  }
}
