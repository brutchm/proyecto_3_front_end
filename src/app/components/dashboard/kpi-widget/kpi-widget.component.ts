import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-kpi-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./kpi-widget.component.html",
  styleUrls: ["./kpi-widget.component.scss"],
})
export class KpiWidgetComponent {
  @Input() title: string = "Título";
  @Input() value: number | string = 0;
  @Input() icon: string = "pi pi-chart-bar";
  @Input() currency: boolean = false;
  @Input() color: "green" | "red" | "blue" | "orange" = "blue";
}
