import { ExtraOptions, RouterModule, Routes, Router, NavigationEnd, NavigationStart, NavigationError } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthService } from './shared/services/auth.service';
import { AuthguardService } from './@core/services/auth-guard/authguard.service';
import { LoginComponent } from '../app/pages/login/login.component';
import { SharedServicesModule } from './shared/services/shared-services.module';
import { CustomPreloadingStrategy } from './@core/utils/AppPreLoadingStrategy';
import { AuthComponent } from './pages/auth/auth.component';

//Dpass
const routes: Routes = [
  { path: 'pages', loadChildren: 'app/pages/pages.module#PagesModule', data: { preload: true, delay: false } },
  { path: 'auth', component: AuthComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'login' },
];

//ccp route
// const routes: Routes = [
//     { path: 'pages', loadChildren: 'app/pages/pages.module#PagesModule', data: { preload: true, delay: false } },
//     // { path: 'auth', component: AuthComponent},
//     { path: '', component: LoginComponent, canActivate: [AuthguardService] },
//     { path: '**', redirectTo: 'pages/home' },
//   ]; 

const config: ExtraOptions = {
  useHash: true,
  preloadingStrategy: CustomPreloadingStrategy,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config), SharedServicesModule.forRoot()],
  exports: [RouterModule],
  providers: [AuthguardService, AuthService]
})
export class AppRoutingModule {
  }
