import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
// import { ChartsModule } from 'ng2-charts'; // Removed, not needed in ng2-charts v4+
import { ChartConfiguration, ChartType } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { IIncomeVsExpensesData } from '../../../interfaces/report-generator.interface';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, ButtonModule],
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnChanges {
  @Input() reportData: IIncomeVsExpensesData | null = null;
  @Input() reportTitle: string = 'Reporte';
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public barChartData: ChartConfiguration['data'] | null = null;
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        ticks: { color: '#A0A0A0' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: { 
        ticks: { color: '#A0A0A0' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    plugins: {
      legend: { labels: { color: '#E0E0E0' } }
    }
  };
  public barChartType: ChartType = 'bar';

  /**
   * Hook del ciclo de vida que se ejecuta cada vez que cambia un @Input.
   * Es la solución perfecta para actualizar el gráfico cuando llegan los datos.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportData'] && this.reportData) {
      this.updateChartData();
    }
  }

  /**
   * Centraliza la lógica para construir los datos del gráfico.
   */
  private updateChartData(): void {
    if (!this.reportData) return;
    
    this.barChartData = {
      labels: this.reportData.labels,
      datasets: [
        { data: this.reportData.incomeData, label: 'Ingresos', backgroundColor: 'rgba(76, 175, 80, 0.8)' },
        { data: this.reportData.expensesData, label: 'Egresos', backgroundColor: 'rgba(239, 83, 80, 0.8)' }
      ]
    };
  }

  downloadPdf(): void {
    if (!this.chart?.chart) return;

    const doc = new jsPDF();
    const chartCanvas = this.chart.chart.canvas;
    const chartBase64 = chartCanvas.toDataURL('image/png', 1.0);

    doc.setFontSize(18);
    doc.text(this.reportTitle, 14, 22);
    doc.addImage(chartBase64, 'PNG', 15, 40, 180, 100);
    
    let yPos = 160;
    doc.setFontSize(12);
    doc.text("Resumen de Datos:", 14, yPos);
    yPos += 10;
    this.reportData?.labels.forEach((label, index) => {
      const income = this.reportData?.incomeData[index] || 0;
      const expense = this.reportData?.expensesData[index] || 0;
      doc.text(`${label}: Ingresos ₡${income.toFixed(2)}, Egresos ₡${expense.toFixed(2)}`, 14, yPos);
      yPos += 7;
    });

    doc.save(`${this.reportTitle.replace(/ /g, '_')}.pdf`);
  }
}