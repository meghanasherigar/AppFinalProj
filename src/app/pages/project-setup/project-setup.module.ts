import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectSetupRoutingModule } from './project-setup-routing.module';
import { ManageEntitiesComponent } from './entity/manage-entities/manage-entities.component';
import { CreateEditEntityComponent } from './entity/create-edit-entity/create-edit-entity.component';
import { UploadScreenComponent, ButtonViewComponent } from './upload-screen/upload-screen.component';
import { ProjectSetupComponent } from './project-setup.component';
import { Ng2SmartTableModule } from '../../@core/components/ng2-smart-table';
import { ThemeModule } from '../../@theme/theme.module';
import { EntitiesService } from '../project-setup/entity/entity.service';
import { NbDialogModule, NbWindowModule, NbDatepickerModule } from '@nebular/theme';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AlertComponent } from '../project-setup/alert.component';
import { MatAutocompleteModule, MatInputModule, MatIconModule, MatTreeModule, MatDialogModule, MatCheckboxModule } from '@angular/material';
import {ManageEntitiesToolbarComponent} from './entity/manage-entities-toolbar/manage-entities-toolbar.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {MatExpansionModule} from '@angular/material/expansion';
import {ManageTransactionsToolbarComponent} from './transaction/manage-transactions-toolbar/manage-transactions-toolbar.component';
import { EditTransactionComponent } from './transaction/edit-transaction/edit-transaction.component';
import { CreateTransactionComponent } from './transaction/create-transaction/create-transaction.component';
import { ManageTransactionsComponent } from './transaction/manage-transactions/manage-transactions.component';
import { UploadToolbarComponent } from './upload-screen/upload-toolbar/upload-toolbar.component';
import { LeftNavigationComponent } from './left-navigation/left-navigation.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardService } from '../../@core/services/auth-guard/authguard.service';
import { StorageService } from '../../@core/services/storage/storage.service';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { ManageUsersComponent } from './users/manage-users/manage-users.component';
import { ManageUsersToolbarComponent } from './users/manage-users-toolbar/manage-users-toolbar.component';
import { UploadUserComponent } from './users/upload-user/upload-user.component';
import { SendmailUserComponent } from './users/sendmail-user/sendmail-user.component';
import { MatChipsModule } from '@angular/material/chips';
import { CKEditorModule } from 'ng2-ckeditor';
import { NbDateFnsDateModule } from '@nebular/date-fns';
import { NbMomentDateModule } from '@nebular/moment';
import {DirectiveModule} from '../../shared/Directives/directive.module';
import { AuthInterceptor } from '../../@core/auth/authInterceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
// RECOMMENDED
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PrivacyPolicyComponent } from '../../shared/privacyandlegal/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from '../../shared/privacyandlegal/terms-of-use/terms-of-use.component';
import { PrivacyLegalModule } from '../../shared/privacyandlegal/privacy-legal.module';
import { CommonPagesModule } from '../common/common/common-pages.module';
import { ProjectSettingComponent } from './project-setting/project-setting.component';
import { ProjectSettingToolbarComponent } from './project-setting/project-setting-toolbar/project-setting-toolbar.component';
import { DecimalPipe } from '@angular/common';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { AuditTrailToolbarComponent } from './audit-trail/audit-trail-toolbar/audit-trail-toolbar.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { EditTransactionDatasheetComponent } from './transaction/edit-transaction-datasheet/edit-transaction-datasheet.component';
import { EditDatasheetComponent } from './entity/edit-datasheet/edit-datasheet.component';
import { CachingInterceptor } from '../../@core/cache/cacheInterceptor';

const routes: Routes = [
  {
    path: 'projectSetupMain',
    component: ProjectSetupComponent,
    children: [
      {
        path: 'usersMain',
        component: ManageUsersComponent,
      },
      {
        path: 'usersLevel2Menu',
        component: ManageUsersToolbarComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'entitiesMain',
        component: ManageEntitiesComponent,
      },
      {
        path: 'entitiesLevel2Menu',
        component: ManageEntitiesToolbarComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'transactionMain',
        component: ManageTransactionsComponent,
      },
      {
        path: 'transactionLevel2Menu',
        component: ManageTransactionsToolbarComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'uploadMain',
        component: UploadScreenComponent,
      },
      {
        path: 'uploadLevel2Menu',
        component: UploadToolbarComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'auditTrailMain',
        component: AuditTrailComponent,
      },
      {
        path: 'auditTrailLevel2Menu',
        component: AuditTrailToolbarComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'ProjectSettingMain',
        component: ProjectSettingComponent
      },
      {
        path: 'ProjectSettingLevel2Menu',
        component: ProjectSettingToolbarComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'leftNav',
        component: LeftNavigationComponent,
        outlet: 'leftNav',
      },
    ]
  }];

@NgModule({
  declarations: [AlertComponent, LeftNavigationComponent, ManageEntitiesComponent, 
    CreateEditEntityComponent, UploadScreenComponent, ButtonViewComponent,ProjectSetupComponent,
    EditTransactionComponent, CreateTransactionComponent, ProjectSettingToolbarComponent,
    ManageTransactionsComponent, ManageEntitiesToolbarComponent,
    ManageTransactionsToolbarComponent, UploadToolbarComponent, CreateUserComponent, EditUserComponent,
     ManageUsersComponent, ManageUsersToolbarComponent, UploadUserComponent, SendmailUserComponent, ProjectSettingComponent,
     AuditTrailComponent, AuditTrailToolbarComponent, EditDatasheetComponent,
     EditTransactionDatasheetComponent],
  imports: [
    PipesModule,
    CommonModule,
    DirectiveModule,
    ProjectSetupRoutingModule,
    Ng2SmartTableModule,
    ThemeModule,
    MatChipsModule,
    MatIconModule,
    NbDatepickerModule,
    NgxUiLoaderModule,
    NbMomentDateModule,
    NbDateFnsDateModule,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    NbDialogModule.forChild(),
    NbWindowModule.forChild(),
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTreeModule,
    MatDialogModule,
    MatCheckboxModule, 
    MatExpansionModule,
    CommonPagesModule,
    CKEditorModule,
    PrivacyLegalModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  exports: [AlertComponent, DecimalPipe],
  entryComponents: [
    ButtonViewComponent,
    SendmailUserComponent,
    EditDatasheetComponent,
    EditTransactionDatasheetComponent,
  ],
  providers: [EntitiesService, AuthguardService, StorageService, DecimalPipe,
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }],
})
export class ProjectSetupModule {

}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
