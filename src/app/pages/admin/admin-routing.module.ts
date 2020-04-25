import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContentUsageReportComponent } from './sections/content/usage-report/usage-report.component';
import { TopLevelMenuUsageReportComponent } from './sections/top-level-menu/usage-report/usage-report.component';
import { LeftNavigationComponent } from './sections/left-navigation/left-navigation.component';
import {ContentFAQComponent} from './sections/content/content-faq/content-faq.component';
import {ContentFaqLevel2Component} from './sections/top-level-menu/content-faq-level2/content-faq-level2.component';
//import { PrivacyStatementComponent } from './sections/privacy-statement/privacy-statement.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ContextMenuModule } from 'ngx-contextmenu';
import { NbMenuModule, NbSelectModule, NbDatepickerModule, 
  NbInputModule, NbDialogModule, NbWindowModule } from '@nebular/theme';
import { Ng2SmartTableModule } from '.././../@core/components/ng2-smart-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TreeviewModule,DropdownTreeviewComponent, TreeviewI18n, TreeviewConfig } from 'ngx-treeview';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ManageAdminComponent } from './sections/content/manage-admin/manage-admin.component';
import { TopLevelMenuManageAdminComponent } from './sections/top-level-menu/manage-admin/manage-admin.component';
import { CreateEditAdminComponent } from './sections/content/create-edit-admin/create-edit-admin.component';
import { ManageAdminService } from './services/manage-admin.service';
import { ThemeModule } from '../../@theme/theme.module';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import {MatExpansionModule} from '@angular/material/expansion';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CkEditorModule } from '../../shared/ck-editor/ck-editor.module';
import { PrivacyPolicyComponent } from './sections/content/privacy-policy/privacy-policy.component';
import { PrivacyPolicyLevel2Component } from './sections/top-level-menu/privacy-policy-level2/privacy-policy-level2.component';
import { ContentWhatsnewComponent } from './sections/content/content-whatsnew/content-whatsnew.component';
import { ContentWhatsnewLevel2Component } from './sections/top-level-menu/content-whatsnew-level2/content-whatsnew-level2.component';
import { TermsOfUseComponent } from './sections/content/terms-of-use/terms-of-use.component';
import { TermsOfUseLevel2Component } from './sections/top-level-menu/terms-of-use-level2/terms-of-use-level2.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { CKEditorModule } from 'ng2-ckeditor';
import {DirectiveModule} from '../../shared/Directives/directive.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

// RECOMMENDED
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CkEditorNewComponent } from './sections/content/ck-editor-new/ck-editor-new.component';

@NgModule({
  declarations: [ContentUsageReportComponent, TopLevelMenuUsageReportComponent, LeftNavigationComponent,ContentFAQComponent,ContentFaqLevel2Component, 
    TopLevelMenuManageAdminComponent, ManageAdminComponent, CreateEditAdminComponent,
    PrivacyPolicyComponent, PrivacyPolicyLevel2Component,
    ContentWhatsnewComponent, ContentWhatsnewLevel2Component, TermsOfUseComponent,
    TermsOfUseLevel2Component, CkEditorNewComponent],
  imports: [
    PipesModule,
    DirectiveModule,
    NgxUiLoaderModule,
    CommonModule,
    Ng2SmartTableModule,
    ThemeModule,
     HttpClientModule,
     ContextMenuModule.forRoot(),
     NbDialogModule.forChild(),
     NbWindowModule.forChild(),
     BsDatepickerModule.forRoot(),
     ReactiveFormsModule,
     MatInputModule,
     MatAutocompleteModule,
     MatExpansionModule,
     NgMultiSelectDropDownModule.forRoot(),
    CommonModule,
    NbMenuModule,
    NbSelectModule,
    NbInputModule,
    CKEditorModule,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    AngularMultiSelectModule,
    TreeviewModule.forRoot(),
    ReactiveFormsModule,
    NbDatepickerModule.forRoot(),
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
  exports: [RouterModule, CommonModule],
  providers: [ManageAdminService]
})
export class AdminRoutingModule {
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
