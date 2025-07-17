import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapContainer class="location-map"></div>`,
  styleUrl: './farm-map.component.scss',
})
export class LocationMapComponent implements OnInit {
  @Input() coordinates: string = '';
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;

  ngOnInit(): void {
    if (!this.coordinates) return;
    const [lat, lng] = this.coordinates.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return;
    setTimeout(() => {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [lat, lng],
        zoom: 13,
        scrollWheelZoom: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);
      L.marker([lat, lng]).addTo(this.map);
    }, 0);
  }
}
