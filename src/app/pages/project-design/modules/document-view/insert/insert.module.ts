import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbbreviationsComponent } from './abbreviations/abbreviations.component';
import { ViewAbbLevel2MenuComponent } from './view-abbreviations/view-abb-level2-menu/view-abb-level2-menu.component';
import { HyperlinkComponent } from './hyperlink/hyperlink.component';
import { CrossReferenceComponent } from './cross-reference/cross-reference.component';
import { ImportTransactionsComponent } from './import-transactions/import-transactions.component';
import { ThemeModule, HttpLoaderFactory } from '../../../../../@theme/theme.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { SymbolsComponent } from './symbols/symbols.component';
import { IndentationLevelComponent } from './indentation-level/indentation-level.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@NgModule({
  declarations: [ImportTransactionsComponent, IndentationLevelComponent],
  imports: [
    CommonModule,
    ThemeModule,
    NgxUiLoaderModule,
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
  entryComponents: [
    ImportTransactionsComponent,
    IndentationLevelComponent
  ]
})
export class InsertModule { }
