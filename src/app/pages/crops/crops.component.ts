import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ICrop } from '../../interfaces/crop.interface';
import { CropService } from '../../services/crop.service';
import { CropListComponent } from '../../components/crop/crop-list/crop-list.component';
import { CropFormComponent } from '../../components/crop/crop-form/crop-form.component';
import { TablePageEvent } from 'primeng/table';
import { GlobalResponse } from '../../interfaces/GlobalResponse.interface';

/**
 * @class CropsComponent
 * @description
 * Componente "inteligente" que gestiona la página del CRUD de Cultivos.
 * Orquesta la comunicación con el servicio, el estado del formulario y la
 * interacción con los componentes de presentación (lista y formulario).
 */
@Component({
  selector: 'app-crops',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, ToastModule,
    ConfirmDialogModule, DialogModule, ToolbarModule, TooltipModule,
    CropListComponent, CropFormComponent
  ],
  templateUrl: './crops.component.html',
  styleUrls: ['./crops.component.scss']
})
export class CropsComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private cropService: CropService = inject(CropService);
  private messageService: MessageService = inject(MessageService);
  public confirmationService: ConfirmationService = inject(ConfirmationService);

  crops: ICrop[] = [];
  cropForm!: FormGroup;
  displayDialog: boolean = false;
  isEditMode: boolean = false;
  currentCropId?: number;

  isLoading: boolean = true;
  totalRecords: number = 0;
  rows: number = 5;

  private cropToDelete: ICrop | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadCrops({ first: 0, rows: this.rows });
  }

  loadCrops(event?: { first: number, rows: number }): void {
    this.isLoading = true;
    const page = event ? (event.first / event.rows) + 1 : 1;
    const size = event ? event.rows : this.rows;

    this.cropService.getCrops(page, size).subscribe({
      next: (response: GlobalResponse<ICrop[]>) => {
        this.crops = response.data;
        this.totalRecords = response['meta'].totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los cultivos.' });
      }
    });
  }

  initializeForm(): void {
    this.cropForm = this.fb.group({
      cropName: ['', Validators.required],
      cropType: [''],
      cropPicture: [''],
      customCropType: [''], 
      cropVariety: ['']
    });

    this.cropForm.get('cropType')?.valueChanges.subscribe(value => {
      if (value !== 'Otro') {
        this.cropForm.get('customCropType')?.reset('');
      }
    });
  }

  showCreateDialog(): void {
    this.isEditMode = false;
    this.cropForm.reset();
    this.currentCropId = undefined;
    this.displayDialog = true;
  }

  showEditDialog(crop: ICrop): void {
    this.isEditMode = true;
    this.currentCropId = crop.id;
    this.cropForm.patchValue(crop);
    this.displayDialog = true;
  }

  handleSave(): void {
    if (this.cropForm.invalid) {
      this.cropForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, completa los campos requeridos.' });
      return;
    }

    const cropData = this.cropForm.value;
    const operation = this.isEditMode && this.currentCropId
      ? this.cropService.update(this.currentCropId, cropData)
      : this.cropService.create(cropData);
      
    const summary = this.isEditMode ? 'Cultivo Actualizado' : 'Cultivo Creado';

    operation.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: summary });
        this.finalizeSave();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'La operación no pudo ser completada.' })
    });
  }
  
  finalizeSave(): void {
    this.displayDialog = false;
    this.loadCrops();
  }

  /**
   * @method handleDelete
   * @description
   * Prepara el estado para la eliminación y muestra el diálogo de confirmación.
   * @param crop - El cultivo que se desea eliminar.
   */
  handleDelete(crop: ICrop): void {
    this.cropToDelete = crop;

    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el cultivo "<strong>${crop.cropName}</strong>"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      key: 'deleteCrop'
    });
  }

  /**
   * @method onConfirmDelete
   * @description
   * Se ejecuta cuando el usuario hace clic en "Confirmar" en el diálogo.
   * Contiene la lógica de negocio que antes estaba en el callback 'accept'.
   */
  onConfirmDelete(): void {
    this.confirmationService.close();

    if (this.cropToDelete && this.cropToDelete.id) {
      this.cropService.delete(this.cropToDelete.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cultivo eliminado correctamente.' });
          this.loadCrops();
          this.cropToDelete = null;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo eliminar el cultivo.' });
          this.cropToDelete = null;
        }
      });
    }
  }

  /**
   * @method onRejectDelete
   * @description
   * Se ejecuta cuando el usuario hace clic en "Cancelar" en el diálogo.
   */
  onRejectDelete(): void {
    this.confirmationService.close();
    this.cropToDelete = null;
  }
}
