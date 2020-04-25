import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { UserRoutingModule } from './user-routing.module';
import { ThemeModule } from '../../@theme/theme.module';

import { CreateUserComponent } from './create-user/create-user.component';
import { UserComponent } from './user.component';

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { NbAlertModule } from '@nebular/theme';

const COMPONENTS = [
  UserComponent,
  CreateUserComponent,
];

const ENTRY_COMPONENTS = [
  CreateUserComponent,
];

@NgModule({
  imports: [
    ThemeModule,
    NbAlertModule,
    UserRoutingModule,
    // configure the imports
    HttpClientModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    ...COMPONENTS,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
],
  entryComponents: [
    ...ENTRY_COMPONENTS,
  ],
})
export class UserModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
