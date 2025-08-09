import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ICrop } from '../../interfaces/crop.interface';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-crop-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './crop-list-price.component.html',
  styleUrls: ['./crop-list-price.component.scss']
})
export class PriceListComponent {
  @Input() crops: ICrop[] = [];
  @Input() isLoading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() rows: number = 5;
  @Output() pageChange: EventEmitter<TablePageEvent> = new EventEmitter<TablePageEvent>();


  // Referencia a la tabla de PrimeNG
  @ViewChild('dt') dt: Table | undefined;


  applyFilterGlobal($event: Event, stringVal: string) {
    const filterValue = ($event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(filterValue, stringVal);
  }

  onPage(event: TablePageEvent): void {
    this.pageChange.emit(event);
  }

  @Output() publishPrice = new EventEmitter<ICrop>();

onPublishPrice(crop: ICrop): void {
  this.publishPrice.emit(crop);
}

@Output() lazyLoad: EventEmitter<any> = new EventEmitter();
@Input() rowsPerPageOptions: number[] = [20, 100];

}
