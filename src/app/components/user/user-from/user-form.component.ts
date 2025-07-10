import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  /**
   * El FormGroup que define la estructura y los validadores del formulario.
   * Es proporcionado por un componente padre a través de property binding.
   * @input
   */
  @Input() form!: FormGroup;

  /**
   * Emite un evento para notificar al componente padre que debe ejecutar
   * la lógica de guardado (creación de un nuevo registro).
   * @output
   */
  @Output() callSaveMethod: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Emite un evento para notificar al componente padre que debe ejecutar
   * la lógica de actualización de un registro existente.
   * @output
   */
  @Output() callUpdateMethod: EventEmitter<void> = new EventEmitter<void>();

  /**
   * @method callSave
   * @description
   * Este método se invoca cuando se hace clic en el botón de acción del formulario.
   * Determina si se está creando un nuevo registro o actualizando uno existente
   * basándose en la presencia de un 'id' en el FormGroup, y emite el evento correspondiente.
   */
  public callSave(): void {
    // Este componente solo necesita notificar la intención del usuario.
    if (this.form.controls['id']?.value) {
      this.callUpdateMethod.emit();
    } else {
      this.callSaveMethod.emit();
    }
  }
}
