import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateDeliverableHeaderIconsComponent } from './template-deliverable-header-icons/template-deliverable-header-icons.component';
import { TemplateDeliverableHeaderComponent } from './template-deliverable-header/template-deliverable-header.component';
import { DeliverableContentComponent } from './deliverable-content/deliverable-content.component';
import { TemplateContentComponent } from './template-content/template-content.component';
import { MatTreeModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatAutocompleteModule, MatInputModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NbContextMenuModule, NbPopoverModule, NbDialogModule } from '@nebular/theme';
import { ContextMenuModule } from 'ngx-contextmenu';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgSelectModule } from '@ng-select/ng-select';
import { CreateBlockAttributesComponent } from './manage-blocks/create-block-attributes/create-block-attributes.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpLoaderFactory, ThemeModule } from '../../../../../../../@theme/theme.module';
import { AuthguardService } from '../../../../../../../@core/services/auth-guard/authguard.service';
import { AuthService } from '../../../../../../../shared/services/auth.service';
import { StorageService } from '../../../../../../../@core/services/storage/storage.service';
import { AuthInterceptor } from '../../../../../../../@core/auth/authInterceptor';
import { TreeviewModule } from 'ngx-treeview';
import { EditBlockAttributesComponent } from './manage-blocks/edit-block-attributes/edit-block-attributes.component';
import { ViewBlockAttributesPopoverComponent } from './manage-blocks/view-block-attributes-popover/view-block-attributes-popover.component';
import { CreateStackAttributesComponent } from './manage-stacks/create-stack-attributes/create-stack-attributes.component';
import { EditStackAttributesComponent } from './manage-stacks/edit-stack-attributes/edit-stack-attributes.component';
import { ViewStackAttributesPopoverComponent } from './manage-stacks/view-stack-attributes-popover/view-stack-attributes-popover.component';
import { LinkToDeliverableComponent } from './link-to-deliverable/link-to-deliverable.component';
import { AssignToComponent } from './assign-to/assign-to.component';
import { FilterTemplateComponent } from './manage-blocks/filter-template/filter-template.component';
import { FilterDeliverableComponent } from './manage-blocks/filter-deliverable/filter-deliverable.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LibraryContentComponent } from './library-content/library-content.component';
import { LibraryHeaderIconsComponent } from './library-header-icons/library-header-icons.component';
import { FilterLibraryComponent } from './manage-blocks/filter-library/filter-library.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { CachingInterceptor } from '../../../../../../../@core/cache/cacheInterceptor';
import { Ng2SmartTableModule } from '../../../../../../../@core/components/ng2-smart-table';
import { LinkToGroupDeliverableComponent } from './link-to-deliverable/link-to-group-deliverable/link-to-group-deliverable.component';

@NgModule({
  declarations: [TemplateDeliverableHeaderComponent, TemplateDeliverableHeaderIconsComponent, TemplateContentComponent, DeliverableContentComponent, CreateBlockAttributesComponent, EditBlockAttributesComponent, ViewBlockAttributesPopoverComponent, CreateStackAttributesComponent, EditStackAttributesComponent, ViewStackAttributesPopoverComponent, LinkToDeliverableComponent, AssignToComponent, FilterTemplateComponent, FilterDeliverableComponent, LibraryContentComponent, LibraryHeaderIconsComponent, FilterLibraryComponent, LinkToGroupDeliverableComponent],
  imports: [
    CommonModule,
    ThemeModule,
    MatTreeModule,
    MatCheckboxModule,
    DragDropModule,
    NbContextMenuModule,
    NbPopoverModule,
    Ng2SmartTableModule,
    ContextMenuModule.forRoot(),
    CKEditorModule,
    NgSelectModule,
    MatAutocompleteModule,
    NgMultiSelectDropDownModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    NgxUiLoaderModule,
    NbDialogModule.forRoot(),
    TreeviewModule.forRoot(),
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
    TemplateDeliverableHeaderComponent, TemplateDeliverableHeaderIconsComponent, TemplateContentComponent, DeliverableContentComponent, CreateBlockAttributesComponent, EditBlockAttributesComponent, ViewBlockAttributesPopoverComponent,
    CreateStackAttributesComponent, EditStackAttributesComponent, ViewStackAttributesPopoverComponent, LinkToDeliverableComponent, AssignToComponent, FilterTemplateComponent, LibraryContentComponent, LibraryHeaderIconsComponent, FilterDeliverableComponent, FilterLibraryComponent
  ],
  entryComponents: [
    CreateBlockAttributesComponent, EditBlockAttributesComponent, ViewBlockAttributesPopoverComponent, CreateStackAttributesComponent, EditStackAttributesComponent, ViewStackAttributesPopoverComponent, LinkToDeliverableComponent, 
    AssignToComponent, FilterTemplateComponent, FilterDeliverableComponent, FilterLibraryComponent, LinkToGroupDeliverableComponent
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
export class ThemeCommonModule { }
