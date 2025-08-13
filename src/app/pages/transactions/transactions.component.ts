import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";

import {
  ITransaction,
  ITransactionPayload,
} from "../../interfaces/transaction.interface";
import { TransactionService } from "../../services/transaction.service";
import { TransactionListComponent } from "../../components/transaction/transaction-list/transaction-list.component";
import { TransactionFormComponent } from "../../components/transaction/transaction-form/transaction-form.component";
import { FarmService, IFarm } from "../../services/farm.service";
import { CropService } from "../../services/crop.service";
import { ICrop } from "../../interfaces/crop.interface";
import { TablePageEvent } from "primeng/table";

@Component({
  selector: "app-transactions",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TransactionListComponent,
    TransactionFormComponent,
  ],
  templateUrl: "./transactions.component.html",
  styleUrls: ["./transactions.component.scss"],
  providers: [ConfirmationService, MessageService],
})
export class TransactionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private farmService = inject(FarmService);
  private cropService = inject(CropService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  transactions: ITransaction[] = [];
  transactionForm!: FormGroup;

  farms: IFarm[] = [];
  crops: ICrop[] = [];

  displayDialog: boolean = false;
  isEditMode: boolean = false;
  currentTransactionId?: number;

  isLoading: boolean = true;
  totalRecords: number = 0;
  rows: number = 10;

  private transactionToDelete: ITransaction | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdownData();
    this.loadTransactions({ first: 0, rows: this.rows });
  }

  /**
   * Carga las transacciones de forma perezosa (lazy loading) desde el backend.
   * Este método es llamado por el evento (onLazyLoad) de la tabla de PrimeNG.
   * @param event - Evento de carga perezosa que contiene información de paginación.
   */
  loadTransactions(
    event: TablePageEvent | { first: number; rows: number }
  ): void {
    this.isLoading = true;
    const page = event.first / event.rows + 1;
    const size = event.rows;

    this.transactionService.getTransactions(page, size).subscribe({
      next: (response) => {
        this.transactions = response.data;
        this.totalRecords = response["meta"].totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar las transacciones.",
        });
      },
    });
  }

  /**
   * Carga los datos necesarios para los dropdowns del formulario.
   */
  loadDropdownData(): void {
    this.farmService
      .getMyFarms()
      .subscribe((res) => (this.farms = res.data.map((item) => item.farm)));
    this.cropService
      .getCrops(1, 1000)
      .subscribe((res) => (this.crops = res.data));
  }

  initializeForm(): void {
    this.transactionForm = this.fb.group({
      transactionType: [null, Validators.required],
      farmId: [null, Validators.required],
      cropId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      measureUnit: ["", Validators.required],
      pricePerUnit: [null, [Validators.required, Validators.min(0)]],
      totalValue: [null, Validators.required],
      transactionDate: [new Date(), Validators.required],
    });
  }

  showCreateDialog(): void {
    this.isEditMode = false;
    this.currentTransactionId = undefined;
    this.initializeForm();
    this.displayDialog = true;
  }

  showEditDialog(transaction: ITransaction): void {
    this.isEditMode = true;
    this.currentTransactionId = transaction.id;
    this.transactionForm.patchValue({
      ...transaction,
      farmId: transaction.farmId,
      cropId: transaction.cropId,
      transactionDate: new Date(transaction.transactionDate),
    });
    this.displayDialog = true;
  }

  handleSave(): void {
    if (this.transactionForm.invalid) {
      this.messageService.add({
        severity: "warn",
        summary: "Atención",
        detail: "Por favor, completa los campos requeridos.",
      });
      return;
    }

    const formValue = this.transactionForm.value;

    const transactionPayload: ITransactionPayload = {
      transactionType: formValue.transactionType,
      quantity: formValue.quantity,
      measureUnit: formValue.measureUnit,
      pricePerUnit: formValue.pricePerUnit,
      totalValue: formValue.totalValue,
      transactionDate: formValue.transactionDate.toISOString(),
      farm: formValue.farmId ? { id: formValue.farmId } : null,
      crop: formValue.cropId ? { id: formValue.cropId } : null,
    };

    const operation = this.isEditMode
      ? this.transactionService.update(
          this.currentTransactionId!,
          transactionPayload
        )
      : this.transactionService.create(transactionPayload);

    const summary = this.isEditMode
      ? "Transacción Actualizada"
      : "Transacción Creada";

    operation.subscribe({
      next: (savedTransaction) => {
        this.messageService.add({
          severity: "success",
          summary: "Éxito",
          detail: summary,
        });
        this.displayDialog = false;
        this.loadTransactions({ first: 0, rows: this.rows });
      },
      error: (err) =>
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "La operación falló.",
        }),
    });
  }

  /**
   *
   * @param transaction - La transacción a eliminar.
   * Este método muestra un diálogo de confirmación antes de proceder con la eliminación.
   */
  handleDelete(transaction: ITransaction): void {
    this.transactionToDelete = transaction;
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar esta transacción?`,
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      key: "deleteTransaction", // Usamos la key definida en el HTML
    });
  }

  /**
   * Se ejecuta al confirmar la eliminación.
   * @param transaction - La transacción a eliminar.
   */
  onConfirmDelete(): void {
    this.confirmationService.close();
    if (this.transactionToDelete && this.transactionToDelete.id) {
      this.transactionService.delete(this.transactionToDelete.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Éxito",
            detail: "Transacción eliminada.",
          });
          this.loadTransactions({ first: 0, rows: this.rows });
          this.transactionToDelete = null;
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo eliminar la transacción.",
          });
          this.transactionToDelete = null;
        },
      });
    }
  }

  /**
   * @param transaction - La transacción que se iba a eliminar.
   * Este método cierra el diálogo de confirmación y limpia la transacción a eliminar.
   */
  onRejectDelete(): void {
    this.confirmationService.close();
    this.transactionToDelete = null;
  }
}
