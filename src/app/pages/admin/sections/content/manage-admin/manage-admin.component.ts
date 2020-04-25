import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Ng2SmartTableModule, LocalDataSource } from '../../../../../@core/components/ng2-smart-table';
import { ManageAdminService } from '../../../services/manage-admin.service';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { AdminFilterRequestViewModel, AdminUserGridData, AdminUserResponseViewModel, UserDeleteViewModel, UserDownloadViewModel, AdminUserEventPayload } from '../../../../../@models/admin/manageAdmin';
import { DialogTypes, Dialog } from '../../../../../@models/common/dialog';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { ResponseStatus } from '../../../../../@models/ResponseStatus';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
import { CommonDataSource } from '../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { SortEvents } from '../../../../../@models/common/valueconstants';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-manage-admin',
  templateUrl: './manage-admin.component.html',
  styleUrls: ['./manage-admin.component.scss']
})

export class ManageAdminComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  adminUserGridSource: CommonDataSource = new CommonDataSource();
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: { add: false, edit: false, delete: false, select: true },
    filters: false,
    pager: { display: true, perPage: 10 },
    columns: {},
  };
  adminUserGridResponseData: AdminUserResponseViewModel;
  loadAddEditComponent = false;
  enableEditButton = false;
  editAdminUserFlag = false;
  adminFilterRequestViewModel = new AdminFilterRequestViewModel();
  adminUserGridData = new AdminUserGridData();
  private dialogTemplate: Dialog;
  constructor(
    private manageAdminService: ManageAdminService,
    private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private ngxLoader: NgxUiLoaderService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private translate: TranslateService) {
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.adminUserGridSource.refresh();
      }));

      this.setColumnSettings();
  }
  loaderId='ManageAdminLoader';
   loaderPosition=POSITION.centerCenter;
   loaderFgsType=SPINNER.ballSpinClockwise; 
   loaderColor = '#55eb06';

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.manageAdminService.selectedAdminUserRows = [];
    this.adminFilterRequestViewModel.pageIndex = 1;
    this.adminFilterRequestViewModel.pageSize = this.settings.pager.perPage;
    this.getAdminUserData(this.adminFilterRequestViewModel);

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageAdmin).subscribe((payload: AdminUserEventPayload) => {
      switch (payload.Action) {
        case "Add":
        case "Edit":
          this.loadAdminAddEditComponent(payload.Action);
          break;
        case "Cancel":
          this.closeAdminAddEditComponent();
          break;
        case "LoadUsers":
          if (payload.AdminUserFilterModel) {
            payload.AdminUserFilterModel.pageIndex = this.adminFilterRequestViewModel.pageIndex;
            payload.AdminUserFilterModel.pageSize = this.adminFilterRequestViewModel.pageSize;
          }
          var filterModel = !payload.AdminUserFilterModel ? this.adminFilterRequestViewModel : payload.AdminUserFilterModel;
          this.adminFilterRequestViewModel = filterModel;
          this.getAdminUserData(filterModel);
          break;
        case "Delete":
          this.openDeleteConfirmDialog();
          break;
        case "Download":
          this.downloadAdminUsers();
          break;
      }
    }));

    this.adminUserGridSource.onChanged().subscribe((change) => {
      if (change.action === 'page' || change.action === 'paging') {
        this.manageAdminService.selectedAdminUserRows = [];
        var payload = new AdminUserEventPayload();
        payload.Action = "LoadUsers";
        payload.AdminUserFilterModel = this.adminFilterRequestViewModel;
        payload.AdminUserFilterModel.pageIndex = change.paging.page;
        payload.AdminUserFilterModel.pageSize = change.paging.perPage;
        this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageAdmin).publish(payload));
      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.adminFilterRequestViewModel.sortDirection=  change.sort[0].direction.toUpperCase();
        this.adminFilterRequestViewModel.sortColumn=  change.sort[0].field;
        this.getAdminUserData(this.adminFilterRequestViewModel);
      }
    });
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      Name: {
        title: this.translate.instant('screens.admin.tableHeaders.Name'),
        filter: false,
        width: '14%',
      },
      Email: {
        title: this.translate.instant('screens.admin.tableHeaders.Email'),
        filter: false,
        width: '14%',
      },
      Role: {
        title: this.translate.instant('screens.admin.tableHeaders.Role'),
        filter: false,
        width: '14%',
        type: 'html',
    },
      Country: {
        title: this.translate.instant('screens.admin.tableHeaders.Country'),
        filter: false,
        width: '14%',
      },
      CreatedBy: {
        title: this.translate.instant('screens.admin.tableHeaders.createdByName'),
        filter: false,
        width: '14%',
      },
      CreatedOn: {
        title: this.translate.instant('screens.admin.tableHeaders.createdOn'),
        filter: false,
        width: '14%',
        type: 'date',
        valuePrepareFunction: (date) => {
        if (date) {
          return moment(date).local().format('DD MMM YYYY');
        }
          return null;
        },
      },
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  getAdminUserData(filterData: any) {
    this.subscriptions.add(this.manageAdminService.getAdminUserData(filterData)
      .subscribe(
        response => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.adminUserGridResponseData = response;
          this.loadAdminUserGrid(this.adminUserGridResponseData);
          this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageAdminFilter).publish(undefined));
          },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

  loadAdminAddEditComponent(action) {
    switch (action) {
      case "Add":
        this.editAdminUserFlag = false;
        this.loadAddEditComponent = true;
        break;
      case "Edit":
        this.editAdminUserFlag = true;
        this.loadAddEditComponent = true;
        break;
    }
  }

  closeAdminAddEditComponent() {
    this.loadAddEditComponent = false;
    this.editAdminUserFlag = false;
  }

  loadAdminUserGrid(data: AdminUserResponseViewModel) {
    let userGridList: AdminUserGridData[] = [];
    data.userList.forEach(element => {
      this.adminUserGridData = new AdminUserGridData();
      this.adminUserGridData.Id = element.id;
      this.adminUserGridData.Name = element.fullName;
      this.adminUserGridData.Email = element.email;
      this.adminUserGridData.Role = '';
      this.adminUserGridData.Role += element.roles.isGlobalAdmin == true ? 'Global Administrator' : '';
      this.adminUserGridData.Role += element.roles.isCountryAdmin == true ?
       (element.roles.isGlobalAdmin == true ? '<br/>' : '') + 'Country Administrator' : '';
      this.adminUserGridData.Country = element.country ? element.country.countryName : '';
      this.adminUserGridData.CreatedBy = element.auditTrial.createdByName;
      this.adminUserGridData.CreatedOn = element.auditTrial.createdOn;
      userGridList.push(this.adminUserGridData);
      this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish(undefined);
    });
    this.adminUserGridSource.totalCount = data.totalUsersCount;
    this.adminUserGridSource.load(userGridList);
  }

  onAdminUserRowSelect(event) {
    this.manageAdminService.selectedAdminUserRows = event.selected;
    this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish(undefined);
  }

  openDeleteConfirmDialog(): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.manage-admin.labels.deleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteAdminUsers();
      }
    });
  }

  deleteAdminUsers() {
    if (!this.manageAdminService.selectedAdminUserRows && this.manageAdminService.selectedAdminUserRows.length > 0) {
      this.dialogService.Open(DialogTypes.Warning,this.translate.instant('screens.manage-admin.labels.selectAdminUser'));
    }

    let userDeleteViewModel = new UserDeleteViewModel();
    this.manageAdminService.selectedAdminUserRows.forEach(item => {
      userDeleteViewModel.UserIds.push(item.Id);
    });

    this.subscriptions.add(this.manageAdminService.deleteAdminUsers(userDeleteViewModel)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.manage-admin.labels.adminDeletedSuccesfully'));
          
            this.getAdminUserData(this.adminFilterRequestViewModel);
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.manageAdminService.selectedAdminUserRows = [];
          this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish(undefined);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

  downloadAdminUsers() {

    if (this.manageAdminService.selectedAdminUserRows && this.manageAdminService.selectedAdminUserRows.length > 0) {
      this.adminFilterRequestViewModel.UserIds = [];
      this.manageAdminService.selectedAdminUserRows.forEach(item => {
        this.adminFilterRequestViewModel.UserIds.push(item.Id);
      });
    }
    else {
      this.adminFilterRequestViewModel.pageIndex = 1;
    }

    this.subscriptions.add(this.manageAdminService.downloadAdminUsers(this.adminFilterRequestViewModel)
      .subscribe(
        data => {
          this.downloadAdminUserDataFile(this.convertbase64toArrayBuffer(data.content),data.fileName);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
    this.adminFilterRequestViewModel.UserIds = [];
    this.manageAdminService.selectedAdminUserRows = [];
    this.adminUserGridSource.refresh();
    this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish(undefined);
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
  private downloadAdminUserDataFile(data,fileName) {
    try {
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

    }
    catch{
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.manage-admin.labels.adminDownloadErrorMessage'));
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
