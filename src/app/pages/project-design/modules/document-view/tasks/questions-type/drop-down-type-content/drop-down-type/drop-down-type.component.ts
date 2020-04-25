import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { TypeViewModel } from '../../../../../../../../@models/projectDesigner/task';

@Component({
  selector: 'question-dropdown-type',
  templateUrl: './drop-down-type.component.html',
  styleUrls: ['./drop-down-type.component.scss']
})
export class DropDownTypeComponent implements OnInit {

  //TODO: Delete this
  private name: string;
  @Input() questionData: FormGroup;
  @Input() editedDetails: TypeViewModel;
  @Input() submitted: boolean;
  @Input() ModeOfOptions: boolean = true;
  get DropdownOptions(): FormArray { return this.questionData.get('DropdownOptions') as FormArray; }
  constructor() {

  }

  ngOnInit() {
    let chk = this.submitted;
    this.questionData.addControl('ModeOfOptions', new FormControl(''));
    this.questionData.addControl('DropdownOptions', new FormArray([
      new FormControl('', Validators.required),
      new FormControl('', Validators.required)
    ]));
    this.questionData.controls["ModeOfOptions"].setValue(false);
    if (this.editedDetails) {
      this.populateDropDownDetails();
    }
  }
  get form() { return this.questionData.controls; }
  AddAnotherOption() {
    this.DropdownOptions.push(new FormControl('', Validators.required));
  }

  getDDOptionsFormGroup(index): FormGroup {
    const formGroup = this.DropdownOptions.controls[index] as FormGroup;
    return formGroup;
  }

  populateDropDownDetails() {
    this.questionData.controls["ModeOfOptions"].setValue(this.editedDetails.modeOfSelection);
    for (let i = 0; i < this.editedDetails.options.length; i++) {
      this.questionData.controls["DropdownOptions"].setValue([this.editedDetails.options[i], this.editedDetails.options[i + 1]]);
      i++;
    }
  }

}
