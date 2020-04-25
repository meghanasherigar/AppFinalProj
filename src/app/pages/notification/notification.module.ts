import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NbAlertModule, NbMenuModule, NbDatepickerModule } from '@nebular/theme';
import { Routes, RouterModule } from '@angular/router';
import { ThemeModule } from '../../@theme/theme.module';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import {MatExpansionModule} from '@angular/material/expansion';

import { CommonModule } from '@angular/common';
import { MiscellaneousModule } from '../miscellaneous/miscellaneous.module';
import { AuthInterceptor } from '../../@core/auth/authInterceptor';

import { AuthguardService } from '../../@core/services/auth-guard/authguard.service';
import { StorageService } from '../../@core/services/storage/storage.service';

import { CKEditorModule } from 'ng2-ckeditor';
// import { SimplePdfViewerModule } from 'simple-pdf-viewer';

import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { CachingInterceptor } from '../../@core/cache/cacheInterceptor';
import { NotificationComponent } from './notification.component';
import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationPageComponent, ActionRequestedComponent, NotificationLink } from './notification-page/notification-page.component';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Ng2SmartTableModule } from '../../@core/components/ng2-smart-table';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  {
    path: 'notificationMain',
    component: NotificationComponent,
    children: [
      {
        path: 'notificationPage',
        component: NotificationPageComponent,
      },
      
    ]
  },
];

@NgModule({
  declarations: [NotificationComponent, NotificationPageComponent, ActionRequestedComponent, NotificationLink],
  imports: [
    CommonModule,
    ThemeModule,
    NgxUiLoaderModule,
    NbAlertModule,
    NgxUiLoaderModule,
    NotificationRoutingModule,
    CKEditorModule,
    NbMenuModule.forRoot(),
    MiscellaneousModule,
    // SimplePdfViewerModule,
    Ng2SmartTableModule,
    NgSelectModule,
    // configure the imports
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
    // RouterModule.forChild(routes),
    BsDatepickerModule.forRoot(),
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
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  exports: [RouterModule],
  entryComponents: [
    NotificationComponent,
    ActionRequestedComponent,
    NotificationLink
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
export class NotificationModule { }


// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
