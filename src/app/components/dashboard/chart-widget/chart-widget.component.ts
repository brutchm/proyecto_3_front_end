// import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { BaseChartDirective } from 'ng2-charts';
// import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
// import { IChartData } from '../../../interfaces/chart.interface';

// @Component({
//   selector: 'app-chart-widget',
//   standalone: true,
//   imports: [CommonModule, BaseChartDirective],
//   templateUrl: './chart-widget.component.html',
//   styleUrls: ['./chart-widget.component.scss']
// })
// export class ChartWidgetComponent implements OnChanges {
//   @Input() chartData: IChartData | null = null;
//   @Input() title: string = 'Gráfico';
//   @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

//   public barChartData: ChartConfiguration['data'] | null = null;
//   public barChartOptions: ChartConfiguration['options'] = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: {
//         ticks: { color: '#A0A0A0' },
//         grid: { color: 'rgba(255, 255, 255, 0.1)' }
//       },
//       y: {
//         ticks: { color: '#A0A0A0' },
//         grid: { color: 'rgba(255, 255, 255, 0.1)' }
//       }
//     },
//     plugins: {
//       legend: {
//         position: 'top',
//         labels: { color: '#E0E0E0' }
//       }
//     }
//   };
//   public barChartType: ChartType = 'bar';

//     constructor() {
//         Chart.register(...registerables);
//     }

//    /**
//    * Hook del ciclo de vida que se ejecuta cada vez que cambia un @Input.
//    * Es la solución perfecta para actualizar el gráfico cuando llegan los datos.
//    */
//   ngOnChanges(changes: SimpleChanges): void {
//     // Verificamos que los datos del reporte hayan cambiado y no sean nulos.
//     if (changes['chartData'] && this.chartData) {
//       // **LA CORRECCIÓN ESTÁ AQUÍ:**
//       // Forzamos un ciclo de redetección de cambios para asegurar que el gráfico se renderice.
//       // 1. Ponemos los datos a null para que el *ngIf en el HTML elimine el canvas.
//       this.barChartData = null;

//       // 2. Usamos un setTimeout para posponer la actualización al siguiente ciclo de eventos.
//       setTimeout(() => {
//         this.updateChart();
//       }, 0);
//     }
//   }

//   /**
//    * Centraliza la lógica para construir los datos del gráfico.
//    */
//   private updateChart(): void {
//     if (!this.chartData) return;

//     this.barChartData = {
//       labels: this.chartData.labels,
//       datasets: [
//         {
//           data: this.chartData.incomeData,
//           label: 'Ingresos',
//           backgroundColor: 'rgba(76, 175, 80, 0.8)',
//           borderColor: 'rgba(76, 175, 80, 1)',
//           borderWidth: 1
//         },
//         {
//           data: this.chartData.expensesData,
//           label: 'Egresos',
//           backgroundColor: 'rgba(239, 83, 80, 0.8)',
//           borderColor: 'rgba(239, 83, 80, 1)',
//           borderWidth: 1
//         }
//       ]
//     };
//   }
// }

// import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { BaseChartDirective } from 'ng2-charts';
// import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
// import { IDoughnutChartData } from '../../../interfaces/chart.interface';

// @Component({
//   selector: 'app-chart-widget',
//   standalone: true,
//   imports: [CommonModule, BaseChartDirective],
//   templateUrl: './chart-widget.component.html',
//   styleUrls: ['./chart-widget.component.scss']
// })
// export class ChartWidgetComponent implements OnChanges {
//   @Input() chartData: IDoughnutChartData | null = null;
//   @Input() title: string = 'Gráfico';
//   @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

//   public doughnutChartData: ChartConfiguration['data'] | null = null;
//   public doughnutChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     cutout: '60%', // Cria o efeito "doughnut"
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           color: '#E0E0E0',
//           padding: 20
//         }
//       }
//     }
//   } as const ;
//   public doughnutChartType: ChartType = 'doughnut';

//   constructor() {
//     Chart.register(...registerables);
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['chartData'] && this.chartData) {
//       this.updateChart();
//     }
//   }

//   private updateChart(): void {
//     if (!this.chartData) return;

//     this.doughnutChartData = {
//       labels: this.chartData.labels,
//       datasets: [
//         {
//           data: this.chartData.data,
//           backgroundColor: [
//             'rgba(76, 175, 80, 0.8)',  // Verde para Ingressos
//             'rgba(239, 83, 80, 0.8)'   // Vermelho para Egressos
//           ],
//           hoverBackgroundColor: [
//             'rgba(76, 175, 80, 1)',
//             'rgba(239, 83, 80, 1)'
//           ],
//           borderColor: 'var(--card-bg)' // Cor de fundo do widget para as bordas
//         }
//       ]
//     };

//     this.chart?.update();
//   }
// }

import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { IDoughnutChartData, ICropYieldChartData } from '../../../interfaces/chart.interface';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.scss']
})
export class ChartWidgetComponent implements OnChanges {
  @Input() chartData: IDoughnutChartData | ICropYieldChartData | null = null;
  @Input() title: string = 'Gráfico';
  @Input() type: 'doughnut' | 'bar' = 'doughnut';
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public chartConfiguration: ChartConfiguration | null = null;
  public chartType: ChartType = 'doughnut';

  // **LA CORRECCIÓN ESTÁ AQUÍ:**
  // 1. Definimos las opciones para cada tipo de gráfico por separado.
  // 2. Usamos 'as const' en las opciones del doughnut para que TypeScript
  //    trate 'cutout' y 'position' como tipos literales y no como strings genéricos.
  private doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // Esto ya no dará error
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { 
          color: '#E0E0E0',
          padding: 20
        } 
      }
    }
  } as const;

  private barOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#A0A0A0' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      y: { ticks: { color: '#A0A0A0' }, grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  constructor() {
    Chart.register(...registerables);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.chartData) return;

    if (this.type === 'doughnut' && 'data' in this.chartData) {
      this.chartType = 'doughnut';
      this.chartConfiguration = {
        type: 'doughnut',
        data: {
          labels: this.chartData.labels,
          datasets: [{ 
            data: this.chartData.data,
            backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(239, 83, 80, 0.8)'],
            hoverBackgroundColor: ['rgba(76, 175, 80, 1)', 'rgba(239, 83, 80, 1)'],
            borderColor: 'var(--card-bg)'
          }]
        },
        options: this.doughnutOptions // Usamos las opciones predefinidas
      };
    } else if (this.type === 'bar' && 'data' in this.chartData) {
      this.chartType = 'bar';
      this.chartConfiguration = {
        type: 'bar',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            data: this.chartData.data,
            label: 'Cantidad Producida',
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: this.barOptions // Usamos las opciones predefinidas
      };
    }
    
    this.chart?.update();
  }
}