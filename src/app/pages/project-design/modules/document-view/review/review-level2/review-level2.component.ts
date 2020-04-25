import { Component, OnInit } from '@angular/core';
import { DesignerService } from '../../../../services/designer.service';
import { editAnswerPayload, QuestionAnswersDetailsViewModel } from '../../../../../../@models/projectDesigner/task';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { NbDialogService } from '@nebular/theme';
import { EditAnswerComponent } from '../../../icon-view/manage-blocks/extended-view/edit-answer/edit-answer.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-review-level2',
  templateUrl: './review-level2.component.html',
  styleUrls: ['./review-level2.component.scss']
})
export class ReviewLevel2Component implements OnInit {

  showQuestionList: boolean = this.designerService.showOrHideQuestionList;
  question: QuestionAnswersDetailsViewModel;
  questionIndex: number;
  showAnswerTag: boolean = false;
  constructor(
    private translateService: TranslateService,
    public designerService: DesignerService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private eventService: EventAggregatorService,
    private DialogService: DialogService, private dialogService: NbDialogService) {
  }

  ngOnInit() {
  }
  questionListChange() {
    this.designerService.isToggleAnswerTag = this.showAnswerTag;
  }
  edit() {
    let selectedText = window.getSelection().toString().trim();

    this.questionIndex = this.designerService.blockQuestionsData.findIndex(x => x.tag.toLowerCase() == selectedText.toLowerCase());
    if (this.questionIndex != -1) {
      this.question = this.designerService.blockQuestionsData[this.questionIndex];
      let answer = this.designerService.blockQuestionsData[this.questionIndex].answerDetails;
      var isAnswerExist = answer.templates.length > 0 || answer.deliverables.length > 0;
      var isInProgress = this.question.isInfoRequestStatusInProgress;
    }
    if (selectedText != "" && selectedText.startsWith('#') && isAnswerExist && !isInProgress) {
      this.dialogService.open(EditAnswerComponent, {
        closeOnBackdropClick: true,
        closeOnEsc: true,
        context: { questionDetails: this.question, questionPos: this.questionIndex }
      })
    }
    else if (selectedText == "" || !selectedText.startsWith('#')) {this.toastr.error
      this.toastr.error(this.translate.instant('screens.project-designer.document-view.notValidHashTag'));
     }
    else if (isInProgress) {
      this.DialogService.Open(DialogTypes.Error, this.translateService.instant('screens.project-designer.document-view.questionInProgress'));
    }
    else if (!isAnswerExist) {
      this.DialogService.Open(DialogTypes.Error, this.translateService.instant('screens.project-designer.document-view.questionNotAnswered'));
    }
  }
  toggleQuestionList(event) {
    this.designerService.showOrHideQuestionList = event;
    this.showQuestionList = event;
  }
  toggleAnswerTags(event)
  {
    this.designerService.isToggleAnswerTag = event;
    this.showAnswerTag = event;
    this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.toggleAnswerTag).publish(event);
  }
}
