import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutLevel2MenuComponent } from './layout-level2-menu/layout-level2-menu.component';
// import { WatermarkComponent } from './watermark/watermark.component';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../../../../shared/pipes/pipes.module';
import { ThemeModule } from '../../../../../@theme/theme.module';
import { HttpClientModule } from '@angular/common/http';
import { NbAccordionModule, NbContextMenuModule, NbPopoverModule } from '@nebular/theme';
import { CommonPagesModule } from '../../../../common/common/common-pages.module';
import { Ng2SmartTableModule } from '../../../../../@core/components/ng2-smart-table';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ContextMenuModule } from 'ngx-contextmenu';
import { LayoutFormatStylingComponent } from './layout-format-styling/layout-format-styling.component';
import { LayoutStylePanelComponent } from './layout-style-panel/layout-style-panel.component';

@NgModule({
  declarations: [LayoutLevel2MenuComponent, LayoutFormatStylingComponent, LayoutStylePanelComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  entryComponents: [
    LayoutFormatStylingComponent,
  ],
  imports: [
    CommonModule,
    PipesModule,
    ThemeModule,
    HttpClientModule,
    NbAccordionModule,
    CommonPagesModule,
    Ng2SmartTableModule,
    TranslateModule,
    NgxUiLoaderModule,
    NbContextMenuModule,
    ContextMenuModule.forRoot(),
    NgMultiSelectDropDownModule,
    BsDatepickerModule.forRoot(),
    NbPopoverModule
  ],
  exports:[
    LayoutStylePanelComponent,
    LayoutFormatStylingComponent
  ]
})
export class LayoutModule { }
