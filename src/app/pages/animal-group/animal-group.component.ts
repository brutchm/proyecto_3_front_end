import { Component, inject, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AnimalService } from "../../services/animal.service";
import { IAnimal, IGroupAnimal } from "../../interfaces/group-animal.interface";
import { CommonModule } from "@angular/common";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DataViewModule } from "primeng/dataview";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from "primeng/inputtext";
import { SkeletonModule } from "primeng/skeleton";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { LoaderComponent } from "../../components/loader/loader.component";
import { ModalComponent } from "../../components/modal/modal.component";
import { ModalService } from "../../services/modal.service";
import { FarmService } from "../../services/farm.service";

@Component({
  standalone: true,
  selector: "app-animal-group",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DataViewModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    SkeletonModule,
    FormsModule,
    LoaderComponent,
    ModalComponent,
  ],
  templateUrl: "./animal-group.component.html",
  styleUrls: ["./animal-group.component.scss"],
})
export class AnimalGroupComponent {
  // Properties
  farmId: string | null = null;
  groupId: string | null = null;
  groupAnimal: IGroupAnimal | null = null;
  loading = false;
  error: string | null = null;
  farmName: string = "";
  showEditModal = false;
  editGroupForm!: FormGroup;
  editGroupSubmitted = false;
  editGroupLoading = false;
  showDeleteModal = false;
  deleteLoading = false;
  animalForm!: FormGroup;
  animalSubmitted = false;
  animalLoading = false;
  userId: number | null = null;
  animals: IAnimal[] = [];
  searchTerm: string = "";
  public modalService: ModalService = inject(ModalService);
  @ViewChild("editAnimalsModal")
  public editAnimalsModal: any;
  showDeleteAnimalModal = false;
  animalToDelete: IAnimal | null = null;
  private messageService = inject(MessageService);

  // Constructor
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animalService: AnimalService,
    private fb: FormBuilder,
    private farmService: FarmService,
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
        this.fetchAnimals();
      }
    });

    if (this.farmId) {
      this.farmService.farmById(this.farmId).subscribe({
        next: (res) => {
          this.farmName = res.data.farm.farmName;
        },
        error: (err) => {
          console.error("Error al cargar la finca", err);
        },
      });
    }
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

    this.animalForm = this.fb.group({
      id: [null],
      species: [this.groupAnimal?.species || "", Validators.required],
      breed: ["", Validators.required],
      count: [1, [Validators.required, Validators.min(1)]],
    });
  }

  onEdit() {
    if (!this.groupAnimal) return;
    this.editGroupForm = this.fb.group({
      groupName: [this.groupAnimal.groupName, Validators.required],
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
    if (this.editGroupForm.invalid || !this.farmId || !this.groupId) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail:
          "Por favor complete todos los campos obligatorios correctamente antes de guardar.",
      });
      return;
    }
    this.editGroupLoading = true;
    const formValue = this.editGroupForm.value;
    this.animalService.updateAnimalGroup(this.farmId, this.groupId, formValue)
      .subscribe({
        next: (res) => {
          this.editGroupLoading = false;
          this.showEditModal = false;
          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Grupo de animales actualizado correctamente.",
          });
          this.fetchGroupAnimal();
        },
        error: () => {
          this.editGroupLoading = false;
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo actualizar el grupo de animales.",
          });
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
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo eliminar el grupo de animales.",
        });
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

  submitAnimalForm() {
    this.animalSubmitted = true;

    if (this.animalForm.invalid || !this.farmId || !this.groupId) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Por favor complete todos los campos correctamente.",
      });
      return;
    }

    this.animalLoading = true;

    const animalData = {
      //user: { id: this.userId },
      farm: { id: Number(this.farmId) },
      species: this.animalForm.value.species,
      breed: this.animalForm.value.breed,
      count: this.animalForm.value.count,
      animalGroup: { id: Number(this.groupId) },
      isActive: true,
    };
    this.animalService.createAnimal({ farmId: this.farmId, ...animalData })
      .subscribe({
        next: () => {
          this.animalLoading = false;
          this.animalForm.reset();
          this.animalSubmitted = false;
          this.fetchAnimals();
          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Animal registrado exitosamente.",
          });
        },
        error: () => {
          this.animalLoading = false;
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo registrar el animal.",
          });
        },
      });
  }

  fetchAnimals() {
    if (!this.farmId || !this.groupId) return;

    this.animalService.getAnimalsByGroup(this.farmId, this.groupId).subscribe({
      next: (res) => {
        this.animals = res.data;
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar los animales del grupo.",
        });
      },
    });
  }

  closeEditAnimalModal(): void {
    this.animalForm.reset();
    this.modalService.closeAll();
  }

  openEditAnimalsModal(animal: IAnimal) {
    this.animalForm.patchValue({
      id: animal.id,
      species: animal.species,
      breed: animal.breed,
      count: animal.count,
    });
    this.modalService.displayModal("lg", this.editAnimalsModal);
  }

  updateSelectedAnimal() {
    this.animalSubmitted = true;

    if (this.animalForm.invalid || !this.farmId) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Por favor complete todos los campos correctamente.",
      });
      return;
    }

    const formValue = this.animalForm.value;
    const animalId = this.animalForm.value.id;

    if (!animalId) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo obtener el ID del animal a actualizar.",
      });
      return;
    }

    this.animalLoading = true;

    const updatedAnimal = {
      species: formValue.species,
      breed: formValue.breed,
      count: formValue.count,
      animalGroup: { id: Number(this.groupId) },
      isActive: true,
    };

    this.animalService.updateAnimal(this.farmId, animalId, updatedAnimal)
      .subscribe({
        next: () => {
          this.animalLoading = false;
          this.animalForm.reset();
          this.animalSubmitted = false;
          this.modalService.closeAll();
          this.fetchAnimals();
          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Animal actualizado correctamente.",
          });
        },
        error: () => {
          this.animalLoading = false;
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo actualizar el animal.",
          });
        },
      });
  }

  // ...existing code...
  openDeleteAnimalModal(animal: IAnimal) {
    this.animalToDelete = animal;
    this.showDeleteAnimalModal = true;
  }
  closeDeleteAnimalModal() {
    this.animalToDelete = null;
    this.showDeleteAnimalModal = false;
  }
  confirmDeleteAnimal() {
    if (!this.animalToDelete || !this.farmId) return;

    this.animalLoading = true;

    this.animalService.deleteAnimal(this.farmId, this.animalToDelete.id)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Animal eliminado correctamente.",
          });
          this.fetchAnimals();
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo eliminar el animal.',",
          });
        },
        complete: () => {
          this.animalLoading = false;
          this.closeDeleteAnimalModal();
        },
      });
  }

  //Filtro para buscar animales asociados a un grupo en especifico
  get filteredAnimals(): IAnimal[] {
    if (!this.searchTerm) return this.animals;
    const term = this.searchTerm.toLowerCase();
    return this.animals.filter((animal) =>
      animal.breed?.toLowerCase().includes(term) ||
      animal.species.toLowerCase().includes(term)
    );
  }
}
