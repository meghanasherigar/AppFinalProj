import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../../@models/common/eventConstants';
import { ManageAdminService } from '../../../services/manage-admin.service';
import { AdminMenuIcons, AdminFilterDataModel, AdminFilterRequestViewModel, AdminUserEventPayload } from '../../../../../@models/admin/manageAdmin';
import { NbDateService } from '@nebular/theme';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-top-level-menu-manage-admin',
  templateUrl: './manage-admin.component.html',
  styleUrls: ['./manage-admin.component.scss']
})
export class TopLevelMenuManageAdminComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  isExpanded = true;
  public show: boolean = false;
  public imageName: any = this.translate.instant("Expand");
  public ddlListRoles: any;
  public ddlListUsers: any;
  public ddlListCountry: any;
  public ddlListCreatedBy: any;
  private adminFilterRequestViewModel: AdminFilterRequestViewModel;
  public selectedUserValues: any;
  public selectedUserRoles: any;
  public selectedCountry: any;
  public selectedCreatedByUsers: any;
  private CreationDate: any;

  creationMinDate: Date;
  creationMaxDate: Date;
  adminUserEventPayload: AdminUserEventPayload;

  public ddlSettings: any;
  public ddlRoleSettings: any;
  public ddlCountrySettings: any;

  constructor(
    private readonly _eventService: EventAggregatorService,
    private el: ElementRef,
    private service: ManageAdminService,
    private dateService: NbDateService<Date>,
    private datePipe: DatePipe,
    private translate: TranslateService
  ) {
    this.adminFilterRequestViewModel = new AdminFilterRequestViewModel();
    this.adminUserEventPayload = new AdminUserEventPayload();
  }

  ngOnInit() {
    this.getAdminDropDownFilterData();
    this.setManageAdminFilterSettings();
    this.toggleCollapse();
    this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).subscribe(action => {
      this.EnableDisableManageAdminTopMenu(action);
    });

   this.EnableDisableManageAdminTopMenu(undefined);

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageAdminFilter).subscribe(item => {
      this.getAdminDropDownFilterData();
    }));
  }



  toggle() {
    this.isExpanded = !this.isExpanded;
    return false;
  }

  EnableDisableIcons(icons: AdminMenuIcons) {
    var createIcon = document.getElementById("createManageAdminIcon");
    var editIcon = document.getElementById("editManageAdminIcon");
    var deleteIcon = document.getElementById("deleteManageAdminIcon");
    var downloadIcon = document.getElementById("downloadManageAdminIcon");
    var clearFilterIcon = document.getElementById("clearFIlterManageAdminIcon");
    var filterSection = document.getElementById("filterManageAdmin");

    if (icons.isCreateEnabled)
      createIcon.classList.remove('manage-admin-opacity');
    else
      createIcon.classList.add('manage-admin-opacity');

    if (icons.isEditEnabled)
      editIcon.classList.remove('manage-admin-opacity');
    else
      editIcon.classList.add('manage-admin-opacity');

    if (icons.isDeleteEnabled)
      deleteIcon.classList.remove('manage-admin-opacity');
    else
      deleteIcon.classList.add('manage-admin-opacity');

    if (icons.isDownloadEnabled)
      downloadIcon.classList.remove('manage-admin-opacity');
    else
      downloadIcon.classList.add('manage-admin-opacity');

    if (icons.isClearEnabled)
      clearFilterIcon.classList.remove('manage-admin-opacity');
    else
      clearFilterIcon.classList.add('manage-admin-opacity');

    if (icons.isFilterEnabled)
      filterSection.classList.remove('manage-admin-filter');
    else
      filterSection.classList.add('manage-admin-filter');
  }

  EnableDisableManageAdminTopMenu(action) {
    var adminMenuIcons = this.service.adminMenuIcons;
    var length = this.service.selectedAdminUserRows ? this.service.selectedAdminUserRows.length : 0;

    if (length == 0) {
      adminMenuIcons.isCreateEnabled = true;
      adminMenuIcons.isEditEnabled = false;
      adminMenuIcons.isDeleteEnabled = false;
      adminMenuIcons.isDownloadEnabled = true;
    }

    if (length > 0) {
      adminMenuIcons.isCreateEnabled = false;
      adminMenuIcons.isDeleteEnabled = true;
      adminMenuIcons.isDownloadEnabled = true;
      adminMenuIcons.isEditEnabled = false;

      if (length == 1)
        adminMenuIcons.isEditEnabled = true;
    }

    if (action == "Edit") {
      adminMenuIcons.isCreateEnabled = false;
      adminMenuIcons.isEditEnabled = false;
      adminMenuIcons.isDeleteEnabled = false;
      adminMenuIcons.isDownloadEnabled = false;
      adminMenuIcons.isFilterEnabled = false;
    }

    if (action == "Add") {
      adminMenuIcons.isCreateEnabled = false;
      adminMenuIcons.isEditEnabled = false;
      adminMenuIcons.isDeleteEnabled = false;
      adminMenuIcons.isDownloadEnabled = false;
      adminMenuIcons.isFilterEnabled = false;
    }
    if (action == "Cancel") {
      adminMenuIcons.isCreateEnabled = true;
      adminMenuIcons.isEditEnabled = false;
      adminMenuIcons.isDeleteEnabled = false;
      adminMenuIcons.isDownloadEnabled = true;
      adminMenuIcons.isFilterEnabled = true;
    }

    this.EnableDisableIcons(adminMenuIcons);
  }

  onCreateAdminUser() {
    if (!this.service.adminMenuIcons.isCreateEnabled)
      return;

    this.adminUserEventPayload.Action = "Add";
    this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
    this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish('Cancel');
  
  }

  onEditAdminUser() {
    if (!this.service.adminMenuIcons.isEditEnabled)
      return;

    this.adminUserEventPayload.Action = "Edit";
    this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
    this._eventService.getEvent(EventConstants.ManageAdminEnableDisableIcons).publish('Edit');
  }

  onDeleteAdminUsers() {
    if (!this.service.adminMenuIcons.isDeleteEnabled)
      return;

    this.adminUserEventPayload.Action = "Delete";
    this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
  }

  onDownloadAdminUsers() {
    if (!this.service.adminMenuIcons.isDownloadEnabled)
      return;

    this.adminUserEventPayload.Action = "Download";
    this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
  }

  getAdminDropDownFilterData() {
    this.subscriptions.add(this.service.getAdminFilterMenuData()
      .subscribe(
        (data: AdminFilterDataModel) => {
          this.ddlListUsers = data.users;
          this.ddlListRoles = data.roles;
          this.ddlListCountry = data.country;
          this.ddlListCreatedBy = data.createdBy;
          this.creationMinDate = this.dateService.addMonth(this.dateService.today(), -1);
          this.creationMaxDate = this.dateService.addMonth(this.dateService.today(), 1);

          if (this.ddlListUsers.length > 0)
            this.service.adminMenuIcons.isFilterEnabled = true;
          else
            this.service.adminMenuIcons.isFilterEnabled = false;

          this.EnableDisableIcons(this.service.adminMenuIcons);
        },
      ));
  }

  setManageAdminFilterSettings() {
    this.ddlSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.manage-admin.labels.selectAll'),
      unSelectAllText: this.translate.instant('screens.manage-admin.labels.unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
  }

  onManageAdminFilterSelect(item: any) {
    this.service.adminMenuIcons.isClearEnabled = true;

    this.adminFilterRequestViewModel.UserIds = [];
    this.adminFilterRequestViewModel.CreatedByIds = [];
    this.adminFilterRequestViewModel.CountryIds = [];
    this.adminFilterRequestViewModel.IsCountryAdmin = null;
    this.adminFilterRequestViewModel.IsGlobalAdmin = null;
    this.adminFilterRequestViewModel.CreatedDateFrom = null;
    this.adminFilterRequestViewModel.CreatedDateTo = null;

    if (this.selectedUserValues != undefined) {
      this.selectedUserValues.forEach((element: never) => {
        this.adminFilterRequestViewModel.UserIds.push(element["id"]);
      });
    }

    if (this.selectedUserRoles != undefined) {
      this.adminFilterRequestViewModel.IsCountryAdmin = false;
      this.adminFilterRequestViewModel.IsGlobalAdmin = false;

      this.selectedUserRoles.forEach((element: never) => {
        if (element["id"] == "IsGlobalAdmin")
          this.adminFilterRequestViewModel.IsGlobalAdmin = true;
        if (element["id"] == "IsCountryAdmin")
          this.adminFilterRequestViewModel.IsCountryAdmin = true;
      });

      if (this.adminFilterRequestViewModel.IsCountryAdmin == false && this.adminFilterRequestViewModel.IsGlobalAdmin == false) {
        this.adminFilterRequestViewModel.IsCountryAdmin = null;
        this.adminFilterRequestViewModel.IsGlobalAdmin = null;
      }
    }

    if (this.selectedCountry != undefined) {
      this.selectedCountry.forEach((element: never) => {
        this.adminFilterRequestViewModel.CountryIds.push(element["id"]);
      });
    }

    if (this.selectedCountry != undefined) {
      this.selectedCountry.forEach((element: never) => {
        this.adminFilterRequestViewModel.CountryIds.push(element["id"]);
      });
    }

    if (this.selectedCreatedByUsers != undefined) {
      this.selectedCreatedByUsers.forEach((element: never) => {
        this.adminFilterRequestViewModel.CreatedByIds.push(element["id"]);
      });
    }

    if (this.CreationDate != undefined) {
      this.CreationDate.forEach((element: never) => {
        this.adminFilterRequestViewModel.CreatedByIds.push(element["id"]);
      });
    }

    this.adminUserEventPayload.Action = "LoadUsers";
    this.adminUserEventPayload.AdminUserFilterModel = this.adminFilterRequestViewModel;
    this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
    this.EnableDisableIcons(this.service.adminMenuIcons);
  }

  onSelectAll(action: any) {
    this.adminUserEventPayload.Action = "LoadUsers";
    this.service.adminMenuIcons.isClearEnabled = true;
    switch (action) {
      case 'user':
        this.adminFilterRequestViewModel.UserIds = [];
        break;
      case 'role':
        this.adminFilterRequestViewModel.IsCountryAdmin = null;
        this.adminFilterRequestViewModel.IsGlobalAdmin = null;
        break;
      case 'country':
        this.adminFilterRequestViewModel.CountryIds = [];
        break;
      case 'createdBy':
        this.adminFilterRequestViewModel.CreatedByIds = [];
        break;
    }
    this.adminUserEventPayload.AdminUserFilterModel = this.adminFilterRequestViewModel;
    this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
    this.EnableDisableIcons(this.service.adminMenuIcons);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onDateSelect(item: any, type: any) {
    if (!item) return;
    this.service.adminMenuIcons.isClearEnabled = true;

    var startDateSelected = item[0];
    var endDateSelected = this.getEndDateTime(item[1]);


    if (startDateSelected != null && endDateSelected != null) {
      this.adminFilterRequestViewModel.CreatedDateFrom = startDateSelected;
      this.adminFilterRequestViewModel.CreatedDateTo = endDateSelected;
      this.adminUserEventPayload.Action = "LoadUsers";
      this.adminUserEventPayload.AdminUserFilterModel = this.adminFilterRequestViewModel;
      this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
      this.EnableDisableIcons(this.service.adminMenuIcons);
    }
  }

  toggleCollapse() {
    this.show = !this.show;
    let entityTag = this.el.nativeElement.querySelector("#manageAdminFilters");
    let filterIcon = this.el.nativeElement.querySelector(".filter-icon-wrapper");

    // To change the name of image.
    if (this.show) {
      entityTag.classList.remove('collapsed');
      this.imageName = this.translate.instant("collapse");
    }
    else {
      this.imageName = this.translate.instant("expand");
      entityTag.classList.add('collapsed');
      filterIcon.classList.show();
    }
  }

  clearFilters() {
    if (!this.service.adminMenuIcons.isClearEnabled)
      return;

    var element = <HTMLInputElement>document.getElementById('creationDate');
    if (element) element.value = "";
    this.service.adminMenuIcons.isClearEnabled = false;
    this.selectedCountry = [];
    this.selectedUserRoles = [];
    this.selectedCreatedByUsers = [];
    this.selectedUserValues = [];
    this.service.selectedAdminUserRows = [];
    this.adminFilterRequestViewModel = new AdminFilterRequestViewModel();
    this.adminUserEventPayload.Action = "LoadUsers";
    this.adminUserEventPayload.AdminUserFilterModel = this.adminFilterRequestViewModel;
    this._eventService.getEvent(EventConstants.ManageAdmin).publish(this.adminUserEventPayload);
  }
  getEndDateTime(date: any): any
  {
    return moment(date).set({h: 23, m: 59, s: 59}).toDate();
  }
}
