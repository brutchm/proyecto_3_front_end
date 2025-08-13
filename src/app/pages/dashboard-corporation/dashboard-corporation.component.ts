import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from "../../services/auth.service";
import { IUser } from "../../interfaces";

@Component({
  selector: "app-dashboard-corporation",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule
  ],
  providers: [],
  templateUrl: "./dashboard-corporation.component.html",
  styleUrls: ["./dashboard-corporation.component.scss"],
})
export class DashboardCorporationComponent implements OnInit {
  private authService = inject(AuthService);
  
  public user: IUser | undefined;
  public welcomeMessage: string = 'Bienvenido';

  // Definimos los accesos directos aquí para mantener el HTML limpio
  public quickActions = [
    { label: 'Publicar Precios', icon: 'pi pi-cart-plus', link: '/app/price-market-crops' },
    { label: 'Mis Precios', icon: 'pi pi-tags', link: '/app/price-market-list' },
  ];

  ngOnInit(): void {
    this.user = this.authService.getUser() as unknown as IUser;
    if (this.user?.businessName) {
      this.welcomeMessage = `Bienvenido, ${this.user.businessName}`;
    } else if (this.user?.name) {
        this.welcomeMessage = `Bienvenido, ${this.user.name}`;
    }
  }
}