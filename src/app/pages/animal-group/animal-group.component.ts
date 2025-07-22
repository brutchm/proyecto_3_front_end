import { Component, EventEmitter, inject, NgModule, Output, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AnimalService } from "../../services/animal.service";
import { AlertService } from "../../services/alert.service";
import { IAnimal, IGroupAnimal } from "../../interfaces/group-animal.interface";
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
import { ModalService } from "../../services/modal.service";
import { FarmService } from "../../services/farm.service";

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
  farmName: string = '';
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
    private farmService: FarmService
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
          console.error('Error al cargar la finca', err);
        }
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
      species: [this.groupAnimal?.species || '', Validators.required],
      breed: ['', Validators.required],
      count: [1, [Validators.required, Validators.min(1)]],
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

  

/*Animales*/
animalForm!: FormGroup;
animalSubmitted = false;
animalLoading = false;
userId: number | null = null;
submitAnimalForm() {
  this.animalSubmitted = true;

  if (this.animalForm.invalid || !this.farmId || !this.groupId) {
    this.alertService.displayAlert(
      "error",
      "Por favor complete todos los campos correctamente.",
      "center",
      "top",
      ["error-snackbar"]
    );
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
  console.log("user 2: "+this.userId)
  this.animalService.createAnimal({ farmId: this.farmId, ...animalData }).subscribe({
    next: () => {
      this.animalLoading = false;
      this.animalForm.reset();
      this.animalSubmitted = false;
     this.fetchAnimals();
      this.alertService.displayAlert(
        "success",
        "Animal registrado exitosamente.",
        "center",
        "top",
        ["success-snackbar"]
      );
    },
    error: () => {
      this.animalLoading = false;
      this.alertService.displayAlert(
        "error",
        "No se pudo registrar el animal.",
        "center",
        "top",
        ["error-snackbar"]
      );
    }
  });
}
animals: IAnimal[] = [];
fetchAnimals() {
  if (!this.farmId || !this.groupId) return;

  this.animalService.getAnimalsByGroup(this.farmId, this.groupId).subscribe({
    next: (res) => {
      this.animals = res.data;
      console.log("Animales del grupo:", res.data);
    },
    error: () => {
      this.alertService.displayAlert(
        "error",
        "No se pudieron cargar los animales del grupo.",
        "center",
        "top",
        ["error-snackbar"]
      );
    }
  });
}
  public modalService: ModalService = inject(ModalService);
@ViewChild('editAnimalsModal') public editAnimalsModal: any;
//  @Output() callUpdateModalMethod: EventEmitter<IAnimal> = new EventEmitter<IAnimal>();

  closeEditAnimalModal(): void {
    this.animalForm.reset();
    this.modalService.closeAll();
    
  }
  
  openEditAnimalsModal(animal: IAnimal) {
    console.log("openModal", animal);
    this.animalForm.patchValue({
      id: animal.id,
      species: animal.species,
      breed: animal.breed,
      count: animal.count
    })
    console.log("Editando animal:", animal.id);
    this.modalService.displayModal('lg', this.editAnimalsModal);
  }

  updateSelectedAnimal() {
    this.animalSubmitted = true;
  
    if (this.animalForm.invalid || !this.farmId) {
      this.alertService.displayAlert(
        "error",
        "Por favor complete todos los campos correctamente.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }
  
    const formValue = this.animalForm.value;
    const animalId = this.animalForm.value.id;

    console.log("animalId  :", animalId);
    if (!animalId) {
      this.alertService.displayAlert(
        "error",
        "No se pudo obtener el ID del animal a actualizar.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }
  
    this.animalLoading = true;
  
    const updatedAnimal = {
      species: formValue.species,
      breed: formValue.breed,
      count: formValue.count,
      animalGroup: { id: Number(this.groupId) },
      isActive: true
    };
  
    this.animalService.updateAnimal(this.farmId, animalId, updatedAnimal).subscribe({
      next: () => {
        this.animalLoading = false;
        this.animalForm.reset();
        this.animalSubmitted = false;
        this.modalService.closeAll();
        this.fetchAnimals();
        this.alertService.displayAlert(
          "success",
          "Animal actualizado correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
      },
      error: () => {
        this.animalLoading = false;
        this.alertService.displayAlert(
          "error",
          "No se pudo actualizar el animal.",
          "center",
          "top",
          ["error-snackbar"]
        );
      }
    });
  }
  


  showDeleteAnimalModal = false;
animalToDelete: IAnimal | null = null;
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

  this.animalService.deleteAnimal(this.farmId, this.animalToDelete.id).subscribe({
    next: () => {
      this.alertService.displayAlert(
        'success',
        'Animal eliminado correctamente.',
        'center',
        'top',
        ['success-snackbar']
      );
      this.fetchAnimals();
    },
    error: () => {
      this.alertService.displayAlert(
        'error',
        'No se pudo eliminar el animal.',
        'center',
        'top',
        ['error-snackbar']
      );
    },
    complete: () => {
      this.animalLoading = false;
      this.closeDeleteAnimalModal();
    }
  });
}

 /*deleteAnimal(animal: IAnimal) {
    const confirmDelete = window.confirm(`¿Estás seguro que deseas eliminar el animal "${animal.species}"?`);
  
    if (!confirmDelete) return;
  
    if (!this.farmId || !animal.id) {
      this.alertService.displayAlert(
        "error",
        "No se pudo identificar el animal a eliminar.",
        "center",
        "top",
        ["error-snackbar"]
      );
      return;
    }
  
    this.animalLoading = true;
  
    this.animalService.deleteAnimal(this.farmId, animal.id).subscribe({
      next: () => {
        this.animalLoading = false;
        this.alertService.displayAlert(
          "success",
          "Animal eliminado correctamente.",
          "center",
          "top",
          ["success-snackbar"]
        );
        this.fetchAnimals();
      },
      error: () => {
        this.animalLoading = false;
        this.alertService.displayAlert(
          "error",
          "No se pudo eliminar el animal.",
          "center",
          "top",
          ["error-snackbar"]
        );
      }
    });
  }
  */

}
