import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { QuestionDataModel, QuestionTypeViewModel, DropdownTypeQuestion, QuestionRelated, LogicTypeViewModel, SubQuestionViewModel, QuestionTagViewModel, TypeViewModel, TableTypeDomainModel, QuestionAnswersDetailsViewModel } from '../../../../../../@models/projectDesigner/task';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DesignerService } from '../../../../services/designer.service';
import { NbDialogService } from '@nebular/theme';
import { LogicaltypeComponent } from '../questions-type/logicaltype/logicaltype.component';
import { TableTypeQuestionComponent } from '../table-type-question/table-type-question.component';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { QuestionType } from '../../../../../../@models/projectDesigner/infoGathering';
import { TranslateService } from '@ngx-translate/core';
import { AnswertagService } from '../../../../services/answertag.service';
import { FilterViewModel } from '../../../../../../@models/organization';
import { entityVariables } from '../../../../../../@models/common/valueconstants';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { RoleService } from '../../../../../../shared/services/role.service';
import { DesignerService as DesignerServiceAdmin } from '../../../../../admin/services/designer.service';
import { ActionEnum } from '../../../../../../@models/projectDesigner/common';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'ngx-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.scss']
})
export class CreateQuestionComponent implements OnInit, OnDestroy {
  createQuestionForm: FormGroup;
  questions: QuestionTypeViewModel[];
  subscriptions: Subscription = new Subscription();
  selectedQuestionType: any;
  selectedQuestinnaryId: any;
  typeDetails: TypeViewModel;
  dropdownDetails: TypeViewModel;
  tableTypeDetails: TableTypeDomainModel;
  submitted: boolean;
  projectDetails: any;
  isTagExist: boolean = false;
  @ViewChild('tag') tag: any;
  @Input()
  loaderId: string = 'CreateQuestionLoader';
  selectedQuestionId: string;
  Show: boolean = true;
  loaderStarted: boolean = false;
  questionTextCopy: string;
  ProjectVariableList: FilterViewModel[] = [];
  addTableType: boolean = false;

  constructor(private taskService: TaskService,
    private readonly _eventService: EventAggregatorService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private sharedService: ShareDetailService,
    public designerService: DesignerService,
    private ngxLoader: NgxUiLoaderService,
    private DialogService: DialogService,
    private dialogService: NbDialogService, private translate: TranslateService, private shareDetailService: ShareDetailService, private ansTagService: AnswertagService,
    private roleService: RoleService,
    private designerServiceAdmin: DesignerServiceAdmin) {

    this.createQuestionForm = this.formBuilder.group({
      QuestionType: ['', Validators.required],
      DDQuestionType: [null],
      QuestionHashTag: ['', [Validators.required, Validators.pattern(/^#/)]],
      AllowAttachment: [''],
      QuestionText: ['', Validators.required],
      Comments: [''],

    });
  }
  //ngx-ui-loader configuration

  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';


  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();

    this.designerService.editquestionClicked = false;
    this.taskService.getTasks().subscribe(
      data => {
        this.questions = data;
      });

    this.createQuestionForm.controls["QuestionText"].valueChanges.subscribe(checkedValue => {
      if (checkedValue != null && checkedValue.charAt(checkedValue.length - 1) === "#") {
        this.loadProjectVariableFilter(this.designerService.isTemplateSection);
      } else {
        this.ProjectVariableList = [];
      }
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).subscribe(() => {
      this.createQuestionForm.reset();
      this.typeDetails = null;
      this.selectedQuestionType = null;
      this.tableTypeDetails = null;
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadSuggestionsCreateQuestion).subscribe((payload) => {
      this.loadProjectVariableFilter(payload);
      this.createQuestionForm.controls['QuestionText'].setValue("");
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.populateQuestions).subscribe((payload) => {
      if (payload) {
        this.designerService.editquestionClicked = true;
        this.populateQuestionDetails(payload);
      }
    }));
  }

  loadProjectVariableFilter(isTemplateSection) {
    const orgdetail = this.shareDetailService.getORganizationDetail();
    if (orgdetail != null) {
      this.ansTagService.getprojectvariablefiltermenudata(orgdetail.projectId).subscribe(data => {
        this.ProjectVariableList = data.variables;
        let variables = entityVariables.entityVariables;
        variables.forEach((ele) => {
          let filterViewModel = new FilterViewModel();
          filterViewModel.name = ele;
          this.ProjectVariableList.push(filterViewModel);
        })
        this.ProjectVariableList.forEach(item => {
          item.name = item.name.replace('#', '');
        });
      });
    }
  }

  questionTextChange(event) {
    this.questionTextCopy = event.target.value;
  }

  evaluateValue(event) {
    let selection = event.target.innerText;
    if (this.questionTextCopy != undefined) {
      this.createQuestionForm.controls['QuestionText'].setValue(this.questionTextCopy + selection.slice(1, selection.length));
    }

  }


  populateQuestionDetails(data) {
    if (data.length > 0) {
      let SelectedQuestion = data[0];
      this.selectedQuestionId = data[0].questionId;
      let questionType = data[0].typeDetails.questionType;
      this.createQuestionForm.controls["QuestionType"].setValue(questionType);
      this.createQuestionForm.controls["DDQuestionType"].setValue(questionType.id);
      this.createQuestionForm.controls["QuestionHashTag"].setValue(SelectedQuestion["tag"]);
      this.createQuestionForm.controls["AllowAttachment"].setValue(SelectedQuestion["allowAssigneeAttached"]);
      this.createQuestionForm.controls["QuestionText"].setValue(SelectedQuestion["title"]);
      this.createQuestionForm.controls["Comments"].setValue(SelectedQuestion["comments"]);
      this.selectedQuestionType = questionType.typeName;
      this.selectedQuestinnaryId = data[0].questionnariesId;
      this.typeDetails = data[0].typeDetails;
      if (data[0].typeDetails.questionType.typeName == QuestionType.DropDown) {
        this.dropdownDetails = data[0].typeDetails;
      }
      else if (data[0].typeDetails.questionType.typeName == QuestionType.TableType ||
        data[0].typeDetails.questionType.typeName == QuestionType.BenchmarkRangeType ||
        data[0].typeDetails.questionType.typeName == QuestionType.ComparabilityAnalysisType ||
        data[0].typeDetails.questionType.typeName == QuestionType.CoveredTransactionType ||
        data[0].typeDetails.questionType.typeName == QuestionType.ListType ||
        data[0].typeDetails.questionType.typeName == QuestionType.PLQuestionType) {
        this.tableTypeDetails = data[0].typeDetails;
        var updatedCells;
        if (data[0].answerDetails.deliverables.length > 0) {
          data[0].answerDetails.deliverables.forEach(el => {
            el.versions.forEach(i => {
              updatedCells = el.versions[0].cellValues;
            });
          });
        }
        else if (data[0].answerDetails.templates.length > 0) {
          data[0].answerDetails.templates.forEach(el => {
            el.versions.forEach(i => {
              updatedCells = el.versions[0].cellValues;
            });
          });
        }
        for (let i = 0; i < updatedCells.length; i++) {
          let cellItem = this.tableTypeDetails.cellValues.filter(j => j.key == updatedCells[i].key)[0];
          if (cellItem.isEditable == false) {
            this.tableTypeDetails.cellValues[i] = this.tableTypeDetails.cellValues[i];
          }
          else if (cellItem.isEditable == true) {
            this.tableTypeDetails.cellValues[i] = updatedCells[i];
          }
        }
      }
    }
  }
  get form() { return this.createQuestionForm.controls; }

  closeBlockAttribute(action: string) {
    this.submitted = false;
    if (this.designerService.editquestionClicked) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('closeEditQuestion');
      this.designerService.editquestionClicked = false;
      this.designerService.allowTagNameChange = false;
    }
    else {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action)
        .publish(action);
    }
  }
  questionTypeChange(event) {
    if (event.target.selectedIndex == 0)
      this.createQuestionForm.controls["QuestionType"].setValue('');
    else {
      let selectedQuestionTypeId = event.target.value;
      let selectedQtype = this.questions.find(x => x.id == selectedQuestionTypeId);
      this.createQuestionForm.controls["QuestionType"].setValue(selectedQtype);
      this.selectedQuestionType = selectedQtype.typeName;
    }
  }
  AddLogicFlow() {
    this.designerService.questionText = this.createQuestionForm.controls["QuestionText"].value;
    this.dialogService.open(LogicaltypeComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { section: this.typeDetails }
    });
  }
  async createQuestion() {
    let request = new QuestionDataModel();
    this.submitted = true;
    if (this.createQuestionForm.invalid) {
      return;
    }
    if (this.isTagExist) return;
    if (!this.designerService.editquestionClicked) {
      let listOfSelectedBlocks = [];
      if (this.designerService.isLibrarySection) {
        if (this.designerServiceAdmin.blockList == undefined || this.designerServiceAdmin.blockList.length == 0) {
          this.DialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.document-view.tasks.errorMessages.blockSelection'));
          return;
        }
        listOfSelectedBlocks = this.designerServiceAdmin.blockList;
      }
      else {
        if (this.designerService.blockDetails == undefined) {
          this.DialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.document-view.tasks.errorMessages.blockSelection'));
          return;
        }
        listOfSelectedBlocks.push(this.designerService.blockDetails);
      }
      if (listOfSelectedBlocks) {
        listOfSelectedBlocks.forEach(element => {
          request.blockId = element.blockId;
          request.blockType = element.blockType;
          request.stackId = element.stackBlockId;
        });
      }

    }
    let data = this.createQuestionForm.value;
    if (!this.designerService.isLibrarySection)
      request.projectId = this.projectDetails.projectId;
    request.questionType = data.QuestionType;
    request.tagName = data.QuestionHashTag;
    request.title = data.QuestionText;
    request.allowAssigneeAttached = (data.AllowAttachment) ? data.AllowAttachment : false;
    request.comments = data.Comments;
    if (this.selectedQuestionType == QuestionType.TableType || this.selectedQuestionType == QuestionType.ComparabilityAnalysisType ||
      this.selectedQuestionType == QuestionType.BenchmarkRangeType || this.selectedQuestionType == QuestionType.CoveredTransactionType ||
      this.selectedQuestionType == QuestionType.ListType || this.selectedQuestionType == QuestionType.PLQuestionType) {
      if (this.designerService.createQuestionTableType != undefined && this.addTableType == true) {
        request.tableType = this.designerService.createQuestionTableType;
      }
      else {
        this.DialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.document-view.tasks.errorMessages.defineTableType'));
        return;
      }
    }
    let dropdownType = new DropdownTypeQuestion();
    dropdownType.modeOfSelection = (data.ModeOfOptions != null && data.ModeOfOptions != "") ? data.ModeOfOptions : true;
    dropdownType.options = data.DropdownOptions;
    request.dropdownType = dropdownType
    if (this.selectedQuestionType == QuestionRelated.logicType && this.designerService.logicTypeData != undefined) {
      let logicType = new LogicTypeViewModel();
      var subQuestions = [];
      this.designerService.logicTypeData.Options.forEach((element, index) => {
        let subQuestion = new SubQuestionViewModel();
        logicType.options.push(element.inputOption);
        subQuestion.option = element.inputOption;
        subQuestion.isConditionalQuestion = (element.isConditionQuestion != null) ? element.isConditionQuestion : false;
        subQuestion.title = element.QuestionText;
        subQuestion.questionType = element.QuestionType;
        let dropdownType = new DropdownTypeQuestion();
        dropdownType.modeOfSelection = element.ModeOfOptions;
        dropdownType.options = element.DropdownOptions;
        subQuestion.dropdownType = dropdownType;
        if (element.QuestionType && element.QuestionType.typeName) {
          let queryType = element.QuestionType.typeName;
          if (queryType == QuestionType.TableType || queryType == QuestionType.PLQuestionType || queryType == QuestionType.ListType || queryType == QuestionType.CoveredTransactionType || queryType == QuestionType.ComparabilityAnalysisType || queryType == QuestionType.BenchmarkRangeType) {
            let tableType = new TableTypeDomainModel();
            tableType.text = this.designerService.tableTypeData[index].text;
            tableType.rows = this.designerService.tableTypeData[index].rows;
            tableType.columns = this.designerService.tableTypeData[index].columns;
            tableType.cellValues = this.designerService.tableTypeData[index].cellValues;
            subQuestion.tableType = tableType;
          }
        }

        subQuestions.push(subQuestion);
      });
      logicType.subQuestions = subQuestions;
      request.logicType = logicType;
    }
    else if (this.selectedQuestionType == QuestionRelated.logicType && this.designerService.logicTypeData == undefined) {
      this.DialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.document-view.tasks.errorMessages.defineLogicType'));
      return;
    }

    if (this.designerService.editquestionClicked) {
      request.questionId = this.selectedQuestionId;
      request.id = this.selectedQuestinnaryId;
      request.allowTagNameChange = this.designerService.allowTagNameChange;
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.loaderStarted = true;
      await this.taskService.update(request).then(response => {
        if (response) {
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.tasks.successMessages.update-question-success'));

          this.closeBlockAttribute('closeEditQuestion');
          this.addTableType = false;
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.loaderStarted = false;
      });
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByLibrary).publish(data);

      this.taskService.getAllQuestionsByTemplateOrDeliverableId(this.designerService.questionFilterForEditOrDelete).subscribe((data) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
      })
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish('reload');
    }
    else {
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.loaderStarted = true;
      await this.taskService.createQuestion(request).then(response => {
        if (response.status == ResponseStatus.Failure) {
          this.DialogService.Open(DialogTypes.Error, response.errorMessages[0]);
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.loaderStarted = false;
          return;
        }
        else if (response.status == ResponseStatus.Sucess) {
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.tasks.successMessages.creat-question-success'));
          this.closeBlockAttribute('toggleCreateQuestion');
          this.addTableType = false;
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.loaderStarted = false;
        if (this.designerService.isLibrarySection)
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByLibrary).publish(data);
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(ActionEnum.reloadEditor);
      });
      this.taskService.getAllQuestionsByTemplateOrDeliverableId(this.designerService.questionFilterForEditOrDelete).subscribe((data) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
      })
    }
  }
  questionTagIsExistByProjectId() {
    if (this.designerService.editquestionClicked) {
      this.isTagExist = false;
    }
    else {
      let object = new QuestionTagViewModel();
      const userSetting = this.roleService.getUserRole();
      if (userSetting) {
        if (userSetting.adminView) {
          object.projectid = undefined;
        } else {
          object.projectid = this.projectDetails.projectId;
        }
      } else {
        object.projectid = this.projectDetails.projectId;
      }
      object.tag = this.tag.nativeElement.value;
      if (object.tag) {
        this.taskService.questionTagIsExistByProjectId(object).subscribe(response => {
          if (response)
            this.isTagExist = true;
          else
            this.isTagExist = false;
        })
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  popupTableType() {
    this.addTableType = true;
    this.designerService.createQuestionTableType = new TableTypeDomainModel();
    this.designerService.questionType = this.createQuestionForm.controls["QuestionType"].value;
    this.dialogService.open(TableTypeQuestionComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { section: this.tableTypeDetails, isLogicType: false }
    });
  }

}
