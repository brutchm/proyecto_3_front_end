import { Component, NgModule } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AnimalService } from "../../services/animal.service";
import { AlertService } from "../../services/alert.service";
import { IGroupAnimal } from "../../interfaces/group-animal.interface";
import { CommonModule } from "@angular/common";

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { LoaderComponent } from "../../components/loader/loader.component";
import { ModalComponent } from "../../components/modal/modal.component";

@Component({
  standalone: true,
  selector: "app-animal-group",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
    ModalComponent,
  ],
  templateUrl: "./animal-group.component.html",
  styleUrls: ["./animal-group.component.scss"],
})
export class AnimalGroupComponent {
  farmId: string | null = null;
  groupId: string | null = null;
  groupAnimal: IGroupAnimal | null = null;
  loading = false;
  error: string | null = null;

  // Edit modal state
  showEditModal = false;
  editGroupForm!: FormGroup;
  editGroupSubmitted = false;
  editGroupLoading = false;

  // Delete modal state
  showDeleteModal = false;
  deleteLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animalService: AnimalService,
    private fb: FormBuilder,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.farmId = params.get("farmId");
      this.groupId = params.get("groupId");
      if (!this.farmId || !this.groupId) {
        this.router.navigate([
          this.router.url === "/app/animal-group" ? "/app/farm-details" : "..",
        ]);
      } else {
        this.fetchGroupAnimal();
      }
    });
  }

  fetchGroupAnimal() {
    if (!this.farmId || !this.groupId) return;
    this.loading = true;
    this.error = null;
    this.animalService.getAnimalGroupById(this.farmId, this.groupId).subscribe({
      next: (group) => {
        this.groupAnimal = group.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "No se pudo cargar el grupo de animales.";
        this.loading = false;
      },
    });
  }

  onEdit() {
    if (!this.groupAnimal) return;
    this.editGroupForm = this.fb.group({
      groupName: [this.groupAnimal.groupName, Validators.required],
      species: [this.groupAnimal.species, Validators.required],
      count: [this.groupAnimal.count, [Validators.required, Validators.min(1)]],
      measure: [this.groupAnimal.measure, Validators.required],
      productionType: [this.groupAnimal.productionType, Validators.required],
    });
    this.editGroupForm.markAsPristine();
    this.editGroupSubmitted = false;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  submitEditGroup() {
    this.editGroupSubmitted = true;
    console.log(this.editGroupForm);
    if (this.editGroupForm.invalid || !this.farmId || !this.groupId) {
      this.alertService.displayAlert(
        "error",
        "Por favor complete todos los campos obligatorios correctamente antes de guardar.",
        "center",
        "top",
        ["error-snackbar"],
      );
      return;
    }
    this.editGroupLoading = true;
    const formValue = this.editGroupForm.value;
    this.animalService.updateAnimalGroup(this.farmId, this.groupId, formValue)
      .subscribe({
        next: (res) => {
          this.editGroupLoading = false;
          this.showEditModal = false;
          this.alertService.displayAlert(
            "success",
            "Grupo de animales actualizado correctamente.",
            "center",
            "top",
            ["success-snackbar"],
          );
          this.fetchGroupAnimal();
        },
        error: () => {
          this.editGroupLoading = false;
          this.alertService.displayAlert(
            "error",
            "No se pudo actualizar el grupo de animales.",
            "center",
            "top",
            ["error-snackbar"],
          );
        },
      });
  }

  onRemove() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDeleteGroup() {
    if (!this.farmId || !this.groupId) return;
    this.deleteLoading = true;
    this.animalService.deleteAnimalGroup(this.farmId, this.groupId).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.router.navigate(["/app/farm-details"], {
          queryParams: { id: this.farmId },
        });
      },
      error: () => {
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.alertService.displayAlert(
          "error",
          "No se pudo eliminar el grupo de animales.",
          "center",
          "top",
          ["error-snackbar"],
        );
      },
    });
  }

  goBackToFarm() {
    if (this.farmId) {
      this.router.navigate(["/app/farm-details"], {
        queryParams: { id: this.farmId },
      });
    }
  }
}
