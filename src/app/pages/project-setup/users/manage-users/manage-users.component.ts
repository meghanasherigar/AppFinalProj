import { Component, OnInit, ElementRef, Input, OnDestroy } from '@angular/core';
import { LocalDataSource } from '../../../../@core/components/ng2-smart-table';
import { UserAdminResponseViewModel, UserAdminGridData, UserAdminFilterRequestViewModel, ProjectUserDeleteViewModel, AuditTrailViewModel, EntityRoleViewModel, EntityViewModel, CountryViewModel, RegionViewModel, EditRegionViewModel, EditCountryViewModel, EditEntityViewModel, EmailViewModel, ProjectTemplateViewModel } from '../../../../@models/userAdmin';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { Dialog, DialogTypes } from '../../../../@models/common/dialog';
import { DialogService } from '../../../../shared/services/dialog.service';
import { MatDialog } from '@angular/material';
import { ProjectUserService } from '../../../admin/services/project-user.service';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { environment } from '../../../../../environments/environment';
import { AdminFilterRequestViewModel } from '../../../../@models/admin/manageAdmin';
import { Window } from 'selenium-webdriver';
import { NbWindowService, NbDialogService } from '@nebular/theme';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SendEmailService } from '../../../../shared/services/send-email.service';
import * as moment from 'moment';
import { StorageService } from '../../../../@core/services/storage/storage.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { SendmailUserComponent } from '../../../common/sendmail-user/sendmail-user.component';
import { SortEvents } from '../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})

export class ManageUsersComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  adminUserGridSource: CommonDataSource = new CommonDataSource();
  loadAddComponent = false;
  loadUploadComponent = false;
  loadEditComponent = false;
  enableEditButton = false;
  editAdminUserFlag = false;
  adminFilterRequestViewModel = new UserAdminFilterRequestViewModel();
  userAdminGridData = new UserAdminGridData();
  private dialogTemplate: Dialog;
  projectUserDeleteViewModel = new ProjectUserDeleteViewModel();
  userAdminResponseViewModel = new UserAdminResponseViewModel();
  emailViewModel = new EmailViewModel();
  SendEmailToIds = [];
  constYes: string;
  constNo: string;




  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: { add: false, edit: false, delete: false, select: true },
    filters: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
  };
  //ngx-ui-loader configuration
  loaderId = 'ManageUserLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  constructor(private readonly _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private ngxLoader: NgxUiLoaderService,
    private ndDialogService: NbDialogService,
    private projectUserService: ProjectUserService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private elRef: ElementRef,
     private toastr: ToastrService,
    private shareDetailService: ShareDetailService,
    private windowService: NbWindowService,
    private sendEmailService: SendEmailService,
    private translate: TranslateService,
    private storageService: StorageService) { 
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.adminUserGridSource.refresh();
      }));

      this.setColumnSettings();
    }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.constYes = this.translate.instant('screens.project-user.Yes');
    this.constNo = this.translate.instant('screens.project-user.No');
    this.projectUserService.selectedAdminUserRows = [];
    this.adminFilterRequestViewModel.pageIndex = 1;
    this.adminFilterRequestViewModel.pageSize = this.settings.pager.perPage;
    const project = this.shareDetailService.getORganizationDetail();
    this.adminFilterRequestViewModel.ProjectId = project.projectId;
    // this.adminFilterRequestViewModel.ProjectId = "DigiDox3.0";
    this.getAdminUserData();

    this.adminUserGridSource.onChanged().subscribe((change) => {
      //block for server side pagination -- starts
      if (change.action === 'page' || change.action === 'paging') {
        this.setInitialRequest();
        this.adminFilterRequestViewModel.pageIndex = change.paging.page;
        this.adminFilterRequestViewModel.pageSize = change.paging.perPage;
        
        this.getProjectUserDataOnPageSize(this.adminFilterRequestViewModel);

        this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
      }
      //block for server side pagination -- ends

      //Server side sorting:start
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.setInitialRequest();
        this.adminFilterRequestViewModel.sortDirection=  change.sort[0].direction.toUpperCase();
        this.adminFilterRequestViewModel.sortColumn=  change.sort[0].field;
        this.getProjectUserDataOnPageSize(this.adminFilterRequestViewModel);
      }
      //Server side sorting:end
    });

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ProjectUser).subscribe((payload) => {
      if (payload == "Add" || payload == "Edit" || payload == "Delete" || payload == "Upload" || payload == "SendMail" || payload == "ReSendMail")
        this.loadMyChildComponent(payload);
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ProjectUserFilter).subscribe((payload: UserAdminFilterRequestViewModel) => {
      //updating the filter model for server pagination when any filter applied -- starts
      payload.pageSize = this.adminFilterRequestViewModel.pageSize;
      payload.pageIndex = this.adminFilterRequestViewModel.pageIndex;
      payload.ProjectId = this.adminFilterRequestViewModel.ProjectId;
      this.adminFilterRequestViewModel = payload;
      this.getAdminUserData();
      //updating the filter model for server pagination when any filter applied -- ends
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ProjectUserDownload).subscribe((payload) => {
      this.downloadTransactions(payload);
    }));

  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      userFirstName: {
        title: this.translate.instant('Name'),
        filter: false,
        width: '14%',
      },
      userEmail: {
        title: this.translate.instant('Email'),
        filter: false,
        width: '14%',
      },
      role: {
        title: this.translate.instant('Role'),
        filter: false,
        width: '14%',
      },
      lead: {
        title: this.translate.instant('Lead'),
        filter: false,
        width: '14%',
        valuePrepareFunction: (cell, row) => {
          return row.isLead ? this.constYes : this.constNo;
        }
      },
      regionName: {
        title: this.translate.instant('Region'),
        filter: false,
        width: '10%',
        sort: false,
      },
      countryName: {
        title: this.translate.instant('Country'),
        filter: false,
        width: '10%',
        sort: false,
      },
      entityRoleName: {
        title: this.translate.instant('Entities'),
        filter: false,
        width: '10%',
        sort: false,
      },
      createdBy: {
        title: this.translate.instant('Createdby'),
        filter: false,
        width: '14%',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<p class="main-text users-createdBy">' + row.auditTrail.createdBy + '<span>' + '<br/> on ' +
            moment(row.auditTrail.createdOn).local().format("DD MMM YYYY") + '</span>' + '</p>';
        }
      },
      lastActive: {
        title: this.translate.instant('LastActive'),
        filter: false,
        width: '30%',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          if (row.lastActive != null) {
            return '<p class="main-text">' + moment(row.lastActive).local().format("DD MMM YYYY") + '<br/>' +
              moment(row.lastActive).local().format("hh:mm a") + '</p>';
          }
        }
      },
      status: {
        title: this.translate.instant('Status'),
        filter: false,
        width: '14%',
        type: 'html',
        sort: false,
        valuePrepareFunction: (cell, row) => {
          if (row.status == "Registered")
            return '<p class="statusRegister"><span><img src="assets/images/registered.svg"></span>' + row.status + '</p>';
          else if (row.status == "Pending")
            return '<p class="statusPending"><span><img src="assets/images/pending.svg"></span>' + row.status + '</p>';
          else if (row.status == "Expired")
            return '<p class="statusExpired"><span><img src="assets/images/expired.svg"></span>' + row.status + '</p>';
        }
      },
    };

    this.settings = Object.assign({}, settingsTemp );
  }
  setInitialRequest()
  {
       this.ngxLoader.startLoader(this.loaderId);
        const project = this.shareDetailService.getORganizationDetail();
        this.adminFilterRequestViewModel.ProjectId = project.projectId;
  }

  getAdminUserData() {
    this.subscriptions.add(this.projectUserService.getprojectuserrightsonfilter(this.adminFilterRequestViewModel)
      .subscribe(
        response => {
          this.userAdminResponseViewModel = response;
          this.loadAdminUserGrid(this.userAdminResponseViewModel);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    this._eventService.getEvent(EventConstants.ProjectUserFilterRefresh).publish(undefined);
  }

  getProjectUserDataOnPageSize(filterData: UserAdminFilterRequestViewModel) {
    this.subscriptions.add(this.projectUserService.getprojectuserrightsonfilter(filterData)
      .subscribe(
        response => {
          this.userAdminResponseViewModel = response;
          this.loadAdminUserGrid(this.userAdminResponseViewModel);
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    this._eventService.getEvent(EventConstants.ProjectUserFilterRefresh).publish(undefined);
  }

  loadAdminUserGrid(data: UserAdminResponseViewModel) {
    let userGridList: UserAdminGridData[] = [];
    this.projectUserService.selectedAdminUserRows = [];
    data.projectUsers.forEach(element => {
      this.userAdminGridData = new UserAdminGridData();
      this.userAdminGridData.auditTrail = new AuditTrailViewModel();
      this.userAdminGridData.entityRole = new Array<EntityRoleViewModel>();
      this.userAdminGridData.regionData = new Array<EditRegionViewModel>();
      this.userAdminGridData.countryData = new Array<EditCountryViewModel>();
      this.userAdminGridData.entityRoleData = new Array<EditEntityViewModel>();
      // this.userAdminGridData.projectTemplate = new Array<ProjectTemplateViewModel>();
      this.userAdminGridData.id = element.id;
      this.userAdminGridData.projectId = element.projectId;
      this.userAdminGridData.userFirstName = element.userFirstName + " " + element.userLastName;
      this.userAdminGridData.userLastName = element.userLastName;
      this.userAdminGridData.userEmail = element.userEmail;
      this.userAdminGridData.region = element.region;
      this.userAdminGridData.country = element.country;
      this.userAdminGridData.regionName = element.regionName;
      this.userAdminGridData.countryName = element.countryName;
      this.userAdminGridData.projectTemplate = new Array<ProjectTemplateViewModel>();
      element.projectTemplate.forEach((template) => {
        var proTemplate = new ProjectTemplateViewModel()
        proTemplate.templateId = template.templateId;
        proTemplate.templateName = template.templateName;
        this.userAdminGridData.projectTemplate.push(proTemplate);
      });
      if (element.isCentralUser)
        this.userAdminGridData.role = "Central";
      else
        this.userAdminGridData.role = "Local";
      this.userAdminGridData.isCentralUser = element.isCentralUser;
      this.userAdminGridData.isLead = element.isLead;
      this.userAdminGridData.isHidden = element.isHidden;
      element.entityRole.forEach((entity) => {
        var entityModel = new EntityRoleViewModel()
        entityModel.entityId = entity.entityId;
        entityModel.entityName = entity.entityName;
        entityModel.taxableYearEnd = entity.taxableYearEnd;
        entityModel.read = entity.read;
        entityModel.copy = entity.copy;
        entityModel.remove = entity.remove;
        entityModel.formatting = entity.formatting;
        entityModel.edit = entity.edit;
        entityModel.created = entity.created;
        entityModel.reArrange = entity.reArrange;
        entityModel.reportGeneration = entity.reportGeneration;
        // entityModel.projectTemplateAccess = entity.projectTemplateAccess;
        // entityModel.projectTemplate = new Array<ProjectTemplateViewModel>();
        // entity.projectTemplate.forEach((template) => {
        //   var proTemplate = new ProjectTemplateViewModel()
        //   proTemplate.templateId = template.templateId;
        //   proTemplate.templateName = template.templateName;
        //   entityModel.projectTemplate.push(proTemplate);  
        // });
        this.userAdminGridData.entityRole.push(entityModel);
      });
      element.regionData.forEach((reg) => {
        var regionModel = new EditRegionViewModel()
        regionModel.regionId = reg.regionId;
        regionModel.regionName = reg.regionName;
        this.userAdminGridData.regionData.push(regionModel);
      });
      element.countryData.forEach((cou) => {
        var countryModel = new EditCountryViewModel()
        countryModel.id = cou.id;
        countryModel.country = cou.country;
        this.userAdminGridData.countryData.push(countryModel);
      });

      element.entityRoleData.forEach((ent) => {
        var entityRoleModel = new EditEntityViewModel()
        entityRoleModel.entityId = ent.entityId;
        entityRoleModel.legalEntityName = ent.legalEntityName;
        this.userAdminGridData.entityRoleData.push(entityRoleModel);
      });
      this.userAdminGridData.entityRoleName = element.entityRoleName;
      if (element.isExternalUser)
        this.userAdminGridData.isExternalUser = true;
      else
        this.userAdminGridData.isExternalUser = false;
      this.userAdminGridData.lastActive = element.lastActive;
      this.userAdminGridData.status = element.status;
      this.userAdminGridData.createdBy = element.auditTrail.createdBy + ' on ' + element.auditTrail.createdOn;
      this.userAdminGridData.auditTrail.createdOn = element.auditTrail.createdOn;
      this.userAdminGridData.auditTrail.createdBy = element.auditTrail.createdBy;
      this.userAdminGridData.auditTrail.updatedOn = element.auditTrail.updatedOn;
      this.userAdminGridData.auditTrail.updatedBy = element.auditTrail.updatedBy;
      userGridList.push(this.userAdminGridData);
      this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    });
    this.adminUserGridSource.totalCount = data.totalCount;
    this.adminUserGridSource.load(userGridList);
    this.ngxLoader.stopLoaderAll(this.loaderId);
  }

  onAdminUserRowSelect(event) {
    if (event.selected.length == 1) {
      let currentUser = this.storageService.getItem('currentUser');
      let loggedInUsermail = JSON.parse(currentUser).profile.email;
      this.loadAddComponent = false;
      this.loadUploadComponent = false;
      if (event.selected[0].userEmail == loggedInUsermail) {
        this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
      }
      else {
        this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeleteFalse");
      }
    }
    else if (event.selected.length > 1) {
      this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("OnlyDeleteFalse");
    }
    else if (event.selected.length == 0) {
      this.CancelTransactionComponent('CancelEdit');
      this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    }
    this.projectUserService.selectedAdminUserRows = event.selected;
    if (this.projectUserService.selectedAdminUserRows.length >= 1) {
      this.projectUserService.selectedAdminUserRows.forEach(item => {
        if (item.status == "Expired" || item.status == "Failed") {
          this._eventService.getEvent(EventConstants.ProjectUserEnableDisableReSendIcons).publish("EnableTrue");
        }
        else {
          this._eventService.getEvent(EventConstants.ProjectUserEnableDisableReSendIcons).publish("EnableFalse");
        }
      });
    }
    else {
      this._eventService.getEvent(EventConstants.ProjectUserEnableDisableReSendIcons).publish("EnableFalse");
    }
  }

  loadMyChildComponent(action) {

    if (action == "Upload") {
      this.loadUploadComponent = true;
      this.loadAddComponent = false;
      this.loadEditComponent = false;
      this._eventService.getEvent(EventConstants.ProjectUser).publish(action);
        }
    if (action == "SendMail") {
      this.openSendMailPopup();
    }
    if (action == "ReSendMail") {
      this.OPenReSendMailPopup();
    }
    if (action == "Delete") {
      this.openDeleteConfirmDialog();
    }
    if (action == 'Add') {
      this.loadAddComponent = true;
      this.loadEditComponent = false;
      this.loadUploadComponent = false;
    }
    else if (action == "Edit") {
      this.loadEditComponent = true;
      this.loadAddComponent = false;
      this.loadUploadComponent = false;
    }

  }

  CancelTransactionComponent(action) {
    this.loadAddComponent = false;
    this.loadEditComponent = false;
    this.loadUploadComponent = false;
    if (action == 'CancelEdit') {
      this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeleteFalse");
    }
    else if (action == 'CancelCreate' || action == 'CancelUpload') {
      if (this.projectUserService.selectedAdminUserRows.length == 0) {
        this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
      }
      else if (this.projectUserService.selectedAdminUserRows.length == 1) {
        this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("CanelEditDeleteTrue");
      }
      else if (this.projectUserService.selectedAdminUserRows.length > 1) {
        this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("CancelCreate");
      }
    }
  }

  openDeleteConfirmDialog(): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-user.DeleteConfirmationMessage');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTransaction();
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  openSendMailPopup() {
    this.ndDialogService.open(SendmailUserComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  OPenReSendMailPopup() {
    this.projectUserService.selectedAdminUserRows.forEach(item => {
      if (item.status == "Expired" || item.status == "Failed")
        this.emailViewModel.EmailIds.push(item.userEmail);
    });
    this.subscriptions.add(this.sendEmailService.reSendEmail(this.emailViewModel.EmailIds)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {

           this.toastr.success(this.translate.instant('screens.home.labels.emailResentSuccessfully'));
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.projectUserService.selectedAdminUserRows = [];
          this._eventService.getEvent(EventConstants.ProjectUserEnableDisableReSendIcons).publish("EnableTrue");
          this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

  deleteTransaction() {
    if (!this.projectUserService.selectedAdminUserRows) {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.DeleteValidationMessage'));
    }

    let projectUserDeleteViewModel = new ProjectUserDeleteViewModel();
    this.projectUserService.selectedAdminUserRows.forEach(item => {
      projectUserDeleteViewModel.UserIds.push(item.id);
    });
    // projectUserDeleteViewModel.ProjectId = "DigiDox4.0";
    const project = this.shareDetailService.getORganizationDetail();
    projectUserDeleteViewModel.ProjectId = project.projectId;

    this.subscriptions.add(this.projectUserService.deleteProjectUser(projectUserDeleteViewModel)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-user.ProjectUserDeleteSuccessMessage'));
            this.getAdminUserData();
          } else {
           this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            // this.toastr.warning(response.errorMessages[0]);
          }
          this.projectUserService.selectedAdminUserRows = [];
          this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  downloadTransactions(payload) {
    let data: UserAdminFilterRequestViewModel;
    data = payload;
    data.ProjectUserIds = new Array();
    this.projectUserService.selectedAdminUserRows.forEach(item => {
      data.ProjectUserIds.push(item.id);
    });
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectUserService.downloadProjectUsers(data).subscribe(data => {
      this.downloadFile(this.convertbase64toArrayBuffer(data.content), data.fileName);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }),
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
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
  downloadFile(data, fileName) {
    try {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      }
      else {
        var a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        // const url = window.URL.createObjectURL(blob);
        // window.open(url);
      }
    }
    catch{
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.DownloadFailureMessage'));
    }
  }
}
