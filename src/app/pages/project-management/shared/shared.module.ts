import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderSummaryComponent } from './ui/header-summary/header-summary.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GridCustomColumnComponent } from './grid-custom-column/grid-custom-column.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NbMomentDateModule } from '@nebular/moment';
import { ThemeModule } from '../../../@theme/theme.module';
import { InfoDialogComponent } from './ui/info-dialog/info-dialog.component';
import { SearchComponent } from './ui/search/search.component';
import { SearchPipe } from './ui/search.pipe';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
@NgModule({
  declarations: [HeaderSummaryComponent, GridCustomColumnComponent, InfoDialogComponent, SearchPipe, SearchComponent],
  imports: [
    CommonModule,
     NgbModule,
    ThemeModule, BsDatepickerModule, NbMomentDateModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [],
  exports:[HeaderSummaryComponent, GridCustomColumnComponent,InfoDialogComponent, SearchPipe, SearchComponent],
  entryComponents: [HeaderSummaryComponent, GridCustomColumnComponent,InfoDialogComponent]
})
export class SharedModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
