import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { QuestionAnswersDetailsViewModel } from '../../../../../../@models/projectDesigner/task';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-question-type-comparability',
  templateUrl: './question-type-comparability.component.html',
  styleUrls: ['./question-type-comparability.component.scss']
})

export class QuestionTypeComparabilityComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  questionAnswersDetailsViewModel: QuestionAnswersDetailsViewModel = new QuestionAnswersDetailsViewModel();
  data: any;
  isConditionalQuestion: boolean;
  questionId: string;
  questionnariesId: string;
  question: QuestionAnswersDetailsViewModel;
  questionTitle: string;
  entityId: string;
  questionOptions: string[];
  subQuestion: string;
  subQuestionAnswer: string;
  answerDetails: QuestionAnswersDetailsViewModel = new QuestionAnswersDetailsViewModel;
  constructor(private taskService: TaskService,
    private ref: NbDialogRef<any>) { }

  ngOnInit() {
    this.subscriptions.add(this.taskService.getQuestionAnsweByQuestionId(this.questionnariesId, this.questionId, this.entityId)
      .subscribe((data) => {
        this.questionAnswersDetailsViewModel = data;
        this.displayData(this.questionAnswersDetailsViewModel)
      })
    )

  }
  displayData(questionAnswersDetails: QuestionAnswersDetailsViewModel) {
    this.question = questionAnswersDetails;
    this.questionTitle = questionAnswersDetails.title;
    let tableTypeEditor = document.querySelector('#tableTypeEditor');
    if (tableTypeEditor != null) {
      tableTypeEditor.innerHTML = this.question.typeDetails.text;
      this.question.typeDetails.cellValues.forEach((cell, index) => {
        tableTypeEditor.getElementsByTagName('td')[index].setAttribute('id', cell.id);
        var divCell = document.createElement("div");
        divCell.innerHTML = cell.value;
        cell.value = divCell.innerText;
      });
    }
  }
  closeDialog() {
    this.ref.close();
  }

}

