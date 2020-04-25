import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { LocalDataSource, ViewCell } from '../../../@core/components/ng2-smart-table';
import { HomeService } from '../home.service';
import { OrganizationResponse, OrganizationFilterViewModel, ProjectContext } from '../../../@models/organization';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { CustomHTML } from '../../../shared/services/custom-html.service';
import { EventConstants } from '../../../@models/common/eventConstants';
import { settings } from 'cluster';
import { AuthService } from '../../../shared/services/auth.service';
import { StorageService } from '../../../@core/services/storage/storage.service';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import * as moment from 'moment';
import { RoleService } from '../../../shared/services/role.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { UserService } from '../../user/user.service';
import { SortEvents } from '../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  constructor(
    private translate: TranslateService,
    private service: HomeService,
    private authservice: AuthService,
    private roleService: RoleService,
    private storageService: StorageService,
    private ngxLoader: NgxUiLoaderService,
    private readonly eventService: EventAggregatorService, private customHTML: CustomHTML, private userService: UserService) {
    this.loadViewHiddenEvent = false;
    this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setColumnSettings();
      this.source.refresh();
    }));

    this.setColumnSettings();
  }
  source: CommonDataSource = new CommonDataSource();
  orgNoDataFound = false;
  organizationId: any;
  isGridLoaded = false;
  editFlag = false;
  organizationFilterModel: OrganizationFilterViewModel;
  loadViewHiddenEvent: boolean;
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
  };
  message;

  //ngx-ui-loader configuration
  loaderId = 'OrganizationLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';


  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    const usersetting = this.roleService.getUserRole();
    this.organizationFilterModel = new OrganizationFilterViewModel();
    this.subscriptions.add(this.eventService.getEvent(EventConstants.AdminView).subscribe((payload: boolean) => {
      const userdata = this.roleService.getUserRole();
      this.loadOrganizations(userdata.adminView);
    }));

    this.organizationFilterModel.pageIndex = 1;
    this.organizationFilterModel.IsAdminViewEnabled = usersetting && usersetting.adminView;
    this.organizationFilterModel.IsFilterDataRequest = false;
    this.organizationFilterModel.pageSize = this.settings.pager.perPage;

    this.service.selectedOrganizationIds = [];
    this.service.selectedProjectIds = [];

    var isLoaded = false;
    this.subscriptions.add(this.service.getAllOrgEmitter()
      .subscribe(item => {
        isLoaded = true;
        this.service.selectedOrganization = undefined;
        this.loadOrganizations();
      }));

    this.subscriptions.add(this.eventService.getEvent(EventConstants.GetOrganizations).subscribe((item) => {
      isLoaded = true;
      this.service.selectedOrganization = undefined;
      this.loadOrganizations();
      this.loadViewHiddenEvent = true;
    }));

    (!isLoaded)
    this.loadOrganizations();

    this.subscriptions.add(this.eventService.getEvent(EventConstants.OrganizationMenuFilter).subscribe((payload: OrganizationFilterViewModel) => {
      payload.pageSize = this.organizationFilterModel.pageSize;
      payload.pageIndex = this.organizationFilterModel.pageIndex;
      this.organizationFilterModel = payload;
      if (this.organizationFilterModel.CountryIds && this.organizationFilterModel.CountryIds.length == 0 && this.organizationFilterModel.GUPIds && this.organizationFilterModel.GUPIds.length == 0
        && this.organizationFilterModel.OrganizationIds && this.organizationFilterModel.OrganizationIds.length == 0)
        this.service.homeMenuIcons.IsClearFilterEnabled = false;
      else if (this.organizationFilterModel.IndustryIds && this.organizationFilterModel.IndustryIds.length > 0)
        this.service.homeMenuIcons.IsClearFilterEnabled = true;
      else
        this.service.homeMenuIcons.IsClearFilterEnabled = true;

      this.loadOrganizations();
    }));

    this.source.onChanged().subscribe((change) => {
      this.removeViewMore();
      if (change.action === 'page' || change.action === 'paging') {
        this.service.selectedOrganizationIds = [];
        this.organizationFilterModel.pageIndex = change.paging.page;
        this.organizationFilterModel.pageSize = change.paging.perPage;
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        this.loadOrganizations();
        this.service.emitMenuEvent();
      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting) {
        this.organizationFilterModel.sortDirection = change.sort[0].direction.toUpperCase();
        this.organizationFilterModel.sortColumn = change.sort[0].field;
        this.loadOrganizations();
      }
    });
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      organization: {
        title: this.translate.instant('Organizations'),
        type: 'custom',
        renderComponent: OrganizationTemplateComponent,
      },
      createdBy: {
        title: this.translate.instant('Createdby'),
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return `<div>` + row.createdBy.fullName + `</div>
                  <div> on `+ moment(row.createdOn).local().format("DD MMM YYYY") + `</div>`
        },
      },
      viewMore: {
        title: '',
        type: 'custom',
        renderComponent: ViewMoreOrganizationTemplateComponent,
      }
    };

    this.settings = Object.assign({}, settingsTemp);
  }
  loadOrganizations(adminview?: boolean) {
    //reset project while loading organizaton
    this.service.emitOrgChangeEvent(undefined);


    this.service.hasAnyHiddenOrganization = false;
    this.organizationFilterModel.isVisible = !this.service.viewHiddenOrgOrProjects ? true : false;
    this.organizationFilterModel.IsAdminViewEnabled = adminview;
    this.service.orgcustomAction = [];

    this.service.getOrganizations(this.organizationFilterModel)
      .subscribe((responseData: any) => {
        var organizationData = responseData.organizations;
        var data = [];
        var homeMenuIcons = this.service.homeMenuIcons;

        if (organizationData == null)
          return;

        if (this.service.viewHiddenOrgOrProjects) {
          data = organizationData.filter(item => (item.anyProjectsHidden == true || item.isVisible == false));
          if (data.length > 0)
            this.service.hasAnyHiddenOrganization = true;
        }
        else {
          data = organizationData.filter(item => item.isVisible == true);

          //check to disable view hidden when no organization or projects is hided
          var hasHidden = organizationData.filter(item => (item.anyProjectsHidden == true || item.isVisible == false));
          if (hasHidden && hasHidden.length > 0) {
            homeMenuIcons.IsViewHiddenEnabled = true;
            this.service.hasAnyHiddenOrganization = true;
          }
          else {
            homeMenuIcons.IsViewHiddenEnabled = false;
          }
        }

        if (responseData.hasHiddenOrganization) {
          homeMenuIcons.IsViewHiddenEnabled = true;
          this.service.hasAnyHiddenOrganization = true;
        }
        else {
          this.service.hasAnyHiddenOrganization = false;
        }

        this.eventService.getEvent(EventConstants.HomeMenuEnableDisableIcons).publish(homeMenuIcons);
        this.source.totalCount = responseData.totalCount;
        this.source.load(data);
        this.orgNoDataFound = data.length == 0;
        if (data.length > 0)
          this.isGridLoaded = true;
        this.source["data"].forEach(element => {
          var obj = { id: element.id, value: 'View more' };
          this.service.orgcustomAction.push(obj);
        });

        if (this.loadViewHiddenEvent)
          this.eventService.getEvent(EventConstants.RedirectToViewHidden).publish(undefined);

        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }),
      (error) => {
        this.ngxLoader.stopLoaderAll(this.loaderId);
        console.log(error);
      };
  }


  removeViewMore() {
    this.service.orgcustomAction.forEach(item => {
      item.value = "View more";
      var viewMore = document.getElementsByClassName('trViewmoreOrg' + item.id);
      if (viewMore && viewMore.length > 0)
        viewMore[0].parentNode.removeChild(viewMore[0]);
    });
  }

  onOrganizationSelect(obj) {
    this.service.selectedOrganization = undefined;

    if (obj.data == null) {
      if (obj.selected.length > 0) {
        obj.selected.forEach(item => {
          this.service.selectedOrganizationIds.push(item.id);
        });
      }
      else {
        this.service.selectedOrganizationIds = [];
      }
    }
    else {
      if (obj.isSelected) {

        this.service.canEditProject = false;
        if (this.userService.getLoggedInUserEmail() == obj.data.createdBy.email)
          this.service.canEditOrganization = true;
        else
          this.service.canEditOrganization = false;

        this.editFlag = true;
        this.service.selectedOrganization = obj.data;
        this.organizationId = obj.data.id;
        this.service.selectedOrganizationIds.push(obj.data.id);
      }
      else {
        var index = this.service.selectedOrganizationIds.indexOf(obj.data.id);
        this.service.selectedOrganizationIds.splice(index, 1);
        if (this.service.selectedOrganizationIds.length == 1) {
          this.source["data"].forEach(element => {
            if (element.id == this.service.selectedOrganizationIds[0]) {
              this.service.selectedOrganization = element;
              if (this.userService.getLoggedInUserEmail() == element.createdBy.email)
                this.service.canEditOrganization = true;
              else
                this.service.canEditOrganization = false;
            }
          });
      }
    }
  }
    this.service.emitMenuEvent();
  }
}


@Component({
  selector: 'button-view',
  template: `
  <div class="row-fluid">
      <div class="col-xs-12"  class="org-name"><a [routerLink]="" (click)="onOrganizationSelect(row)"  >{{row.organization}}</a> 
      </div>
  </div>`
})

export class OrganizationTemplateComponent implements ViewCell, OnInit {
  row: any;

  public orderDetials: any;
  constructor(private homeService: HomeService, private shareDetailService: ShareDetailService) { }

  @Input() rowData: any;
  @Input() value: string | number;


  ngOnInit() {
    this.row = this.rowData;
  }

  onOrganizationSelect(event) {
    const organizationDetail = new ProjectContext();
    organizationDetail.organizationId = event.id;
    organizationDetail.organizationName = event.organization;
    this.shareDetailService.setOrganizationDetail(organizationDetail);
    this.homeService.emitOrgChangeEvent(event.id);
  }
}

@Component({
  selector: 'button-view',
  template: `
  <div class="row-fluid">
    <div class="orgViewMore" *ngIf="isViewMore"><img class="viewMorelessIcon" (click) = "onViewMoreSelect(row)" src="assets/images/View more.svg"></div>
    <div class="orgViewMore" *ngIf="!isViewMore"><img class="viewMorelessIcon" (click) = "onViewMoreSelect(row)" src="assets/images/View less.svg"></div>
    <div *ngIf="isShowHidden && row.hiddenBy!= null" class="vertical-dotted-line"><span class="tooltiptext">Hidden by<span class="hiddenByName"> {{row.hiddenBy.fullName}}</span> on {{row.hiddenOn | dateFormat}}</span></div>
  </div>`
})

export class ViewMoreOrganizationTemplateComponent implements ViewCell, OnInit {
  row: any;

  public orderDetials: any;
  constructor(private homeService: HomeService, private customHTML: CustomHTML, private translate: TranslateService) { }

  @Input() rowData: any;
  @Input() value: string | number;
  selectedRow: any;
  isViewMore: boolean;
  isShowHidden = false;

  ngOnInit() {
    this.isViewMore = true;
    this.row = this.rowData;
    this.isShowHidden = (this.homeService.viewHiddenOrgOrProjects == true) || (this.row.isVisible ? false : true);
  }

  onViewMoreSelect(row) {
    var orgSmartTable = (document.getElementById('orgSmartTable'));
    var nodes = this.customHTML.querySelectorAll(orgSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    var index = -1;
    for (var i = 0; i < nodes.length; i++) {
      var tableData = nodes[i].getElementsByTagName("td");
      for (var j = 0; j < tableData.length; j++) {
        if (tableData[j].textContent == row.organization) {
          index = i;
          break;
        }
      }
    }

    var action = this.homeService.orgcustomAction.filter(function (element, index, array) { return element["id"] == row.id });
    if (action[0]['value'] == 'View more') {
      action[0].value = "View less";
      this.selectedRow = undefined;
      this.isViewMore = false;
      this.getRow(index, row);
    }
    else if (action[0]['value'] == 'View less') {
      this.isViewMore = true;
      action[0].value = "View more";
      this.deleteRow(row.id);
    }
  }

  getRow(index, data) {
    var industryHTML = '';
    var subIndustryHTML = '';
    data.industry.forEach(industry => {
      industryHTML += "<div class='org-industry'>" + industry.industry;
      subIndustryHTML = '';

      if (industry.subIndustries.length > 0)
        industryHTML += " - ";
      industry.subIndustries.forEach(subIndustry => {
        subIndustryHTML += subIndustry.subIndustry + "; ";
      })
      industryHTML += " " + subIndustryHTML.slice(0, -2) + "</div>"
    });

    var orgSmartTable = (document.getElementById('orgSmartTable'));
    var nodes = this.customHTML.querySelectorAll(orgSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    this.selectedRow = nodes[index];
    let GlobalUltimateParent = this.translate.instant('GlobalUltimateParent');
    let IndustryL = this.translate.instant('IndustryL');
    let CountryL = this.translate.instant('CountryL');

    this.selectedRow.insertAdjacentHTML('afterend',
      `<tr class='trViewmoreOrg` + data.id + `' style="background-color:#FFFFFF !important;"><td></td><td colspan="3"><div class="home-font-viewmore">  <label class="project-list-lead-name">` + GlobalUltimateParent + (data.gupData != null && data.gupData.gupName == null ? "N/A" : data.gupData.gupName) + `</label><br/></div>
    <div class="home-font-viewmore"></div>
    `+ IndustryL + industryHTML + `
    <div class="home-font-viewmore"> <label class="project-list-lead-name">` + CountryL + data.country.country + `</label></div></td></tr>
    `);
  }

  deleteRow(id) {
    var node = document.getElementsByClassName('trViewmoreOrg' + id)[0];
    if (node) node.parentNode.removeChild(node);
  }


}
