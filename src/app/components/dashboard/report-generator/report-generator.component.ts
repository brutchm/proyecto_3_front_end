import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { ButtonModule } from "primeng/button";
import {
  AVAILABLE_REPORTS,
  ReportDefinition,
} from "../../../interfaces/report-generator.interface";
import { IFarm } from "../../../services/farm.service";
import { ICrop } from "../../../interfaces/crop.interface";

@Component({
  selector: "app-report-generator",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
  ],
  templateUrl: "./report-generator.component.html",
  styleUrls: ["./report-generator.component.scss"],
})
export class ReportGeneratorComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() farms: IFarm[] = [];
  @Input() crops: ICrop[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() generate = new EventEmitter<any>();

  reportForm!: FormGroup;
  availableReports = AVAILABLE_REPORTS;
  selectedReport: ReportDefinition | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reportType: [null, Validators.required],
      dateRange: [null],
      farmId: [null],
      cropId: [null],
    });

    this.reportForm.get("reportType")?.valueChanges.subscribe((reportValue) => {
      this.onReportTypeChange(reportValue);
    });
  }

  onReportTypeChange(reportValue: any): void {
    this.selectedReport =
      this.availableReports.find((r) => r.value === reportValue) || null;
    this.updateValidators();
  }

  updateValidators(): void {
    const dateRangeControl = this.reportForm.get("dateRange");
    const farmIdControl = this.reportForm.get("farmId");
    const cropIdControl = this.reportForm.get("cropId");

    dateRangeControl?.clearValidators();
    farmIdControl?.clearValidators();
    cropIdControl?.clearValidators();

    if (this.selectedReport?.params.dateRange) {
      dateRangeControl?.setValidators(Validators.required);
    }
    if (this.selectedReport?.params.farmId) {
      farmIdControl?.setValidators(Validators.required);
    }
    if (this.selectedReport?.params.cropId) {
      cropIdControl?.setValidators(Validators.required);
    }

    dateRangeControl?.updateValueAndValidity();
    farmIdControl?.updateValueAndValidity();
    cropIdControl?.updateValueAndValidity();
  }

  onGenerate(): void {
    if (this.reportForm.valid) {
      this.generate.emit(this.reportForm.value);
      this.closeDialog();
    }
  }

  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}
