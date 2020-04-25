import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../../../../shared/services/alert.service';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-hyperlink',
  templateUrl: './hyperlink.component.html',
  styleUrls: ['./hyperlink.component.scss']
})
export class HyperlinkComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  profileForm: FormGroup;
  fileUpload: any;
  selectedfile: any;

  constructor(    
    private fb: FormBuilder, 
    private alertService: AlertService,
    private shareDetailService: ShareDetailService,
    private dialogService: DialogService,
    private translate: TranslateService,
    protected ref: NbDialogRef<any>,) { }

  ngOnInit() {
    this.alertService.clear();
    this.profileForm = this.fb.group({
      profile: ['', Validators.required]
    });
  }

  get form() { return this.profileForm.controls; }

  dismiss() {
    this.ref.close();
  }

  onSelectedFile(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      document.getElementById("fileName").innerText = file.name;
      this.selectedfile = file;
      this.profileForm.get('profile').setValue(file);
    }
  }

  SaveHyperlink() {
    const file = new FormData();
    const project = this.shareDetailService.getORganizationDetail();
    file.append('projectId', project.projectId)
    file.append('file', this.selectedfile, this.selectedfile.name);
    // this.projectUserService.upload(file).subscribe(
    //   response => {
    //     var res = response;
    //     if (response.status === ResponseStatus.Sucess) {
    //       this.dialogService.Open(DialogTypes.Success, this.translate.instant('screens.project-user.FileUploadSuccessMessage'));
    //     } else {
    //       this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
    //     }

    //   },
    //   error => {
    //     this.dialogService.Open(DialogTypes.Error, error.message);
    //   });
  }

}
