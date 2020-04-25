import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { TaskService } from '../../../services/task.service';
import { QuestionTypeViewModel, QuestionRelated, TypeViewModel, TableTypeDomainModel } from '../../../../../../../@models/projectDesigner/task';
import { DesignerService } from '../../../../../services/designer.service';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { TableTypeQuestionComponent } from '../../table-type-question/table-type-question.component';
import { QuestionType } from '../../../../../../../@models/projectDesigner/infoGathering';

@Component({
  selector: 'ngx-logicaltype',
  templateUrl: './logicaltype.component.html',
  styleUrls: ['./logicaltype.component.scss']
})
export class LogicaltypeComponent implements OnInit {
  logicFormGroup: FormGroup;
  submitted: boolean;
  questions: QuestionTypeViewModel[];
  selectedTableType: QuestionTypeViewModel[] = [];
  ModeOfOptions: boolean[] = [];
  selectedQuestionType: any;
  tableTypeDetails: TableTypeDomainModel;
  questionTitle: any;
  section: TypeViewModel;
  dropdownDetails: TypeViewModel;
  subscriptions: Subscription = new Subscription();
  questionType: any = QuestionType;
  get Options(): FormArray { return this.logicFormGroup.get('Options') as FormArray; }

  constructor(private formBuilder: FormBuilder, protected ref: NbDialogRef<any>, private taskService: TaskService,
    public designerService: DesignerService,
    public _eventService: EventAggregatorService,
    private dialogService: NbDialogService) {
    this.logicFormGroup = this.formBuilder.group({
      Options: new FormArray([this.createLogicOption(), this.createLogicOption()])
    });
  }
  createLogicOption(): FormGroup {
    return this.formBuilder.group({
      inputOption: ['', Validators.compose([Validators.required])],
      isConditionQuestion: [null]
    });
  }
  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).subscribe((payload) => {
      this.emptyQuestionDetailsArray(this.logicFormGroup.get('Options') as FormArray);
    }))
    this.questionTitle = this.designerService.questionText;
    if (this.section) {
      this.populateAddFlowDetails();
    }
    this.populateTableTypeOptionsArray();
    this.taskService.getTasks().subscribe(
      data => {
        this.questions = data;
        var index = this.questions.findIndex(x => x.typeName == QuestionRelated.logicType);
        if (index > -1)
          this.questions.splice(index, 1);
      });
  }
  get form() { return this.logicFormGroup.controls; }
  getCondQuestionFormGroup(index): FormGroup {
    const formGroup = this.Options.controls[index] as FormGroup;
    return formGroup;
  }

  closeLogicFlow() {
    this.ref.close();
  }
  questionTypeChange(event, index) {
    if (event.target.selectedIndex == 0)
      this.getCondQuestionFormGroup(index).controls['QuestionType'].setValue('');
    else {
      let selectedQuestionTypeId = event.target.value;
      let selectedQtype = this.questions.find(x => x.id == selectedQuestionTypeId);
      this.selectedTableType[index] = selectedQtype;
      this.getCondQuestionFormGroup(index).controls['QuestionType'].setValue(selectedQtype);
      this.selectedQuestionType = selectedQtype.typeName;
    }
  }
  populateTableTypeOptionsArray() {
    for (let i = 0; i < this.Options.length; i++) {
      if (this.selectedTableType.length < this.Options.length) {
        let questionTypeViewModel = new QuestionTypeViewModel;
        this.selectedTableType.push(questionTypeViewModel);
      }
    }
  }

  AddAnotherOption() {
    this.Options.push(this.createLogicOption());
  }

  checkConditionalQuestion(event, index) {
    if (event.returnValue) {
      this.getCondQuestionFormGroup(index).addControl("QuestionType", new FormControl('', Validators.required));
      this.getCondQuestionFormGroup(index).addControl("QuestionText", new FormControl('', Validators.required));
    }
    else {
      this.getCondQuestionFormGroup(index).removeControl("QuestionType");
      this.getCondQuestionFormGroup(index).removeControl("QuestionText");

    }
  }
  submitLogicFlow() {
    this.submitted = true;
    if (this.logicFormGroup.invalid) {
      return;
    }
    var logicFlowData = this.logicFormGroup.value;
    this.designerService.logicTypeData = logicFlowData;
    this.closeLogicFlow();
  }

  populateAddFlowDetails() {
    let subquestions: any = this.section.subQuestions;
    for (let i = 0; i < this.section.options.length; i++) {
      this.getCondQuestionFormGroup(i).controls["inputOption"].setValue(this.section.options[i]);
      let optionValue: string = this.getCondQuestionFormGroup(i).controls["inputOption"].value;
      this.getCondQuestionFormGroup(i).addControl("QuestionType", new FormControl('', Validators.required));
      this.getCondQuestionFormGroup(i).addControl("DDQuestionType", new FormControl('', Validators.required));
      this.getCondQuestionFormGroup(i).addControl("QuestionText", new FormControl('', Validators.required));
      this.getCondQuestionFormGroup(i).controls["DDQuestionType"].setValue(subquestions[i].typeDetails.questionType.id);
      this.getCondQuestionFormGroup(i).controls["QuestionType"].setValue(subquestions[i].typeDetails.questionType);
      this.getCondQuestionFormGroup(i).controls["QuestionText"].setValue(subquestions[i].title);
      this.getCondQuestionFormGroup(i).controls["isConditionQuestion"].setValue(subquestions[i].isConditionalQuestion);
      if (subquestions[i].typeDetails.questionType.typeName == "Drop Down Type") {
        if (this.ModeOfOptions.length < i) {
          for (let k = 0; k <= i - this.ModeOfOptions.length + 1; k++) {
            this.ModeOfOptions.push(false);
          }
        }
        this.getCondQuestionFormGroup(i).addControl("ModeOfOptions", new FormControl('', Validators.required));
        this.getCondQuestionFormGroup(i).controls["ModeOfOptions"].setValue(subquestions[i].typeDetails.modeOfSelection);
        this.ModeOfOptions[i] = subquestions[i].typeDetails.modeOfSelection;
        this.getCondQuestionFormGroup(i).addControl("DropdownOptions", new FormArray([]))
        var dropdownFormArray = this.getCondQuestionFormGroup(i).controls["DropdownOptions"] as FormArray;
        for (let j = 0; j < subquestions[i].typeDetails.options.length; j++) {
          dropdownFormArray.push(new FormControl(''));
          dropdownFormArray.controls[j].setValue(subquestions[i].typeDetails.options[j]);
        }
      }
    }
  }

  emptyQuestionDetailsArray(questionedtails: FormArray) {
    while (questionedtails.length !== 0) {
      questionedtails.removeAt(0)
    }
  }

  popupTableType(index) {
    this.designerService.questionType = this.selectedTableType[index];
    this.dialogService.open(TableTypeQuestionComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { section: this.tableTypeDetails, isLogicType: true, position: index }
    });
  }

}
