import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WhatsnewComponent } from './home/whatsnew/whatsnew.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { RoleGuardService } from '../@core/services/role-guard/role-guard.service';
// import { AuthComponent } from './auth/auth.component';
import { ProjectAuthGuardService } from '../@core/services/role-guard/project-auth-guard.service';
import { TermsOfUseComponent } from './home/terms-of-use/terms-of-use.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationPageComponent } from './notification/notification-page/notification-page.component';
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: '',
      loadChildren: './home/home.module#HomeModule',
      data: { preload: true, delay: false },
    },
    {
      path: 'home',
      loadChildren: './home/home.module#HomeModule',
      data: { preload: true, delay: false },
    },
    {
      path: 'user',
      loadChildren: './user/user.module#UserModule',
      data: { preload: true, delay: false },
    },
    {
      path: './home/whatsnew',
      component: WhatsnewComponent,
    },
    {
      path: './home/terms-of-use',
      component: TermsOfUseComponent,
    },
    {
      path: 'project-setup',
      loadChildren: './project-setup/project-setup.module#ProjectSetupModule',
      data: { preload: true, delay: false },
      canActivate: [ProjectAuthGuardService]
    },
    {
      path: 'project-management',
      loadChildren: './project-management/project-management.module#ProjectManagementModule',
      data: { preload: true, delay: false },
      canActivate: [ProjectAuthGuardService]
    },
    {
      path: 'admin',
      loadChildren: './admin/admin.module#AdminModule',
      data: { preload: false, delay: false },
      canActivate: [RoleGuardService]
    },
    {
      path: 'help',
      loadChildren: './help/help.module#HelpModule',
      data: { preload: true, delay: false },
    },
    {
      path: 'notificationMain',
      component: NotificationComponent,
      children: [
        {
          path: 'notificationPage',
          component: NotificationPageComponent,
        },
      ]
    },
    {
      path: 'super-admin',
      loadChildren: './super-admin/super-admin.module#SuperAdminModule',
    },
    {
      path: 'project-design',
      loadChildren: './project-design/project-design.module#ProjectDesignModule',
      data: { preload: true, delay: false },
      canActivate: [ProjectAuthGuardService]
    },
    {
      path: '**',
      component: NotFoundComponent,
    }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
