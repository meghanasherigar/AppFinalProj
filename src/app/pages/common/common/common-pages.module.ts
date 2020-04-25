import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule,  MatTreeModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatAutocompleteModule, MatInputModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NbContextMenuModule, NbPopoverModule, NbDialogModule } from '@nebular/theme';
import { ContextMenuModule } from 'ngx-contextmenu';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpLoaderFactory, ThemeModule } from '../../../@theme/theme.module';
import { AuthguardService } from '../../../@core/services/auth-guard/authguard.service';  
import { AuthService } from '../../../shared/services/auth.service';
import { StorageService } from '../../../@core/services/storage/storage.service';
import { AuthInterceptor } from '../../../@core/auth/authInterceptor';
import { TreeviewModule } from 'ngx-treeview';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
 import { SendmailUserComponent } from '../sendmail-user/sendmail-user.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SendemailsComponent } from '../sendemails/sendemails.component';
import { CachingInterceptor } from '../../../@core/cache/cacheInterceptor';

@NgModule({
  declarations: [SendmailUserComponent, SendemailsComponent],
  imports: [
    CommonModule,
    ThemeModule,
    MatTreeModule,
    MatCheckboxModule,
    MatChipsModule,
    CKEditorModule,
    NgSelectModule,
    MatAutocompleteModule,
    NgMultiSelectDropDownModule,
    MatInputModule,
    NbPopoverModule,
    MatFormFieldModule,
    MatIconModule,
    NbContextMenuModule,
    ContextMenuModule,
    NgxUiLoaderModule,
    NbDialogModule.forRoot(),
    TreeviewModule.forRoot(),
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
  exports: [
    SendmailUserComponent,
    SendemailsComponent
  ],
  entryComponents: [
    SendmailUserComponent,
    SendemailsComponent
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
export class CommonPagesModule { }
