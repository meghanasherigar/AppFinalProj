import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { PrivacyStatementComponent } from './sections/privacy-statement/privacy-statement.component';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../shared/services/alert.service'
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { RegionComponent } from './content/region/region.component';
import { IconViewComponent } from './icon-view.component';
import { ProjectDesignLevel2MenuComponent } from './top-level-menu/project-design-level2-menu/project-design-level2-menu.component';
import { ProjectDesignerHeaderComponent } from './project-designer-header/project-designer-header.component';
import { TemplateListComponent } from './templates-deliverables/template-list/template-list.component';
import { TemplateLevel2MenuComponent } from './top-level-menu/template-level2-menu/template-level2-menu.component';
import { ManageTemplateDeliverableComponent } from './templates-deliverables/manage-template-deliverable/manage-template-deliverable.component';
import { EditorLevel2MenuComponent } from './top-level-menu/editor-level2-menu/editor-level2-menu.component';
import { EditorRegionComponent } from './manage-blocks/extended-view/editor-region/editor-region.component';
import { InsertLevel2MenuComponent } from '../document-view/insert/insert-level2-menu/insert-level2-menu.component';
import { LayoutLevel2MenuComponent } from '../document-view/layout/layout-level2-menu/layout-level2-menu.component';
import { TaskLevel2MenuComponent } from '../document-view/tasks/task-level2-menu/task-level2-menu.component';
import { ManageAppendicesComponent } from './appendices/manage-appendices/manage-appendices.component';
import { AppendicesLevel2MenuComponent } from './top-level-menu/appendices-level2-menu/appendices-level2-menu.component';
import { ReviewLevel2Component } from '../document-view/review/review-level2/review-level2.component';

const routes: Routes = [
  {
    path: 'projectdesignMain/iconViewMain',
    component: IconViewComponent,
    children: [
      {
        path: 'iconViewRegion',
        component: RegionComponent,
      },
      {
        path: 'templatelist',
        component: TemplateListComponent,
      },
      {
        path: 'editorregion',
        component: EditorRegionComponent,
      },
      {
        path: 'managetemplatedeliverable',
        component: ManageTemplateDeliverableComponent
      },
      {
        path: 'iconViewLevel2Menu',
        component: ProjectDesignLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'templatelevel2menu',
        component: TemplateLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'editorlevel2menu',
        component: EditorLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'insertlevel2menu',
        component: InsertLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'layoutlevel2menu',
        component: LayoutLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'reviewlevel2menu',
        component: ReviewLevel2Component,
        outlet: 'level2Menu',
      },
      {
        path: 'tasklevel2menu',
        component: TaskLevel2MenuComponent,
        outlet: 'level2Menu'
      },
      {
        path: 'iconviewtopmenu',
        component: ProjectDesignerHeaderComponent,
        outlet: 'topmenu',
      },
      {
        path: 'manageappendices',
        component: ManageAppendicesComponent
      },
      {
        path: 'appendiceslevel2menu',
        component: AppendicesLevel2MenuComponent,
        outlet: 'level2Menu'
      },
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  exports: [RouterModule, CommonModule],
  providers: [AlertService]
})
export class IconViewRoutingModule {
}

