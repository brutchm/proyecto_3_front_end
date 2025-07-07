import { AfterViewInit, Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ICorporation } from "../../../../interfaces/corporation.interface";
import * as L from 'leaflet';
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
  export class CorporationFormComponent implements AfterViewInit{
   
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

    callSave() {
        let item: ICorporation = {
            id: this.form.controls["id"]?.value,
            businessName: this.form.controls["businessName"].value,
            businessMission: this.form.controls["businessMission"].value,
            businessVision: this.form.controls["businessVision"].value,
            businessId: this.form.controls["businessId"].value,
            businessCountry: this.form.controls["businessCountry"].value,
            businessStateProvince: this.form.controls["businessStateProvince"].value,
            businessOtherDirections: this.form.controls["businessOtherDirections"].value,
            businessLocation: this.form.controls["businessLocation"].value,
            userName: this.form.controls["userName"].value,
            userFirstSurename: this.form.controls["userFirstSurename"].value,
            userSecondSurename: this.form.controls["userSecondSurename"].value,
            userGender: this.form.controls["userGender"].value,
            userPhoneNumber: this.form.controls["userPhoneNumber"].value,
            userEmail: this.form.controls["userEmail"].value,
            userPassword: this.form.controls["userPassword"].value,
            role: {
              id: 3, // Rol fijo para CORPORATION
              roleName: "CORPORATION"
            },
            isActive: this.form.controls["isActive"].value
          
        }

        if(this.form.controls['id'].value) {
          item.id = this.form.controls['id'].value;
        } 
        if(item.id) {
          this.callUpdateMethod.emit(item);
        } else {
          this.callSaveMethod.emit(item);
        }
      
      }


    }