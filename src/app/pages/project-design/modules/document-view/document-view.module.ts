import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentViewComponent } from './document-view/document-view.component';
import { DocumentViewRoutingModule } from './document-view-routing.module';
import { InfoRequestListComponent, LinkViewComponent, LinkViewCoReviewerComponent, InfoRequestLinkComponent } from './info-gathering/info-request-list/info-request-list.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpLoaderFactory } from '../../../../@theme/theme.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Ng2SmartTableModule } from '../../../../@core/components/ng2-smart-table';
import { CreateInfoComponent } from './info-gathering/create-info/create-info.component'
import { InfoSettingsComponent, QuestionInlinePageComponent, QuestionInlineEditComponent, } from './info-gathering/create-info/info-settings/info-settings.component';
import { CoverPageComponent } from './info-gathering/cover-page/cover-page.component';
import { AnswertagMenuComponent } from './answertag/answertag-menu/answertag-menu.component';
import { AnswertagTabsComponent } from './answertag/answertag-tabs/answertag-tabs.component';
import { AnswertagVariablesComponent } from './answertag/answertag-variables/answertag-variables.component';
import { NbAccordionModule, NbChatModule, NbPopoverModule } from '@nebular/theme';
import { InformationPreviewComponent } from './info-gathering/information-preview/information-preview.component';
import { ThemeModule } from '../../../../@theme/theme.module';
import { YestypeComponent } from './tasks/questions-type/yestype/yestype.component';
import { TabletypeComponent } from './tasks/questions-type/tabletype/tabletype.component';
import { ViewAbbreviationsComponent } from './insert/view-abbreviations/view-abbreviations.component';
import { InfoRequestListLevel2MenuComponent } from './info-gathering/info-request-list-level2-menu/info-request-list-level2-menu.component';
import { SelectQuestionLevel2MenuComponent } from './info-gathering/create-info/select-question-level2-menu/select-question-level2-menu.component';
import { SelectQuestionsComponent, AppAnswerStatusComponent } from './info-gathering/create-info/select-questions/select-questions.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BlockContentComponent } from './info-gathering/create-info/shared/block-content/block-content.component';
import { QuestionAnswersComponent } from './info-gathering/create-info/shared/question-answers/question-answers.component';
import { BlockTypesComponent } from './info-gathering/create-info/shared/block-types/block-types.component';
import { InfoRequestDetailsComponent } from './info-request/info-request-details/info-request-details.component';
import { InfoRequestLevel2MenuComponent } from './info-request/info-request-level2-menu/info-request-level2-menu.component';
import { InfoRequestCoverPageComponent } from './info-request/info-request-cover-page/info-request-cover-page.component';
import { InfoGatheringAnswerComponent } from './info-gathering/create-info/info-gathering-answer/info-gathering-answer.component';
import { AppTextBoxFullFormComponent, AppTextBoxAbbComponent } from './insert/view-abbreviations/view-abbreviations.component';
import { PipesModule } from '../../../../shared/pipes/pipes.module';
//import { InfoSendmailComponent } from './info-gathering/info-sendmail/info-sendmail.component';
import { CommonPagesModule } from '../../../common/common/common-pages.module';
import { SendmailUserComponent } from '../../../project-setup/users/sendmail-user/sendmail-user.component';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { AnswerHistoryPopupComponent } from './info-gathering/create-info/answer-history-popup/answer-history-popup.component';
import { AnswerLevel2MenuComponent } from './answer-tag/answer-level2-menu/answer-level2-menu.component';
import { ManageAnswerComponent } from './answer-tag/manage-answer/manage-answer.component';
import { AppImageComponent, AnswerTagComponent } from './answer-tag/answer-tag/answer-tag.component';
import { QuestionTypeLogicComponent } from './answer-tag/question-type-logic/question-type-logic.component';
import { QuestionTypeComparabilityComponent } from './answer-tag/question-type-comparability/question-type-comparability.component';
import { ManageAnswerEntityComponent } from './answer-tag/manage-answer-entity/manage-answer-entity.component';
import { ManageAnswerProjectComponent } from './answer-tag/manage-answer-project/manage-answer-project.component';
import { CommonProjectDesignModule } from '../../common-project-design/common-project-design.module';
import { InsertModule } from './insert/insert.module';
import { SendBackToAssigneeComponent } from './info-gathering/send-back-to-assignee/send-back-to-assignee.component';
import { ChatMessageaTextComponent } from './info-gathering/create-info/shared/chat/chat-messagea-text/chat-messagea-text.component';
import { ChatBoxComponent } from './info-gathering/create-info/shared/chat/chat-box/chat-box.component';
import { ChatMessageEditComponent } from './info-gathering/create-info/shared/chat/chat-message-edit/chat-message-edit.component';
import { TableTypeQuestionComponent } from './tasks/table-type-question/table-type-question.component';
import { SendBackForwardQuestionComponent } from './info-request/send-back-forward-question/send-back-forward-question.component';
import { AddToAppendixComponent } from './info-gathering/create-info/shared/add-to-appendix/add-to-appendix.component';
 import { AnswertagModule } from './answertag/answertag.module';
import { TableOfContentsComponent } from './insert/table-of-contents/table-of-contents.component';
import { CreateAnswerProjectVariableComponent } from './answer-tag/create-answer-project-variable/create-answer-project-variable.component';
@NgModule({
  declarations: [
    DocumentViewComponent,
    InfoRequestListLevel2MenuComponent,
    InfoRequestListComponent,
    CoverPageComponent,
    CreateInfoComponent,
    SelectQuestionLevel2MenuComponent,
    SelectQuestionsComponent,
    InfoSettingsComponent,
    //AnswertagMenuComponent,
    //AnswertagVariablesComponent,
    //AnswertagTabsComponent,
    InformationPreviewComponent,
    YestypeComponent,
    TabletypeComponent,
    BlockContentComponent,
    QuestionAnswersComponent,
    BlockTypesComponent,
    LinkViewComponent,
    InfoRequestLinkComponent,
    LinkViewCoReviewerComponent,
    InfoRequestDetailsComponent,
    InfoRequestLevel2MenuComponent,
    SendBackForwardQuestionComponent,
    InfoRequestCoverPageComponent,
    InfoGatheringAnswerComponent,
    AppAnswerStatusComponent,
    AnswerHistoryPopupComponent,
    AnswerLevel2MenuComponent,
    ManageAnswerComponent,
    AppImageComponent,
    AnswerTagComponent,
    QuestionTypeLogicComponent,
    TableOfContentsComponent,
    QuestionTypeComparabilityComponent, ManageAnswerEntityComponent, ManageAnswerProjectComponent, SendBackToAssigneeComponent, QuestionInlinePageComponent, QuestionInlineEditComponent, ChatMessageaTextComponent, ChatBoxComponent, ChatMessageEditComponent,  AddToAppendixComponent, SendBackForwardQuestionComponent, CreateAnswerProjectVariableComponent],
  imports: [
    PipesModule,
    CommonModule,
    ThemeModule,
    HttpClientModule,
    NbAccordionModule,
    CommonPagesModule,
    Ng2SmartTableModule,
    CKEditorModule,
    NgxUiLoaderModule,
    InsertModule,
    AnswertagModule,
    NgMultiSelectDropDownModule,
    DocumentViewRoutingModule,
    CommonProjectDesignModule,
    BsDatepickerModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NbChatModule,
    NbPopoverModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  entryComponents: [
    LinkViewComponent,
    LinkViewCoReviewerComponent,
    InfoRequestLinkComponent,
    AppAnswerStatusComponent,
    QuestionInlinePageComponent,
    QuestionInlineEditComponent,
    //  InfoSendmailComponent
    //  InfoSendmailComponent
    // SendmailUserComponent
    InfoGatheringAnswerComponent,
    AppImageComponent,
    QuestionTypeLogicComponent,
    QuestionTypeComparabilityComponent,
    SendBackToAssigneeComponent,
    SendBackForwardQuestionComponent,
    // TableTypeQuestionComponent,
    AddToAppendixComponent,
    TableOfContentsComponent,
    CreateAnswerProjectVariableComponent
  ]
})
export class DocumentViewModule { }
