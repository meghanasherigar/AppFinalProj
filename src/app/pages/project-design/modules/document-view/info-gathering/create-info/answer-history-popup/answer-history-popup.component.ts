import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { DesignerService } from '../../../../../services/designer.service';
import { TaskService } from '../../../services/task.service';
import { AnswerAvailableViewModel, AnswerHistoryViewModel } from '../../../../../../../@models/projectDesigner/task';
import { DateAgoPipe } from '../../../../../../../shared/pipes/date-agoPipe';
import { Index, QuestionType } from '../../../../../../../@models/projectDesigner/infoGathering';

@Component({
  selector: 'ngx-answer-history-popup',
  templateUrl: './answer-history-popup.component.html',
  styleUrls: ['./answer-history-popup.component.scss']
})
export class AnswerHistoryPopupComponent implements OnInit {

  @Input() selectedQuestion: any;
  inputData: AnswerHistoryViewModel;
  questionName: string;
  answersList: AnswerAvailableViewModel;
  answerHistoryLoaded: boolean = false;
  previousAnswerList: any = [];
  answersCount: number;
  updatedUser: string;
  updatedOn: any;
  createdOn: any;
  latestAnswer: any;
  isTableType: boolean = false;

  constructor(private designerService: DesignerService,
    private taskService: TaskService,
    private changeDetectorRef: ChangeDetectorRef,
    private dateAgoPipe: DateAgoPipe) { }

  ngOnInit() {
    this.inputData = this.selectedQuestion;
    if (this.inputData.questionType == QuestionType.TableType || QuestionType.BenchmarkRangeType || QuestionType.ComparabilityAnalysisType ||
      QuestionType.CoveredTransactionType || QuestionType.ListType || QuestionType.PLQuestionType) {
      this.isTableType = true;
    }
    this.answerHistoryLoaded = true;
    this.answerHistoryPopUp();
  }


  answerHistoryPopUp() {
    let tempDelId; let isTemplate; let questionnariesId; let questionId;
    this.questionName = this.inputData.questionName;
    questionnariesId = this.inputData.questionnariesId;
    questionId = this.inputData.questionId;
    tempDelId = this.inputData.templateOrDeliverableId;
    isTemplate = this.inputData.isTemplate;

    this.taskService.getAnswerHistoryForQuestion(questionnariesId, questionId, tempDelId, isTemplate).subscribe((data: AnswerAvailableViewModel) => {
      this.answersList = data;
      this.previousAnswerList = [];
      this.answerHistoryLoaded = true;
      if (this.answersList.templateAnswer.length > 0) {
        this.answersList.templateAnswer.forEach((item) => {
          item.answers.forEach((el, index) => {
            if (index == Index.zero) {
              this.latestAnswer = el.answer;
              this.updatedUser = el.auditTrail.updatedBy.firstName + ' ' + el.auditTrail.updatedBy.lastName;
              this.updatedOn = this.dateAgoPipe.transform(el.auditTrail.updatedOn);
              this.createdOn = this.dateAgoPipe.transform(el.auditTrail.createdOn);
            }
            else {
              this.previousAnswerList.push(el);
              this.answersCount = this.previousAnswerList.length;
            }
          });
        });
      }
      else if (this.answersList.deliverableAnswer.length > 0) {
        this.answersList.deliverableAnswer.forEach((item) => {
          item.answers.forEach((el, index) => {
            if (index == Index.zero) {
              if (this.isTableType && el.cellValues.length > 0) {
                this.latestAnswer = this.createTable(el.cellValues);
              }
              else {
                this.latestAnswer = el.answer;
              }
              this.updatedUser = el.auditTrail.updatedBy.firstName + ' ' + el.auditTrail.updatedBy.lastName;
              this.updatedOn = this.dateAgoPipe.transform(el.auditTrail.updatedOn);
              this.createdOn = this.dateAgoPipe.transform(el.auditTrail.createdOn);
            }
            else {
              if (this.isTableType && el.cellValues.length > 0) {
                el.answer = this.createTable(el.cellValues);
              }
              this.previousAnswerList.push(el);
              this.answersCount = this.previousAnswerList.length;
            }
          });
        });
      }
    });
  }

  closeAnswerHistoryPopup() {
    this.answerHistoryLoaded = false;
  }

  createTable(data) {
    var div = document.createElement('DIV');
    var table = document.createElement('TABLE');
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);

    let rowCell = [];
    let colCell = [];
    data.forEach(a => {
      let splitData = a.key.split(':');
      rowCell.push(splitData[0]);
      colCell.push(splitData[1]);
    });
    const rows = rowCell.reduce((a, b) => Math.max(a, b));
    const cols = colCell.reduce((a, b) => Math.max(a, b));

    let index = 0;
    for (let i = 0; i <= rows; i++) {
      var tr = document.createElement('TR');
      tableBody.appendChild(tr);
      for (let j = 0; j <= cols; j++) {
        var td = document.createElement('TD');
        td.innerHTML = data[index].value;
        td.id = data[index].id;
        tr.appendChild(td);
        index++;
      }
    }
    div.appendChild(table);
    return div.innerHTML;
  }
} 
