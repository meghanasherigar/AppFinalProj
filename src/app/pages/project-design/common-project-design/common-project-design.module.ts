import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateQuestionComponent } from '../modules/document-view/tasks/create-question/create-question.component';
import { AuthguardService } from '../../../@core/services/auth-guard/authguard.service';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from '../../../@core/auth/authInterceptor';
import { AuthService } from '../../../shared/services/auth.service';
import { StorageService } from '../../../@core/services/storage/storage.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ThemeModule, HttpLoaderFactory } from '../../../@theme/theme.module';
import { NbDialogModule, NbPopoverModule, NbContextMenuModule } from '@nebular/theme';
import { CKEditorModule } from 'ng2-ckeditor';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { DropDownTypeComponent } from '../modules/document-view/tasks/questions-type/drop-down-type-content/drop-down-type/drop-down-type.component';
import { WatermarkComponent } from '../modules/document-view/layout/watermark/watermark.component';
import { QuestionsListComponent } from '../modules/document-view/tasks/questions-list/questions-list.component'
import { TableTypeQuestionComponent } from '../modules/document-view/tasks/table-type-question/table-type-question.component';
import { PipesModule } from '../../../shared/pipes/pipes.module';
import { CachingInterceptor } from '../../../@core/cache/cacheInterceptor';
import { SymbolsComponent } from '../modules/document-view/insert/symbols/symbols.component';
import { ImportBlocksProcessComponent } from '../modules/icon-view/block-importer/import-blocks-process/import-blocks-process.component';
import { BlockImporterAttributesComponent } from '../modules/icon-view/block-importer/block-importer-attributes/block-importer-attributes.component';
import { ImportedBlocksComponent } from '../modules/icon-view/block-importer/imported-blocks/imported-blocks.component';
import { MatTreeModule, MatButtonModule, MatIconModule, MatToolbarModule, MatSlideToggleModule, MatAutocompleteModule, MatInputModule, MatFormFieldModule, MatCheckboxModule } from '@angular/material';
import { ContextMenuModule } from 'ngx-contextmenu';
import { TreeviewModule } from 'ngx-treeview';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImportedBlocksPartialMergeComponent } from '../modules/icon-view/block-importer/imported-blocks/imported-blocks-partial-merge/imported-blocks-partial-merge.component';
import { CustomMarginComponent } from '../modules/document-view/layout/custom-margin/custom-margin.component';
import { DefineColorsComponent } from '../modules/icon-view/define-colors/define-colors.component';
import { ParagraphSpacing } from '../../../@models/projectDesigner/block';
import { ParagraphSpacingComponent } from '../modules/document-view/layout/paragraph-spacing/paragraph-spacing.component';
import { CrossReferenceComponent } from '../modules/document-view/insert/cross-reference/cross-reference.component';
import { BookMarkComponent } from '../modules/document-view/insert/book-mark/book-mark.component';
import { AbbreviationsComponent } from '../modules/document-view/insert/abbreviations/abbreviations.component';
import { ViewAbbLevel2MenuComponent } from '../modules/document-view/insert/view-abbreviations/view-abb-level2-menu/view-abb-level2-menu.component';
import { ViewAbbreviationsComponent, AppTextBoxFullFormComponent, AppTextBoxAbbComponent } from '../modules/document-view/insert/view-abbreviations/view-abbreviations.component';
import { Ng2SmartTableModule } from '../../../@core/components/ng2-smart-table';

@NgModule({
  declarations: [CreateQuestionComponent,DropDownTypeComponent,WatermarkComponent,QuestionsListComponent,TableTypeQuestionComponent,SymbolsComponent,ImportBlocksProcessComponent,BlockImporterAttributesComponent,
    ImportedBlocksComponent,ImportedBlocksPartialMergeComponent,CustomMarginComponent,DefineColorsComponent,ParagraphSpacingComponent,
    CrossReferenceComponent,
    BookMarkComponent,AbbreviationsComponent,ViewAbbLevel2MenuComponent,AppTextBoxFullFormComponent,
    AppTextBoxAbbComponent,ViewAbbreviationsComponent],
  imports: [
    CommonModule,
    PipesModule,
    ThemeModule,
    NbDialogModule,
    NbPopoverModule,
    CKEditorModule,
    NgxUiLoaderModule,
    InfiniteScrollModule,
    ScrollDispatchModule,
    NbContextMenuModule,
    ContextMenuModule.forRoot(),
    MatTreeModule,
    TreeviewModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    Ng2SmartTableModule,
    NgSelectModule,
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
    CreateQuestionComponent,
    DropDownTypeComponent,
    QuestionsListComponent,
    BlockImporterAttributesComponent,
    ImportedBlocksComponent
  ],
  entryComponents: [
    WatermarkComponent,
    SymbolsComponent,
    TableTypeQuestionComponent,
    ImportBlocksProcessComponent,
    ImportedBlocksPartialMergeComponent,
    CustomMarginComponent,
    DefineColorsComponent,
    ParagraphSpacingComponent,
    CrossReferenceComponent,
    BookMarkComponent,
    AbbreviationsComponent,
    AppTextBoxAbbComponent,
    AppTextBoxFullFormComponent
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
export class CommonProjectDesignModule { }
