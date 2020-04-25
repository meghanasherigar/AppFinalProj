import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { AppendixService } from '../../../../services/appendix.service';
import { LocalDataSource, ViewCell } from '../../../../../../@core/components/ng2-smart-table';
import * as moment from 'moment';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { GetAppendixViewModel, AppendixDownloadRequestViewModel, AppendixDeleteViewModel, ActionOnAppendix, UpdateAppendixModel } from '../../../../../../@models/projectDesigner/appendix';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CustomHTML } from '../../../../../../shared/services/custom-html.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { SortEvents } from '../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';





@Component({
  selector: 'ngx-manage-appendices',
  templateUrl: './manage-appendices.component.html',
  styleUrls: ['./manage-appendices.component.scss']
})
export class ManageAppendicesComponent implements OnInit, OnDestroy {

  source: CommonDataSource = new CommonDataSource();
  data: any;
  subscriptions: Subscription = new Subscription();
  downloadAppendicesFiles: AppendixDownloadRequestViewModel[] = [];
  appendixDeleteViewModel = new AppendixDeleteViewModel();
  associatedDeliverableData: string[] = [];
  appendixNoDataFound: boolean = false;
  editappendicesTitle =this.translate.instant('screens.project-setup.transaction.transaction-toolbar.Edit');
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      columnTitle: '',
      edit: true,
      class: 'testclass',
      delete: false,
      position: 'right'
    },
    filters: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
    edit: {
      editButtonContent: `<img src="assets/images/projectdesigner/header/Edit_without hover.svg" class="smallIcon-template" title="${this.editappendicesTitle}">`,
      saveButtonContent: '<i class="ion-checkmark smallIcon"></i>',
      cancelButtonContent: '<i class="ion-close smallIcon"></i>',
      confirmSave: true
    },
    mode: 'inline'
  };

  loaderId = 'Appendicesloader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  _pageSize: any;
  _pageIndex: any;
  _sortDirection: any;
  _sortColumn: any;

  constructor(private sharedService: ShareDetailService,
    private appendixService: AppendixService,
    private _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService) {
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.source.refresh();
      }));

      this.setColumnSettings();
    }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.getAllAppendices();

    this.source.onChanged().subscribe((change) => {
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this._sortDirection=  change.sort[0].direction.toUpperCase();
        this._sortColumn=  change.sort[0].field;
        this.getAllAppendices();
      }
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.loadAppendix).subscribe((payload) => {
      switch (payload) {
        case ActionOnAppendix.download:
          this.ngxLoader.startLoader(this.loaderId);
          this.downloadAppendices();
          break;
        case ActionOnAppendix.delete:
          this.ngxLoader.startLoader(this.loaderId);
          this.deleteAppendices();
          break;
        default:
          this.getAllAppendices();
          break;
      }
    }));

  }
  customAction(item: any) {}
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      appendixName: {
        title: this.translate.instant('AppendixName'),
        editable: true,
      },
      fileName: {
        title: this.translate.instant('FileName'),
        editable: false,
      },
      comment: {
        title: this.translate.instant('Comment'),
        editable: true,
      },
      associatedDeliverable: {
        title: this.translate.instant('AssociatedTo'),
        editable: false,
        type: 'custom',
        renderComponent: DeliverableDataComponent,
      },
      uploadedBy: {
        title: this.translate.instant('UploadedBy'),
        editable: false,
      },
      uploadedOn: {
        title: this.translate.instant('UploadedOn'),
        editable: false,
      }
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  getAllAppendices() {
    let projectDetails = this.sharedService.getORganizationDetail();

    var request: GetAppendixViewModel = new GetAppendixViewModel;
    request.projectId = projectDetails.projectId;
    request.sortColumn=this._sortColumn;
    request.sortDirection=this._sortDirection;
    request.pageIndex = 1;
    request.pageSize = 100;
    this.appendixService.getAllAppendicesList(request)
      .subscribe((data: any) => {

        data = data.appendixList;
        data.forEach(item => {
          item.associatedDeliverable = item.associatedTo.length;
          item.uploadedBy = item.auditTrail.createdBy.firstName + ' ' + item.auditTrail.createdBy.lastName;
          item.uploadedOn = moment(item.auditTrail.createdOn).local().format("DD MMM YYYY"); //non-editable field,directly assigned to table value
        })
        this.source.load(data);
        if (data.length == 0)
          this.appendixNoDataFound = true;
        else
          this.appendixNoDataFound = false;

        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      })
      , (error => {
        console.error(error);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.enableIcon).publish([]);
    this.appendixDeleteViewModel.ProjectId = projectDetails.projectId;

  }
  onAppendixRowSelect(event) {

    this.downloadAppendicesFiles = [];
    this.appendixDeleteViewModel.AppendixIds = [];
    this.appendixService.SelectedAppendicesIds = [];
    if (event.selected) {
      event.selected.forEach(history => {
        let appendicesFile = new AppendixDownloadRequestViewModel;
        appendicesFile.fileName = history.fileName;
        appendicesFile.uniqueFileName = history.uniqueFileName;
        this.downloadAppendicesFiles.push(appendicesFile);
        this.appendixDeleteViewModel.AppendixIds.push(history.id);
        this.appendixService.SelectedAppendixId = history.id;
        this.appendixService.selectedDeliverableData = history.associatedTo;
        this.appendixService.SelectedBlockId = history.blockId;
        this.appendixService.SelectedAppendicesIds.push(history.id);
      })
    }
    this.appendixService.SelectedAppendixCount = this.appendixDeleteViewModel.AppendixIds.length;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.enableIcon).publish(event.selected);
  }

  downloadAppendices() {
    this.ngxLoader.startBackground(this.loaderId);
    this.subscriptions.add(this.appendixService.downloadReport(this.downloadAppendicesFiles).subscribe(data => {
      this.downloadFile(this.convertbase64toArrayBuffer(data.content), data.fileName);
      this.ngxLoader.stopLoader(this.loaderId);
    },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
        this.ngxLoader.stopLoader(this.loaderId);
      }));

  }

  convertbase64toArrayBuffer(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  downloadFile(data: any, fileName: string) {
    try {
      const blob = new Blob([data], { type: '.pdf, .doc, .docx, .jpeg, .jpg, .png, .zip' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      }
      else {
        var fileElement = document.createElement("a");
        document.body.appendChild(fileElement);
        const url = window.URL.createObjectURL(blob);
        fileElement.href = url;
        fileElement.download = fileName;
        fileElement.click();
      }
    }
    catch{
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-designer.appendix.messages.AppendixDownloadErrorMessage'));
    }
  }

  deleteAppendices() {
    this.appendixDeleteViewModel.blockId = this.appendixService.SelectedBlockId;

    this.subscriptions.add(this.appendixService.deleteAppendices(this.appendixDeleteViewModel)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-designer.appendix.messages.DeleteSuccessMessage'));
           // this.dialogService.Open(DialogTypes.Success, this.translate.instant('screens.project-designer.appendix.messages.DeleteSuccessMessage'));
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.loadAppendix).publish(undefined);
            this.getAllAppendices();
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.ngxLoader.stopLoader(this.loaderId);
        },
        error => {
          this.ngxLoader.stopLoader(this.loaderId);
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }
  onEditSave(event) {
    let updatedAppendix = new UpdateAppendixModel();
    updatedAppendix.projectId = event.newData.projectId;
    updatedAppendix.AppendixId = event.newData.id;
    updatedAppendix.AppendixName = event.newData.appendixName;
    updatedAppendix.Comment = event.newData.comment;
    updatedAppendix.blockId = event.newData.blockId;

    this.appendixService.UpdateAppendix(updatedAppendix)
      .subscribe((data: any) => {
        if (data.status === ResponseStatus.Sucess) {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.appendixSection.loadAppendix).publish(undefined);
          this.toastr.success(this.translate.instant('screens.project-designer.appendix.messages.UpdateSuccessMessage'));
         
        }
        else if (data.status === ResponseStatus.Failure) {
          this.dialogService.Open(DialogTypes.Error, data.errorMessages[0]);
        }
      });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

@Component({
  selector: 'button-view',
  template: `
  <ng-template #pop>
  <div *ngIf="row.associatedTo">
  <div *ngFor="let deliverable of associatedDeliverabelData">
   <div class="deliverableName" title="{{deliverable.deliverableData}}"> {{deliverable}} </div>
  </div>
  </div>
  <div *ngIf="row.associatedDeliverables">
  <div *ngFor="let deliverable of associatedDeliverabelData">
   <div class="deliverableName" title="{{deliverable}}"> {{deliverable}}</div> 
  </div>
  </div>
  </ng-template>
  <div class="Manageappendices">
  <div [ngbPopover]="pop" placement="right">
  {{deliverableCount}}
</div>
</div>`
})

export class DeliverableDataComponent implements ViewCell, OnInit {
  row: any;
  public orderDetials: any;
  constructor(private customHTML: CustomHTML) { }

  @Input() rowData: any;
  @Input() value: string | number;
  selectedRow: any;
  isViewMore: boolean;
  isShowHidden = false;
  associatedDeliverabelData: any = [];
  associatedDeliverable: string;

  deliverableCount;

  ngOnInit() {
    this.associatedDeliverabelData = [];
    this.isViewMore = true;
    this.row = this.rowData;

    if (this.row.associatedDeliverables)
    {
      this.row.associatedDeliverables.forEach(ele => {
        ele.deliverableData = ele.entityName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
        this.associatedDeliverabelData.push(ele.deliverableData);
        this.deliverableCount=this.row.deliverablesAssociated;
      });
    }
    //Existing data
    if(this.row.associatedTo)
    {
      this.row.associatedTo.forEach(ele => {
        ele.deliverableData = ele.deliverableName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
        this.associatedDeliverabelData.push(ele.deliverableData);
        this.deliverableCount=this.row.associatedDeliverable;
      });

       // // this.associatedDeliverabelData.toString().split(",").join("");
    this.associatedDeliverable = this.associatedDeliverabelData.toString();
    this.associatedDeliverable = this.associatedDeliverable.split(",").join('');
    }
    
   


    //this.isShowHidden = (this.homeService.viewHiddenOrgOrProjects == true) || (this.row.isVisible ? false : true);
  }
}
