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
import { ListCorporationComponent } from "./pages/users/corporation/listCorporations.component";
import { CropsComponent } from './pages/crops/crops.component';

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
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
        path: "dashboard",
        component: DashboardComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
          ],
          name: "Dashboard",
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
        path: "profile",
        component: ProfileComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'profile',
          showInSidebar: false
        }
      },
      {
        path: 'listCorporation',
        component: ListCorporationComponent,
        data: { 
          authorities: [
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Corporaciones',
          showInSidebar: true
        }
      },
      {
        path: "farm",
        component: FarmComponent,
        data: {
          authorities: [IRoleType.user],
          name: 'Mis fincas',
          showInSidebar: true
        }
      },
      {
        path: "farm-details",
        loadComponent: () =>
          import("./pages/farm/farm-details.component").then((m) =>
            m.FarmDetailsComponent
          ),
        data: {
          authorities: [IRoleType.user],
          name: "Farm Details",
          showInSidebar: false,
        },
      },
    ],
  },
];
