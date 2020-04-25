import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppUsersService } from '../../../services/app-users.service';
import { Subscription } from 'rxjs';
import { Ng2SmartTableModule, LocalDataSource } from '../../../../../@core/components/ng2-smart-table';
import { AppUserResponseViewModel, AppUserFilterRequestModel, AppUserGridDataModel, ActionOnAppUsers, ActionOnAppUsersGrid, AppUserSearchOption, SearchAppUserFormControls } from '../../../../../@models/super-admin/appUsers';
import * as moment from 'moment';
import { Dialog, DialogTypes } from '../../../../../@models/common/dialog';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ResponseStatus } from '../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { CommonDataSource } from '../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { downloadFile } from '../../../../project-management/@models/common/common-helper';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';


@Component({
  selector: 'ngx-app-users',
  templateUrl: './app-users.component.html',
  styleUrls: ['./app-users.component.scss']
})

export class AppUsersComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  dialogTemplate: any;
  appUserGridSource: LocalDataSource = new LocalDataSource(); 
  appUserGridResponseData: AppUserResponseViewModel;
  appUserFilterRequestViewModel = new AppUserFilterRequestModel();
  appUserGridData = new AppUserGridDataModel();
  dialogRef: MatDialogRef<ConfirmationDialogComponent, any>;
  loadAddAppUserComponent = false;
  loadUploadAppUserComponent = false;
  searchOptionList = [];
  searchAppUserForm: FormGroup;
  selectedSearchOption: AppUserSearchOption.email;
  appUserSearchKeyword: string = '';
  settings = {
    hideSubHeader: true,
    actions: {
      add: false,
      edit: true,
      delete: true,
      select: true,
      position: 'right',
      class: 'testclass',
     },
    filters: false,
    noDataMessage: this.translateService.instant('NoAppUserFound.'),
    pager: {
      display: true,
      perPage: 10,
    },
    edit: {
      editButtonContent: '<img src="assets/images/projectdesigner/header/Edit_without hover.svg" class="smallIcon-template">',
      saveButtonContent: '<i class="ion-checkmark smallIcon"></i>',
      cancelButtonContent: '<i class="ion-close smallIcon"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true,
    },
    columns: {
      FirstName: {
        title: this.translateService.instant('screens.superAdmin.appusertable.First Name'),
        filter: true,
        width: '8%',
        editable: false,
      },
      LastName: {
        title: this.translateService.instant('screens.superAdmin.appusertable.Last Name'),
        filter: true,
        width: '8%',
        editable: false,
      },
      Email: {
        title: this.translateService.instant('screens.superAdmin.appusertable.Email'),
        filter: true,
        width: '8%',
        editable: false,
      },
      CountryCode: {
        title: this.translateService.instant('screens.superAdmin.appusertable.Country Code'),
        filter: true,
        width: '8%',
        editable: false,
      },
      OrganizationName: {
        title: this.translateService.instant('screens.superAdmin.appusertable.Organization Name'),
        filter: true,
        width: '8%',
        editable: false,
      },
      IsExternalUser: {
        title: this.translateService.instant('screens.superAdmin.appusertable.External User'),
        filter: true,
        width: '8%',
        editable: false,
      },
      HasAppAccess: {
        title: this.translateService.instant('screens.superAdmin.appusertable.App Access'),
        filter: true,
        width: '8%',
        type: 'html',
        valuePrepareFunction: (cell, row) => { return '<p class="main-text">' + row.HasAppAccess + '</p>'; },
        editor: {
          type: 'list',
          config: {
            selectText: 'Select one',
            list: [{ value: true, title: 'Yes'}, {value: false, title: 'No'}],
            },
          },
      },
      CreatedBy: {
        title: this.translateService.instant('screens.superAdmin.appusertable.Created By'),
        filter: true,
        width: '8%',
        editable: false,
      },
      CreatedOn: {
        title: this.translateService.instant('screens.superAdmin.appusertable.Created On'),
        filter: true,
        width: '8%',
        editable: false,
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          if (row.CreatedOn != null) {
            return '<p class="main-text">' + moment(row.CreatedOn).local().format("DD MMM YYYY") + '<br/>' +
            moment(row.CreatedOn).local().format("hh:mm:a") + '</p>';
          }
        },
      },
      UpdatedBy: {
        title: this.translateService.instant('screens.superAdmin.appusertable.Updated By'),
        filter: true,
        width : '8%',
        editable: false,
      },
      UpdatedOn: {
        title: this.translateService.instant('screens.superAdmin.appusertable.Updated On'),
        filter: true,
        width: '8%',
        editable: false,
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          if(row.UpdatedOn != null) {
            return '<p class="main-text">' + moment(row.UpdatedOn).local().format("DD MMM YYYY") + '<br/>' +
            moment(row.UpdatedOn).local().format("hh:mm a") + '</p>';
          }
        },
      },
    },
  };

  loaderId = 'ManageUserLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  constructor(
    private appUsersService: AppUsersService,
    private dialogService: MatDialog,
    private toastrService: ToastrService,
    private simpleDialogService: DialogService,
    private translateService: TranslateService,
    private eventService: EventAggregatorService,
    private formBuilder: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
  ) {

    this.searchOptionList.push(this.translateService.instant('screens.superAdmin.searchAppUser.labels.email'));
    this.searchOptionList.push(this.translateService.instant('screens.superAdmin.searchAppUser.labels.firstName'));
    this.searchOptionList.push(this.translateService.instant('screens.superAdmin.searchAppUser.labels.lastName'));

    this.searchAppUserForm = this.formBuilder.group({
      SearchAppUserKeyword: ['', [Validators.required]],
      SearchOptionType: ['']
    });

    this.searchAppUserForm.controls["SearchOptionType"].setValue(this.translateService.instant('screens.superAdmin.searchAppUser.labels.email'));
   }

  ngOnInit() {
    this.appUserFilterRequestViewModel.PageIndex = 1;
    this.appUserFilterRequestViewModel.PageSize = this.settings.pager.perPage;
    this.getAppUsersData(this.appUserFilterRequestViewModel);

    this.subscriptions.add(this.eventService.getEvent(eventConstantsEnum.superAdmin.appUsers.addAppUser).subscribe((action) => {
      switch (action) {
        case ActionOnAppUsers.add:
          this.showAddAppUserComponent();
          break;
        case ActionOnAppUsers.load:
          this.loadAppUsers();
          break;
        case ActionOnAppUsers.addSuccessful:
          this.hideAddAppUserComponent();
          this.loadAppUsers();
          break;
        case ActionOnAppUsers.cancelAddUser:
          this.hideAddAppUserComponent();
          break;
        case ActionOnAppUsers.upload:
          this.showUploadAppUserComponent();
          break;
        case ActionOnAppUsers.downloadTemplate:
          this.getAppUserTemplate();
          break;
      }
    }));

    this.appUserGridSource.onChanged().subscribe((change) => {
      if ( change.action === ActionOnAppUsersGrid.page || change.action === ActionOnAppUsersGrid.paging) {
        this.appUsersService.selectedAppUserRows = [];
        this.appUserFilterRequestViewModel.PageIndex = change.paging.page;
        this.appUserFilterRequestViewModel.PageSize = change.paging.perPage;
        this.getAppUsersData(this.appUserFilterRequestViewModel);
      }
    });
  }

  getAppUsersData(filterData: AppUserFilterRequestModel) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.subscriptions.add(this.appUsersService.getAppUsersData(filterData)
    .subscribe(
      response => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.appUserGridResponseData = response;
        this.loadAppUsersGrid(this.appUserGridResponseData);
      },
      error =>{
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.simpleDialogService.Open(DialogTypes.Error, (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 
        this.translateService.instant('screens.commonLabel.serverError'));
        },
      ),
    );
  }

  loadAppUsersGrid(appUsersData: AppUserResponseViewModel) {
    let appUsersGridRows: AppUserGridDataModel[] = [];
    appUsersData.appUsers.forEach(element => {
      this.appUserGridData = new AppUserGridDataModel();
      this.appUserGridData.Id = element.id;
      this.appUserGridData.FirstName = element.firstName;
      this.appUserGridData.LastName = element.lastName;
      this.appUserGridData.Email = element.email;
      this.appUserGridData.CountryCode = element.countryCode;
      this.appUserGridData.OrganizationName = element.organizationName;
      this.appUserGridData.IsExternalUser = element.isExternalUser ? this.translateService.instant('screens.project-setting.Yes') : this.translateService.instant('screens.project-setting.No');
      this.appUserGridData.HasAppAccess = element.hasAppAccess ? this.translateService.instant('screens.project-setting.Yes') : this.translateService.instant('screens.project-setting.No');
      this.appUserGridData.CreatedBy = element.auditTrail.createdBy.firstName + ' ' + element.auditTrail.createdBy.lastName;
      this.appUserGridData.CreatedOn = element.auditTrail.createdOn;
      this.appUserGridData.UpdatedBy = element.auditTrail.updatedBy.firstName + ' ' + element.auditTrail.updatedBy.lastName;
      this.appUserGridData.UpdatedOn = element.auditTrail.updatedOn;
      appUsersGridRows.push(this.appUserGridData);
    });
    this.appUserGridSource.totalCount = appUsersData.appUsersCount;
    this.appUserGridSource.load(appUsersGridRows);
  }

  onAppUserRowSelect(event)  {
    this.appUsersService.selectedAppUserRows = event.selected;
  }

  onSaveConfirmAppUser(event) {
    const appUserId = new Array(event.newData.Id);

    if (JSON.parse(event.newData.HasAppAccess)) {
      this.grantAppAccess(appUserId);
    } else {
      this.removeAppAccess(appUserId);
    }
  }

  onDeleteConfirmAppUser(event)  {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translateService.instant('screens.superAdmin.appUsers.deleteConfimation');
    if (this.dialogService.openDialogs.length === 0) {
      this.dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
        data: this.dialogTemplate,
      });

      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteAppUser(new Array(event.data.Email));
        } else {
          this.dialogRef.close();
        }
        this.dialogRef = null;
      });
    }
  }

  deleteAppUser(appUsersId: string[])  {
    this.subscriptions.add(
      this.appUsersService.deleteAppUsers(appUsersId)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastrService.success(this.translateService.instant('screens.superAdmin.appUsers.deleteSuccessful'));
          } else {
            this.simpleDialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.getAppUsersData(this.appUserFilterRequestViewModel);
        },
        error => {
          this.simpleDialogService.Open(DialogTypes.Error, (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 
          this.translateService.instant('screens.commonLabel.serverError'));        },
      ),
    );
  }

  removeAppAccess(appUsersId: string[]) {
    this.subscriptions.add(
      this.appUsersService.removeAppAccess(appUsersId)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastrService.success(this.translateService.instant('screens.superAdmin.appUsers.removeAppAccessSuccessful'));
          } else {
            this.simpleDialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.getAppUsersData(this.appUserFilterRequestViewModel);
        },
        error => {
          this.simpleDialogService.Open(DialogTypes.Error, (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 
          this.translateService.instant('screens.commonLabel.serverError'));
        },
      ),
    );
  }

  grantAppAccess(appUsersId: string[]) {
    this.subscriptions.add(
      this.appUsersService.grantAppAccess(appUsersId)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastrService.success(this.translateService.instant('screens.superAdmin.appUsers.grantAppAccessSuccessful'));
          } else {
            this.simpleDialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.getAppUsersData(this.appUserFilterRequestViewModel);
        },
        error => {
          this.simpleDialogService.Open(DialogTypes.Error, (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 
          this.translateService.instant('screens.commonLabel.serverError'));
        },
      ),
    );
  }

  loadAppUsers() {
    this.appUserFilterRequestViewModel.PageIndex = 1;
    this.appUserFilterRequestViewModel.PageSize = this.settings.pager.perPage;
    this.getAppUsersData(this.appUserFilterRequestViewModel);
  }

  showAddAppUserComponent() {
    this.loadAddAppUserComponent = true;
    this.hideUploadAppUserComponent();
  }

  hideAddAppUserComponent() {
    this.loadAddAppUserComponent = false;
  }

  showUploadAppUserComponent() {
    this.loadUploadAppUserComponent = true;
    this.hideAddAppUserComponent();
  }

  hideUploadAppUserComponent() {
    this.loadUploadAppUserComponent = false;
  }

  getAppUserTemplate() {
    this.subscriptions.add(
      this.appUsersService.getAppUserTemplate()
      .subscribe(
        response => {
          downloadFile(response.content, response.fileName);
        },
        error => {
          this.simpleDialogService.Open(DialogTypes.Error, (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 
          this.translateService.instant('screens.commonLabel.serverError'));
        },
      ),
    );
  }

  resetSearchAppUsers()  {
    this.appUserSearchKeyword = '';
    this.appUserFilterRequestViewModel.PageIndex = 1;
    this.appUserFilterRequestViewModel.PageSize = this.settings.pager.perPage;
    this.appUserFilterRequestViewModel.Keyword = '';
    this.searchAppUserForm.controls[SearchAppUserFormControls.SearchOptionType].setValue(this.translateService.instant('screens.superAdmin.searchAppUser.labels.email'));
    this.searchAppUserForm.controls[SearchAppUserFormControls.SearchAppUserKeyword].setValue('');
    this.getAppUsersData(this.appUserFilterRequestViewModel);
  }

  searchOptionOnChange(event) {
    this.selectedSearchOption = event.srcElement.selectedIndex;
  }

  searchAppUsers() {
    this.appUserSearchKeyword = this.searchAppUserForm.controls[SearchAppUserFormControls.SearchAppUserKeyword].value;

    if (this.appUserSearchKeyword.length < 3) {
      this.simpleDialogService.Open(DialogTypes.Error, this.translateService.instant('screens.superAdmin.searchAppUser.labels.searchUserPlaceholder'));
      return;
    }

    this.appUserFilterRequestViewModel.PageIndex = 1;
    this.appUserFilterRequestViewModel.PageSize = this.settings.pager.perPage;
    this.appUserFilterRequestViewModel.SearchOption = this.selectedSearchOption;
    this.appUserFilterRequestViewModel.Keyword = this.appUserSearchKeyword;
    this.getAppUsersData(this.appUserFilterRequestViewModel);
  }

  ReloadGrid()
  {
    this.hideUploadAppUserComponent();
    this.appUserFilterRequestViewModel.PageIndex = 1;
    this.appUserFilterRequestViewModel.PageSize = this.settings.pager.perPage;
    this.getAppUsersData(this.appUserFilterRequestViewModel);
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
