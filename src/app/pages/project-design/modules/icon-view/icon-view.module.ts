import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { LibraryComponent } from './content/region/library/library.component';
import { ContentComponent } from './content/region/library/content/content.component';
import { HeaderComponent } from './content/region/library/header/header.component';
import { RegionComponent } from './content/region/region.component';
import { IconViewComponent } from './icon-view.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NbAlertModule, NbMenuModule, NbContextMenuModule } from '@nebular/theme';
import { Routes, RouterModule } from '@angular/router';
import { ThemeModule, HttpLoaderFactory } from '../../../../@theme/theme.module';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { AuthInterceptor } from '../../../../@core/auth/authInterceptor';
import { AuthguardService } from '../../../../@core/services/auth-guard/authguard.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { StorageService } from '../../../../@core/services/storage/storage.service';
import { NestableModule } from 'ngx-nestable';
import { MatButtonModule, MatToolbarModule, MatSlideToggleModule, MatIconModule, MatCheckboxModule, MatFormFieldModule, MatTreeModule } from '@angular/material';
// import { FlexLayoutModule } from '@angular/flex-layout';
import { ProjectDesignLevel2MenuComponent } from './top-level-menu/project-design-level2-menu/project-design-level2-menu.component';
import { TemplatesComponent } from './content/region/templates/templates.component';
import { TemplateContentComponent } from './content/region/templates/content/content.component';
import { TemplateHeaderComponent } from './content/region/templates/header/header.component';
import { DeliverablesComponent } from './content/region/deliverables/deliverables.component';
import { DeliverablesContentComponent } from './content/region/deliverables/content/content.component';
import { DeliverablesHeaderComponent } from './content/region/deliverables/header/header.component';
import { CreateBlockComponent } from '../icon-view/manage-blocks/create-block/create-block.component'
import { NbDialogModule, NbPopoverModule } from '@nebular/theme';
import { CKEditorModule } from 'ng2-ckeditor';
import { CreateBlockAttributesComponent } from '../icon-view/manage-blocks/create-block-attributes/create-block-attributes.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DeliverableBlockComponent } from './content/region/templates/deliverable-block/deliverable-block.component';
import { CreateStackAttributesComponent } from '../icon-view/manage-stacks/create-stack-attributes/create-stack-attributes.component'
import { EditBlockAttributesComponent } from '../icon-view/manage-blocks/edit-block-attributes/edit-block-attributes.component'
import { TreeviewModule } from 'ngx-treeview';
import { ContextMenuModule } from 'ngx-contextmenu';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { ViewBlockAttributesPopoverComponent } from '../icon-view/manage-blocks/view-block-attributes-popover/view-block-attributes-popover.component'
import { IconViewRoutingModule } from './icon-view-routing.module';
import { AttributeViewComponent } from './content/region/library/attribute-view/attribute-view.component';
import { DeliverableAttributeViewComponent } from './content/region/deliverables/deliverable-attribute-view/deliverable-attribute-view.component';
import { TemplateAttributeViewComponent } from './content/region/templates/template-attribute-view/template-attribute-view.component';
import { EditBlockComponent } from './manage-blocks/extended-view/edit-block/edit-block.component';
import { FilterBlockPopoverComponent } from './manage-blocks/filter-block-popover/filter-block-popover.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ViewStackAttributesPopoverComponent } from './manage-stacks/view-stack-attributes-popover/view-stack-attributes-popover.component';
import { EditStackAttributesComponent } from './manage-stacks/edit-stack-attributes/edit-stack-attributes.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FilterDeliverablePopoverComponent } from './manage-blocks/filter-deliverable-popover/filter-deliverable-popover.component';
import { ImportedBlocksExtendedComponent } from './block-importer/imported-blocks-extended/imported-blocks-extended.component';
import { AssignToComponent } from './content/region/templates/assign-to/assign-to.component';
import { ProjectDesignerHeaderComponent } from './project-designer-header/project-designer-header.component';
import { TemplateListComponent } from './templates-deliverables/template-list/template-list.component';
import { TemplateLevel2MenuComponent } from './top-level-menu/template-level2-menu/template-level2-menu.component';
import { ManageTemplateDeliverableComponent } from './templates-deliverables/manage-template-deliverable/manage-template-deliverable.component';
import { Ng2SmartTableModule } from '../../../../@core/components/ng2-smart-table';
import { EditorLevel2MenuComponent } from './top-level-menu/editor-level2-menu/editor-level2-menu.component';
import { EditorRegionComponent } from './manage-blocks/extended-view/editor-region/editor-region.component';
import { EditBlockContentComponent } from './manage-blocks/extended-view/edit-block-content/edit-block-content.component';
import { CreateTemplateComponent } from './templates-deliverables/create-template/create-template.component';
import { AssociateDeliverablesComponent } from './templates-deliverables/associate-deliverables/associate-deliverables.component';
import { DeliverableListComponent } from './templates-deliverables/deliverable-list/deliverable-list.component';
import { GenerateReportComponent } from './report-generation/generate-report/generate-report.component';
// import { WatermarkComponent } from '../document-view/layout/watermark/watermark.component';
import { EditorFullViewComponent, SafeHtmlPipe } from './manage-blocks/extended-view/editor-full-view/editor-full-view.component';
import { EditorBlockAttributesComponent } from './manage-blocks/extended-view/editor-block-attributes/editor-block-attributes.component';
import { Theme3Module } from './content/themes/theme3/theme3.module';
import { FilterLibraryComponent } from './manage-blocks/filter-library/filter-library.component';
import { SuggestBlockComponent } from './content/region/templates/suggest-block/suggest-block.component';
import { GenerationHistoryComponent } from './templates-deliverables/generation-history/generation-history.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ImportTemplateComponent } from './block-importer/import-template/import-template.component';
import { TaskLevel2MenuComponent } from '../document-view/tasks/task-level2-menu/task-level2-menu.component';
import { Theme2Module } from './content/themes/theme2/theme2.module';
import { Theme1Module } from './content/themes/theme1/theme1.module';
import { BlockStaffingComponent, AppCheckboxComponent, AppCheckboxRemoveComponent, AppCheckboxEditComponent } from './manage-blocks/block-staffing/block-staffing.component';
import { AddToLibraryComponent } from './manage-blocks/add-to-library/add-to-library.component';
import { ImportedBlocksPdfHeaderComponent } from '../../../admin/block-importer/imported-blocks-pdf-header/imported-blocks-pdf-header.component';
import { ImportedBlocksPdfComponent } from '../../../admin/block-importer/imported-blocks-pdf/imported-blocks-pdf.component';
import { InsertLevel2MenuComponent } from '../document-view/insert/insert-level2-menu/insert-level2-menu.component';
import { ViewAbbLevel2MenuComponent } from '../document-view/insert/view-abbreviations/view-abb-level2-menu/view-abb-level2-menu.component';
import { HyperlinkComponent } from '../document-view/insert/hyperlink/hyperlink.component';
// import { DropDownTypeComponent } from '../document-view/tasks/questions-type/drop-down-type-content/drop-down-type/drop-down-type.component';
import { LogicaltypeComponent } from '../document-view/tasks/questions-type/logicaltype/logicaltype.component';
// import { LayoutLevel2MenuComponent } from '../document-view/layout/layout-level2-menu/layout-level2-menu.component';
import { CommonProjectDesignModule } from '../../common-project-design/common-project-design.module';
import { ManageAppendicesComponent, DeliverableDataComponent } from './appendices/manage-appendices/manage-appendices.component';
import { AppendicesLevel2MenuComponent } from './top-level-menu/appendices-level2-menu/appendices-level2-menu.component';
import { UploadAppendicesComponent } from './appendices/upload-appendices/upload-appendices.component';
import { AssociateAppendicesComponent } from './appendices/associate-appendices/associate-appendices.component';
import { DiaasociateAppendicesComponent } from './appendices/diaasociate-appendices/diaasociate-appendices.component';
import { ReviewLevel2Component } from '../document-view/review/review-level2/review-level2.component';
import { LibrarySuggestedBlocksComponent } from './library-block-suggestions/library-suggested-blocks/library-suggested-blocks.component';
import { LibrarySuggestedBlocksExtendedComponent } from './library-block-suggestions/library-suggested-blocks-extended/library-suggested-blocks-extended.component';
import { LayoutModule } from '../document-view/layout/layout.module';
import { EditorCkToolsComponent } from './top-level-menu/editor-ck-tools/editor-ck-tools.component';
import { CachingInterceptor } from '../../../../@core/cache/cacheInterceptor';
import { EditAnswerComponent } from './manage-blocks/extended-view/edit-answer/edit-answer.component';
import { DeliverableGroupingComponent } from './templates-deliverables/deliverable-group/deliverable-grouping/deliverable-grouping.component';
import { DeliverableGroupInfoComponent } from './templates-deliverables/deliverable-group/deliverable-group-info/deliverable-group-info.component';
import { AddDeliverableGroupComponent } from './templates-deliverables/deliverable-group/add-deliverable-group/add-deliverable-group.component';
import { BlocksEditTagComponent, BlockEditTagInLineComponent } from './library-block-suggestions/blocks-edit-tag/blocks-edit-tag.component';
import { EditDeliverableGroupComponent } from './templates-deliverables/deliverable-group/edit-deliverable-group/edit-deliverable-group.component';
import { PreviewDocViewComponent } from './report-generation/preview-doc-view/preview-doc-view.component';
// import { SimplePdfViewerModule } from 'simple-pdf-viewer';
import { InsertCoverPageComponent } from './manage-blocks/extended-view/insert-cover-page/insert-cover-page.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
@NgModule({
  declarations: [LibraryComponent, ContentComponent, HeaderComponent, RegionComponent,
    IconViewComponent, ProjectDesignLevel2MenuComponent, TemplatesComponent, TemplateContentComponent, TemplateHeaderComponent,
    CreateBlockComponent, FilterBlockPopoverComponent, FilterDeliverablePopoverComponent, DeliverablesComponent,
    DeliverablesContentComponent, DeliverablesHeaderComponent, CreateBlockAttributesComponent, DeliverableBlockComponent,
    CreateStackAttributesComponent,
    EditBlockAttributesComponent, ViewBlockAttributesPopoverComponent, AttributeViewComponent, DeliverableAttributeViewComponent,
    TemplateAttributeViewComponent, EditBlockComponent, EditorCkToolsComponent,
    ViewStackAttributesPopoverComponent, EditStackAttributesComponent, ImportedBlocksExtendedComponent, AssignToComponent,
    ProjectDesignerHeaderComponent, TemplateListComponent, TemplateLevel2MenuComponent, ManageTemplateDeliverableComponent,
    TemplateLevel2MenuComponent, EditorLevel2MenuComponent, EditorRegionComponent, EditBlockContentComponent,
    CreateTemplateComponent, AssociateDeliverablesComponent, DeliverableListComponent, GenerateReportComponent,
    EditorFullViewComponent, EditorBlockAttributesComponent, GenerationHistoryComponent, SuggestBlockComponent,
    FilterLibraryComponent, ImportTemplateComponent, BlockStaffingComponent, AddToLibraryComponent, ImportedBlocksPdfHeaderComponent,
    ImportedBlocksPdfComponent, AppCheckboxComponent, AppCheckboxRemoveComponent, AppCheckboxEditComponent, InsertLevel2MenuComponent,
    HyperlinkComponent, TaskLevel2MenuComponent, SafeHtmlPipe, LogicaltypeComponent, ManageAppendicesComponent,
    AppendicesLevel2MenuComponent, UploadAppendicesComponent, AssociateAppendicesComponent, DiaasociateAppendicesComponent,
    LibrarySuggestedBlocksComponent, LibrarySuggestedBlocksExtendedComponent, ReviewLevel2Component,
    EditAnswerComponent,DeliverableGroupingComponent, DeliverableGroupInfoComponent, AddDeliverableGroupComponent, EditDeliverableGroupComponent,BlocksEditTagComponent, BlockEditTagInLineComponent,
    InsertCoverPageComponent,PreviewDocViewComponent],
  imports: [
    CommonModule,
    ThemeModule,
    IconViewRoutingModule,
    NbAlertModule,
    NbMenuModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NestableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSlideToggleModule,
    NgMultiSelectDropDownModule,
    
    // FlexLayoutModule,
    // configure the imports
    DragDropModule,
    MatFormFieldModule,
    Ng2SmartTableModule,
    MatCheckboxModule,
    MatTreeModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
    NbDialogModule.forRoot(),
    NbContextMenuModule,
    NbPopoverModule,
    ContextMenuModule.forRoot(),
    CKEditorModule,
    NgSelectModule,
    InfiniteScrollModule,
    ScrollDispatchModule,
    LayoutModule,
    NgxUiLoaderModule,
    TreeviewModule.forRoot(),
    Theme3Module,
    Theme2Module,
    Theme1Module,
    CommonProjectDesignModule,
    // SimplePdfViewerModule,
    PdfViewerModule,
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
  entryComponents: [IconViewComponent,
    CreateBlockAttributesComponent,
    DeliverableBlockComponent,
    SuggestBlockComponent,
    CreateStackAttributesComponent,
    ViewBlockAttributesPopoverComponent,
    EditBlockAttributesComponent,
    FilterBlockPopoverComponent,
    FilterDeliverablePopoverComponent,
    FilterLibraryComponent,
    ViewStackAttributesPopoverComponent,
    EditStackAttributesComponent,
    ImportedBlocksExtendedComponent,
    AssignToComponent,
    CreateTemplateComponent,
    AssociateDeliverablesComponent,
    GenerateReportComponent,
    ImportTemplateComponent,
    AddToLibraryComponent,
    ImportedBlocksPdfHeaderComponent,
    ImportedBlocksPdfComponent,
    AppCheckboxComponent,
    AppCheckboxRemoveComponent,
    AppCheckboxEditComponent,
    HyperlinkComponent,
    LogicaltypeComponent,
    LibrarySuggestedBlocksExtendedComponent,
    DeliverableDataComponent,
    EditAnswerComponent,
    DeliverableGroupInfoComponent,
    AddDeliverableGroupComponent,
    EditDeliverableGroupComponent,
    BlocksEditTagComponent,
    BlockEditTagInLineComponent,
    PreviewDocViewComponent,
    InsertCoverPageComponent
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
export class IconViewModule { }
