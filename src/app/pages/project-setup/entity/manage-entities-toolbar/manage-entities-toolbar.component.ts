import { Component, OnInit, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { $$iterator } from 'rxjs/internal/symbol/iterator';
import { Subscription } from 'rxjs';
import { DISABLED } from '@angular/forms/src/model';
import { DatePipe } from '@angular/common';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { EntitiesService } from '../entity.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { EntityFilterViewModel } from '../../../../@models/entity';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { UserUISetting } from '../../../../@models/user';
import { StorageService, StorageKeys } from '../../../../@core/services/storage/storage.service';
import { UserService } from '../../../user/user.service';
import { EditDatasheetComponent } from '../edit-datasheet/edit-datasheet.component';
import { NbDialogService } from '@nebular/theme';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-manage-entities-toolbar',
  templateUrl: './manage-entities-toolbar.component.html',
  styleUrls: ['./manage-entities-toolbar.component.scss']
})
export class ManageEntitiesToolbarComponent implements OnInit {

  userUISetting: UserUISetting;
  imageKey: string = 'expand';
  imageName: string = this.translate.instant(this.imageKey);
  constructor(
    private translate: TranslateService,private eService: EntitiesService, private readonly _eventService: EventAggregatorService, private datepipe: DatePipe,
    private el: ElementRef, private shareDetailService: ShareDetailService, private storageService: StorageService, private userservice: UserService,
    private dialogService: NbDialogService) { 
      this.userUISetting = new UserUISetting();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setLocaleMessages();
        });
    }
  ddlistEntityNames: any;
  disableControls = false;
  selectedEntityItems = [];
  ddlistEntityShortNames: any;
  selectedEntityShortNameItems = [];
  ddlistCountry: any;
  selectedCountryItems: [];
  ddlistReportTiers: any;
  selectedReportTierItems: [];
  ddlistEntityId: any;
  selectedEntityIdItems = [];
  ddlistCreatedBy: any;
  selectedCreatedByIems = [];
  ddlistInScope: any;
  selectedInscopeItems = [];
  dropdownSettings = {};
  dropdownCountrySettings: {};
  dropdownTierSettings: {};
  dropdownCreatedBySettings:{}
  disableToolbar = false;
  @Output() manageEntity: EventEmitter<any> = new EventEmitter();
  @Output() loadChildComp: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  // To expand/collapse filters
  public show: boolean = false;

  filteredDataModel = new EntityFilterViewModel();
  ngOnInit() {
    // this.filteredDataModel.projectID = "DigiDox3.0";
    const project = this.shareDetailService.getORganizationDetail();
    this.filteredDataModel.projectID = project.projectId;

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown',
    };
    this.dropdownCountrySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.dropdownTierSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'reportTier',
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

    }
    this.userUISetting = this.userservice.getCurrentUserUISettings();


    this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageEntity).subscribe((payload) => {
      let entityTag = this.el.nativeElement.querySelector("#entityFilters-section");
      let createTag = this.el.nativeElement.querySelector("#createSection");
      let ManageTag = this.el.nativeElement.querySelector("#manageSection");
      let filterTag = this.el.nativeElement.querySelector("#filterSection");
      let editTag = this.el.nativeElement.querySelector("#editIcon");
      let deleteTag = this.el.nativeElement.querySelector("#deleteIcon");
      let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
      let downloadTag = this.el.nativeElement.querySelector("#downloadIcon");
      if (payload == "EditDeletetrue") {
        entityTag.classList.remove("disable-section");
        entityTag.classList.remove("disabledbutton");
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.add("disable-section");
        deleteTag.classList.add("disabledbutton");
        createTag.classList.remove("disable-section");
        createTag.classList.remove("disabledbutton");
      }
      else if (payload == "CreateEditfalse") {
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
        entityTag.classList.add("disable-section");
        entityTag.classList.add("disabledbutton");

      }
      else if (payload == "EditDeleteFalse") {
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
        createTag.classList.add("disable-section");
        createTag.classList.add("disabledbutton");
      }
      else if (payload == "OnlyDeleteFalse") {
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CancelCreate") {
        entityTag.classList.remove("disable-section");
        entityTag.classList.remove("disabledbutton");
        editTag.classList.add("disable-section");
        editTag.classList.add("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CanelEditDeleteTrue") {
        entityTag.classList.remove("disable-section");
        entityTag.classList.remove("disabledbutton");
        editTag.classList.remove("disable-section");
        editTag.classList.remove("disabledbutton");
        deleteTag.classList.remove("disable-section");
        deleteTag.classList.remove("disabledbutton");
      }
      else if (payload == "CancelEdit") {
        entityTag.classList.remove("disable-section");
        entityTag.classList.remove("disabledbutton");
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
      else
        this.getFiltersData(payload);

    }));

    if(this.userUISetting.isMenuExpanded){
      this.toggleCollapse();
   }

  }
  getFiltersData(payload) {
    for (var i = 0; i < payload.entityName.length; i++) {
      if (payload.entityName[i] == '')
        payload.entityName[i] = 'Blank';
    };
    if(payload.entityName.find(a => a == "Blank")){
      let blankIndex = payload.entityName.indexOf("Blank");
      payload.entityName.splice(blankIndex, 1)
      payload.entityName.unshift("Blank");
    }
    this.ddlistEntityNames = payload.entityName;

    for (var i = 0; i < payload.entityShortName.length; i++) {
      if (payload.entityShortName[i] == '') {
        payload.entityShortName[i] = 'Blank';
      }
    }
    if(payload.entityShortName.find(a => a == "Blank")){
        let blankIndex = payload.entityShortName.indexOf("Blank");
        payload.entityShortName.splice(blankIndex, 1)
        payload.entityShortName.unshift("Blank");
    }
    this.ddlistEntityShortNames = payload.entityShortName;

    for (var i = 0; i < payload.taxID.length; i++) {
      if (payload.taxID[i] == '')
        payload.taxID[i] = 'Blank';
    };
    if(payload.taxID.find(a => a == "Blank")){
      let blankIndex = payload.taxID.indexOf("Blank");
      payload.taxID.splice(blankIndex, 1)
      payload.taxID.unshift("Blank");
    }
    this.ddlistEntityId = payload.taxID;

    for (var i = 0; i < payload.country.length; i++) {
      if (payload.country[i]["country"] == '')
        payload.country[i].country = 'Blank';
    };
    this.ddlistCountry = payload.country;

    for (var i = 0; i < payload.createdBy.length; i++) {
      if (payload.createdBy[i] == '')
        payload.createdBy[i] = 'Blank';
    };
    
    this.ddlistCreatedBy = payload.createdBy;

    this.ddlistReportTiers = payload.reportTier;

    for (var i = 0; i < payload.scope.length; i++) {
      if (payload.scope[i] == '')
        payload.scope[i] = 'Blank';
    };
    this.ddlistInScope = payload.scope;
    this.emptyDisableFilters();
  }
  onItemSelect(item: any) {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedEntityShortNameItems == undefined || this.selectedEntityShortNameItems.length <= 0) && (this.selectedEntityIdItems == undefined || this.selectedEntityIdItems.length <= 0) &&
      (this.selectedInscopeItems == undefined || this.selectedInscopeItems.length <= 0) && (this.selectedCreatedByIems == undefined || this.selectedCreatedByIems.length <= 0) && (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0)
      && (this.selectedReportTierItems == undefined || this.selectedReportTierItems.length <= 0) && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    else {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }

    for (var i = 0; i < this.selectedEntityItems.length; i++) {
      if (this.selectedEntityItems[i] == 'Blank')
        this.selectedEntityItems[i] = '';
    };
    this.filteredDataModel.entityName = this.selectedEntityItems;

    for (var i = 0; i < this.selectedEntityShortNameItems.length; i++) {
      if (this.selectedEntityShortNameItems[i] == 'Blank')
        this.selectedEntityShortNameItems[i] = '';
    };
    this.filteredDataModel.entitYShortName = this.selectedEntityShortNameItems;

    for (var i = 0; i < this.selectedEntityIdItems.length; i++) {
      if (this.selectedEntityIdItems[i] == 'Blank')
        this.selectedEntityIdItems[i] = '';
    };
    this.filteredDataModel.taxID = this.selectedEntityIdItems;

    if (this.selectedCreatedByIems != undefined) {
      this.filteredDataModel.createdBy = new Array();
      this.selectedCreatedByIems.forEach((element: never) => {
        this.filteredDataModel.createdBy.push(element["id"]);
      });
    }
    for (var i = 0; i < this.selectedInscopeItems.length; i++) {
      if (this.selectedInscopeItems[i] == 'Blank')
        this.selectedInscopeItems[i] = '';
    };
    this.filteredDataModel.scope = this.selectedInscopeItems;

    if (this.selectedCountryItems != undefined) {
      this.filteredDataModel.country = new Array();
      this.selectedCountryItems.forEach((element: never) => {
        this.filteredDataModel.country.push(element["id"]);
      });
    }
    if (this.selectedReportTierItems != undefined) {
      this.filteredDataModel.reportTier = new Array();
      this.selectedReportTierItems.forEach((element: never) => {
        this.filteredDataModel.reportTier.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);

    //this.manageEntity.emit(this.filteredDataModel);
  }
  onSelectAllEntities(items: any) {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityShortNameItems == undefined || this.selectedEntityShortNameItems.length <= 0) && (this.selectedEntityIdItems == undefined || this.selectedEntityIdItems.length <= 0) &&
      (this.selectedInscopeItems == undefined || this.selectedInscopeItems.length <= 0) && (this.selectedCreatedByIems == undefined || this.selectedCreatedByIems.length <= 0) && (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0)
      && (this.selectedReportTierItems == undefined || this.selectedReportTierItems.length <= 0) && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.filteredDataModel.entityName = items;
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);

    //this.manageEntity.emit(this.filteredDataModel);
  }
  onSelectAllCountry(items: any) {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedEntityShortNameItems == undefined || this.selectedEntityShortNameItems.length <= 0) && (this.selectedEntityIdItems == undefined || this.selectedEntityIdItems.length <= 0) &&
      (this.selectedInscopeItems == undefined || this.selectedInscopeItems.length <= 0) && (this.selectedCreatedByIems == undefined || this.selectedCreatedByIems.length <= 0) &&
      (this.selectedReportTierItems == undefined || this.selectedReportTierItems.length <= 0) && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    clearFilterTag.classList.remove("disabledbutton");
    clearFilterTag.classList.remove("disable-section");
    this.filteredDataModel.country = new Array();
    items.forEach((element: never) => {
      this.filteredDataModel.country.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);

    // this.manageEntity.emit(this.filteredDataModel);
  }
  onSelectAllReportTier(items: any) {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedEntityShortNameItems == undefined || this.selectedEntityShortNameItems.length <= 0) && (this.selectedEntityIdItems == undefined || this.selectedEntityIdItems.length <= 0) &&
      (this.selectedInscopeItems == undefined || this.selectedInscopeItems.length <= 0) && (this.selectedCreatedByIems == undefined || this.selectedCreatedByIems.length <= 0)
      && (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.filteredDataModel.reportTier = new Array();
    items.forEach((element: never) => {
      this.filteredDataModel.reportTier.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);

    // this.manageEntity.emit(this.filteredDataModel);
  }
  onSelectAllCreatedBy(items: any) {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) && (this.selectedEntityShortNameItems == undefined || this.selectedEntityShortNameItems.length <= 0) && (this.selectedEntityIdItems == undefined || this.selectedEntityIdItems.length <= 0) &&
      (this.selectedInscopeItems == undefined || this.selectedInscopeItems.length <= 0)
      && (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedReportTierItems == undefined || this.selectedReportTierItems.length <= 0) && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);

    // this.manageEntity.emit(this.filteredDataModel);
  }
  onSelectAllEntityIds(items: any) {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) &&
      (this.selectedEntityShortNameItems == undefined || this.selectedEntityShortNameItems.length <= 0) &&
      (this.selectedInscopeItems == undefined || this.selectedInscopeItems.length <= 0)
      && (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedReportTierItems == undefined || this.selectedReportTierItems.length <= 0)
      && (this.selectedCreatedByIems == undefined || this.selectedCreatedByIems.length <= 0) && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.filteredDataModel.taxID = items;
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);
  }
  onSelectAllEntShortNm(items: any) {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) &&
      (this.selectedInscopeItems == undefined || this.selectedInscopeItems.length <= 0)
      && (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedReportTierItems == undefined || this.selectedReportTierItems.length <= 0)
      && (this.selectedCreatedByIems == undefined || this.selectedCreatedByIems.length <= 0) && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.filteredDataModel.entitYShortName = items;
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);

    // this.manageEntity.emit(this.filteredDataModel);
  }

  onSelectAllInScope(items: any) {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
    let datePicker1 = <HTMLInputElement>document.getElementById("createdDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disabledbutton");
      clearFilterTag.classList.remove("disable-section");
    }
    else if ((this.selectedEntityItems == undefined || this.selectedEntityItems.length <= 0) &&
      (this.selectedEntityShortNameItems == undefined || this.selectedEntityShortNameItems.length <= 0)
      && (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedReportTierItems == undefined || this.selectedReportTierItems.length <= 0)
      && (this.selectedCreatedByIems == undefined || this.selectedCreatedByIems.length <= 0) && datePicker.value == '' && datePicker1.value == '') {
      clearFilterTag.classList.add("disabledbutton");
      clearFilterTag.classList.add("disable-section");
    }
    this.filteredDataModel.scope = items;
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);
  }
  setLocaleMessages() {
    this.imageName = this.translate.instant(this.imageKey);
  }
  loadMyChildComponent(action) {
    this.loadChildComp.emit(action);
    this.disableControls = true;
    this._eventService.getEvent(EventConstants.EntityCRUD).publish(action);

  }

  loadDatasheet() {
    const editDatasheet = this.dialogService.open(EditDatasheetComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  downloadEntities() {
    this._eventService.getEvent(EventConstants.EntityDownload).publish(this.filteredDataModel);
  }
  clearFilters() {
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    this.emptyDisableFilters();
    this.filteredDataModel = new EntityFilterViewModel();
    // this.filteredDataModel.projectID = "DigiDox3.0";
    const project = this.shareDetailService.getORganizationDetail()
    this.filteredDataModel.projectID = project.projectId;
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);
    // this.manageEntity.emit(this.filteredDataModel);
  }
  emptyDisableFilters() {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.add("disabledbutton");
    clearFilterTag.classList.add("disable-section");
    this.selectedEntityItems = [];
    this.selectedEntityShortNameItems = [];
    this.selectedCountryItems = [];
    this.selectedReportTierItems = [];
    this.selectedEntityIdItems = [];
    this.selectedCreatedByIems = [];
    this.selectedInscopeItems = [];
    let datePicker = <HTMLInputElement>document.getElementById("taxableYearDate");
      if(datePicker != null)
    datePicker.value = "";
    datePicker = <HTMLInputElement>document.getElementById("createdDate");
      if(datePicker != null)
    datePicker.value = "";
  }
  onDateSelect(item: any, type: any) {
    if (!item) return;
    this._eventService.getEvent(EventConstants.ManageEntity).publish("EditDeletetrue");
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.remove("disabledbutton");
    clearFilterTag.classList.remove("disable-section");
    var startDateSelected = item[0];
    var endDateSelected = this.getEndDateTime(item[1]);
    if (type == 'TaxableYearDate') {
      this.filteredDataModel.taxableYearStart = startDateSelected;
      this.filteredDataModel.taxableYearEnd = endDateSelected;
    }
    else if (type == 'CreatedDate') {
      this.filteredDataModel.createdDateStart = startDateSelected;
      this.filteredDataModel.createdDateTo = endDateSelected;
    }
    this._eventService.getEvent(EventConstants.EntityFilter).publish(this.filteredDataModel);
  }

  toggleCollapse() {
    this.show = !this.show;
    let transFilterID = this.el.nativeElement.querySelector("#entityFilters-section");
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
 getEndDateTime(date: any): any
 {
   return moment(date).set({h: 23, m: 59, s: 59}).toDate();
 }
 
}
