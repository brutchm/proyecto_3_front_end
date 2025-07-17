import { Component, OnInit, AfterViewChecked, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../components/loader/loader.component';
import { FarmService } from '../../services/farm.service';
import * as L from 'leaflet';
import { ModalComponent } from '../../components/modal/modal.component';
// import { LocationMapComponent } from '../../components/farm-map/farm-map.component';
@Component({
  selector: 'app-farm',
  standalone: true,
  imports: [CommonModule, LoaderComponent, FormsModule, ModalComponent, ReactiveFormsModule],
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.scss', './farm-details.component.scss']
})
export class FarmComponent implements OnInit, AfterViewChecked {
  public loading = false;
  public error: string = '';
  public farms: any = null;
  public showCreateFarmModal = false;
  public createFarmForm!: FormGroup;
  public createFarmSubmitted = false;
  public createFarmLoading = false;
  private mapInitialized: boolean[] = [];
  private cdRef = inject(ChangeDetectorRef);
  private mapInstances: (L.Map | null)[] = [];

  constructor(public farmService: FarmService, private router: Router, private fb: FormBuilder) {}
  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToFarmDetails(farmId: string) {
    this.router.navigate(['/app/farm-details'], { queryParams: { id: farmId } });
  }

  openCreateFarmModal() {
    this.createFarmForm = this.fb.group({
      farmName: ['', Validators.required],
      farmCountry: ['', Validators.required],
      farmStateProvince: ['', Validators.required],
      farmOtherDirections: ['', Validators.required],
      farmLocation: ['', Validators.required],
      farmSize: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
      farmMeasureUnit: ['', Validators.required],
      active: [true, Validators.required]
    });
    this.createFarmSubmitted = false;
    this.showCreateFarmModal = true;
    setTimeout(() => {
      this.initCreateFarmMap();
    }, 300);
  }

  private createFarmMapInstance: L.Map | null = null;

  private initCreateFarmMap() {
    const mapContainer = document.getElementById('create-farm-map');
    if (!mapContainer) return;
    if (this.createFarmMapInstance) {
      this.createFarmMapInstance.remove();
      this.createFarmMapInstance = null;
    }
    const defaultLat = 9.7489, defaultLng = -83.7534; // Costa Rica center as default
    this.createFarmMapInstance = L.map(mapContainer).setView([defaultLat, defaultLng], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.createFarmMapInstance);
    let marker: L.Marker | null = null;
    this.createFarmMapInstance.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      if (marker) marker.setLatLng([lat, lng]);
      else marker = L.marker([lat, lng]).addTo(this.createFarmMapInstance!);
      this.createFarmForm.patchValue({ farmLocation: `${lat.toFixed(6)},${lng.toFixed(6)}` });
    });
  }

  closeCreateFarmModal() {
    this.showCreateFarmModal = false;
  }

 setLocationFromMap(event: any) {
  console.log(event);
  const coords = typeof event === 'string' ? event : event.detail || '';
  this.createFarmForm.patchValue({ farmLocation: coords });
}

  submitCreateFarm() {
    this.createFarmSubmitted = true;
    if (this.createFarmForm.invalid) return;
    this.createFarmLoading = true;
    const farmData = {
      ...this.createFarmForm.value,
      technicalInformation: undefined // Optional, can be added later
    };
    this.farmService.createFarm(farmData).subscribe({
      next: () => {
        this.createFarmLoading = false;
        this.closeCreateFarmModal();
        this.fetchFarms();
      },
      error: () => {
        this.createFarmLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.fetchFarms();
  }

  ngAfterViewChecked(): void {
    if (this.farms && this.farms.length > 0) {
      this.farms.forEach((item: any, i: number) => {
        if (!this.mapInitialized[i]) {
          const mapId = `farm-map-${i}`;
          const mapContainer = document.getElementById(mapId);
          if (mapContainer) {
            mapContainer.innerHTML = '';
            if (this.mapInstances[i]) {
              this.mapInstances[i]?.remove();
              this.mapInstances[i] = null;
            }
            const loc = item.farm.farmLocation;
            let lat = 0, lng = 0;
            if (loc && loc.includes(',')) {
              [lat, lng] = loc.split(',').map((coord: string) => parseFloat(coord.trim()));
            }
            if (!isNaN(lat) && !isNaN(lng)) {
              this.mapInstances[i] = L.map(mapContainer).setView([lat, lng], 14);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(this.mapInstances[i]!);
              L.marker([lat, lng]).addTo(this.mapInstances[i]!)
                .bindPopup(`<b>${item.farm.farmName}</b><br>${item.farm.farmCountry}, ${item.farm.farmStateProvince}`);
              this.mapInitialized[i] = true;
              this.cdRef.detectChanges();
            }
          }
        }
      });
    }
  }

  fetchFarms() {
    this.loading = true;
    this.error = '';
    this.farmService.getMyFarms().subscribe({
      next: (response: any) => {
        this.farms = response.data;
        this.mapInitialized = new Array(this.farms.length).fill(false);
        this.mapInstances = new Array(this.farms.length).fill(null);
        this.loading = false;
      },
      error: (err: any) => {
        if (err && err.status === 403) {
          this.error = 'No tienes permisos para ver las fincas. Por favor inicia sesión nuevamente.';
        } else {
          this.error = 'Error fetching farms';
        }
        this.loading = false;
      }
    });
  }
}
