import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { IFarmResponse } from "../../../services/farm.service";
import * as L from "leaflet";

@Component({
  selector: "app-farm-card",
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: "./farm-card.component.html",
  styleUrls: ["./farm-card.component.scss"],
})
export class FarmCardComponent implements AfterViewInit, OnDestroy {
  @Input() farmData!: IFarmResponse;
  @Output() viewDetails = new EventEmitter<number>();
  @ViewChild("mapContainer") mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private readonly defaultIcon = L.icon({
    iconUrl: "assets/leaflet/marker-icon.png",
    shadowUrl: "assets/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    if (!this.mapContainer) return;

    const location = this.farmData?.farm?.farmLocation;

    if (!location || typeof location !== "string" || !location.includes(",")) {
      this.mapContainer.nativeElement.innerHTML = `<div class="no-map-message">Ubicación no registrada</div>`;
      return;
    }

    if (this.map) {
      this.map.remove();
    }

    setTimeout(() => {
      const [lat, lng] = this.farmData.farm.farmLocation.split(",").map(Number);
      if (isNaN(lat) || isNaN(lng)) {
        this.mapContainer.nativeElement.innerHTML =
          '<div class="no-map-message">Ubicación inválida</div>';
        return;
      }

      this.map = L.map(this.mapContainer.nativeElement, {
        center: [lat, lng],
        zoom: 13,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        this.map
      );
      L.marker([lat, lng], { icon: this.defaultIcon }).addTo(this.map);
    }, 0);
  }
}
