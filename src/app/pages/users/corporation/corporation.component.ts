import { Component, inject, ViewChild } from "@angular/core";
import { ModalComponent } from "../../../components/modal/modal.component";
import { PaginationComponent } from "../../../components/pagination/pagination.component";
import { ICorporation } from "../../../interfaces/corporation.interface";
import { CorporationService } from "../../../services/corporation.service";
import { ModalService } from "../../../services/modal.service";
import { AuthService } from "../../../services/auth.service";
import { ActivatedRoute } from "@angular/router";
import { CorporationFormComponent } from "../../../components/user/corporation/corporation-form/corporation-form.component";
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export const passwordMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const password = form.get('userPassword')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};
function securePasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  const securePasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return securePasswordRegex.test(value)
    ? null
    : { insecurePassword: true };
}

@Component({
  selector: "app-corporation",
  templateUrl: "./corporation.component.html",
  styleUrls: ["./corporation.component.scss"],
  standalone: true,
  imports: [
    CorporationFormComponent,
    PaginationComponent,
    ModalComponent
  ]
})
export class CorporationComponent {
  public corporationList: ICorporation[] = [];

  public corporationService: CorporationService = inject(CorporationService);
  public fb: FormBuilder = inject(FormBuilder);

  public corporationForm = this.fb.group({
    id: [''],
    businessName: ['', Validators.required],
    businessMission: ['', Validators.required],
    businessVision: ['', Validators.required],
    businessId: ['', Validators.required],
    businessCountry: ['Costa Rica', Validators.required],
    businessStateProvince: ['', Validators.required],
    businessOtherDirections: [''],
    businessLocation: [''],
    name: [''],
    userFirstSurename: [''],
    userSecondSurename: [''],
    userGender: [''],
    userPhoneNumber: [''],
    userEmail: ['', [Validators.required, Validators.email]],
    userPassword: ['', [Validators.required, securePasswordValidator]],
    confirmPassword: ['', Validators.required],
    role: this.fb.group({
      id: [3],
      roleName: ['CORPORATION']
    }),
    isActive: [true]
  }, { validators: passwordMatchValidator });

  public modalService: ModalService = inject(ModalService);
  @ViewChild('editCorporationModal') public editCorporationModal: any;

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ? data['authorities'] : []);
    });
  }

  constructor() {
    // this.corporationService.getAll();
  }

  saveCorporation(item: ICorporation) {
    this.corporationService.save(item).subscribe({
      next: () => this.corporationForm.reset(),
      error: () => {
      }
    });
  }
}