import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModule } from '@angular/common';
import { SuperAdminComponent } from './super-admin.component';
import { LeftNavigationComponent } from './sections/left-navigation/left-navigation.component';
import { AppUsersComponent } from './sections/content/app-users/app-users.component';
import { AppUsersLevel2Component } from './sections/top-level-menu/app-users-level2/app-users-level2.component';

const routes: Routes = [
  {
    path: 'superAdminMain',
    component: SuperAdminComponent,
    children: [
      {
        path: 'superAdminLeftNav',
        component: LeftNavigationComponent,
        outlet: 'leftNav',
      },
      {
        path: 'AppUsers',
        component: AppUsersComponent,
      },
      {
        path: 'AppUsersLevel2Menu',
        component: AppUsersLevel2Component,
        outlet: 'level2Menu',
      },
    ]
  },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
],
  exports: [RouterModule, CommonModule],
  providers: [],
})
export class SuperAdminRoutingModule { }

export function HttpLoaderFactory(http: HttpClient){
  return new TranslateHttpLoader(http);
}
