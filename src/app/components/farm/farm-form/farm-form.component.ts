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

@Component({
  selector: "app-farm-form",
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
  templateUrl: "./farm-form.component.html",
  styleUrls: ["./farm-form.component.scss"],
})
export class FarmFormComponent implements AfterViewInit, OnDestroy {
  @Input() form!: FormGroup;
  @Output() save = new EventEmitter<void>();
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
    "hectáreas",
    "manzanas",
    "acres",
    "m²",
    "km²",
    "cuadras",
  ];
  irrigationTypes: string[] = ["Goteo", "Aspersión", "Superficie", "Otro"];
  waterUsageTypes: string[] = ["Riego", "Consumo animal", "Procesos", "Otro"];

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

  private initMap(): void {
    if (!this.mapContainer) return;

    let lat = 9.7489;
    let lng = -83.7534;

    this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      this.map
    );

    this.map.on("click", (e: L.LeafletMouseEvent) => {
      this.addOrMoveMarker(e.latlng);
      this.form
        .get("farmLocation")
        ?.setValue(`${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`);
      this.form.markAsDirty();
    });
  }

  private addOrMoveMarker(latlng: L.LatLng | [number, number]): void {
    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.marker = L.marker(latlng, {
        draggable: true,
        icon: this.defaultIcon,
      }).addTo(this.map!);
      this.marker.on("dragend", (e) => {
        const newLatLng = e.target.getLatLng();
        this.form
          .get("farmLocation")
          ?.setValue(`${newLatLng.lat.toFixed(6)},${newLatLng.lng.toFixed(6)}`);
        this.form.markAsDirty();
      });
    }
  }
}
