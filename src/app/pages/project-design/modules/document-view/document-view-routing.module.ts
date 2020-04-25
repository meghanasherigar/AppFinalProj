import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { PrivacyStatementComponent } from './sections/privacy-statement/privacy-statement.component';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../shared/services/alert.service'
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DocumentViewComponent } from './document-view/document-view.component';
import { InfoRequestListComponent } from './info-gathering/info-request-list/info-request-list.component';
import { ProjectDesignLevel2MenuComponent } from '../icon-view/top-level-menu/project-design-level2-menu/project-design-level2-menu.component';
import { ProjectDesignerHeaderComponent } from '../icon-view/project-designer-header/project-designer-header.component';
import { CreateInfoComponent } from './info-gathering/create-info/create-info.component';
import { InfoSettingsComponent } from './info-gathering/create-info/info-settings/info-settings.component';
import { CoverPageComponent } from './info-gathering/cover-page/cover-page.component';
import { AnswertagMenuComponent } from './answertag/answertag-menu/answertag-menu.component';
import { AnswertagTabsComponent } from './answertag/answertag-tabs/answertag-tabs.component';
import { AnswertagVariablesComponent } from './answertag/answertag-variables/answertag-variables.component';
import { InformationPreviewComponent } from './info-gathering/information-preview/information-preview.component';
import { InsertLevel2MenuComponent } from './insert/insert-level2-menu/insert-level2-menu.component';
import { ViewAbbreviationsComponent } from './insert/view-abbreviations/view-abbreviations.component';
import { ViewAbbLevel2MenuComponent } from './insert/view-abbreviations/view-abb-level2-menu/view-abb-level2-menu.component';
import { InfoRequestListLevel2MenuComponent } from './info-gathering/info-request-list-level2-menu/info-request-list-level2-menu.component';
import { SelectQuestionLevel2MenuComponent } from './info-gathering/create-info/select-question-level2-menu/select-question-level2-menu.component';
import { SelectQuestionsComponent } from './info-gathering/create-info/select-questions/select-questions.component';
import { InfoRequestLevel2MenuComponent } from './info-request/info-request-level2-menu/info-request-level2-menu.component';
import { InfoRequestDetailsComponent } from './info-request/info-request-details/info-request-details.component';
import { AnswerLevel2MenuComponent } from './answer-tag/answer-level2-menu/answer-level2-menu.component';
const routes: Routes = [
  {
    path: 'projectdesignMain/documentViewMain',
    component: DocumentViewComponent,
    children: [
      {
        path: 'answer-level2-menu',
        component: AnswerLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'info-list',
        component: InfoRequestListComponent,
      },
      {
        path: 'answertag-menu',
        component: AnswertagMenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'answertag-tab',
        component: AnswertagTabsComponent,
      },
      {
        path: 'answertag-variable',
        component: AnswertagVariablesComponent,
      },
      {
        path: 'info-level2-menu',
        component: InfoRequestListLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'viewAbbLevel2Menu',
        component: ViewAbbLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'iconViewLevel2Menu',
        component: ProjectDesignLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'iconviewtopmenu',
        component: ProjectDesignerHeaderComponent,
        outlet: 'topmenu',
      },
      {
        path: 'viewabbreviations',
        component: ViewAbbreviationsComponent
      },
      {
        path: 'create-info',
        component: CreateInfoComponent,
        children: [
          {
            path: '',
            component: SelectQuestionsComponent,
          },
          {
            path: 'info-status',
            component: SelectQuestionsComponent,
          },

          {
            path: 'info-settings',
            component: InfoSettingsComponent
          },
          {
            path: 'cover-page',
            component: CoverPageComponent
          },
          {
            path: 'info-preview',
            component: InformationPreviewComponent
          }
        ]
      },
      {
        path: 'info-request-menu',
        component: SelectQuestionLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'inforequest-level2-menu',
        component: InfoRequestLevel2MenuComponent,
        outlet: 'level2Menu',
      },
      {
        path: 'info-request',
        component: InfoRequestDetailsComponent,
      },
    ]
  }
]
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
export class DocumentViewRoutingModule {
}