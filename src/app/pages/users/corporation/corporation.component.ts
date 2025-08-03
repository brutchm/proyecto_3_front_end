import { Component, inject, ViewChild } from "@angular/core";
import { ICorporation } from "../../../interfaces/corporation.interface";
import { CorporationService } from "../../../services/corporation.service";
import { ModalService } from "../../../services/modal.service";
import { AuthService } from "../../../services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CorporationFormComponent } from "../../../components/user/corporation/corporation-form/corporation-form.component";
import { passwordMatchValidator, securePasswordValidator } from "../../../utils/passwordValidator.utils";
import { FormBuilder, Validators } from "@angular/forms";
import { timer } from "rxjs";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-corporation",
  templateUrl: "./corporation.component.html",
  styleUrls: ["./corporation.component.scss"],
  standalone: true,
  imports: [
    CorporationFormComponent,
    ToastModule
  ],
})
export class CorporationComponent {
  public corporationList: ICorporation[] = [];

  public corporationService: CorporationService = inject(CorporationService);
  public fb: FormBuilder = inject(FormBuilder);

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);
  private messageService: MessageService = inject(MessageService);
  private router: Router = inject(Router);

  public corporationForm = this.fb.group({
    id: [""],
    businessName: ["", Validators.required],
    businessMission: ["", Validators.required],
    businessVision: ["", Validators.required],
    businessId: ["", Validators.required],
    businessCountry: ["Costa Rica", Validators.required],
    businessStateProvince: ["", Validators.required],
    businessOtherDirections: [""],
    businessLocation: [""],
    name: [""],
    userFirstSurename: [""],
    userSecondSurename: [""],
    userGender: [""],
    userPhoneNumber: [""],
    userEmail: ["", [Validators.required, Validators.email]],
    userPassword: ["", [Validators.required, securePasswordValidator]],
    confirmPassword: ["", Validators.required],
    role: this.fb.group({
      id: [3],
      roleName: ["CORPORATION"],
    }),
    isActive: [true],
  }, { validators: passwordMatchValidator });

  public modalService: ModalService = inject(ModalService);
  @ViewChild("editCorporationModal")
  public editCorporationModal: any;

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe((data) => {
      this.areActionsAvailable = this.authService.areActionsAvailable(
        data["authorities"] ? data["authorities"] : [],
      );
    });
  }

  /**
     * @method saveCorporation
     * @description
     * Maneja el evento de guardado. Valida el formulario, llama al servicio correspondiente,
     * y muestra notificaciones de éxito o error al usuario.
     */
    public saveCorporation(item: ICorporation): void {
        if (this.corporationForm.invalid) {
            this.corporationForm.markAllAsTouched();
            this.messageService.add({ 
                severity: 'warn', 
                summary: 'Atención', 
                detail: 'Por favor, completa todos los campos obligatorios.' 
            });
            return;
        }

        const rawData = this.corporationForm.getRawValue();
        // Convert all null values to undefined to match ICorporation type
        const cleanedData = Object.fromEntries(
            Object.entries(rawData).map(([key, value]) => [key, value === null ? undefined : value])
        );
        const corporationData: ICorporation = {
            ...cleanedData,
            id: rawData.id ? Number(rawData.id) : undefined
        };

        this.corporationService.save(corporationData).subscribe({
            next: () => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: '¡Registro Exitoso!', 
                    detail: 'La corporación ha sido registrada. Redirigiendo a login...' 
                });

                this.corporationForm.reset();
                
                timer(3000).subscribe(() => {
                    this.router.navigate(['/login']);
                });
            },
            error: (err) => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Error en el Registro', 
                    detail: err.error?.message || err.error || 'Ocurrió un error desconocido.' 
                });
            }
        });
    }
}
