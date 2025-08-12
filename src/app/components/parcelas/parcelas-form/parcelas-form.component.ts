import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { InputTextareaModule } from "primeng/inputtextarea";
import { AccordionModule } from "primeng/accordion";
import * as L from "leaflet";
import "leaflet-draw";

@Component({
  selector: "app-parcelas-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    AccordionModule,
  ],
  templateUrl: "./parcelas-form.component.html",
  styleUrls: ["./parcelas-form.component.scss"],
})
export class ParcelasFormComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = '';
  @Input() editMode: boolean = false;
  @Input() parcelasGeoJSON: string[] = [];
  @Input() form!: FormGroup;
  @Input() farmLocation: string | undefined | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild("mapContainer") mapContainer!: ElementRef<HTMLDivElement>;
  @ViewChild("searchLocationInput")
  searchLocationInput!: ElementRef<HTMLInputElement>;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private debounceTimer: any;
  private readonly defaultIcon = L.icon({
    iconUrl: "assets/leaflet/marker-icon.png",
    shadowUrl: "assets/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });


  plotTypes: string[] = ["Cultivo", "Ganadería", "Forestal", "Otro"];
  plotTypeOptions = this.plotTypes.map(type => ({ label: type, value: type }));

  // Store drawn polygon GeoJSON
  drawnPolygonGeoJson: any = null;

  isSearchingLocation = false;

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 150);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    clearTimeout(this.debounceTimer);
  }

  onSave(): void {
    this.save.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

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

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLatLng: L.LatLng = L.latLng(parseFloat(lat), parseFloat(lon));
        this.map?.setView(newLatLng, 14);
        this.addOrMoveMarker(newLatLng);
        this.form
          .get("farmLocation")
          ?.setValue(`${newLatLng.lat.toFixed(6)},${newLatLng.lng.toFixed(6)}`);
        this.form.markAsDirty();
      }
    } catch (error) {
      console.error("Error en la búsqueda de ubicación:", error);
    } finally {
      this.isSearchingLocation = false;
    }
  }

  private setupDrawDeleteListener(drawnItems: L.FeatureGroup) {
    if (!this.map) return;
    this.map.on('draw:deleted', () => {
      this.form.get('geometryPolygon')?.setValue('');
      this.drawnPolygonGeoJson = null;
    });
  }

  private initMap(): void {
    if (!this.mapContainer) return;

    // Center map on farmLocation input if available, else fallback to Costa Rica
    let lat = 9.7489;
    let lng = -83.7534;
    if (this.farmLocation) {
      const coords = this.farmLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        lat = coords[0];
        lng = coords[1];
      }
    }
    this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);

    // Enable Leaflet.draw
    const drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);
    let drawControl;
    if (this.editMode) {
      // Only enable edit controls, disable all draw options and hide delete
      drawControl = new (L as any).Control.Draw({
        edit: {
          featureGroup: drawnItems,
          remove: false // Hide the delete option in edit mode
        },
        draw: {
          polygon: false,
          marker: false,
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false
        }
      });
    } else {
      // Enable polygon creation in create mode
      drawControl = new (L as any).Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
          polygon: true,
          marker: false,
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false
        }
      });
    }
    this.map.addControl(drawControl);
    this.setupDrawDeleteListener(drawnItems);

    // In edit mode, only show the selected parcela's geometryPolygon for editing
    if (!this.editMode && this.parcelasGeoJSON && this.parcelasGeoJSON.length > 0) {
      this.parcelasGeoJSON.forEach((geoStr) => {
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
              L.polygon(latlngs, { color: 'red', weight: 3, fillOpacity: 0.3 }).addTo(this.map!);
            }
          } catch (e) {}
        }
      });
    }

    // If geometryPolygon exists, show it on map and enable editing
    const geometryPolygon = this.form.get('geometryPolygon')?.value;
    if (geometryPolygon) {
      try {
        const geo = JSON.parse(geometryPolygon);
        // Remove any existing layers in edit mode to avoid multiple polygons
        if (this.editMode) {
          drawnItems.clearLayers();
        }
        // Only add Polygon or MultiPolygon layers for editing
        let latlngs: [number, number][] = [];
        if (geo.type === 'Polygon' && Array.isArray(geo.coordinates)) {
          latlngs = geo.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]);
        } else if (geo.type === 'MultiPolygon' && Array.isArray(geo.coordinates)) {
          latlngs = geo.coordinates[0][0].map(([lng, lat]: [number, number]) => [lat, lng]);
        }
        if (latlngs.length > 0) {
          const polygonLayer = L.polygon(latlngs, { color: 'red', weight: 3, fillOpacity: 0.3 });
          polygonLayer.addTo(drawnItems);
          this.map.fitBounds(polygonLayer.getBounds());
        }
      } catch (e) {}
    }

    // Only allow creation in create mode
    if (!this.editMode) {
      this.map.on('draw:created', (event: any) => {
        const layer = event.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        const geojson = layer.toGeoJSON();
        this.drawnPolygonGeoJson = geojson;
        this.form.get('geometryPolygon')?.setValue(JSON.stringify(geojson.geometry));
        this.form.markAsDirty();
      });
      // In edit mode, update coordinates when polygon is edited
      this.map.on('draw:edited', (event: any) => {
        const layers = event.layers;
        layers.eachLayer((layer: any) => {
          if (layer instanceof L.Polygon) {
            const geojson = layer.toGeoJSON();
            this.drawnPolygonGeoJson = geojson;
            this.form.get('geometryPolygon')?.setValue(JSON.stringify(geojson.geometry));
            this.form.markAsDirty();
          }
        });
      });
    } else {
      // In edit mode, update coordinates when polygon is edited
      this.map.on('draw:edited', (event: any) => {
        const layers = event.layers;
        layers.eachLayer((layer: any) => {
          if (layer instanceof L.Polygon) {
            const geojson = layer.toGeoJSON();
            this.drawnPolygonGeoJson = geojson;
            this.form.get('geometryPolygon')?.setValue(JSON.stringify(geojson.geometry));
            this.form.markAsDirty();
          }
        });
      });
    }
  }

  private addOrMoveMarker(latlng: L.LatLng | [number, number]): void {
    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.marker = L.marker(latlng, {
        draggable: true,
        icon: this.defaultIcon,
      }).addTo(this.map!);
    }
  }
}
