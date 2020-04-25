import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Theme2MainPageComponent } from './theme2-main-page/theme2-main-page.component';
import { Theme2LibraryHeaderComponent } from './library/library-header/theme2-library-header.component';
import { Theme2LibraryContentComponent } from './library/library-content/theme2-library-content.component';
import { Theme2TemplateDeliverableHeaderComponent } from './template-deliverables/theme2-template-deliverable-header/theme2-template-deliverable-header.component';
import { Theme2TemplateDeliverableContentComponent } from './template-deliverables/theme2-template-deliverable-content/theme2-template-deliverable-content.component';
import { TreeviewModule } from 'ngx-treeview';
import { ThemeModule } from '../../../../../../../@theme/theme.module';
import { ThemeCommonModule } from '../common/theme-common.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [Theme2MainPageComponent, Theme2TemplateDeliverableHeaderComponent, Theme2TemplateDeliverableContentComponent, Theme2LibraryHeaderComponent, Theme2LibraryContentComponent],
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
  exports: [Theme2MainPageComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
})
export class Theme2Module { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
