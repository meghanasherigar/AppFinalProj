import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { QuestionAnswersDetailsViewModel } from '../../../../../../@models/projectDesigner/task';
import { CreateQuestionComponent } from '../create-question/create-question.component';
import { NbDialogService } from '@nebular/theme';
import { DesignerService } from '../../../../services/designer.service';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { TaskService } from '../../services/task.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DesignerService as DesignerServiceAdmin } from '../../../../../admin/services/designer.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'ngx-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.scss']
})
export class QuestionsListComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  questionsData: QuestionAnswersDetailsViewModel[] = [];
  selQuestionData: QuestionAnswersDetailsViewModel[] = [];
  showQuestion: boolean = false;
  private dialogTemplate: Dialog;
  islibrarySelected = this.designerService.isLibrarySection;
  constructor(private _eventService: EventAggregatorService, private dialogService: NbDialogService, private designerService: DesignerService,
    private dialog: MatDialog, private taskService: TaskService, private DialogService: DialogService,
    private designerServiceAdmin: DesignerServiceAdmin,private toastr: ToastrService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).subscribe((data: QuestionAnswersDetailsViewModel[]) => {
      this.questionsData = data;
      this.designerService.blockQuestionsData = data;
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.displayQuestionList).subscribe((payload) => {
      if (this.designerService.editquestionClicked) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('closeEditQuestion');
        this.designerService.editquestionClicked = false;
        this.designerService.allowTagNameChange = false;
      }
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).subscribe((payload) => {
      if (payload == 'closeEditQuestion') {
        this.showQuestion = false;
      }
    }));
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  checkSelected(question: QuestionAnswersDetailsViewModel) {
    if (this.designerService.isLibrarySection) {
      if (this.designerServiceAdmin.blockList.length == 0) {
        return true;
      }
      else {
        if (this.designerServiceAdmin.blockList.find(x => x.blockId == question.blockId) != null) {
          return true;
        }
        else {
          return false;
        }
      }
    }
    else {
      if (this.designerService.blockList.length == 0) {
        return true;
      }
      else {
        if (this.designerService.blockList.find(x => x.blockId == question.blockId) != null) {
          return true;
        }
        else {
          return false;
        }
      }

    }
  }

  editQuestion(question: QuestionAnswersDetailsViewModel) {
    this.showQuestion = true;
    this.selQuestionData = this.questionsData.filter((x) => x.questionId == question.questionId);
    this.designerService.allowTagNameChange = true;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.populateQuestions).publish(this.selQuestionData);
  }

  openDeleteConfirmDialog(question: QuestionAnswersDetailsViewModel): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.document-view.info-request.questionDeletionConfirmation');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteQuestion(question);
      }
    });
  }
  deleteQuestion(question: QuestionAnswersDetailsViewModel) {
    this.taskService.delete(question.questionnariesId, question.questionId).subscribe(
      response => {
        if (response) {
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.info-request.questionDeleted'));
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByLibrary).publish(response);
          this.taskService.getAllQuestionsByTemplateOrDeliverableId(this.designerService.questionFilterForEditOrDelete).subscribe((data) => {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
          })
        }
      }
    )

  }

}
