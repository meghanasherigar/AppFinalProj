import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectManagementRoutingModule } from './project-management-routing.module';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { SharedModule } from './shared/shared.module';
import { NbDialogModule, NbPopoverModule, NbSelectModule, NbDatepickerModule, NbStepperModule } from '@nebular/theme';
import { Ng2SmartTableModule } from '../../@core/components/ng2-smart-table';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ThemeModule } from '../../@theme/theme.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NbDateFnsDateModule } from '@nebular/date-fns';
import { NbMomentDateModule } from '@nebular/moment';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule} from '@ng-select/ng-select';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatInputModule, MatIconModule, MatTreeModule,MatCheckboxModule } from '@angular/material';
import { MatChipsModule } from '@angular/material/chips';

//Components
import { DeliverableListComponent } from './deliverable/deliverable-list/deliverable-list.component';
import { CreateDeliverableComponent } from './deliverable/create-deliverable/create-deliverable.component';
import { EditDeliverableComponent } from './deliverable/edit-deliverable/edit-deliverable.component';
import { BlockListComponent } from './blocks/block-list/block-list.component';
import { ProjectManagementComponent } from './project-management.component';
import { ProjectManagementHeaderComponent } from './project-management-header/project-management-header.component';
import { BlockLevel2Component } from './blocks/top-level-menu/block-level2/block-level2.component';
import { DeliverableLevel2Component } from './deliverable/top-level-menu/deliverable-level2/deliverable-level2.component';
import { DeliverableColumnListComponent } from './deliverable/deliverable-column-list/deliverable-column-list.component';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskLevel2Component } from './tasks/top-level-menu/task-level2/task-level2.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ReAssignComponent } from './tasks/re-assign/re-assign.component';
import { OtherTasksComponent } from './tasks/other-tasks/other-tasks.component';
import { MyTasksComponent } from './tasks/my-tasks/my-tasks.component';
import { CommonPagesModule } from '../common/common/common-pages.module';
import { VisualizationLevel2MenuComponent } from './visualization/top-level-menu/visualization-level2-menu/visualization-level2-menu.component';
import { VisualizationContentComponent } from './visualization/visualization-content/visualization-content/visualization-content.component';
import { CounterPartyComponent } from './visualization/counter-party/counter-party.component';


@NgModule({
  declarations: [DeliverableListComponent, CreateDeliverableComponent, EditDeliverableComponent, BlockListComponent, ProjectManagementComponent, ProjectManagementHeaderComponent,
    BlockLevel2Component, DeliverableLevel2Component, DeliverableColumnListComponent,TaskListComponent, TaskLevel2Component, ReAssignComponent, OtherTasksComponent, MyTasksComponent, VisualizationLevel2MenuComponent, VisualizationContentComponent, CounterPartyComponent],
  imports: [
    NbDialogModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    NbDatepickerModule.forRoot(),
    AngularMultiSelectModule,
    NbSelectModule,
    MatChipsModule,
    NbMomentDateModule,
    NbStepperModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeModule,
    NgSelectModule,
    NbPopoverModule,
    CommonModule,
    ProjectManagementRoutingModule,
    SharedModule,
    Ng2SmartTableModule,
    NgxUiLoaderModule,
    DragDropModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTreeModule,
    MatCheckboxModule,
    CommonPagesModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA
  ],
  entryComponents:[DeliverableColumnListComponent,CreateDeliverableComponent,EditDeliverableComponent, ReAssignComponent, OtherTasksComponent,CounterPartyComponent]
})
export class ProjectManagementModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}