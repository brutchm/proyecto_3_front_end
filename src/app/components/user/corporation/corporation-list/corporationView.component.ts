import { AfterViewInit, Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ICorporation } from "../../../../interfaces/corporation.interface";
import * as L from 'leaflet';
import { CountryEnum, ProvinceEnum } from "../../../../enums/location.enum";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});


@Component({
  selector: "app-corporation-view",
  templateUrl: "./corporationView.component.html",
  styleUrls: ["./corporationView.component.scss"],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
})
export class CorporationViewComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    const formData = this.form.getRawValue();
    const location = formData.businessLocation;
  
    if (!this.isValidCoordinates(location)) return;
  
    const [latStr, lngStr] = location.split(',');
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
  
    const map = L.map('map').setView([lat, lng], 13);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    L.marker([lat, lng]).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }
  
  isValidCoordinates(location: string | null | undefined): boolean {
    if (!location) return false;
  
    const coords = location.split(',');
    if (coords.length !== 2) return false;
  
    const lat = parseFloat(coords[0]);
    const lng = parseFloat(coords[1]);
  
    return !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  }
  public fb: FormBuilder = inject(FormBuilder);
  @Input() form!: FormGroup;
  @Output() callSaveMethod: EventEmitter<ICorporation> = new EventEmitter<ICorporation>();
  @Output() callUpdateMethod: EventEmitter<ICorporation> = new EventEmitter<ICorporation>();
  countryEnum = CountryEnum;
  provinceEnum = ProvinceEnum;
  countries = Object.values(CountryEnum);
  provinces = Object.values(ProvinceEnum);
  callSave() {
    const formData = this.form.getRawValue();

    let item: ICorporation = {
      id: formData.id,
      businessName: formData.businessName,
      businessMission: formData.businessMission,
      businessVision: formData.businessVision,
      businessId: formData.businessId,
      businessCountry: formData.businessCountry,
      businessStateProvince: formData.businessStateProvince,
      businessOtherDirections: formData.businessOtherDirections,
      businessLocation: formData.businessLocation,
      userEmail: formData.userEmail
    }


    if (this.form.controls['id'].value) {
      item.id = this.form.controls['id'].value;
    }
    if (item.id) {
      this.callUpdateMethod.emit(item);
    } else {
      this.callSaveMethod.emit(item);
    }

  }


}