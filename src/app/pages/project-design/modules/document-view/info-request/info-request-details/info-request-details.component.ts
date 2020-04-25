import { Component, OnInit, OnDestroy } from '@angular/core';
import { CreateInfoService } from '../../services/create-info.service';
import { InformationResponseViewModel, Index, InfoQuestionApproved, createInfoLabels, InfoRequestStatus, QuestionType } from '../../../../../../@models/projectDesigner/infoGathering';
import { DesignerService } from '../../../../services/designer.service';
import { InformationRequestViewModel, InformationRequestPreviewViewModel, QuestionAnswersDetailsViewModel, AnswerDetailsRequestModel, ViewBlockResponseViewModel, InformationRequestStatusViewModel } from '../../../../../../@models/projectDesigner/task';
import { BlockType, QuestionsBlockTypeDetails, BlockBasicDetails, BlockAttributeDetail } from '../../../../../../@models/projectDesigner/block';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, NavigationSource, EventConstants } from '../../../../../../@models/common/eventConstants';
import { TaskService } from '../../services/task.service';
import { Subscription } from 'rxjs';
import { load } from '@angular/core/src/render3';
import { BlockService } from '../../../../services/block.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { ValueConstants } from '../../../../../../@models/common/valueconstants';
import { Router } from '@angular/router';
import { QuestionIdsViewModel } from '../../../../../../@models/userAdmin';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { SubMenus } from '../../../../../../@models/projectDesigner/designer';
import { StorageKeys, StorageService } from '../../../../../../@core/services/storage/storage.service';
import { TemplateDetailsRequestModel, TemplateDeliverableViewModel } from '../../../../../../@models/projectDesigner/template';
import { TemplateService } from '../../../../services/template.service';
import { Location } from '@angular/common';
import { SessionStorageService } from '../../../../../../@core/services/storage/sessionStorage.service';

@Component({
  selector: 'ngx-info-request-details',
  templateUrl: './info-request-details.component.html',
  styleUrls: ['./info-request-details.component.scss']
})
export class InfoRequestDetailsComponent implements OnInit, OnDestroy {
  informationRequestViewModel: InformationRequestViewModel = new InformationRequestViewModel();
  coverPageData: string;
  projectDetails: ProjectContext;
  currentIndex = 1;
  showNext: Boolean;
  answers: AnswerDetailsRequestModel[] = [];
  isIntroduction: boolean = true;
  showPrevious: Boolean;
  blockQuestionView: any = 3;
  informationRequestForBlockTypes: InformationRequestPreviewViewModel = new InformationRequestPreviewViewModel();
  informationRequestForQuestionAndAnswers: InformationRequestPreviewViewModel = new InformationRequestPreviewViewModel();
  infoRequestDetails: InformationResponseViewModel = new InformationResponseViewModel();
  blockTypeDetails: QuestionsBlockTypeDetails[] = [];
  subscriptions: Subscription = new Subscription();
  blockDetailResponse: BlockAttributeDetail;
  blockDetails: BlockBasicDetails[] = [];
  selectedBlockType: any;
  selectedBlockQuestions: QuestionIdsViewModel[] = [];
  viewBlocks: ViewBlockResponseViewModel[] = [];
  questionAnswersDetails: QuestionAnswersDetailsViewModel[] = [];
  closeInfoReq: boolean = false;
  //ngx-ui-loader configuration
  loaderId = 'createInfo';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  navigationSource: string = '';
  constructor(private infoGatheringService: CreateInfoService,
    private designerService: DesignerService, private _eventService: EventAggregatorService,
    private taskService: TaskService,
    private blockService: BlockService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService,
    private router: Router, 
    private shareDetailService: ShareDetailService,
    private templateService: TemplateService,
    private storageService: StorageService,
    private location: Location,        
    private sessionStorageService: SessionStorageService) { }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).subscribe(payload => {
      this.loadQuestionAndAnswers();
    }))
    this.designerService.changeIsDocFullView(false);
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).subscribe((type) => {
      this.selectedBlockType = type;
      this.loadContentandQuestion(type as BlockType)
    }));

    this.designerService.navigationSource.subscribe(origin => {
      if (origin) {
        this.navigationSource = origin;
      } else {
        this.navigationSource = '';
      }
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.saveInfoRequest).subscribe((payload) => {
      if (payload == "closeRequest") {
        this.closeInfoReq = true;
      } else {
        this.saveInfoRequest();
      }
      this.designerService.percentageCalculations = [];
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadInfoRequestView).subscribe((payload: any) => {
      this.blockQuestionView = (payload[Index.zero].checked && payload[Index.one].checked) ? 3 : (payload[Index.zero].checked && !payload[Index.one].checked) ? 1 : (!payload[Index.zero].checked && payload[Index.one].checked) ? 2 : 3;
    }
    ));

    //redirecturl-from-email
    if (this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) != null) {
      this.getTemplateDeliverablesForURLRedirect();
    } else {
      this.onGetInfoRequest(this.designerService.infoRequestId);
    }

    if (this.blockTypeDetails.length > 0) {
      this.loadQuestionsAndAnswersByBlockType(this.blockTypeDetails[0].blockType);
    }
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }
  saveInfoRequest() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.designerService.savedComments = [];
    let attachments = this.designerService.attachmentsFormData;;
    let isAttachment = (attachments.length > 0) ? true : false;
    if (this.designerService.informationRequestModel.AnswerDetails.length > 0) {
      if (this.informationRequestForBlockTypes.isTemplate) {
        this.designerService.informationRequestModel.AnswerDetails.forEach(x => x.templateId = this.informationRequestForBlockTypes.templateOrDeliverableId);
      }
      else {
        this.designerService.informationRequestModel.AnswerDetails.forEach(x => x.deliverableId == this.informationRequestForBlockTypes.templateOrDeliverableId);
      }
    }
    this.answers = this.designerService.informationRequestModel.AnswerDetails.map(a => Object.assign({}, a));
    this.designerService.informationRequestModel.AnswerDetails = [];
    let informationRequestStatusModel = new InformationRequestStatusViewModel();
    informationRequestStatusModel.answerDetails = this.answers;
    informationRequestStatusModel.informationRequestId = this.designerService.infoRequestId;
    informationRequestStatusModel.status = this.designerService.infoRequestStatus;

    this.subscriptions.add(this.taskService.UpdateDetailsByAssignee(informationRequestStatusModel).subscribe(response => {
      if (response.status === ResponseStatus.Sucess) {
        this.designerService.informationRequestModel.AnswerDetails = [];
        attachments.forEach((file, index) => {
          this.taskService.addAttachmentInfoRequest(file).subscribe(attachmentStatus => {
            if (response.status == ResponseStatus.Sucess) {
              //this.loadQuestionsAndAnswersByBlockType(this.selectedBlockType);
            }
            else {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
            if (index == attachments.length - 1)
              this.loadQuestionAndAnswers();
          })
        });
        this.designerService.attachmentsFormData = [];
        this.designerService.informationRequestModel.Id = response.tag;
        if (this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) != null) {
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.info-gathering.errorMessages.ModifiedInfoRequestSuccess'));
        } else {
          if (!this.closeInfoReq && !this.designerService.disableMessage) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.info-gathering.errorMessages.ModifiedInfoRequestSuccess'));
            this.redirectToProjectManagement();
          }
          else if (this.closeInfoReq) {
            this.designerService.changeIsDocFullView(true);
            this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-list'], level2Menu: ['info-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
          }
        }
        if (!isAttachment || (this.designerService.disableMessage && this.designerService.saveAsDraftCheck)) {
          this.loadQuestionAndAnswers();
        }

      }
      else {
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      }
    }, error => {
      this.dialogService.Open(DialogTypes.Warning, error.message);
    })
    )
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  loadAnswerCalculation(selectedBlockType) {
    this.blockTypeDetails = [];
    this.blockTypeDetails = [];
    let questionblockType = new QuestionsBlockTypeDetails();
    let blockType = new BlockType();
    blockType.blockType = createInfoLabels.Introduction;
    questionblockType.blockType = blockType;
    this.blockTypeDetails.push(questionblockType);
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
        if (this.informationRequestForBlockTypes.isTemplate) {
          if (question.typeDetails.questionType.typeName == QuestionType.BenchmarkRangeType || question.typeDetails.questionType.typeName == QuestionType.ComparabilityAnalysisType ||
            question.typeDetails.questionType.typeName == QuestionType.CoveredTransactionType || question.typeDetails.questionType.typeName == QuestionType.PLQuestionType ||
            question.typeDetails.questionType.typeName == QuestionType.PLQuestionType || question.typeDetails.questionType.typeName == QuestionType.TableType) {
            let templateversions = question.answerDetails.templates.find(template => template.templateOrDeliverableId == this.informationRequestForBlockTypes.templateOrDeliverableId);
            if (templateversions != null) {
              if (question.answerDetails.templates.length > 0 && (templateversions.versions.length > 0 || templateversions.isNotApplicable) && templateversions.versions[templateversions.versions.length - 1].cellValues.length > 0) {
                x.numberOfAnswers = x.numberOfAnswers + 1;
              }
            }

          } else {
            let templateversions = question.answerDetails.templates.find(template => template.templateOrDeliverableId == this.informationRequestForBlockTypes.templateOrDeliverableId);
            if (templateversions != null) {
              if (question.answerDetails.templates.length > 0 && (templateversions.versions.length > 0 || templateversions.isNotApplicable) && (templateversions.versions.length > 0 && templateversions.versions[templateversions.versions.length - 1].answer != undefined)
                && templateversions.versions[templateversions.versions.length - 1].answer != "") {
                x.numberOfAnswers = x.numberOfAnswers + 1;
              }
            }
          }

        }
        else {
          if (question.typeDetails.questionType.typeName == QuestionType.BenchmarkRangeType || question.typeDetails.questionType.typeName == QuestionType.ComparabilityAnalysisType ||
            question.typeDetails.questionType.typeName == QuestionType.CoveredTransactionType || question.typeDetails.questionType.typeName == QuestionType.PLQuestionType ||
            question.typeDetails.questionType.typeName == QuestionType.PLQuestionType || question.typeDetails.questionType.typeName == QuestionType.TableType) {
              let deliverableversion = question.answerDetails.deliverables.find(deliverable => deliverable.templateOrDeliverableId == this.informationRequestForBlockTypes.templateOrDeliverableId);
              if (deliverableversion != null) {
                if (question.answerDetails.deliverables.length > 0 && (deliverableversion.versions.length > 0 || deliverableversion.isNotApplicable) && deliverableversion.versions[deliverableversion.versions.length - 1].cellValues.length > 0) {
                  x.numberOfAnswers = x.numberOfAnswers + 1;
                }
              }
          }
          else {
            let deliverableversion = question.answerDetails.deliverables.find(deliverable => deliverable.templateOrDeliverableId == this.informationRequestForBlockTypes.templateOrDeliverableId);
            if (deliverableversion != null) {
              if (question.answerDetails.deliverables.length > 0 && (deliverableversion.versions.length > 0 || deliverableversion.isNotApplicable) && (deliverableversion.versions.length > 0 && deliverableversion.versions[deliverableversion.versions.length - 1].answer != undefined
              && deliverableversion.versions[deliverableversion.versions.length - 1].answer != "")) {
                x.numberOfAnswers = x.numberOfAnswers + 1;
              }
            }
          }
        }
      });
    });
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadBlockTypes).publish(this.blockTypeDetails);
    if (selectedBlockType == undefined) {
      selectedBlockType = blockType;
    }
    this.loadContentandQuestion(selectedBlockType)
  }

  onGetInfoRequest(id) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.infoGatheringService.getInformationRequestById(id).subscribe((data: InformationResponseViewModel) => {
      this.designerService.viewedInforRequestId = id;
      this.infoRequestDetails = data as InformationResponseViewModel;
      
      //redirecturl-from-email
      if(this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) != null){
        this.designerService.infoDraftResponseModel.AssignTo = data.assignTo;
      }

      this.designerService.isEditInfoRequest = true;
      this.designerService.questionFilterResponse = data.filters;
      if (this.designerService.InfoQuestionApproved.length > 0) this.designerService.InfoQuestionApproved = [];
      data.questions.forEach(x => {
        let objApprove = new InfoQuestionApproved();
        objApprove.questionId = x.questionId,
          objApprove.isapproved = x.isApproved;
        this.designerService.InfoQuestionApproved.push(objApprove);
        this.designerService.selectedQuestionIds.push(x.questionId);
        this.informationRequestForBlockTypes.questionIds.push(x.questionId);
      });
      this.coverPageData = data.coverPage;
      this.informationRequestForBlockTypes.Id = id;
      this.infoRequestDetails.blockIds = data.blockIds;
      this.designerService.infoRequestinProgressEdited = data.isSaved;
      this.informationRequestForBlockTypes.projectId = data.projectId;
      if (data.templateId != null && data.templateId != ValueConstants.DefaultId) {
        this.informationRequestForBlockTypes.templateOrDeliverableId = data.templateId;
        this.informationRequestForBlockTypes.isTemplate = true;
        this.designerService.ViewedIsTemplate = true
        this.designerService.ViewedTemplateOrDelieverable = data.templateId;
      } else {
        this.informationRequestForBlockTypes.templateOrDeliverableId = data.deliverableId;
        this.informationRequestForBlockTypes.isTemplate = false;
        this.designerService.ViewedIsTemplate = false;
        this.designerService.ViewedTemplateOrDelieverable = data.deliverableId;
      }
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.requestLevel2Details).publish(data);
      this.selectedBlockQuestions = [];

      data.questions.forEach(query => {
        let questionIdViewModel = new QuestionIdsViewModel();
        questionIdViewModel.QuestionId = query.questionId;
        questionIdViewModel.QuestionnarieId = query.questionnaireId;
        questionIdViewModel.projectId = data.projectId;
        this.selectedBlockQuestions.push(questionIdViewModel)
      }
      )
      this.designerService.informationRequestModel.ViewBlockList = [];
      this.taskService.getallblocksbyquestionids(this.selectedBlockQuestions).subscribe((response) => {
        this.viewBlocks = response;
        data.blockIds.forEach(blockid => {
          let viewBlock = this.viewBlocks.find(x => x.blockId == blockid);
          this.designerService.informationRequestModel.ViewBlockList.push(viewBlock)
        })
        this.taskService.GetAllQuestionAnswersDetails(this.informationRequestForBlockTypes).subscribe((data) => {
          this.questionAnswersDetails = data;
          this.loadAnswerCalculation(undefined);
          this.loadBlockContent();
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsLoaded).publish(data);
        })
      })
    })
    this.ngxLoader.stopBackgroundLoader(this.loaderId);

  }
  loadContentandQuestion(type: BlockType) {
    let typeName = type.blockType;
    if (typeName != 'Introduction') {
      this.isIntroduction = false;
      this.loadQuestionsAndAnswersByBlockType(type);
    }
    else {
      this.isIntroduction = true;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadcoverpage).publish(this.coverPageData)
    }


  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.designerService.isEditInfoRequest = false;
    this.designerService.viewedInforRequestId = null;
  }
  loadBlockContent() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    if (this.infoRequestDetails.blockIds.length > 0) {
      this.designerService.informationRequestModel.ViewBlockList.forEach((element) => {
        if (this.viewBlocks.findIndex(viewBlock => viewBlock.blockId == element.blockId) != -1) {
          let blockDetail = new BlockBasicDetails();
          blockDetail.blockId = element.blockId
          blockDetail.title = element.title;
          blockDetail.content = element.blockContent;
          blockDetail.blockTypeId = element.blockType.blockTypeId;
          blockDetail.description = element.description;
          if (this.blockDetails.findIndex(x => x.blockId == blockDetail.blockId) == -1) {
            this.blockDetails.push(blockDetail)
          }
        }
        else {
          let blockDetail = new BlockBasicDetails();
          blockDetail.blockId = element.blockId;
          blockDetail.title = null;
          blockDetail.content = null;
          blockDetail.blockTypeId = element.blockType.blockTypeId;
          blockDetail.description = element.description;
          if (this.blockDetails.findIndex(x => x.blockId == blockDetail.blockId) == -1) {
            this.blockDetails.push(blockDetail)
          }
        }

      })
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockContentLoaded).publish(this.blockDetails);
    }
    else {
      this.blockDetails = [];
      let blockDetail = new BlockBasicDetails();
      blockDetail.title = null;
      blockDetail.content = "";
      this.blockDetails.push(blockDetail);
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockContentLoaded).publish(this.blockDetails);
    }
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }
  // loadQuestionAndAnswers(blockType: BlockType) {
  //   this.informationRequestForQuestionAndAnswers = Object.assign({}, this.informationRequestForBlockTypes)
  //   this.informationRequestForQuestionAndAnswers.blockTypeId = blockType.blockTypeId;
  //   this.taskService.GetAllQuestionAnswersDetails(this.informationRequestForQuestionAndAnswers).subscribe((data) => {
  //     this.questionAnswersDetails = data;
  //     this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsLoaded).publish(data);
  //   })
  // }
  loadQuestionsAndAnswersByBlockType(blockType: BlockType) {
    this.designerService.blockTypeInforReq = blockType.blockTypeId;
  }
  loadQuestionAndAnswers() {
    if (this.designerService.infoRequestStatus == InfoRequestStatus.InProgress || this.designerService.infoRequestStatus == InfoRequestStatus.Review)
      this.designerService.infoRequestinProgressEdited = true;
    else
      this.designerService.infoRequestinProgressEdited = false;
    this.informationRequestForQuestionAndAnswers = Object.assign({}, this.informationRequestForBlockTypes);
    this.taskService.GetAllQuestionAnswersDetails(this.informationRequestForBlockTypes).subscribe((data) => {
      this.questionAnswersDetails = data;
      this.loadAnswerCalculation(this.selectedBlockType);
      if (this.designerService.InfoQuestionApproved.length > 0) this.designerService.InfoQuestionApproved = [];
      this.questionAnswersDetails.forEach(x => {
        let objApprove = new InfoQuestionApproved();
        objApprove.questionId = x.questionId,
          objApprove.isapproved = x.isApproved;
        this.designerService.InfoQuestionApproved.push(objApprove);

      })
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsLoaded).publish(data);
    })
  }
  goPrevious() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.currentIndex = this.currentIndex - 1;
    // this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain/create-info/'+this.possibleRoutes[this.currentIndex].path]);
    if (this.currentIndex < 4) {
      this.showNext = true;
    }
    if (this.currentIndex == 0) {
      this.showPrevious = false;
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).publish(this.currentIndex);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);

  }
  goNext() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.currentIndex = this.currentIndex + 1;
    // this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain/create-info/'+this.possibleRoutes[this.currentIndex].path]);
    this.showPrevious = true;
    if (this.currentIndex == 4) {
      this.showNext = false;
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).publish(this.currentIndex);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);

  }

  redirectToProjectManagement() {
    if(this.navigationSource === NavigationSource.MyTask) {
      this.designerService.navigation('');
      this._eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
      this.router.navigate(['pages/project-management/ProjectManagementMain',
        { outlets: { primary: ['tasks'], level2Menu: ['PMTaskLevel2Menu'], topmenu: ['ProjectManagementTopMenu'] } }]);
    } else {
      this.designerService.changeIsDocFullView(true);
      this.designerService.changeTabDocumentView(SubMenus.InformationRequest);
      this.designerService.selectedSubmenus(SubMenus.InformationRequest);
      this.designerService.selecteMenu(0);
      this.designerService.hideOrShowMenus(0);
      this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-list'], level2Menu: ['info-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
    }
  }
  getTemplateDeliverablesForURLRedirect() {
    let projectDetails = this.shareDetailService.getORganizationDetail();
    let templateDetailsRequestModel = new TemplateDetailsRequestModel()
    templateDetailsRequestModel.projectId = projectDetails.projectId;
    this.designerService.infoRequestId = projectDetails.informationRequestId;
    if (projectDetails.type == InfoRequestStatus.InProgress) {
      this.designerService.infoRequestStatus = InfoRequestStatus.InProgress
    } else if(projectDetails.type == InfoRequestStatus.Review) {
      this.designerService.infoRequestStatus = InfoRequestStatus.Review
    }
    this.templateService.getTemplateDeliverables(templateDetailsRequestModel).subscribe((data: TemplateDeliverableViewModel[]) => {
      this.designerService.templateDeliverableList = data;
      this.onGetInfoRequest(projectDetails.informationRequestId);
    });
  }

}
