import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { FarmService, IFarmResponse } from "../../services/farm.service";
import { SuggestionAIService } from "../../services/suggestionAI.service";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";
import { ToolbarModule } from "primeng/toolbar";
import { DialogModule } from "primeng/dialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DropdownModule } from "primeng/dropdown";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from "primeng/api";
@Component({
  selector: "app-suggestion-ai",
  standalone: true,
   imports: [
      CommonModule, ReactiveFormsModule, ButtonModule, ToastModule,
      ConfirmDialogModule, DialogModule, ToolbarModule, TooltipModule,DropdownModule, ProgressSpinnerModule
    ],
  templateUrl: "./suggestionAI.component.html",
    styleUrls: ["./suggestionStyle.component.scss"],
    animations: [
        trigger('fadeInOut', [
          state('void', style({ opacity: 0 })),
          transition(':enter', [
            animate('300ms ease-in', style({ opacity: 1 }))
          ]),
          transition(':leave', [
            animate('300ms ease-out', style({ opacity: 0 }))
          ])
        ])
      ]
})
export class SuggestionAIComponent implements OnInit {
  suggestionForm!: FormGroup;
  farms: IFarmResponse[] = [];
  generatedText = "";
  loading = false;
  displayedText = "";
  private messageService: MessageService = inject(MessageService);
  isSuggestionSaved: boolean = false;
  maxChars = 500;//limite de caracteres
  charCount = 0;
  constructor(
    private fb: FormBuilder,
    private suggestionService: SuggestionAIService,
    private farmService: FarmService
  ) {}

  ngOnInit() {
    this.suggestionForm = this.fb.group({
      prompt: ["", [Validators.required, Validators.maxLength(this.maxChars)]],
      farmId: [null, Validators.required],
    });

    this.suggestionForm.get('prompt')?.valueChanges.subscribe(value => {
      this.charCount = value?.length || 0;
    });
  

    this.loadFarms();
  }

  loadFarms() {
    this.farmService.getMyFarms().subscribe({
      next: (res) => {
        this.farms = res.data;
      },
      error: (err) => {
        console.error("Error cargando fincas", err);
      },
    });
  }
    generateSuggestion() {
        if (this.suggestionForm.invalid) return;
        this.loading = true;
        this.displayedText = "";
        this.generatedText = "";
        this.isSuggestionSaved = false;
        this.suggestionService.generateSuggestion(this.suggestionForm.value).subscribe({
          next: (res) => {
            this.generatedText = res.data;
            this.animateTyping(this.generatedText, 1); // 1 ms por caracter para que se vea rapido
            this.loading = false;
          },
          error: (err) => {
            console.error("Error generando sugerencia", err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error generando sugerencia. Por favor intenta nuevamente' });
            this.loading = false;
            this.isSuggestionSaved = true;
          },
        });
      }
      
      animateTyping(text: string, speedMs: number) {
        this.displayedText = "";
        let i = 0;
      
        const interval = setInterval(() => {
          if (i < text.length) {
            this.displayedText += text.charAt(i);
            i++;
          } else {
            clearInterval(interval);
          }
        }, speedMs);
      }
      

      saveGeneratedSuggestion() {
        if (!this.generatedText || !this.suggestionForm.value.farmId) return;
      
        const payload = {
          relatedFarm: {
            id: this.suggestionForm.value.farmId
          },
          suggestion: this.generatedText,
          isActive: true
        };
      
        this.suggestionService.saveSuggestion(payload).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sugerencia guardada con éxito' });
            this.isSuggestionSaved = true;
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error guardando la sugerencia' });
            this.isSuggestionSaved = false; 
        }
        });
      }
      
}
