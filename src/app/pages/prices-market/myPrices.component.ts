import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPriceMarket } from '../../interfaces';
import { PriceMarketService } from '../../services/priceMarket.service';
import { PricesMarketListComponent } from '../../components/prices-market/prices-market-list.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PricesMarketFormComponent } from '../../components/prices-market/prices-market-form.component';

@Component({
  selector: 'app-my-prices-list',
  standalone: true,
  imports: [CommonModule, PricesMarketListComponent,
    ConfirmDialogModule,
    ToastModule,
    ButtonModule
  ],
  templateUrl: './myPrices.component.html',
  styleUrls: ['./myPrices.component.scss'],
  providers: [DialogService]
})
export class MyPricesListComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private priceToDelete: IPriceMarket | null = null;

  ref: DynamicDialogRef | null = null;
  priceToEdit: IPriceMarket | null = null;

  prices: IPriceMarket[] = [];
  priceTotalRecords = 0;
  isLoadingPrices = false;
  priceRows = 10;

  constructor(private priceMarketService: PriceMarketService,

    private dialogService: DialogService,

  ) {}

  ngOnInit(): void {
    this.loadPrices({ first: 0, rows: this.priceRows });
  }

  loadPrices(event?: { first: number, rows: number }): void {
    this.isLoadingPrices = true;

    const page = event ? Math.floor(event.first / event.rows) + 1 : 1;
    const size = event ? event.rows : this.priceRows;

    this.priceMarketService.getMyPrices(page, size).subscribe({
      next: (res) => {
        this.prices = res.data;
        this.priceTotalRecords = res['meta'].totalElements;
        this.isLoadingPrices = false;
      },
      error: () => {
        this.isLoadingPrices = false;
      }
    });
  }

   /** 
   * Este metodo se llama desde app-prices-market-list al hacer clic en el botón de eliminar.
   * Solo muestra la confirmacion
   */
   deletePrice(id: number): void {
    this.priceToDelete = this.prices.find(p => p.id === id) ?? null;
  
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el precio del cultivo <strong>${this.priceToDelete?.crop?.cropName ?? ''}</strong>?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      key: 'deletePrice'
    });
  }

  onConfirmDelete(): void {
    this.confirmationService.close();

    if (this.priceToDelete?.id) {
      this.isLoadingPrices = true;

      this.priceMarketService.deletePrice(this.priceToDelete.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Precio eliminado correctamente.' });
          this.loadPrices({ first: 0, rows: this.priceRows });
          this.priceToDelete = null;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el precio.' });
          this.isLoadingPrices = false;
          this.priceToDelete = null;
        }
      });
    }
  }

  onRejectDelete(): void {
    this.confirmationService.close();
    this.priceToDelete = null;
  }


  editPrice(price: IPriceMarket): void {
    this.priceToEdit = price;
  
    this.ref = this.dialogService.open(PricesMarketFormComponent, {
      header: `Editar Precio - ${price.crop?.cropName}`,
      width: '600px',
      height: "485px",
      data: {
        crop: price.crop,
        priceToEdit: price
      }
    });
  
    this.ref.onClose.subscribe(() => {
      this.loadPrices({ first: 0, rows: this.priceRows });
    });
  }


  openCreatePriceModal(): void {
    this.ref = this.dialogService.open(PricesMarketFormComponent, {
      header: 'Registrar nuevo precio',
      width: '30rem',
      data: {
        crop: { id: null, cropName: '' }
      }
    });
  
    this.ref.onClose.subscribe(() => {
      this.loadPrices({ first: 0, rows: this.priceRows });
    });
  }
  

}
