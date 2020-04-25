import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Theme1MainPageComponent } from './theme1-main-page/theme1-main-page.component';
import { TreeviewModule } from 'ngx-treeview';
import { ThemeModule } from '../../../../../../../@theme/theme.module';
import { ThemeCommonModule } from '../common/theme-common.module';
import { Theme1TemplateDeliverableHeaderComponent } from './template-deliverables/theme1-template-deliverable-header/theme1-template-deliverable-header.component';
import { Theme1TemplateDeliverableContentComponent } from './template-deliverables/theme1-template-deliverable-content/theme1-template-deliverable-content.component';
import { Theme1LibraryHeaderComponent } from './library/theme1-library-header/theme1-library-header.component';
import { Theme1LibraryContentComponent } from './library/theme1-library-content/theme1-library-content.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [Theme1MainPageComponent, Theme1TemplateDeliverableHeaderComponent, Theme1TemplateDeliverableContentComponent, Theme1LibraryHeaderComponent, Theme1LibraryContentComponent],
  imports: [
    CommonModule,
    TreeviewModule.forRoot(),
    ThemeModule,
    ThemeCommonModule,
    NgxUiLoaderModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

  ],
  exports: [Theme1MainPageComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
})
export class Theme1Module { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
