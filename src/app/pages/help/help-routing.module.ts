import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeftNavigationComponent } from './sections/left-navigation/left-navigation.component';
import {ContentFAQComponent} from './sections/content/content-faq/content-faq.component';
import {ContentFaqLevel2Component} from './sections/top-level-menu/content-faq-level2/content-faq-level2.component';
//import { PrivacyStatementComponent } from './sections/privacy-statement/privacy-statement.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { NbMenuModule, NbSelectModule, NbDatepickerModule, 
  NbInputModule, NbDialogModule, NbWindowModule } from '@nebular/theme';
import { Ng2SmartTableModule } from '../../@core/components/ng2-smart-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TreeviewModule } from 'ngx-treeview';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ThemeModule } from '../../@theme/theme.module';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import {MatExpansionModule} from '@angular/material/expansion';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CKEditorModule } from 'ng2-ckeditor';


@NgModule({
  declarations: [LeftNavigationComponent,ContentFAQComponent,ContentFaqLevel2Component],
  imports: [
    CommonModule,
     Ng2SmartTableModule,
     ThemeModule,
     HttpClientModule,
     NbDialogModule.forChild(),
     NbWindowModule.forChild(),
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
  providers: []
})
export class HelpRoutingModule {
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
