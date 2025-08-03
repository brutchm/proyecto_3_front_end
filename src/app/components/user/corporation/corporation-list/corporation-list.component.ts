import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ICorporation } from "../../../../interfaces/corporation.interface";
import { AuthService } from "../../../../services/auth.service";
import * as L from 'leaflet';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { debounceTime, Subject } from "rxjs";
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
      CommonModule,
      FormsModule
    ]
})
export class ListCorporationListComponent implements AfterViewChecked, OnChanges {
  private _pListCorporationList: ICorporation[] = [];
  private leafletMaps: L.Map[] = [];


  @Input()
set pListCorporationList(value: ICorporation[]) {
  this._pListCorporationList = value;
  this.mapsInitialized = false;
  this.corporationsOriginal = value;
}

get pListCorporationList(): ICorporation[] {
  return this._pListCorporationList;
}
ngOnChanges(changes: SimpleChanges): void {
  if (changes['pListCorporationList']) {
    this.mapsInitialized = false;

 
    setTimeout(() => {
      if (this.mapContainers && this.mapContainers.length > 0) {
        this.initMaps();
        this.mapsInitialized = true;
      }
    }, 300);
  }
}

    @ViewChildren('mapContainer', { read: ElementRef }) mapContainers!: QueryList<ElementRef>;

    private mapsInitialized = false;
    ngAfterViewChecked(): void {
      if (!this.mapsInitialized && this.mapContainers.length > 0) {
        this.mapsInitialized = true;
        setTimeout(() => this.initMaps(), 200);
      }
    }
      get corporationsWithValidLocation(): ICorporation[] {

        return this.pListCorporationList.filter(c => this.isValidCoordinates(c.businessLocation));
      }

      private initMaps(): void {
        //Limpiar mapas previos
        this.leafletMaps.forEach(m => m.remove());
        this.leafletMaps = [];
      
       const validCorporations = this.corporationsToDisplay.filter(c => this.isValidCoordinates(c.businessLocation));

        this.mapContainers.forEach((containerRef, index) => {
          const corporation = validCorporations[index];
          if (!corporation) return;
      
          const container = containerRef.nativeElement as HTMLElement;
      
          container.innerHTML = '';
          container.style.height = '150px';
          container.style.width = '100%';
      
          const [latStr, lngStr] = corporation.businessLocation!.split(',');
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
      
          const map = L.map(container).setView([lat, lng], 13);
      
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
      
          L.marker([lat, lng]).addTo(map);
      
          setTimeout(() => {
            map.invalidateSize();
          }, 300);
      
          this.leafletMaps.push(map);
          this.corporationsToDisplay.filter(c => this.isValidCoordinates(c.businessLocation));
        });
        
      }
       
      ngOnDestroy(): void {
        this.mapsInitialized = false;
        this.leafletMaps.forEach(m => m.remove());
        this.leafletMaps = [];
      }
      
      isValidCoordinates(location: string | null | undefined): boolean {
        if (!location) return false;
      
        const coords = location.split(',');
        if (coords.length !== 2) return false;
      
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
      
        return !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
      }
      
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


    this.filteredCorporations = this.pListCorporationList;
    this.searchTermSubject.pipe(
      debounceTime(500)
    ).subscribe(term => {
      this.searchTerm = term;
      this.mapsInitialized = false;
  
      setTimeout(() => {
        if (this.mapContainers && this.mapContainers.length > 0) {
          this.initMaps();
          this.mapsInitialized = true;
        }
      }, 300);
    });
    
  }


  filteredCorporations: ICorporation[] = [];
  public searchTermSubject = new Subject<string>();
  public searchTerm: string = '';
  public corporationsOriginal: ICorporation[] = [];

  //para mostrar o no la paginación de la lista
  @Input() showAll: boolean = false;
  @Output() toggleShowAllEvent = new EventEmitter<void>();
  
  toggleShowAll(): void {
    this.toggleShowAllEvent.emit();
    if(!this.showAll){//se borra el filtro cuando el boton muestra toda la info
      this.searchTerm = '';
    }
  }
  
  
  get corporationsToDisplay(): ICorporation[] {
    const term = this.searchTerm.trim().toLowerCase();
  
    return this.pListCorporationList.filter(corp =>
      corp.businessName?.toLowerCase().includes(term) ||
      corp.businessCountry?.toLowerCase().includes(term) ||
      corp.businessStateProvince?.toLowerCase().includes(term) ||
      corp.businessId?.toLowerCase().includes(term)
    );
  }

  onSearchTermChange() {
    this.mapsInitialized = false;
    setTimeout(() => {
      if (this.mapContainers && this.mapContainers.length > 0) {
        this.initMaps();
        this.mapsInitialized = true;
      }
    }, 300);
  }
  

}