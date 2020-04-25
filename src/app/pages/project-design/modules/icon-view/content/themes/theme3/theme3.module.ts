import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Theme3MainPageComponent } from './theme3-main-page/theme3-main-page.component';
import { Theme3TemplateDeliverableHeader1Component } from './template-deliverables-1/theme3-template-deliverable-header1/theme3-template-deliverable-header1.component';
import { Theme3TemplateDeliverableContent1Component } from './template-deliverables-1/theme3-template-deliverable-content1/theme3-template-deliverable-content1.component';
import { TreeviewModule } from 'ngx-treeview';
import { ThemeModule } from '../../../../../../../@theme/theme.module';
import { ThemeCommonModule } from '../common/theme-common.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [Theme3MainPageComponent, Theme3TemplateDeliverableHeader1Component, Theme3TemplateDeliverableContent1Component],
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
  exports: [Theme3MainPageComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
})
export class Theme3Module { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
