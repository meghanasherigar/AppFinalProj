import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { QuestionAnswersDetailsViewModel } from '../../../../../../@models/projectDesigner/task';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-question-type-logic',
  templateUrl: './question-type-logic.component.html',
  styleUrls: ['./question-type-logic.component.scss']
})
export class QuestionTypeLogicComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  questionAnswersDetailsViewModel: QuestionAnswersDetailsViewModel = new QuestionAnswersDetailsViewModel();
  data: any;
  isConditionalQuestion: boolean;
  questionId: string;
  questionnariesId: string;
  question: string;
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
    this.question = questionAnswersDetails.title;
    this.questionOptions = questionAnswersDetails.typeDetails.options;
    if (questionAnswersDetails.typeDetails.options.length > 0) {
      if (questionAnswersDetails.typeDetails.subQuestions[0].isConditionalQuestion) {
        this.isConditionalQuestion = true;
        var index = questionAnswersDetails.typeDetails.subQuestions[0].answerDetails.deliverables.findIndex(x => x.templateOrDeliverableId == this.entityId)
        if (index != -1) {
          var versionLength = questionAnswersDetails.typeDetails.subQuestions[0].answerDetails.deliverables[index].versions.length;
          this.subQuestionAnswer = questionAnswersDetails.typeDetails.subQuestions[0].answerDetails.deliverables[index].versions[versionLength - 1].answer;
        }
        this.subQuestion = questionAnswersDetails.typeDetails.subQuestions[0].title;
      }
      else {
        this.isConditionalQuestion = false;
      }
    }


  }
  closeDialog() {
    this.ref.close();
  }
  optionChange(optionSelected: string) {
    let position = this.questionOptions.findIndex(x => x == optionSelected);
    if (this.questionAnswersDetailsViewModel.typeDetails.options.length >= position + 1) {
      if (this.questionAnswersDetailsViewModel.typeDetails.subQuestions[position].isConditionalQuestion) {
        this.isConditionalQuestion = true;
        var index = this.questionAnswersDetailsViewModel.typeDetails.subQuestions[position].answerDetails.deliverables.findIndex(x => x.templateOrDeliverableId == this.entityId)
        if (index != -1) {
          var versionLength = this.questionAnswersDetailsViewModel.typeDetails.subQuestions[position].answerDetails.deliverables[index].versions.length;
          this.subQuestionAnswer = this.questionAnswersDetailsViewModel.typeDetails.subQuestions[position].answerDetails.deliverables[index].versions[versionLength - 1].answer;
        }
        else {
          this.subQuestionAnswer = ""
        }
        this.subQuestion = this.questionAnswersDetailsViewModel.typeDetails.subQuestions[position].title;
      }
      else {
        this.isConditionalQuestion = false;
      }
    }

  }
}
