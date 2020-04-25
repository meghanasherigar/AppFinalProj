import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { UserManualService } from '../../../services/user-manual.service';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../../@models/common/dialog';
import { HttpClient } from '@angular/common/http';
import { LanguageViewModel } from '../../../../../@models/help/userManual';
import { AppliConfigService } from '../../../../../shared/services/appconfig.service';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-user-manual-level2',
  templateUrl: './user-manual-level2.component.html',
  styleUrls: ['./user-manual-level2.component.scss']
})
export class UserManualLevel2Component implements OnInit {
  userManualForm: FormGroup;
  languageList = [];
  languageSelected: LanguageViewModel;
  pdfSrc: any;
 

  constructor(private http: HttpClient, private Service: UserManualService,
    private readonly _eventService: EventAggregatorService,
    private formBuilder: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private dialogService: DialogService,
    private appConfig: AppliConfigService) {
    this.userManualForm = this.formBuilder.group({
      Language: [''],
    });
  }
  loaderId='usermanualLoader';
   loaderPosition=POSITION.centerCenter;
   loaderFgsType=SPINNER.ballSpinClockwise; 
   loaderColor = '#55eb06';

  ngOnInit() {
    this.Service.getLanguages().subscribe(
      language => {
        this.languageList = language;
         this.languageSelected = this.languageList[0];
      });
  }
  languageChanged(event) {
    this.languageSelected = this.languageList[event.target.selectedIndex];
    this._eventService.getEvent(EventConstants.ManageUserManual).publish(this.languageSelected.id);
  }

  downloadUsageReport() {
    this._eventService.getEvent(EventConstants.DownloadUserManualStart).publish('');
    try {
      var languageViewModel = new LanguageViewModel();
      if (this.languageSelected != null) {
        languageViewModel = this.languageSelected;
      }
      else {
        languageViewModel.id = "5cff6ea72bfae13cac0799c5";
      }

        this.http.post(this.appConfig.ApiProjectManagementUrl() + '/api/usermanual/downloadusermanualstream/', languageViewModel, { responseType: 'arraybuffer' })
        .subscribe((file: ArrayBuffer) => {
          this.pdfSrc = new Uint8Array(file);
          this.openPDFDocument();
          this._eventService.getEvent(EventConstants.DownloadUserManualStop).publish('');

        });
    }
    catch{
      this.dialogService.Open(DialogTypes.Warning, "User manual data could not be downloaded. Please try again!");
    }
  }
  onSubmit() {}
  openPDFDocument() {
    try{
    var fileName="UserManual.pdf"
    const blob = new Blob([this.pdfSrc], { type: "application/pdf" });
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {      
      var test=window.navigator.msSaveOrOpenBlob(blob,fileName);
      this.toastr.success(this.translate.instant('User manual Dwnloaded Successfully.'));
      }
    else {
      var a = document.createElement("a");
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      this.toastr.success(this.translate.instant('User manual Dwnloaded Successfully.'));
     }
     // const url = window.URL.createObjectURL(blob);
     // window.open(url);
      
  }
  catch{
    this.dialogService.Open(DialogTypes.Warning, "User manual could not be downloaded. Please try again!");
   }
  }

}
