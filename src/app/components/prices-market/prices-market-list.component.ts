import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { IPriceMarket } from '../../interfaces';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-prices-market-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './prices-market-list.component.html',
  styleUrl: './prices-market-list.component.scss'
})
export class PricesMarketListComponent {
  @Input() prices: IPriceMarket[] = [];
  @Input() isLoading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [10, 20, 50];

  @Output() pageChange = new EventEmitter<TablePageEvent>();

  @ViewChild('dt') dt!: Table;

  applyFilterGlobal(event: Event, filterType: string) {
    const value = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(value, filterType);
  }

  onPage(event: TablePageEvent): void {
    this.pageChange.emit(event);
  }

  @Output() deletePrice = new EventEmitter<number>();

  onDeleteClick(id: number) {
    this.deletePrice.emit(id);
  }
  
  @Output() editPrice = new EventEmitter<IPriceMarket>();

  onEditClick(price: IPriceMarket) {
    this.editPrice.emit(price);
  }
  
}
