import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ICrop } from '../../interfaces/crop.interface';
import { CropPriceMarketListService, PriceMarketService } from '../../services/priceMarket.service';
import { PriceListComponent } from '../../components/prices-market/crop-list-price.component';
import { IPriceMarket } from '../../interfaces';
import { PricesMarketFormComponent } from '../../components/prices-market/prices-market-form.component';
import { ModalService } from '../../services/modal.service';
import { PricesMarketListComponent } from '../../components/prices-market/prices-market-list.component';
import { DialogService } from 'primeng/dynamicdialog';


@Component({
  selector: 'app-crops',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, ToastModule,
    ConfirmDialogModule, DialogModule, ToolbarModule, TooltipModule,PriceListComponent,
    PricesMarketFormComponent,PricesMarketListComponent,
  ],
  providers: [DialogService],
  templateUrl: './priceMarket.component.html',
  styleUrls: ['./priceMarket.component.scss']
})
export class PriceMarketComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private cropService: CropPriceMarketListService = inject(CropPriceMarketListService);

  private priceMarketService: PriceMarketService = inject(PriceMarketService);

  private messageService: MessageService = inject(MessageService);
  public confirmationService: ConfirmationService = inject(ConfirmationService);

  public modalService: ModalService = inject(ModalService);
  @ViewChild('marketPriceModal') public marketPriceModal: any;
  public priceMarketForm = this.fb.group({
    id: [''],
    crop: ['', Validators.required],
    price: ['', Validators.required],
    measureUnit: ['', Validators.required]
  });

  crops: ICrop[] = [];
  cropForm!: FormGroup;
  displayDialog: boolean = false;
  isEditMode: boolean = false;
  currentCropId?: number;

  isLoading: boolean = true;
  totalRecords: number = 0;
  rows: number = 20;


  ngOnInit(): void {
    this.loadCrops({ first: 0, rows: this.rows });
    this.loadPrices({ first: 0, rows: this.priceRows });
  }

  defaultRowsPerPageOptions = [20, 100];
  rowsPerPageOptions = [...this.defaultRowsPerPageOptions];

  loadCrops(event?: { first: number, rows: number }): void {
    this.isLoading = true;

    const page = event ? Math.floor(event.first / event.rows) + 1 : 1;
    const size = event ? event.rows : this.defaultRowsPerPageOptions[0];

    this.cropService.getAllCrops(page, size).subscribe({
      next: (response) => {

        this.crops = response.data;
        this.totalRecords = response.meta.totalElements;
        
        if (!this.rowsPerPageOptions.includes(this.totalRecords)) {
          this.rowsPerPageOptions = [...this.defaultRowsPerPageOptions, this.totalRecords];
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.isLoading = false;
      }
    });
  }

  showCreateDialog(): void {
    this.isEditMode = false;
    this.cropForm.reset();
    this.currentCropId = undefined;
    this.displayDialog = true;
  }

  showEditDialog(crop: ICrop): void {
    this.isEditMode = true;
    this.currentCropId = crop.id;
    this.cropForm.patchValue(crop);
    this.displayDialog = true;
  }

  handleSave(): void {
    if (this.cropForm.invalid) {
      this.cropForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, completa los campos requeridos.' });
      return;
    }

    const cropData = this.cropForm.value;
  }
  
  finalizeSave(): void {
    this.displayDialog = false;
    this.loadCrops();
  }


 
  public showPriceModal = false;
  public selectedCrop?: ICrop;
  selectedCropName: string = '';

  openPriceModal(crop: ICrop): void {
    this.selectedCrop = crop;
    this.showPriceModal = true;
    this.selectedCropName = crop.cropName;
    this.priceMarketForm.reset();
  }
  
  onPriceSubmitted(): void {
    this.showPriceModal = false;
    this.loadCrops();
  }
  
//list prices market and others

public prices: IPriceMarket[] = [];
public priceTotalRecords: number = 0;
public isLoadingPrices: boolean = false;
public priceRows: number = 10;

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




}
