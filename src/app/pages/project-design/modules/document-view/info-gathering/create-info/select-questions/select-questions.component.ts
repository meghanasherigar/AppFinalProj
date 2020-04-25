import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef, Input } from '@angular/core';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { TaskService } from '../../../services/task.service';
import { QuestionsFilterViewModel, QuestionsResponseViewModel, AnswerAvailableViewModel, selectedQuestionsViewModel, ProjectUsersListViewModel, QuestionAnswersDetailsViewModel } from '../../../../../../../@models/projectDesigner/task';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { DesignerService } from '../../../../../services/designer.service';
import { Ng2SmartTableComponent } from '../../../../../../../@core/components/ng2-smart-table/ng2-smart-table.component';
import { ViewCell, LocalDataSource } from '../../../../../../../@core/components/ng2-smart-table';
import { NbDialogService } from '@nebular/theme';
import { InfoGatheringAnswerComponent } from '../info-gathering-answer/info-gathering-answer.component';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { RowContext } from '@angular/cdk/table';
import { analyzeAndValidateNgModules, IfStmt } from '@angular/compiler';
import { createInfoLabels, QuestionType } from '../../../../../../../@models/projectDesigner/infoGathering';
import * as moment from 'moment';
import { SortEvents } from '../../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'answerStatus-editor',
  template: `
  <div *ngIf="isTemplate">
    <a href="#" [routerLink]="" [nbPopover]="TempAnswerAvailableField" *ngIf="row.answerAvailable"
    nbPopoverPlacement="top" (click)="generateAnswerStatusPopup(row.questionType.typeName,row.questionnariesId, row.id,row)"> {{answerAvailable}} </a>
    <div *ngIf="!row.answerAvailable">{{answerAvailable}}</div>
  </div>
  <div *ngIf="isDeliverable">
    <a href="#" [routerLink]="" [nbPopover]="DelAnswerAvailableField" *ngIf="row.answerAvailable" nbPopoverPlacement="top">
      {{answerAvailable}}</a>
    <div *ngIf="!row.answerAvailable">{{answerAvailable}}</div>
</div>
<ng-template #TempAnswerAvailableField>
    <div id ="answerhtml"  class="AnswerPopup"></div>
</ng-template>
<ng-template #DelAnswerAvailableField>
  <ngx-info-gathering-answer [inputData]="row"></ngx-info-gathering-answer>
</ng-template>
    `,
})
export class AppAnswerStatusComponent implements ViewCell, OnInit {
  row: any;
  @Input() rowData: any;
  @Input() value: string | number;
  isTemplate: boolean = false;
  isDeliverable: boolean = false;
  answerAvailable: string;
  answerAvailableList: AnswerAvailableViewModel;
  templateAnswer: string;

  constructor(private designerService: DesignerService, private taskService: TaskService) {

  }
  ngOnInit() {
    this.row = this.rowData;
    this.isTemplate = this.designerService.isTemplateSelected;
    this.isDeliverable = this.designerService.isDeliverableSelected;
    this.answerAvailable = (this.row.answerAvailable == true) ? 'Yes' : 'No';
  }

  generateAnswerStatusPopup(questionType, questionnariesId, questionId, row) {
    if (QuestionType.TableType == questionType) {
      this.taskService.getQuestionAnsweByQuestionId(questionnariesId, questionId, row.templateIds[0]).subscribe((data: QuestionAnswersDetailsViewModel) => {
        let answerhtml = document.querySelector('#answerhtml');
        if (answerhtml != null) {
          answerhtml.innerHTML = data.typeDetails.text;
          data.typeDetails.cellValues.forEach((cell, index) => {
            answerhtml.getElementsByTagName('td')[index].setAttribute('id', cell.id);
            var divCell = document.createElement("div");
            divCell.innerHTML = cell.value;
            cell.value = divCell.innerText;
          });
        }
      })
    }
    else {
      this.taskService.getAnswerForQuestion(questionnariesId, questionId).subscribe((data: AnswerAvailableViewModel) => {
        if (data.templateAnswer.length > 0) {
          this.answerAvailableList = data;
          switch (questionType) {
            case QuestionType.DateType:
              this.templateAnswer = this.toDate(this.answerAvailableList.templateAnswer[0].answers[0].answer);
              break;
            default:
              this.templateAnswer = this.answerAvailableList.templateAnswer[0].answers[0].answer;
              break;
          }
          let answerhtml = document.querySelector('#answerhtml');
          if (answerhtml != null) {
            answerhtml.innerHTML = this.templateAnswer;
          }
        }
      });
    }
  }

  toDate(dateStr: any) {
    return moment(dateStr).local().format("DD MMM YYYY");;
  }

}


@Component({
  selector: 'ngx-select-questions',
  templateUrl: './select-questions.component.html',
  styleUrls: ['./select-questions.component.scss']
})
export class SelectQuestionsComponent implements OnInit, OnDestroy {

  questionsList: CommonDataSource = new CommonDataSource();
  subscriptions: Subscription = new Subscription();
  alreadyDoneAsynWork: any = false;
  EnableDeliverable: boolean = false;
  deliverableList: any;
  selectedQuestionsViewModelArray: selectedQuestionsViewModel[] = [];
  questionIdList: string[] = [];
  pageSize: number = 10;
  pageIndex: number = 0;
  dropdownModel: ProjectUsersListViewModel = new ProjectUsersListViewModel();
  payload = new QuestionsFilterViewModel;
  //ngx-ui-loader configuration
  loaderId = 'infoRequestLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  dataModel = new QuestionsResponseViewModel();
  @ViewChild('table') table: Ng2SmartTableComponent;
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: false,
    noDataMessage: this.translate.instant('screens.project-designer.document-view.info-request.Nodatafoundmsg'),
    pager: {
      display: true,
      perPage: this.pageSize,
    },
    columns: {},
  }
  constructor(private shareDetailService: ShareDetailService, private taskService: TaskService, private ngxLoader: NgxUiLoaderService, private changeDetectorRef: ChangeDetectorRef,
    private _eventService: EventAggregatorService, private designerService: DesignerService ,private translate: TranslateService,) { 

      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.questionsList.refresh();
      }));
  
      this.setColumnSettings();
     }
  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    const project = this.shareDetailService.getORganizationDetail();
    this.payload.projectId = project.projectId;
    this.payload.pageIndex = this.pageIndex;
    this.payload.pageSize = this.settings.pager.perPage;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).subscribe((payload: QuestionsFilterViewModel) => {
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      const project = this.shareDetailService.getORganizationDetail();
      payload.projectId = project.projectId;
      payload.pageIndex = this.pageIndex;
      payload.pageSize = this.settings.pager.perPage;
      this.taskService.getAllQuestions(payload).subscribe((data: QuestionsResponseViewModel[]) => {
        this.designerService.questionsLoaded = data;
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        this.questionsList.load(data);
        if (data.length > 0) {
          this.questionsList.totalCount = data[0].totalRecords;
        }
        else {
          this.questionsList.totalCount = data.length;
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      })
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }));
    //on unselecting entity remove selected question
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.spliceQuestions).subscribe(() => {
      let toBeSplicedQuestions: any = [];
      this.designerService.selectedQuestions.forEach(x => {
        this.designerService.selectedEntities.forEach(entity => {
          let entityQuestions: any = [];
          entityQuestions = x.delivearbleIds.filter(deliverable => deliverable == entity['id']);
          if (entityQuestions.length == 0) {
            toBeSplicedQuestions.push(x.id);
          }
        })
      })
      toBeSplicedQuestions.forEach(quesId => {
        let index = this.designerService.selectedQuestions.findIndex(x => x.id == quesId);
        if (index > -1)
          this.designerService.selectedQuestions.splice(index, 1);
      });
      if (toBeSplicedQuestions.length > 0) {
        this.loadQuestionsGrid();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.reloadPageSection).publish("reload")
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish("reload")
      }
    }));
    this.questionsList.onChanged().subscribe((change) => {
      // this.removeViewMore();
      this.alreadyDoneAsynWork = false;
      if (change.action === 'page' || change.action === 'paging') {
        this.pageSize = change.paging.perPage;
        this.pageIndex = change.paging.page;
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        const project = this.shareDetailService.getORganizationDetail();
        this.payload = this.designerService.questionsFilters;
        this.payload.projectId = project.projectId;
        this.payload.pageIndex = this.pageIndex;
        this.payload.pageSize = this.pageSize;
        this.taskService.getAllQuestions(this.payload).subscribe((data: QuestionsResponseViewModel[]) => {
          this.designerService.questionsLoaded = data;
          this.ngxLoader.startBackgroundLoader(this.loaderId);
          this.questionsList.load(data);
          if (data.length > 0) {
            this.questionsList.totalCount = data[0].totalRecords;
          }
          else {
            this.questionsList.totalCount = data.length;
          }
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        })
      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting) {
        const project = this.shareDetailService.getORganizationDetail();
        this.payload = this.designerService.questionsFilters;
        this.payload.projectId = project.projectId;
        this.payload.pageIndex = this.pageIndex;
        this.payload.pageSize = this.pageSize;
        this.payload.sortDirection = change.sort[0].direction.toUpperCase();
        this.payload.sortColumn = change.sort[0].field;
        this.taskService.getAllQuestions(this.payload).subscribe((data: QuestionsResponseViewModel[]) => {
          this.designerService.questionsLoaded = data;
          this.ngxLoader.startBackgroundLoader(this.loaderId);
          this.questionsList.load(data);
          if (data.length > 0) {
            this.questionsList.totalCount = data[0].totalRecords;
          }
          else {
            this.questionsList.totalCount = data.length;
          }
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        })
        this.loadQuestionsGrid();
      }
    });

  }
  private setSelectedQuestions() {
    if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft) {
      this.table.grid.getRows().forEach((row) => {
        let index = this.designerService.infoDraftResponseModel.selectedQuestionsResponse.findIndex(x => x.id == row["data"]["id"]);
        if (index > -1) {
          this.table.grid.multipleSelectRow(row);
        }
        this.alreadyDoneAsynWork = true;
      });
      this.designerService.selectedQuestions = this.designerService.infoDraftResponseModel.selectedQuestionsResponse;
    }
    else {
      this.table.grid.getRows().forEach((row) => {
        let index = this.designerService.selectedQuestions.findIndex(x => x.id == row["data"]["id"]);
        if (index > -1) {
          this.table.grid.multipleSelectRow(row);
        }
        this.alreadyDoneAsynWork = true;
      });
    }
  }
  ngAfterViewChecked() {
    if (!this.alreadyDoneAsynWork)
      this.setSelectedQuestions();
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      tagName: {
        title: this.translate.instant('AnswerTag'),
      },
      title: {
        title: this.translate.instant('Questions'),
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return `<div title="` + row.title + `" class="questionTitle">` + row.title + `</div>`;
        }
      },
      questionType: {
        title: this.translate.instant('question-type-label'),
        valuePrepareFunction: (cell, row) => { return row.questionType.typeName }
      },
      answerAvailable: {
        title: this.translate.instant('AnswerAvailablelabel'),
        type: 'custom',
        renderComponent: AppAnswerStatusComponent
      },
      blockTitle: {
        title: this.translate.instant('BlockTitle'),
        type: 'html',
        valuePrepareFunction: (cell, row) => {

          return `<div title="` + row.blockTitle + `">` + row.blockTitle + `</div>`;

        }

      },
      blockType: {
        title: this.translate.instant('BlockType'),
        valuePrepareFunction: (cell, row) => { return row.blockType.blockType }
      },
      'auditTrail.createdBy': {
        title: this.translate.instant('CreatedBy'),
        valuePrepareFunction: (cell, row) => { return row.auditTrail.createdBy.email }
      },
    },
    this.settings = Object.assign({}, settingsTemp );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  onRowSelection(event) {
    this.designerService.isQuestionDataUpdated = false;
    let selectedQuery = event.selected as QuestionsResponseViewModel[]
    if (event.isSelected == false) {
      let index = this.designerService.selectedQuestions.findIndex(x => x.id == event.data.id);
      if (index != -1) {
        this.designerService.selectedQuestions.splice(index, 1)
      }
    }
    if (selectedQuery.length == 0) {
      this.designerService.selectedQuestions = [];
    }
    selectedQuery.forEach((selected) => {
      if (this.designerService.selectedQuestions.find(x => x.id == selected.id) == null)
        this.designerService.selectedQuestions.push(selected)
    })
    if (this.designerService.selectedEntities != undefined && this.designerService.selectedEntities.length > 0) {
      this.EnableDeliverable = true;
      this.deliverableList = [];
      this.deliverableList = this.designerService.selectedEntities;
    }
    else {
      this.EnableDeliverable = false;
    }
    this.loadQuestionsGrid();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.reloadPageSection).publish("reload")
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish("reload")

  }
  loadQuestionsGrid() {
    let userGridList: QuestionsResponseViewModel[] = [];
    this.selectedQuestionsViewModelArray = [];
    this.questionIdList = []
    this.designerService.selectedQuestions.forEach(element => {
      this.dataModel = new QuestionsResponseViewModel();
      let selectedQuestionViewModel = new selectedQuestionsViewModel();
      selectedQuestionViewModel.questionId = element.id;
      selectedQuestionViewModel.questionnaireId = element.questionnariesId;
      selectedQuestionViewModel.title = element.title;
      selectedQuestionViewModel.blockType = (element.blockType != undefined) ? element.blockType.blockType : null;
      selectedQuestionViewModel.blockTitle = element.blockTitle;
      if (this.questionIdList.findIndex(x => x == element.id) == -1) { this.questionIdList.push(element.id); }
      if (this.selectedQuestionsViewModelArray.findIndex(x => x.questionId == selectedQuestionViewModel.questionId) == -1) {
        this.selectedQuestionsViewModelArray.push(selectedQuestionViewModel);
      }
      if (this.EnableDeliverable == true) {
        element.delivearbleIds.forEach(ItemId => {
          if (ItemId == this.dropdownModel.Deliverables[0]) {
            this.dataModel = element;
            this.dataModel.delivearbleIds = [];
            this.dataModel.delivearbleIds.push(ItemId);
            this.designerService.updatedQuestionGridList.push(this.dataModel);
            userGridList.push(this.dataModel);
            // this.designerService.updatedQuestionGridList = userGridList;
          }
        });
      }
      else {
        this.dataModel = element;
        userGridList.push(this.dataModel);
        this.designerService.updatedQuestionGridList = userGridList;
      }
    });
  }
}

