import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { ProjectManagementService } from '../../services/project-management.service';
import { Subscription } from 'rxjs';
import { TaskReportService } from '../../services/task-report.service';
import { taskCompletionModel, userSearchModel, userAssignment } from '../../@models/tasks/task';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { taskTypes } from '../../@models/Project-Management-Constants';
import { MatDialog, MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';

@Component({
  selector: 'ngx-re-assign',
  templateUrl: './re-assign.component.html',
  styleUrls: ['./re-assign.component.scss']
})
export class ReAssignComponent implements OnInit, OnDestroy {
  reAssignTask_Form: FormGroup;
  submitted: boolean = false;
  currentSubscriptions = new Subscription();
  selectedUsers = [];
  blockId: string;
  templateId: string = '';
  deliverableId: string = '';
  searchText: string = '';
  taskType: string;
  infoRequestId: string = '';
  taskName: string = '';
  searchUserResult: any[];
  dueDate: string;
  multipleUsers: boolean = false;
  removableUser: boolean = true;
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;

  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];


  constructor(private formbuilder: FormBuilder,
    private taskService: TaskReportService,
    private dialog: MatDialog,
    private shareDetailService: ShareDetailService,
    private managementService: ProjectManagementService,
    protected ref: NbDialogRef<any>) { }

  ngOnInit() {
    this.subscriptions();
    this.reAssignTask_Form = this.formbuilder.group({
      'reAssignTo': [null],
      'dueDate': [null, Validators.required],
      'note': [null]
    });

    this.reAssignTask_Form.controls['reAssignTo'].valueChanges
      .subscribe(data => {
        this.searchUserResult=[];
        if (data.length >= 3 && 
          !this.selectedUsers.find(x=>x.email===this.reAssignTask_Form.controls['reAssignTo'].value)) 
        {
          this.searchProjectUsers(data);
        }
      });
  }

  // TO DO: remove below method for after implementation of API

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add our keyword
    if ((value || '').trim()) {
      let existingUser = this.selectedUsers.find(x => x === value.trim());
      //if(!existingUser){
      this.selectedUsers.push(value.trim());
      //}
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(keyword: any): void {
    let index = this.selectedUsers.indexOf(keyword);

    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }

  reAssign() {
    this.submitted = true;
    //console.log('reassingnfor', this.reAssignTask_Form);
    if (this.reAssignTask_Form.invalid || this.selectedUsers.length === 0) {
      return;
    }
    this.markFormAsTouched(this.reAssignTask_Form);
    // To DO: check if can be used as getRawValue 
    // let formValues = this.reAssignTask_Form.getRawValue;
    //console.log('reassign', this.reAssignTask_Form.controls['reAssignTo'].value);

    this.reAssignTask();
  }

  selectUser(item) {
    this.reAssignTask_Form.controls['reAssignTo'].setValue('');
    if (this.multipleUsers) {
      this.selectedUsers.push(item);
    } else {
      this.selectedUsers.splice(0, this.selectedUsers.length, item);
    }
    this.searchUserResult = [];
  }

  prepareRequestModel() {
    let request: taskCompletionModel = new taskCompletionModel();
    request.templateId = this.templateId;
    request.deliverableId = this.deliverableId;
    request.infoRequestId = this.infoRequestId;
    request.blockId = this.infoRequestId;
    request.taskType = this.mapTaskTypeFromEnum();

    request.dueDate = this.reAssignTask_Form.controls['dueDate'].value;
    request.users = new Array<userAssignment>();
    request.users = this.selectedUsers;
    request.note = this.reAssignTask_Form.controls['note'].value;
    request.name = this.taskName;
    return request;
  }

  mapTaskTypeFromEnum() {
    switch (this.taskType) {
      case taskTypes.BLOCKREVIEW:
        return taskTypes.BLOCKREVIEW;
      case taskTypes.INFORMATIONREQUEST:
        return taskTypes.INFORMATIONREQUEST;
      case taskTypes.REPORTREVIEW:
        return taskTypes.REPORTREVIEW;
      default: break;
    }
  }

  reAssignTask() {
    let request = [];
    request.push(this.prepareRequestModel());
    this.taskService.reAssign(request).subscribe(response => {
      //console.log(response);
      this.managementService.changeReloadTaskGrid(true);
      this.cancel();
    });
  }

  subscriptions() {
    this.currentSubscriptions.add(
      this.managementService.currentTaskForReassign.subscribe(currentTasks => {
        //console.log(currentTasks);
        //Perform action only when one row is selected
        if (currentTasks.length === 1) {
          this.templateId = currentTasks[0].templateId;
          this.deliverableId = currentTasks[0].deliverableId;
          this.taskType = currentTasks[0].taskType;
          this.infoRequestId = currentTasks[0].id;
          this.taskName = currentTasks[0].name;
          this.multipleUsers = (currentTasks[0].taskType === taskTypes.INFORMATIONREQUEST);
        }
      })
    );

  }

  cancel() {
    this.ref.close();
  }

  searchProjectUsers(searchText) {

    let userRequest = new userSearchModel();
    userRequest.searchText = searchText;
    userRequest.projectId = this.shareDetailService.getORganizationDetail().projectId;;
    userRequest.deliverableId = this.deliverableId;
    userRequest.templateId = this.templateId;

    this.taskService.searchProjectUsers(userRequest).subscribe((response: any[]) => {
      //console.log(userRequest);
      if (response && response.length) {
        this.searchUserResult = response;
      }
    });
  }

  markFormAsTouched(group: FormGroup | FormArray) {
    Object.keys(group.controls).forEach((key: string) => {
      const control = group.controls[key];
      if (control instanceof FormGroup || control instanceof FormArray) {
        control.markAsTouched();
        this.markFormAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }

}
