import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CalendarModule } from "primeng/calendar";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FarmService, IFarm } from "../../services/farm.service";
import { LocationMapComponent } from "../../components/farm-map/farm-map.component";
import { LoaderComponent } from "../../components/loader/loader.component";
import { ModalComponent } from "../../components/modal/modal.component";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FarmFormComponent } from "../../components/farm/farm-form/farm-form.component";
import { ParcelasFormComponent } from "../../components/parcelas/parcelas-form/parcelas-form.component";
import { AnimalService } from "../../services/animal.service";
import {
  IGroupAnimal,
  ProductionTypeEnum,
} from "../../interfaces/group-animal.interface";
import { AnimalGroupCardComponent } from "../../components/animal-group/animal-group-card.component";
import * as L from "leaflet";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { ParcelasService } from "../../services/parcelas.service";
import {
  ManagementPlotPayload,
  ManagementPlotsService,
} from "../../services/management-plots.service";
import { CropService } from "../../services/crop.service";


import {
  IPlotManagementRecord,
  PlotManagementService,
} from "../../services/plot-management.service";
import { ICrop } from "../../interfaces/crop.interface";

@Component({
  selector: "app-farm-details",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LocationMapComponent,
    LoaderComponent,
    ModalComponent,
    ReactiveFormsModule,
    FormsModule,
    AnimalGroupCardComponent,
    ButtonModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    FarmFormComponent,
    ParcelasFormComponent,
    CalendarModule,
  ],
  templateUrl: "./farm-details.component.html",
  styleUrl: "./farm-details.component.scss",
})
export class FarmDetailsComponent implements OnInit, AfterViewInit {
  parcelasGeoJSON: string[] = [];

  // Parcelas creation dialog and form
  displayDialog: boolean = false;
  parcelaForm!: FormGroup;
  parcelasLoading: boolean = false;

  // Gestión de parcelas modal and form
  gestionParcelaForm!: FormGroup;
  gestionParcelaSubmitted: boolean = false;
  gestionParcelaLoading: boolean = false;
  displayGestionDialog: boolean = false;
  gestionCrops: ICrop[] = [];
  gestionCropsLoading: boolean = false;

  animalGroups: IGroupAnimal[] = [];
  animalGroupsLoading = false;
  animalGroupsError = "";
  @ViewChild("deleteFarmModal")
  deleteFarmModal!: ElementRef;
  showDeleteModal = false;
  deleteLoading = false;

  // Gestión de parcelas data and loading states
  gestionParcelas: IPlotManagementRecord[] = [];
  gestionParcelasLoading: boolean = false;
  gestionParcelasError: string = "";

  get filteredGestionParcelas() {
    // Use mapped gestion parcelas for table display
    return this.gestionParcelas.map((record) => {
      const found = this.gestionCrops.find((c) => c.id === record.cropId);
      return found
        ? { ...record, cropName: found.cropName }
        : { ...record, cropName: "-" };
    });
  }

  farmId: string | null = null;
  farm: IFarm | null = null;
  technicalInfo: any = null;
  loading = false;
  error: string = "";
  @ViewChild("searchLocationInput")
  searchLocationInput!: ElementRef<HTMLInputElement>;
  private readonly defaultIcon = L.icon({
    iconUrl: "assets/leaflet/marker-icon.png",
    shadowUrl: "assets/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  provinces: string[] = [
    "San José",
    "Alajuela",
    "Cartago",
    "Heredia",
    "Guanacaste",
    "Puntarenas",
    "Limón",
  ];

  measureUnits: string[] = [
    "kg",
    "litros",
    "toneladas",
    "unidades",
    "metros",
    "metros cúbicos",
    "galones",
  ];

  // Gestión de parcelas delete modal state
  showDeleteGestionModal: boolean = false;
  gestionToDelete: IPlotManagementRecord | null = null;

  showEditFarmModal = false;
  editFarmForm!: FormGroup;
  editFarmSubmitted = false;
  editFarmLoading = false;
  private editFarmMapInstance: L.Map | null = null;
  private marker: L.Marker | null = null;

  // Parcelas tab map logic
  parcelasInfo: any[] = [];
  selectedParcela: any = null;
  indexCurrentSelectedParcela: number | null = null;
  showDeleteParcelaModal: boolean = false;
  editParcelaMode: boolean = false;
  parcelaToEdit: any = null;

  // New group modal state
  showNewGroupModal = false;
  newGroupForm!: FormGroup;
  newGroupSubmitted = false;
  newGroupLoading = false;
  // For production type select
  productionTypes = Object.values(ProductionTypeEnum);
  private messageService = inject(MessageService);
  private parcelasService = inject(ParcelasService);
  private managementPlotsService = inject(ManagementPlotsService);
  // Edit gestión parcela modal state and form
  displayEditGestionDialog: boolean = false;
  editGestionParcelaForm!: FormGroup;

  private cropService = inject(CropService);
  private plotManagementService = inject(PlotManagementService);
  editingGestionId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private farmService: FarmService,
    private fb: FormBuilder,
    private animalService: AnimalService,
  ) {
  }

  /**
   * Submits the edit gestión parcela form and updates the record
   */
  submitEditGestionParcela() {
    if (
      this.editGestionParcelaForm.invalid || !this.selectedParcela ||
      !this.farmId || !this.editingGestionId
    ) return;
    const formValue = this.editGestionParcelaForm.value;
    const selectedCrop = this.gestionCrops.find((c) =>
      c.id == formValue.cropId
    );
    if (!selectedCrop || typeof selectedCrop.id !== "number") {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Debe seleccionar un cultivo válido.",
      });
      return;
    }
    const payload: ManagementPlotPayload = {
      cropId: `${selectedCrop.id}`,
      actionName: formValue.actionName,
      actionPictureUrl: formValue.actionPictureUrl,
      measureUnit: formValue.measureUnit,
      measureValue: formValue.measureValue,
      valueSpent: formValue.valueSpent,
      actionDate: formValue.actionDate,
    };
    this.managementPlotsService.update(
      this.selectedParcela.id,
      this.editingGestionId,
      payload,
    ).subscribe({
      next: () => {
        this.displayEditGestionDialog = false;
        this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: "Gestión de parcela editada correctamente.",
        });
        this.fetchGestionParcelas(this.selectedParcela.id);
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo editar la gestión de parcela.",
        });
      },
    });
  }

  /**
   * Opens the edit gestión parcela modal and patches the form with the selected record
   */
  openEditGestionModal(gestion: IPlotManagementRecord): void {
    if (!this.editGestionParcelaForm) {
      this.editGestionParcelaForm = this.fb.group({
        cropId: ["", Validators.required],
        actionName: ["", Validators.required],
        actionPictureUrl: ["", Validators.required],
        measureUnit: ["", Validators.required],
        measureValue: [null, [Validators.required, Validators.min(0)]],
        valueSpent: [null, [Validators.required, Validators.min(0)]],
        actionDate: ["", Validators.required],
      });
    } else {
      this.editGestionParcelaForm.reset();
    }
    if (gestion) {
      // Patch the form with the selected record's values, ensuring cropId is a number
      let cropIdValue: number | "";
      if (
        gestion.cropId !== null &&
        typeof gestion.cropId === "object" &&
        "id" in gestion.cropId &&
        typeof (gestion.cropId as any).id === "number"
      ) {
        cropIdValue = Number((gestion.cropId as any).id);
      } else if (typeof gestion.cropId === "number") {
        cropIdValue = gestion.cropId;
      } else if (typeof gestion.cropId === "string" && gestion.cropId !== "") {
        cropIdValue = Number(gestion.cropId);
      } else {
        cropIdValue = "";
      }
      this.editGestionParcelaForm.patchValue({
        cropId: cropIdValue,
        actionName: gestion.actionName,
        actionPictureUrl: gestion.actionPictureUrl,
        measureUnit: gestion.measureUnit,
        measureValue: gestion.measureValue,
        valueSpent: gestion.valueSpent,
        actionDate: gestion.actionDate ? new Date(gestion.actionDate) : null,
      });
      this.editingGestionId = gestion.id;
    } else {
      this.editingGestionId = null;
    }
    this.displayEditGestionDialog = true;
  }

  /**
   * Closes the edit gestión parcela modal
   */
  closeEditGestionParcelaModal(): void {
    this.displayEditGestionDialog = false;
    if (this.editGestionParcelaForm) {
      this.editGestionParcelaForm.reset();
    }
  }
  /**
   * Handler for editing a gestión parcela record
   * @param gestion The management record to edit
   */
  onEditGestion(gestion: IPlotManagementRecord): void {
    this.openGestionParcelaModal(gestion);
  }

  /**
   * Handler for deleting a gestión parcela record
   * @param gestion The management record to delete
   */
  onDeleteGestion(gestion: IPlotManagementRecord): void {
    // TODO: Implement delete confirmation and API call
    if (!gestion || !gestion.id || !this.selectedParcela) return;
    if (confirm("¿Está seguro que desea eliminar este registro de gestión?")) {
      this.gestionParcelasLoading = true;
      this.plotManagementService.deletePlotManagementRecord(
        this.selectedParcela.id,
        gestion.id,
      ).subscribe({
        next: () => {
          this.gestionParcelasLoading = false;
          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Registro de gestión eliminado correctamente.",
          });
          this.fetchGestionParcelas(this.selectedParcela.id);
        },
        error: () => {
          this.gestionParcelasLoading = false;
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo eliminar el registro de gestión.",
          });
        },
      });
    }
  }
  // Helper for template: get crop name by cropId
  getCropNameById(cropId: number): string {
    const found = this.gestionCrops.find((c) => c.id === cropId);
    return found ? found.cropName : "-";
  }

  /**
   * Opens the gestión parcela delete confirmation modal
   */
  openDeleteGestionModal(gestion: IPlotManagementRecord): void {
    this.gestionToDelete = gestion;
    this.showDeleteGestionModal = true;
  }

  /**
   * Closes the gestión parcela delete confirmation modal
   */
  closeDeleteGestionModal(): void {
    this.showDeleteGestionModal = false;
    this.gestionToDelete = null;
  }

  /**
   * Confirms deletion of the selected gestión parcela record
   */
  confirmDeleteGestion(): void {
    if (
      !this.gestionToDelete || !this.gestionToDelete.id || !this.selectedParcela
    ) return;
    this.gestionParcelasLoading = true;
    this.plotManagementService.deletePlotManagementRecord(
      this.selectedParcela.id,
      this.gestionToDelete.id,
    ).subscribe({
      next: () => {
        this.gestionParcelasLoading = false;
        this.showDeleteGestionModal = false;
        this.gestionToDelete = null;
        this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: "Registro de gestión eliminado correctamente.",
        });
        this.fetchGestionParcelas(this.selectedParcela.id);
      },
      error: () => {
        this.gestionParcelasLoading = false;
        this.showDeleteGestionModal = false;
        this.gestionToDelete = null;
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo eliminar el registro de gestión.",
        });
      },
    });
  }

  // Handler for polygon clicks in map
  onClickFigures(idx: number) {
    this.indexCurrentSelectedParcela = idx;
    this.selectedParcela = this.parcelasInfo[idx];
    // Load management records for the selected parcela
    this.fetchGestionParcelas(this.selectedParcela.id);
  }

  /**
   * Fetch management records for a specific plot
   * @param plotId The ID of the plot to fetch records for
   */
  private fetchGestionParcelas(plotId: number): void {
    if (!plotId) {
      this.gestionParcelas = [];
      this.gestionParcelasLoading = false;
      this.gestionParcelasError = "";
      return;
    }

    this.gestionParcelasLoading = true;
    this.gestionParcelasError = "";

    this.plotManagementService.getPlotManagementRecords(plotId).subscribe({
      next: (response) => {
        // Merge cropName from gestionCrops into each management record
        this.gestionParcelas = (response.data || []).map((record) => {
          const crop = this.gestionCrops.find((c) => c.id === record.cropId);
          return crop ? { ...record, cropName: crop.cropName } : record;
        });
        this.gestionParcelasLoading = false;
      },
      error: (error) => {
        console.error("Error loading management records:", error);
        this.gestionParcelasError =
          "No se pudieron cargar los registros de gestión.";
        this.gestionParcelas = [];
        this.gestionParcelasLoading = false;
      },
    });
  }

  onClickEliminarParcela() {
    this.showDeleteParcelaModal = true;
  }

  closeDeleteParcelaModal() {
    this.showDeleteParcelaModal = false;
  }

  confirmDeleteParcela() {
    if (!this.selectedParcela || !this.farmId) return;
    this.parcelasService.eliminarParcela(this.farmId, this.selectedParcela.id)
      .subscribe({
        next: () => {
          this.showDeleteParcelaModal = false;
          this.selectedParcela = null;
          this.getParcelas();
          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Parcela eliminada correctamente.",
          });
        },
        error: () => {
          this.showDeleteParcelaModal = false;
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo eliminar la parcela.",
          });
        },
      });
  }

  public getParcelas(): void {
    if (!this.farmId) return;
    this.parcelasService.getParcelas(this.farmId).subscribe({
      next: (res) => {
        const parcelas = res.data || [];
        this.parcelasGeoJSON = parcelas.map((p) =>
          typeof p.geometryPolygon === "string" ? p.geometryPolygon : ""
        ).filter((g) => !!g);
        this.parcelasInfo = parcelas;
        if (
          this.indexCurrentSelectedParcela !== null &&
          this.parcelasInfo[this.indexCurrentSelectedParcela]
        ) {
          this.selectedParcela =
            this.parcelasInfo[this.indexCurrentSelectedParcela];
          // Reload management records for the currently selected parcela
          this.fetchGestionParcelas(this.selectedParcela.id);
        } else {
          this.selectedParcela = null;
          // Clear management records when no parcela is selected
          this.gestionParcelas = [];
          this.gestionParcelasError = "";
        }
      },
      error: () => {
        this.parcelasGeoJSON = [];
        this.parcelasInfo = [];
        this.selectedParcela = null;
        this.gestionParcelas = [];
        this.gestionParcelasError = "";
      },
    });
  }

  openNewGroupModal() {
    this.newGroupForm = this.fb.group({
      groupName: ["", Validators.required],
      measure: ["", Validators.required],
      productionType: ["", Validators.required],
      isActive: [true, Validators.required],
    });
    this.newGroupSubmitted = false;
    this.showNewGroupModal = true;
  }

  // Called when tab button is clicked to trigger a window resize event for map refresh
  triggerResizeEvent() {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  }

  closeNewGroupModal() {
    this.showNewGroupModal = false;
  }

  // Gestión de parcelas modal handlers
  openGestionParcelaModal(gestion?: IPlotManagementRecord) {
    // Always initialize the form before opening modal
    this.gestionParcelaForm = this.fb.group({
      cropId: ["", Validators.required],
      actionName: ["", Validators.required],
      actionPictureUrl: ["", Validators.required],
      measureUnit: ["", Validators.required],
      measureValue: [null, [Validators.required, Validators.min(0)]],
      valueSpent: [null, [Validators.required, Validators.min(0)]],
      actionDate: ["", Validators.required],
    });
    if (gestion) {
      this.gestionParcelaForm.patchValue({
        cropId: gestion.cropId,
        actionName: gestion.actionName,
        actionPictureUrl: gestion.actionPictureUrl,
        measureUnit: gestion.measureUnit,
        measureValue: gestion.measureValue,
        valueSpent: gestion.valueSpent,
        actionDate: gestion.actionDate,
      });
      this.editingGestionId = gestion.id;
    } else {
      this.editingGestionId = null;
    }
    this.gestionParcelaSubmitted = false;
    this.displayGestionDialog = true;
  }

  closeGestionParcelaModal() {
    this.displayGestionDialog = false;
  }

  submitGestionParcela() {
    this.gestionParcelaSubmitted = true;
    if (
      this.gestionParcelaForm.invalid || !this.selectedParcela || !this.farmId
    ) return;
    this.gestionParcelaLoading = true;
    const formValue = this.gestionParcelaForm.value;
    // Find the selected crop object by id
    const selectedCrop = this.gestionCrops.find((c) =>
      c.id == formValue.cropId
    );
    // Build payload with crop object
    if (!selectedCrop || typeof selectedCrop.id !== "number") {
      this.gestionParcelaLoading = false;
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Debe seleccionar un cultivo válido.",
      });
      return;
    }
    const payload: ManagementPlotPayload = {
      cropId: `${selectedCrop.id}`,
      actionName: formValue.actionName,
      actionPictureUrl: formValue.actionPictureUrl,
      measureUnit: formValue.measureUnit,
      measureValue: formValue.measureValue,
      valueSpent: formValue.valueSpent,
      actionDate: formValue.actionDate,
    };
    // Use selectedParcela.id as plotId
    this.managementPlotsService.create(this.selectedParcela.id, payload)
      .subscribe({
        next: () => {
          this.gestionParcelaLoading = false;
          this.displayGestionDialog = false;
          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Gestión de parcela creada correctamente.",
          });
          // Refresh the management records list
          this.fetchGestionParcelas(this.selectedParcela.id);
        },
        error: () => {
          this.gestionParcelaLoading = false;
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo crear la gestión de parcela.",
          });
        },
      });
  }

  submitNewGroup() {
    this.newGroupSubmitted = true;
    if (this.newGroupForm.invalid || !this.farmId) return;
    this.newGroupLoading = true;
    const formValue = this.newGroupForm.value;
    // Call animalService to create new group (implement this method in your service)
    const normalize = (val: any) =>
      (val === null || val === "No sé" || val === "") ? null : val;
    const group = {
      groupName: formValue.groupName,
      species: formValue.species,
      count: formValue.count,
      measure: formValue.measure,
      productionType: normalize(formValue.productionType),
      isActive: formValue.isActive,
      farmId: this.farmId as string,
    };
    this.animalService.createAnimalGroup(group).subscribe({
      next: () => {
        this.newGroupLoading = false;
        this.showNewGroupModal = false;
        this.fetchAnimalGroups();
        this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: "Grupo de animales creado correctamente",
        });
      },
      error: () => {
        this.newGroupLoading = false;
      },
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.farmId = params.get("id");
      if (!this.farmId) {
        this.router.navigate(["/app/farm"]);
      } else {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 0);
        this.fetchFarm();
      }
    });

    // Parcelas form setup
    this.parcelaForm = this.fb.group({
      plotName: ["", Validators.required],
      plotDescription: ["", Validators.required],
      plotType: ["", Validators.required],
      currentUsage: ["", Validators.required],
      geometryPolygon: ["", Validators.required],
    });
    // Fetch parcelas for the map and crops for the parcelas tab
    if (this.farmId) {
      this.parcelasService.getParcelas(this.farmId).subscribe({
        next: (res) => {
          this.parcelasInfo = res.data || [];
          this.parcelasGeoJSON = (res.data || [])
            .map((p) =>
              typeof p.geometryPolygon === "string" ? p.geometryPolygon : ""
            )
            .filter((g) => !!g);
        },
        error: () => {
          this.parcelasGeoJSON = [];
        },
      });
      // Fetch crops for the parcelas tab
      this.gestionCropsLoading = true;
      this.cropService.getCrops(1, 100).subscribe({
        next: (res) => {
          this.gestionCrops = res.data || [];
          this.gestionCropsLoading = false;
        },
        error: () => {
          this.gestionCrops = [];
          this.gestionCropsLoading = false;
        },
      });
    }
  }

  onImageError(event: Event) {
    const img = event?.target as HTMLImageElement;
    const placeholder =
      "https://blocks.astratic.com/img/general-img-landscape.png";
    if (img && img.src !== placeholder) {
      img.src = placeholder;
    }
  }

  onClickEditarParcela() {
    this.editParcelaMode = true;
    this.parcelaToEdit = this.selectedParcela;
    this.displayDialog = true;
    // Patch form with parcela data
    if (this.parcelaForm && this.parcelaToEdit) {
      this.parcelaForm.patchValue({
        plotName: this.parcelaToEdit.plotName || "",
        plotDescription: this.parcelaToEdit.plotDescription || "",
        plotType: this.parcelaToEdit.plotType || "",
        currentUsage: this.parcelaToEdit.currentUsage || "",
        geometryPolygon: this.parcelaToEdit.geometryPolygon || "",
      });
    }
  }

  showCreateParcelaDialog() {
    this.parcelaForm.reset();
    this.editParcelaMode = false;
    this.parcelaToEdit = null;
    this.displayDialog = true;
  }

  handleSave() {
    if (this.parcelaForm.invalid) {
      this.parcelaForm.markAllAsTouched();
      return;
    }
    this.parcelasLoading = true;
    const parcelaData = {
      ...this.parcelaForm.value,
      isActive: true, // Always active on creation
    };
    const farmId = this.farm?.id || this.farmId;
    if (this.editParcelaMode && this.parcelaToEdit) {
      // Call updateParcela (to be implemented in service)
      this.parcelasService.updateParcela(
        farmId as string,
        this.parcelaToEdit.id,
        parcelaData,
      ).subscribe({
        next: () => {
          this.displayDialog = false;
          this.parcelasLoading = false;
          this.editParcelaMode = false;
          this.parcelaToEdit = null;
          this.messageService.add({
            severity: "success",
            summary: "Parcela editada",
            detail: "La parcela fue editada exitosamente.",
          });
          this.getParcelas();
        },
        error: () => {
          this.parcelasLoading = false;
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo editar la parcela.",
          });
        },
      });
    } else {
      // Create mode
      this.parcelasService.createParcela(farmId as string, parcelaData)
        .subscribe({
          next: () => {
            this.displayDialog = false;
            this.parcelasLoading = false;
            this.messageService.add({
              severity: "success",
              summary: "Parcela creada",
              detail: "La parcela fue creada exitosamente.",
            });
            this.getParcelas();
          },
          error: () => {
            this.parcelasLoading = false;
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "No se pudo crear la parcela.",
            });
          },
        });
    }
  }

  ngAfterViewInit(): void {
    if (this.showEditFarmModal) {
      setTimeout(() => this.initEditFarmMap(), 300);
    }
  }

  openEditFarmModal() {
    if (!this.farm) return;
    this.editFarmForm = this.fb.group({
      farmName: [this.farm.farmName, Validators.required],
      farmCountry: [this.farm.farmCountry || "Costa Rica", Validators.required],
      farmStateProvince: [this.farm.farmStateProvince, Validators.required],
      farmOtherDirections: [this.farm.farmOtherDirections, Validators.required],
      farmLocation: [this.farm.farmLocation, Validators.required],
      farmSize: [this.farm.farmSize, [
        Validators.required,
        Validators.pattern(/^[0-9]+(\.[0-9]+)?$/),
      ]],
      farmMeasureUnit: [this.farm.farmMeasureUnit, Validators.required],
      active: [this.farm.active, Validators.required],
      soilPh: [this.technicalInfo?.soilPh ?? ""],
      soilNutrients: [this.technicalInfo?.soilNutrients ?? ""],
      irrigationSystem: [this.technicalInfo?.irrigationSystem ?? null],
      irrigationSystemType: [this.technicalInfo?.irrigationSystemType ?? ""],
      waterAvailable: [this.technicalInfo?.waterAvailable ?? null],
      waterUsageType: [this.technicalInfo?.waterUsageType ?? ""],
      fertilizerPesticideUse: [
        this.technicalInfo?.fertilizerPesticideUse ?? null,
      ],
    });
    // Do not forcibly mark as pristine; let Angular track changes naturally
    this.editFarmSubmitted = false;
    this.showEditFarmModal = true;
    setTimeout(() => {
      this.initEditFarmMap();
    }, 300);
  }

  closeEditFarmModal() {
    this.showEditFarmModal = false;
    if (this.editFarmMapInstance) {
      this.editFarmMapInstance.remove();
      this.editFarmMapInstance = null;
    }
  }

  private initEditFarmMap() {
    const mapContainer = document.getElementById("edit-farm-map");
    if (!mapContainer) return;
    if (this.editFarmMapInstance) {
      this.editFarmMapInstance.remove();
      this.editFarmMapInstance = null;
    }
    let lat = 9.7489, lng = -83.7534;
    if (this.farm?.farmLocation) {
      const coords = this.farm.farmLocation.split(",");
      if (coords.length === 2) {
        lat = parseFloat(coords[0]);
        lng = parseFloat(coords[1]);
      }
    }
    this.editFarmMapInstance = L.map(mapContainer).setView([lat, lng], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.editFarmMapInstance);
    const markerIcon = L.icon({
      iconUrl: "assets/leaflet/marker-icon.png",
      shadowUrl: "assets/leaflet/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    let marker: L.Marker | null = null;
    // Only the edit modal map uses a draggable marker
    if (this.farm?.farmLocation) {
      marker = L.marker([lat, lng], { draggable: true, icon: markerIcon, title: "Arrastre para mover" })
        .addTo(this.editFarmMapInstance);
      marker.on("dragend", (event: any) => {
        const position = event.target.getLatLng();
        this.editFarmForm.patchValue({
          farmLocation: `${position.lat.toFixed(6)},${position.lng.toFixed(6)}`,
        });
        this.editFarmForm.markAsDirty();
      });
    }
    this.editFarmMapInstance.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { draggable: true, icon: markerIcon, title: "Arrastre para mover" })
          .addTo(this.editFarmMapInstance!);
        marker.on("dragend", (event: any) => {
          const position = event.target.getLatLng();
          this.editFarmForm.patchValue({
            farmLocation: `${position.lat.toFixed(6)},${
              position.lng.toFixed(6)
            }`,
          });
          this.editFarmForm.markAsDirty();
        });
      }
      this.editFarmForm.patchValue({
        farmLocation: `${lat.toFixed(6)},${lng.toFixed(6)}`,
      });
      this.editFarmForm.markAsDirty();
    });
  }

  submitEditFarm() {
    this.editFarmSubmitted = true;
    if (this.editFarmForm.invalid) return;
    this.editFarmLoading = true;
    const formValue = this.editFarmForm.value;
    // Helper to normalize 'No sé' or empty values
    const normalize = (val: any) =>
      (val === null || val === "No sé") ? null : val;

    const farm = {
      ...this.farm,
      id: this.farm?.id ?? 0,
      createdAt: this.farm?.createdAt ?? null,
      updatedAt: new Date().toISOString(),
      farmName: formValue.farmName,
      farmCountry: formValue.farmCountry,
      farmStateProvince: formValue.farmStateProvince,
      farmOtherDirections: formValue.farmOtherDirections,
      farmLocation: formValue.farmLocation,
      farmSize: formValue.farmSize,
      farmMeasureUnit: formValue.farmMeasureUnit,
      active: formValue.active,
    };
    const technicalInfo = {
      ...this.technicalInfo,
      id: this.technicalInfo?.id ?? 0,
      createdAt: this.technicalInfo?.createdAt ?? null,
      updatedAt: new Date().toISOString(),
      soilPh: normalize(formValue.soilPh),
      soilNutrients: normalize(formValue.soilNutrients),
      irrigationSystem: formValue.irrigationSystem,
      irrigationSystemType: normalize(formValue.irrigationSystemType),
      waterAvailable: formValue.waterAvailable,
      waterUsageType: normalize(formValue.waterUsageType),
      fertilizerPesticideUse: formValue.fertilizerPesticideUse,
    };
    this.farmService.updateFarm(farm, technicalInfo).subscribe({
      next: () => {
        this.editFarmLoading = false;
        this.showEditFarmModal = false;
        this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: "Finca editada correctamente.",
        });
        this.fetchFarm();
      },
      error: () => {
        this.editFarmLoading = false;
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo editar la finca.",
        });
      },
    });
  }

  fetchAnimalGroups() {
    if (!this.farmId) return;
    this.animalGroupsLoading = true;
    this.animalGroupsError = "";
    this.animalService.getAnimalGroups(this.farmId).subscribe({
      next: (groups) => {
        this.animalGroups = groups.data || [];
        this.animalGroupsLoading = false;
      },
      error: () => {
        this.animalGroupsError =
          "No se pudieron cargar los grupos de animales.";
        this.animalGroupsLoading = false;
      },
    });
  }

  fetchFarm() {
    if (!this.farmId) return;
    this.loading = true;
    this.farmService.farmById(this.farmId).subscribe({
      next: (res) => {
        this.farm = res.data.farm;
        this.technicalInfo = res.data.technicalInfo;
        this.loading = false;
        this.fetchAnimalGroups();
      },
      error: (err) => {
        this.error = "No se pudo cargar la finca.";
        this.loading = false;
      },
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDeleteFarm() {
    if (!this.farmId) return;
    this.deleteLoading = true;
    this.farmService.removeFarm(this.farmId).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.router.navigate(["/app/farm"]);
        this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: "Finca eliminada correctamente.",
        });
      },
      error: () => {
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.error = "No se pudo eliminar la finca.";
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo eliminar la finca.",
        });
      },
    });
  }

  groupSearchTerm: string = "";
  filteredAnimalGroups(): IGroupAnimal[] {
    if (!this.groupSearchTerm) return this.animalGroups;

    const term = this.groupSearchTerm.toLowerCase();
    return this.animalGroups.filter((group) =>
      group.groupName.toLowerCase().includes(term)
    );
  }

  isSearchingLocation = false;
  private debounceTimer: any;
  onLocationInput(): void {
    this.isSearchingLocation = true;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searchLocation();
    }, 500);
  }

  async searchLocation(): Promise<void> {
    const query = this.searchLocationInput.nativeElement.value;
    if (!query || query.length < 3) {
      this.isSearchingLocation = false;
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${
      encodeURIComponent(
        query,
      )
    }`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLatLng: L.LatLng = L.latLng(parseFloat(lat), parseFloat(lon));
        this.editFarmMapInstance?.setView(newLatLng, 14);
        this.addOrMoveMarker(newLatLng);
        this.editFarmForm
          .get("farmLocation")
          ?.setValue(`${newLatLng.lat.toFixed(6)},${newLatLng.lng.toFixed(6)}`);
        this.editFarmForm.markAsDirty();
      }
    } catch (error) {
      console.error("Error en la búsqueda de ubicación:", error);
    } finally {
      this.isSearchingLocation = false;
    }
  }

  private addOrMoveMarker(latlng: L.LatLng | [number, number]): void {
    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.marker = L.marker(latlng, {
        draggable: true,
        icon: this.defaultIcon,
      }).addTo(this.editFarmMapInstance!);
      this.marker.on("dragend", (e) => {
        const newLatLng = e.target.getLatLng();
        this.editFarmForm
          .get("farmLocation")
          ?.setValue(`${newLatLng.lat.toFixed(6)},${newLatLng.lng.toFixed(6)}`);
        this.editFarmForm.markAsDirty();
      });
    }
  }

}
