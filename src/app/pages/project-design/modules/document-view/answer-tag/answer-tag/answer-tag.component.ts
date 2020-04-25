import { Component, OnInit, Input, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalDataSource, ViewCell } from '../../../../../../@core/components/ng2-smart-table';
import { NbDialogService } from '@nebular/theme';
import { QuestionTypeLogicComponent } from '../question-type-logic/question-type-logic.component';
import { QuestionTypeComparabilityComponent } from '../question-type-comparability/question-type-comparability.component';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { AnswertagService } from '../../../../services/answertag.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { EntityVariableFilterViewModel, EntityFilterViewModel, AnswerTagsResponseViewModel, AnswerTagsResultViewModel } from '../../../../../../@models/projectDesigner/answertag';
import { QuestionType } from '../../../../../../@models/projectDesigner/infoGathering';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { BlockType } from '../../../../../../@models/projectDesigner/block';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import * as moment from 'moment';
import { SortEvents } from '../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';


@Component({
  selector: 'image-editor',
  template: `
           <span *ngIf="isText" [innerHTML]="value"></span>   
           <span *ngIf="isLogicType" (click)="loadQuestionTypeLogic(logicalQuestionnariesId,logicalQuestionId)">LogicalType</span>
           <span *ngIf="isTableType" (click)="loadQuestionTypeTable(logicalQuestionnariesId,logicalQuestionId)"><table class="tableIco"><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table></span>
           <span *ngIf="isDateType">{{date}}</span>
    `,
})


export class AppImageComponent implements ViewCell, OnInit {
  row: any;
  @Input() rowData: any;
  @Input() value: string | number;
  isLogicType: boolean = false;
  isText: boolean = false;
  date: string;
  isDateType: boolean = false;
  isTableType: boolean = false;
  QuestionId: string;
  QuestionnariesId: string;
  entityId: string;
  constructor(private dialogService: NbDialogService, ) {
  }
  ngOnInit() {
    var val = this.value.toString();
    var info = val.split("-");
    this.entityId = info.pop();
    this.QuestionnariesId = info.pop();
    this.QuestionId = info.pop();
    if (this.value.toString().startsWith("Logical")) {
      this.isLogicType = true;
    }
    else if (this.value.toString().startsWith("Table")) {
      this.isTableType = true;
    }
    else if (this.value.toString().startsWith("Date")) {
      this.isDateType = true;
      let info = val.split("-");
      this.date = info.pop();
    }
    else {
      this.isText = true;
    }
    this.row = this.rowData.data;
  }

  loadQuestionTypeLogic(EntityId: string, QuestionnariesId: string, QuestionId: string) {
    this.dialogService.open(QuestionTypeLogicComponent, {
      closeOnBackdropClick: true,
      closeOnEsc: true,
      context: { questionnariesId: this.QuestionnariesId, questionId: this.QuestionId, entityId: this.entityId }
    });
  }

  loadQuestionTypeTable(EntityId: string, QuestionnariesId: string, QuestionId: string) {
    this.dialogService.open(QuestionTypeComparabilityComponent, {
      closeOnBackdropClick: true,
      closeOnEsc: true,
      context: { questionnariesId: this.QuestionnariesId, questionId: this.QuestionId, entityId: this.entityId }
    });
  }
}

@Component({
  selector: 'ngx-answer-tag',
  templateUrl: './answer-tag.component.html',
  styleUrls: ['./answer-tag.component.scss']
})
export class AnswerTagComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  source: CommonDataSource = new CommonDataSource();
  firstBlockType: BlockType;
  gridStructure: any;
  data: any;
  blockTypeAsTabs: any;
  selectedBlockTypeId: string;
  AnswerTabList: any;
  i = 0;
  currentTabIndex = 1;
  loaderId = 'answerTagLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  settings;
  entityFilterViewModel: EntityFilterViewModel = new EntityFilterViewModel();
  answerTagsResponseViewModel: AnswerTagsResponseViewModel = new AnswerTagsResponseViewModel();
  answerTagsResultViewModel: AnswerTagsResultViewModel = new AnswerTagsResultViewModel();

  mySettings = {
    mode: 'inline',
    hideSubHeader: true,
    actions: { add: false, edit: false, delete: false, select: true },
    filters: false,
    noDataMessage: this.translate.instant('screens.project-designer.document-view.info-request.Nodatafoundmsg'),
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
  };
  _sortColumns: Array<string> = ['legalEntityName', 'taxableYearEnd', 'country'];
  constructor(private _eventService: EventAggregatorService,
    private shareDetailService: ShareDetailService,
    private ansTagService: AnswertagService,
    private translate: TranslateService,
    private el: ElementRef,
    private ngxLoader: NgxUiLoaderService,
    private dialogService: NbDialogService, ) { 
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.source.refresh();
      }));
      this.setColumnSettings();
    }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.answerTagDefaultTabActive).subscribe((data: number) => {
      this.currentTabIndex = data;
    }));
    const project = this.shareDetailService.getORganizationDetail();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.entityVariableFilter).subscribe((payload) => {
      this.entityFilterViewModel = payload as EntityFilterViewModel;
      this.entityFilterViewModel.ProjectId = project.projectId;
      if (!this.entityFilterViewModel.pageSize || !this.entityFilterViewModel.pageIndex) {
        this.entityFilterViewModel.pageIndex = 1;
        this.entityFilterViewModel.pageSize = 10;
      }
      this.loadAnswerTagGrid(this.selectedBlockTypeId);
    }))
    this.entityFilterViewModel.ProjectId = project.projectId;
    this.entityFilterViewModel.pageIndex = 1;
    this.entityFilterViewModel.pageSize = this.mySettings.pager.perPage;
    this.entityFilterViewModel.CountryIds = [];
    this.entityFilterViewModel.EntityIds = [];
    this.entityFilterViewModel.EntityShortNames = [];
    this.source.onChanged().subscribe((change) => {
      if (change.action === 'page' || change.action === 'paging') {
        this.entityFilterViewModel.ProjectId = project.projectId;
        this.entityFilterViewModel.pageIndex = change.paging.page;
        this.entityFilterViewModel.pageSize = change.paging.perPage;
        this.entityFilterViewModel.CountryIds = [];
        this.entityFilterViewModel.EntityIds = [];
        this.entityFilterViewModel.EntityShortNames = [];
        this.entityFilterViewModel.TaxableYearEnd = new Date;
        this.entityFilterViewModel.TaxableYearStart = new Date;
      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        if(this._sortColumns.includes(change.sort[0].field))
        {
          this.entityFilterViewModel.sortDirection=  change.sort[0].direction.toUpperCase();
          this.entityFilterViewModel.sortColumn=  change.sort[0].field;

        this.subscriptions.add(this.ansTagService.getanswertagsbyblocktype(this.entityFilterViewModel).subscribe(response => {
          this.answerTagsResponseViewModel = response;
          this.loadAnswerGrid(this.answerTagsResponseViewModel);
        }));
      }  
      }
    });

    this.subscriptions.add(this.ansTagService.getBlockTypes().subscribe(
      response => {
        this.blockTypeAsTabs = response;
        this.firstBlockType = response[0];
        this.loadAnswerTagGrid(this.firstBlockType.blockTypeId);

      }));
  }

  public loadAnswerTagGrid(blockTypeId: string) {
    this.selectedBlockTypeId = blockTypeId;
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.entityFilterViewModel.BlockTypeId = blockTypeId;
    this.subscriptions.add(this.ansTagService.getanswertagsbyblocktype(this.entityFilterViewModel).subscribe(
      response => {
        this.answerTagsResponseViewModel = response;
        this.loadAnswerGrid(this.answerTagsResponseViewModel);
      }));

    this.ngxLoader.stopBackgroundLoader(this.loaderId);

  }

  loadAnswerGrid(data: AnswerTagsResponseViewModel) {

    var obj = {
      "legalEntityName": "",
      "taxableYearEnd": null,
      "country": ""
    };
    this.mySettings = {
      mode: 'inline',
      hideSubHeader: true,
      actions: { add: false, edit: false, delete: false, select: true },
      filters: false,
      noDataMessage: 'No data found',
      pager: {
        display: true,
        perPage: 10,
      },
      columns: {
        legalEntityName: {
          title: this.translate.instant('LegalEntityName'),
          filter: false,
          // width: '5%',
        },
        taxableYearEnd: {
          title: this.translate.instant('TaxableYearEnd'),
          filter: false,
          // width: '5%',
          valuePrepareFunction: (date) => {
            if (date) {
              return moment(date).local().format("DD MMM YYYY");
            }
            return "";
          },
        },
        country: {
          title: this.translate.instant('Country'),
          filter: false,
          // width: '5%',
        },
      }
    };
    data.tag.forEach((tagName, index) => {
      obj[tagName] = ""

      this.mySettings.columns[tagName] = {
        title: tagName.replace(/['"]+/g, ''),
        type: 'custom',
        renderComponent: AppImageComponent,
        filter: false,
        // width: '5%'
      };
    });
    let userGridList: any[] = [];
    data.answerTagList.forEach(element => {
      obj.legalEntityName = element.legalEntityName;
      obj.taxableYearEnd = element.taxableYearEnd;
      obj.country = element.country;
      data.tag.forEach((tag, index) => {
        switch (element.type[index].typeName) {
          case QuestionType.Logical:
            if (element.answer[index] != "--") {
              obj[tag] = "Logical Type -" + element.questionId[index] + "-" + element.questionnariesId[index] + "-" + element.entityId;
              break;
            }
            else {
              obj[tag] = element.answer[index];
              break;
            }
          case QuestionType.DateType:
            if (element.answer[index] != "--") {
              obj[tag] = "Date Type -" + this.toDate(element.answer[index]);
              break;
            }
            else {
              obj[tag] = element.answer[index];
              break;
            }
          case QuestionType.TableType:
            if (element.answer[index] != "--") {
              obj[tag] = "Table Type -" + element.questionId[index] + "-" + element.questionnariesId[index] + "-" + element.entityId;
              break;
            }
            else {
              obj[tag] = element.answer[index];
              break;
            }
          default:
            obj[tag] = element.answer[index];
            break;
        }
      })



      var objnew = Object.assign({}, obj);
      userGridList.push(objnew);

    });
    this.source.totalCount = data.totalCount;
    this.source.load(userGridList);
  }


  toDate(dateStr: any) {
    return moment(dateStr).local().format("DD MMM YYYY");;
  }

  onTabSelect(index) {
    this.currentTabIndex = index + 1;
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.mySettings));
    settingsTemp.columns = {
      legalEntityName: {
        title: this.translate.instant('LegalEntityName'),
        filter: false,
        // width: '5%',
      },
      taxableYearEnd: {
        title: this.translate.instant('TaxableYearEnd'),
        filter: false,
        // width: '5%',
        valuePrepareFunction: (date) => {
          if (date) {
            return moment(date).local().format("DD MMM YYYY");
          }
          return "";
        },
      },
      country: {
        title: this.translate.instant('Country'),
        filter: false,
        // width: '5%',
      },
    },
      this.mySettings = Object.assign({}, settingsTemp ); 
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
