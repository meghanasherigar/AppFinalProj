import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ProjectDesignComponent } from './project-design.component';
import { CKEditorModule } from 'ng2-ckeditor';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NbAlertModule, NbMenuModule } from '@nebular/theme';
import { Routes, RouterModule } from '@angular/router';
import { ThemeModule, HttpLoaderFactory } from '../../@theme/theme.module';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MiscellaneousModule } from '../miscellaneous/miscellaneous.module';
import { AuthInterceptor } from '../../@core/auth/authInterceptor';
import { AuthguardService } from '../../@core/services/auth-guard/authguard.service';
import { AuthService } from '../../shared/services/auth.service';
import { StorageService } from '../../@core/services/storage/storage.service';
import { NestableModule } from 'ngx-nestable';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatButtonModule, MatToolbarModule, MatSlideToggleModule, MatIconModule, MatCheckboxModule, MatFormFieldModule, MatTreeModule } from '@angular/material';
// import { FlexLayoutModule } from '@angular/flex-layout';
import { IconViewModule } from './modules/icon-view/icon-view.module';
import {DocumentViewModule} from './modules/document-view/document-view.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// RECOMMENDED
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PrivacyLegalModule } from '../../shared/privacyandlegal/privacy-legal.module';
import { UploadAppendicesComponent } from './modules/icon-view/appendices/upload-appendices/upload-appendices.component';
import { AssociateAppendicesComponent } from './modules/icon-view/appendices/associate-appendices/associate-appendices.component';
import { DiaasociateAppendicesComponent } from './modules/icon-view/appendices/diaasociate-appendices/diaasociate-appendices.component';
import { DeliverableDataComponent } from './modules/icon-view/appendices/manage-appendices/manage-appendices.component';
import { AbbreviationsComponent } from './modules/document-view/insert/abbreviations/abbreviations.component';
import { CachingInterceptor } from '../../@core/cache/cacheInterceptor';


const routes: Routes = [
  {
    path: 'projectdesignMain',
    component: ProjectDesignComponent,
    children: [
      {
        path: 'projectdesignMain/iconViewMain',
        loadChildren: './modules/icon-view/icon-view.module#IconViewModule',
      },
      {
        path: 'projectdesignMain/documentViewMain',
        loadChildren: './modules/document-view/document-view.module#DocumentViewModule',
      }
    ]
  }
];
@NgModule({
  declarations: [ProjectDesignComponent,
    DeliverableDataComponent],
  imports: [
    CommonModule,
     DocumentViewModule,
    ThemeModule,
    NbAlertModule,
    CKEditorModule,
    BsDatepickerModule.forRoot(),
    NbMenuModule.forRoot(),
    MiscellaneousModule,
    NestableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSlideToggleModule,
    NgMultiSelectDropDownModule.forRoot(),
    // FlexLayoutModule,
    IconViewModule,
    // configure the imports
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
    MatTreeModule,
    MatCheckboxModule,
    MatFormFieldModule,
    PrivacyLegalModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  exports: [RouterModule],
  entryComponents: [
    ProjectDesignComponent,
    UploadAppendicesComponent,
    AssociateAppendicesComponent,
    DiaasociateAppendicesComponent,
    DeliverableDataComponent
  ],
  providers: [AuthguardService, AuthService, StorageService,
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class ProjectDesignModule { }
