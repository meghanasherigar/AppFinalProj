import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NbAlertModule, NbMenuModule, NbContextMenuModule } from '@nebular/theme';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ContentUsageReportComponent } from './sections/content/usage-report/usage-report.component';
import { TopLevelMenuUsageReportComponent } from './sections/top-level-menu/usage-report/usage-report.component';
import { LeftNavigationComponent } from './sections/left-navigation/left-navigation.component';
import { ThemeModule } from '../../@theme/theme.module';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import { MatButtonModule, MatToolbarModule, MatSlideToggleModule, MatIconModule, MatCheckboxModule, MatFormFieldModule, MatTreeModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TreeviewModule } from 'ngx-treeview';
import { ContextMenuModule } from 'ngx-contextmenu';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { MiscellaneousModule } from '../miscellaneous/miscellaneous.module';
import { ManageAdminComponent } from './sections/content/manage-admin/manage-admin.component';
import { TopLevelMenuManageAdminComponent } from './sections/top-level-menu/manage-admin/manage-admin.component';
import { AuthInterceptor } from '../../@core/auth/authInterceptor';
import { ContentFAQComponent } from './sections/content/content-faq/content-faq.component';
import { ContentFaqLevel2Component } from './sections/top-level-menu/content-faq-level2/content-faq-level2.component';
import { AuthguardService } from '../../@core/services/auth-guard/authguard.service';
import { StorageService } from '../../@core/services/storage/storage.service';
import { PrivacyPolicyComponent } from './sections/content/privacy-policy/privacy-policy.component';
import { PrivacyPolicyLevel2Component } from './sections/top-level-menu/privacy-policy-level2/privacy-policy-level2.component';
import { ContentWhatsnewComponent } from './sections/content/content-whatsnew/content-whatsnew.component';
import { ContentWhatsnewLevel2Component } from './sections/top-level-menu/content-whatsnew-level2/content-whatsnew-level2.component';
import { TermsOfUseComponent } from './sections/content/terms-of-use/terms-of-use.component';
import { TermsOfUseLevel2Component } from './sections/top-level-menu/terms-of-use-level2/terms-of-use-level2.component';
import { GlobalLibraryComponent } from './sections/content/global-library/global-library.component';
import { GlobalLibraryLevel2Component } from './sections/top-level-menu/global-library-level2/global-library-level2.component';
import { CountryLibraryComponent } from './sections/content/country-library/country-library.component';
import { CountryLibraryLevel2Component } from './sections/top-level-menu/country-library-level2/country-library-level2.component';
import { LibraryComponent } from './sections/content/region/library/library.component';
import { CreateBlockAttributesComponent } from './sections/content/manage-blocks/create-block-attributes/create-block-attributes.component';
import { CreateStackAttributesComponent } from './sections/content/manage-stacks/create-stack-attributes/create-stack-attributes.component';
import { EditBlockAttributesComponent } from './sections/content/manage-blocks/edit-block-attributes/edit-block-attributes.component';
import { EditStackAttributesComponent } from './sections/content/manage-stacks/edit-stack-attributes/edit-stack-attributes.component';
import { HeaderComponent } from './sections/content/region/library/header/header.component';
import { ContentComponent } from './sections/content/region/library/content/content.component';
import { BlockDetailComponent } from './sections/content/region/library/block-detail/block-detail.component';

import { BlockAttributeComponent } from './sections/content/manage-blocks/block-attribute/block-attribute.component';
import { StackAttributesComponent } from './sections/content/manage-stacks/stack-attributes/stack-attributes.component';
import { PrivacyLegalModule } from '../../shared/privacyandlegal/privacy-legal.module';
import { EditorFullViewAdminComponent } from './sections/content/region/library/editor-full-view-admin/editor-full-view-admin.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { FilterManageLibraryComponent } from './sections/content/manage-blocks/filter-manage-library/filter-manage-library.component';
import { EditorLevel2MenuLibraryComponent } from './sections/top-level-menu/editor-level2-menu-library/editor-level2-menu-library.component';
import { LibraryHeaderMenuComponent } from './sections/top-level-menu/library-header-menu/library-header-menu.component';
import { InsertLevel2MenuLibraryComponent } from './sections/top-level-menu/insert-level2-menu-library/insert-level2-menu-library.component';
import { LayoutLevel2MenuLibraryComponent } from './sections/top-level-menu/layout-level2-menu-library/layout-level2-menu-library.component';
import { CommonProjectDesignModule } from '../project-design/common-project-design/common-project-design.module';
import { BlockSuggestionComponent } from './sections/content/block-suggestion/block-suggestion.component';
import { BlockSuggestionLevel2Component } from './sections/top-level-menu/block-suggestion-level2/block-suggestion-level2.component';
import { BlockSuggestionContentComponent } from './sections/content/block-suggestion-content/block-suggestion-content.component';
import { BlockSuggestionFilterComponent } from './sections/content/block-suggestion/block-suggestion-filter/block-suggestion-filter.component';
import { LayoutModule } from '../project-design/modules/document-view/layout/layout.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { EditBlockComponent } from './sections/content/manage-blocks/extended-view/edit-block/edit-block.component';
import { AttributeViewComponent } from './sections/content/region/library/attribute-view/attribute-view.component';
import { CachingInterceptor } from '../../@core/cache/cacheInterceptor';
// import { DefineColorsComponent } from '../project-design/modules/icon-view/define-colors/define-colors.component';
import { ImportedBlocksExtendedComponent } from './block-importer/imported-blocks-extended/imported-blocks-extended.component';
import { InsertCoverPageComponent } from './sections/content/insert-cover-page/insert-cover-page.component';
import { ReviewLevel2MenuLibraryComponent } from './sections/top-level-menu/review-level2-menu-library/review-level2-menu-library.component';
import { ViewAbbLevel2MenuComponent } from '../project-design/modules/document-view/insert/view-abbreviations/view-abb-level2-menu/view-abb-level2-menu.component';
import { ViewAbbreviationsComponent } from '../project-design/modules/document-view/insert/view-abbreviations/view-abbreviations.component';

const routes: Routes = [
  {
    path: 'adminMain',
    component: AdminComponent,
    children: [
      {
        path: 'usageReportMain',
        component: ContentUsageReportComponent,
      },
      {
        path: 'uageReportLevel2Menu',
        component: TopLevelMenuUsageReportComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'leftNav',
        component: LeftNavigationComponent,
        outlet: 'leftNav',
      },
      {
        path: 'manageAdminComponent',
        component: ManageAdminComponent,
      },
      {
        path: 'adminLevel2Menu',
        component: TopLevelMenuManageAdminComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'FAQMain',
        component: ContentFAQComponent,
      },
      {
        path: 'FAQLevel2Menu',
        component: ContentFaqLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'PrivacyPolicy',
        component: PrivacyPolicyComponent,
      },
      {
        path: 'PrivacyPolicyLevel2Menu',
        component: PrivacyPolicyLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'TermsOfUse',
        component: TermsOfUseComponent,
      },
      {
        path: 'TermsofUseLevel2Menu',
        component: TermsOfUseLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'whatsNewContent',
        component: ContentWhatsnewComponent,
      },
      {
        path: 'WhatsNewLevel2Menu',
        component: ContentWhatsnewLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'globalLibraryMain',
        component: GlobalLibraryComponent,
      },
      {
        path: 'GlobalLibraryLevel2Menu',
        component: GlobalLibraryLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'countryLibraryMain',
        component: CountryLibraryComponent,
      },
      {
        path: 'CountryLibraryLevel2Menu',
        component: CountryLibraryLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'EditorLevel2MenuLibrary',
        component: EditorLevel2MenuLibraryComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'libraryviewtopmenu',
        component: LibraryHeaderMenuComponent,
        outlet: 'topmenu',
      },
      {
        path: 'blockSuggestionMain',
        component: BlockSuggestionComponent,
      },
      {
        path: 'blockSuggestionLevel2Menu',
        component: BlockSuggestionLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'viewAbbLevel2Menu',
        component: ViewAbbLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'viewabbreviations',
        component: ViewAbbreviationsComponent
      },
      {
        path: 'leftNav',
        component: LeftNavigationComponent,
        outlet: 'leftNav',
      }
    ]
  },
];

@NgModule({
  declarations: [AdminComponent,LibraryComponent, GlobalLibraryLevel2Component,CountryLibraryLevel2Component, EditBlockComponent,
    GlobalLibraryComponent, HeaderComponent,ContentComponent,
    CountryLibraryComponent, CreateBlockAttributesComponent,CreateStackAttributesComponent, AttributeViewComponent,
    EditBlockAttributesComponent, EditStackAttributesComponent, BlockDetailComponent, BlockAttributeComponent, StackAttributesComponent,
    EditorFullViewAdminComponent, FilterManageLibraryComponent, BlockSuggestionComponent, BlockSuggestionLevel2Component, 
    BlockSuggestionContentComponent, BlockSuggestionFilterComponent,EditorLevel2MenuLibraryComponent, LibraryHeaderMenuComponent, InsertLevel2MenuLibraryComponent, LayoutLevel2MenuLibraryComponent
  ,ImportedBlocksExtendedComponent, InsertCoverPageComponent, ReviewLevel2MenuLibraryComponent ],
  imports: [
    PipesModule,
    CommonModule,
    ThemeModule,
    NgSelectModule,
    ContextMenuModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    NbAlertModule,
    NgxUiLoaderModule,
    AdminRoutingModule,
    NbMenuModule.forRoot(),
    TreeviewModule.forRoot(),
    MiscellaneousModule,
    MatButtonModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatTreeModule,
    CommonProjectDesignModule,
    // configure the imports
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
    PrivacyLegalModule,
    LayoutModule,
    CommonProjectDesignModule,
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
    AdminComponent,
    FilterManageLibraryComponent,
    CreateBlockAttributesComponent,
    CreateStackAttributesComponent,
    EditBlockAttributesComponent,
    EditStackAttributesComponent,
    ImportedBlocksExtendedComponent,
    BlockSuggestionFilterComponent,
    InsertCoverPageComponent
    // DefineColorsComponent

  ],
  providers: [AuthguardService, StorageService,
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AdminModule { }


// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}