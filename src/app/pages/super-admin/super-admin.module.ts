import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { HttpClient, HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SuperAdminComponent } from './super-admin.component';
import { AuthguardService } from '../../@core/services/auth-guard/authguard.service';
import { StorageService } from '../../@core/services/storage/storage.service';
import { AuthInterceptor } from '../../@core/auth/authInterceptor';
import { AppUsersComponent } from './sections/content/app-users/app-users.component';
import { LeftNavigationComponent } from './sections/left-navigation/left-navigation.component';
import { NbMenuModule, NbSelectModule, NbInputModule } from '@nebular/theme';
import { AppUsersLevel2Component } from './sections/top-level-menu/app-users-level2/app-users-level2.component';
import { ThemeModule } from '../../@theme/theme.module';
import { MiscellaneousModule } from '../miscellaneous/miscellaneous.module';
import { Ng2SmartTableModule } from '../../@core/components/ng2-smart-table';
import { DirectiveModule } from '../../shared/Directives/directive.module';
import { AppUsersService } from './services/app-users.service';
import { FormsModule } from '@angular/forms';
import { AddAppUserComponent } from './sections/content/add-app-user/add-app-user.component';
import { UploadAppUserComponent } from './sections/content/upload-app-user/upload-app-user.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader'; 

@NgModule({
  declarations: [SuperAdminComponent, AppUsersComponent, LeftNavigationComponent, AppUsersLevel2Component, AddAppUserComponent, UploadAppUserComponent, ],
  imports: [
    DirectiveModule,
    CommonModule,
    SuperAdminRoutingModule,
    NbMenuModule,
    NbSelectModule,
    NbInputModule,
    ThemeModule,
    MiscellaneousModule,
    Ng2SmartTableModule,
    HttpClientModule,
    FormsModule,
    NgxUiLoaderModule ,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  exports: [RouterModule, CommonModule],
  entryComponents: [SuperAdminComponent],
  providers: [AuthguardService, StorageService, AppUsersService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  }],
})
export class SuperAdminModule { }

export function HttpLoaderFactory(http: HttpClient){
  return new TranslateHttpLoader(http);
}