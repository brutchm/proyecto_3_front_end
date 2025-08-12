import { Component, EventEmitter, Input, Output, OnInit, inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICrop } from '../../interfaces/crop.interface';
import { PriceMarketService } from '../../services/priceMarket.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { IPriceMarket } from '../../interfaces';
import { DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from "primeng/api";
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-prices-market-form',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule],
  templateUrl: './prices-market-form.component.html',
  styleUrl:"./prices-market-form.component.scss",
})
export class PricesMarketFormComponent implements OnInit {
  @Input() crop!: ICrop;
  @Output() priceSubmitted = new EventEmitter<void>();
  private messageService = inject(MessageService);
  private priceService: PriceMarketService = inject(PriceMarketService);

  constructor(
    private fb: FormBuilder,
    @Optional() public config?: DynamicDialogConfig,
    @Optional() public ref?: DynamicDialogRef
  ) {
    this.form = this.fb.group({
      id: [null],
      crop: [null, Validators.required],
      price: [null, Validators.required]
    });
  
    if (this.config?.data) {
      this.form.patchValue(this.config.data);
    }
  }
  
  
  form!: FormGroup;
  @Input() priceToEdit?: IPriceMarket;
  ngOnInit(): void {
    const data = this.config?.data ?? {};
  
    this.crop = data?.crop ?? null;
    this.priceToEdit = data?.priceToEdit ?? null;
  
    this.form = this.fb.group({
      price: [this.priceToEdit?.price ?? '', [Validators.required, Validators.min(1)]],
      measureUnit: [this.priceToEdit?.measureUnit ?? '', [Validators.required]]
    });
  }
  
  
  @Input() priceMarket?: IPriceMarket;
  @Output() formSubmit = new EventEmitter<IPriceMarket>();

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const priceData: IPriceMarket = {
      id: this.priceToEdit?.id,
      crop: this.crop,
      price: this.form.value.price,
      measureUnit: this.form.value.measureUnit
    };
  
    this.priceService.save(priceData).subscribe({
      next: (response) => {
        this.form.reset();
  
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: response.message,
        });
  
        if (this.ref) {
          this.ref.close();
        } else {
          this.priceSubmitted.emit();
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al publicar el precio',
        });
      }
    });
  }
  
  measureUnitOptions = [
    { label: 'Kilogramos', value: 'Kilogramos' },
    { label: 'Litros', value: 'Litros' },
    { label: 'Unidad', value: 'Unidad' },
    { label: 'Caja', value: 'Caja' },
    { label: 'Saco', value: 'Saco' }
  ];
  

}
