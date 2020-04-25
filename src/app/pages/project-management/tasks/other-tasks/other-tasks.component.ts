import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { otherTaskrequest, InformationRequestViewModel, InformationFiltersViewModel } from '../../@models/tasks/task';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { TaskReportService } from '../../services/task-report.service';
import { ProjectManagementService } from '../../services/project-management.service';
import { UserBasicViewModel } from '../../../../@models/userAdmin';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../@models/common/dialog';
import { DialogService } from '../../../../shared/services/dialog.service';
// import { AnswerDetailsRequestModel, InformationFiltersViewModel } from '../../../../@models/projectDesigner/task';

@Component({
  selector: 'ngx-other-tasks',
  templateUrl: './other-tasks.component.html',
  styleUrls: ['./other-tasks.component.scss']
})
export class OtherTasksComponent implements OnInit {
  otherTask_form: FormGroup;
  submitted: boolean = false;
  fileName:any;
  fileSize: boolean = false;
  constructor(private formbuilder: FormBuilder, protected ref: NbDialogRef<any>, 
    private taskService: TaskReportService, private shareDetailService: ShareDetailService,
    private managementService: ProjectManagementService, private _changeDetector: ChangeDetectorRef,  
    private dialogService: DialogService) { }

  ngOnInit() {
   this.otherTask_form =  this.formbuilder.group({
    'taskName': [null, [Validators.required, Validators.pattern("[^@,+,=,<,>,-].*")]],
    'taskType': [null, Validators.required],
    'dueDate': [null, Validators.required],
    file: [null]
   });
   this.otherTask_form.controls['taskType'].setValue('Other');
  }

  onFileChange(event) {
    let reader = new FileReader();
    this.fileSize = false;
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.fileName = event.target.files[0].name;

      if(file.size > 15000000) {
        this.fileSize = true;
        return;        
      }
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        this.otherTask_form.patchValue({
          file: reader.result
        });
        
        // need to run CD since file load runs outside of zone
        this._changeDetector.markForCheck();
      };
    }
  }

  assignTask(){
    let reader = new FileReader();
    let fileContent = [];
    let filename = '';
    let filetype = '';
    this.submitted = true;
    if (this.otherTask_form.invalid) {
      this.submitted = false;
      return;
    }
    
    this.markFormAsTouched(this.otherTask_form);
    let otherTaskRequest = new otherTaskrequest();
    //start convert data into byte array 
    const fileContentData = this.otherTask_form.controls['file'].value;
    if(fileContentData) {
      fileContent = this.convertTOByteArray(fileContentData);
      const lastINdex = this.fileName.lastIndexOf('.');
      filename  = this.fileName.substr(0, lastINdex);
      filetype = this.fileName.substr(lastINdex, this.fileName.length);
    } 
    //stop convert data into byte array

      otherTaskRequest.InformationData = new InformationRequestViewModel();
      otherTaskRequest.InformationData.dueDate = this.otherTask_form.controls['dueDate'].value;
      otherTaskRequest.InformationData.name = this.otherTask_form.controls['taskName'].value;
      otherTaskRequest.InformationData.projectId = this.shareDetailService.getORganizationDetail().projectId;
      // otherTaskRequest.InformationRequestViewModel.taskType = this.otherTask_form.controls['taskType'].value;
      otherTaskRequest.InformationData.TaskTypeValue = 1;
      otherTaskRequest.InformationData.AssignTo = [];
      otherTaskRequest.InformationData.CoReviewer = [];
      otherTaskRequest.InformationData.ViewBlockList = [];
      otherTaskRequest.InformationData.BlockIds = [];
      otherTaskRequest.InformationData.Questions = [];
      otherTaskRequest.InformationData .DeliverableId = '';
      otherTaskRequest.InformationData.TemplateId = '';
      otherTaskRequest.InformationData.CoverPage = '';
      otherTaskRequest.InformationData.Filters = new InformationFiltersViewModel();
      otherTaskRequest.InformationData.Filters.QuestionType = [];
      otherTaskRequest.InformationData.Filters.BlockType = [];
      otherTaskRequest.InformationData.Filters.TemplateId = '';
      otherTaskRequest.InformationData.Filters.DeliverableIds = [];
      otherTaskRequest.InformationData.AnswerDetails =  [];
      otherTaskRequest.file = fileContent;
      otherTaskRequest.fileName = filename;
      otherTaskRequest.fileType = filetype;
      this.taskService.createOfflineTask(otherTaskRequest).subscribe((request) => {
          if(request) {
            if (request.status == ResponseStatus.Sucess) {
             //this.managementService.changeReloadDeliverableGrid(true);
              this.managementService.changeReloadTaskGrid(true);
              this.ref.close();
            }
            else {
              this.dialogService.Open(DialogTypes.Warning, request.errorMessages[0]);
            }
          }
      })
  }

  convertTOByteArray(data) {
    const b64Data = data.split('base64,', 2)[1];
    const byteCharacters = atob(b64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: this.fileName.type});

    return byteNumbers;
  }

  cancel() {
    this.ref.close();
  }

  convertbase64toArrayBuffer(base64) {
    var binary_string = window.btoa(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
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

}
