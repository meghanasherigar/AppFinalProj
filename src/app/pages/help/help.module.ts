import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NbAlertModule, NbMenuModule } from '@nebular/theme';
import { Routes, RouterModule } from '@angular/router';
import { HelpComponent } from './help.component';
import { LeftNavigationComponent } from './sections/left-navigation/left-navigation.component';
import { ThemeModule } from '../../@theme/theme.module';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import {MatExpansionModule} from '@angular/material/expansion';
import { HelpRoutingModule } from './help-routing.module';
import { CommonModule } from '@angular/common';
import { MiscellaneousModule } from '../miscellaneous/miscellaneous.module';
import { AuthInterceptor } from '../../@core/auth/authInterceptor';
import { ContentFAQComponent } from './sections/content/content-faq/content-faq.component';
import { ContentFaqLevel2Component } from './sections/top-level-menu/content-faq-level2/content-faq-level2.component';
import { AuthguardService } from '../../@core/services/auth-guard/authguard.service';
import { StorageService } from '../../@core/services/storage/storage.service';
import { WhatsNewContentComponent } from './sections/content/whatsnew-content/WhatsNewContentComponent';
import { ContentWhatsnewLevel2Component } from './sections/top-level-menu/content-whatsnew-level2/content-whatsnew-level2.component';
import { CKEditorModule } from 'ng2-ckeditor';
import { UserManualLevel2Component } from './sections/top-level-menu/user-manual-level2/user-manual-level2.component';
import { UserManualComponent } from './sections/user-manual/user-manual.component';
import { ContentViewerComponent } from './sections/content-viewer/content-viewer.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { CachingInterceptor } from '../../@core/cache/cacheInterceptor';
import { PdfViewerModule } from 'ng2-pdf-viewer';

const routes: Routes = [
  {
    path: 'helpMain',
    component: HelpComponent,
    children: [
      {
        path: 'leftNav',
        component: LeftNavigationComponent,
        outlet: 'leftNav',
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
        path: 'whatsNewContentFaq',
        component: WhatsNewContentComponent,
      },
      {
        path: 'WhatsNewLevel2Menu',
        component: ContentWhatsnewLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'UserManual',
        component: UserManualComponent,
      },
      
      {
        path: 'userManualLevel2Menu',
        component: UserManualLevel2Component,
        outlet: 'level2Menu',
      },
      
    ]
  },
];

@NgModule({
  declarations: [HelpComponent, WhatsNewContentComponent, ContentWhatsnewLevel2Component,
    UserManualComponent, UserManualLevel2Component, ContentViewerComponent],
  imports: [
    CommonModule,
    ThemeModule,
    NgxUiLoaderModule,
    NbAlertModule,
    NgxUiLoaderModule,
    HelpRoutingModule,
    CKEditorModule,
    NbMenuModule.forRoot(),
    MiscellaneousModule,
    PdfViewerModule,
    // configure the imports
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
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
    HelpComponent,
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
export class HelpModule { }


// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}