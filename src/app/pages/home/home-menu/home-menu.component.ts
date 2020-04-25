import { Component, OnInit, Input, ElementRef, EventEmitter, NgModule, Output, Injector, Inject } from '@angular/core';
import { HomeService } from '../home.service'
import { ProjectHideModel, ProjectShowModel } from '../../../@models/project';
import {
  OrganizationDeleteModel,
  OrganizationFilterDataModel,
  OrganizationFilterViewModel,
  OrganizationHideModel, OrganizationShowModel, Industry, HomeMenuIcons, GUPFilterDataModel
} from '../../../@models/organization';
import { AlertService } from '../../../shared/services/alert.service';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { Subscription } from 'rxjs';
import { ProjectFilterDataModel, ProjectFilterViewModel, ProjectDeleteModel } from '../../../@models/project';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { EventConstants, TreeViewConstant } from '../../../@models/common/eventConstants';
import { DialogTypes, Dialog } from '../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { DialogService } from '../../../shared/services/dialog.service';
import { MatDialog } from '@angular/material';
import { UserService } from '../../user/user.service';
import { RoleService } from '../../../shared/services/role.service';
import { Router } from '@angular/router';
import { CopyProjectComponent } from '../copy-project/copy-project.component';
import { NbDialogService } from '@nebular/theme';
import { StorageService, StorageKeys } from '../../../@core/services/storage/storage.service';
import { UserUISetting } from '../../../@models/user';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TreeViewService } from '../../../shared/services/tree-view.service';

@Component({
  selector: 'ngx-home-menu',
  templateUrl: './home-menu.component.html',
  styleUrls: ['./home-menu.component.scss'],
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
export class HomeMenuComponent implements OnInit {
  hideProject: ProjectHideModel;
  showProject: ProjectShowModel;
  hideOrganization: OrganizationHideModel;
  disablebutton: boolean = false;
  showOrganization: OrganizationShowModel;
  organizationDeleteModel: OrganizationDeleteModel;
  projectDeleteModel: ProjectDeleteModel;
  loadOrgCreateComponent = false;
  loadOrgEditComponent = false;
  public show: boolean = false;
  public IsEableAdminAccessIcons: boolean = false;
  public IsDeleteVisible: boolean = false;
  imageKey: string = 'expand';
  imageName: string = this.translate.instant(this.imageKey);
  userSetting;
  userUISetting: UserUISetting;

  private ddListOrganizationData: any;
  private ddListGUPData: any;
  private ddListCountryData: any;
  private ddListOrganizationIndustryData: any;
  private ddOrganizationSettings: any;
  private ddGUPSettings: any;
  private ddCountrySettings: any;
  private ddOrganizationIndustrySettings: any;
  private selectedOrganizationValues: [];
  private selectedGUPValues: [];
  private selectedCountryValues: [];
  private selectedOrganizationIndustryValues: [];
  private organizationFilterViewModel: OrganizationFilterViewModel;
  private subscriptions: Subscription;
  private ddListProjectData: any;
  private ddListProjectIndustryData: any;
  private ddListFiscalYearData: any;
  private ddListUserCaseData: any;
  private ddProjectSettings: any;
  private ddProjectIndustrySettings: any;
  private ddFiscalYearSettings: any;
  private ddUseCaseSettings: any;
  private selectedProjectValues: [];
  private selectedProjectIndustryValues: [];
  private selectedFiscalYearValues: [];
  private selectedUseCaseValues: [];
  @Input() selectedOrganizationId: string;
  private projectFilterViewModel: ProjectFilterViewModel;

  @Output() manageOrganization: EventEmitter<any> = new EventEmitter();

  hasProjectIndustries = false;
  ddTreeViewConfig = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 100
  }

  constructor(
    public service: HomeService,
    private router: Router,
    private alertService: AlertService,
    private el: ElementRef,

    private toastr: ToastrService,
    private translate: TranslateService,
    private readonly eventService: EventAggregatorService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private roleService: RoleService,
    private userservice: UserService,
    private DialogService: NbDialogService,
    private storageService: StorageService,
  ) {
    this.hideProject = new ProjectHideModel();
    this.hideOrganization = new OrganizationHideModel();
    this.showProject = new ProjectShowModel();
    this.showOrganization = new OrganizationShowModel();

    this.organizationDeleteModel = new OrganizationDeleteModel();
    this.organizationFilterViewModel = new OrganizationFilterViewModel();
    this.projectFilterViewModel = new ProjectFilterViewModel();
    this.subscriptions = new Subscription();
    this.projectDeleteModel = new ProjectDeleteModel();
    this.userUISetting = new UserUISetting();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setLocaleMessages();
      });
  }

  ifMenuLoaded = false;

  ngOnInit() {
    //Hidding Create, Edit and Copy in case of Admin View - US369886.
    const userSetting = this.roleService.getUserRole();
    if (userSetting && !userSetting.adminView) {
      this.IsEableAdminAccessIcons = true;
    } else {
      this.IsEableAdminAccessIcons = false;
    }
    if (userSetting && userSetting.isGlobalAdmin) {
      this.IsDeleteVisible = true;
    } else {
      this.IsDeleteVisible = false;
    }
    this.userUISetting = this.userservice.getCurrentUserUISettings();
    this.getOrganizationDropDownFilterData();
    this.setOrganizationDropDownFilterSettings();
    this.organizationFilterViewModel.isVisible = true;
    this.setProjectDropDownFilterSettings();
    this.subscriptions.add(this.service.subscribeMenuEvent()
      .subscribe(item => {
        this.enableDisableTopMenuNew();

      }));
    if (!this.ifMenuLoaded) {
      this.enableDisableTopMenuNew();
      this.ifMenuLoaded = true;
    }

    this.subscriptions.add(this.service.getOrgChangeEmitter()
      .subscribe(item => {
        this.selectedOrganizationId = item;
        this.getProjectDropDownFilterData(this.selectedOrganizationId);
      }));

    this.subscriptions.add(this.service.getAllOrgEmitter().subscribe(item => {
      this.getOrganizationDropDownFilterData();
    }));

    this.ddListProjectIndustryData = [];

    this.subscriptions.add(this.eventService.getEvent(EventConstants.HomeMenuEnableDisableIcons).subscribe((icons: HomeMenuIcons) => {
      this.enableDisableIcons(icons);
    }));

    this.subscriptions.add(this.eventService.getEvent(EventConstants.AdminView).subscribe((payload: boolean) => {
      const userSetting = this.roleService.getUserRole();
      if (userSetting && !userSetting.adminView) {
        this.IsEableAdminAccessIcons = true;
      } else {
        this.IsEableAdminAccessIcons = false;
      }
      this.enableDisableTopMenuNew();
      this.getOrganizationDropDownFilterData();
    }));


    if (this.userUISetting && this.userUISetting.isMenuExpanded) {
      this.toggleCollapse();
    }
  }
  setLocaleMessages() {
    this.imageName = this.translate.instant(this.imageKey);
  }

  enableDisableIcons(icons: HomeMenuIcons) {
    var createIcon = document.getElementById("createHomeMenuIcon");
    var editIcon = document.getElementById("editHomeMenuIcon");
    var copyIcon = document.getElementById("copyHomeMenuIcon");
    var hideIcon = document.getElementById("hideHomeMenuIcon");
    var unhideIcon = document.getElementById("unHideHomeMenuIcon");
    var deleteIcon = document.getElementById("deleteHomeMenuIcon");
    var viewHidden = document.getElementById("viewHiddenHomeMenuIcon");
    var clearIcon = document.getElementById("clearHomeMenuIcon");

    if (createIcon != null) {
      if (icons.IsCreateEnabled)
        createIcon.classList.remove('home-menu-opacity');
      else
        createIcon.classList.add('home-menu-opacity');
    }
    if (editIcon != null) {
      if (icons.IsEditEnabled)
        editIcon.classList.remove('home-menu-opacity');
      else
        editIcon.classList.add('home-menu-opacity');
    }

    if (deleteIcon != null) {
      if (icons.IsDeleteEnabled)
        deleteIcon.classList.remove('home-menu-opacity');
      else
        deleteIcon.classList.add('home-menu-opacity');
    }

    if (hideIcon != null) {
      if (icons.IsHideEnabled)
        hideIcon.classList.remove('home-menu-opacity');
      else
        hideIcon.classList.add('home-menu-opacity');
    }

    if (unhideIcon != null) {
      if (icons.IsUnHideEnabled)
        unhideIcon.classList.remove('home-menu-opacity');
      else
        unhideIcon.classList.add('home-menu-opacity');
    }

    if (viewHidden != null) {
      if (icons.IsViewHiddenEnabled)
        viewHidden.classList.remove('home-menu-opacity');
      else
        viewHidden.classList.add('home-menu-opacity');
    }

    if (copyIcon != null) {
      if (icons.IsCopyEnabled)
        copyIcon.classList.remove('home-menu-opacity');
      else
        copyIcon.classList.add('home-menu-opacity');
    }

    if (clearIcon != null) {
      if (icons.IsClearFilterEnabled)
        clearIcon.classList.remove('home-menu-opacity');
      else
        clearIcon.classList.add('home-menu-opacity');
    }

  }

  //section to enable and disable top menu icons
  enableDisableTopMenuNew() {
    var homeMenuIcons = this.service.homeMenuIcons;
    var length = this.service.selectedProjectIds.length + this.service.selectedOrganizationIds.length;
    if (homeMenuIcons.IsCreateEnabled) {
      this.disablebutton = false;
    }
    // if any single item is selected copy, delete, hide and unhide should be enables
    if (length > 0) {

      homeMenuIcons.IsCopyEnabled = false;
      homeMenuIcons.IsDeleteEnabled = false;
      homeMenuIcons.IsHideEnabled = true;
      homeMenuIcons.IsUnHideEnabled = true;
      if (this.roleService.getUserRole().adminView) {
        homeMenuIcons.IsDeleteEnabled = true;
      }

      if (length > 1) {
        //if more than one item is selected edit and create should be disabled
        homeMenuIcons.IsEditEnabled = false;
        homeMenuIcons.IsCreateEnabled = false;
      }
      else {
        //else edit and create should be enabled
        if (this.service.canEditOrganization || this.service.canEditProject)
          homeMenuIcons.IsEditEnabled = true;
        else
          homeMenuIcons.IsEditEnabled = false;

        homeMenuIcons.IsCreateEnabled = true;
      }

      //disable create when any project is selected
      if (this.service.selectedProjectIds.length == 1) {
        homeMenuIcons.IsCreateEnabled = false;
      }

      //enable copy project when any project is selected
      if (this.service.selectedProjectIds.length == 1)
        homeMenuIcons.IsCopyEnabled = true;
    }

    //scenario when project and org is selected we need to disable edit, copy, delete, hide and un-hide
    //when nothing is selected
    if (length == 0 || (this.service.selectedProjectIds.length > 0 && this.service.selectedOrganizationIds.length > 0)) {
      homeMenuIcons.IsEditEnabled = false;
      homeMenuIcons.IsHideEnabled = false;
      homeMenuIcons.IsUnHideEnabled = false;
      homeMenuIcons.IsDeleteEnabled = false;
      homeMenuIcons.IsCopyEnabled = false;

      if (length == 0)
        homeMenuIcons.IsCreateEnabled = true;
      else
        homeMenuIcons.IsCreateEnabled = false;
    }


    //enable / disable top menu based on view hidden / un view hidden
    if (this.service.viewHiddenOrgOrProjects) {
      var hide = document.getElementById('hideHomeMenuIcon');
      if (hide != null) {
        hide.classList.remove('menu-icon-show');
        hide.classList.add('menu-icon-hide');
      }
      var unhide = document.getElementById('unHideHomeMenuIcon');
      if (unhide != null) {
        unhide.classList.remove('menu-icon-hide');
        unhide.classList.add('menu-icon-show');
      }

      homeMenuIcons.IsCreateEnabled = false;
      homeMenuIcons.IsDeleteEnabled = false;
      homeMenuIcons.IsEditEnabled = false;
      homeMenuIcons.IsViewHiddenEnabled = true;
    }
    else {
      var hide = document.getElementById('hideHomeMenuIcon');
      if (hide != null) {
        hide.classList.remove('menu-icon-hide');
        hide.classList.add('menu-icon-show');
      }

      var unhide = document.getElementById('unHideHomeMenuIcon');
      if (unhide != null) {
        unhide.classList.remove('menu-icon-show');
        unhide.classList.add('menu-icon-hide');
      }

      if (this.service.hasAnyHiddenOrganization)
        homeMenuIcons.IsViewHiddenEnabled = true;
    }
    this.eventService.getEvent(EventConstants.HomeMenuEnableDisableIcons).publish(homeMenuIcons);
  }

  hideProjectOrOrganizationConfirmation() {
    if (!this.service.homeMenuIcons.IsHideEnabled)
      return;
      this.hideProjectOrOrganization();
      return;
      
      

  }

  hideProjectOrOrganization() {
    if (!this.service.homeMenuIcons.IsHideEnabled)
      return;

    if (this.service.selectedProjectIds.length > 0) {
      this.hideProject.ProjectIds = this.service.selectedProjectIds;
      const usersetting = this.roleService.getUserRole();
      this.hideProject.IsAdminViewEnabled = usersetting.adminView;
      // this.hideProject.HiddenBy = "user@deloitte.com"
      this.service.hideProject(this.hideProject)
        .subscribe((response) => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.labels.projectHiddenSuccesfully'));
          }
          else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.service.selectedProjectIds = [];
          this.service.emitOrgChangeEvent(this.selectedOrganizationId);
          this.service.emitMenuEvent();
          var _parentThis = this;
          setTimeout(function () {
            var homeMenuIcons = _parentThis.service.homeMenuIcons;
            homeMenuIcons.IsViewHiddenEnabled = true;
            _parentThis.eventService.getEvent(EventConstants.HomeMenuEnableDisableIcons).publish(homeMenuIcons);
          })
        });
    }

    if (this.service.selectedOrganizationIds.length > 0) {
      this.hideOrganization.OrganizationIds = this.service.selectedOrganizationIds;
      const usersetting = this.roleService.getUserRole();
      this.hideOrganization.IsAdminViewEnabled = usersetting.adminView;
      // this.hideOrganization.HiddenBy = "user@deloitte.com"
      this.service.hideOrganization(this.hideOrganization)
        .subscribe((response) => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.labels.organizationHiddeSuccesfully'));
          }
          else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.service.selectedOrganizationIds = [];
          this.service.emitOrgEvent();
          this.service.emitOrgChangeEvent(undefined);
          this.service.emitMenuEvent();
        });
    }
  }

  showProjectOrOrganizationConfirmation() {
    if (!this.service.homeMenuIcons.IsUnHideEnabled)
      return;
      this.showProjectOrOrganization();
      return;

      


  }

  showProjectOrOrganization() {
    if (!this.service.homeMenuIcons.IsUnHideEnabled)
      return;

    if (this.service.selectedProjectIds.length > 0) {
      this.showProject.ProjectIds = this.service.selectedProjectIds;
      const usersetting = this.roleService.getUserRole();
      this.showProject.IsAdminViewEnabled = usersetting.adminView;
      this.service.showProject(this.showProject)
        .subscribe((response) => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.labels.projectsUnHiddenSuccesfully'));
          }
          else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.service.selectedProjectIds = [];
          this.service.emitOrgChangeEvent(this.selectedOrganizationId);
          this.eventService.getEvent(EventConstants.GetOrganizations).publish(undefined);
          this.service.emitOrgEvent();
          this.service.emitMenuEvent();
        });
    }

    if (this.service.selectedOrganizationIds.length > 0) {
      this.showOrganization.OrganizationIds = this.service.selectedOrganizationIds;
      const usersetting = this.roleService.getUserRole();
      this.showOrganization.IsAdminViewEnabled = usersetting.adminView;
      this.service.showOrganization(this.showOrganization)
        .subscribe((response) => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.labels.organizationUnHiddenSuccesfully'));
          }
          else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.eventService.getEvent(EventConstants.GetOrganizations).publish(undefined);
          this.service.selectedOrganizationIds = [];
          this.service.emitOrgChangeEvent(undefined);
          this.service.emitMenuEvent();
        });
    }

    this.subscriptions.add(this.eventService.getEvent(EventConstants.RedirectToViewHidden).subscribe((item) => {
      if (!this.service.hasAnyHiddenOrganization) {
        this.viewHidden();
        var homeMenuIcons = this.service.homeMenuIcons;
        homeMenuIcons.IsViewHiddenEnabled = false;
        this.eventService.getEvent(EventConstants.HomeMenuEnableDisableIcons).publish(homeMenuIcons);
      }
    }));

  }

  viewHidden() {
    if (!this.service.homeMenuIcons.IsViewHiddenEnabled)
      return;

    this.service.selectedOrganizationIds = [];
    this.service.selectedProjectIds = [];
    this.service.selectedOrganization = undefined;
    this.service.selectedProject = undefined;

    if (!this.service.viewHiddenOrgOrProjects)
      this.service.viewHiddenOrgOrProjects = true;
    else
      this.service.viewHiddenOrgOrProjects = false;

    this.service.emitOrgEvent();
    this.service.emitOrgChangeEvent(undefined);
    this.enableDisableTopMenuNew()
  }

  loadCreateComponent() {

    if (!this.service.homeMenuIcons.IsCreateEnabled)
      return;

    if (!this.loadOrgEditComponent) {
      this.loadOrgCreateComponent = true;
      this.loadOrgEditComponent = false;
      this.disablebutton = true;
    }
  }

  loadEditComponent() {
    if (!this.service.homeMenuIcons.IsEditEnabled)
      return;

    if (this.service.selectedOrganizationIds.length == 1 || this.service.selectedProjectIds.length == 1) {
      this.loadOrgCreateComponent = false;
      this.loadOrgEditComponent = true;
    }
  }

  deleteOrganizationOrProject() {
    if (!this.service.homeMenuIcons.IsDeleteEnabled)
      return;

    this.alertService.clear();

    if (this.service.selectedOrganizationIds && this.service.selectedOrganizationIds.length > 0) {
      this.organizationDeleteModel.OrganizationIds = this.service.selectedOrganizationIds;
      this.service.deleteOrganization(this.organizationDeleteModel)
        .subscribe((response) => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.labels.organiztionDeletedSuccesfully'));
          }
          else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.service.selectedOrganizationIds = [];
          this.service.emitOrgEvent();
          this.service.emitOrgChangeEvent(undefined);
          this.service.emitMenuEvent();
        });
    }

    if (this.service.selectedProjectIds && this.service.selectedProjectIds.length > 0) {
      this.projectDeleteModel.ProjectIds = this.service.selectedProjectIds;
      this.service.deleteProject(this.projectDeleteModel)
        .subscribe((response) => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.labels.projectDeletedSuccesfully'));
          }
          else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.service.selectedProjectIds = [];
          this.service.emitOrgChangeEvent(this.selectedOrganizationId);
          this.service.emitMenuEvent();
        });
    }
  }

  CancelCreateOrganizationComponent() {
    this.loadOrgCreateComponent = false;
    this.loadOrgEditComponent = false;

    this.service.emitMenuEvent();
  }
  toggleCollapse() {
    this.show = !this.show;
    let transFilterID = this.el.nativeElement.querySelector("#homeFilters-section");
    // To change the name of image.
    if (this.show) {
      this.userUISetting.isMenuExpanded = true;
      transFilterID.classList.remove('collapsed');
      this.imageKey = 'collapse';
      this.imageName = this.translate.instant(this.imageKey);
      var _parentThis = this;
      setTimeout(function () {
        var industryButtons = document.querySelectorAll('.home-industry .btn');
        industryButtons.forEach(item => {
          item.classList.add('industry');
        });
        _parentThis.EnableDisableProjectFilter();
      });
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
  EnableDisableProjectFilter() {
    var projectSection = document.querySelector(".project-filter-section");
    if (!this.selectedOrganizationId) {
      if (projectSection)
        projectSection.classList.add('filter-project-disable');
    }
    else {
      if (projectSection && this.ddListProjectData && this.ddListProjectData.length > 0)
        projectSection.classList.remove('filter-project-disable');
      else
        projectSection.classList.add('filter-project-disable');
    }

    var orgSection = document.querySelector(".org-filter-section");
    if (orgSection) {
      if (this.ddListOrganizationData != null && this.ddListOrganizationData.length > 0)
        orgSection.classList.remove('filter-org-disable');
      else
        orgSection.classList.add('filter-org-disable');
    }
  }

  private getOrganizationDropDownFilterData() {
    this.subscriptions.add(this.service.getOrganizationFilterMenuData()
    .subscribe(
        (data: OrganizationFilterDataModel) => {
          this.ddListOrganizationData = data.organizations;

          for (var i = 0; i < data.gupNames.length; i++) {
            if (data.gupNames[i]["id"] == null)
              data.gupNames[i]["name"] = 'Blank';
          };

          if (data.gupNames != undefined) {
            data.gupNames.forEach((element: any) => {
              element["id"] = element["name"] + ";" + element["id"];
            });
          }

          this.ddListGUPData = data.gupNames;
          this.ddListCountryData = data.country;
          this.ddListOrganizationIndustryData = this.getIndustryData(data.industry);

          var orgSection = document.querySelector(".org-filter-section");
          if (orgSection) {
            if (this.ddListOrganizationData && this.ddListOrganizationData.length > 0)
              orgSection.classList.remove('filter-org-disable');
            else
              orgSection.classList.add('filter-org-disable');
          }
        },
        error => {
          console.log(this.translate.instant('screens.project-setup.entity.entity-create.OrganizationDropdownFilterDataRequestFailed'));
        }
      ));
  }

  private setOrganizationDropDownFilterSettings() {
    this.ddOrganizationSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.ddCountrySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.ddGUPSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.ddOrganizationIndustrySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
  }

  private getProjectDropDownFilterData(organizationId: string) {
    if (!this.selectedOrganizationId) {
      var projectSection = document.querySelector(".project-filter-section");
      if (projectSection)
        projectSection.classList.add('filter-project-disable');
      return;
    }

    this.subscriptions.add(this.service.getProjectFilterMenuData(organizationId)
      .subscribe(
        (data: ProjectFilterDataModel) => {
          let projectSection = document.querySelector(".project-filter-section");
          if (projectSection) {
            if (data.projects.length > 0)
              projectSection.classList.remove('filter-project-disable');
            else
              projectSection.classList.add('filter-project-disable');
          }


          this.hasProjectIndustries = true;
          this.ddListProjectData = data.projects;
          this.ddListProjectIndustryData = this.getIndustryData(data.industries);
          this.ddListFiscalYearData = data.fiscalYear.map(String);

          for (var i = 0; i < data.useCase.length; i++) {
            if (data.useCase[i]["name"] == null) {
              data.useCase[i]["id"] = null;
              data.useCase[i]["name"] = 'Blank';
            }
          };

          this.ddListUserCaseData = data.useCase;
        },
        error => {
          console.error(this.translate.instant('screens.project-setup.entity.entity-create.ProjectDropdownFilterDataRequestFailed'));
        }
      ));
  }

  private setProjectDropDownFilterSettings() {
    this.ddProjectSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.ddProjectIndustrySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.ddFiscalYearSettings = {
      singleSelection: false,
      idField: 'fiscalYear',
      textField: 'fiscalYear',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.ddUseCaseSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.SelectAll'),
      unSelectAllText: this.translate.instant('screens.user.AdminView.Library.Labels.LibraryFilter.UnSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
  }

  onOrganizationFilterSelect(item: any) {

    // if(item.length !== 0) {
    //   this.organizationFilterViewModel.IsFilterDataRequest = true;
    // } else { 
    //   this.organizationFilterViewModel.IsFilterDataRequest = false;
    // }

    this.service.homeMenuIcons.IsClearFilterEnabled = true;

    this.organizationFilterViewModel.OrganizationIds = [];
    this.organizationFilterViewModel.GUPIds = [];
    this.organizationFilterViewModel.CountryIds = [];

    if (this.selectedOrganizationValues != undefined)
      this.selectedOrganizationValues.forEach((element: never) => {
        this.organizationFilterViewModel.OrganizationIds.push(element["id"]);
      });

    if (this.selectedGUPValues != undefined) {
      this.organizationFilterViewModel.GUPIds = new Array();
      this.selectedGUPValues.forEach((element: any) => {
        let GUP = new GUPFilterDataModel();
        var splitData = element['id'].split(";");
        GUP.id = splitData[1];
        if (element['name'] == "Blank")
          GUP.name = null;
        else
          GUP.name = element['name'];
        this.organizationFilterViewModel.GUPIds.push(GUP);
      });
    }

    if (this.selectedCountryValues != undefined)
      this.selectedCountryValues.forEach((element: never) => {
        this.organizationFilterViewModel.CountryIds.push(element["id"]);
      });


    if (this.organizationFilterViewModel.OrganizationIds.length !== 0 ||
      this.organizationFilterViewModel.CountryIds.length ||
      this.organizationFilterViewModel.GUPIds.length) {
      this.organizationFilterViewModel.IsFilterDataRequest = true;
    } else {
      this.organizationFilterViewModel.IsFilterDataRequest = false;
    }

    // if(this.organizationFilterViewModel.OrganizationIds.length !== 0 || 
    //   this.organizationFilterViewModel.CountryIds.length !== 0 || 
    //   this.organizationFilterViewModel.GUPIds.length !== 0) {
    //     this.organizationFilterViewModel.IsFilterDataRequest === true;
    //   } else {
    //     this.organizationFilterViewModel.IsFilterDataRequest === false;
    //   }

    this.eventService.getEvent(EventConstants.OrganizationMenuFilter).publish(this.organizationFilterViewModel);
  }

  getIndustryData(industry: Industry[]) {
    var _industries = [];

    industry.forEach(element => {
      var subIndustries = [];
      element.subIndustries.forEach(subelement => {
        subIndustries.push(new TreeviewItem({ checked: false, text: subelement.subIndustry, value: subelement.id }));
      });

      if (!element.subIndustries || element.subIndustries.length == 0)
        _industries.push(new TreeviewItem({ checked: false, text: element.industry, value: element.id }));
      else {
        _industries.push(new TreeviewItem({ checked: false, text: element.industry, value: element.id, children: subIndustries }));
      }
    });
    return _industries;
  }

  onSelectAllOrganization(items: any) {
    if (items.length !== 0) {
      this.organizationFilterViewModel.IsFilterDataRequest = true;
    } else {
      this.organizationFilterViewModel.IsFilterDataRequest = false;
    }
    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.organizationFilterViewModel.OrganizationIds = [];
    this.eventService.getEvent(EventConstants.OrganizationMenuFilter).publish(this.organizationFilterViewModel);
  }

  onSelectAllGUP(items: any) {
    if (items.length !== 0) {
      this.organizationFilterViewModel.IsFilterDataRequest = true;
    } else {
      this.organizationFilterViewModel.IsFilterDataRequest = false;
    }
    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.organizationFilterViewModel.GUPIds = [];
    this.eventService.getEvent(EventConstants.OrganizationMenuFilter).publish(this.organizationFilterViewModel);
  }

  onSelectAllCountry(items: any) {
    if (items.length !== 0) {
      this.organizationFilterViewModel.IsFilterDataRequest = true;
    } else {
      this.organizationFilterViewModel.IsFilterDataRequest = false;
    }
    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.organizationFilterViewModel.CountryIds = [];
    this.eventService.getEvent(EventConstants.OrganizationMenuFilter).publish(this.organizationFilterViewModel);
  }


  onOrganizationIndustrySelected(event) {
    if (event.length === 0) {
      this.organizationFilterViewModel.IsFilterDataRequest = false;
    } else {
      this.organizationFilterViewModel.IsFilterDataRequest = true;
    }
    if (!this.organizationFilterViewModel.IndustryIds && event.length == 0)
      return;

    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.organizationFilterViewModel.IndustryIds = event;
    this.eventService.getEvent(EventConstants.OrganizationMenuFilter).publish(this.organizationFilterViewModel);
  }

  onProjectIndustrySelected(event) {
    if (!this.projectFilterViewModel.IndustryIds && event.length == 0)
      return;

    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.populateProjectFilterData();
    this.projectFilterViewModel.IndustryIds = event;
    if (this.projectFilterViewModel.IndustryIds.length === 0) {
      this.projectFilterViewModel.IsFilterDataRequest = false;
    } else {
      this.projectFilterViewModel.IsFilterDataRequest = true;
    }
    this.eventService.getEvent(EventConstants.ProjectMenuFilter).publish(this.projectFilterViewModel);
  }


  onSelectAllProjects(items: any) {
    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.projectFilterViewModel.ProjectIds = [];
    if (items.length !== 0) {
      this.projectFilterViewModel.IsFilterDataRequest = true;
    } else {
      this.projectFilterViewModel.IsFilterDataRequest = false;
    }
    this.projectFilterViewModel.OrganizationId = this.selectedOrganizationId;
    this.eventService.getEvent(EventConstants.ProjectMenuFilter).publish(this.projectFilterViewModel);
  }

  onSelectAllFiscalYear(items: any) {
    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.projectFilterViewModel.FiscalYear = [];
    if (items.length !== 0) {
      this.projectFilterViewModel.IsFilterDataRequest = true;
    } else {
      this.projectFilterViewModel.IsFilterDataRequest = false;
    }
    this.projectFilterViewModel.OrganizationId = this.selectedOrganizationId;
    this.eventService.getEvent(EventConstants.ProjectMenuFilter).publish(this.projectFilterViewModel);
  }

  onSelectAllUseCase(items: any) {
    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.projectFilterViewModel.UseCaseIds = [];
    if (items.length !== 0) {
      this.projectFilterViewModel.IsFilterDataRequest = true;
    } else {
      this.projectFilterViewModel.IsFilterDataRequest = false;
    }
    this.projectFilterViewModel.OrganizationId = this.selectedOrganizationId;
    this.eventService.getEvent(EventConstants.ProjectMenuFilter).publish(this.projectFilterViewModel);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private dialogTemplate: Dialog;
  openDeleteConfirmDialog(): void {
    if (!this.service.homeMenuIcons.IsDeleteEnabled)
      return;

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-setup.entity.entity-create.TaxId');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteOrganizationOrProject();
      }
    });
  }

  onProjectFilterSelect(item: any) {
    this.service.homeMenuIcons.IsClearFilterEnabled = true;
    this.populateProjectFilterData();
    this.eventService.getEvent(EventConstants.ProjectMenuFilter).publish(this.projectFilterViewModel);
  }

  populateProjectFilterData() {

    this.projectFilterViewModel.ProjectIds = [];
    this.projectFilterViewModel.FiscalYear = [];
    this.projectFilterViewModel.IndustryIds = [];
    this.projectFilterViewModel.UseCaseIds = [];
    this.projectFilterViewModel.OrganizationId = undefined;

    if (this.selectedOrganizationId != undefined)
      this.projectFilterViewModel.OrganizationId = this.selectedOrganizationId;


    if (this.selectedProjectValues != undefined)
      this.selectedProjectValues.forEach((element: never) => {
        this.projectFilterViewModel.ProjectIds.push(element["id"]);
      });

    if (this.selectedFiscalYearValues != undefined)
      this.projectFilterViewModel.FiscalYear = this.selectedFiscalYearValues;

    if (this.selectedUseCaseValues != undefined)
      this.selectedUseCaseValues.forEach((element: never) => {
        this.projectFilterViewModel.UseCaseIds.push(element["id"]);
      });

    if (this.projectFilterViewModel.UseCaseIds.length !== 0 ||
      this.projectFilterViewModel.FiscalYear.length !== 0 || this.projectFilterViewModel.ProjectIds.length !== 0 ||
      this.projectFilterViewModel.IndustryIds.length !== 0) {
      this.projectFilterViewModel.IsFilterDataRequest = true;
    } else {
      this.projectFilterViewModel.IsFilterDataRequest = false;
    }
  };

  clearFilters() {
    let clearProjectSection: boolean = false;
    let orgId = this.selectedOrganizationId ? this.selectedOrganizationId.toString() : undefined;
    clearProjectSection = (this.projectFilterViewModel.IsFilterDataRequest && !this.organizationFilterViewModel.IsFilterDataRequest);
    this.service.selectedProjectIds = [];
    this.service.selectedOrganizationIds = [];
    this.service.selectedOrganization = undefined;
    this.service.selectedProject = undefined;
    this.selectedOrganizationValues = [];
    this.selectedGUPValues = []
    this.selectedCountryValues = [];
    this.selectedProjectValues = [];
    this.selectedFiscalYearValues = [];
    this.selectedUseCaseValues = [];
    this.getOrganizationDropDownFilterData();
    this.projectFilterViewModel.IndustryIds = undefined;
    this.organizationFilterViewModel = new OrganizationFilterViewModel();
    this.organizationFilterViewModel.IndustryIds = undefined;
    this.organizationFilterViewModel.isVisible = true;
    this.eventService.getEvent(EventConstants.OrganizationMenuFilter).publish(this.organizationFilterViewModel);
    this.service.homeMenuIcons.IsClearFilterEnabled = false;
    if (clearProjectSection && orgId)
      this.service.emitOrgChangeEvent(orgId);
    this.enableDisableTopMenuNew();
  }

  loadCopyProjectComponent() {
    this.DialogService.open(CopyProjectComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
}
