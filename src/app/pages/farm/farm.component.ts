import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "../../components/loader/loader.component";
import { FarmService } from "../../services/farm.service";
import * as L from "leaflet";
import { ModalComponent } from "../../components/modal/modal.component";

// import { LocationMapComponent } from '../../components/farm-map/farm-map.component';
@Component({
  selector: "app-farm",
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./farm.component.html",
  styleUrls: ["./farm.component.scss", "./farm-details.component.scss"],
})
export class FarmComponent implements OnInit, AfterViewInit {
  public loading = false;
  public error: string = "";
  public farms: any = null;
  public showCreateFarmModal = false;
  public createFarmForm!: FormGroup;
  public createFarmSubmitted = false;
  public createFarmLoading = false;
  private mapInitialized: boolean[] = [];
  private mapInstances: (L.Map | null)[] = [];

  constructor(
    public farmService: FarmService,
    private router: Router,
    private fb: FormBuilder,
  ) {}
  goToLogin() {
    this.router.navigate(["/login"]);
  }

  goToFarmDetails(farmId: string) {
    this.router.navigate(["/app/farm-details"], {
      queryParams: { id: farmId },
    });
  }

  // Costa Rica provinces
  public provinces: string[] = [
    'San José',
    'Alajuela',
    'Cartago',
    'Heredia',
    'Guanacaste',
    'Puntarenas',
    'Limón'
  ];
  // Common measure units in Costa Rica
  public measureUnits: string[] = [
    'hectáreas',
    'manzanas',
    'acres',
    'm²',
    'km²',
    'cuadras'
  ];

  openCreateFarmModal() {
    this.createFarmForm = this.fb.group({
      farmName: ["", Validators.required],
      farmCountry: ["Costa Rica", Validators.required],
      farmStateProvince: [this.provinces[0], Validators.required],
      farmOtherDirections: ["", Validators.required],
      farmLocation: ["", Validators.required],
      farmSize: ["", [
        Validators.required,
        Validators.pattern(/^[0-9]+(\.[0-9]+)?$/),
      ]],
      farmMeasureUnit: [this.measureUnits[0], Validators.required],
      active: [true, Validators.required],
      // Technical details fields
      soilPh: [""],
      soilNutrients: [""],
      irrigationSystem: [null],
      irrigationSystemType: [""],
      waterAvailable: [null],
      waterUsageType: [""],
      fertilizerPesticideUse: [null],
    });
    this.createFarmSubmitted = false;
    this.showCreateFarmModal = true;
    setTimeout(() => {
      this.initCreateFarmMap();
    }, 300);
  }

  private createFarmMapInstance: L.Map | null = null;

  private initCreateFarmMap() {
    const mapContainer = document.getElementById("create-farm-map");
    if (!mapContainer) return;
    if (this.createFarmMapInstance) {
      this.createFarmMapInstance.remove();
      this.createFarmMapInstance = null;
    }
    const defaultLat = 9.7489, defaultLng = -83.7534; // Costa Rica center as default
    this.createFarmMapInstance = L.map(mapContainer).setView([
      defaultLat,
      defaultLng,
    ], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.createFarmMapInstance);
    let marker: L.Marker | null = null;
    const markerIcon = L.icon({
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    this.createFarmMapInstance.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(this.createFarmMapInstance!);
        marker.on('dragend', (event: any) => {
          const position = event.target.getLatLng();
          this.createFarmForm.patchValue({
            farmLocation: `${position.lat.toFixed(6)},${position.lng.toFixed(6)}`,
          });
        });
      }
      this.createFarmForm.patchValue({
        farmLocation: `${lat.toFixed(6)},${lng.toFixed(6)}`,
      });
    });
  }

  closeCreateFarmModal() {
    this.showCreateFarmModal = false;
  }

  submitCreateFarm() {
    this.createFarmSubmitted = true;
    if (this.createFarmForm.invalid) return;
    this.createFarmLoading = true;
    const formValue = this.createFarmForm.value;
    // Helper to normalize 'No sé' or empty values
    const normalize = (val: any) => (val === null || val === 'No sé') ? null : val;

    const farm = {
      id: 0, // Placeholder, backend should assign real id
      createdAt: new Date().toISOString(), // Placeholder, backend should assign real date
      updatedAt: new Date().toISOString(), // Placeholder, backend should assign real date
      farmName: formValue.farmName,
      farmCountry: formValue.farmCountry,
      farmStateProvince: formValue.farmStateProvince,
      farmOtherDirections: formValue.farmOtherDirections,
      farmLocation: formValue.farmLocation,
      farmSize: formValue.farmSize,
      farmMeasureUnit: formValue.farmMeasureUnit,
      active: formValue.active,
    };

    const technicalInfoObj = {
      id: 0,
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
      isActive: true,
      soilPh: normalize(formValue.soilPh),
      soilNutrients: normalize(formValue.soilNutrients),
      irrigationSystem: formValue.irrigationSystem === null ? null : formValue.irrigationSystem,
      irrigationSystemType: normalize(formValue.irrigationSystemType),
      waterAvailable: formValue.waterAvailable === null ? null : formValue.waterAvailable,
      waterUsageType: normalize(formValue.waterUsageType),
      fertilizerPesticideUse: formValue.fertilizerPesticideUse === null ? null : formValue.fertilizerPesticideUse,
    };
    // If all technical fields are null, send technicalInfo as null
    const allTechNull = Object.entries(technicalInfoObj).every(([key, val]) => {
      if (["id", "createdAt", "updatedAt", "isActive"].includes(key)) return true;
      return val === null || val === '';
    });
    const technicalInfo = allTechNull ? null : technicalInfoObj;
    this.farmService.createFarm(farm, technicalInfo).subscribe({
      next: () => {
        this.createFarmLoading = false;
        this.closeCreateFarmModal();
        this.fetchFarms();
      },
      error: () => {
        this.createFarmLoading = false;
      },
    });
  }

  ngOnInit(): void {
    this.fetchFarms();
  }

  ngAfterViewInit(): void {
    this.initFarmCardsMaps();
  }

  private initFarmCardsMaps() {
    if (this.farms && this.farms.length > 0) {
      setTimeout(() => {
        this.farms.forEach((item: any, i: number) => {
          const mapId = `farm-map-${i}`;
          const mapContainer = document.getElementById(mapId);
          if (mapContainer && !this.mapInitialized[i]) {
            mapContainer.innerHTML = "";
            if (this.mapInstances[i]) {
              this.mapInstances[i]?.remove();
              this.mapInstances[i] = null;
            }
            const loc = item.farm.farmLocation;
            let lat = 0, lng = 0;
            if (loc && loc.includes(",")) {
              [lat, lng] = loc.split(",").map((coord: string) =>
                parseFloat(coord.trim())
              );
            }
            if (!isNaN(lat) && !isNaN(lng)) {
              this.mapInstances[i] = L.map(mapContainer).setView(
                [lat, lng],
                14,
              );
              L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                  attribution: "&copy; OpenStreetMap contributors",
                },
              ).addTo(this.mapInstances[i]!);
              L.marker([lat, lng]).addTo(this.mapInstances[i]!);
              this.mapInitialized[i] = true;
            }
          }
        });
      }, 0);
    }
  }

  fetchFarms() {
    this.loading = true;
    this.error = "";
    this.farmService.getMyFarms().subscribe({
      next: (response: any) => {
        this.farms = response.data;
        this.mapInitialized = new Array(this.farms.length).fill(false);
        this.mapInstances = new Array(this.farms.length).fill(null);
        this.loading = false;
        setTimeout(() => this.initFarmCardsMaps(), 0);
      },
      error: (err: any) => {
        if (err && err.status === 403) {
          this.error =
            "No tienes permisos para ver las fincas. Por favor inicia sesión nuevamente.";
        } else {
          this.error = "Error fetching farms";
        }
        this.loading = false;
      },
    });
  }
}
