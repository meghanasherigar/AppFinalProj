import { Component, OnInit, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { UploadScreenService } from '../upload-screen.service';
import { UploadHistoryFilter, UploadHistoryFilterMenuModel } from '../../../../@models/upload-screen';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { DatePipe } from '@angular/common';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { UserUISetting } from '../../../../@models/user';
import { StorageService, StorageKeys } from '../../../../@core/services/storage/storage.service';
import { UserService } from '../../../user/user.service';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-upload-toolbar',
  templateUrl: './upload-toolbar.component.html',
  styleUrls: ['./upload-toolbar.component.scss']
})
export class UploadToolbarComponent implements OnInit,OnDestroy{  
  ddlistUploadedBy: any;
  selectedUploadedBy: [];
  dropdownSettings = {};
  disablebutton:boolean=false;
  userUISetting: UserUISetting;
  @Output() uploadHistory: EventEmitter<any> = new EventEmitter();
  @Output() loadChildComp: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  imageKey: string = 'expand';
  imageName: string = this.translate.instant(this.imageKey);
  constructor(
    private el: ElementRef,
    private translate:TranslateService,
    private shareDetailService: ShareDetailService,
    private ngxLoader: NgxUiLoaderService,
    private fileUploadService: UploadScreenService,
    private readonly _eventService: EventAggregatorService, private datepipe: DatePipe,
    private storageService: StorageService, private userservice: UserService) {
      this.userUISetting = new UserUISetting();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setLocaleMessages();
        });
     }

  // To expand/collapse filters
  public show: boolean = false;
  uploadHistoryFilterModel = new UploadHistoryFilter();


  loaderId='DownloadUploadLoader';
   loaderPosition=POSITION.centerCenter;
   loaderFgsType=SPINNER.ballSpinClockwise; 
   loaderColor = '#55eb06';

  ngOnInit() {
    // this.uploadHistoryFilterModel.projectId = "DigiDox3.0";
    const project = this.shareDetailService.getORganizationDetail();
    this.uploadHistoryFilterModel.projectId = project.projectId;
    this.userUISetting = this.userservice.getCurrentUserUISettings();
    // this.fileUploadService.getUploadFilters("DigiDox3.0").subscribe((data: UploadHistoryFilterMenuModel) => {
      this.fileUploadService.getUploadFilters(project.projectId).subscribe((data: UploadHistoryFilterMenuModel) => {

      this.ddlistUploadedBy = data.uploadedBy;
    })
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown',
    };

    if(this.userUISetting.isMenuExpanded){
      this.toggleCollapse();
   }
   this.subscriptions.add(
    this._eventService.getEvent(EventConstants.ToggleManageFileUpload).subscribe(action=>
      {
        this.disablebutton= (action==='disableButtons');
      })
    );
  }
  onItemSelect(item: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("uploadDate");
    if ((this.selectedUploadedBy == undefined || this.selectedUploadedBy.length <= 0) && datePicker.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }//
    else {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    if (this.selectedUploadedBy != undefined) {
      this.uploadHistoryFilterModel.uploadedBy = new Array();
      this.selectedUploadedBy.forEach((element: never) => {
        this.uploadHistoryFilterModel.uploadedBy.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.FileUploadFilter).publish(this.uploadHistoryFilterModel);
    // this.uploadHistory.emit(this.uploadHistoryFilterModel);
  }
  onSelectAllUploadedBy(items: any) {

    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if (datePicker.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.uploadHistoryFilterModel.uploadedBy = new Array();
    items.forEach((element: never) => {
      this.uploadHistoryFilterModel.uploadedBy.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.FileUploadFilter).publish(this.uploadHistoryFilterModel);
    // this.uploadHistory.emit(this.uploadHistoryFilterModel);
  }
  onDateSelect(item: any, type: any) {
    if (!item) return;
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.remove("disabledbutton");
    clearFilterTag.classList.remove("disable-section");
    var selectedStartDate = item[0];
    var selectedEndDate = this.getEndDateTime(item[1]);
    if (type == 'UploadDate') {
      this.uploadHistoryFilterModel.uploadedOnStart = selectedStartDate;
      this.uploadHistoryFilterModel.uploadedOnEnd = selectedEndDate;
    }
    this._eventService.getEvent(EventConstants.FileUploadFilter).publish(this.uploadHistoryFilterModel);
    // this.uploadHistory.emit(this.uploadHistoryFilterModel);
  }
  clearFilters() {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.add("disabledbutton");
    clearFilterTag.classList.add("disable-section");
    this.selectedUploadedBy = [];
    let datePicker = <HTMLInputElement>document.getElementById("uploadDate");
    datePicker.value = "";
    this.uploadHistoryFilterModel = new UploadHistoryFilter();
    this._eventService.getEvent(EventConstants.FileUploadFilter).publish(this.uploadHistoryFilterModel);
    // this.uploadHistory.emit(this.uploadHistoryFilterModel);

  }
  loadMyChildComponent(action) {
    this._eventService.getEvent(EventConstants.ManageFileUpload).publish(action);
  }
  setLocaleMessages() {
    this.imageName = this.translate.instant(this.imageKey);
  }

  toggleCollapse() {
    this.show = !this.show;
    let transFilterID = this.el.nativeElement.querySelector("#uploadFilters-section");
    // To change the name of image.
    if (this.show) {
      this.userUISetting.isMenuExpanded = true;
      transFilterID.classList.remove('collapsed');
      this.imageKey = 'collapse';
      this.imageName = this.translate.instant(this.imageKey);
    }
    else {
      this.userUISetting.isMenuExpanded = false;
      this.imageKey = 'expand';
      this.imageName = this.translate.instant(this.imageKey);
      // filterIcon.classList.show();
      transFilterID.classList.add('collapsed');
    }
    this.userservice.updateCurrentUserUISettings(this.userUISetting);
  }
  
  downloadFileUpload()
  {
    this._eventService.getEvent(EventConstants.DownloadFileStartUserScreen).publish('');
    const project = this.shareDetailService.getORganizationDetail();
    this.fileUploadService.download_FileUpload(project.projectId)
      .subscribe(data => {
        this.downloadFile(this.convertbase64toArrayBuffer(data.content),data.fileName);
        this._eventService.getEvent(EventConstants.DownloadFileStopUserScreen).publish('');
      }
      ),
      error => {
        this._eventService.getEvent(EventConstants.DownloadFileStopUserScreen).publish('');
        console.log('Error downloading the file.')
      },
      () => console.info('OK');
    return false;
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
  downloadFile(data,fileName) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob,fileName);
    }
    else{
      var a = document.createElement("a");
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
  }
  }
  getEndDateTime(date: any): any
  {
    return moment(date).set({h: 23, m: 59, s: 59}).toDate();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

