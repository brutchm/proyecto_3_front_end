import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileCorporationService } from '../../../services/profileCorporation.service';

@Component({
    selector: 'app-profileCorporation',
    imports: [
        CommonModule
    ],
    templateUrl: './profileCorporation.component.html',
    styleUrl: './profileCorporation.component.scss'
})
export class ProfileCorporationComponent {
  public profileService = inject(ProfileCorporationService);

  constructor() {
    this.profileService.getUserInfoSignal();
  }
}
