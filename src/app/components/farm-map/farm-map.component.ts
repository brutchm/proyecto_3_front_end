import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
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
  @Output() coordinatesChange = new EventEmitter<string>();
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngOnInit(): void {
    this.initMap();
  }

  public refreshMap(): void {
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  private initMap(): void {
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
      const markerIcon = L.icon({
        iconUrl: 'assets/leaflet/marker-icon.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      this.marker = L.marker([lat, lng], { draggable: false, icon: markerIcon }).addTo(this.map);
    }, 0);
  }
}
