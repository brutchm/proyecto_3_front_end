import { Component, inject, AfterViewChecked, ChangeDetectorRef, effect } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements AfterViewChecked {
  public profileService = inject(ProfileService);
  public hasValidLocation = false;
  private mapInitialized = false;
  private cdRef = inject(ChangeDetectorRef);
  private mapInstance: L.Map | null = null;

  constructor() {
    this.profileService.getUserInfoSignal();
    effect(() => {
      const user = this.profileService.user$();

      this.hasValidLocation = false;
      this.mapInitialized = false;
      const existingMap = document.getElementById('map');
      if (existingMap) {
        existingMap.innerHTML = '';
      }
    });
  }

  ngAfterViewChecked(): void {
    const user = this.profileService.user$();
    const location = user?.businessLocation;
  
    if (!this.mapInitialized && location && location.includes(',')) {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
  
      if (!isNaN(lat) && !isNaN(lng)) {
        const mapContainer = document.getElementById('map');
  
        if (mapContainer) {
          this.hasValidLocation = true;
          this.cdRef.detectChanges();

          if (this.mapInstance) {
            this.mapInstance.remove(); 
            this.mapInstance = null;
          }

          this.mapInstance = L.map(mapContainer).setView([lat, lng], 15);
  
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(this.mapInstance);
  
          L.marker([lat, lng]).addTo(this.mapInstance)
            .bindPopup('Mi ubicación')
            .openPopup();
  
          this.mapInitialized = true;
        }
      }
    }
  }
  
}
