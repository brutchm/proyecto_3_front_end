
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FarmService, IFarm } from '../../services/farm.service';
import { LocationMapComponent } from '../../components/farm-map/farm-map.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import * as L from 'leaflet';

@Component({
  selector: 'app-farm-details',
  standalone: true,
  imports: [CommonModule, LocationMapComponent, LoaderComponent, ModalComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './farm-details.component.html',
  styleUrl: './farm-details.component.scss',
})
export class FarmDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('deleteFarmModal') deleteFarmModal!: ElementRef;
  showDeleteModal = false;
  deleteLoading = false;

  farmId: string | null = null;
  farm: IFarm | null = null;
  technicalInfo: any = null;
  loading = false;
  error: string = '';

  provinces: string[] = [
    'San José',
    'Alajuela',
    'Cartago',
    'Heredia',
    'Guanacaste',
    'Puntarenas',
    'Limón'
  ];
  measureUnits: string[] = [
    'hectáreas',
    'manzanas',
    'acres',
    'm²',
    'km²',
    'cuadras'
  ];

  showEditFarmModal = false;
  editFarmForm!: FormGroup;
  editFarmSubmitted = false;
  editFarmLoading = false;
  private editFarmMapInstance: L.Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private farmService: FarmService,
    private fb: FormBuilder
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.farmId = params.get('id');
      if (!this.farmId) {
        this.router.navigate(['/app/farm']);
      } else {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
        this.fetchFarm();
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Optionally, initialize map if modal is open
    if (this.showEditFarmModal) {
      setTimeout(() => this.initEditFarmMap(), 300);
    }
  }

  openEditFarmModal() {
    if (!this.farm) return;
    this.editFarmForm = this.fb.group({
      farmName: [this.farm.farmName, Validators.required],
      farmCountry: [this.farm.farmCountry || 'Costa Rica', Validators.required],
      farmStateProvince: [this.farm.farmStateProvince, Validators.required],
      farmOtherDirections: [this.farm.farmOtherDirections, Validators.required],
      farmLocation: [this.farm.farmLocation, Validators.required],
      farmSize: [this.farm.farmSize, [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
      farmMeasureUnit: [this.farm.farmMeasureUnit, Validators.required],
      active: [this.farm.active, Validators.required],
      soilPh: [this.technicalInfo?.soilPh ?? ''],
      soilNutrients: [this.technicalInfo?.soilNutrients ?? ''],
      irrigationSystem: [this.technicalInfo?.irrigationSystem ?? null],
      irrigationSystemType: [this.technicalInfo?.irrigationSystemType ?? ''],
      waterAvailable: [this.technicalInfo?.waterAvailable ?? null],
      waterUsageType: [this.technicalInfo?.waterUsageType ?? ''],
      fertilizerPesticideUse: [this.technicalInfo?.fertilizerPesticideUse ?? null],
    });
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
    const mapContainer = document.getElementById('edit-farm-map');
    if (!mapContainer) return;
    if (this.editFarmMapInstance) {
      this.editFarmMapInstance.remove();
      this.editFarmMapInstance = null;
    }
    let lat = 9.7489, lng = -83.7534;
    if (this.farm?.farmLocation) {
      const coords = this.farm.farmLocation.split(',');
      if (coords.length === 2) {
        lat = parseFloat(coords[0]);
        lng = parseFloat(coords[1]);
      }
    }
    this.editFarmMapInstance = L.map(mapContainer).setView([lat, lng], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.editFarmMapInstance);
    let marker: L.Marker | null = null;
    if (this.farm?.farmLocation) {
      marker = L.marker([lat, lng]).addTo(this.editFarmMapInstance);
    }
    this.editFarmMapInstance.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      if (marker) marker.setLatLng([lat, lng]);
      else marker = L.marker([lat, lng]).addTo(this.editFarmMapInstance!);
      this.editFarmForm.patchValue({
        farmLocation: `${lat.toFixed(6)},${lng.toFixed(6)}`,
      });
    });
  }

  submitEditFarm() {
    this.editFarmSubmitted = true;
    if (this.editFarmForm.invalid) return;
    this.editFarmLoading = true;
    const formValue = this.editFarmForm.value;
    // Helper to normalize 'No sé' or empty values
    const normalize = (val: any) => (val === null || val === 'No sé') ? null : val;

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
        this.fetchFarm();
      },
      error: () => {
        this.editFarmLoading = false;
        // Optionally show error
      }
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
      },
      error: (err) => {
        this.error = 'No se pudo cargar la finca.';
        this.loading = false;
      }
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
        this.router.navigate(['/app/farm']);
      },
      error: () => {
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.error = 'No se pudo eliminar la finca.';
      }
    });
  }
}
