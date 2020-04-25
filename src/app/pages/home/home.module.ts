import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { CreateOrganizationProjectComponent } from './create-organization-project/create-organization-project.component';
import { EditOrganizationProjectComponent } from './edit-organization-project/edit-organization-project.component';
import { ProjectListComponent, ViewMoreProjectTemplateComponent, ProjectTemplateComponent } from './project-list/project-list.component';
import { OrganizationListComponent, OrganizationTemplateComponent, ViewMoreOrganizationTemplateComponent } from './organization-list/organization-list.component';
import { HomeMenuComponent } from './home-menu/home-menu.component';
import { HomeRoutingModule } from './home-routing.module';
import { Ng2SmartTableModule } from '../../@core/components/ng2-smart-table';
import { ThemeModule } from '../../@theme/theme.module';
import { NbDialogModule, NbWindowModule } from '@nebular/theme';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TreeviewModule } from 'ngx-treeview';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import { HomeService } from '../home/home.service'
import { ProjectSetupModule } from '../project-setup/project-setup.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AuthInterceptor } from '../../@core/auth/authInterceptor';
import { AuthguardService } from '../../@core/services/auth-guard/authguard.service';
import { StorageService } from '../../@core/services/storage/storage.service';
import { NgSelectModule} from '@ng-select/ng-select';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { VeiwAllNotificationComponent, ActionRequestedComponent } from './veiw-all-notification/veiw-all-notification.component';
import {DirectiveModule} from '../../shared/Directives/directive.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { CopyProjectComponent } from './copy-project/copy-project.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';

import { NbMenuModule, NbSelectModule, NbDatepickerModule, 
  NbInputModule} from '@nebular/theme';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CachingInterceptor } from '../../@core/cache/cacheInterceptor';

@NgModule({
  declarations: [HomeComponent, CreateOrganizationProjectComponent, 
    EditOrganizationProjectComponent, 
    ProjectListComponent, 
    OrganizationListComponent, 
    HomeMenuComponent, 
    OrganizationTemplateComponent, 
    ViewMoreOrganizationTemplateComponent, 
    ViewMoreProjectTemplateComponent,
    ProjectTemplateComponent,
    VeiwAllNotificationComponent,
    CopyProjectComponent,
    ActionRequestedComponent,
    TermsOfUseComponent
  ],
  imports: [
    PipesModule,
    CommonModule,
    DirectiveModule,
    HomeRoutingModule,
    Ng2SmartTableModule,
    NgSelectModule,
    TreeviewModule.forRoot(),
    ThemeModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
    ProjectSetupModule,
    NbDialogModule.forChild(),
    NbWindowModule.forChild(),
    NgxUiLoaderModule,
    NbDatepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  entryComponents: [
    OrganizationTemplateComponent,
    ViewMoreOrganizationTemplateComponent,
    ViewMoreProjectTemplateComponent,
    ProjectTemplateComponent,
    CopyProjectComponent,
    ActionRequestedComponent,
    TermsOfUseComponent
  ],
  providers: [HomeService, AuthguardService, StorageService,
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }],
})
export class HomeModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
