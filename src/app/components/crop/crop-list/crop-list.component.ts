import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ICrop } from '../../../interfaces/crop.interface';

/**
 * @class CropListComponent
 * @description
 * Componente de presentación ("tonto") para mostrar una lista de cultivos en una tabla.
 * Recibe la lista de cultivos y emite eventos para acciones de editar y eliminar.
 */
@Component({
  selector: 'app-crop-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './crop-list.component.html',
  styleUrls: ['./crop-list.component.scss']
})
export class CropListComponent {
  /** La lista de cultivos a mostrar. */
  @Input() crops: ICrop[] = [];
  /** Evento emitido cuando se hace clic en el botón de editar. */
  @Output() edit: EventEmitter<ICrop> = new EventEmitter<ICrop>();
  /** Evento emitido cuando se hace clic en el botón de eliminar. */
  @Output() delete: EventEmitter<ICrop> = new EventEmitter<ICrop>();

  /**
   * Notifica al componente padre que se debe editar un cultivo.
   * @param crop - El cultivo seleccionado.
   */
  onEdit(crop: ICrop): void {
    this.edit.emit(crop);
  }

  /**
   * Notifica al componente padre que se debe eliminar un cultivo.
   * @param crop - El cultivo seleccionado.
   */
  onDelete(crop: ICrop): void {
    this.delete.emit(crop);
  }
}
