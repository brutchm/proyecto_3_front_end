
import { Component, EventEmitter, inject, Output, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { PaginationComponent } from "../../../components/pagination/pagination.component";
import { ModalComponent } from "../../../components/modal/modal.component";
import { ICorporation } from "../../../interfaces/corporation.interface";
import { ListCorporationService } from "../../../services/listCorporations.service";
import { ModalService } from "../../../services/modal.service";
import { AuthService } from "../../../services/auth.service";
import { ListCorporationListComponent } from "../../../components/user/corporation/corporation-list/corporation-list.component";
import { CorporationViewComponent } from "../../../components/user/corporation/corporation-list/corporationView.component";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-listCorporation",
  templateUrl: "./list-corporations.component.html",
  styleUrls: ["./list-corporations.component.scss"],
  standalone: true,
  imports: [
    CorporationViewComponent,
    ListCorporationListComponent,
    PaginationComponent,
    ModalComponent
  ]
})
export class ListCorporationComponent {
  @ViewChild('editListCorporationModal') editModalTemplate!: TemplateRef<any>;
  public listCorporationList: ICorporation[] = []
  public listCorporationService: ListCorporationService = inject(ListCorporationService);
  public fb: FormBuilder = inject(FormBuilder);
  public listCorporationForm = this.fb.group({
      id: [''],
      businessName: ['', Validators.required],
      businessMission: ['', Validators.required],
      businessVision: ['', Validators.required],
      businessId: ['', Validators.required],
      businessCountry: ['Costa Rica', Validators.required],
      businessStateProvince: ['', Validators.required],
      businessOtherDirections: [''],
      businessLocation: [''],
      userEmail: ['', Validators.required]

  });
  public modalService: ModalService = inject(ModalService);
  @ViewChild('editListCorporationModal') public editListCorporationModal: any;
  @Output() callUpdateModalMethod: EventEmitter<ICorporation> = new EventEmitter<ICorporation>();

  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;
  public route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe( data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ? data['authorities'] : []);
    });
  }

  constructor() {
    this.listCorporationService.getAll();
  }
  showModal = false;

  closeEditListCorporationModal(): void {
    this.modalService.closeAll();
  }
  
  openEditListCorporationModal(listCorporation: ICorporation) {
    console.log("x openEditListCorporationModal", listCorporation);
    this.listCorporationForm.patchValue({
      id: JSON.stringify(listCorporation.id),
      businessId: listCorporation.businessId,
      businessName: listCorporation.businessName,
      businessMission: listCorporation.businessMission,
      businessVision: listCorporation.businessVision,
      businessCountry: listCorporation.businessCountry,
      businessStateProvince: listCorporation.businessStateProvince,
      businessOtherDirections: listCorporation.businessOtherDirections,
      businessLocation: listCorporation.businessLocation,
      userEmail: listCorporation.userEmail
    });
    this.modalService.displayModal('lg', this.editListCorporationModal);
  }

}