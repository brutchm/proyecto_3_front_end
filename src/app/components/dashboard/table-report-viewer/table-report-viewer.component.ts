import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import jsPDF from "jspdf";
import autotable from "jspdf-autotable";

@Component({
  selector: "app-table-report-viewer",
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: "./table-report-viewer.component.html",
  styleUrls: ["./table-report-viewer.component.scss"],
})
export class TableReportViewerComponent {
  @Input() reportTitle: string = "Reporte";
  @Input() columns: { field: string; header: string }[] = [];
  @Input() data: any[] = [];

  downloadPdf(): void {
    const doc = new jsPDF();
    const head = [this.columns.map((col) => col.header)];
    const body = this.data.map((row) =>
      this.columns.map((col) => row[col.field] ?? "N/A")
    );

    doc.setFontSize(18);
    doc.text(this.reportTitle, 14, 22);

    autotable(doc, {
      head: head,
      body: body,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [76, 175, 80] },
    });

    doc.save(`${this.reportTitle.replace(/ /g, "_")}.pdf`);
  }
}
