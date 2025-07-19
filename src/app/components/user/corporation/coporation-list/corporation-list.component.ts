import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, Output, QueryList, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ICorporation } from "../../../../interfaces/corporation.interface";
import { AuthService } from "../../../../services/auth.service";
import * as L from 'leaflet';
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: "app-listCorporation-list",
  templateUrl: "./corporation-list.component.html",
  styleUrls: ["./corporation-list.component.scss"],
  standalone: true,
    imports: [
      ReactiveFormsModule,
      CommonModule
    ]
})
export class ListCorporationListComponent implements AfterViewChecked {

    @ViewChildren('mapContainer', { read: ElementRef }) mapContainers!: QueryList<ElementRef>;

    private mapsInitialized = false;
    ngAfterViewChecked(): void {
      if (!this.mapsInitialized && this.mapContainers.length > 0) {
        this.mapsInitialized = true;
        // Espera a que los contenedores estén en el DOM
        setTimeout(() => this.initMaps(), 200);
      }
    }
      get corporationsWithValidLocation(): ICorporation[] {

        return this.pListCorporationList.filter(c => this.isValidCoordinates(c.businessLocation));
      }
      
      private initMaps(): void {
        const validCorporations = this.pListCorporationList.filter(c => this.isValidCoordinates(c.businessLocation));
      
        this.mapContainers.forEach((containerRef, index) => {
          const corporation = validCorporations[index];
          if (!corporation) {
            console.warn('No corporation found for map index:', index);
            return;
          }
      
          const container = containerRef.nativeElement as HTMLElement;
      
          // Limpiar contenido previo si se ha creado antes
          container.innerHTML = '';
          container.style.height = '150px';
          container.style.width = '100%';
      
          const [latStr, lngStr] = corporation.businessLocation!.split(',');
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
      
          console.log(`Initializing map at index ${index} for coords [${lat}, ${lng}]`);
      
          const map = L.map(container).setView([lat, lng], 13);
      
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
      
          L.marker([lat, lng]).addTo(map);
      
          // Muy importante: recalcula el tamaño del mapa después de montar
          setTimeout(() => {
            map.invalidateSize();
          }, 300);
        });
      }
      ngOnDestroy(): void {
        this.mapsInitialized = false;
      }
      
      isValidCoordinates(location: string | null | undefined): boolean {
        if (!location) return false;
      
        const coords = location.split(',');
        if (coords.length !== 2) return false;
      
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
      
        return !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
      }
      
  @Input() pListCorporationList: ICorporation[] = [];
  @Output() callUpdateModalMethod: EventEmitter<ICorporation> = new EventEmitter<ICorporation>();
  @Output() callDeleteMethod: EventEmitter<ICorporation> = new EventEmitter<ICorporation>();
  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe( data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ? data['authorities'] : []);
    });
  }

}