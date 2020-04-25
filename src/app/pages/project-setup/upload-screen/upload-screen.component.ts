import { Component, OnInit, Input, Output, EventEmitter,ElementRef, OnDestroy} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadScreenService } from '../upload-screen/upload-screen.service'
import { Upload, UploadHistory, UploadHistoryFilter, UploadHistoryResponseViewModel } from '../../../@models/upload-screen';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { AlertService } from '../../../shared/services/alert.service';
import { LocalDataSource, ViewCell } from '../../../@core/components/ng2-smart-table';
import { Subscription } from 'rxjs';
import 'rxjs/Rx';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { EventConstants } from '../../../@models/common/eventConstants';
import { debug } from 'util';
import { $$iterator } from 'rxjs/internal/symbol/iterator';
import { DialogTypes } from '../../../@models/common/dialog';
import { DialogService } from '../../../shared/services/dialog.service';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SortEvents } from '../../../@models/common/valueconstants';
import { ToastrService } from 'ngx-toastr';

declare var $: any;
// <a href (click)="onClick()">{{ renderValue }}</a>
@Component({
  selector: 'button-view',
  template: `
    <img src="assets/images/UploadExcel.png"  class="btn" style="cursor:pointer;padding-left:0" (click)="onClick()" placement="right" ngbTooltip="{{renderValue}}">
  `,
})
export class ButtonViewComponent implements ViewCell, OnInit,OnDestroy {
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  renderValue: string;
  @Input() value: string | number;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  constructor(private fileUploadService: UploadScreenService, private translate: TranslateService, private toastr: ToastrService,private readonly _eventService: EventAggregatorService, private dialogService: DialogService) { }
  ngOnInit() {
    this.renderValue = this.value.toString().toUpperCase();

    this._eventService.getEvent(EventConstants.ManageFileUpload).publish("EditDeleteFalse");
  }
  downloadFile(data) {
    try {
      var fileName=this.rowData.fileName;
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob,fileName);
      }
      else {
        var a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
      }
      this.toastr.success(this.translate.instant('Entities and Transactions Downloaded Successfully.'));
    }
    catch{
      this.dialogService.Open(DialogTypes.Warning, "Entities and Transactions data could not be downloaded. Please try again!");
    }
  }

  onClick() {
    this._eventService.getEvent(EventConstants.DownloadFileStart).publish('');
    this.fileUploadService.getFile(this.rowData.fileName)
      .subscribe(data => {

        this.downloadFile(data);
        this._eventService.getEvent(EventConstants.DownloadFileStop).publish('');;
      }
      ),
      error => {
        this._eventService.getEvent(EventConstants.DownloadFileStop).publish('');;
        this.dialogService.Open(DialogTypes.Error, "Error Occured");
      },
      () => console.info('OK');
    return false;
  }
}

@Component({
  selector: 'ngx-upload-screen',
  templateUrl: './upload-screen.component.html',
  styleUrls: ['./upload-screen.component.scss']
})
export class UploadScreenComponent implements OnInit, OnDestroy {
  loadComponent = false;
  enableUpload: boolean = false;
  disableUpload=false;
  uploadHistoryFilterModel = new UploadHistoryFilter();
  profileForm: FormGroup;
  error: string;
  upload: UploadHistory[];
  fileUpload: any;
  _sortColumn:string;
  _sortDirection:string;
  selectedfile: any;
  source: LocalDataSource = new LocalDataSource();
  settings = {
    hideSubHeader: true,
    actions: { add: false, edit: false, delete: false, select: true },
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
  };

//ngx-ui-loader configuration
loaderId='UserScreenLoader';
loaderPosition=POSITION.centerCenter;
loaderFgsType=SPINNER.ballSpinClockwise; 
loaderColor = '#55eb06';



  subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder,private ngxLoader: NgxUiLoaderService,    private translate: TranslateService,
    private toastr: ToastrService,private fileUploadService: UploadScreenService, private alertService: AlertService, private dialogService: DialogService,
    private readonly _eventService: EventAggregatorService, private shareDetailService: ShareDetailService) {
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.source.refresh();
      }));

      this.setColumnSettings();
  }
  submitted = false;
  fileNamePattern = '^.*\.(xls|xlsx)$';
  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.alertService.clear();
    this.profileForm = this.fb.group({
      name: [''],
      profile: ['', Validators.required]
    });
    this.uploadHistoryFilterModel.pageIndex = 1;
    this.uploadHistoryFilterModel.pageSize = this.settings.pager.perPage;
    
    this.getUploadHistory(this.uploadHistoryFilterModel);

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageFileUpload).subscribe((payload) => {
         if(payload!="EditDeleteFalse")
      this.loadMyChildComponent(payload);
     
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }));
 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.FileUploadFilter).subscribe((payload: UploadHistoryFilter) => {
      //updating the filter model for server pagination when any filter applied -- starts
      payload.pageIndex = this.uploadHistoryFilterModel.pageIndex;
      payload.pageSize = this.uploadHistoryFilterModel.pageSize;
      this.uploadHistoryFilterModel = payload;
      this.getUploadHistory(payload);
      //updating the filter model for server pagination when any filter applied -- ends
      //Stop loader
 
    }));
  
  this.subscriptions.add(this._eventService.getEvent(EventConstants.DownloadFileStart).subscribe(payload=>
    {
        this.ngxLoader.startLoader(this.loaderId);
    }));
        this.subscriptions.add(this._eventService.getEvent(EventConstants.DownloadFileStop).subscribe(payload=>
      {
          this.ngxLoader.stopLoaderAll(this.loaderId);
      }));
          this.subscriptions.add(this._eventService.getEvent(EventConstants.DownloadFileStartUserScreen).subscribe(payload=>
        {
            this.ngxLoader.startLoader(this.loaderId);
        }));
            this.subscriptions.add(this._eventService.getEvent(EventConstants.DownloadFileStopUserScreen).subscribe(payload=>
          {
             this.ngxLoader.stopLoaderAll(this.loaderId);
          }));


       
    this.source.onChanged().subscribe((change) => {
      //block for server side pagination -- starts
      if (change.action === 'page' || change.action === 'paging') {
        this.uploadHistoryFilterModel.pageIndex = change.paging.page;
        this.uploadHistoryFilterModel.pageSize = change.paging.perPage;
        this.getUploadHistory(this.uploadHistoryFilterModel);
      }
      //block for server side pagination -- ends
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.uploadHistoryFilterModel.sortDirection=  change.sort[0].direction.toUpperCase();
        this.uploadHistoryFilterModel.sortColumn=  change.sort[0].field;
        this.getUploadHistory(this.uploadHistoryFilterModel);
      }
    });
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      fileName: {
        title: this.translate.instant('FileName'),
        type: 'custom',
        renderComponent: ButtonViewComponent,
        onComponentInitFunction(instance) {

          instance.save.subscribe(row => {
          });
        }
      },
      uploadedBy: {
        title: this.translate.instant('UploadedBy'),
        filter: false,
        type: 'html',
        valuePrepareFunction: (cell, row) => {
            return '<p class="main-text">' + row.uploadedBy + '<br/><span class=" uploademailColor">' +
            row.uploadedByEmail + '</span></p>';
        }
      },
      uploadedOn: {
        title: this.translate.instant('UploadedOn'),
        type: 'date',
        valuePrepareFunction: (date) => {
        if (date) {
          return moment(date).local().format("DD MMM YYYY");
        }
          return "";
        },
      },
      noOfEntitiesCreated: {
        title: this.translate.instant('EntitiesCreated'),

      },
      noOfEntitiesEdited: {
        title: this.translate.instant('EntitiesEdited'),

      },
      noOfEntitiesDeleted: {
        title: this.translate.instant('EntitiesDeleted'),

      },
      noOfEntitiesError: {
        title: this.translate.instant('EntitiesErrors'),
      },
      noOfTransactionsCreated: {
        title: this.translate.instant('TransactionsCreated'),
      },
      noOfTransactionsEdited: {
        title: this.translate.instant('TransactionsEdited'),

      },
      noOfTransactionsDeleted: {
        title: this.translate.instant('TransactionsDeleted'),
      },
      noOfTransactionsError: {
        title: this.translate.instant('TransactionsErrors'),
      }
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  downloadFile(data: string) {

    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }
  get form() { return this.profileForm.controls; }
  onSelectedFile(event) {

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      document.getElementById("fileName").innerText = file.name;
      this.selectedfile = file;
      this.enableUpload = true;
      this.disableUpload=false;
      this.profileForm.get('profile').setValue("");
    }
  }
cancelupload(){
  this.enableUpload = false;
  this.profileForm.setValue({name: '', profile: ''});
  this.selectedfile=null;
  document.getElementById("fileName").innerText="";
 }
  getUploadHistory(modelData) {

    // modelData.projectId = "DigiDox3.0";
    const project = this.shareDetailService.getORganizationDetail();
    modelData.projectId = project.projectId;
    this.fileUploadService
      .getUploadHistory(modelData)
      .subscribe((data: UploadHistoryResponseViewModel) => {
        this.source.load(data.uploadHistoryData);
        this.source.totalCount = data.totalCount;
        this.ngxLoader.stopLoaderAll(this.loaderId);
      });
  }
  onSubmit() {
    //Start loader
    this.disableUpload=true;
    this.submitted = true;
    // if (this.profileForm.invalid) {
    //   return;
    // }
    const formData = new FormData();
    // formData.append('projectId', 'DigiDox3.0');
    const project = this.shareDetailService.getORganizationDetail();
    formData.append('projectId', project.projectId);
    formData.append('file', this.selectedfile, this.selectedfile.name);

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this._eventService.getEvent(EventConstants.ToggleManageFileUpload).publish('disableButtons');

    this.fileUploadService.upload(formData).subscribe(
      response => {
        this._eventService.getEvent(EventConstants.ToggleManageFileUpload).publish('enableButtons');
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        if (response.status === ResponseStatus.Sucess) {
          this.toastr.success(this.translate.instant('screens.project-setup.file-upload.FileUploadSuccess'));
          this.loadComponent = false;
          this.enableUpload=false;
          document.getElementById("fileName").innerText="";
          this.getUploadHistory(this.uploadHistoryFilterModel);
          this.profileForm.get('profile').reset()
          // window.location.reload();
        } else {
          this.disableUpload=false;
          //this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          this.toastr.warning(response.errorMessages[0]);
        }
      },
      error => {
        this.disableUpload=false;
        this.dialogService.Open(DialogTypes.Error, "Error Occured");
        // this.toastr.danger(this.translate.instant('screens.home.labels.errorMessage'));	
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
     
  }

  loadMyChildComponent(action) {
    //this.uploadDiv.nativeElement.click();
    var element:HTMLElement=document.getElementById("profile") as HTMLElement;
    element.click(); 
    //if (this.loadComponent)
      //this.loadComponent = false;
    //else
      //this.loadComponent = true;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
