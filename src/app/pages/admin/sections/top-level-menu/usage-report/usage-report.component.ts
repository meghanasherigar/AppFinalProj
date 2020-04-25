import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Region, Country } from '../../../../../@models/user';
// import { GlobalUltimateParent, Organization,  UseCase } from '../../../../../@models/masterData/masterDataModels';
import { SharedServiceAggregatorService } from '../../../../../shared/services/shared-service-aggregator.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { EventConstants, TreeViewConstant } from '../../../../../@models/common/eventConstants';
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { Control } from 'leaflet';
import { ProjectUsageViewModel, ProjectUsageFilterViewModel, ProjectUsageFilterMenuViewModel, ProjectIndustryViewModel } from '../../../../../@models/admin/usageReport';
import { DatePipe } from '@angular/common';
import { UsageReportService } from '../../../services/usage-report.service';
import { LocalDataSource } from '../../../../../@core/components/ng2-smart-table';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../@models/common/dialog';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { TreeViewService } from '../../../../../shared/services/tree-view.service';

@Component({
  selector: 'ngx-top-level-menu-usage-report',
  templateUrl: './usage-report.component.html',
  styleUrls: ['./usage-report.component.scss'],
  providers: [
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          return TreeViewService.getText(selection, TreeViewConstant.defaultIndustry);
        },
      }),
    }
  ],
})
export class TopLevelMenuUsageReportComponent implements OnInit, OnDestroy {
  usageFilterForm: FormGroup;
  subscriptions: Subscription = new Subscription();
  isExpanded = true;


  orgIndustryOthersVisible: false;
  // To expand/collapse filters
  public show: boolean = false;
  public imageName: string = this.translate.instant('Collapse');
  ddlistGUP: any;
  selectedGUPItems: [];
  ddlistOrganization: any;
  selectedOrgItems: [];
  ddlistRegion: any;
  selectedRegionItems: [];
  ddlistCountry: any;
  selectedCountryItems: [];
  ddlistUsecase: any;
  selectedUsecaseItems: [];
  ddlistIndustry: any;
  selectedIndustryItems: [];
  ddlistProjectName: any;
  selectedProjectNameItems: any;
  ddlistCreatedBy: any;
  selectedCreatedByItems: [];
  private ddCountrySettings: any;
  private ddOrganizationIndustrySettings: any;
  private ddListOrganizationIndustryData: any;
  dropdownSettings = {};
  projectUsageFilterViewModel = new ProjectUsageFilterViewModel();
  usageReport: ProjectUsageViewModel[];
  source: LocalDataSource = new LocalDataSource();

  ddTreeViewConfig = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 100
  }


  constructor(
    private sharedService: SharedServiceAggregatorService,
    private alertService: AlertService,
    private readonly _eventService: EventAggregatorService,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private usageReportService: UsageReportService,
    private datepipe: DatePipe,
    private dialogService: DialogService,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {

    this.projectUsageFilterViewModel.pageIndex = 1;
    this.projectUsageFilterViewModel.pageSize = 100;
    this.ddlistIndustry = [];
    this.getUsageReportFilterData();
    this.dropDownFilterSettings();

    this.subscriptions.add(this._eventService.getEvent(EventConstants.AdminUsageReport).subscribe((payload) => {
      let downloadTag = this.el.nativeElement.querySelector("#downloadIcon");
      if (payload == "EnableDownload") {
        downloadTag.classList.remove("disable-section");
        downloadTag.classList.remove("disabledbutton");
      }
      else if (payload == "DisableDownload") {
        downloadTag.classList.add("disable-section");
        downloadTag.classList.add("disabledbutton");
      }
      else {
        this.geReportFiltersData(payload);
      }
    }));

    // this
    //   .usageReportService
    //   .getProjectUsageFilterMenuData()
    //   .subscribe((data: ProjectUsageFilterMenuViewModel) => {
    //     //this.source.load(data);
    //     this.ddlistGUP = data.gupIds;
    //     this.ddlistOrganization = data.organizationIds;
    //     this.ddlistUsecase = data.useCaseIds;
    //     this.ddlistRegion = data.regionIds;
    //     this.ddlistCountry = data.countryIds;
    //     this.ddlistCreatedBy = data.createdBy;
    //     this.ddlistIndustry = this.getIndustryData(data.industryIds);
    //     //this._eventService.getEvent(EventConstants.AdminUsageReport).publish(data);
    //   });

    // this.subscriptions.add(this._eventService.getEvent(EventConstants.UsageReportFilter).subscribe((payload) => {
    //   this.geReportFiltersData(payload);
    // }));
  }

  private dropDownFilterSettings() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.manage-admin.labels.selectAll'),
      unSelectAllText: this.translate.instant('screens.manage-admin.labels.unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true
    }
  }

  getUsageReportFilterData() {
    this.subscriptions.add(this.usageReportService.getProjectUsageFilterMenuData()
      .subscribe((data: ProjectUsageFilterMenuViewModel) => {

        for (var i = 0; i < data.gupIds.length; i++) {
          if (data.gupIds[i]["name"] == '' || data.gupIds[i]["name"] == null) {
            data.gupIds[i].name = 'Blank';
          }
        };
        this.ddlistGUP = data.gupIds;

        for (var i = 0; i < data.organizationIds.length; i++) {
          if (data.organizationIds[i]["name"] == '' || data.organizationIds[i]["name"] == null) {
            data.organizationIds[i].name = 'Blank';
          }
        };
        this.ddlistOrganization = data.organizationIds;

        for (var i = 0; i < data.useCaseIds.length; i++) {
          if (data.useCaseIds[i]["name"] == '' || data.useCaseIds[i]["name"] == null) {
            data.useCaseIds[i].name = 'Blank';
          }
        };
        this.ddlistUsecase = data.useCaseIds;

        for (var i = 0; i < data.regionIds.length; i++) {
          if (data.regionIds[i]["name"] == '' || data.regionIds[i]["name"] == null) {
            data.regionIds[i].name = 'Blank';
          }
        };
        this.ddlistRegion = data.regionIds;

        for (var i = 0; i < data.countryIds.length; i++) {
          if (data.countryIds[i]["name"] == '' || data.countryIds[i]["name"] == null) {
            data.countryIds[i].name = 'Blank';
          }
        };
        this.ddlistCountry = data.countryIds;
        this.ddlistIndustry = this.getIndustryData(data.industryIds);

        this.ddlistProjectName = data.projectName;

        for (var i = 0; i < data.createdBy.length; i++) {
          if (data.createdBy[i]["name"] == '' || data.createdBy[i]["name"] == null) {
            data.createdBy[i].name = 'Blank';
          }
        };
        this.ddlistCreatedBy = data.createdBy;
      }
      ));
  }

  geReportFiltersData(payload) {
    this.ddlistGUP = payload.gupIds;
    this.ddlistOrganization = payload.organizationIds;
    this.ddlistUsecase = payload.useCaseIds;
    this.ddlistRegion = payload.regionIds;
    this.ddlistCountry = payload.countryIds;
    this.ddlistCreatedBy = payload.createdBy;
    this.ddlistIndustry = payload.industryIds;
    this.ddlistProjectName = payload.projectName;
  }

  onItemSelect(item: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if ((this.selectedProjectNameItems == undefined || this.selectedProjectNameItems.length <= 0) &&
      (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedGUPItems == undefined || this.selectedGUPItems.length <= 0) &&
      (this.selectedOrgItems == undefined || this.selectedOrgItems.length <= 0) &&
      (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
      (this.selectedUsecaseItems == undefined || this.selectedUsecaseItems.length <= 0) &&
      this.projectUsageFilterViewModel.industryIds.length <= 0 &&
      datePicker.value == '') {
      clearFilterTag.classList.add("disableFilterSelect");
    }
    else
      clearFilterTag.classList.remove("disableFilterSelect");

    this.projectUsageFilterViewModel.projectName = this.selectedProjectNameItems;

    if (this.selectedCountryItems != undefined) {
      this.projectUsageFilterViewModel.countryIds = new Array();
      this.selectedCountryItems.forEach((element: never) => {
        this.projectUsageFilterViewModel.countryIds.push(element["id"]);
      });
    }
    if (this.selectedGUPItems != undefined) {
      this.projectUsageFilterViewModel.gupIds = new Array();
      this.selectedGUPItems.forEach((element: never) => {
        this.projectUsageFilterViewModel.gupIds.push(element["id"]);
      });
    }
    if (this.selectedOrgItems != undefined) {
      this.projectUsageFilterViewModel.organizationIds = new Array();
      this.selectedOrgItems.forEach((element: never) => {
        this.projectUsageFilterViewModel.organizationIds.push(element["id"]);
      });
    }
    if (this.selectedRegionItems != undefined) {
      this.projectUsageFilterViewModel.regionIds = new Array();
      this.selectedRegionItems.forEach((element: never) => {
        this.projectUsageFilterViewModel.regionIds.push(element["id"]);
      });
    }
    if (this.selectedUsecaseItems != undefined) {
      this.projectUsageFilterViewModel.useCaseIds = new Array();
      this.selectedUsecaseItems.forEach((element: never) => {
        this.projectUsageFilterViewModel.useCaseIds.push(element["id"]);
      });
    }
    if (this.selectedCreatedByItems != undefined) {
      this.projectUsageFilterViewModel.createdBy = new Array();
      this.selectedCreatedByItems.forEach((element: never) => {
        this.projectUsageFilterViewModel.createdBy.push(element["id"]);
      });
    }

    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  getIndustryData(industry: ProjectIndustryViewModel[]) {
    var _industries = [];

    industry.forEach(element => {
      var subIndustries = [];
      element.subIndustries.forEach(subelement => {
        if (subelement.subIndustry != null) {
          subIndustries.push(new TreeviewItem({ checked: false, text: (subelement.subIndustry != null) ? subelement.subIndustry : '', value: subelement.id }));
        }
      });

      if (element.industry != null) {
        if (!element.subIndustries || element.subIndustries.length == 0)
          _industries.push(new TreeviewItem({ checked: false, text: (element.industry != null) ? element.industry : '', value: element.id }));
        else {
          _industries.push(new TreeviewItem({ checked: false, text: (element.industry != null) ? element.industry : '', value: element.id, children: subIndustries }));
        }
      }
    });
    return _industries;
  }

  onSelectAllGupNames(items: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disableFilterSelect");
    }
    else if ((this.selectedProjectNameItems == undefined || this.selectedProjectNameItems.length <= 0) &&
      (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedOrgItems == undefined || this.selectedOrgItems.length <= 0) &&
      (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
      (this.selectedUsecaseItems == undefined || this.selectedUsecaseItems.length <= 0) &&
      this.projectUsageFilterViewModel.industryIds.length <= 0 &&
      datePicker.value == '') {
      clearFilterTag.classList.add("disableFilterSelect");
    }
    this.projectUsageFilterViewModel.gupIds = new Array();
    items.forEach((element: never) => {
      this.projectUsageFilterViewModel.gupIds.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  onSelectAllCountry(items: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disableFilterSelect");
    }
    else if ((this.selectedProjectNameItems == undefined || this.selectedProjectNameItems.length <= 0) &&
      (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
      (this.selectedGUPItems == undefined || this.selectedGUPItems.length <= 0) &&
      (this.selectedOrgItems == undefined || this.selectedOrgItems.length <= 0) &&
      (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
      (this.selectedUsecaseItems == undefined || this.selectedUsecaseItems.length <= 0) &&
      this.projectUsageFilterViewModel.industryIds.length <= 0 &&
      datePicker.value == '') {
      clearFilterTag.classList.add("disableFilterSelect");
    }
    this.projectUsageFilterViewModel.countryIds = new Array();
    items.forEach((element: never) => {
      this.projectUsageFilterViewModel.countryIds.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  onSelectAllCreatedBy(items: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disableFilterSelect");
    }
    else if ((this.selectedProjectNameItems == undefined || this.selectedProjectNameItems.length <= 0) &&
      (this.selectedGUPItems == undefined || this.selectedGUPItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedOrgItems == undefined || this.selectedOrgItems.length <= 0) &&
      (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
      (this.selectedUsecaseItems == undefined || this.selectedUsecaseItems.length <= 0) &&
      this.projectUsageFilterViewModel.industryIds.length <= 0 &&
      datePicker.value == '') {
      clearFilterTag.classList.add("disableFilterSelect");
    }
    this.projectUsageFilterViewModel.createdBy = new Array();
    items.forEach((element: never) => {
      this.projectUsageFilterViewModel.createdBy.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  onSelectAllOrganizations(items: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disableFilterSelect");
    }
    else if ((this.selectedProjectNameItems == undefined || this.selectedProjectNameItems.length <= 0) &&
      (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedGUPItems == undefined || this.selectedGUPItems.length <= 0) &&
      (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
      (this.selectedUsecaseItems == undefined || this.selectedUsecaseItems.length <= 0) &&
      this.projectUsageFilterViewModel.industryIds.length <= 0 &&
      datePicker.value == '') {
      clearFilterTag.classList.add("disableFilterSelect");
    }
    this.projectUsageFilterViewModel.organizationIds = new Array();
    items.forEach((element: never) => {
      this.projectUsageFilterViewModel.organizationIds.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  onSelectAllRegions(items: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");

    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disableFilterSelect");
    }
    else if ((this.selectedProjectNameItems == undefined || this.selectedProjectNameItems.length <= 0) &&
      (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedOrgItems == undefined || this.selectedOrgItems.length <= 0) &&
      (this.selectedGUPItems == undefined || this.selectedGUPItems.length <= 0) &&
      (this.selectedUsecaseItems == undefined || this.selectedUsecaseItems.length <= 0) &&
      this.projectUsageFilterViewModel.industryIds.length <= 0 &&
      datePicker.value == '') {
      clearFilterTag.classList.add("disableFilterSelect");
    }
    this.projectUsageFilterViewModel.regionIds = new Array();
    items.forEach((element: never) => {
      this.projectUsageFilterViewModel.regionIds.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  onSelectAllUsecases(items: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disableFilterSelect");
    }
    else if ((this.selectedProjectNameItems == undefined || this.selectedProjectNameItems.length <= 0) &&
      (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedOrgItems == undefined || this.selectedOrgItems.length <= 0) &&
      (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
      (this.selectedGUPItems == undefined || this.selectedGUPItems.length <= 0) &&
      this.projectUsageFilterViewModel.industryIds.length <= 0 &&
      datePicker.value == '') {
      clearFilterTag.classList.add("disableFilterSelect");
    }
    this.projectUsageFilterViewModel.useCaseIds = new Array();
    items.forEach((element: never) => {
      this.projectUsageFilterViewModel.useCaseIds.push(element["id"]);
    });
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);

  }

  onIndustrySelected(items: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if (items.length != 0) {
      clearFilterTag.classList.remove("disableFilterSelect");

    }
    else
      if ((this.selectedProjectNameItems == undefined || this.selectedProjectNameItems.length <= 0) &&
        (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
        (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
        (this.selectedGUPItems == undefined || this.selectedGUPItems.length <= 0) &&
        (this.selectedOrgItems == undefined || this.selectedOrgItems.length <= 0) &&
        (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
        (this.selectedUsecaseItems == undefined || this.selectedUsecaseItems.length <= 0) &&
        datePicker.value == '') {
        clearFilterTag.classList.add("disableFilterSelect");
      }
    this.projectUsageFilterViewModel.industryIds = items;
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  onSelectAllProjects(items: any) {
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    if (items.length > 0) {
      clearFilterTag.classList.remove("disableFilterSelect");
    }
    else if ((this.selectedGUPItems == undefined || this.selectedGUPItems.length <= 0) &&
      (this.selectedCreatedByItems == undefined || this.selectedCreatedByItems.length <= 0) &&
      (this.selectedCountryItems == undefined || this.selectedCountryItems.length <= 0) &&
      (this.selectedOrgItems == undefined || this.selectedOrgItems.length <= 0) &&
      (this.selectedRegionItems == undefined || this.selectedRegionItems.length <= 0) &&
      (this.selectedUsecaseItems == undefined || this.selectedUsecaseItems.length <= 0) &&
      this.projectUsageFilterViewModel.industryIds.length <= 0 &&
      datePicker.value == '') {
      clearFilterTag.classList.add("disableFilterSelect");
    }
    this.projectUsageFilterViewModel.projectName = items;
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }


  clearFilters() {
    this.selectedGUPItems = [];
    this.selectedCountryItems = [];
    this.selectedCreatedByItems = [];
    this.selectedIndustryItems = [];
    this.selectedProjectNameItems = [];
    this.selectedOrgItems = [];
    this.selectedUsecaseItems = [];
    this.selectedRegionItems = [];
    this.getUsageReportFilterData();
    this.projectUsageFilterViewModel.industryIds = undefined;
    let datePicker = <HTMLInputElement>document.getElementById("creationDate");
    datePicker.value = "";
    this.projectUsageFilterViewModel = new ProjectUsageFilterViewModel();
    this.projectUsageFilterViewModel.pageIndex = 1;
    this.projectUsageFilterViewModel.pageSize = 100;
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.add("disableFilterSelect");
    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  onDateSelect(item: any, type: any) {
    if (!item) return;
    let clearFilterTag = this.el.nativeElement.querySelector("#clearFilterIcon");
    clearFilterTag.classList.remove("disableFilterSelect");
    var startDateSelected = item[0];
    var endDateSelected = this.getEndDateTime(item[1]);
    if (type == 'CreationDate') {
      this.projectUsageFilterViewModel.createdOnStart = startDateSelected;
      this.projectUsageFilterViewModel.createdOnTo = endDateSelected;
    }

    this._eventService.getEvent(EventConstants.UsageReportFilter).publish(this.projectUsageFilterViewModel);
  }

  // convenience getter for easy access to form fields
  get f() { return this.usageFilterForm.controls; }

  toggle() {
    this.isExpanded = !this.isExpanded;
    return false;
  }

  onSubmit() {
    // this.usageFilterForm.valid
    this._eventService.getEvent(EventConstants.AdminUsageReport).publish(this.usageFilterForm.value);
    return false;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleCollapse() {
    this.show = !this.show;
    let entityTag = this.el.nativeElement.querySelector("#usagereportFilters");
    let filterIcon = this.el.nativeElement.querySelector(".filter-icon-wrapper");

    // To change the name of image.
    if (this.show) {
      entityTag.classList.remove('collapsed');
      this.imageName = this.translate.instant("collapse");
      var industryButtons = document.querySelectorAll('.home-industry .btn');
      industryButtons.forEach(item => {
        item.classList.add('industry');
      });
    }
    else {
      this.imageName = this.translate.instant("expand");
      entityTag.classList.add('collapsed');
      filterIcon.classList.show();
    }
  }
  downloadUsageReport() {
    this.usageReportService.download_UsageReport(this.projectUsageFilterViewModel)
      .subscribe(data => {       
        this.downloadFile(this.convertbase64toArrayBuffer(data.content),data.fileName);
      }
      ),
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
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
      this.dialogService.Open(DialogTypes.Warning, "Usage Report data could not be downloaded. Please try again!");
    }
  }
  getEndDateTime(date: any): any
  {
    return moment(date).set({h: 23, m: 59, s: 59}).toDate();
  }
}
