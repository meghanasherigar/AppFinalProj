import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { BlockService } from '../../../../services/block.service';
import { DesignerService } from '../../../../services/designer.service';
import { BlockAttributeDetail, BlockBasicDetails, BlockType, QuestionsBlockTypeDetails } from '../../../../../../@models/projectDesigner/block';
import { Subscription } from 'rxjs';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TaskService } from '../../services/task.service';
import { QuestionTypeViewModel, QuestionsFilterViewModel, QuestionsResponseViewModel, InformationRequestPreviewViewModel, QuestionAnswersDetailsViewModel, InformationRequestViewModel, QuestionAnswerDetailsEntityLevel } from '../../../../../../@models/projectDesigner/task';
import { ProjectContext } from '../../../../../../@models/organization';
import { Index, createInfoLabels, QuestionType } from '../../../../../../@models/projectDesigner/infoGathering';
import { ValueConstants } from '../../../../../../@models/common/valueconstants';
@Component({
  selector: 'ngx-information-preview',
  templateUrl: './information-preview.component.html',
  styleUrls: ['./information-preview.component.scss']
})
export class InformationPreviewComponent implements OnInit, OnDestroy {
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      tagName: {
        title: 'Answer Tag',
      },
      title: {
        title: 'Questions'
      },
      questionType: {
        title: 'Question Type',
        valuePrepareFunction: (cell, row) => { return row.questionType.typeName }
      },
      answerAvailable: {
        title: 'Answer(s) Available'
      },
      blockTitle: {
        title: 'Block Title',
      },
      blockType: {
        title: 'Block Type',
        valuePrepareFunction: (cell, row) => { return row.blockType.blockType }
      },
      'auditTrail.createdBy': {
        title: 'Created by',
        valuePrepareFunction: (cell, row) => { return row.auditTrail.createdBy.email }
      },
    },
  };
  informationRequestPreviewViewModel: InformationRequestPreviewViewModel = new InformationRequestPreviewViewModel();
  project: ProjectContext = new ProjectContext();
  dynamicTabs = [];
  questionList = [];
  firstTimeBind: boolean = true;
  questionAnswersDetails: QuestionAnswersDetailsViewModel[] = [];
  totalEntitiesQuestions: QuestionAnswerDetailsEntityLevel[] = [];
  payload: QuestionsFilterViewModel = new QuestionsFilterViewModel();
  multiEntitiesPayload: any = [];
  param: boolean = false;
  DisableTabDetails: boolean = false;
  pdfsrc: any;
  selectedBlockdetails: BlockBasicDetails[] = [];
  allBlockdetails: BlockBasicDetails[] = [];
  blockDetails: BlockBasicDetails[] = [];
  blockDetailResponse: BlockAttributeDetail;
  blockTypeDetails: QuestionsBlockTypeDetails[] = [];
  subscriptions: Subscription = new Subscription();
  selectedEntities: any = [];
  selectedEntity: any;
  constructor(
    private dialogService: DialogService,
    private el: ElementRef,
    private dialog: MatDialog,
    private translate: TranslateService,
    private shareDetailService: ShareDetailService,
    private blockService: BlockService,
    private designService: DesignerService,
    private _eventService: EventAggregatorService,
    private taskService: TaskService) { }

  ngOnInit() {

    this.project = this.shareDetailService.getORganizationDetail();
    this.payload.projectId = this.project.projectId;
    this.payload.pageIndex = 1;
    this.payload.pageSize = this.settings.pager.perPage;

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).subscribe((payload) => {
      if (payload == Index.four) {
        this.selectedEntities = this.designService.selectedEntities;
        this.selectedEntity = (this.designService.isDeliverableSelected && this.selectedEntities.length > 0) ? this.selectedEntities[0] : null;
        if (this.designService.isDeliverableSelected) {
          // this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsEntityLoaded).publish(this.selectedEntity.id);
          this.designService.informationRequestModel = new InformationRequestViewModel();
          this.designService.informationRequestModel = this.designService.deliverableInformationRequestModel.find(x => x['DeliverableId'] == this.selectedEntity.id);
        }
        if (!this.designService.isQuestionDataUpdated) {
          this.loadupdatedBlockTypeMenu();
        }
        else {
          this.loadupdatedBlockTypeMenu();
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionsAfterPageNameUpdation).publish("loadQuestionAfterPageNameUpdated");
        }
        this.loadBlockDetails();
        this.loadAllQuestions();
        if (this.designService.isDeliverableSelected)
          this.onEntityChanged(null);
      }
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.pageNameUpdated).subscribe((payload) => {
      this.loadupdatedBlockTypeMenu()
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionsAfterPageNameUpdation).publish("loadQuestionAfterPageNameUpdated");
    })
    )

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).subscribe(payload => {
      this.designService.isloadedQuestionAndAnswers = false;
      this.totalEntitiesQuestions = [];
      this.multiEntitiesPayload = [];
      this.loadAllQuestions();
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.clearInfoPreview).subscribe((payload) => {
      this.blockDetails = [];
      this.blockTypeDetails = [];
      this.selectedBlockdetails = [];
      this.questionAnswersDetails = [];
      this.allBlockdetails = [];
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockContentLoaded).publish(this.blockDetails);
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).publish(this.blockTypeDetails);
      if (this.designService.isDeliverableSelected)
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsLoaded).publish(this.multiEntitiesPayload);
      else
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsLoaded).publish(this.questionAnswersDetails);

    }));
  }

  loadBlockDetails() {
    this.selectedBlockdetails = [];
    if (this.designService.infoDraftResponseModel.Id != null && this.designService.infoDraftResponseModel.status == createInfoLabels.Draft && this.firstTimeBind) {
      this.designService.informationRequestModel.BlockIds = this.designService.infoDraftResponseModel.BlockIds;
      this.firstTimeBind = false;
    }
    if (this.designService.informationRequestModel.BlockIds.length > 0) {
      this.designService.informationRequestModel.BlockIds.forEach(e => {
        let viewBlock = this.designService.informationRequestModel.ViewBlockList.find(block =>
          block.blockId == e
        )
        var blockDetail = new BlockBasicDetails();
        blockDetail.blockId = viewBlock.blockId;
        blockDetail.title = viewBlock.title;
        blockDetail.content = viewBlock.blockContent
        blockDetail.blockTypeId = viewBlock.blockType.blockTypeId;
        if (this.selectedBlockdetails.findIndex(x => x.blockId == blockDetail.blockId) == -1 || this.selectedBlockdetails.length == 0) {
          this.selectedBlockdetails.push(blockDetail)
        }
      })
    }
    else {
      this.selectedBlockdetails = [];
    }
    this.loadBlockContentDetails();

  }

  loadupdatedBlockTypeMenu() {
    let questionsData = this.designService.informationRequestModel.Questions;
    if (this.designService.infoDraftResponseModel.Id != null && this.designService.infoDraftResponseModel.status == createInfoLabels.Draft && this.firstTimeBind) {
      questionsData = this.designService.infoDraftResponseModel.Questions;
      this.firstTimeBind = false;
    }
    for (let i = 0; i < questionsData.length; i++) {
      this.questionAnswersDetails.forEach(el => {
        if (el.questionId == questionsData[i].questionId) {
          el.blockType.blockType = questionsData[i].blockType;
        }
      });
    }

    this.blockTypeDetails = [];
    this.questionAnswersDetails.forEach(x => {
      let questionsBlockTypeDetails = new QuestionsBlockTypeDetails();
      questionsBlockTypeDetails.blockType = x.blockType;
      questionsBlockTypeDetails.numberOfAnswers = 0;
      questionsBlockTypeDetails.numberOfQuestions = 0;
      if (this.blockTypeDetails.find(y => y.blockType.blockType == x.blockType.blockType) == null) {
        this.blockTypeDetails.push(questionsBlockTypeDetails);
      }
    });
    this.blockTypeDetails.forEach(x => {
      let filteredQuestions = this.questionAnswersDetails.filter(y => y.blockType.blockType == x.blockType.blockType);
      x.numberOfQuestions = filteredQuestions.length;
      filteredQuestions.forEach(question => {

        if (question.typeDetails.questionType.typeName == QuestionType.BenchmarkRangeType || question.typeDetails.questionType.typeName == QuestionType.ComparabilityAnalysisType ||
          question.typeDetails.questionType.typeName == QuestionType.CoveredTransactionType || question.typeDetails.questionType.typeName == QuestionType.PLQuestionType ||
          question.typeDetails.questionType.typeName == QuestionType.PLQuestionType || question.typeDetails.questionType.typeName == QuestionType.TableType) {

          if (this.designService.informationRequestModel.TemplateId != undefined && this.designService.informationRequestModel.TemplateId != '' && this.designService.informationRequestModel.TemplateId != ValueConstants.DefaultId) {
            if (question.answerDetails.templates.length > 0) {
              let templateversions = question.answerDetails.templates[0].versions;
              if (question.answerDetails.templates.length > 0 && templateversions.length > 0 && templateversions[templateversions.length - 1].cellValues.length > 0) {
                x.numberOfAnswers = x.numberOfAnswers + 1;
              }
            }
          }
          else {
            if (question.answerDetails.deliverables.length > 0) {
              let deliverableversions = question.answerDetails.deliverables.find(deliverable => deliverable.templateOrDeliverableId == this.designService.informationRequestModel.DeliverableId);
              if (deliverableversions) {
                if (question.answerDetails.deliverables.length > 0 && deliverableversions.versions.length > 0 && deliverableversions.versions[deliverableversions.versions.length - 1].cellValues.length > 0) {
                  x.numberOfAnswers = x.numberOfAnswers + 1;
                }
              }
            }
          }
        }
        else {
          if (this.designService.informationRequestModel.TemplateId != undefined && this.designService.informationRequestModel.TemplateId != '' && this.designService.informationRequestModel.TemplateId != ValueConstants.DefaultId) {
            if (question.answerDetails.templates.length > 0) {
              let templateversions = question.answerDetails.templates[0].versions;
              if (question.answerDetails.templates.length > 0 && templateversions.length > 0 && templateversions[templateversions.length - 1].answer != undefined &&
                templateversions[templateversions.length - 1].answer != "") {
                x.numberOfAnswers = x.numberOfAnswers + 1;
              }
            }
          }
          else {
            let deliverableversions = question.answerDetails.deliverables.find(deliverable => deliverable.templateOrDeliverableId == this.designService.informationRequestModel.DeliverableId);
            if (deliverableversions) {
              if (question.answerDetails.deliverables.length > 0 && deliverableversions.versions.length > 0 && deliverableversions.versions[deliverableversions.versions.length - 1].answer != undefined &&
                deliverableversions.versions[deliverableversions.versions.length - 1].answer != "") {
                x.numberOfAnswers = x.numberOfAnswers + 1;
              }
            }
          }
        }

      });
    });
    if (this.blockTypeDetails != null && this.blockTypeDetails.length > 0) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).publish(this.blockTypeDetails[0].blockType);
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadBlockTypes).publish(this.blockTypeDetails);
  }

  loadBlockContentDetails() {
    this.blockDetails = [];
    this.allBlockdetails = [];
    if (this.designService.informationRequestModel.ViewBlockList.length > 0) {
      this.designService.informationRequestModel.ViewBlockList.forEach(element => {
        var blockDetail = new BlockBasicDetails();
        blockDetail.blockId = element.blockId;
        blockDetail.title = element.title;
        blockDetail.content = element.blockContent;
        blockDetail.description = element.description;
        blockDetail.blockTypeId = element.blockType.blockTypeId;
        if (this.allBlockdetails.findIndex(x => x.blockId == blockDetail.blockId) == -1) {
          this.allBlockdetails.push(blockDetail)
        }
      })
      this.allBlockdetails.forEach(e => {
        var blockDetail = new BlockBasicDetails();
        if (this.checkSelected(e)) {
          if (this.blockDetails.findIndex(ele => ele.blockId == e.blockId) == -1) {
            blockDetail.blockId = e.blockId;
            blockDetail.title = e.title;
            blockDetail.content = e.content;
            blockDetail.blockTypeId = e.blockTypeId;
            blockDetail.description = e.description;
            this.blockDetails.push(blockDetail);
          }
        }
        else {
          if (this.blockDetails.findIndex(ele => ele.blockId == e.blockId) == -1) {
            blockDetail.blockId = e.blockId;
            blockDetail.title = null;
            blockDetail.content = null;
            blockDetail.blockTypeId = e.blockTypeId;
            blockDetail.description = e.description;
            this.blockDetails.push(blockDetail);
          }
        }
      }
      )
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockContentLoaded).publish(this.blockDetails);
      if (this.blockTypeDetails != null && this.blockTypeDetails.length > 0) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).publish(this.blockTypeDetails[0].blockType);
      }
    }
  }
  checkSelected(blockDetail: BlockBasicDetails): boolean {
    if (this.selectedBlockdetails.find(x => x.blockId == blockDetail.blockId) != null) {
      return true;
    }
    else {
      return false;
    }
  }
  loadBlockTypeMenu() {
    this.informationRequestPreviewViewModel.questionIds = [];
    this.informationRequestPreviewViewModel.questionIds = [];
    this.informationRequestPreviewViewModel.projectId = this.designService.informationRequestModel.ProjectId;
    if (this.designService.informationRequestModel.TemplateId != null) {
      this.informationRequestPreviewViewModel.templateOrDeliverableId = this.designService.informationRequestModel.TemplateId;
      this.informationRequestPreviewViewModel.isTemplate = true;
    }
    else {
      this.informationRequestPreviewViewModel.templateOrDeliverableId = this.designService.informationRequestModel.DeliverableId;
      this.informationRequestPreviewViewModel.isTemplate = false;
    }
    this.designService.updatedQuestionGridList.forEach(x => this.informationRequestPreviewViewModel.questionIds.push(x.id))
    this.taskService.GetBlockTypesByQuestionIdsForTemplateDeliverable(this.informationRequestPreviewViewModel).subscribe((data) => {
      this.blockTypeDetails = data;
      if (this.blockTypeDetails != null && this.blockTypeDetails.length > 0) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).publish(this.blockTypeDetails[0].blockType);
      }
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadBlockTypes).publish(this.blockTypeDetails);
    })
  }
  onEntityChanged(event) {
    this.designService.informationRequestModel = new InformationRequestViewModel();
    this.designService.informationRequestModel = this.designService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.selectedEntity.id);
    this.loadAllQuestions();
    if (!this.designService.isQuestionDataUpdated) {
      this.loadupdatedBlockTypeMenu();
    }
    else {
      this.loadupdatedBlockTypeMenu();
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionsAfterPageNameUpdation).publish("loadQuestionAfterPageNameUpdated");
    }
    this.loadBlockDetails();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsEntityLoaded).publish(this.selectedEntity.id);
  }
  loadAllQuestions() {
    this.informationRequestPreviewViewModel.questionIds = [];
    this.informationRequestPreviewViewModel.projectId = this.designService.informationRequestModel.ProjectId;
    this.informationRequestPreviewViewModel.Id = this.designService.informationRequestModel.Id;
    if (this.designService.informationRequestModel.TemplateId != null) {
      this.informationRequestPreviewViewModel.templateOrDeliverableId = this.designService.informationRequestModel.TemplateId;
      this.informationRequestPreviewViewModel.isTemplate = true;
    }
    else {
      this.informationRequestPreviewViewModel.templateOrDeliverableId = this.designService.informationRequestModel.DeliverableId;
      this.informationRequestPreviewViewModel.isTemplate = false;
    }

    if (!this.designService.isloadedQuestionAndAnswers || this.questionAnswersDetails.length == 0) {
      if (this.designService.isDeliverableSelected) {
        let entities: any = [];
        this.designService.updatedQuestionGridList.forEach(x => x.delivearbleIds.forEach(y => {
          if (entities.findIndex(z => z == y) == -1)
            entities.push(y);
        }));
        entities.forEach((element, index) => {
          this.designService.updatedQuestionGridList.forEach(x => {
            if (x.delivearbleIds.indexOf(element) > -1)
              this.informationRequestPreviewViewModel.questionIds.push(x.id);
          }
          );
          this.informationRequestPreviewViewModel.templateOrDeliverableId = element;

          if (index == entities.length - 1)
            this.param = true;
          this.getSavedQuestionAnswers();
        });
      }
      else {
        this.designService.updatedQuestionGridList.forEach(x => this.informationRequestPreviewViewModel.questionIds.push(x.id));
        this.param = true;
        this.getSavedQuestionAnswers();
      }
      this.designService.isloadedQuestionAndAnswers = true;
    }
    else if (this.designService.isDeliverableSelected) {
      let entityRecord = this.multiEntitiesPayload.filter(x => x.entityId == this.designService.informationRequestModel.DeliverableId);
      this.questionAnswersDetails = (entityRecord != undefined) ? entityRecord : [];
    }
  }
  private getSavedQuestionAnswers() {
    let entityId = JSON.parse(JSON.stringify(this.informationRequestPreviewViewModel.templateOrDeliverableId));
    this.taskService.GetAllQuestionAnswersDetails(this.informationRequestPreviewViewModel).subscribe((data) => {
      this.questionAnswersDetails = data;
      if (this.questionAnswersDetails.length > 0) {
        this.questionAnswersDetails.forEach(question => {
          question.allowToEdit = true;
        });
      }
      this.designService.selectedQuestions.forEach(
        (selectedQuery) => {
          if (!selectedQuery.questionType.typeName) {
            selectedQuery.questionType = this.questionAnswersDetails.find(y => y.questionId == selectedQuery.id).typeDetails.questionType;
            selectedQuery.title = this.questionAnswersDetails.find(y => y.questionId == selectedQuery.id).title;
          }
        }
      )
      // let payload: any = [];
      if (this.designService.isDeliverableSelected) {
        this.totalEntitiesQuestions = [];
        let entityQuestions = new QuestionAnswerDetailsEntityLevel();
        entityQuestions.deliverableId = entityId;
        entityQuestions.questionAnswerDetails = this.questionAnswersDetails;
        this.totalEntitiesQuestions.push(entityQuestions);
        this.totalEntitiesQuestions.forEach(x => {
          x.questionAnswerDetails.forEach(y => {
            y.entityId = x.deliverableId;
            if (this.multiEntitiesPayload.find(x => x.questionId == y.questionId && x.entityId == y.entityId) == undefined)
              this.multiEntitiesPayload.push(y);
          })
        });
        this.questionAnswersDetails = this.totalEntitiesQuestions[this.totalEntitiesQuestions.length - 1].questionAnswerDetails;
        if (this.param == true) {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.reloadPageSection).publish("");
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsLoaded).publish(this.multiEntitiesPayload);
        }
      }
      else {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.reloadPageSection).publish("");
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsLoaded).publish(this.questionAnswersDetails);
      }
      this.loadupdatedBlockTypeMenu();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
