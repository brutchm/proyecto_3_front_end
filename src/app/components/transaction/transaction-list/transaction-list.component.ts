import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Table, TableModule, TablePageEvent } from "primeng/table";
import { LazyLoadEvent } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TooltipModule } from "primeng/tooltip";
import { TagModule } from "primeng/tag";
import { ITransaction } from "../../../interfaces/transaction.interface";

@Component({
  selector: "app-transaction-list",
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    TagModule,
  ],
  templateUrl: "./transaction-list.component.html",
  styleUrls: ["./transaction-list.component.scss"],
})
export class TransactionListComponent {
  @Input() transactions: ITransaction[] = [];
  @Input() isLoading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() rows: number = 10;

  @Output() lazyLoad: EventEmitter<LazyLoadEvent> =
    new EventEmitter<LazyLoadEvent>();
  @Output() edit: EventEmitter<ITransaction> = new EventEmitter<ITransaction>();
  @Output() delete: EventEmitter<ITransaction> =
    new EventEmitter<ITransaction>();
  @Output() pageChange = new EventEmitter<TablePageEvent>();

  @ViewChild("dt") dt: Table | undefined;

  onLazyLoad(event: LazyLoadEvent): void {
    this.lazyLoad.emit(event);
  }

  applyFilterGlobal(event: Event, stringVal: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(filterValue, stringVal);
  }

  onPage(event: TablePageEvent): void {
    this.pageChange.emit(event);
  }

  onEdit(transaction: ITransaction): void {
    this.edit.emit(transaction);
  }

  onDelete(transaction: ITransaction): void {
    this.delete.emit(transaction);
  }

  getTransactionSeverity(type: string): "success" | "info" | "warning" {
    switch (type) {
      case "VENTA":
        return "success";
      case "COMPRA":
        return "info";
      default:
        return "info";
    }
  }
}
