import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectManagementComponent } from './project-management.component';
import { DeliverableListComponent } from './deliverable/deliverable-list/deliverable-list.component';
import { BlockListComponent } from './blocks/block-list/block-list.component';
import { ProjectManagementHeaderComponent } from './project-management-header/project-management-header.component';
import { DeliverableLevel2Component } from './deliverable/top-level-menu/deliverable-level2/deliverable-level2.component';
import { BlockLevel2Component } from './blocks/top-level-menu/block-level2/block-level2.component';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskLevel2Component } from './tasks/top-level-menu/task-level2/task-level2.component';
import { VisualizationLevel2MenuComponent } from './visualization/top-level-menu/visualization-level2-menu/visualization-level2-menu.component';
import { VisualizationContentComponent } from './visualization/visualization-content/visualization-content/visualization-content.component';

const routes: Routes = [
  {
    path: 'ProjectManagementMain',
    component: ProjectManagementComponent,
    children: [
      {
        path: 'Deliverable',
        component: DeliverableListComponent,
      },
      {
        path:'Blocks',
        component: BlockListComponent
      },
      {
        path: 'tasks',
        component: TaskListComponent,
      },
      {
        path: 'Visualization',
        component: VisualizationContentComponent,
      },
      {
        path: 'DeliverableLevel2Menu',
        component: DeliverableLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'BlocksLevel2Menus',
        component: BlockLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'PMTaskLevel2Menu',
        component: TaskLevel2Component,
        outlet: 'level2Menu'
      },
      {
        path: 'VisualizationLevel2Menu',
        component: VisualizationLevel2MenuComponent,
        outlet: 'level2Menu'
      },
      {
        path: 'ProjectManagementTopMenu',
        component: ProjectManagementHeaderComponent,
        outlet: 'topmenu',
      }
    ],
    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectManagementRoutingModule { }
