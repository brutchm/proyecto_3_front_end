
import { Component, EventEmitter, inject, Output, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { PaginationComponent } from "../../../components/pagination/pagination.component";
import { ModalComponent } from "../../../components/modal/modal.component";
import { ICorporation } from "../../../interfaces/corporation.interface";
import { ListCorporationService } from "../../../services/listCorporations.service";
import { ModalService } from "../../../services/modal.service";
import { AuthService } from "../../../services/auth.service";
import { ListCorporationListComponent } from "../../../components/user/corporation/coporation-list/corporation-list.component";
import { CorporationViewComponent } from "../../../components/user/corporation/coporation-list/corporationView.component";

@Component({
  selector: "app-listCorporation",
  templateUrl: "./listCorporations.component.html",
 // styleUrls: ["./listCorporation.component.scss"],
  standalone: true,
  imports: [
    CorporationViewComponent,
    ListCorporationListComponent,
    PaginationComponent,
    ModalComponent
  ]
})
export class ListCorporationComponent {
  public listCorporationList: ICorporation[] = []
  public listCorporationService: ListCorporationService = inject(ListCorporationService);
  public fb: FormBuilder = inject(FormBuilder);
  public listCorporationForm = this.fb.group({
    id: [''],
    businessName: ['', Validators.required],
    businessMission: ['', Validators.required],
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


  openEditListCorporationModal(listCorporation: ICorporation) {
    console.log("x openEditListCorporationModal", listCorporation);
    this.listCorporationForm.patchValue({
      id: JSON.stringify(listCorporation.id),
      businessName: listCorporation.businessName,
      businessMission: listCorporation.businessMission
    });
    this.modalService.displayModal('lg', this.editListCorporationModal);
  }

}