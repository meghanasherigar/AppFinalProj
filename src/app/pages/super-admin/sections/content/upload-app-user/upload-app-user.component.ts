import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { AlertService } from '../../../../../shared/services/alert.service';
import { ResponseStatus } from '../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { ProjectUserService } from '../../../../admin/services/project-user.service';
import { AppUsersService } from '../../../services/app-users.service';
import { downloadFile } from '../../../../project-management/@models/common/common-helper';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-upload-app-user',
  templateUrl: './upload-app-user.component.html',
  styleUrls: ['./upload-app-user.component.scss']
})
export class UploadAppUserComponent implements OnInit {

  @Input() value: string | number;
  @Input() rowData: any;
  @Output() ReloadGrid: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  profileForm: FormGroup;
  fileUpload: any;
  selectedfile: any;
  enableUpload: boolean = false;

  //ngx-ui-loader configuration
  loaderId = 'UploadAppUserLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  constructor(
    private fb: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private appUserService: AppUsersService,
    private alertService: AlertService,
    private dialogService: DialogService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.alertService.clear();
    this.profileForm = this.fb.group({
      name: [''],
      profile: ['', Validators.required]
    });
  }

  get form() { return this.profileForm.controls; }

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
    file.append('file', this.selectedfile, this.selectedfile.name);
    //Start loader
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.appUserService.upload(file).subscribe(
      response => {
        var res = response;
        this.ngxLoader.stopBackgroundLoader(this.loaderId);

        if (response.status === ResponseStatus.Sucess) {
          this.toastr.success(this.translate.instant('screens.project-user.FileUploadSuccessMessage'));
        
          this.enableUpload = false;
          downloadFile((res.tag), this.selectedfile.name);
          this.closeProjectUserUpload();
        } else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }

      },
      error => {
        this.dialogService.Open(DialogTypes.Error, error.message);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  closeProjectUserUpload() {
    this.profileForm.get('profile').reset();
    this.selectedfile = null;
    document.getElementById("fileName").innerText = "";
    this.ReloadGrid.emit();
  }

}
