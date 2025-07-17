import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FarmService, IFarm } from '../../services/farm.service';
import { LocationMapComponent } from '../../components/farm-map/farm-map.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-farm-details',
  standalone: true,
  imports: [CommonModule, LocationMapComponent, LoaderComponent, ModalComponent],
  templateUrl: './farm-details.component.html',
  styleUrl: './farm-details.component.scss',
})
export class FarmDetailsComponent {
  @ViewChild('deleteFarmModal') deleteFarmModal!: ElementRef;
  showDeleteModal = false;
  deleteLoading = false;

  farmId: string | null = null;
  farm: IFarm | null = null;
  technicalInfo: any = null;
  loading = false;
  error: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private farmService: FarmService) {
    this.route.queryParamMap.subscribe(params => {
      this.farmId = params.get('id');
      if (!this.farmId) {
        this.router.navigate(['/app/farm']);
      } else {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
        this.fetchFarm();
      }
    });
  }

  fetchFarm() {
    if (!this.farmId) return;
    this.loading = true;
    this.farmService.farmById(this.farmId).subscribe({
      next: (res) => {
        this.farm = res.data.farm;
        this.technicalInfo = res.data.technicalInfo;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la finca.';
        this.loading = false;
      }
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDeleteFarm() {
    if (!this.farmId) return;
    this.deleteLoading = true;
    this.farmService.removeFarm(this.farmId).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.router.navigate(['/app/farm']);
      },
      error: () => {
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.error = 'No se pudo eliminar la finca.';
      }
    });
  }
}
