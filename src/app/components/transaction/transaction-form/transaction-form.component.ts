import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { CalendarModule } from "primeng/calendar";
import {
  MeasureUnit,
  TransactionType,
} from "../../../interfaces/transaction.interface";
import { IFarm } from "../../../services/farm.service";
import { ICrop } from "../../../interfaces/crop.interface";

@Component({
  selector: "app-transaction-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    CalendarModule,
  ],
  templateUrl: "./transaction-form.component.html",
  styleUrls: ["./transaction-form.component.scss"],
})
export class TransactionFormComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() isEditMode: boolean = false;
  @Input() farms: IFarm[] = [];
  @Input() crops: ICrop[] = [];
  @Output() save = new EventEmitter<void>();

  transactionTypes: { label: string; value: TransactionType }[] = [];
  measureUnits: { label: string; value: MeasureUnit }[] = [];

  ngOnInit(): void {
    this.transactionTypes = Object.values(TransactionType).map((type) => ({
      label: this.formatTypeLabel(type),
      value: type,
    }));
    this.measureUnits = Object.values(MeasureUnit).map((unit) => ({
      label: this.formatUnitLabel(unit),
      value: unit,
    }));
  }

  onSave(): void {
    this.save.emit();
  }

  /**
   * Se llama directamente desde el HTML cada vez que el usuario escribe
   * en los campos de cantidad o precio.
   */
  calculateTotalValue(): void {
    const quantity = this.form.get("quantity")?.value || 0;
    const pricePerUnit = this.form.get("pricePerUnit")?.value || 0;
    const total = quantity * pricePerUnit;

    this.form.get("totalValue")?.setValue(total);
  }

  private formatTypeLabel(type: string): string {
    return (
      type.replace("_", " ").charAt(0).toUpperCase() +
      type.replace("_", " ").slice(1).toLowerCase()
    );
  }

  private formatUnitLabel(unit: string): string {
    return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
  }
}
