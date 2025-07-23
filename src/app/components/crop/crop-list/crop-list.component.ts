import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ICrop } from '../../../interfaces/crop.interface';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';


/**
 * @class CropListComponent
 * @description
 * Componente de presentación para mostrar una lista de cultivos en una tabla.
 * Recibe la lista de cultivos y emite eventos para acciones de editar y eliminar.
 */
@Component({
  selector: 'app-crop-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './crop-list.component.html',
  styleUrls: ['./crop-list.component.scss']
})
export class CropListComponent {
  @Input() crops: ICrop[] = [];
  @Input() isLoading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() rows: number = 5;
  @Output() pageChange: EventEmitter<TablePageEvent> = new EventEmitter<TablePageEvent>();
  @Output() edit: EventEmitter<ICrop> = new EventEmitter<ICrop>();
  @Output() delete: EventEmitter<ICrop> = new EventEmitter<ICrop>();

  // Referencia a la tabla de PrimeNG
  @ViewChild('dt') dt: Table | undefined;

  /**
   * Aplica un filtro global a la tabla basado en el valor de un input.
   * @param $event - El evento del input.
   * @param stringVal - El modo de filtrado (ej. 'contains').
   */
  applyFilterGlobal($event: Event, stringVal: string) {
    const filterValue = ($event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(filterValue, stringVal);
  }

  /**
   * Emite el evento de cambio de página al componente padre.
   * @param event - El objeto de evento de paginación de PrimeNG.
   */
  onPage(event: TablePageEvent): void {
    this.pageChange.emit(event);
  }

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
