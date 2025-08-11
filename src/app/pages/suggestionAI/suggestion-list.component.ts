// suggestion-list.component.ts
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { SuggestionAIService } from "../../services/suggestionAI.service";
import { TagModule } from "primeng/tag";
import { ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { ToolbarModule } from "primeng/toolbar";
import { DialogModule } from "primeng/dialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TooltipModule } from "primeng/tooltip";
import { ToastModule } from "primeng/toast";
import { ConfirmationService, MessageService } from "primeng/api";

@Component({
  selector: "app-suggestion-list",
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ReactiveFormsModule, ButtonModule, ToastModule,
      ConfirmDialogModule, DialogModule, ToolbarModule, TooltipModule,],
  templateUrl: "./suggestion-list.component.html",
  styleUrls: ["./suggestion-list.component.scss"],
  providers: [ConfirmationService, MessageService]
})
export class SuggestionListComponent implements OnInit {
    suggestions: any[] = [];
    loading = false;
    private messageService = inject(MessageService);
    private suggestionService = inject(SuggestionAIService);
    private confirmationService = inject(ConfirmationService);
    totalRecords = 0;
    pageSize = 10;
    pageNumber = 0;
    searchTerm: string = '';
    modalVisible: boolean = false;
    sugerenciaSeleccionada: string = '';
    ngOnInit() {
        this.loadSuggestions(this.pageNumber, this.pageSize);
      }
    
      loadSuggestions(page: number, size: number) {
        this.loading = true;
        this.suggestionService.getSuggestions(page + 1, size)
          .subscribe({
            next: (res) => {
              this.suggestions = res.data;
              this.totalRecords = res.meta.totalElements;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error al cargar sugerencias', err);
              this.loading = false;
            }
          });
      }
    
      // Metodo llamado cuando se cambia la pagina en la tabla
      onPageChange(event: { first: number; rows: number }) {
        this.pageNumber = event.first / event.rows;
        this.pageSize = event.rows;
        this.loadSuggestions(this.pageNumber, this.pageSize);
      }
      confirmDelete(suggestion: any) {
        this.confirmationService.confirm({
          message: `¿Estás seguro que deseas eliminar la sugerencia de la finca "${suggestion.relatedFarm?.farmName || 'Sin nombre'}"?`,
          header: "Confirmación",
          icon: "pi pi-exclamation-triangle",
          acceptLabel: "Sí, eliminar",
          rejectLabel: "Cancelar",
          acceptButtonStyleClass: "p-button-danger",
          accept: () => {
            this.deleteSuggestion(suggestion.id);
          }
        });
      }
    
      deleteSuggestion(id: number) {
        this.suggestionService.deleteSuggestion(id).subscribe({
          next: () => {
            this.suggestions = this.suggestions.filter(s => s.id !== id);
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Sugerencia eliminada correctamente' });
          },
          error: (err) => {
            console.error("Error al eliminar", err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la sugerencia' });
          }
        });
      }



  verSugerencia(texto: string) {
    this.sugerenciaSeleccionada = texto;
    this.modalVisible = true;
  }
  }
