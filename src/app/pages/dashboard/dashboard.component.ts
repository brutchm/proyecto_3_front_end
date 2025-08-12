import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";

import { KpiWidgetComponent } from "../../components/dashboard/kpi-widget/kpi-widget.component";
import { ReportGeneratorComponent } from "../../components/dashboard/report-generator/report-generator.component";
import { ChartWidgetComponent } from "../../components/dashboard/chart-widget/chart-widget.component";
import { TableReportViewerComponent } from "../../components/dashboard/table-report-viewer/table-report-viewer.component";
import { DashboardService } from "../../services/dashboard.service";
import { ReportService } from "../../services/report.service";
import { IDashboardSummary } from "../../interfaces/dashboard.interface";
import { FarmService, IFarm } from "../../services/farm.service";
import { CropService } from "../../services/crop.service";
import { ICrop } from "../../interfaces/crop.interface";
import {
  ReportDefinition,
  AVAILABLE_REPORTS,
  ReportType,
  IPlotYieldData,
  ICropYieldData,
  IIncomeVsExpensesData,
  ICropCostData,
  IOperationalCostData,
  IFarmCostData,
} from "../../interfaces/report-generator.interface";
import {
  IChartData,
  ICropYieldChartData,
  IDoughnutChartData,
} from "../../interfaces/chart.interface";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    KpiWidgetComponent,
    ChartWidgetComponent,
    ToastModule,
    ButtonModule,
    DialogModule,
    ReportGeneratorComponent,
    TableReportViewerComponent,
  ],
  providers: [MessageService],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private reportService = inject(ReportService);
  private farmService = inject(FarmService);
  private cropService = inject(CropService);
  private messageService = inject(MessageService);

  summary$: Observable<IDashboardSummary | null> | undefined;
  monthlyChartData$: Observable<IDoughnutChartData | null> | undefined;
  cropYieldData$: Observable<ICropYieldChartData | null> | undefined;

  displayReportGenerator = false;
  displayReportViewer = false;

  farms: IFarm[] = [];
  crops: ICrop[] = [];

  tabularReportData: any[] = [];
  tabularReportColumns: { field: string; header: string }[] = [];
  tabularReportTitle: string = "";

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadFilterData();
  }

  loadDashboardData(): void {
    this.summary$ = this.dashboardService.getSummary().pipe(
      catchError(() => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo obtener el resumen del dashboard.",
        });
        return of(null);
      })
    );
    this.monthlyChartData$ = this.dashboardService
      .getCurrentMonthChartData()
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudieron cargar los datos del gráfico.",
          });
          return of(null);
        })
      );
    this.cropYieldData$ = this.dashboardService.getTopCropYieldData().pipe(
      catchError(() => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar los datos de rendimiento.",
        });
        return of(null);
      })
    );
  }

  loadFilterData(): void {
    this.farmService
      .getMyFarms()
      .subscribe((res) => (this.farms = res.data.map((item) => item.farm)));
    this.cropService
      .getCrops(1, 1000)
      .subscribe((res) => (this.crops = res.data));
  }

  openReportGenerator(): void {
    this.displayReportGenerator = true;
  }

  handleReportGeneration(config: any): void {
    const reportDef: ReportDefinition | undefined = AVAILABLE_REPORTS.find(
      (r) => r.value === config.reportType
    );
    if (!reportDef) return;

    const startDate = config.dateRange[0]
      ? new Date(config.dateRange[0]).toISOString().split("T")[0]
      : null;
    const endDate = config.dateRange[1]
      ? new Date(config.dateRange[1]).toISOString().split("T")[0]
      : null;

    const payload = { ...config, startDate, endDate };
    delete payload.dateRange;

    this.reportService.generateReport(payload).subscribe({
      next: (data) => {
        this.tabularReportTitle = reportDef.label;

        if (config.reportType === ReportType.INCOME_VS_EXPENSES) {
          const reportData = data as IIncomeVsExpensesData;

          this.tabularReportData = reportData.labels.map((label, index) => ({
            month: label,
            income: reportData.incomeData[index],
            expenses: reportData.expensesData[index],
            balance:
              reportData.incomeData[index] - reportData.expensesData[index],
          }));

          this.tabularReportColumns = [
            { field: "month", header: "Mes" },
            { field: "income", header: "Ingresos" },
            { field: "expenses", header: "Egresos" },
            { field: "balance", header: "Balance" },
          ];
          this.displayReportViewer = true;
        } else if (config.reportType === ReportType.CROP_YIELD) {
          this.tabularReportData = data as ICropYieldData[];
          this.tabularReportColumns = [
            { field: "cropName", header: "Cultivo" },
            { field: "totalQuantitySold", header: "Cantidad Vendida" },
            { field: "measureUnit", header: "Unidad" },
            { field: "totalIncome", header: "Ingresos" },
            { field: "totalExpenses", header: "Costos" },
            { field: "netProfit", header: "Rentabilidad" },
          ];
          this.displayReportViewer = true;
        } else if (config.reportType === ReportType.PLOT_YIELD) {
          this.tabularReportData = data as IPlotYieldData[];
          this.tabularReportColumns = [
            { field: "plotName", header: "Parcela" },
            { field: "cropName", header: "Cultivo" },
            { field: "totalQuantitySold", header: "Cantidad Vendida" },
            { field: "measureUnit", header: "Unidad" },
          ];
          this.displayReportViewer = true;
        } else if (config.reportType === ReportType.CROP_COSTS) {
          this.tabularReportData = data as ICropCostData[];
          this.tabularReportColumns = [
            { field: "cropName", header: "Cultivo" },
            { field: "totalCost", header: "Costo Total" },
          ];
          this.displayReportViewer = true;
        } else if (config.reportType === ReportType.OPERATIONAL_COSTS) {
          this.tabularReportData = data as IOperationalCostData[];
          this.tabularReportColumns = [
            { field: "month", header: "Mes" },
            { field: "totalCost", header: "Costo Total Operativo" },
          ];
          this.displayReportViewer = true;
        } else if (config.reportType === ReportType.FARM_COSTS) {
          this.tabularReportData = data as IFarmCostData[];
          this.tabularReportColumns = [
            { field: "farmName", header: "Finca" },
            { field: "totalCost", header: "Costo Total" },
          ];
          this.displayReportViewer = true;
        }
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo generar el reporte.",
        });
      },
    });
  }
}
