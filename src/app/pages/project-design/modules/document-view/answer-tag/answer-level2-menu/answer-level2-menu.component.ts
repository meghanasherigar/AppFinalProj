import { Component, OnInit, ElementRef } from '@angular/core';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { AnswertagService } from '../../../../services/answertag.service';
import { TranslateService } from '@ngx-translate/core';
import { EntityVariableFilterViewModel, ProjectVariableFilterViewModel, AnswerTagIcons } from '../../../../../../@models/projectDesigner/answertag';
import * as moment from 'moment';
import { UserRightsViewModel } from '../../../../../../@models/userAdmin';
import { DesignerService } from '../../../../services/designer.service';
import { NbDialogService } from '@nebular/theme';
import { CreateAnswerProjectVariableComponent } from '../create-answer-project-variable/create-answer-project-variable.component';

@Component({
  selector: 'ngx-answer-level2-menu',
  templateUrl: './answer-level2-menu.component.html',
  styleUrls: ['./answer-level2-menu.component.scss']
})
export class AnswerLevel2MenuComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  LegalEntityNameList: any = [];
  IsSystemTags:boolean;
  selectedLegalEntityNameItems: [];
  dropdownSettings: {};
  ShortNameList: any = [];
  selectedShortNameItems: [];
  CountryList: any = [];
  selectedCountryItems: [];
  TaxableYearEndList: [];
  isShowDelete:boolean;
  selectedTaxableYearEndItems: [];
  VariableList: any = [];
  selectedVariableItems: [];
  ValueList: any = [];
  selectedValueItems: [];
  isIconVisible = true;
  enableDeleteIconVisible = false;
  isClearFilterVisible = false;
  // To expand/collapse filters
  public show: boolean = true;
  public imageName: string = this.translate.instant("collapse");
  IsEntityEnableFilter: boolean = false;
  IsAnswerTagTabSelected:boolean = false;
  entityVariableFilterViewModel: EntityVariableFilterViewModel = new EntityVariableFilterViewModel();
  projectVariableFilterViewModel: ProjectVariableFilterViewModel = new ProjectVariableFilterViewModel();
  userAccessRights: UserRightsViewModel;
  answerTagIcons: AnswerTagIcons;

  constructor(private _eventService: EventAggregatorService,
    private shareDetailService: ShareDetailService,
    private dialogService: NbDialogService,
    private ansTagService: AnswertagService,
    private translate: TranslateService,
    private el: ElementRef,
    private designerService: DesignerService, ) { }

  ngOnInit() {
    this.AccessRights();
    this.isShowDelete=true;
    const orgdetail = this.shareDetailService.getORganizationDetail();
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.systemTagDefaultActive).publish(true);
    this.ansTagService.getentityvariablefiltermenudata(orgdetail.projectId).subscribe(data => {
      this.LegalEntityNameList = data.legalEntityNames;
      this.ShortNameList = data.entityShortNames;
      this.CountryList = data.countryNames;
    });
    
    this.loadProjectVariableFilter();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableRefreshFilter).subscribe((payload)=>{
      this.loadProjectVariableFilter();
    }));

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.createAnswer).subscribe((payload)=>{
      this.answerTagIcons = new AnswerTagIcons();
      if (payload == "DeleteRecord") {
        this.enableDeleteIconVisible = true;
        if (this.designerService.docViewAccessRights){
          this.userAccessRights = this.designerService.docViewAccessRights;
          if(this.userAccessRights.isCentralUser){
            this.answerTagIcons.enableDelete = true;
            this.answerTagIcons.enableCreate = true;
          }
        }
      }
      else
      {
        this.answerTagIcons.enableCreate = true;
        this.enableDeleteIconVisible = false;
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.systemTabSelection).subscribe((payload) => {
      if (payload == "Entity Variable") {
        this.IsEntityEnableFilter = true;
      }
      else {
        this.AccessRights();
        this.IsEntityEnableFilter = false;
      }
    }));
  }

  loadProjectVariableFilter(){
    const orgdetail = this.shareDetailService.getORganizationDetail();
    this.ansTagService.getprojectvariablefiltermenudata(orgdetail.projectId).subscribe(data => {
      this.VariableList = data.variables;
      this.ValueList = data.values;
    });
  }

  createProject() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.EnableAnswerTagCreateIcon).publish(true);
    this.dialogService.open(CreateAnswerProjectVariableComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  
  onItemSelect(item: any) {
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");
    if ((this.selectedLegalEntityNameItems == undefined || this.selectedLegalEntityNameItems.length <= 0) &&
      (this.selectedShortNameItems == undefined || this.selectedShortNameItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0)
      && datePicker.value == '') {



      this.isClearFilterVisible = false;
    }
    else {
      this.isClearFilterVisible = true;
    }
    if (this.selectedLegalEntityNameItems != undefined) {
      this.entityVariableFilterViewModel.EntityIds = new Array();
      this.selectedLegalEntityNameItems.forEach((element: never) => {
        this.entityVariableFilterViewModel.EntityIds.push(element["id"]);
      });
    }
    if (this.selectedShortNameItems != undefined) {
      this.entityVariableFilterViewModel.EntityShortNames = new Array();
      this.selectedShortNameItems.forEach((element: never) => {
        this.entityVariableFilterViewModel.EntityShortNames.push(element);
      });
    }
    if (this.selectedCountryItems != undefined) {
      this.entityVariableFilterViewModel.CountryIds = new Array();
      this.selectedCountryItems.forEach((element: never) => {
        this.entityVariableFilterViewModel.CountryIds.push(element["id"]);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.entityVariableFilter).publish(this.entityVariableFilterViewModel);
  }

  onSelectAllLegalEntityName(items: any) {
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {


      this.isClearFilterVisible = true;
    }
    if ((this.selectedLegalEntityNameItems == undefined || this.selectedLegalEntityNameItems.length <= 0) &&
      (this.selectedShortNameItems == undefined || this.selectedShortNameItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0)
      && datePicker.value == '') {


      this.isClearFilterVisible = false;
    }
    if (this.selectedLegalEntityNameItems != undefined) {
      this.entityVariableFilterViewModel.EntityIds = new Array();
      items.forEach((element: never) => {
        this.entityVariableFilterViewModel.EntityIds.push(element["id"]);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.entityVariableFilter).publish(this.entityVariableFilterViewModel);
  }

  onSelectAllShortName(items: any) {
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");;
    if (items.length > 0) {
      this.isClearFilterVisible = true;
    }
    if ((this.selectedLegalEntityNameItems == undefined || this.selectedLegalEntityNameItems.length <= 0) &&
      (this.selectedShortNameItems == undefined || this.selectedShortNameItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0)
      && datePicker.value == '') {
      this.isClearFilterVisible = false;
    }
    if (this.selectedCountryItems != undefined) {
      this.entityVariableFilterViewModel.EntityShortNames = new Array();
      items.forEach((element: never) => {
        this.entityVariableFilterViewModel.EntityShortNames.push(element);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.entityVariableFilter).publish(this.entityVariableFilterViewModel);
  }

  onSelectAllCountry(items: any) {
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");
    if (items.length > 0) {
      this.isClearFilterVisible = true;

    }
    if ((this.selectedLegalEntityNameItems == undefined || this.selectedLegalEntityNameItems.length <= 0) &&
      (this.selectedShortNameItems == undefined || this.selectedShortNameItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0)
      && datePicker.value == '') {
      this.isClearFilterVisible = false;

    }
    if (this.selectedShortNameItems != undefined) {
      this.entityVariableFilterViewModel.CountryIds = new Array();
      items.forEach((element: never) => {
        this.entityVariableFilterViewModel.CountryIds.push(element["id"]);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.entityVariableFilter).publish(this.entityVariableFilterViewModel);
  }

  onDateSelect(item: any) {
    this.isClearFilterVisible = true;
    var startDateSelected = item[0];
    var endDateSelected = item[1];
    this.entityVariableFilterViewModel.TaxableYearStart = new Date(startDateSelected);
    this.entityVariableFilterViewModel.TaxableYearEnd = this.getEndDateTime(endDateSelected);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.entityVariableFilter).publish(this.entityVariableFilterViewModel);
  }

  getEndDateTime(date: any): any {
    return moment(date).set({ h: 23, m: 59, s: 59 }).toDate();
  }

  onProjectItemSelect(items: any) {
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");
    if ((this.selectedVariableItems == undefined || this.selectedVariableItems.length <= 0) &&
      (this.selectedValueItems == undefined || this.selectedValueItems.length <= 0)
      && datePicker.value == '') {


      this.isClearFilterVisible = false;
    }
    else {

      this.isClearFilterVisible = true;
    }
    this.projectVariableFilterViewModel.ProjectVariableIds = new Array();
    if (this.selectedVariableItems != undefined) {
      this.selectedVariableItems.forEach((element: never) => {
        this.projectVariableFilterViewModel.ProjectVariableIds.push(element["id"]);
      });
    }
    if (this.selectedValueItems != undefined) {
      this.selectedValueItems.forEach((element: never) => {
        this.projectVariableFilterViewModel.ProjectVariableIds.push(element["id"]);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableFilter).publish(this.projectVariableFilterViewModel);
  }

  onSelectAllVariable(items: any) {
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");
    if ((this.selectedVariableItems == undefined || this.selectedVariableItems.length <= 0) &&
      (this.selectedValueItems == undefined || this.selectedValueItems.length <= 0)
      && datePicker.value == '') {

      this.isClearFilterVisible = false;
    }
    else {

      this.isClearFilterVisible = true;
    }
    if (this.selectedVariableItems != undefined) {
      this.projectVariableFilterViewModel.ProjectVariableIds = new Array();
      items.forEach((element: never) => {
        this.projectVariableFilterViewModel.ProjectVariableIds.push(element["id"]);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableFilter).publish(this.projectVariableFilterViewModel);
  }


  onSelectAllValue(items: any) {
    let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");
    if ((this.selectedVariableItems == undefined || this.selectedVariableItems.length <= 0) &&
      (this.selectedValueItems == undefined || this.selectedValueItems.length <= 0)
      && datePicker.value == '') {

      this.isClearFilterVisible = false;
    }
    else {

      this.isClearFilterVisible = true;
    }
    if (this.selectedValueItems != undefined) {
      this.projectVariableFilterViewModel.ProjectVariableIds = new Array();
      items.forEach((element: never) => {
        this.projectVariableFilterViewModel.ProjectVariableIds.push(element["id"]);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableFilter).publish(this.projectVariableFilterViewModel);
  }

  toggleCollapse() {
    this.show = !this.show;
    let filterIcon = this.el.nativeElement.querySelector("#filterImg");

    // To change the name of image.
    if (this.show) {
      this.imageName = this.translate.instant("collapse");
    }
    else {
      this.imageName = this.translate.instant("expand");
      filterIcon.classList.show();
    }
  }

  selectedTab(tab) {
    if (tab.tabTitle == "#AnswerTags") {
      this.AccessRights();
      this.IsEntityEnableFilter = true;
      this.IsSystemTags = true;
      this.isShowDelete=false;
      let currentTab="1";
      this.IsAnswerTagTabSelected = true;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.answerTagDefaultTabActive).publish(currentTab);
    }
    else {
      this.IsEntityEnableFilter = true;
      this.IsSystemTags = false;
      this.isShowDelete=true;
      this.IsAnswerTagTabSelected = false;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.systemTagDefaultActive).publish(true);
    }
  }

  deleteVariable() {
    if (this.IsEntityEnableFilter === false) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.actionRequest).publish("DeleteProject");
    }
  }

  downloadVariable() {
    if(this.IsAnswerTagTabSelected == true){
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.actionRequest).publish("DownloadAnswerTag");
    }    
    else if (this.IsEntityEnableFilter === false) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.actionRequest).publish("DownloadProject");
    }
    else {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.actionRequest).publish("DownloadEntity");
    }
  }

  clearFilters() {
    this.isClearFilterVisible = false;
    if (this.IsEntityEnableFilter === false) {
      this.selectedVariableItems = [];
      this.selectedValueItems = [];
      this.projectVariableFilterViewModel = new ProjectVariableFilterViewModel();
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.projectVariableFilter).publish(this.projectVariableFilterViewModel);
    }
    else if (this.IsEntityEnableFilter === true) {
      this.selectedLegalEntityNameItems = [];
      this.selectedShortNameItems = [];
      this.selectedCountryItems = [];
      let datePicker = <HTMLInputElement>document.getElementById("eCreationDate");
      datePicker.value = "";
      this.entityVariableFilterViewModel = new EntityVariableFilterViewModel();
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.entityVariableFilter).publish(this.entityVariableFilterViewModel);
    }
  }

  AccessRights() {
    this.answerTagIcons = new AnswerTagIcons();
    if (this.designerService.docViewAccessRights) {
      this.userAccessRights = this.designerService.docViewAccessRights;
      if(this.userAccessRights.isCentralUser){
        this.answerTagIcons.enableCreate = true;
        if(this.enableDeleteIconVisible){
          this.answerTagIcons.enableDelete = true;
        }
      }
      else {
        this.answerTagIcons.enableCreate = false;
        this.answerTagIcons.enableDelete = false;
      }
    }
  }
}
