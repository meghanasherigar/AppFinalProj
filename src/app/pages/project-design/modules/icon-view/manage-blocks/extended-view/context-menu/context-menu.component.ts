import { Component, OnInit, Input } from '@angular/core';
import { DesignerService } from '../../../../../services/designer.service';
import { QuestionType } from '../../../../../../../@models/projectDesigner/infoGathering';
import { NbDialogService } from '@nebular/theme';
import { EditAnswerComponent } from '../edit-answer/edit-answer.component';
import { QuestionAnswersDetailsViewModel, TableTypeDomainModel } from '../../../../../../../@models/projectDesigner/task';
import { TableTypeQuestionComponent } from '../../../../document-view/tasks/table-type-question/table-type-question.component';

@Component({
  selector: 'ngx-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {

  constructor(private designerService: DesignerService, private dialogService: NbDialogService) { }
  editClicked: boolean = false;
  question: QuestionAnswersDetailsViewModel
  @Input()
  x: number = 0;
  @Input()
  y: number = 0;
  @Input()
  tag: string;
  answer: String;
  @Input()
  questionIndex: number;
  tableTypeDetails;
  ngOnInit() {

  }

  edit() {
    this.question = this.designerService.blockQuestionsData[this.questionIndex];
    this.designerService.contextmenu = false;
    let questionType = this.question.typeDetails.questionType.typeName;
    this.dialogService.open(EditAnswerComponent, {
      closeOnBackdropClick: true,
      closeOnEsc: true,
      context: { questionDetails: this.question, questionPos: this.questionIndex }
    })
  }

}
