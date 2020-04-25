import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { NbDialogService, NbDateService } from '@nebular/theme';
import { DeliverableColumnListComponent } from '../../deliverable-column-list/deliverable-column-list.component';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ProjectManagementService } from '../../../services/project-management.service';
import { deliverableFilterViewModel, deliverableFilterResponse, GetDateModel } from '../../../@models/deliverable/deliverable';
import { ProjectDeliverableService } from '../../../services/project-deliverable.service';
import { Subscription } from 'rxjs';
import { UserUISetting } from '../../../../../@models/user';
import { StorageService, StorageKeys } from '../../../../../@core/services/storage/storage.service';
import { UserService } from '../../../../user/user.service';
import { UserRightsViewModel } from '../../../../../@models/userAdmin';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-deliverable-level2',
  templateUrl: './deliverable-level2.component.html',
  styleUrls: ['./deliverable-level2.component.scss']
})
export class DeliverableLevel2Component implements OnInit, OnDestroy {

  currentSubscriptions: Subscription;
  show: boolean;
  imageName: string = this.translate.instant("expand");
  userUISetting: UserUISetting;

  showEditableFields: boolean = false;

  public ddlSettings: any;
  public ddlListUsers: any;
  public ddlListRoles: any;
  public ddlListCountry: any;
  public ddlListCreatedBy: any;

  //Drop down settings
  public ddlReportTierSettings: any;
  public ddlCountriesSettings: any;
  public ddlMilestonesSettings: any;
  public ddlDeliverableNamesSettings: any;

  creationMinDate: Date;
  creationMaxDate: Date;

  cbcMinDate = new Date();
  cbcMaxDate = new Date();
  TargetMinDate = new Date();
  TargetMaxDate = new Date();
  StatutoryMinDate = new Date();
  StatutoryMaxDate = new Date();
  TaxableMinDate = new Date();
  TaxableMaxDate = new Date();

  userRights= new UserRightsViewModel();
  userHasAccess:boolean=false;

  DeliverableName;
  CountryName;
  ReportType = '';
  Milestone = '';
  TargetDeliverableDates;
  SatutoryDate = '';
  TaxableYear = '';
  CBCDates;
  DeliverableNames = [];
  Country = [];
  ReportTier = [];
  Milestones = [];
  DeliverableFilters = new deliverableFilterViewModel();

  public ddlReportTiers: any;
  public ddlCountries: any;
  public ddlMilestones: any;
  public ddlDeliverableNames: any;

  constructor(private dialogService: NbDialogService, private el: ElementRef,
    private managementService: ProjectManagementService, private projectDeliverableService: ProjectDeliverableService,
    private translate:TranslateService,
    private dateService: NbDateService<Date>, private datePipe: DatePipe, private storageService: StorageService, private userservice: UserService) {
    this.currentSubscriptions = new Subscription();
    this.userUISetting = new UserUISetting();
  }

  ngOnInit() {
    this.subscriptions();
    this.getDropDownFilterData();
    this.setFilterSettings();
    this.setManageAdminFilterSettings();
    this.managementService.ResetFilter();
    this.managementService.currentReloadDeliverableGrid.subscribe((flag) => {
      if (flag) {
        this.getDropDownFilterData();
      }
    });
    this.userUISetting = this.userservice.getCurrentUserUISettings();

    if(this.userUISetting.isMenuExpanded){
      this.toggleCollapse();
   }
  }

  subscriptions() {
    this.currentSubscriptions.add(this.managementService.currentUserRights.subscribe(userRights=>
      {
        if(userRights)
        {
          this.userRights= userRights;
          this.userHasAccess=this.userRights.isCentralUser;
        }
      }));
  }

  setManageAdminFilterSettings() {
    this.ddlSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('Select All'),
      unSelectAllText: this.translate.instant('UnSelect All'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
  }

  setFilterSettings() {
    this.ddlReportTierSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'tier',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.ddlCountriesSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'country',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    }

    this.ddlDeliverableNamesSettings = {
      singleSelection: false,
      idField: 'name',
      textField: 'name',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.ddlMilestonesSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'description',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
  }

  showColumnCustomizeDialog() {
    const columnCustomizeRef = this.dialogService.open(DeliverableColumnListComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  getDropDownFilterData() {

    this.projectDeliverableService.loadFilterData().subscribe((response: deliverableFilterResponse) => {

      if (response) {
        this.ddlReportTiers = response.reportTiers;
        this.ddlCountries = response.countries;
        this.ddlDeliverableNames = response.deliverableName;
        this.ddlMilestones = response.milestones;
        const CBCStartDate = this.GetDate(response.cbcNotificationStartDate);
        const CBCEndDate = this.GetDate(response.cbcNotificationEndDate);
        const StatutoryStartDate = this.GetDate(response.statutoryDueDateStartDate);
        const StatutoryEndDate = this.GetDate(response.statutoryDueDateEndDate);
        const TaxableStartDate = this.GetDate(response.taxableYearStartDate);
        const TaxableEndDate = this.GetDate(response.taxableYearEndDate);
        const TargetStartDate = this.GetDate(response.targetDeliverableIssueStartDate);
        const TargetEndDate = this.GetDate(response.targetDeliverableIssueEndDate);
        this.cbcMinDate = new Date(CBCStartDate.Year, CBCStartDate.Month, CBCStartDate.Day);
        this.cbcMaxDate = new Date(CBCEndDate.Year, CBCEndDate.Month, CBCEndDate.Day);
        this.StatutoryMinDate = new Date(StatutoryStartDate.Year, StatutoryStartDate.Month, StatutoryStartDate.Day);
        this.StatutoryMaxDate = new Date(StatutoryEndDate.Year, StatutoryEndDate.Month, StatutoryEndDate.Day);
        this.TaxableMinDate = new Date(TaxableStartDate.Year, TaxableStartDate.Month, TaxableStartDate.Day);
        this.TaxableMaxDate = new Date(TaxableEndDate.Year, TaxableEndDate.Month, TaxableEndDate.Day);
        this.TargetMinDate = new Date(TargetStartDate.Year, TargetStartDate.Month, TargetStartDate.Day);
        this.TargetMaxDate = new Date(TargetEndDate.Year, TargetEndDate.Month, TargetEndDate.Day);
      }
    });

  }

  GetDate(date) {

    return {
      Year: parseInt(moment(date).local().format('YYYY')),
      Month: parseInt(moment(date).local().format('MM')),
      Day: parseInt(moment(date).local().format('D')),
    }
  }

  createDeliverable() {
    this.managementService.changeCreateDeliverableFlag(true);
    this.toggleCollapse();
  }

  clearFilters() {
    this.DeliverableName = '';
    this.CountryName = '';
    this.ReportType = '';
    this.Milestone = '';
    this.TargetDeliverableDates = '';
    this.SatutoryDate = '';
    this.TaxableYear = '';
    this.CBCDates = '';
    this.managementService.ResetFilter();

  }


  editDeliverables() {
    this.showEditableFields = !this.showEditableFields;
    this.show = false;
  }


  editCompleteOrCancel(event) {

    if (event) {
      this.managementService.changeReloadDeliverableGrid(true);
    }

    this.showEditableFields = false;

  }

  downloadDeliverables()
  {
    this.managementService.changeDownloadDeliverableFlag(true);
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }


  // filter starts 

  onDeliverableSelect(items) {
    if (Array.isArray(items)) { this.DeliverableNames = items; } else { this.DeliverableNames.push(items); }
    this.managementService.DeliverableFilters.deliverableName = this.DeliverableNames;
    this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
  }
  onDeliverableDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.DeliverableNames = items;
    } else {
      const index = this.DeliverableNames.indexOf(items);
      (index !== -1) ? this.DeliverableNames.splice(index, 1) : this.DeliverableNames;
    }
    this.managementService.DeliverableFilters.deliverableName = this.DeliverableNames;
    this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
  }

  onCountrySelect(items) {
    if (Array.isArray(items)) {
      items.forEach((element) => { this.Country.push(element.id); })
    } else {
      this.Country.push(items.id);
    }
    this.managementService.DeliverableFilters.countries = this.Country;
    this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
  }

  onCountryDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.Country = items;
    } else {
      const index = this.Country.indexOf(items.id);
      (index !== -1) ? this.Country.splice(index, 1) : this.Country;
    }
    this.managementService.DeliverableFilters.countries = this.Country;
    this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
  }

  onReportTierSelect(items) {
    if (Array.isArray(items)) {
      items.forEach((element) => { this.ReportTier.push(element.id); })
    } else { this.ReportTier.push(items.id); }
    this.managementService.DeliverableFilters.reportTiers = this.ReportTier;
    this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
  }

  onReportTierDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.ReportTier = items;
    } else {
      const index = this.ReportTier.indexOf(items.id);
      if (index !== -1) { this.ReportTier.splice(index, 1); }
    }
    this.managementService.DeliverableFilters.reportTiers = this.ReportTier;
    this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
  }

  onMilestoneSelect(items) {
    if (Array.isArray(items)) {
      items.forEach((element) => {
        this.Milestones.push(element.id);
      });
    } else {
      this.Milestones.push(items.id);
    }
    this.managementService.DeliverableFilters.milestones = this.Milestones;
    this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
  }

  onMilestoneDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.Milestones = items;
    } else {
      const index = this.Milestones.indexOf(items.id);
      if (index !== -1) { this.Milestones.splice(index, 1) }
    }
    this.managementService.DeliverableFilters.milestones = this.Milestones;
    this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
  }

  onTargetDeliverableDate(item) {
    if (item) {
      this.managementService.DeliverableFilters.targetDeliverableIssueStartDate = item[0];
      this.managementService.DeliverableFilters.targetDeliverableIssueEndDate = item[1];
      this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
    }
  }

  onStatutoryDate(item) {
    if (item) {
      this.managementService.DeliverableFilters.statutoryDueDateStartDate = item[0];
      this.managementService.DeliverableFilters.statutoryDueDateEndDate = item[1];
      this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
    }
  }

  onCBCDate(item) {
    if (item) {
      this.managementService.DeliverableFilters.cbcNotificationStartDate = item[0];
      this.managementService.DeliverableFilters.cbcNotificationEndDate = item[1];
      this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
    }
  }

  onTaxableDate(item) {
    if (item) {
      this.managementService.DeliverableFilters.taxableYearStartDate = item[0];
      this.managementService.DeliverableFilters.taxableYearEndDate = item[1];
      this.managementService.SetOrResetFilter(this.managementService.DeliverableFilters);
    }
  }
  // filter ends



  toggleCollapse() {
    this.showEditableFields = false;
    this.show = !this.show;
    if (this.show) {
      this.userUISetting.isMenuExpanded = true;
      this.imageName = this.translate.instant("collapse");
    }
    else {
      this.userUISetting.isMenuExpanded = false;
      this.imageName = this.translate.instant("expand");
    }
    this.userservice.updateCurrentUserUISettings(this.userUISetting);
  }
  
}
