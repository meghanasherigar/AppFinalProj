import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { ThemeModule } from '../@theme/theme.module';
import { WhatsnewModule } from './home/whatsnew/whatsnew.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../@core/auth/authInterceptor';
import { AuthguardService } from '../@core/services/auth-guard/authguard.service';
import { StorageService } from '../@core/services/storage/storage.service';
import { AuthComponent } from './auth/auth.component';
import { CachingInterceptor } from '../@core/cache/cacheInterceptor';
import {NotificationModule } from '../pages/notification/notification.module';
import { HomeModule } from './home/home.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
// import { NestableModule } from 'ngx-nestable';
// import { MatButtonModule, MatToolbarModule, MatSlideToggleModule, MatIconModule } from '@angular/material';
// import { FlexLayoutModule } from '@angular/flex-layout';

const PAGES_COMPONENTS = [
  PagesComponent,
  //AuthComponent,
];

@NgModule({
  imports: [
    HomeModule,
    PagesRoutingModule,
    NotificationModule,
    ThemeModule,
    DashboardModule,
    WhatsnewModule,
    MiscellaneousModule,
    MatAutocompleteModule,
    MatInputModule,
    SuperAdminModule,
    // NestableModule,
    // MatButtonModule,
    // MatIconModule,
    // MatToolbarModule,
    // MatSlideToggleModule,
    // FlexLayoutModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
  providers: [AuthguardService, StorageService,
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
})
export class PagesModule {
}
