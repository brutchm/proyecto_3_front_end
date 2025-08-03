import { Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
  FarmService,
  IFarm,
  IFarmResponse,
  IFarmTechnicalInfo,
} from "../../services/farm.service";

import { MessageService, PrimeNGConfig } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DataView, DataViewModule } from "primeng/dataview";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from "primeng/inputtext";
import { SkeletonModule } from "primeng/skeleton";

import { FarmCardComponent } from "../../components/farm/farm-card/farm-card.component";
import { FarmFormComponent } from "../../components/farm/farm-form/farm-form.component";

@Component({
  selector: "app-farm",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DataViewModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    SkeletonModule,
    FarmCardComponent,
    FarmFormComponent,
  ],
  templateUrl: "./farm.component.html",
  styleUrls: ["./farm.component.scss", "./farm-details.component.scss"],
})
export class FarmComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private farmService = inject(FarmService);
  private messageService = inject(MessageService);

  farms: IFarmResponse[] = [];
  farmForm!: FormGroup;

  isLoading: boolean = true;
  displayDialog: boolean = false;

  skeletonItems = new Array(6);

  constructor(
    //para poder configurar los mensajes en español que pone primeng
    private primengConfig: PrimeNGConfig) {
    }

  ngOnInit(): void {
    this.initializeForm();
    this.loadFarms();
    this.filteredFarms = this.farms;
    this.primengConfig.setTranslation({
      emptyMessage: 'No se encontraron resultados',//mensaje en espanol
    });
  }

  loadFarms(): void {
    this.isLoading = true;
    this.farmService.getMyFarms().subscribe({
      next: (response) => {
        const validFarms = (response.data || []).filter(
          (item) => item && item.farm && item.farm.farmLocation.includes(",")
        );
        this.farms = validFarms;
        this.filteredFarms = validFarms; 
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.farms = [];
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar las fincas.",
        });
      },
    });
  }

  onFilter(dv: DataView, event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    dv.filter(filterValue, "farm.farmName");
  }

  initializeForm(): void {
    this.farmForm = this.fb.group({
      farmName: ["", Validators.required],
      farmCountry: ["Costa Rica", Validators.required],
      farmStateProvince: ["", Validators.required],
      farmOtherDirections: ["", Validators.required],
      farmLocation: ["", Validators.required],
      farmSize: [
        "",
        [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)],
      ],
      farmMeasureUnit: ["hectáreas", Validators.required],

      // Campos de información técnica
      soilPh: [null],
      soilNutrients: [null],
      irrigationSystem: [null],
      irrigationSystemType: [null],
      waterAvailable: [null],
      waterUsageType: [null],
      fertilizerPesticideUse: [null],
    });
  }

  showCreateDialog(): void {
    this.initializeForm();
    this.displayDialog = true;
  }

  handleViewDetails(farmId: number): void {
    this.router.navigate(["/app/farm-details"], {
      queryParams: { id: farmId },
    });
  }

  handleSave(): void {
    if (this.farmForm.invalid) {
      this.messageService.add({
        severity: "warn",
        summary: "Atención",
        detail: "Por favor, completa todos los campos requeridos.",
      });
      return;
    }

    const formValue = this.farmForm.value;
    const farmPayload: Partial<IFarm> = {
      farmName: formValue.farmName,
      farmCountry: formValue.farmCountry,
      farmStateProvince: formValue.farmStateProvince,
      farmOtherDirections: formValue.farmOtherDirections,
      farmLocation: formValue.farmLocation,
      farmSize: formValue.farmSize,
      farmMeasureUnit: formValue.farmMeasureUnit,
      active: true,
    };
    const techInfoPayload: Partial<IFarmTechnicalInfo> = {
      soilPh: formValue.soilPh,
      soilNutrients: formValue.soilNutrients,
      irrigationSystem: formValue.irrigationSystem,
      waterAvailable: formValue.waterAvailable,
    };

    this.farmService.createFarm(farmPayload, techInfoPayload).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: "Finca creada correctamente.",
        });
        this.displayDialog = false;
        this.loadFarms();
      },
      error: (err) =>
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo crear la finca.",
        }),
    });
  }

     
  filteredFarms: IFarmResponse[] = [];
  searchTerm: string = '';
  onSearchChange(value: string) {
    this.searchTerm = value.toLowerCase();
    this.filteredFarms = this.farms.filter(farm =>
      farm.farm.farmName.toLowerCase().includes(this.searchTerm) ||
      farm.farm.farmCountry.toLowerCase().includes(this.searchTerm) ||
      farm.farm.farmStateProvince.toLowerCase().includes(this.searchTerm)
    );
  }



}
