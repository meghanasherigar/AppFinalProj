import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { MiscellaneousRoutingModule, routedComponents } from './miscellaneous-routing.module';
import { NotAuthoriseComponent } from './not-authorise/not-authorise.component';
import { NoAccessComponent } from './no-access/no-access.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  imports: [
    ThemeModule,
    MiscellaneousRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

  ],
  declarations: [
    ...routedComponents,
    NotAuthoriseComponent,
    NoAccessComponent,
  ],
})
export class MiscellaneousModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
