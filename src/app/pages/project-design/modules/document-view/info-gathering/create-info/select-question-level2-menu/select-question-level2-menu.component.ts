import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuestionsFilterViewModel, QuestionsMenuViewModel, QuestionRelated, InformationRequestViewModel, CheckedViewModel } from '../../../../../../../@models/projectDesigner/task';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { TaskService } from '../../../services/task.service';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import * as moment from 'moment';
import { DesignerService } from '../../../../../services/designer.service';
import { Index, createInfoLabels } from '../../../../../../../@models/projectDesigner/infoGathering';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { Subscription } from 'rxjs';
import { ResponseStatus } from '../../../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
//import { InfoSendmailComponent } from '../../info-sendmail/info-sendmail.component';
import { SendmailUserComponent } from '../../../../../../common/sendmail-user/sendmail-user.component';
import { Router } from '@angular/router';
import { EntityViewModel } from '../../../../../../../@models/projectDesigner/deliverable';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'ngx-select-question-level2-menu',
  templateUrl: './select-question-level2-menu.component.html',
  styleUrls: ['./select-question-level2-menu.component.scss']
})
export class SelectQuestionLevel2MenuComponent implements OnInit, OnDestroy {

  ddlQuestionTypes: any;
  subscriptions: Subscription = new Subscription();
  ddlBlockTypes: any;
  isActiveSend: boolean = false;
  ddlTags: any;
  ddlTemplates: CheckedViewModel[] = [];
  ddlDeliverables: CheckedViewModel[] = [];
  ddlCreatedBy: any;
  selectedQuestionTypes = [];
  selectedBlockTypes = [];
  selectedTags = [];
  defaultLabel = false;
  selectedFirstEntity: any;
  selectedTemplateItem: any = "";
  selectedEntityTemplate = [];
  selectedTemplates = [];
  selectedDeliverables = [];
  checkedEntities = [];
  selectedCreatedBy = [];
  dropdownSettings: any;
  questionRequestModel = new QuestionsFilterViewModel();
  options: boolean;
  currentIndex: any = 1;
  filterDisable: boolean = true;
  creationStatus: string = '';
  IsReviewAssigneeDuplicate: boolean = true;
  constructor(private shareDetailService: ShareDetailService, private taskService: TaskService,
    private nbDialogService: NbDialogService,
    private _eventService: EventAggregatorService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private designerService: DesignerService,
    private dialogService: DialogService,
    private router: Router) { }

  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown',
      idField: 'id',
      textField: 'name',
    };
    const project = this.shareDetailService.getORganizationDetail();
    this.taskService.getQuestionsFilters(project.projectId).subscribe((data: QuestionsMenuViewModel) => {
      this.ddlQuestionTypes = data.questionType;
      this.ddlBlockTypes = data.blockType;
      this.ddlTags = data.tags;
      this.ddlCreatedBy = data.createdBy;
      this.ddlTemplates = [];
      this.ddlDeliverables = [];
      this.selectedEntityTemplate = [];
      this.designerService.selectedEntities = [];
      this.checkedEntities = [];
      //While editing the existing info request
      if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft) {
        this.SetFiltersData();
      }
      data.templates.forEach((el) => {
        var objEntity = new CheckedViewModel();
        if (this.designerService.templateDetails) {
          if (el.id == this.designerService.templateDetails.templateId) {
            objEntity.checked = true;
            this.questionRequestModel.deliverablesId = [];
            this.questionRequestModel.templateId = [];
            this.options = true;
            this.questionRequestModel.templateId.push(el.id);
            this.selectedTemplateItem = el.name;
            this.designerService.questionsFilters = this.questionRequestModel;
            this.designerService.isTemplateSelected = true;
            this.designerService.isDeliverableSelected = false;
          }
          else {
            objEntity.checked = false;
          }
        }
        else {
          objEntity.checked = false;
        }
        if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft) {
          if (el.id == this.designerService.infoDraftResponseModel.questionsFilters.templateId) {
            objEntity.checked = true;
            this.questionRequestModel.deliverablesId = [];
            this.questionRequestModel.templateId = [];
            this.options = true;
            this.questionRequestModel.templateId.push(el.id);
            this.selectedTemplateItem = el.name;
            this.designerService.questionsFilters = this.questionRequestModel;
            this.designerService.isTemplateSelected = true;
            this.designerService.isDeliverableSelected = false;
          }
          else {
            objEntity.checked = false;
          }
        }
        objEntity.id = el.id;
        objEntity.name = el.name;
        this.ddlTemplates.push(objEntity);
      });
      data.deliverables.forEach((el) => {
        var objEntity = new CheckedViewModel();
        if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft) {
          if (el.id == this.designerService.infoDraftResponseModel.DeliverableId) {
            this.questionRequestModel.templateId = [];
            this.questionRequestModel.deliverablesId = [];
            objEntity.checked = true;
            this.options = false;
            this.questionRequestModel.deliverablesId.push(el.id);
            this.selectedDeliverables.push(el.id);
            var entityModel: any = [];
            entityModel.id = el.id;
            let nameTaxableYearEnd = el.name.split(';');
            if (nameTaxableYearEnd.length > 0)
              entityModel.name = nameTaxableYearEnd[Index.zero];
            this.designerService.selectedEntities.push(entityModel);
            this.checkedEntities.push(entityModel);
            this.selectedEntityTemplate.push(entityModel);
            this.designerService.questionsFilters = this.questionRequestModel;
            this.designerService.isTemplateSelected = false;
            this.designerService.isDeliverableSelected = true;
          }
          else {
            objEntity.checked = false;
          }
        }
        else if (this.designerService.deliverableDetails && this.designerService.isDeliverableSection == true) {
          if (el.id == this.designerService.deliverableDetails.entityId) {
            this.questionRequestModel.templateId = [];
            this.questionRequestModel.deliverablesId = [];
            objEntity.checked = true;
            this.options = false;
            this.questionRequestModel.deliverablesId.push(el.id);
            this.selectedDeliverables.push(el.id);
            var entityModel: any = [];
            entityModel.id = el.id;
            let nameTaxableYearEnd = el.name.split(';');
            if (nameTaxableYearEnd.length > 0)
              entityModel.name = nameTaxableYearEnd[Index.zero];
            this.designerService.selectedEntities.push(entityModel);
            this.checkedEntities.push(entityModel);
            this.selectedEntityTemplate.push(entityModel);
            this.designerService.questionsFilters = this.questionRequestModel;
            this.designerService.isTemplateSelected = false;
            this.designerService.isDeliverableSelected = true;
          }
          else {
            objEntity.checked = false;
          }
        }
        else {
          objEntity.checked = false;
        }

        objEntity.id = el.id;
        var nameTaxableYearEnd = el.name.split(";");
        if ((nameTaxableYearEnd.length > 0)) {
          objEntity.name = nameTaxableYearEnd[Index.zero];
          objEntity.taxableYearEnd = nameTaxableYearEnd[Index.one];
        } // to show taxable year end
        this.ddlDeliverables.push(objEntity);
      });
      if (this.designerService.infoDraftResponseModel.Id == null) {
        if (this.designerService.deliverableDetails && this.designerService.isDeliverableSection == true) {
          if (this.ddlDeliverables.filter(x => x.checked).length != 1) {
            this.ddlDeliverables[0].checked = true;
            this.options = false;
            this.questionRequestModel.deliverablesId.push(this.ddlDeliverables[0].id);
            this.selectedDeliverables.push(this.ddlDeliverables[0].id);
            let selectedEntityObj: any = [];
            selectedEntityObj.id = this.ddlDeliverables[Index.zero].id;
            selectedEntityObj.name = this.ddlDeliverables[Index.zero].name;
            this.checkedEntities.push(selectedEntityObj)
            this.designerService.selectedEntities.push(selectedEntityObj);
            this.selectedEntityTemplate.push(this.ddlDeliverables[0]);
            this.designerService.isTemplateSelected = false;
            this.designerService.isDeliverableSelected = true;
          }
        }
        else {
          if (this.ddlTemplates.filter(x => x.checked).length != 1) {
            this.ddlTemplates[0].checked = true;
            this.options = true;
            this.questionRequestModel.templateId.push(this.ddlTemplates[0].id);
            this.selectedTemplates.push(this.ddlTemplates[0].id);
            this.selectedTemplateItem = this.ddlTemplates[0].name;
            this.designerService.questionsFilters = this.questionRequestModel;
            this.designerService.isTemplateSelected = true;
            this.designerService.isDeliverableSelected = false;
          }
        }
      }
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).publish(this.questionRequestModel);
    });
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).subscribe(payload => {
      this.currentIndex = payload;
      if (this.currentIndex == 1) {
        this.designerService.selectedEntities = [];
        this.checkedEntities.forEach(entity => {
          this.designerService.selectedEntities.push(entity);
        })
      }
    });
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.createInfo).subscribe(payload => {
      if (payload == "closeInfoRequest")
        this.closeCreateRequest();
      else if (payload == "saveInfoRequest")
        this.SaveInfoGathering(payload as string);
      else if (payload == createInfoLabels.SendMail) {
        this.SaveInfoGathering(payload as string);
      }

    }));
  }
  private SetFiltersData() {
    this.selectedQuestionTypes = this.designerService.infoDraftResponseModel.questionsFilters.questionTypeId;
    this.selectedBlockTypes = this.designerService.infoDraftResponseModel.questionsFilters.blockTypeId;
    this.selectedCreatedBy = this.designerService.infoDraftResponseModel.questionsFilters.createdById;
    this.selectedTags = this.designerService.infoDraftResponseModel.questionsFilters.tagsId;
    this.questionRequestModel.questionTypeId = this.selectedQuestionTypes;
    this.questionRequestModel.blockTypeId = this.selectedBlockTypes;
    this.questionRequestModel.createdById = this.selectedCreatedBy;
    this.questionRequestModel.tagsId = this.selectedTags;
  }
  closeCreateRequest() {
    this.designerService.isEditInfoRequest = false;
    this.designerService.clearinforRequest();
    this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-list'], level2Menu: ['info-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
  }
  onItemSelect(item: any) {
    if (this.selectedQuestionTypes.length > 0 || this.selectedBlockTypes.length > 0 || this.selectedTags.length > 0 || this.selectedCreatedBy.length > 0) {
      this.filterDisable = false;
    }
    else if (this.selectedQuestionTypes.length == 0 && this.selectedBlockTypes.length == 0 && this.selectedTags.length == 0 && this.selectedCreatedBy.length == 0)
      this.filterDisable = true;
    this.emptyFilters();
    this.selectedQuestionTypes.forEach(x => {
      this.questionRequestModel.questionTypeId.push(x.id);
    })
    this.selectedBlockTypes.forEach(x => {
      this.questionRequestModel.blockTypeId.push(x.id);
    })
    this.questionRequestModel.tagsId = this.selectedTags;
    this.selectedCreatedBy.forEach(x => {
      this.questionRequestModel.createdById.push(x.id);
    })
    this.designerService.questionsFilters = this.questionRequestModel;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).publish(this.questionRequestModel);

  }
  clearFilters() {
    this.emptyFilters();
    this.selectedCreatedBy = [];
    this.selectedBlockTypes = [];
    this.selectedQuestionTypes = [];
    this.selectedTags = [];
    let datePicker = <HTMLInputElement>document.querySelector(createInfoLabels.CreatedDateId);
    if (datePicker != null)
      datePicker.value = "";
    this.questionRequestModel.createdOnMin = null;
    this.questionRequestModel.createdOnMax = null;
    this.filterDisable = true;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).publish(this.questionRequestModel);

  }
  emptyFilters() {
    this.questionRequestModel.questionTypeId = [];
    this.questionRequestModel.blockTypeId = [];
    this.questionRequestModel.tagsId = [];
    this.questionRequestModel.createdById = [];
  }
  onDateSelect(item: any, type: any) {
    if (!item) return;
    var startDateSelected = item[0];
    var endDateSelected = this.getEndDateTime(item[1]);
    if (type == QuestionRelated.CreatedDate) {
      this.questionRequestModel.createdOnMin = startDateSelected;
      this.questionRequestModel.createdOnMax = endDateSelected;
      this.filterDisable = false;
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).publish(this.questionRequestModel);
  }
  onSelectAll(items: any, index) {

    if (index == Index.one) {
      this.questionRequestModel.questionTypeId = items;
      this.selectedQuestionTypes = items;
    }
    else if (index == Index.two) {
      this.questionRequestModel.blockTypeId = items;
      this.selectedBlockTypes = items;
    }
    else if (index == Index.three) {
      this.questionRequestModel.tagsId = items;
      this.selectedTags = items;
    }
    else if (index == Index.four) {
      this.questionRequestModel.createdById = items;
      this.selectedCreatedBy = items;
    }
    if (this.selectedQuestionTypes.length > 0 || this.selectedBlockTypes.length > 0 || this.selectedTags.length > 0 || this.selectedTags.length > 0) {
      this.filterDisable = false;
    }
    else if (this.selectedQuestionTypes.length == 0 && this.selectedBlockTypes.length == 0 && this.selectedTags.length == 0 && this.selectedCreatedBy.length == 0)
      this.filterDisable = true;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).publish(this.questionRequestModel);
  }
  getEndDateTime(date: any): any {
    return moment(date).set({ h: 23, m: 59, s: 59 }).toDate();
  }
  updateSelectedTemplate(option, event) {
    this.clearInfoData();
    this.designerService.selectedQuestions = [];
    this.designerService.questionsFilters.templateId = [];
    this.designerService.questionsFilters.deliverablesId = [];
    this.questionRequestModel.templateId = [];
    this.questionRequestModel.deliverablesId = [];
    this.selectedTemplates = [];
    this.defaultLabel = false;
    this.ddlTemplates.forEach(x => {
      if (x.id == option.id) {
        x.checked = true;
      } else {
        x.checked = false;
      }
    });
    this.selectedTemplates.push(option.id);
    this.questionRequestModel.templateId = this.selectedTemplates;
    this.selectedTemplateItem = option.name;
    this.designerService.questionsFilters = this.questionRequestModel;
    if (this.designerService.questionsFilters.templateId.length > 0) {
      this.designerService.isTemplateSelected = true;
      this.designerService.isDeliverableSelected = false;
    }
    this.ddlDeliverables.forEach(x => {
      if (x.checked) {
        x.checked = false;
      }
    });
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).publish(this.questionRequestModel);

  }
  updateCheckedOptions(option, event) {
    this.clearInfoData();
    this.questionRequestModel.templateId = [];
    this.questionRequestModel.deliverablesId = [];
    this.designerService.questionsFilters.templateId = [];
    this.defaultLabel = false;
    if (event.target.checked) {

      this.ddlDeliverables.filter(x => {
        if (x.id == option.id)
          x.checked = true;
      });
      this.selectedDeliverables.push(option.id); //selected deliverable list to requestmodel
      let selectedEntityObj: any = [];
      selectedEntityObj.id = option.id;
      selectedEntityObj.name = option.name;
      this.checkedEntities.push(selectedEntityObj);
      this.designerService.selectedEntities.push(selectedEntityObj); // to use in next step
      this.selectedEntityTemplate.push(option); // to display in top 
      this.selectedFirstEntity = this.selectedEntityTemplate[0];
      this.questionRequestModel.deliverablesId = this.selectedDeliverables;
      this.designerService.questionsFilters = this.questionRequestModel;
      if (this.designerService.questionsFilters.deliverablesId.length > 0) {
        this.designerService.isTemplateSelected = false;
        this.designerService.isDeliverableSelected = true;
      }
    }
    else {
      let index = this.selectedDeliverables.findIndex(x => x == option.id);
      if (index > -1) {
        this.ddlDeliverables.filter(x => {
          if (x.id == option.id)
            x.checked = false;
        });
        let display = this.selectedEntityTemplate.findIndex(x => x.id == option.id);
        this.selectedEntityTemplate.splice(display, 1);
        this.selectedDeliverables.splice(index, 1);
        this.checkedEntities.splice(index, 1);
        this.designerService.selectedEntities.splice(index, 1);
        this.questionRequestModel.deliverablesId = this.selectedDeliverables;
        this.designerService.questionsFilters = this.questionRequestModel;
      }
      if (this.selectedEntityTemplate.length < 1) {
        this.defaultLabel = true;
        this.questionRequestModel.deliverablesId = [];
      }
      if (this.designerService.questionsFilters.deliverablesId.length > 0) {
        this.designerService.isTemplateSelected = false;
        this.designerService.isDeliverableSelected = true;
      }
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).publish(this.questionRequestModel);
    if (this.designerService.isDeliverableSelected && !event.target.checked)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.spliceQuestions).publish(undefined);

  }
  clearInfoData() {
    var newinfo = new InformationRequestViewModel();
    this.designerService.informationRequestModel = newinfo;
  }
  SaveInfoGathering(action: string) {
    this.creationStatus = "";
    if (!this.validateAllPages()) return;
    if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft)
      this.designerService.informationRequestModel.Id = this.designerService.infoDraftResponseModel.Id;
    let attachments = this.designerService.attachmentsFormData;
    //Creating Multiple information request at same time for Entities
    if (this.designerService.isDeliverableSelected && action != createInfoLabels.SendMail) {
      this.designerService.deliverableInformationRequestModel.forEach((infoRequest, index) => {
        this.designerService.informationRequestModel = new InformationRequestViewModel();
        this.designerService.informationRequestModel = infoRequest;
        this.subscriptions.add(this.taskService.createinformationrequest(this.designerService.informationRequestModel)
          .subscribe(response => {
            var entity = this.designerService.selectedEntities.find(x => x["id"] == infoRequest.DeliverableId);
            if (response.status === ResponseStatus.Sucess) {
              if (this.creationStatus == '')
                this.creationStatus = entity["name"];
              else
                this.creationStatus = this.creationStatus + "," + entity["name"];
              attachments.forEach(file => {
                this.taskService.addAttachmentInfoRequest(file).subscribe(attachmentStatus => {
                  if (attachmentStatus.status == ResponseStatus.Sucess)
                    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish(response.status);
                })
              });
              this.designerService.attachmentsFormData = [];
              attachments = [];
              infoRequest.Id = response.tag;
              if (action != createInfoLabels.SendMail && this.creationStatus != '' && index == this.designerService.deliverableInformationRequestModel.length - 1) {
                this.toastr.success(this.translate.instant('screens.project-designer.document-view.info-gathering.errorMessages.SuccessMessage') + " for " + this.creationStatus);

              }
              else if (action == createInfoLabels.SendMail) {
                this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.sendMail).publish(this.creationStatus);
              }
            }
            else {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0] + "for " + entity.entityName);
            }
          }, error => {
            this.dialogService.Open(DialogTypes.Warning, error.message);
          }));
      });

    }
    else {
      this.subscriptions.add(this.taskService.createinformationrequest(this.designerService.informationRequestModel)
        .subscribe(response => {
          if (response.status === ResponseStatus.Sucess) {
            attachments.forEach(file => {
              this.taskService.addAttachmentInfoRequest(file).subscribe(attachmentStatus => {
                if (attachmentStatus.status == ResponseStatus.Sucess)
                  this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish(response.status);
                // else
                //   this.dialogService.Open(DialogTypes.Warning, attachmentStatus.errorMessages[0]);
              })
            });
            this.designerService.attachmentsFormData = [];
            this.designerService.informationRequestModel.Id = response.tag;
            if (action != createInfoLabels.SendMail) {
              this.toastr.success(this.translate.instant('screens.project-designer.document-view.info-gathering.errorMessages.SuccessMessage'));
            }

            else if (action == createInfoLabels.SendMail) {
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.sendMail).publish(response.status);
            }
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish(response.status);
          }
          else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        }, error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
    }
    this.designerService.savedComments = [];
  }
  validateAllPages() {
    let result = false;
    let tmpResult = false;
    if (this.designerService.selectedQuestions.length <= 0) {
      this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-designer.document-view.info-gathering.create-info.validate_question_selection'));
      return false;
    }
    if (this.designerService.isDeliverableSelected) {
      if (this.designerService.deliverableInformationRequestModel.length == 0
        || this.designerService.deliverableInformationRequestModel.length != this.designerService.selectedEntities.length) {
        this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-designer.document-view.info-gathering.create-info.validate_ir'));
        return false;
      }
      else {
        this.designerService.deliverableInformationRequestModel.forEach((x, index) => {
          if (!tmpResult) {
            // this.designerService.informationRequestModel = x;
            result = this.validateIndividualInfoRequest(x);
            if (!result)
              tmpResult = true;
          }
          else
            return false;
        });
        if (!tmpResult)
          return true;
        else
          return false;
      }
    }
    else
      return this.validateIndividualInfoRequest(this.designerService.informationRequestModel);
  }
  validateIndividualInfoRequest(infoRequest) {
    if (this.currentIndex == 2) {
      this.ReviewAssigneeDuplicateCheck();
      if (!this.IsReviewAssigneeDuplicate) {
        this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-designer.document-view.info-gathering.create-info.validate_assignee_reviewer'))
        return false;
      }
    }
    if (infoRequest.Name != '' &&
      infoRequest.AssignTo.length > 0 &&
      infoRequest.DueDate != null) {
      return true;
    } else {
      this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-designer.document-view.info-gathering.create-info.validate_ir'));
      return false;
    }
  }
  ReviewAssigneeDuplicateCheck() {
    this.IsReviewAssigneeDuplicate = true;
    this.designerService.informationRequestModel.AssignTo.forEach(r => {
      if (this.designerService.informationRequestModel.CoReviewer.find(x => x.email == r.email) != null) {
        this.IsReviewAssigneeDuplicate = false;
      }
    })
  }
  handleChange(options) {
    this.designerService.selectedQuestions = []
    if (options) {
      this.defaultLabel = false;
      this.designerService.questionsFilters.deliverablesId = [];
      this.designerService.questionsFilters.templateId = [];
      this.designerService.selectedEntities = [];
      this.checkedEntities = [];
      this.selectedEntityTemplate = [];
      this.selectedDeliverables = [];
      this.questionRequestModel.templateId = [];
      this.questionRequestModel.deliverablesId = [];
      this.designerService.questionsFilters = null;
      this.selectedTemplateItem = [];
      this.selectedTemplates = [];
      this.ddlTemplates.forEach(x => {
        if (x.checked) {
          x.checked = false;
        }
      });
      if (this.ddlTemplates.length > 0) {
        this.ddlTemplates[0].checked = true;
        this.selectedTemplates.push(this.ddlTemplates[Index.zero].id);
        this.selectedTemplateItem = this.ddlTemplates[Index.zero].name;
        this.questionRequestModel.templateId.push(this.ddlTemplates[Index.zero].id);
        this.designerService.questionsFilters = this.questionRequestModel;
        if (this.designerService.questionsFilters.templateId.length > 0) {
          this.designerService.isTemplateSelected = true;
          this.designerService.isDeliverableSelected = false;
        }
      }
    }
    else {
      this.questionRequestModel.templateId = [];
      this.questionRequestModel.deliverablesId = [];
      this.designerService.questionsFilters.templateId = [];
      this.designerService.selectedEntities = [];
      this.checkedEntities = [];
      this.selectedEntityTemplate = [];
      this.selectedDeliverables = [];
      this.defaultLabel = false;
      this.ddlDeliverables.forEach(x => {
        if (x.checked) {
          x.checked = false;
        }
      });
      if (this.ddlDeliverables.length > 0) {
        this.ddlDeliverables[0].checked = true;
        this.selectedDeliverables.push(this.ddlDeliverables[Index.zero].id);
        this.questionRequestModel.deliverablesId = this.selectedDeliverables;
        let selectedEntityObj: any = [];
        selectedEntityObj.id = this.ddlDeliverables[Index.zero].id;
        selectedEntityObj.name = this.ddlDeliverables[Index.zero].name;
        this.designerService.selectedEntities.push(selectedEntityObj);
        this.checkedEntities.push(selectedEntityObj);
        this.selectedEntityTemplate.push(this.ddlDeliverables[Index.zero]);
        this.selectedFirstEntity = this.selectedEntityTemplate[0];
        this.designerService.questionsFilters = this.questionRequestModel;
        if (this.questionRequestModel.deliverablesId.length > 0) {
          this.designerService.isTemplateSelected = false;
          this.designerService.isDeliverableSelected = true;
        }
      }
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.selectquestions).publish(this.questionRequestModel);
  }
  sendMailPopUp() {
    this.designerService.DisableBCCBtn = true;
    this.designerService.InfoReqSendMail = true;
    this.nbDialogService.open(SendmailUserComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });

  }
  show = true;
  imageName = this.translate.instant('collapse');
  toggleCollapse() {
    this.show = !this.show;
    if (this.show == false) {
      this.imageName = this.translate.instant('expand');
    }
    else
      this.imageName = this.translate.instant('collapse');
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
