import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/auth/login/login.component";
import { AppLayoutComponent } from "./components/app-layout/app-layout.component";
import { SignUpComponent } from "./pages/auth/sign-up/signup.component";
import { AuthGuard } from "./guards/auth.guard";
import { AccessDeniedComponent } from "./pages/access-denied/access-denied.component";
import { AdminRoleGuard } from "./guards/admin-role.guard";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { GuestGuard } from "./guards/guest.guard";
import { IRoleType } from "./interfaces";
import { ProfileComponent } from "./pages/profile/profile.component";
import { CorporationComponent } from "./pages/users/corporation/corporation.component";
import { FarmComponent } from "./pages/farm/farm.component";
import { AuthCallbackComponent } from "./pages/auth/callback/auth-callback.component";
import { FinishRegistrationComponent } from "./pages/auth/finish-registration/finish-registration.component";
import { GoogleUserSignupComponent } from "./pages/auth/google-signup-user/google-signup-user.component";
import { GoogleCorporationSignupComponent } from "./pages/auth/google-signup-corporation/google-signup-corporation.component";
import { ListCorporationComponent } from "./pages/users/corporation/list-corporations.component";
import { PortfolioComponent } from "./pages/portfolio/portfolio.component";
import { CropsComponent } from './pages/crops/crops.component';
import { SuggestionAIComponent } from "./pages/suggestionAI/suggestionAI.component";
import { SuggestionListComponent } from "./pages/suggestionAI/suggestion-list.component";
import { PriceMarketComponent } from "./pages/prices-market/priceMarket.component";
import { MyPricesListComponent } from "./pages/prices-market/myPrices.component";
import { TransactionsComponent } from "./pages/transactions/transactions.component";
import { LandingPageComponent } from "./pages/landingPage/landingPage.component";
import { DashboardCorporationComponent } from "./pages/dashboard-corporation/dashboard-corporation.component";


export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "landing-page-agrisync",
    component: LandingPageComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "corporation",
    component: CorporationComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "signup",
    component: SignUpComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "access-denied",
    component: AccessDeniedComponent,
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "auth/callback",
    component: AuthCallbackComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "auth/finish-registration",
    component: FinishRegistrationComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "auth/google-signup-user",
    component: GoogleUserSignupComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "auth/google-signup-corporation",
    component: GoogleCorporationSignupComponent,
    canActivate: [GuestGuard],
  },
  {
    path: "portfolio",
    component: PortfolioComponent,
  },
  {
    path: "app",
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "app",
        redirectTo: "users",
        pathMatch: "full",
      },
      
      {
        path: "profile",
        component: ProfileComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
          ],
          name: "profile",
          showInSidebar: false,
        },
      },
        
     {
        path: 'price-market-list',
        component: MyPricesListComponent,
        data: {
          name: 'Mis Precios',
          authorities: [IRoleType.admin],
          showInSidebar: true
        }
      },
      {
        path: 'price-market-crops',
        component: PriceMarketComponent,
        data: {
          name: 'Publicar Precios',
          authorities: [IRoleType.admin],
          showInSidebar: true
        }
      },
      {
        path: 'my-suggestion-list-ai',
        component: SuggestionListComponent,
        data: {
          name: 'Mis Sugerencias',
          authorities: [IRoleType.user],
          showInSidebar: true
        }
      },
      {
        path: 'suggestion-ai',
        component: SuggestionAIComponent,
        data: {
          name: 'Crear Sugerencia (IA)',
          authorities: [IRoleType.user],
          showInSidebar: true
        }
      },
      {
        path: "listCorporation",
        component: ListCorporationComponent,
        data: {
          authorities: [
            IRoleType.superAdmin,
            IRoleType.user,
          ],
          name: "Corporaciones",
          showInSidebar: true,
        },
      },
      {
        path: "animal-group",
        loadComponent: () =>
          import("./pages/animal-group/animal-group.component").then((m) =>
            m.AnimalGroupComponent
          ),
        data: {
          authorities: [IRoleType.user],
          name: "Animal Group",
          showInSidebar: false,
        },
      },
      
      {
        path: "transactions",
        component: TransactionsComponent,
        data: {
          authorities: [
            IRoleType.user,
          ],
          name: "Transacciones",
          showInSidebar: true,
        },
      },
      {
        path: "farm-details",
        loadComponent: () =>
          import("./pages/farm/farm-details.component").then((m) =>
            m.FarmDetailsComponent
          ),
        data: {
          authorities: [IRoleType.user],
          name: "Mis fincas",
          showInSidebar: false,
        },
      },
      {
        path: "farm",
        component: FarmComponent,
        data: {
          authorities: [IRoleType.user],
          name: "Mis fincas",
          showInSidebar: true,
        },
      },
      {
        path: 'crops',
        component: CropsComponent,
        data: {
          name: 'Mis Cultivos',
          authorities: [IRoleType.user],
          showInSidebar: true
        }
      },
      
      {
        path: "dashboard-corporation",
        component: DashboardCorporationComponent,
        data: {
          authorities: [
            IRoleType.admin,
          ],
          name: "Dashboard",
          showInSidebar: true,
        },
      },
      {
        path: "dashboard",
        component: DashboardComponent,
        data: {
          authorities: [
            IRoleType.superAdmin,
            IRoleType.user,
          ],
          name: "Dashboard",
          showInSidebar: true,
        },
      },
    ],
  },
];
