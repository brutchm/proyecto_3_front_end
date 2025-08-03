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
  @Input() parcelasGeoJSON: string[] = [];
  @Output() coordinatesChange = new EventEmitter<string>();
  @Output() clickFigures = new EventEmitter<number>();
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private parcelasLayer: L.LayerGroup | null = null;

  ngOnInit(): void {
    this.initMap();
  }

  ngOnChanges(): void {
    this.refreshMap();
    this.drawParcelas();
  }

  public refreshMap(): void {
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        this.drawParcelas();
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
      this.drawParcelas();
    }, 0);
  }

  private drawParcelas(): void {
    if (!this.map) return;
    if (this.parcelasLayer) {
      this.map.removeLayer(this.parcelasLayer);
    }
    this.parcelasLayer = L.layerGroup();
    if (this.parcelasGeoJSON && this.parcelasGeoJSON.length > 0) {
      this.parcelasGeoJSON.forEach((geoStr, idx) => {
        if (geoStr) {
          try {
            const geo = JSON.parse(geoStr);
            let latlngs = [];
            if (geo.type === 'Polygon' && Array.isArray(geo.coordinates)) {
              latlngs = geo.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]);
            } else if (geo.type === 'MultiPolygon' && Array.isArray(geo.coordinates)) {
              latlngs = geo.coordinates[0][0].map(([lng, lat]: [number, number]) => [lat, lng]);
            }
            if (latlngs.length > 0) {
              const polygon = L.polygon(latlngs, { color: 'red', weight: 3, fillOpacity: 0.3 });
              polygon.on('click', (e) => {
                this.clickFigures.emit(idx);
              });
              polygon.addTo(this.parcelasLayer!);
            }
          } catch (e) {}
        }
      });
    }
    this.parcelasLayer.addTo(this.map);
  }
}
