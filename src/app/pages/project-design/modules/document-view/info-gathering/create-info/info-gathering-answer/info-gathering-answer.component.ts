import { Component, OnInit, Input } from '@angular/core';
import { DesignerService } from '../../../../../services/designer.service';
import { TaskService } from '../../../services/task.service';
import { AnswerAvailableViewModel } from '../../../../../../../@models/projectDesigner/task';
import * as moment from 'moment';
import { QuestionType } from '../../../../../../../@models/projectDesigner/infoGathering';

@Component({
  selector: 'ngx-info-gathering-answer',
  templateUrl: './info-gathering-answer.component.html',
  styleUrls: ['./info-gathering-answer.component.scss']
})
export class InfoGatheringAnswerComponent implements OnInit {
  @Input() inputData: any;
  selectedRowData: any;
  selectedDateType: boolean;
  deliverablesList = [];
  deliverableAnswer: any;
  answerAvailable: boolean;
  currentIndex = 1;
  selectedTableType: boolean;
  tableText: string;
  constructor(private designerService: DesignerService, private taskService: TaskService) { }

  ngOnInit() {
    this.answerAvailable = true;
    this.selectedRowData = this.inputData;
    this.getDeliverableListAnswers(this.selectedRowData.questionType.typeName, this.selectedRowData.questionnariesId, this.selectedRowData.id)
  }

  getDeliverableListAnswers(questionType, questionnariesId, questionId) {
    if (QuestionType.TableType == questionType) {
      this.selectedTableType = true;
      this.selectedDateType = false;
    }
    else if (QuestionType.DateType == questionType) {
      this.selectedTableType = false;
      this.selectedDateType = true;
    }
    else {
      this.selectedTableType = false;
      this.selectedDateType = false;
    }
    this.taskService.getAnswerForQuestion(questionnariesId, questionId).subscribe((data: AnswerAvailableViewModel) => {
      if (data.deliverableAnswer.length > 0) {
        this.deliverablesList = data.deliverableAnswer;
        data.deliverableAnswer.forEach(el => {
          el.taxableYearEnd = moment(el.taxableYearEnd).local().format("DD MMM YYYY");
        });
        this.tableText = data.text;
        this.selectedDeliverableTab(this.deliverablesList[0]);
      }
    });
  }

  selectedDeliverableTab(selectedTab) {
    if (selectedTab) {
      this.deliverablesList.forEach(item => {
        if (item.name == selectedTab.name) {
          this.deliverableAnswer = item.answers[0].answer;
          if (this.selectedTableType) {
            let answerhtml = document.querySelector('#answerhtml');
            if (answerhtml != null) {
              answerhtml.innerHTML = this.tableText;
              this.deliverableAnswer.cellValues.forEach((cell, index) => {
                answerhtml.getElementsByTagName('td')[index].setAttribute('id', cell.id);
                var divCell = document.createElement("div");
                divCell.innerHTML = cell.value;
                cell.value = divCell.innerText;
              });
            }
          }
          else if (this.selectedDateType) {
            let answerhtml = document.querySelector('#answerhtml');
            if (answerhtml != null) {
              answerhtml.innerHTML = this.toDate(this.deliverableAnswer);
            }
          }
          else {
            let answerhtml = document.querySelector('#answerhtml');
            if (answerhtml != null) {
              answerhtml.innerHTML = this.deliverableAnswer;
            }
          }

        }
      });
    }
  }

  closeAnswerAvailablePopup() {
    this.answerAvailable = false;
  }
  OntabSelected(i) {
    this.currentIndex = i + 1;
  }
  toDate(dateStr: any) {
    return moment(dateStr).local().format("DD MMM YYYY");;
  }

}
