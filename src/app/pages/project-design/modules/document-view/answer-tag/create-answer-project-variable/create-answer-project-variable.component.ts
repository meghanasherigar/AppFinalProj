import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-create-answer-project-variable',
  templateUrl: './create-answer-project-variable.component.html',
  styleUrls: ['./create-answer-project-variable.component.scss']
})
export class CreateAnswerProjectVariableComponent implements OnInit {
  variable : string = '';
  value: string = '';
  insertProjectVariable : any = {};
  userInvalid : boolean =  true;
  IsValid : boolean = false;
  IsSpace: boolean = false;

  constructor(protected ref: NbDialogRef<any>,
              private _eventService: EventAggregatorService,
              private dialogService: DialogService,
              private translate: TranslateService,) { }

  ngOnInit() {
  }

  dismiss(){
    this.ref.close();
  }

  createProjectVariable(){
    this.insertProjectVariable.variable = this.variable;
    this.insertProjectVariable.value = this.value;
    this.insertProjectVariable.id = '';
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.createButtonAnswer).publish(this.insertProjectVariable);
    this.dismiss();
 }

 validationProjectVariable() {
  if(this.variable == ''){
    this.IsValid = false;
    this.IsSpace = false;
    this.userInvalid = true;
    return;
  }
  else if(this.variable != '') {
    if (this.variable[0] != '#') {
      this.IsValid = true;
      this.IsSpace = false;
      this.userInvalid = true;
      return;
    }
    else if(this.variable.includes(' ')){
      this.IsSpace = true;
      this.IsValid = false;
      this.userInvalid = true;
      return;
    }
    else if(this.value == '') {
      this.IsValid = false;
      this.IsSpace = false;
      this.userInvalid = true;
      return;
    }
    else{
      this.IsValid = false;
      this.IsSpace = false;
      this.userInvalid = false;
    }
  }
  else if(this.value == '') {
    this.IsValid = false;
    this.IsSpace = false;
    this.userInvalid = true;
    return;
  }
  else{
    this.IsValid = false;
    this.IsSpace = false;
    this.userInvalid = false;
  }
}

}
