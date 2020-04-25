import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { LocalDataSource, ViewCell } from '../../../@core/components/ng2-smart-table';
import { HomeService } from '../home.service'
import { ProjectResponse, ProjectFilterViewModel, ProjectResultModel } from '../../../@models/project';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { CustomHTML } from '../../../shared/services/custom-html.service';
import { EventConstants, eventConstantsEnum } from '../../../@models/common/eventConstants';
import { StorageService } from '../../../@core/services/storage/storage.service';
import { Router } from '@angular/router';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { DesignerService } from '../../project-design/services/designer.service';
import { ProjectDetails } from '../../../@models/projectDesigner/region';
import * as moment from 'moment';
import { ProjectContext, ProjectAccessRight } from '../../../@models/organization';
import { RoleService } from '../../../shared/services/role.service';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { ProjectSettingService } from '../../project-setup/services/project-setting.service';
import { CurrentSettings, ProjectSettings } from '../../../@models/project-settings/project-settings';
import { ProjectSettigns, ToggleButton } from '../../../pages/project-management/@models/Project-Management-Constants'
import { SortEvents } from '../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  subscriptions: Subscription = new Subscription();

  selectedOrganizationId: Array<string> = [];
  source: CommonDataSource = new CommonDataSource();
  isGridLoaded = false;
  selectedRow: any;
  editFlag = false;
  projectFilterModel: ProjectFilterViewModel;
  projectTemplateMessage: string;
  showInitialMessage: boolean = true;
  constructor(
    private translate: TranslateService,
    private service: HomeService,
    private readonly eventService: EventAggregatorService,
    private roleService: RoleService,
    private ngxLoader: NgxUiLoaderService,
    private customHTML: CustomHTML) {
      this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.setColumnSettings();
        this.setprojectTemplateMessage();
        this.source.refresh();
      }));

      this.setColumnSettings();
  }
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: false,
    pager: {
      display: true,
      perPage: 10
    },
    columns: {},
  };

  //ngx-ui-loader configuration
  loaderId = 'ProjectListLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';



  ngOnInit() {

    this.service.projectcustomAction = [];
    const usersetting = this.roleService.getUserRole();
    this.showInitialMessage = true;
    this.setprojectTemplateMessage();

    this.subscriptions.add(this.service.getOrgChangeEmitter()
      .subscribe(item => {
        this.service.selectedProjectIds = [];
        this.service.selectedProject = undefined;

        if (item == undefined) {
          this.isGridLoaded = false
          return;
        }

        this.projectFilterModel = new ProjectFilterViewModel();
        this.projectFilterModel.pageIndex = 1;
        this.projectFilterModel.pageSize = this.settings.pager.perPage;
        this.projectFilterModel.IsAdminViewEnabled = usersetting.adminView;
        this.projectFilterModel.IsFilterDataRequest = false;
        this.projectFilterModel.OrganizationId = item;
        this.loadProjects();
      }));


    this.subscriptions.add(this.eventService.getEvent(EventConstants.ProjectMenuFilter).subscribe((payload: ProjectFilterViewModel) => {
      payload.pageSize = this.projectFilterModel.pageSize;
      payload.pageIndex = this.projectFilterModel.pageIndex;
      this.projectFilterModel = payload;
      this.loadProjects();
      this.eventService.getEvent(EventConstants.HomeMenuEnableDisableIcons).publish(this.service.homeMenuIcons);
    }));

    this.source.onChanged().subscribe((change) => {
      // this.removeViewMore();
      if (change.action === 'page' || change.action === 'paging') {
        this.service.selectedProjectIds = [];
        this.projectFilterModel.pageIndex = change.paging.page;
        this.projectFilterModel.pageSize = change.paging.perPage;
        this.loadProjects();
        this.service.emitMenuEvent();
      }
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
      {
        this.projectFilterModel.sortDirection=  change.sort[0].direction.toUpperCase();
        this.projectFilterModel.sortColumn= change.sort[0].field;
        this.loadProjects();
      }
    });
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      projects: {
        title: this.translate.instant('Projects'),
        width: "20%",
        type: 'custom',
        renderComponent: ProjectTemplateComponent,
      },

      fiscalYear: {
        title: this.translate.instant('FiscalYear'),
        type: 'html',
        width: "20%",
        valuePrepareFunction: (cell, row) => {
          return `<div class="org-name">` + row.fiscalYear + `</div>`
        },
      },
      projectdescription: {
        title: this.translate.instant('ProjectDescription'),
        type: 'html',
        width: "45%",
        valuePrepareFunction: (cell, row) => {
          return `<div class="org-name">` + row.description + `</div>`
        },
      },
      createdby: {
        title: this.translate.instant('Createdby'),
        type: 'html',
        width: "20%",
        valuePrepareFunction: (cell, row) => {
          var html = `<div class="org-name">` + row.createdBy.fullName + `</div>
          <div> on `+ moment(row.createdOn).local().format("DD MMM YYYY") + `</div>`;
          // <div> on `+ row.createdOn + `</div>`;
          //  if (!row.isVisible)
          //   html += `<div class="vertical-dotted-line project-dotted-line"><span class="tooltiptext">Hidden by ` + row.hiddenBy.firstName + ` on ` + row.hiddenOn + `</span></div>`
          return html;
        },
      },
      viewMore: {
        title: '',
        type: 'custom',
        renderComponent: ViewMoreProjectTemplateComponent,
      }

    };

    this.settings = Object.assign({}, settingsTemp );
  }
  loadProjects() {

    this.removeViewMore();

    if (this.service.viewHiddenOrgOrProjects)
      this.projectFilterModel.isVisible = false;
    else
      this.projectFilterModel.isVisible = true;
    const usersetting = this.roleService.getUserRole();
    this.projectFilterModel.IsAdminViewEnabled = usersetting.adminView;

    //Start loader
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.service.getProjects(this.projectFilterModel)
      .subscribe((data: any) => {
        this.source.load(data.projects);
        this.source.totalCount = data.totalCount;

        if (data.projects.length > 0)
          this.isGridLoaded = true;
        else {
          this.isGridLoaded = false;
          this.showInitialMessage = false;
          this.setprojectTemplateMessage();

        }
        this.service.projectcustomAction = [];
        this.source["data"].forEach(element => {
          var obj = { id: element.id, value: 'View more' };
          this.service.projectcustomAction.push(obj);
        });

        this.source.onChanged().subscribe((change) => {
          this.removeViewMore();
        });
        //Stop loader
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  removeViewMore() {
    this.service.projectcustomAction.forEach(item => {
      item.value = "View more";
      var viewMore = document.getElementsByClassName('trViewMoreProject' + item.id);
      if (viewMore && viewMore.length > 0)
        viewMore[0].parentNode.removeChild(viewMore[0]);
    });
    var removeTR = document.querySelector("#projectSmartTable tbody tr");
    if (removeTR != null) removeTR.remove();
  }

  onOrganizationSelect(obj) {
    if (obj.Id)
      this.loadProjects();
    else
      this.source = new CommonDataSource();
  }

  onProjectSelect(obj) {
    this.service.selectedProject = undefined;

    if (obj.data == null) {
      if (obj.selected.length > 0) {
        obj.selected.forEach(item => {
          this.service.selectedProjectIds.push(item.id);
        });
      }
      else {
        this.service.selectedProjectIds = [];
      }
    }
    else {
      if (obj.isSelected) {
        this.getProjectEditRights(obj.data.id);
        this.editFlag = true;
        this.service.selectedProject = obj.data;
        this.service.selectedProjectIds.push(obj.data.id);
        this.selectedOrganizationId = obj.data.organizationId;
      }
      else {
        var index = this.service.selectedProjectIds.indexOf(obj.data.id);
        this.service.selectedProjectIds.splice(index, 1);

        if (this.service.selectedProjectIds.length == 1) {
          this.source["data"].forEach(element => {
            if (element.id == this.service.selectedProjectIds[0]){
              this.service.selectedProject = element;
              this.getProjectEditRights(element.id);
            }
          });
        }
      }
    }
    this.service.emitMenuEvent();
  }

  getProjectEditRights(projectId) {
    this.service.getProjectUserSetting(projectId).subscribe((projectSetting) => {
      this.service.canEditProject = projectSetting.isCentralUser;
      this.service.canEditOrganization = false;
      this.service.emitMenuEvent();
    });
  }

  setprojectTemplateMessage() {
    if (this.showInitialMessage) {
      this.projectTemplateMessage =
      '<img src=\'assets/images/L1-Project setup-selected.png\' class=\'btnToolbar\'><br/><br/>' + 
      this.translate.instant('screens.home.notification-message.Select') + ' <label class=\'font-bold\'> ' +
      this.translate.instant('screens.home.organization-project-form.Organization') + ' </label> ' +
      this.translate.instant('screens.home.notification-message.Toview')  + ' <label class=\'font-bold\'> ' +
      this.translate.instant('screens.home.organization-project-form.Projects') + '</label>';
      } else {
        this.projectTemplateMessage =
        '<img src=\'assets/images/L1-Project setup-selected.png\' class=\'btnToolbar\'><br/><br/>' +
        this.translate.instant('screens.home.notification-message.No') +
        ' <b>' + this.translate.instant('screens.home.organization-project-form.Projects') + '</b> ' +
    this.translate.instant('screens.home.notification-message.Found');
      }
  }
}

@Component({

  selector: 'button-view',
  styleUrls:['./project-list.component.scss'],
  template: `
  <div class="projectLoader">
  <ngx-ui-loader [loaderId]='loaderId' [bgsPosition]="loaderPosition" 
 [bgsColor]="loaderColor"></ngx-ui-loader>
 </div>
    <div class="row-fluid">
      <div class="col-xs-12"  class="org-name">
      <a [routerLink]="" *ngIf="!adminView && !isViewHiddenOrgOrProjects && !IsCopyProgress"  (click)="onProjectDetail(row)"  >{{row.projectName}}</a> 
      <p *ngIf="adminView || isViewHiddenOrgOrProjects || IsCopyProgress">{{row.projectName}}
      <span class="copy-progress" *ngIf="IsCopyProgress">Copy in Progress</span>
      </p>       
      </div>
     
  </div>`
})

export class ProjectTemplateComponent implements ViewCell, OnInit, OnDestroy {
  row: any;
  adminView: any;
  subscriptions: Subscription = new Subscription();
  public projectDetail: any;
  isViewHiddenOrgOrProjects: boolean;
  IsCopyProgress: boolean;
  projectSettingsHeaders: any;
  settings: CurrentSettings[];

  constructor(private homeService: HomeService,
    private readonly eventService: EventAggregatorService,
    private shareDetailService: ShareDetailService,
    private storageService: StorageService,
    private roleService: RoleService,
    private ngxLoader: NgxUiLoaderService,
    private designerService: DesignerService,
    private router: Router,
    private projectSettingService: ProjectSettingService,
    private _eventService: EventAggregatorService) { }

  @Input() rowData: any;
  @Input() value: string | number;

  //ngx-ui-loader configuration
  loaderId: string = new Date().getTime().toString();

  loaderPosition = POSITION.centerRight;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  delay = 1;

  ngOnInit() {
    this.projectSettingsHeaders = {
      projectId: '',
      externalUserSetting: []
    };
    this.row = this.rowData;
    this.IsCopyProgress = this.row.isCopyProgress;
    const usersetting = this.roleService.getUserRole();
    this.adminView = usersetting.adminView;
    this.designerService.isExternalUser = usersetting.isExternalUser;
    this.isViewHiddenOrgOrProjects = this.homeService.viewHiddenOrgOrProjects
  }


  onProjectDetail(event) {
    this.getProjectManagmentAccess();
    const projectDetail = new ProjectContext();
    projectDetail.projectId = event.id;
    projectDetail.projectName = event.projectName;
    projectDetail.fiscalYear = event.fiscalYear;
    projectDetail.industry = event.industryData;
    projectDetail.projectExternalUserSettings = this.settings;
    projectDetail.projectCreator = event.createdBy.email;
    this.shareDetailService.setOrganizationDetail(projectDetail);
    //this.subscriptions.add(this.eventService.getEvent(EventConstants.ProjectInContext).publish(projectDetail));
    this.homeService.getProjectUserSetting(event.id).subscribe((projectSetting) => {
      projectDetail.ProjectAccessRight = new ProjectAccessRight();
      projectDetail.ProjectAccessRight.isCentralUser = projectSetting.isCentralUser;
      projectDetail.ProjectAccessRight.isEntityDataAvailable = projectSetting.isEntityDataAvailable;
      projectDetail.ProjectAccessRight.isStaffedUsersDataAvailable = projectSetting.isStaffedUsersDataAvailable;
      projectDetail.ProjectAccessRight.isTransactionDataAvailable = projectSetting.isTransactionDataAvailable;
      this.shareDetailService.setOrganizationDetail(projectDetail);
      (!projectSetting.isCentralUser) ?
        this.disabelProjectSetup() : (!projectSetting.isStaffedUsersDataAvailable) ?
          this.navigateToProjectSetupUser() : (!projectSetting.isEntityDataAvailable) ?
            this.navigateToProjectSetupEntity() : (!projectSetting.isTransactionDataAvailable) ?
              this.navigateToProjecdtSetupTransaction() : this.navigateToProjectDesigner();
      if (projectSetting.isCentralUser) {
        this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
      }
      this.ngxLoader.startBackgroundLoader(this.loaderId);
    });
  }

  getProjectManagmentAccess() {
    if (!this.designerService.isExternalUser) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.showOrHideProjectManagment).publish(false);
    }
    else {
      this.getProjectManagementSettings();

    }
  }

  getProjectManagementSettings() {
    this.projectSettingService.getProjectManagementSettings().subscribe((response: ProjectSettings) => {
      if (response) {
        this.projectSettingsHeaders.projectId = response.projectId;
        this.settings = response.currentSettings;
        if (response.currentSettings && response.currentSettings.length > 0) {
          let externalUserData = response.currentSettings.filter(sett => sett.type == ProjectSettigns.ExternalUserSetting);
          if (externalUserData[0].value == ToggleButton.On) {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.showOrHideProjectManagment).publish(false);
          }
          else {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.showOrHideProjectManagment).publish(true);
          }
        }
      }
      else {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.showOrHideProjectManagment).publish(false);
      }
    });
  }
  navigateToProjectDesigner() {
    this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(true);
    this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(false);
    this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['iconViewRegion'], level2Menu: ['iconViewLevel2Menu'], topmenu: ['iconviewtopmenu'] } }]);

  }

  disabelProjectSetup() {
    this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
    this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(false);
    this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['iconViewRegion'], level2Menu: ['iconViewLevel2Menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  navigateToProjectSetupUser() {
    this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
    this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(true);
    this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
    //this.ngxLoader.stopBackgroundLoader(this.loaderId);
    this.router.navigate(['pages/project-setup/projectSetupMain', { outlets: { primary: ['usersMain'], level2Menu: ['usersLevel2Menu'], leftNav: ['leftNav'] } }]);
   
  }

  navigateToProjectSetupEntity() {
    this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
    this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(true);
    this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
    //this.ngxLoader.stopBackgroundLoader(this.loaderId);
    this.router.navigate(['pages/project-setup/projectSetupMain', { outlets: { primary: ['entitiesMain'], level2Menu: ['entitiesLevel2Menu'], leftNav: ['leftNav'] } }]);
  
  }

  navigateToProjecdtSetupTransaction() {
    this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
    this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(true);
    this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
    //this.ngxLoader.stopBackgroundLoader(this.loaderId);
    this.router.navigate(['pages/project-setup/projectSetupMain', { outlets: { primary: ['transactionMain'], level2Menu: ['transactionLevel2Menu'], leftNav: ['leftNav'] } }]);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

@Component({
  selector: 'button-view',
  template: `
  <div class="row-fluid">
    <div class="orgViewMore" *ngIf="isViewMore"><img class="viewMorelessIcon" (click) = "onViewMoreSelect(row)" src="assets/images/View more.svg"></div>
    <div class="orgViewMore" *ngIf="!isViewMore"><img class="viewMorelessIcon" (click) = "onViewMoreSelect(row)" src="assets/images/View less.svg"></div>
    <div *ngIf="isShowHidden && row.hiddenBy!= null" class="vertical-dotted-line project-dotted-line"><span class="tooltiptext">Hidden by <span class="hiddenByName">{{row.hiddenBy.fullName}}</span> on {{row.hiddenOn | dateFormat}}</span></div>
  </div>`
})

export class ViewMoreProjectTemplateComponent implements ViewCell, OnInit {
  row: any;

  public orderDetials: any;
  constructor(private homeService: HomeService, private customHTML: CustomHTML,   private translate: TranslateService,) { }

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
    let projectSmartTable = (document.getElementById('projectSmartTable'));
    let nodes = this.customHTML.querySelectorAll(projectSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    let index = -1;
    for (let i = 0; i < nodes.length; i++) {
      let tableData = nodes[i].getElementsByTagName("td");
      for (let j = 0; j < tableData.length; j++) {
        if (tableData[j].textContent == row.projectName) {
          index = i;
          break;
        }
      }
    }

    //var index = this.source["data"].indexOf(event.data)
    var action = this.homeService.projectcustomAction.filter(function (element, index, array) { return element["id"] == row.id });
    if (action[0]['value'] === 'View more') {
      this.isViewMore = false;
      action[0].value = "View less";
      this.selectedRow = undefined;
      this.getRow(index, row);
    }
    else if (action[0]['value'] === 'View less') {
      this.isViewMore = true;
      action[0].value = "View more";
      this.deleteRow(row.id);
    }
  }

  getRow(index, data) {
    let industryHTML = '';
    let subIndustryHTML = '';
    data.industryData.forEach(industry => {
      industryHTML += "<div class='org-industry proj-industry'>" + industry.industry;
      subIndustryHTML = '';

      if (industry.subIndustries.length > 0)
        industryHTML += " - ";
      industry.subIndustries.forEach(subIndustry => {
        subIndustryHTML += subIndustry.subIndustry + "; ";
      })
      industryHTML += " " + subIndustryHTML.slice(0, -2) + "</div> <br/>"
    });

    let projectSmartTable = (document.getElementById('projectSmartTable'));
    let nodes = this.customHTML.querySelectorAll(projectSmartTable.getElementsByTagName('tr'), "ng-star-inserted");
    let IndustryL=this.translate.instant('IndustryL');
    let useCase=this.translate.instant('UseCase');
    this.selectedRow = nodes[index];
    this.selectedRow.insertAdjacentHTML('afterend',
      `<tr class='trViewMoreProject` + data.id + `' style="background-color:#FFFFFF !important;">
    <td></td>
    <td colspan="5">
    <div class="row">
        <div class="col-sm-2 project-list-viewmore-header">
        `+ useCase+ `
        </div>
        <div class="col-sm-4 project-list-viewmore-header">
        `+IndustryL+ `
        </div>
    </div>
    <div class="row">
        <div class="col-sm-2 project-list-lead-name">
        `+ (data.useCase.useCase == null ? "" : data.useCase.useCase) + `
        </div>
        <div class="col-sm-4">
        `+ industryHTML + `
        </div>
    </div>
      </td>
      </tr>
    `);
  }

  deleteRow(id) {
    var node = document.getElementsByClassName('trViewMoreProject' + id)[0];
    if (node) node.parentNode.removeChild(node);
  }
}

