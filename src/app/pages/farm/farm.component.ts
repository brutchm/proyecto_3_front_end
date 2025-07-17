import { Component, OnInit, AfterViewChecked, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../components/loader/loader.component';
import { FarmService } from '../../services/farm.service';
import * as L from 'leaflet';
@Component({
  selector: 'app-farm',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.scss']
})
export class FarmComponent implements OnInit, AfterViewChecked {
  public loading = false;
  public error: string = '';
  public farms: any = null;
  private mapInitialized: boolean[] = [];
  private cdRef = inject(ChangeDetectorRef);
  private mapInstances: (L.Map | null)[] = [];

  constructor(public farmService: FarmService, private router: Router) {}
  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToFarmDetails(farmId: string) {
    this.router.navigate(['/app/farm-details'], { queryParams: { id: farmId } });
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
