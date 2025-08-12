import { CommonModule } from '@angular/common';
import {ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CropListComponent } from '../../components/crop/crop-list/crop-list.component';
import { CropFormComponent } from '../../components/crop/crop-form/crop-form.component';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
      CommonModule, ReactiveFormsModule, ButtonModule, ToastModule,
      ConfirmDialogModule, DialogModule, ToolbarModule, TooltipModule,
      CropListComponent, CropFormComponent, RouterModule
    ],
  templateUrl: './landingPage.component.html',
  styleUrls: ['./landingPage.component.scss']
})
export class LandingPageComponent { 

    galleryImages = [
        {
          src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
          alt: 'Finca 1',
          description: 'Amplias áreas verdes para cultivo sostenible'
        },
        {
          src: 'https://images.unsplash.com/photo-1598514982945-88243d4b6fd7',
          alt: 'Finca 2',
          description: 'Cuidado y mantenimiento de parcelas con tecnología'
        },
        {
          src: 'https://images.unsplash.com/photo-1562564055-71e051d33c19',
          alt: 'Finca 3',
          description: 'Producción ganadera en entornos controlados'
        }
      ];
      

}
