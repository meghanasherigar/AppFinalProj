import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ProjectUserService } from '../../../admin/services/project-user.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../../shared/services/alert.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../@models/common/dialog';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-upload-user',
  templateUrl: './upload-user.component.html',
  styleUrls: ['./upload-user.component.scss']
})
export class UploadUserComponent implements OnInit {
  @Input() value: string | number;
  @Input() rowData: any;
  @Output() manageTransaction: EventEmitter<any> = new EventEmitter();
  @Output() CancelTransaction: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  profileForm: FormGroup;
  fileUpload: any;
  selectedfile: any;
  enableUpload: boolean = false;

  //ngx-ui-loader configuration
  loaderId='UploadUserLoader';
  loaderPosition=POSITION.centerCenter;
  loaderFgsType=SPINNER.ballSpinClockwise; 
  loaderColor = '#55eb06';
  
  constructor(
    private fb: FormBuilder, 
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private projectUserService: ProjectUserService, 
    private alertService: AlertService,
    private shareDetailService: ShareDetailService,
    private readonly _eventService: EventAggregatorService, 
    private dialogService: DialogService,
    private translate: TranslateService,
    private elRef: ElementRef
    ) { }

    ngOnInit() {
      this.alertService.clear();
      this.profileForm = this.fb.group({
        name: [''],
        profile: ['', Validators.required]
      });
      
      this.subscriptions.add(this._eventService.getEvent(EventConstants.ProjectUser).subscribe((payload)=>
        {
            if(payload=="Upload"){
              var element:HTMLElement=document.getElementById("profile") as HTMLElement;
              element.click(); 
          }
        
        }));
    }

    get form() { return this.profileForm.controls; }


     showFileDialog(){
     
    }
    ngOnDestroy() {
      this.subscriptions.unsubscribe();
    }
    
    onSelectedFile(event) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        document.getElementById("fileName").innerText = file.name;
        this.selectedfile = file;
        this.enableUpload = true;
        this.profileForm.get('profile').setValue(file);
      }
    }

    onSubmit() {
      const file = new FormData();
      // file.append('projectId', 'DigiDox3.0');
      const project = this.shareDetailService.getORganizationDetail();
      file.append('projectId', project.projectId)
      file.append('file', this.selectedfile, this.selectedfile.name);
        //Start loader
 this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.projectUserService.upload(file).subscribe(
        response => {
          var res = response;
            this.ngxLoader.stopBackgroundLoader(this.loaderId);

          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-user.FileUploadSuccessMessage'));
            this.enableUpload = false;
            this.manageTransaction.emit();
            this.downloadFile(this.convertbase64toArrayBuffer(res.tag));
            this.closeProjectUserUpload('CancelUpload');
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
  
        },
        error => {
          this.dialogService.Open(DialogTypes.Error, error.message);
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });
    }
    convertbase64toArrayBuffer(base64) {
          var binary_string = window.atob(base64);
          var len = binary_string.length;
          var bytes = new Uint8Array(len);
          for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
          }
          return bytes.buffer;
        } 
    downloadFile(data) {
      try {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob,this.selectedfile.name);
        }
        else {
          var a = document.createElement("a");
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = this.selectedfile.name;
          a.click();
        }
      }
      catch{
        this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.DownloadFailureMessage'));
      }
    }

    //method which will close the create transaction popup
    closeProjectUserUpload(action) {
      this.CancelTransaction.emit(action);
    }

}
