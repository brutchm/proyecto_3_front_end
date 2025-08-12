// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Observable, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast';
// import { ButtonModule } from 'primeng/button';
// import { DialogModule } from 'primeng/dialog';

// import { KpiWidgetComponent } from '../../components/dashboard/kpi-widget/kpi-widget.component';
// import { ReportGeneratorComponent } from '../../components/dashboard/report-generator/report-generator.component';
// import { ChartWidgetComponent } from '../../components/dashboard/chart-widget/chart-widget.component';
// import { DashboardService } from '../../services/dashboard.service';
// import { IDashboardSummary } from '../../interfaces/dashboard.interface';
// import { IDoughnutChartData, ICropYieldChartData } from '../../interfaces/chart.interface';
// import { FarmService, IFarm } from '../../services/farm.service';
// import { CropService } from '../../services/crop.service';
// import { ICrop } from '../../interfaces/crop.interface';
// import { ReportDefinition, AVAILABLE_REPORTS } from '../../interfaces/report-generator.interface';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, KpiWidgetComponent, ChartWidgetComponent, ToastModule, ButtonModule, DialogModule, ReportGeneratorComponent],
//   providers: [MessageService],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent implements OnInit {
//   private dashboardService = inject(DashboardService);
//   private farmService = inject(FarmService);
//   private cropService = inject(CropService);
//   private messageService = inject(MessageService);

//   summary$: Observable<IDashboardSummary | null> | undefined;
//   monthlyChartData$: Observable<IDoughnutChartData | null> | undefined;
//   cropYieldData$: Observable<ICropYieldChartData | null> | undefined;

//   displayReportGenerator = false;
//   farms: IFarm[] = [];
//   crops: ICrop[] = [];
  
//   ngOnInit(): void {
//     this.loadDashboardData();
//     this.loadFilterData();
//   }
  
//   loadDashboardData(): void {
//     this.summary$ = this.dashboardService.getSummary().pipe(
//       catchError(() => {
//         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el resumen del dashboard.' });
//         return of(null);
//       })
//     );

//     this.monthlyChartData$ = this.dashboardService.getCurrentMonthChartData().pipe(
//       catchError(() => {
//         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos del gráfico.' });
//         return of(null);
//       })
//     );

//     this.cropYieldData$ = this.dashboardService.getTopCropYieldData().pipe(
//       catchError(() => {
//         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos de rendimiento.' });
//         return of(null);
//       })
//     );
//   }

//   loadFilterData(): void {
//     this.farmService.getMyFarms().subscribe(res => this.farms = res.data.map(item => item.farm));
//     this.cropService.getCrops(1, 1000).subscribe(res => this.crops = res.data);
//   }

//   openReportGenerator(): void {
//     this.displayReportGenerator = true;
//   }
  
//   handleReportGeneration(config: any): void {
//     console.log("Generando reporte tabular con la siguiente configuración:", config);
//     // Lógica futura para reportes tabulares
//   }
// }


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { KpiWidgetComponent } from '../../components/dashboard/kpi-widget/kpi-widget.component';
import { ReportGeneratorComponent } from '../../components/dashboard/report-generator/report-generator.component';
import { ChartWidgetComponent } from '../../components/dashboard/chart-widget/chart-widget.component';
import { TableReportViewerComponent } from '../../components/dashboard/table-report-viewer/table-report-viewer.component';
import { DashboardService } from '../../services/dashboard.service';
import { ReportService } from '../../services/report.service';
import { IDashboardSummary } from '../../interfaces/dashboard.interface';
import { FarmService, IFarm } from '../../services/farm.service';
import { CropService } from '../../services/crop.service';
import { ICrop } from '../../interfaces/crop.interface';
import { ReportDefinition, AVAILABLE_REPORTS, ReportType, IPlotYieldData } from '../../interfaces/report-generator.interface';
import { IChartData, ICropYieldChartData, IDoughnutChartData } from '../../interfaces/chart.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiWidgetComponent, ChartWidgetComponent, ToastModule, ButtonModule, DialogModule, ReportGeneratorComponent, TableReportViewerComponent],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
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

  // Propiedades para el reporte tabular
  tabularReportData: any[] = [];
  tabularReportColumns: { field: string, header: string }[] = [];
  tabularReportTitle: string = '';

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadFilterData();
  }
  
  loadDashboardData(): void {
    this.summary$ = this.dashboardService.getSummary().pipe(
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el resumen del dashboard.' });
        return of(null);
      })
    );
    this.monthlyChartData$ = this.dashboardService.getCurrentMonthChartData().pipe(
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos del gráfico.' });
        return of(null);
      })
    );
    this.cropYieldData$ = this.dashboardService.getTopCropYieldData().pipe(
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos de rendimiento.' });
        return of(null);
      })
    );
  }

  loadFilterData(): void {
    this.farmService.getMyFarms().subscribe(res => this.farms = res.data.map(item => item.farm));
    this.cropService.getCrops(1, 1000).subscribe(res => this.crops = res.data);
  }

  openReportGenerator(): void {
    this.displayReportGenerator = true;
  }
  
  handleReportGeneration(config: any): void {
    const reportDef: ReportDefinition | undefined = AVAILABLE_REPORTS.find(r => r.value === config.reportType);
    if (!reportDef) return;

    const startDate = config.dateRange[0] ? new Date(config.dateRange[0]).toISOString().split('T')[0] : null;
    const endDate = config.dateRange[1] ? new Date(config.dateRange[1]).toISOString().split('T')[0] : null;

    const payload = { ...config, startDate, endDate };
    delete payload.dateRange;

    this.reportService.generateReport(payload).subscribe({
      next: (data) => {
        this.tabularReportTitle = reportDef.label;
        
        if (config.reportType === ReportType.PLOT_YIELD) {
          this.tabularReportData = data as IPlotYieldData[];
          this.tabularReportColumns = [
            { field: 'plotName', header: 'Parcela' },
            { field: 'cropName', header: 'Cultivo' },
            { field: 'totalQuantitySold', header: 'Cantidad Vendida' },
            { field: 'measureUnit', header: 'Unidad' }
          ];
          this.displayReportViewer = true;
        }
        // Aquí se añadirían otros 'if' para futuros reportes tabulares
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte.' });
      }
    });
  }
}