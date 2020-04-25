import { Component, OnInit, Input } from '@angular/core';
import { QuestionAnswersDetailsViewModel, AnswerDetailsRequestModel, TableTypeDomainModel, CellDataModel, QuestionFilterByTemplateOrDeliverableId, SubAnswerDetailsRequestViewModel } from '../../../../../../../@models/projectDesigner/task';
import { QuestionType } from '../../../../../../../@models/projectDesigner/infoGathering';
import MultirootEditor from '../../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { DesignerService } from '../../../../../services/designer.service';
import { NbDialogRef } from '@nebular/theme';
import { TaskService } from '../../../../document-view/services/task.service';
import { ResponseStatus } from '../../../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { Subscriber, Subscription } from 'rxjs';
import { DialogTypes } from '../../../../../../../@models/common/dialog';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment'
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'ngx-edit-answer',
  templateUrl: './edit-answer.component.html',
  styleUrls: ['./edit-answer.component.scss']
})
export class EditAnswerComponent implements OnInit {
  TableText: boolean;
  ComparabilityText: boolean;
  BenchmarkText: boolean;
  PLText: boolean;
  ListText: boolean;
  innerHtmlTableType: string;
  section: TableTypeDomainModel;
  tableQuestionIds: any[];
  tableTypeQns: any = [];
  editedTableData: any[];
  answeredCellValues: any;
  subanswerId: string;
  answers: AnswerDetailsRequestModel = new AnswerDetailsRequestModel();
  constructor(private designerService: DesignerService, protected ref: NbDialogRef<any>, private taskService: TaskService, 
    private translate: TranslateService,
private toastr: ToastrService, private dialogService: DialogService, private _eventService: EventAggregatorService, private translateService: TranslateService) { }
  questionDetailsCopy: QuestionAnswersDetailsViewModel;
  @Input()
  questionDetails: QuestionAnswersDetailsViewModel
  @Input()
  questionPos: number;
  selectedOptions: string[];
  questionTitle: string;
  subQuestionType: string;
  questionType: string;
  isLogicTypeWithTableType: boolean;
  isLogicType: boolean;
  editor: any;
  answer: string;
  answerId: string;
  subQuestionPos: number;
  subscriptions: Subscription = new Subscription();
  isTable: boolean;
  ngOnInit() {
    this.questionDetailsCopy = Object.assign({}, this.questionDetails);
    this.questionType = this.questionDetails.typeDetails.questionType.typeName;
    this.questionTitle = this.questionDetails.title;
    if (this.designerService.questionFilterForEditOrDelete.isTemplate) {
      let versionsLength = this.designerService.blockQuestionsData[this.questionPos].answerDetails.templates[0].versions.length;
      this.answer = this.designerService.blockQuestionsData[this.questionPos].answerDetails.templates[0].versions[versionsLength - 1].answer;
      this.answerId = this.designerService.blockQuestionsData[this.questionPos].answerDetails.templates[0].versions[versionsLength - 1].id;
    }
    else {
      let delieverablePosition = this.designerService.blockQuestionsData[this.questionPos].answerDetails.deliverables.findIndex(x => x.templateOrDeliverableId == this.designerService.questionFilterForEditOrDelete.templateOrDeliverableId);
      let versionsLength = this.designerService.blockQuestionsData[this.questionPos].answerDetails.deliverables[delieverablePosition].versions.length;
      this.answer = this.designerService.blockQuestionsData[this.questionPos].answerDetails.deliverables[delieverablePosition].versions[versionsLength - 1].answer;
      this.answerId = this.designerService.blockQuestionsData[this.questionPos].answerDetails.deliverables[delieverablePosition].versions[versionsLength - 1].id;
    }

    switch (this.questionDetails.typeDetails.questionType.typeName) {
      case QuestionType.Logical:
        if (this.answer != null || this.answer != "") {
          this.isLogicType = true;
          let subQuestionIndex = this.questionDetails.typeDetails.subQuestions.findIndex(x => x.option == this.answer);
          this.subQuestionPos = this.questionDetails.typeDetails.subQuestions.findIndex(x => x.option == this.answer);
          if(!this.designerService.questionFilterForEditOrDelete.isTemplate)
          {
            let delieverablePos = this.designerService.blockQuestionsData[this.questionPos].answerDetails.deliverables.findIndex(x => x.templateOrDeliverableId == this.designerService.questionFilterForEditOrDelete.templateOrDeliverableId);
            let versionslen = this.designerService.blockQuestionsData[this.questionPos].answerDetails.deliverables[delieverablePos].versions.length;
            this.answer = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].answerDetails.deliverables[delieverablePos].versions[versionslen - 1].answer
          }
          else{
            let templatePos = this.designerService.blockQuestionsData[this.questionPos].answerDetails.templates.findIndex(x => x.templateOrDeliverableId == this.designerService.questionFilterForEditOrDelete.templateOrDeliverableId);
            let versionslen = this.designerService.blockQuestionsData[this.questionPos].answerDetails.templates[templatePos].versions.length;
            this.answer = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].answerDetails.templates[templatePos].versions[versionslen - 1].answer
          }
          
          this.questionType = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].typeDetails.questionType.typeName;
          this.questionTitle = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].title;
          let subquetype = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].typeDetails.questionType.typeName;
          if (subquetype == QuestionType.TableType ||
            subquetype == QuestionType.PLQuestionType ||
            subquetype == QuestionType.CoveredTransactionType ||
            subquetype == QuestionType.ComparabilityAnalysisType ||
            subquetype == QuestionType.BenchmarkRangeType) {
            this.isLogicTypeWithTableType = true;
            this.questionDetails.questionId = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].id;
            this.questionDetails.typeDetails.cellValues = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].typeDetails.cellValues;
            this.questionDetails.typeDetails.text = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].typeDetails.text;
            this.questionDetails.answerDetails = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].answerDetails;
          }
          else {
            this.questionDetails.questionId = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].id;
            this.questionDetails.answerDetails = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].answerDetails;
            this.questionDetails.typeDetails = this.questionDetails.typeDetails.subQuestions[subQuestionIndex].typeDetails;
            if (this.questionDetails.typeDetails.questionType.typeName == QuestionType.DateType) {
              this.answer = moment(this.answer).local().format('DD MMM YYYY');
            }
          }
        }
        break;
      case QuestionType.TableType:
      case QuestionType.PLQuestionType:
      case QuestionType.CoveredTransactionType:
      case QuestionType.ComparabilityAnalysisType:
      case QuestionType.BenchmarkRangeType:
        this.isTable = true;
        break;
      case QuestionType.DateType:
        this.answer = moment(this.answer).local().format('DD MMM YYYY');
      default:
        break;
    }
    if (this.questionType == QuestionType.DropDown) {
      if (this.questionDetails.typeDetails.modeOfSelection) {
        this.selectedOptions = this.answer.split('||');
      }
    }

  }

  valueCheck(event) {
    //restricting user from entering some alphabets in number type question
    if (event.keyCode == 69 || event.keyCode == 81) {
      return false
    }
  }

  dismiss() {
    this.ref.close();
  }
  RadioButtonChange(event) {
    this.answer = event.target.value;
  }
  setTableIDsInsideEditor(index, item, x) {
    let editorName = '#tableTypeEditor';
    let tableTypeEditor = document.querySelector(editorName);
    var editorDiv = tableTypeEditor.getElementsByTagName('table');
    if (editorDiv.length > 0) {
      editorDiv[0].getElementsByTagName('td')[index].id = item.id;
      if (item.isEditable == false) {
        editorDiv[0].getElementsByTagName('td')[index].style.pointerEvents = "none";
      }
    }
  }

  ngAfterViewInit() {
    switch (this.questionType) {
      case QuestionType.FreeText:
        let sourceElement: any = {};
        let editorDiv = document.querySelector('#freeTextAnswerEditor');
        if (editorDiv != null) {
          if (this.answer != null) {
            editorDiv.innerHTML = this.answer;
          }
          sourceElement["header" + '-' + this.questionDetails.questionId] = editorDiv;
          MultirootEditor.create1(sourceElement,undefined, undefined, this.designerService.definedColorCodes,this.translate.currentLang)
            .then(newEditor => {
              document.querySelector('#freeTextAnswerToolbar-Menu').appendChild(newEditor.ui.view.toolbar.element);
              newEditor.model.document.on('change:data', () => {
              });
            });
        }
        break;
      case QuestionType.TableType:
      case QuestionType.PLQuestionType:
      case QuestionType.CoveredTransactionType:
      case QuestionType.ComparabilityAnalysisType:
      case QuestionType.BenchmarkRangeType:
        this.tableQuestionIds = [];
        let editorName = 'tableTypeEditor';
        let tableTypeEditor = document.querySelector('#' + editorName);
        if (tableTypeEditor != null) {
          tableTypeEditor.innerHTML = this.questionDetails.typeDetails.text;
          this.questionDetails.typeDetails.cellValues.forEach((cell, index) => {
            tableTypeEditor.getElementsByTagName('td')[index].setAttribute('id', cell.id);
            var divCell = document.createElement("div");
            divCell.innerHTML = cell.value;
            if (divCell.innerText !== "") {
              cell.value = divCell.innerHTML;
            }
            else {
              cell.value = divCell.innerText;
            }
            this.tableQuestionIds.push(cell);
          });

          let tableTypeqn: any = {};
          tableTypeqn.questionId = this.questionDetails.questionId;
          tableTypeqn.tableQuestionIds = this.tableQuestionIds;
          this.tableTypeQns.push(tableTypeqn);
          if (this.designerService.questionFilterForEditOrDelete.isTemplate) {
            this.questionDetails.answerDetails.templates.forEach(el => {
              for (let i = 0; i < this.tableQuestionIds.length; i++) {
                let modifiedCell = el.versions[0].cellValues.filter(j => j.key == this.tableQuestionIds[i].key)[0];
                if (modifiedCell) {
                  var divCell = document.createElement("div");
                  if (modifiedCell.isEditable == true) {
                    divCell.innerHTML = modifiedCell.value;
                    if (divCell.innerText !== "") {
                      this.tableQuestionIds[i].value = divCell.innerHTML;
                    }
                    else {
                      this.tableQuestionIds[i].value = divCell.innerText;
                    }
                    this.tableQuestionIds[i].id = modifiedCell.id;
                    tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', modifiedCell.id);
                    tableTypeEditor.getElementsByTagName('td')[i].innerHTML = modifiedCell.value;
                  }
                  else if (modifiedCell.isEditable == false) {
                    divCell.innerHTML = this.tableQuestionIds[i].value;
                    if (divCell.innerText !== "") {
                      this.tableQuestionIds[i].value = divCell.innerHTML;
                    }
                    else {
                      this.tableQuestionIds[i].value = divCell.innerText;
                    }
                    this.tableQuestionIds[i].id = modifiedCell.id;
                    tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', this.tableQuestionIds[i].id);
                    tableTypeEditor.getElementsByTagName('td')[i].innerHTML = this.tableQuestionIds[i].value;
                  }
                }
              }
            });
          }
          else if (!this.designerService.questionFilterForEditOrDelete.isTemplate) {
            this.questionDetails.answerDetails.deliverables.forEach(el => {
              for (let i = 0; i < this.tableQuestionIds.length; i++) {
                let modifiedCell = el.versions[0].cellValues.filter(j => j.key == this.tableQuestionIds[i].key)[0];
                if (modifiedCell) {
                  var divCell = document.createElement("div");
                  if (modifiedCell.isEditable == true) {
                    divCell.innerHTML = modifiedCell.value;
                    if (divCell.innerText !== "") {
                      this.tableQuestionIds[i].value = divCell.innerHTML;
                    }
                    else {
                      this.tableQuestionIds[i].value = divCell.innerText;
                    }
                    this.tableQuestionIds[i].id = modifiedCell.id;
                    tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', modifiedCell.id);
                    tableTypeEditor.getElementsByTagName('td')[i].innerHTML = modifiedCell.value;
                  }
                  else if (modifiedCell.isEditable == false) {
                    divCell.innerHTML = this.tableQuestionIds[i].value;
                    if (divCell.innerText !== "") {
                      this.tableQuestionIds[i].value = divCell.innerHTML;
                    }
                    else {
                      this.tableQuestionIds[i].value = divCell.innerText;
                    }
                    this.tableQuestionIds[i].id = modifiedCell.id;
                    tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', this.tableQuestionIds[i].id);
                    tableTypeEditor.getElementsByTagName('td')[i].innerHTML = this.tableQuestionIds[i].value;
                  }
                }
              }
            });
          }
          sourceElement = { tablTypeHeader: document.querySelector('#tableTypeEditor') };
          MultirootEditor.create1(sourceElement,undefined, undefined, this.designerService.definedColorCodes,this.translate.currentLang)
            .then(newEditor1 => {
              document.querySelector('#tableType-toolbar-menu').appendChild(newEditor1.ui.view.toolbar.element);
            });
          var _parentThis = this;
          setTimeout(function () {
            _parentThis.questionDetails.typeDetails.cellValues.forEach((item, index) => {
              _parentThis.setTableIDsInsideEditor(index, item, this.questionDetails);
            })
          }, 1000);
        }
        break;
      default:
        break;
    }
  }
  tableEditorChange(event) {
    let editorActiveTag = document.activeElement as HTMLElement;
    this.editedTableData = [];
    if (editorActiveTag.tagName != "TD" && editorActiveTag.tagName != "TH") {
      event.preventDefault();
    }
    else {
      var _parentThis = this;
      setTimeout(function () {
        let cellData = new CellDataModel();
        cellData.id = document.activeElement.id;
        cellData.innerHtml = document.activeElement.innerHTML;
        cellData.innerText = document.activeElement.textContent;
        _parentThis.editedTableData.push(cellData);
        _parentThis.saveTableData();
      });
    }
  }
  saveTableData() {
    let questionId = "";
    this.tableTypeQns.forEach(table => {
      let _selectedTableQuestion = table.tableQuestionIds.filter(qn => qn.id == this.editedTableData[0].id);
      if (_selectedTableQuestion.length > 0) questionId = table.questionId;
    })

    let selectedTableQuestion = this.tableTypeQns.filter(id => id.questionId == questionId);

    if (selectedTableQuestion.length > 0) {
      for (let i = 0; i < this.editedTableData.length; i++) {
        selectedTableQuestion[0].tableQuestionIds.forEach((item) => {
          if (item.id == this.editedTableData[i].id && item.value !== this.editedTableData[i].innerText) {
            item.value = this.editedTableData[i].innerHtml;
          }
        });
      }
      this.answeredCellValues = selectedTableQuestion[0].tableQuestionIds;
      this.answers.cellValue = this.answeredCellValues;
      this.tableTypeQns.forEach(table => { if (table.questionId == questionId) table.tableQuestionIds = this.answeredCellValues });
    }
  }

  save() {
    if (this.isLogicType == undefined || this.isLogicType == false) {
      this.answers.type = this.questionType;
      this.answers.questionId = this.questionDetails.questionId;
      this.answers.questionnairesId = this.questionDetails.questionnariesId;
      if (this.designerService.questionFilterForEditOrDelete.isTemplate) {
        this.answers.templateId = this.designerService.questionFilterForEditOrDelete.templateOrDeliverableId
      }
      else {
        this.answers.deliverableId = this.designerService.questionFilterForEditOrDelete.templateOrDeliverableId
      }

      this.answers.answer = this.answerId;
      switch (this.questionType) {
        case QuestionType.FreeText:
          this.answers.answer = document.querySelector("#freeTextAnswerEditor").innerHTML;
          break;
        case QuestionType.DropDown:
          if (this.questionDetails.typeDetails.modeOfSelection) {
            this.answers.answer = this.selectedOptions.join('||');
          }
          break;
        default:
          this.answers.answer = this.answer;
          break;
      }
    }
    else {
      this.answers.type = this.questionDetailsCopy.typeDetails.questionType.typeName;
      this.answers.questionId = this.questionDetailsCopy.questionId;
      this.answers.questionnairesId = this.questionDetailsCopy.questionnariesId;
      if (this.designerService.questionFilterForEditOrDelete.isTemplate) {
        this.answers.templateId = this.designerService.questionFilterForEditOrDelete.templateOrDeliverableId
      }
      else {
        this.answers.deliverableId = this.designerService.questionFilterForEditOrDelete.templateOrDeliverableId
      }
      if (this.designerService.questionFilterForEditOrDelete.isTemplate) {
        let versionsLength = this.questionDetailsCopy.typeDetails.subQuestions[this.subQuestionPos].answerDetails.templates[0].versions.length;
        this.subanswerId = this.questionDetailsCopy.typeDetails.subQuestions[this.subQuestionPos].answerDetails.templates[0].versions[versionsLength - 1].id;
      }
      else {
        let delieverablePosition = this.questionDetailsCopy.typeDetails.subQuestions[this.subQuestionPos].answerDetails.deliverables.findIndex(x => x.templateOrDeliverableId == this.designerService.questionFilterForEditOrDelete.templateOrDeliverableId);
        let versionsLength = this.questionDetailsCopy.typeDetails.subQuestions[this.subQuestionPos].answerDetails.deliverables[delieverablePosition].versions.length;
        this.subanswerId = this.questionDetailsCopy.typeDetails.subQuestions[this.subQuestionPos].answerDetails.deliverables[delieverablePosition].versions[versionsLength - 1].id;
      }
      this.answers.answerId = this.answerId;
      let subanswer = new SubAnswerDetailsRequestViewModel();
      subanswer.subAnswerId = this.subanswerId;
      subanswer.subQuestionId = this.questionDetailsCopy.typeDetails.subQuestions[this.subQuestionPos].id;
      subanswer.type = this.questionDetailsCopy.typeDetails.subQuestions[this.subQuestionPos].typeDetails.questionType.typeName;
      switch (this.questionType) {
        case QuestionType.FreeText:
          this.answers.answer = null;
          subanswer.subAnswer = document.querySelector("#freeTextAnswerEditor").innerHTML;
          break;
        case QuestionType.TableType:
        case QuestionType.PLQuestionType:
        case QuestionType.CoveredTransactionType:
        case QuestionType.ComparabilityAnalysisType:
        case QuestionType.BenchmarkRangeType:
          this.answers.answer = null;
          subanswer.cellValue = Object.assign([], this.answers.cellValue);
          this.answers.cellValue = [];
          this.answers.answerId = null;
          this.answers.type = this.questionDetailsCopy.typeDetails.questionType.typeName;
        default:

          subanswer.subAnswer = this.answer;
          break;

      }
      this.answers.answer = this.questionDetailsCopy.typeDetails.subQuestions[this.subQuestionPos].option;
      this.answers.subAnswer.push(subanswer);
    }




    this.subscriptions.add(this.taskService.updateanswer(this.answers).subscribe(response => {
      if (response.status === ResponseStatus.Sucess) {
        this.toastr.success(this.translate.instant('screens.project-designer.document-view.updateSuccess'));
       
        this.ref.close();
      }
      else {
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      }
      let questionFilter = new QuestionFilterByTemplateOrDeliverableId();
      questionFilter = this.designerService.questionFilterForEditOrDelete;
      this.taskService.getAllQuestionsByTemplateOrDeliverableId(questionFilter).subscribe((data) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
      })
    }, error => {
      this.dialogService.Open(DialogTypes.Warning, error.message);
    })
    )
  }

}
