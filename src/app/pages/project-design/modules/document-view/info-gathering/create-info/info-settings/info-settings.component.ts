import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { Subscription } from 'rxjs';
import { LocalDataSource, ViewCell } from '../../../../../../../@core/components/ng2-smart-table';
import { CustomHTML } from '../../../../../../../shared/services/custom-html.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuestionsResponseViewModel, InformationRequestViewModel, ProjectUsersListViewModel, UserBasicViewModel, InformationFiltersViewModel, ViewBlockResponseViewModel, ProjectUsersListResultViewModel, selectedQuestionsViewModel, SelectedQuestionsViewModel, QuestionTypeViewModel, UserBasicViewModelInfoReq } from '../../../../../../../@models/projectDesigner/task';
import { DesignerService } from '../../../../../services/designer.service';
import { DialogTypes } from '../../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { createInfoLabels, Index, QuestionType } from '../../../../../../../@models/projectDesigner/infoGathering';
import { ProjectUserService } from '../../../../../../admin/services/project-user.service';
import { QuestionIdsViewModel } from '../../../../../../../@models/userAdmin';
import { ProjectContext } from '../../../../../../../@models/organization';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { StorageService } from '../../../../../../../@core/services/storage/storage.service';
import { BlockType } from '../../../../../../../@models/projectDesigner/block';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-question-section-inline',
  template: `<div [innerHtml] ="row.blockTitle"></div>`,
  styleUrls: ['./info-settings.component.scss']
})

export class QuestionInlineEditComponent implements ViewCell, OnInit {
  @Input() rowData: any;
  @Input() value: string;
  row: any;
  editedSectionValue: string;

  constructor(private designerService: DesignerService) { }

  ngOnInit() {
    this.row = this.rowData;
  }

  OnInputSection(event) {
    this.designerService.informationRequestModel.Questions = [];
    this.designerService.selectedQuestionsViewModelArray = [];
    this.editedSectionValue = event.target.value;
    this.designerService.updatedQuestionGridList.forEach(element => {
      let selectedQuestionViewModel = new selectedQuestionsViewModel();
      if (element.id == this.row.id) {
        element.blockTitle = this.editedSectionValue;
        this.designerService.isQuestionDataUpdated = true;
      }
      selectedQuestionViewModel.questionId = element.id;
      selectedQuestionViewModel.questionnaireId = element.questionnariesId;
      selectedQuestionViewModel.title = element.title;
      selectedQuestionViewModel.blockType = element.blockType.blockType;
      selectedQuestionViewModel.blockTitle = element.blockTitle;
      this.designerService.selectedQuestionsViewModelArray.push(selectedQuestionViewModel);
      this.designerService.informationRequestModel.Questions = this.designerService.selectedQuestionsViewModelArray;
    });
    this.designerService.selectedQuestions.forEach(el => {
      if (el.id == this.row.id) {
        el.blockTitle = this.editedSectionValue;
        el.blockType = this.row.blockType;
      }
    });
  }
}

@Component({
  selector: 'ngx-question-page-inline',
  template: `<input type="text" [value]="row.blockType.blockType" class="editableInput" (change)="OnInputPage($event)">`,
  styleUrls: ['./info-settings.component.scss']
})

export class QuestionInlinePageComponent implements ViewCell, OnInit {
  @Input() rowData: any;
  @Input() value: string;
  row: any;
  editedPageValue: any;

  constructor(private designerService: DesignerService, private _eventService: EventAggregatorService) { }

  ngOnInit() {
    this.row = this.rowData;
  }

  OnInputPage(event) {
    this.designerService.informationRequestModel.Questions = [];
    this.designerService.selectedQuestionsViewModelArray = [];
    this.editedPageValue = event.target.value;
    this.designerService.updatedQuestionGridList.forEach(element => {
      let selectedQuestionViewModel = new selectedQuestionsViewModel();
      if (element.id == this.row.id) {
        element.blockType.blockType = this.editedPageValue;
        this.designerService.isQuestionDataUpdated = true;
      }
      selectedQuestionViewModel.questionId = element.id;
      selectedQuestionViewModel.questionnaireId = element.questionnariesId;
      selectedQuestionViewModel.title = element.title;
      selectedQuestionViewModel.blockType = element.blockType.blockType;
      selectedQuestionViewModel.blockTitle = element.blockTitle;
      this.designerService.selectedQuestionsViewModelArray.push(selectedQuestionViewModel);
      this.designerService.informationRequestModel.Questions = this.designerService.selectedQuestionsViewModelArray;
    });
    this.designerService.selectedQuestions.forEach(el => {
      if (el.id == this.row.id) {
        el.blockTitle = this.row.blockTitle;
        el.blockType.blockType = this.editedPageValue;
      }
    });
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.pageNameUpdated).publish("pageNameUpdated");
  }
}

@Component({
  selector: 'ngx-info-settings',
  templateUrl: './info-settings.component.html',
  styleUrls: ['./info-settings.component.scss']
})
export class InfoSettingsComponent implements OnInit {
  CurrentStep: any;
  questionsList: any;
  deliverableList: any = [];
  source: LocalDataSource = new LocalDataSource();
  subscriptions: Subscription = new Subscription();
  customAction: Array<{ id: string, value: string }> = [];
  selectedRow: any;
  IsEnableViewBlcok = false;
  IsViewBlocks: boolean = false;
  formSubmitted = false;
  userInvalid = false;
  disabledChckbox: boolean;
  detailsForm: FormGroup;
  dataModel = new QuestionsResponseViewModel();
  selectedQuestionsModel = new SelectedQuestionsViewModel();
  saveRequestModel: InformationRequestViewModel = new InformationRequestViewModel();
  UpdateId: string;
  public AssignToDropdownSetting: any;
  public coReviewerDropdownSetting: any;
  selectedCoReviewerItems: any[] = [];
  selectedAssignToItems: any[] = [];
  AssignToList: any = [];
  AssignToDetail: ProjectUsersListResultViewModel[] = [];
  CoReviewerList: any = [];
  CoReviewerDetail: ProjectUsersListResultViewModel[] = [];
  dropdownModel: ProjectUsersListViewModel = new ProjectUsersListViewModel();
  changedDeliverableId: string = "";
  userBasicViewModel = new Array<UserBasicViewModel>();
  questionIdList: string[] = [];
  selectedQuestionsViewModelArray: selectedQuestionsViewModel[] = [];
  ViewBlockList: any = [];
  EnableDeliverable: boolean = false;
  SelectedViewBlockItems: any[] = [];
  checked: boolean = false;
  todayDate = new Date();
  switchEnable = false;
  projectDetails: ProjectContext;
  firstTimeBind: any = true;
  changedEntity: boolean = false;
  settings = {
    hideSubHeader: true,
    actions: {
      add: false, edit: false, delete: false, select: true,
      //  custom: [{ name: 'Viewmore', title: '<a href class="entityViewMore" style="font-size:14px">View more</a>' }],
      position: 'right',
    },
    checkbox: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
    mode: 'inline'
  }

  constructor(
    private taskService: TaskService,
    private customHTML: CustomHTML,
    private formBuilder: FormBuilder,
    private elRef: ElementRef,
    private ngxLoader: NgxUiLoaderService,
    private designerService: DesignerService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private ShareDetailService: ShareDetailService,
    private _eventService: EventAggregatorService,
    private projectUserService: ProjectUserService,
    private storageService: StorageService) {
    this.detailsForm = this.formBuilder.group({
      RequestName: [''],
      AssignTo: [''],
      DueDate: [''],
      ViewBlocks: [''],
      CoReviewer: [''],
    });

    this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setColumnSettings();
      this.source.refresh();
    }));

    this.setColumnSettings();
  }


  loaderId = 'InfoSettingLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';


  ngOnInit() {
    this.designerService.updatedQuestionGridList = [];
    this.projectDetails = this.ShareDetailService.getORganizationDetail();
    this.getAssigneeCoReviewers();

    this.designerService.informationRequestModel = this.saveRequestModel;

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).subscribe(() => {
      let newInfo = new InformationRequestViewModel();
      this.designerService.informationRequestModel = newInfo;
      this.designerService.selectedQuestionIds = [];
      this.detailsForm.reset();
      this.detailsForm.controls[createInfoLabels.DueDate].setValue(this.toDate(Date.now()));
      this.selectedAssignToItems = [];
      this.selectedCoReviewerItems = [];
      this.questionIdList = [];
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.clearCoverPage).publish("clear");

    }))
    this.detailsForm.valueChanges.debounceTime(1000).subscribe((val) => {
      this.saveDataLocal();
    });
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.reloadPageSection).subscribe((payload) => {
      this.EnableDeliverable = false;
      this.loadQuestionsGrid();
      if (this.designerService.selectedEntities != undefined && this.designerService.selectedEntities.length > 0)
        this.EnableDeliverable = true;
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).subscribe((payload) => {
      if (payload == 2) {
        this.multipleSelectDropdownSetting();
        this.dropdownModel.Deliverables = [];
        if (this.designerService.selectedEntities != undefined && this.designerService.selectedEntities.length > 0) {
          this.EnableDeliverable = true;
          let entitiesToBeremoved: any = [];

          this.designerService.selectedEntities.forEach(entity => {
            let exists: any = false;
            this.designerService.selectedQuestions.forEach(question => {
              let entityQuestions = question.delivearbleIds.find(x => x == entity['id']);
              if (entityQuestions != undefined)
                exists = true;
            });
            if (!exists)
              entitiesToBeremoved.push(entity['id'])
          })
          entitiesToBeremoved.forEach(entId => {
            let index = this.designerService.selectedEntities.findIndex(x => x['id'] == entId);
            if (index > -1)
              this.designerService.selectedEntities.splice(index, 1);
          })
          if (this.designerService.selectedEntities.length != this.deliverableList.length) {
            this.changedDeliverableId = '';
            this.clearControls();
            this.designerService.deliverableInformationRequestModel = [];
          }
          else {
            this.designerService.selectedEntities.forEach(ent => {
              let existingEntities = this.deliverableList.find(x => x.id == ent['id']);
              if (existingEntities == undefined) {
                this.changedDeliverableId = '';

                this.clearControls();
                this.designerService.deliverableInformationRequestModel = [];
                return;
              }
            })
          }
          this.deliverableList = [];
          this.deliverableList = this.designerService.selectedEntities;
        }
        else {
          this.EnableDeliverable = false;
        }
        this.dropdownModel.ProjectId = this.designerService.questionsFilters.projectId;
        if (this.designerService.questionsFilters.deliverablesId != undefined && this.designerService.questionsFilters.deliverablesId.length > 0) {
          if (this.changedDeliverableId != '')
            this.dropdownModel.Deliverables.push(this.changedDeliverableId);
          else
            this.dropdownModel.Deliverables.push(this.deliverableList[0].id);
          // this.changedDeliverableId = this.deliverableList[0].id;
          this.dropdownModel.TemplateId = '';
        }
        else {
          this.dropdownModel.Deliverables = [];
          this.dropdownModel.TemplateId = this.designerService.questionsFilters.templateId[0];
        }
        this.getAssigneeCoReviewers();

        this.loadQuestionsGrid();

        let selectedFilteredQuestionIds: QuestionIdsViewModel[] = [];
        this.designerService.updatedQuestionGridList.forEach(x => {
          let questionIdModel = new QuestionIdsViewModel();
          questionIdModel.projectId = this.projectDetails.projectId;
          questionIdModel.QuestionId = x.id;
          questionIdModel.QuestionnarieId = x.questionnariesId;
          selectedFilteredQuestionIds.push(questionIdModel);
        });
        this.getViewBlocks(selectedFilteredQuestionIds);
      }
    }));
    this.disabledChckbox = true;

  }

  private getViewBlocks(selectedFilteredQuestionIds: any[]) {
    this.taskService.getallblocksbyquestionids(selectedFilteredQuestionIds).subscribe(data => {
      this.ViewBlockList = data;
      //Multiple deliverables restoring the blocks selection
      if (this.designerService.isDeliverableSelected && this.designerService.deliverableInformationRequestModel.length > 0) {
        var infoRequst = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
        if (infoRequst != undefined) {
          infoRequst.ViewBlockList = data;
          infoRequst.BlockIds.forEach((Id) => {
            let viewblock = this.ViewBlockList.find(x => x.blockId == Id);
            if (viewblock != null) {
              viewblock.checked = true;
            }
          });
        }
      }
      else
        this.designerService.informationRequestModel.ViewBlockList = data;
      if (this.designerService.infoDraftResponseModel.Id != null &&
        this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft && this.firstTimeBind) {
        this.IsViewBlocks = this.designerService.infoDraftResponseModel.IsViewBlock;
        this.onCheckboxSelect();
        this.SelectedViewBlockItems = this.designerService.infoDraftResponseModel.BlockIds;
        this.ViewBlockList.forEach(x => {
          let index = this.SelectedViewBlockItems.findIndex(y => y.BlockId == x.BlockId);
          if (index > -1)
            x.checked = true;
        });
        if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft && this.firstTimeBind) {
          this.setCreateInfoSetting();
        }
        this.firstTimeBind = false;
      }
    });
  }

  private setCreateInfoSetting() {
    this.detailsForm.controls[createInfoLabels.RequestName].setValue(this.designerService.infoDraftResponseModel.Name);
    this.detailsForm.controls[createInfoLabels.DueDate].setValue(this.toDate(this.designerService.infoDraftResponseModel.DueDate));
    this.designerService.informationRequestModel.BlockIds = this.designerService.infoDraftResponseModel.BlockIds;
    this.designerService.informationRequestModel.IsViewBlock = this.designerService.infoDraftResponseModel.IsViewBlock;
    this.designerService.informationRequestModel.BlockIds.forEach((Id) => {
      let viewblock = this.ViewBlockList.find(x => x.blockId == Id);
      if (viewblock != null) {
        viewblock.checked = true;
      }
    })

    this.designerService.selectedQuestions.forEach((selectedQues) => {
      let draftQuestion = this.designerService.infoDraftResponseModel.Questions.find(z => z.questionId == selectedQues.id)
      if (draftQuestion != null) {
        if (selectedQues.blockType.blockType != draftQuestion.blockType) {
          this.designerService.isQuestionDataUpdated = true;
        }
        selectedQues.blockType.blockType = draftQuestion.blockType;
        selectedQues.blockTitle = draftQuestion.blockTitle;
      }
    })
    this.designerService.informationRequestModel.AssignTo = [];
    this.designerService.informationRequestModel.CoReviewer = []

    this.selectedAssignToItems = [];
    this.selectedCoReviewerItems = [];
    this.designerService.infoDraftResponseModel.AssignTo.forEach(x => {
      let objAssign = new ProjectUsersListResultViewModel();
      objAssign.userFirstName = x.firstName;
      objAssign.userLastName = x.lastName;
      objAssign.userEmail = x.email;
      this.selectedAssignToItems.push(objAssign);
    })
    this.designerService.infoDraftResponseModel.CoReviewer.forEach(x => {
      let objAssign = new ProjectUsersListResultViewModel();
      objAssign.userFirstName = x.firstName;
      objAssign.userLastName = x.lastName;
      objAssign.userEmail = x.email;
      this.selectedCoReviewerItems.push(objAssign);
    })
    this.selectedAssignToItems.forEach((element: any) => {
      this.AssignToDetail.push(element.userEmail);
    });
    this.designerService.AssignToList = this.AssignToDetail;
    this.selectedCoReviewerItems.forEach((element: any) => {
      this.CoReviewerDetail.push(element.userEmail);
    });
    this.designerService.CoReviewerList = this.CoReviewerDetail;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish("reload");
  }
  private getAssigneeCoReviewers() {
    this.AssignToList = [];
    this.CoReviewerList = [];
    let currentUser = this.storageService.getItem('currentUser');
    let loggedInUsermail = JSON.parse(currentUser).profile.email;
    this.taskService.getuserslstonTemplateIdorDelieverables(this.dropdownModel).subscribe(data => {
      this.AssignToList = data;
      this.CoReviewerList = data;
      this.CoReviewerList = data.filter(item => item.userEmail !== loggedInUsermail);
      if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft
        && this.firstTimeBind) {
        this.designerService.informationRequestModel.AssignTo = [];
        this.designerService.informationRequestModel.CoReviewer = []

        this.selectedAssignToItems = [];
        this.selectedCoReviewerItems = [];
        this.designerService.infoDraftResponseModel.AssignTo.forEach(x => {
          let objAssign = new ProjectUsersListResultViewModel();
          objAssign.userFirstName = x.firstName;
          objAssign.userLastName = x.lastName;
          objAssign.userEmail = x.email;
          if (this.selectedAssignToItems.find(y => y.userEmail == x.email) == null) {
            this.selectedAssignToItems.push(objAssign);
          }
        })
        this.designerService.infoDraftResponseModel.CoReviewer.forEach(x => {
          let objAssign = new ProjectUsersListResultViewModel();
          objAssign.userFirstName = x.firstName;
          objAssign.userLastName = x.lastName;
          objAssign.userEmail = x.email;
          if (this.selectedCoReviewerItems.find(y => y.userEmail == x.email) == null) {
            this.selectedCoReviewerItems.push(objAssign);
          }
        })
        this.selectedAssignToItems.forEach((element: any) => {
          this.AssignToDetail.push(element.userEmail);
        });
        this.AssignToDetail.forEach(x => this.designerService.AssignToList.push(x)); // This is for Multiple Entities
        this.designerService.AssignToList = this.AssignToDetail;
        this.selectedCoReviewerItems.forEach((element: any) => {
          this.CoReviewerDetail.push(element.userEmail);
        });
        this.CoReviewerDetail.forEach(x => this.designerService.CoReviewerList.push(x)); // This is for Multiple Entities
        this.designerService.CoReviewerList = this.CoReviewerDetail;
      }

    });
  }

  private multipleSelectDropdownSetting() {
    this.AssignToDropdownSetting = {
      singleSelection: false,
      idField: 'userEmail',
      textField: 'userEmail',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText:  this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      //itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    }; 

    this.coReviewerDropdownSetting = {
      singleSelection: false,
      idField: 'userEmail',
      textField: 'userEmail',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      // itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

  }
  toDate(dateStr: any) {
    return new Date(moment.utc(dateStr).local().format());
  }
  loadQuestionsGrid() {
    let userGridList: QuestionsResponseViewModel[] = [];
    this.selectedQuestionsViewModelArray = [];
    this.designerService.updatedQuestionGridList = [];
    this.designerService.selectedQuestions.forEach(element => {
      this.dataModel = new QuestionsResponseViewModel();
      let selectedQuestionViewModel = new selectedQuestionsViewModel();
      if (this.EnableDeliverable == true) {
        element.delivearbleIds.forEach(ItemId => {
          if (ItemId == this.dropdownModel.Deliverables[0]) {
            this.dataModel.id = element.id;
            this.dataModel.questionnariesId = element.questionnariesId;
            this.dataModel.title = element.title;
            this.dataModel.questionType = element.questionType;
            this.dataModel.blockTitle = element.blockTitle;
            this.dataModel.blockType = element.blockType;
            this.dataModel.delivearbleIds = [];
            this.dataModel.delivearbleIds.push(ItemId);
            userGridList.push(this.dataModel);
            // this.designerService.informationRequestModel.DeliverableId = this.dropdownModel.Deliverables[0];
            this.designerService.updatedQuestionGridList = userGridList;
            selectedQuestionViewModel.questionId = element.id;
            selectedQuestionViewModel.questionnaireId = element.questionnariesId;
            selectedQuestionViewModel.title = element.title;
            selectedQuestionViewModel.blockType = element.blockType.blockType;
            selectedQuestionViewModel.blockTitle = element.blockTitle;
            this.selectedQuestionsViewModelArray.push(selectedQuestionViewModel);
          }
        });
      }
      else {
        this.dataModel.id = element.id;
        this.dataModel.questionnariesId = element.questionnariesId;
        this.dataModel.title = element.title;
        this.dataModel.questionType = element.questionType;
        this.dataModel.blockTitle = element.blockTitle;
        this.dataModel.blockType = element.blockType;
        this.dataModel.delivearbleIds = [];
        this.dataModel.delivearbleIds = element.delivearbleIds;
        userGridList.push(this.dataModel);
        this.designerService.informationRequestModel.TemplateId = this.designerService.questionsFilters.templateId[0];
        this.designerService.updatedQuestionGridList = userGridList;

        selectedQuestionViewModel.questionId = element.id;
        selectedQuestionViewModel.questionnaireId = element.questionnariesId;
        selectedQuestionViewModel.title = element.title;
        selectedQuestionViewModel.blockType = element.blockType.blockType;
        selectedQuestionViewModel.blockTitle = element.blockTitle;
        this.selectedQuestionsViewModelArray.push(selectedQuestionViewModel);
      }
    });
    this.source.load(userGridList);
    this.source[createInfoLabels.Data].forEach(element => {
      var obj = { id: element.id, value: createInfoLabels.ViewMore };
      this.customAction.push(obj);
    });
  }

  getBlockValue(blockDetails: ViewBlockResponseViewModel) {
    if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft && this.firstTimeBind) {
      if (this.designerService.infoDraftResponseModel.BlockIds.find(x => x == blockDetails.blockId) != null) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      if (this.designerService.isDeliverableSelected && this.designerService.deliverableInformationRequestModel.length > 0) {
        let infoRequest = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
        if (infoRequest != undefined) {
          if (infoRequest.BlockIds.find(y => y == blockDetails.blockId) != null) {
            return true;
          }
          else {
            return false;
          }
        }
      }
      if (this.designerService.informationRequestModel.BlockIds.find(y => y == blockDetails.blockId) != null) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      title: {
        title: this.translate.instant('Questions'),
        width: '20%',
      },
      questionType: {
        title: this.translate.instant('QuestionType'),
        width: '20%',
        valuePrepareFunction: (cell, row) => { return row.questionType.typeName }
      },
      blockTitle: {
        title: this.translate.instant('Section'),
        type: 'custom',
        renderComponent: QuestionInlineEditComponent

      },
      blockType: {
        title: this.translate.instant('Page'),
        type: 'custom',
        renderComponent: QuestionInlinePageComponent
      },
    },
      this.settings = Object.assign({}, settingsTemp);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  saveBlockList(blockDetails: ViewBlockResponseViewModel) {
    if (!this.getBlockValue(blockDetails)) {
      if (!this.SelectedViewBlockItems.includes(blockDetails.blockId)) {
        this.SelectedViewBlockItems.push(blockDetails.blockId);
      }
    }
    else {
      var index = this.SelectedViewBlockItems.findIndex(x => x == blockDetails.blockId)
      {
        this.SelectedViewBlockItems.splice(index, 1)
      }
    }
    if (this.designerService.informationRequestModel.IsViewBlock === true) {
      this.designerService.informationRequestModel.BlockIds = this.SelectedViewBlockItems;
      if (this.designerService.isDeliverableSelected) {
        var infoRequest = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
        infoRequest.BlockIds = this.designerService.informationRequestModel.BlockIds;
      }
    }
  }

  onAssignToItemSelect(items: any) {
    this.AssignToDetail = [];
    this.designerService.informationRequestModel.AssignTo = [];
    if (this.selectedAssignToItems != undefined && this.selectedAssignToItems.length > 0) {
      this.selectedAssignToItems.forEach((element: never) => {
        this.AssignToDetail.push(element);
      });
      this.AssignToDetail.forEach(y => {
        if (!(this.designerService.AssignToList.filter(item => item === y).length > 0))
          this.designerService.AssignToList.push(y);
      })
      if (this.AssignToDetail != undefined && this.AssignToDetail.length > 0 && this.AssignToList.length > 0) {
        this.AssignToDetail.forEach(element => {
          this.AssignToList.forEach(item => {
            if (item.userEmail === element) {
              let userList = new UserBasicViewModelInfoReq();
              userList.firstName = item.userFirstName;
              userList.lastName = item.userLastName;
              userList.email = item.userEmail;
              //this.designerService.informationRequestModel.AssignTo.push(userList);
              this.IsExistCheckInAssignArrayList(item, userList);
            }
          });
        })
        if (this.designerService.isDeliverableSelected) {
          var infoRequest = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
          infoRequest.AssignTo = this.designerService.informationRequestModel.AssignTo;
        }
      }
    }
  }

  onAllAssignToItemSelect(items: any, Mode) {
    this.AssignToDetail = [];
    this.designerService.AssignToList = [];
    this.designerService.informationRequestModel.AssignTo = [];
    if (Mode == 1) {
      items.forEach((element: never) => {
        this.AssignToDetail.push(element);
      });
      this.AssignToDetail.forEach(y => {
        this.designerService.AssignToList.push(y);
      })
      if (this.AssignToDetail != undefined && this.AssignToDetail.length > 0 && this.AssignToList.length > 0) {
        this.AssignToDetail.forEach(element => {
          this.AssignToList.forEach(item => {
            if (item.userEmail === element) {
              let userList = new UserBasicViewModelInfoReq();
              userList.firstName = item.userFirstName;
              userList.lastName = item.userLastName;
              userList.email = item.userEmail;
              //this.designerService.informationRequestModel.AssignTo.push(userList);
              this.IsExistCheckInAssignArrayList(item, userList);
            }
          });
        })
        if (this.designerService.isDeliverableSelected) {
          var infoRequest = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
          infoRequest.AssignTo = this.designerService.informationRequestModel.AssignTo;
        }
      }
    }
  }

  onCoReviewerItemSelect(items: any) {
    this.CoReviewerDetail = [];
    this.designerService.informationRequestModel.CoReviewer = []
    var infoRequest = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
    if (infoRequest != undefined)
      infoRequest.CoReviewer = [];
    if (this.selectedCoReviewerItems != undefined && this.selectedCoReviewerItems.length > 0) {
      this.selectedCoReviewerItems.forEach((element: never) => {
        this.CoReviewerDetail.push(element);
      });
      this.CoReviewerDetail.forEach(y => {
        if (!(this.designerService.CoReviewerList.filter(item => item === y).length > 0))
          this.designerService.CoReviewerList.push(y);
      })
      //this.designerService.CoReviewerList = this.CoReviewerDetail;
      if (this.CoReviewerDetail != undefined && this.CoReviewerDetail.length > 0 && this.CoReviewerList.length > 0) {
        this.CoReviewerDetail.forEach(element => {
          this.CoReviewerList.forEach(item => {
            if (item.userEmail === element) {
              let userList = new UserBasicViewModel();
              userList.firstName = item.userFirstName;
              userList.lastName = item.userLastName;
              userList.email = item.userEmail;
              //this.designerService.informationRequestModel.CoReviewer.push(userList);
              this.IsExistCheckInReviewerArrayList(item, userList);
            }
          });
        })
        if (this.designerService.isDeliverableSelected) {
          var infoRequest = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
          infoRequest.CoReviewer = this.designerService.informationRequestModel.CoReviewer;
        }
      }
    }
  }

  onAllCoReviewerItemSelect(items: any, Mode) {
    this.CoReviewerDetail = [];
    this.designerService.informationRequestModel.CoReviewer = []
    this.designerService.CoReviewerList = [];
    if (Mode == 1) {
      items.forEach((element: never) => {
        this.CoReviewerDetail.push(element);
      });
      this.CoReviewerDetail.forEach(y => {
        this.designerService.CoReviewerList.push(y);
      })
      //this.designerService.CoReviewerList = this.CoReviewerDetail;
      if (this.CoReviewerDetail != undefined && this.CoReviewerDetail.length > 0 && this.CoReviewerList.length > 0) {
        this.CoReviewerDetail.forEach(element => {
          this.CoReviewerList.forEach(item => {
            if (item.userEmail === element) {
              let userList = new UserBasicViewModel();
              userList.firstName = item.userFirstName;
              userList.lastName = item.userLastName;
              userList.email = item.userEmail;
              //this.designerService.informationRequestModel.CoReviewer.push(userList);
              this.IsExistCheckInReviewerArrayList(item, userList);
            }
          });
        })
        if (this.designerService.isDeliverableSelected) {
          var infoRequest = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
          infoRequest.CoReviewer = this.designerService.informationRequestModel.CoReviewer;
        }
      }
    }
  }

  onCheckboxSelect() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    if (this.IsViewBlocks) {
      this.IsEnableViewBlcok = true;
      this.SelectedViewBlockItems = []
      this.ViewBlockList.forEach((viewBlock) => {
        this.SelectedViewBlockItems.push(viewBlock.blockId);
      })
      this.designerService.informationRequestModel.BlockIds = this.SelectedViewBlockItems;
    }
    else {
      this.IsEnableViewBlcok = false;
      this.SelectedViewBlockItems = [];
      this.designerService.informationRequestModel.BlockIds = [];
    }
    this.ngxLoader.stopBackgroundLoader(this.loaderId);

  }
  changeEntity(event, deliverable) {
    this.dropdownModel.Deliverables = [];
    this.dropdownModel.Deliverables.push(deliverable.id);
    this.getAssigneeCoReviewers();
    this.loadQuestionsGrid();
    this.SelectedViewBlockItems = [];
    let selectedFilteredQuestionIds: QuestionIdsViewModel[] = [];
    this.designerService.updatedQuestionGridList.forEach(x => {
      let questionIdModel = new QuestionIdsViewModel();
      questionIdModel.projectId = this.projectDetails.projectId;
      questionIdModel.QuestionId = x.id;
      questionIdModel.QuestionnarieId = x.questionnariesId;
      selectedFilteredQuestionIds.push(questionIdModel);
    });
    this.getViewBlocks(selectedFilteredQuestionIds);
    this.clearControls();
    this.changedDeliverableId = deliverable.id;
  }
  onCustomAction(event) {
    var transSmartTable = (document.getElementById('transSmartTable'));
    var nodes = this.customHTML.querySelectorAll(transSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    nodes = nodes.slice(1);
    var index = -1;
    for (var i = 0; i < nodes.length; i++) {
      var pager = this.source.getPaging();
      let dataIndex = i;
      var uniqueId = this.source["data"][dataIndex].id;
      var tableData = nodes[i].getElementsByTagName("td");
      for (var j = 0; j < tableData.length; j++) {
        if (uniqueId == event.data.id) {
          index = i;
          break;
        }
      }
    }

    var action = this.customAction.filter(function (element, index, array) { return element["id"] == event.data.id });
    if (action[0]['value'] == 'View more') {
      action[0].value = "View less";
      this.selectedRow = undefined;
      this.getRow(index, event.data);
      var _selRow = this.selectedRow;
      setTimeout(function () {
        _selRow.getElementsByClassName('entityViewMore')[0].innerText = "View less";
      });
    }
    else if (action[0]['value'] == 'View less') {
      action[0].value = 'View more';
      this.deleteRow(event.data.id);
    }
  }

  getRow(index, data) {
    var hElement: HTMLElement = this.elRef.nativeElement;
    var transSmartTable = (document.getElementById('transSmartTable'));
    var nodes = this.customHTML.querySelectorAll(transSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    nodes = nodes.slice(1);
    this.selectedRow = nodes[index];
    var transactions = new Array();
    var dataValue = [];
    dataValue[0] = 'Test';//data.title;
    dataValue[1] = 'Test';//data.questionType;
    dataValue[2] = 'Test';//data.blockTitle;
    dataValue[3] = 'Test';//data.blockType;
    transactions.push(dataValue);
    var table = document.createElement("TABLE");
    var columnCount = transactions[0].length;
    var row = document.createElement('tr')
    row.setAttribute("class", "thViewmore" + data.id);
    for (var i = 0; i < columnCount; i++) {
      var headerCell = document.createElement("TH");
      headerCell.setAttribute("class", "viewMoreTableHeader");
      headerCell.innerHTML = transactions[0][i];
      row.appendChild(headerCell);
    }
    table.appendChild(row);
    row = document.createElement('tr')
    row.setAttribute("class", "trViewmore" + data.id);

    for (var i = 1; i < transactions.length; i++) {
      for (var j = 0; j < columnCount; j++) {
        var cell = row.insertCell(-1);
        cell.innerHTML = transactions[i][j];
      }
    }
    table.appendChild(row);
    var divArea = document.createElement("div");
    divArea.setAttribute("class", 'Viewmore');
    divArea.appendChild(table);
    this.selectedRow.insertAdjacentHTML('afterend', divArea.innerHTML);
  }
  deleteRow(id) {
    var hElement: HTMLElement = this.elRef.nativeElement;
    var node = (document.querySelectorAll('ng2-smart-table table tbody')[1]).querySelectorAll("tr.thViewmore" + id)[0];
    if (node != undefined)
      (document.querySelectorAll('ng2-smart-table table tbody')[1]).removeChild(node);
    node = (document.querySelectorAll('ng2-smart-table table tbody')[1]).querySelectorAll("tr.trViewmore" + id)[0];
    if (node != undefined)
      (document.querySelectorAll('ng2-smart-table table tbody')[1]).removeChild(node);
  }


  saveDataLocal() {
    //multiple Entities information request creation
    if (this.changedEntity) {
      this.changedEntity = false;
      return;
    }
    if (this.EnableDeliverable) {
      this.designerService.informationRequestModel.AssignTo = [];
      this.designerService.informationRequestModel.CoReviewer = [];
      this.designerService.informationRequestModel.Questions = [];
      this.designerService.informationRequestModel.ProjectId = this.designerService.questionsFilters.projectId;
      this.designerService.informationRequestModel.Name = this.detailsForm.controls["RequestName"].value;

      this.designerService.informationRequestModel.DueDate = this.detailsForm.controls["DueDate"].value;
      this.designerService.informationRequestModel.ViewBlockList = this.ViewBlockList;
      this.designerService.informationRequestModel.IsViewBlock = (this.IsViewBlocks == null) ? false : this.IsViewBlocks;
      if (!this.designerService.informationRequestModel.IsViewBlock) {
        this.designerService.informationRequestModel.BlockIds = [];
      }
      this.designerService.informationRequestModel.Questions = this.selectedQuestionsViewModelArray;
      this.designerService.selectedQuestionIds = this.questionIdList;
      if (this.designerService.questionsFilters.templateId != undefined) {
        this.designerService.informationRequestModel.TemplateId = this.designerService.questionsFilters.templateId[0];
      }
      if (this.designerService.questionsFilters.deliverablesId != undefined && this.designerService.questionsFilters.deliverablesId.length > 0 && this.dropdownModel.Deliverables.length > 0) {
        this.designerService.informationRequestModel.DeliverableId = this.designerService.questionsFilters.deliverablesId.find(x => x == this.dropdownModel.Deliverables[0]);
      }
      if (this.AssignToDetail != undefined && this.AssignToDetail.length > 0 && this.AssignToList.length > 0) {
        this.AssignToDetail.forEach(element => {
          this.AssignToList.forEach(item => {
            if (item.userEmail === element) {
              let userList = new UserBasicViewModelInfoReq();
              userList.firstName = item.userFirstName;
              userList.lastName = item.userLastName;
              userList.email = item.userEmail;
              //this.designerService.informationRequestModel.AssignTo.push(userList);
              this.IsExistCheckInAssignArrayList(item, userList);
            }
          });
        })
      }
      if (this.CoReviewerDetail != undefined && this.CoReviewerDetail.length > 0 && this.CoReviewerList.length > 0) {
        this.CoReviewerDetail.forEach(element => {
          this.CoReviewerList.forEach(item => {
            if (item.userEmail === element) {
              let userList = new UserBasicViewModel();
              userList.firstName = item.userFirstName;
              userList.lastName = item.userLastName;
              userList.email = item.userEmail;
              //this.designerService.informationRequestModel.CoReviewer.push(userList);
              this.IsExistCheckInReviewerArrayList(item, userList);
            }
          });
        })
      }
      let filters = new InformationFiltersViewModel();
      filters.QuestionType = this.designerService.questionsFilters.questionTypeId;
      filters.BlockType = this.designerService.questionsFilters.blockTypeId;
      filters.Tag = this.designerService.questionsFilters.tagsId;
      filters.CreatedBy = this.designerService.questionsFilters.createdById;
      filters.CreatedOnMin = this.designerService.questionsFilters.createdOnMin;
      filters.CreatedOnMax = this.designerService.questionsFilters.createdOnMax;
      filters.TemplateId = this.designerService.questionsFilters.templateId[0];
      filters.DeliverableIds = this.designerService.questionsFilters.deliverablesId;
      this.designerService.informationRequestModel.Filters = filters;
      this.designerService.informationRequestModel.CoverPage = '';
      let index = this.designerService.deliverableInformationRequestModel.findIndex(x => x.DeliverableId == this.designerService.informationRequestModel.DeliverableId);
      if (index > -1)
        this.designerService.deliverableInformationRequestModel.splice(index, 1);
      let infoRequest = JSON.parse(JSON.stringify(this.designerService.informationRequestModel));
      this.designerService.deliverableInformationRequestModel.push(infoRequest);
    }
    else {
      this.designerService.informationRequestModel.AssignTo = [];
      this.designerService.informationRequestModel.CoReviewer = [];
      this.designerService.informationRequestModel.Questions = [];
      if (this.designerService.informationRequestModel.Id != null || this.designerService.informationRequestModel.Id != undefined) {
        this.designerService.informationRequestModel.Id = '';
      }
      this.designerService.informationRequestModel.ProjectId = this.designerService.questionsFilters.projectId;
      this.designerService.informationRequestModel.Name = this.detailsForm.controls["RequestName"].value;

      this.designerService.informationRequestModel.DueDate = this.detailsForm.controls["DueDate"].value;
      this.designerService.informationRequestModel.IsViewBlock = (this.IsViewBlocks == null) ? false : this.IsViewBlocks;
      if (!this.designerService.informationRequestModel.IsViewBlock) {
        this.designerService.informationRequestModel.BlockIds = [];
      }
      this.designerService.informationRequestModel.Questions = this.selectedQuestionsViewModelArray;
      this.designerService.selectedQuestionIds = this.questionIdList;
      if (this.designerService.questionsFilters.templateId != undefined) {
        this.designerService.informationRequestModel.TemplateId = this.designerService.questionsFilters.templateId[0];
      }
      if (this.designerService.questionsFilters.deliverablesId != undefined && this.designerService.questionsFilters.deliverablesId.length > 0) {
        this.designerService.informationRequestModel.DeliverableId = this.designerService.questionsFilters.deliverablesId[0];
      }

      if (this.AssignToDetail != undefined && this.AssignToDetail.length > 0 && this.AssignToList.length > 0) {
        this.AssignToDetail.forEach(element => {
          this.AssignToList.forEach(item => {
            if (item.userEmail === element) {
              let userList = new UserBasicViewModelInfoReq();
              userList.firstName = item.userFirstName;
              userList.lastName = item.userLastName;
              userList.email = item.userEmail;
              //this.designerService.informationRequestModel.AssignTo.push(userList);
              this.IsExistCheckInAssignArrayList(item, userList);
            }
          });
        })
      }
      if (this.CoReviewerDetail != undefined && this.CoReviewerDetail.length > 0 && this.CoReviewerList.length > 0) {
        this.CoReviewerDetail.forEach(element => {
          this.CoReviewerList.forEach(item => {
            if (item.userEmail === element) {
              let userList = new UserBasicViewModel();
              userList.firstName = item.userFirstName;
              userList.lastName = item.userLastName;
              userList.email = item.userEmail;
              //this.designerService.informationRequestModel.CoReviewer.push(userList);
              this.IsExistCheckInReviewerArrayList(item, userList);
            }
          });
        })
      }
      let filters = new InformationFiltersViewModel();
      filters.QuestionType = this.designerService.questionsFilters.questionTypeId;
      filters.BlockType = this.designerService.questionsFilters.blockTypeId;
      filters.Tag = this.designerService.questionsFilters.tagsId;
      filters.CreatedBy = this.designerService.questionsFilters.createdById;
      filters.CreatedOnMin = this.designerService.questionsFilters.createdOnMin;
      filters.CreatedOnMax = this.designerService.questionsFilters.createdOnMax;
      filters.TemplateId = this.designerService.questionsFilters.templateId[0];
      filters.DeliverableIds = this.designerService.questionsFilters.deliverablesId;
      this.designerService.informationRequestModel.Filters = filters;
      this.designerService.informationRequestModel.CoverPage = '';
    }
  }
  isDeleverable = false;

  // onSaveConfirm(event) {
  //   this.selectedQuestionsModel = event.newdata;
  //   this.taskService.updateSectionPage(this.selectedQuestionsModel).subscribe((data) => {
  //     //TO DO
  //   });
  // }

  clearControls() {
    this.changedEntity = true;
    this.detailsForm.controls[createInfoLabels.RequestName].reset();
    this.selectedAssignToItems = [];
    this.selectedCoReviewerItems = [];
    this.detailsForm.controls[createInfoLabels.DueDate].reset();
    this.detailsForm.controls[createInfoLabels.ViewBlocks].reset();
    this.IsViewBlocks = false;
    this.onCheckboxSelect();
    //Retain the entered data of Info request
    if (this.dropdownModel.Deliverables.length > 0) {
      var infoRequst = this.designerService.deliverableInformationRequestModel.find(x => x.DeliverableId == this.dropdownModel.Deliverables[0]);
      if (infoRequst != undefined) {
        this.detailsForm.controls[createInfoLabels.RequestName].setValue(infoRequst.Name);
        this.detailsForm.controls[createInfoLabels.DueDate].setValue(this.toDate(infoRequst.DueDate));
        this.detailsForm.controls[createInfoLabels.ViewBlocks].setValue(infoRequst.IsViewBlock);
        this.onCheckboxSelect();
        infoRequst.BlockIds.forEach((Id) => {
          let viewblock = infoRequst.ViewBlockList.find(x => x.blockId == Id);
          if (viewblock != null) {
            viewblock.checked = true;
          }
        });
        infoRequst.AssignTo.forEach(x => {
          let objAssign = new ProjectUsersListResultViewModel();
          objAssign.userFirstName = x.firstName;
          objAssign.userLastName = x.lastName;
          objAssign.userEmail = x.email;
          this.selectedAssignToItems.push(objAssign);
        })
        infoRequst.CoReviewer.forEach(x => {
          let objAssign = new ProjectUsersListResultViewModel();
          objAssign.userFirstName = x.firstName;
          objAssign.userLastName = x.lastName;
          objAssign.userEmail = x.email;
          this.selectedCoReviewerItems.push(objAssign);
        })
      }
    }
  }

  private IsExistCheckInReviewerArrayList(item: any, userList: UserBasicViewModel) {
    const exist = this.designerService.informationRequestModel.CoReviewer.filter((e) => e.email === item.userEmail);
    if (exist.length > 0) {
    }
    else {
      this.designerService.informationRequestModel.CoReviewer.push(userList);
    }
  }

  private IsExistCheckInAssignArrayList(item: any, userList: UserBasicViewModelInfoReq) {
    const exist = this.designerService.informationRequestModel.AssignTo.filter((e) => e.email === item.userEmail);
    if (exist.length > 0) {
    }
    else {
      this.designerService.informationRequestModel.AssignTo.push(userList);
    }
  }
  validateSpecialChar(event) {
    if (event.target.selectionStart == 0) {
      return this.ShareDetailService.validateSpecialChar(event.key);
    }
    return true;
  }
}
