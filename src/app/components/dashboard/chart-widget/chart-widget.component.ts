import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import { Chart, ChartConfiguration, ChartType, registerables } from "chart.js";
import {
  IDoughnutChartData,
  ICropYieldChartData,
} from "../../../interfaces/chart.interface";

@Component({
  selector: "app-chart-widget",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./chart-widget.component.html",
  styleUrls: ["./chart-widget.component.scss"],
})
export class ChartWidgetComponent implements OnChanges {
  @Input() chartData: IDoughnutChartData | ICropYieldChartData | null = null;
  @Input() title: string = "Gráfico";
  @Input() type: "doughnut" | "bar" = "doughnut";
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public chartConfiguration: ChartConfiguration | null = null;
  public chartType: ChartType = "doughnut";

  private doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#E0E0E0",
          padding: 20,
        },
      },
    },
  } as const;

  private barOptions: ChartConfiguration["options"] = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#A0A0A0" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: { ticks: { color: "#A0A0A0" }, grid: { display: false } },
    },
    plugins: { legend: { display: false } },
  };

  constructor() {
    Chart.register(...registerables);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["chartData"] && this.chartData) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.chartData) return;

    if (this.type === "doughnut" && "data" in this.chartData) {
      this.chartType = "doughnut";
      this.chartConfiguration = {
        type: "doughnut",
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              data: this.chartData.data,
              backgroundColor: [
                "rgba(76, 175, 80, 0.8)",
                "rgba(239, 83, 80, 0.8)",
              ],
              hoverBackgroundColor: [
                "rgba(76, 175, 80, 1)",
                "rgba(239, 83, 80, 1)",
              ],
              borderColor: "var(--card-bg)",
            },
          ],
        },
        options: this.doughnutOptions,
      };
    } else if (this.type === "bar" && "data" in this.chartData) {
      this.chartType = "bar";
      this.chartConfiguration = {
        type: "bar",
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              data: this.chartData.data,
              label: "Cantidad Producida",
              backgroundColor: "rgba(54, 162, 235, 0.8)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: this.barOptions,
      };
    }

    this.chart?.update();
  }
}
