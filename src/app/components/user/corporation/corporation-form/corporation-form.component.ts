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
  selector: "app-corporation-form",
  templateUrl: "./corporation-form.component.html",
  styleUrls: ["./corporation-form.component.scss"],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
})
export class CorporationFormComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    const map = L.map('map').setView([10.0, -84.0], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([10.0, -84.0], { draggable: true }).addTo(map);

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      this.form.controls['businessLocation'].setValue(`${position.lat.toFixed(6)},${position.lng.toFixed(6)}`);
    });
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
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
      name: formData.name,
      userFirstSurename: formData.userFirstSurename,
      userSecondSurename: formData.userSecondSurename,
      userGender: formData.userGender,
      userPhoneNumber: formData.userPhoneNumber,
      userEmail: formData.userEmail,
      userPassword: formData.userPassword || null,
      role: {
        id: 3,
        roleName: "CORPORATION"
      },
      isActive: formData.isActive !== undefined ? formData.isActive : true
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