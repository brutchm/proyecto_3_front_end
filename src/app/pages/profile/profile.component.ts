import { Component, inject, AfterViewChecked, ChangeDetectorRef, effect } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { IUser } from '../../interfaces';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CountryEnum, GenderEnum, ProvinceEnum } from '../../enums/location.enum';
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DataView, DataViewModule } from "primeng/dataview";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from "primeng/inputtext";
import { SkeletonModule } from "primeng/skeleton";
import { DropdownModule } from 'primeng/dropdown';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule,
    DataViewModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    SkeletonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements AfterViewChecked {
  public profileService = inject(ProfileService);
  private cdRef = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);
  countryEnum = CountryEnum;
  provinceEnum = ProvinceEnum;
  countries = Object.values(CountryEnum);
  provinces = Object.values(ProvinceEnum);
  genderEnum = GenderEnum;
  gender = Object.values(GenderEnum);

  public hasValidLocation = false;
  private mapInitialized = false;
  private mapInstance: L.Map | null = null;
  private editableMarker: L.Marker | null = null;
  public isEditingMap = false;
  public isProfileCompletelyEmpty = false;
  originalUser: IUser = {} as IUser;
  hasChanges: boolean = false;

  editing: { [key: string]: boolean } = {};
  editableUser: IUser = {};

  formErrors: { [key: string]: boolean } = {};
  private messageService = inject(MessageService);

  isFieldInvalid(field: string): boolean {
    return this.formErrors[field];
  }

  hasErrors(): boolean {
    return Object.values(this.formErrors).some(error => error);
  }

updateErrorStatus(): void {
  const f = this.formErrors;
  const u = this.editableUser;
  const originalData = this.originalUser;
  const role = this.profileService.user$()?.role?.roleName;

  for (const key in f) {
    f[key] = false;
  }

  f['businessCountry'] = !u.businessCountry?.trim();
  f['businessStateProvince'] = !u.businessStateProvince?.trim();
  f['businessOtherDirections'] = false;
  if (role === 'CORPORATION') {
    f['businessName'] = !u.businessName?.trim();
    f['businessMission'] = !u.businessMission?.trim();
    f['businessVision'] = !u.businessVision?.trim();
    f['businessId'] = !u.businessId?.trim();
  } else {
    f['name'] = !u.name?.trim();
    f['userFirstSurename'] = !u.userFirstSurename?.trim();
    f['userSecondSurename'] = !u.userSecondSurename?.trim();
    f['userGender'] = !u.userGender?.trim();
    f['userPhoneNumber'] = !u.userPhoneNumber?.trim();
  }
  this.hasChanges = JSON.stringify(u) !== JSON.stringify(originalData);
}


  constructor() {
    this.profileService.getUserInfoSignal();

    effect(() => {
      const user = this.profileService.user$();

      if (!user.businessCountry?.trim()) {//en caso de que se registre nulo en la bd
        user.businessCountry = CountryEnum.COSTA_RICA;
      }
      this.editableUser = { ...user };
      this.originalUser = { ...user };

      this.hasValidLocation = false;
      this.mapInitialized = false;
      this.isEditingMap = false;

      const existingMap = document.getElementById('map');
      if (existingMap) existingMap.innerHTML = '';
      this.updateErrorStatus();
    });
     
  }

  enableMapEditing(): void {
    this.hasValidLocation = true;
    this.cdRef.detectChanges();

    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.renderMap();
        });
      });
    }, 0);
  }
  private renderMap(): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
  
    let lat = 9.7489;
    let lng = -83.7534;
  
    const location = this.editableUser.businessLocation;
    if (location && location.includes(',')) {
      const parts = location.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !parts.some(isNaN)) {
        lat = parts[0];
        lng = parts[1];
      }
    } else {
      // ubicación previa
      this.editableUser.businessLocation = `${lat}, ${lng}`;
    }
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  
    // Inicializar mapa
    this.mapInstance = L.map(mapContainer).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.mapInstance);
  
    // puntero editable
    this.editableMarker = L.marker([lat, lng], { draggable: true }).addTo(this.mapInstance);
    this.editableMarker.bindPopup('Arrastra para indicar tu ubicación').openPopup();
  
    this.editableMarker.on('dragend', () => {
      const position = this.editableMarker?.getLatLng();
      if (position) {
        const newLocation = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        this.editableUser.businessLocation = newLocation;
        this.updateErrorStatus();
      }
    });
  
    this.isEditingMap = true;
    this.mapInitialized = true;
  
    setTimeout(() => {
      this.mapInstance?.invalidateSize();
    }, 200);
  
    this.snackBar.open('Ahora puedes mover el marcador del mapa para editar tu ubicación.', 'Entendido', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }
  //para cuando agrego el mapa de forma manual con el boton
  initMapForEmptyLocation(): void {
    const defaultLat = 9.7489;
    const defaultLng = -83.7534;
    this.editableUser.businessLocation = `${defaultLat}, ${defaultLng}`;
    this.hasValidLocation = true;
    this.mapInitialized = false;

    this.cdRef.detectChanges();

    setTimeout(() => this.enableMapEditing(), 100);
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

          this.editableMarker = L.marker([lat, lng], { draggable: this.isEditingMap }).addTo(this.mapInstance);
          this.editableMarker.bindPopup('Mi ubicación').openPopup();

          this.mapInitialized = true;
        }
      }
    }
  }

  updateProfile() {
    const u = this.editableUser;
    if (!u.businessCountry?.trim()) {
      u.businessCountry = CountryEnum.COSTA_RICA;
    }
    const myUser: IUser = {
      id: u.id,
      name: u.name,
      userFirstSurename: u.userFirstSurename,
      userSecondSurename: u.userSecondSurename,
      userGender: u.userGender,
      userPhoneNumber: u.userPhoneNumber,
      userEmail: u.userEmail,
      businessName: u.businessName,
      businessMission: u.businessMission,
      businessVision: u.businessVision,
      businessId: u.businessId,
      businessCountry: u.businessCountry,
      businessStateProvince: u.businessStateProvince,
      businessOtherDirections: u.businessOtherDirections,
      businessLocation: u.businessLocation
    };

    this.profileService.editUser(myUser).subscribe({
      next: (response) => {
       this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: "Perfil actualizado con éxito.",
        });
        localStorage.setItem('auth_user', JSON.stringify(this.editableUser));
        this.profileService.getUserInfoSignal();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Error al actualizar perfil",
        });
      }
    });
  }
}
