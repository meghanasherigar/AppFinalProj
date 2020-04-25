import { Component, OnInit, EventEmitter, Output, ElementRef, OnDestroy } from '@angular/core';
declare var $: any;
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';
import { EventConstants } from '../../../../@models/common/eventConstants'
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { DatePipe } from '@angular/common';
import { ProjectUserService } from '../../../admin/services/project-user.service';
import { UserAdminFilterRequestViewModel } from '../../../../@models/userAdmin';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { UserUISetting } from '../../../../@models/user';
import { StorageService, StorageKeys } from '../../../../@core/services/storage/storage.service';
import { UserService } from '../../../user/user.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-manage-users-toolbar',
  templateUrl: './manage-users-toolbar.component.html',
  styleUrls: ['./manage-users-toolbar.component.scss']
})
export class ManageUsersToolbarComponent implements OnInit,OnDestroy {
  ngOnDestroy(): void {
   this.subscriptions.unsubscribe();
  }

  projectId: string = "DigiDox3.0";
  userNameList: any;
  selectedUserNameItems = [];
  createdByList: any;
  selectedCreatedByItems = [];
  roleList: any;
  selectedRoleItems = [];
  regionList: any;
  selectedRegionItems = [];
  countryList: any;
  selectedCountryItems= [];
  entitiesList: any;
  selectedEntitiesItems = [];
  statusList: any;
  selectedStatusItems = [];
  dropdownUserNameSettings = {};
  dropdownCreatedBySettings = {};
  dropdownRoleSettings = {};
  dropdownRegionSettings = {};
  dropdowncountrySettings = {};
  dropdownEntitiesSettings = {};
  dropdownStatusSettings = {};
  userUISetting: UserUISetting;
  @Output() loadChildComp: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();

    // To expand/collapse filters
    public show: boolean = false;

  
    imageKey: string = 'expand';
    imageName: string = this.translate.instant(this.imageKey);
    userAdminFilterRequestViewModel = new UserAdminFilterRequestViewModel();

  constructor(
    private translate: TranslateService,
    private projectUserService: ProjectUserService, 
    private alertService: AlertService,
    private el: ElementRef,
    private shareDetailService: ShareDetailService,
    private readonly _eventService: EventAggregatorService,
    private datepipe: DatePipe,
    private storageService: StorageService, private userservice: UserService) 
    { 
      this.userUISetting = new UserUISetting();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setLocaleMessages();
        });
    }

  ngOnInit() {
    this.alertService.clear();
    this.subscriptions.add(this._eventService.getEvent(EventConstants.ProjectUserFilterRefresh).subscribe((payload) => {
      const orgdetail =  this.shareDetailService.getORganizationDetail();
      this.userAdminFilterRequestViewModel.ProjectId = orgdetail.projectId;
      this.projectUserService.getProjectUserFilterMenuData(orgdetail.projectId).subscribe(data => {
        this.userNameList = data.userName;
        this.createdByList = data.createdBy;
        this.roleList = data.role;
        this.regionList = data.region;
        this.countryList = data.country;
        this.entitiesList = data.country;
        this.statusList = data.status;
      });
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ProjectUserEnableDisableReSendIcons).subscribe((value) => {
      let resendTag = this.el.nativeElement.querySelector("#resendIcon");
      if (value == "EnableTrue") {
      resendTag.classList.remove("disable-section");
      resendTag.classList.remove("disabledbutton");
      }
      else if(value == "EnableFalse"){
        resendTag.classList.add("disable-section");
        resendTag.classList.add("disabledbutton");
      }
    }));
    this.userUISetting = this.userservice.getCurrentUserUISettings();

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).subscribe((payload) => {
      let transactionTag = this.el.nativeElement.querySelector("#projectUserFilters-section");
      let createTag = this.el.nativeElement.querySelector("#createSection");
      let editTag = this.el.nativeElement.querySelector("#editIcon");
      let deleteTag = this.el.nativeElement.querySelector("#deleteIcon");
      let downloadTag = this.el.nativeElement.querySelector("#downloadIcon");
      let sendTag = this.el.nativeElement.querySelector("#sendIcon");
      let uploadTag = this.el.nativeElement.querySelector("#uploadIcon");
      let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
      if (payload == "EditDeletetrue") {
        sendTag.classList.add("disable-section");
        sendTag.classList.add("disabledbutton");
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.add("disable-section");
        deleteTag.classList.add("disabledbutton");
        createTag.classList.remove("disable-section");
        createTag.classList.remove("disabledbutton");
        uploadTag.classList.remove("disable-section");
        uploadTag.classList.remove("disabledbutton");
      }
      else if (payload == "CreateEditfalse") {
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "EditDeleteFalse") {
        sendTag.classList.remove("disable-section");
        sendTag.classList.remove("disabledbutton");
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
        createTag.classList.add("disable-section");
        createTag.classList.add("disabledbutton");
        uploadTag.classList.add("disable-section");
        uploadTag.classList.add("disabledbutton");
      }
      else if (payload == "OnlyDeleteFalse") {
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CancelCreate") {
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CanelEditDeleteTrue") {
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CancelEdit") {
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "EnableDownload") {
        downloadTag.classList.remove("disable-section");
        downloadTag.classList.remove("disabledbutton");
      }
      else if (payload == "DisableDownload") {
        downloadTag.classList.add("disable-section");
        downloadTag.classList.add("disabledbutton");
      }
      else {
        //this.getFiltersData(payload);
      }

    }));

    this.dropdownUserNameSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.dropdownCreatedBySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.dropdownRoleSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.dropdownRegionSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.dropdowncountrySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.dropdownEntitiesSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.dropdownStatusSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    };

    if(this.userUISetting.isMenuExpanded){
      this.toggleCollapse();
   }
  }

  onItemSelect(item: any){
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");
    if ((this.selectedUserNameItems == undefined || this.selectedUserNameItems.length <= 0) &&
    (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
    (this.selectedRoleItems == undefined || this.selectedRoleItems.length <= 0) &&
    (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
    (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
    (this.selectedEntitiesItems == undefined || this.selectedEntitiesItems.length <= 0) &&
    (this.selectedStatusItems == undefined || this.selectedStatusItems.length <= 0)
    && datePicker.value == '') {
    clearFilterTag.classList.add("disabledbutton");
    clearFilterTag.classList.add("disable-section");
  }
  else {
    clearFilterTag.classList.remove("disabledbutton");
    clearFilterTag.classList.remove("disable-section");
  }
  if (this.selectedUserNameItems != undefined) {
    this.userAdminFilterRequestViewModel.UserName = new Array();
    this.selectedUserNameItems.forEach((element: never) => {
      this.userAdminFilterRequestViewModel.UserName.push(element["id"]);
    });
  }
  if (this.selectedCreatedByItems != undefined) {
    this.userAdminFilterRequestViewModel.CreatedBy = new Array();
    this.selectedCreatedByItems.forEach((element: never) => {
      this.userAdminFilterRequestViewModel.CreatedBy.push(element["id"]);
    });
  }
  if (this.selectedRoleItems != undefined) {
    this.userAdminFilterRequestViewModel.Role = new Array();
    this.selectedRoleItems.forEach((element: never) => {
      this.userAdminFilterRequestViewModel.Role.push(element["id"]);
    });
  }
  if (this.selectedRegionItems != undefined) {
    this.userAdminFilterRequestViewModel.Region = new Array();
    this.selectedRegionItems.forEach((element: never) => {
      this.userAdminFilterRequestViewModel.Region.push(element["id"]);
    });
  }
  if (this.selectedCountryItems != undefined) {
    this.userAdminFilterRequestViewModel.Country = new Array();
    this.selectedCountryItems.forEach((element: never) => {
      this.userAdminFilterRequestViewModel.Country.push(element["id"]);
    });
  }
  if (this.selectedEntitiesItems != undefined) {
    this.userAdminFilterRequestViewModel.Entity = new Array();
    this.selectedEntitiesItems.forEach((element: never) => {
      this.userAdminFilterRequestViewModel.Entity.push(element["id"]);
    });
  }
  if (this.selectedStatusItems != undefined) {
    this.userAdminFilterRequestViewModel.Status = new Array();
    this.userAdminFilterRequestViewModel.Status= this.selectedStatusItems;
  }

  this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);

  }

  onSelectAllRole(items:any){
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedUserNameItems == undefined || this.selectedUserNameItems.length <= 0) &&
    (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
      (this.selectedRoleItems == undefined || this.selectedRoleItems.length <= 0) &&
    (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
    (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
    (this.selectedEntitiesItems == undefined || this.selectedEntitiesItems.length <= 0) &&
    (this.selectedStatusItems == undefined || this.selectedStatusItems.length <= 0)
    && datePicker.value == '') 
    {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    if (this.selectedRoleItems != undefined) {
      this.userAdminFilterRequestViewModel.Role = new Array();
      items.forEach((element: never) => {
        this.userAdminFilterRequestViewModel.Role.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);

  }

  onSelectAllUserName(items:any) {
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedUserNameItems == undefined || this.selectedUserNameItems.length <= 0) &&
    (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
    (this.selectedRoleItems == undefined || this.selectedRoleItems.length <= 0) &&
    (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
    (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
    (this.selectedEntitiesItems == undefined || this.selectedEntitiesItems.length <= 0) &&
    (this.selectedStatusItems == undefined || this.selectedStatusItems.length <= 0)
    && datePicker.value == '') 
    {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    if (this.selectedUserNameItems != undefined) {
      this.userAdminFilterRequestViewModel.UserName = new Array();
      items.forEach((element: never) => {
        this.userAdminFilterRequestViewModel.UserName.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);
  }

  onSelectAllCreatedBy(items:any) {
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedUserNameItems == undefined || this.selectedUserNameItems.length <= 0) &&
    (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
    (this.selectedRoleItems == undefined || this.selectedRoleItems.length <= 0) &&
    (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
    (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
    (this.selectedEntitiesItems == undefined || this.selectedEntitiesItems.length <= 0) &&
    (this.selectedStatusItems == undefined || this.selectedStatusItems.length <= 0)
    && datePicker.value == '') 
    {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    if (this.selectedCreatedByItems != undefined) {
      this.userAdminFilterRequestViewModel.CreatedBy = new Array();
      items.forEach((element: never) => {
        this.userAdminFilterRequestViewModel.CreatedBy.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);
  }

  onSelectAllRegion(items:any){
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedUserNameItems == undefined || this.selectedUserNameItems.length <= 0) &&
    (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
    (this.selectedRoleItems == undefined || this.selectedRoleItems.length <= 0) &&
    (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
    (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
    (this.selectedEntitiesItems == undefined || this.selectedEntitiesItems.length <= 0) &&
    (this.selectedStatusItems == undefined || this.selectedStatusItems.length <= 0)
    && datePicker.value == '') 
    {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    if (this.selectedRegionItems != undefined) {
      this.userAdminFilterRequestViewModel.Region = new Array();
      items.forEach((element: never) => {
        this.userAdminFilterRequestViewModel.Region.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);

  }

  onSelectAllCountry(items:any){
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedUserNameItems == undefined || this.selectedUserNameItems.length <= 0) &&
    (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
    (this.selectedRoleItems == undefined || this.selectedRoleItems.length <= 0) &&
    (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
    (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
    (this.selectedEntitiesItems == undefined || this.selectedEntitiesItems.length <= 0) &&
    (this.selectedStatusItems == undefined || this.selectedStatusItems.length <= 0)
    && datePicker.value == '') 
    {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    if (this.selectedCountryItems != undefined) {
      this.userAdminFilterRequestViewModel.Country = new Array();
      items.forEach((element: never) => {
        this.userAdminFilterRequestViewModel.Country.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);

  }

  onSelectAllEntity(items:any){
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedUserNameItems == undefined || this.selectedUserNameItems.length <= 0) &&
    (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
    (this.selectedRoleItems == undefined || this.selectedRoleItems.length <= 0) &&
    (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
    (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
    (this.selectedEntitiesItems == undefined || this.selectedEntitiesItems.length <= 0) &&
    (this.selectedStatusItems == undefined || this.selectedStatusItems.length <= 0)
    && datePicker.value == '') 
    {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    if (this.selectedEntitiesItems != undefined) {
      this.userAdminFilterRequestViewModel.Entity = new Array();
      items.forEach((element: never) => {
        this.userAdminFilterRequestViewModel.Entity.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);

  }

  onSelectAllStatus(items:any){
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedUserNameItems == undefined || this.selectedUserNameItems.length <= 0) &&
    (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
    (this.selectedRoleItems == undefined || this.selectedRoleItems.length <= 0) &&
    (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
    (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
    (this.selectedEntitiesItems == undefined || this.selectedEntitiesItems.length <= 0) &&
    (this.selectedStatusItems == undefined || this.selectedStatusItems.length <= 0)
    && datePicker.value == '') 
    {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    if (this.selectedStatusItems != undefined) {
      this.userAdminFilterRequestViewModel.Status = new Array();
      items.forEach((element: never) => {
        this.userAdminFilterRequestViewModel.Status.push(element);
      });
    }
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);

  }

  onDateSelect(item: any){
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.remove("disabledbutton");
    clearFilterTag.classList.remove("disable-section");
    var startDateSelected = item[0];
    var endDateSelected = item[1];
    this.userAdminFilterRequestViewModel.CreatedDateFrom = new Date(startDateSelected);
    this.userAdminFilterRequestViewModel.CreatedDateTo = this.getEndDateTime(endDateSelected);
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);
  }
  setLocaleMessages() {
    this.imageName = this.translate.instant(this.imageKey);
  }
  loadMyChildComponent(action) {
    this.loadChildComp.emit(action);
    this._eventService.getEvent(EventConstants.ProjectUser).publish(action);
  }

  toggleCollapse() {
    this.show = !this.show;
    let transFilterID = this.el.nativeElement.querySelector("#projectUserFilters-section");
    let filterIcon = this.el.nativeElement.querySelector("#filterImg");

    // To change the name of image.
    if (this.show) {
      this.imageKey = 'collapse';
      this.imageName = this.translate.instant(this.imageKey);
      this.userUISetting.isMenuExpanded = true;
      transFilterID.classList.remove('collapsed');
    }
    else {
      this.imageKey = 'expand';
      this.imageName = this.translate.instant(this.imageKey);
      this.userUISetting.isMenuExpanded = false;
      transFilterID.classList.add('collapsed');
      //filterIcon.classList.show();
    }
    this.userservice.updateCurrentUserUISettings(this.userUISetting);
  }

  downloadTransactions()
  {
    this._eventService.getEvent(EventConstants.ProjectUserDownload).publish(this.userAdminFilterRequestViewModel);
  }

  clearFilters() {
    this.emptyFilters();
    this._eventService.getEvent(EventConstants.ProjectUserEnableDisableIcons).publish("EditDeletetrue");
    this.userAdminFilterRequestViewModel = new UserAdminFilterRequestViewModel();
    // this.userAdminFilterRequestViewModel.ProjectId = "DigiDox3.0";
    const project = this.shareDetailService.getORganizationDetail();
    this.userAdminFilterRequestViewModel.ProjectId = project.projectId;
    this.userAdminFilterRequestViewModel
    this._eventService.getEvent(EventConstants.ProjectUserFilter).publish(this.userAdminFilterRequestViewModel);
  }

  emptyFilters() {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.add("disabledbutton");
    clearFilterTag.classList.add("disable-section");
    this.selectedUserNameItems = [];
    this.selectedCreatedByItems = [];
    this.selectedRoleItems = [];
    this.selectedRegionItems = [];
    this.selectedCountryItems = [];
    this.selectedEntitiesItems = [];
    this.selectedStatusItems = [];
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");
    datePicker.value = "";
  }
  getEndDateTime(date: any): any {
    return moment(date).set({h: 23, m: 59, s: 59}).toDate();
  }
}
