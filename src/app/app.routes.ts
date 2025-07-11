import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
//import { SigUpComponent } from './pages/auth/sign-up/signup.component';
import { UsersComponent } from './pages/users/users.component';
import { AuthGuard } from './guards/auth.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GuestGuard } from './guards/guest.guard';
import { IRoleType } from './interfaces';
import { ProfileComponent } from './pages/profile/profile.component';
import { GamesComponent } from './pages/games/games.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { PreferenceListPageComponent } from './pages/preferenceList/preference-list.component';
import { SportTeamComponent } from './pages/sport-team/sport-team.component';
import { CorporationComponent } from './pages/users/corporation/corporation.component';
import { ProfileCorporationComponent } from './pages/profile/corporation/profileCorporation.component';
import { AuthCallbackComponent } from './pages/auth/callback/auth-callback.component';
import { FinishRegistrationComponent } from './pages/auth/finish-registration/finish-registration.component';
import { GoogleUserSignupComponent } from './pages/auth/google-signup-user/google-signup-user.component';
import { GoogleCorporationSignupComponent } from './pages/auth/google-signup-corporation/google-signup-corporation.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'corporation',
    component: CorporationComponent,
    canActivate: [GuestGuard],
  },
  /*{
    path: 'signup',
    component: SigUpComponent,
    canActivate: [GuestGuard],
  },*/
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'auth/finish-registration',
    component: FinishRegistrationComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'auth/google-signup-user',
    component: GoogleUserSignupComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'auth/google-signup-corporation',
    component: GoogleCorporationSignupComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'app',
    component: AppLayoutComponent,
   canActivate: [AuthGuard],
    children: [
      {
        path: 'app',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate:[AdminRoleGuard],
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin
          ],
          name: 'Users',
          showInSidebar: true
        }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Dashboard',
          showInSidebar: true
        }
      },
      {
        path: 'profile',
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
        path: 'profileCorporation',
        component: ProfileCorporationComponent,
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'profileCorporation',
          showInSidebar: false
        }
      },

      {
        path: 'games',
        component: GamesComponent,
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user,
          ],
          name: 'games',
          showInSidebar: true
        }
      },
      {
        path: 'orders',
        component: OrdersComponent,
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user,
          ],
          name: 'orders',
          showInSidebar: true
        }
      },
      {
        path: 'preference-list',
        component: PreferenceListPageComponent,
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user,
          ],
          name: 'preference list',
          showInSidebar: true
        }
      },
      {
        path: 'sport-team',
        component: SportTeamComponent,
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user,
          ],
          name: 'Sport Team',
          showInSidebar: true
        }
      },
    ],
  },
];
