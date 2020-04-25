import { Injectable } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../shared/services/appconfig.service';
import { KsResponse } from '../../@models/ResponseStatus';
import { OrganizationRequest, OrganizationResponse, OrganizationHideModel, OrganizationShowModel, Industry, NewOrganizationRequest, OrganizationDeleteModel, OrganizationFilterViewModel, OrganizationSearchResponse, HomeMenuIcons, OrganizationResultModel, GUP, OrganizationFilterMenuDataModel, NotificationFilterMenuViewModel, NotificationGridResponseViewModel, NotificationFilterRequestViewModel, NotificationGridData, NotifyUserDeleteViewModel } from '../../@models/organization';
import { ProjectRequest, ProjectResponse, ProjectHideModel, ProjectShowModel, ProjectFilterViewModel, ProjectDeleteModel, UseCase, ProjectResultModel, ProjectFilterMenuData, ProjectUserSettingModel, CopyProjectRequest } from '../../@models/project';
import { StorageService } from '../../@core/services/storage/storage.service';
import { RoleService } from '../../shared/services/role.service';


@Injectable({
  providedIn: 'root'
})
export class HomeService {

  organizationId: string;
  serviceEmitter: EventEmitter<any> = new EventEmitter();
  organizationEmitter: EventEmitter<any> = new EventEmitter();
  homeMenuEmitter: EventEmitter<any> = new EventEmitter();

  viewHiddenOrgOrProjects: boolean;
  selectedOrganizationIds: Array<string> = [];
  selectedProjectIds: Array<string> = [];
  selectedOrganization: any;
  selectedProject: any;
  hasAnyHiddenOrganization: boolean;
  homeMenuIcons: HomeMenuIcons;
  orgcustomAction: Array<{ id: string, value: string }> = [];
  projectcustomAction: Array<{ id: string, value: string }> = [];
  selectedAdminUserRows: NotificationGridData[];
  canEditOrganization : boolean;
  canEditProject: boolean;

  emitOrgEvent() {
    this.organizationEmitter.emit();
  }
  getAllOrgEmitter() {
    return this.organizationEmitter;
  }

  emitOrgChangeEvent(organizationId) {
    this.serviceEmitter.emit(organizationId);
  }
  getOrgChangeEmitter() {
    return this.serviceEmitter;
  }

  emitMenuEvent() {
    this.homeMenuEmitter.emit();
  }

  subscribeMenuEvent() {
    return this.homeMenuEmitter;
  }

  private isVisible: boolean;
  constructor(private http: HttpClient, private appConfig: AppliConfigService, 
    private roleService:RoleService,) {
    this.homeMenuIcons = new HomeMenuIcons();
    this.viewHiddenOrgOrProjects = false;
  }

  public getOrganizations(organizationFilterModel: OrganizationFilterViewModel) {
    const usersetting = this.roleService.getUserRole();
    const adminviewEnable = usersetting && usersetting.adminView;
    organizationFilterModel.IsAdminViewEnabled = adminviewEnable;
    new HttpHeaders().set('Content-Type', 'application/json');
    return this
      .http
      .post<OrganizationResponse[]>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/GetOrganizationOnFilter', organizationFilterModel);
  }

  public getProjects(projectFilterViewModel: ProjectFilterViewModel) {
    return this
      .http
      .post<ProjectResultModel>(this.appConfig.ApiProjectSetupUrl() + '/api/projects/GetAllProjects/', projectFilterViewModel);
  }

  public getProjectUserSetting(projectId) {
    // projectRequest = new ProjectRequest();
    const projctId = {
      ProjectId: projectId
    }
    
    return this
    .http
    .post<ProjectUserSettingModel>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getprojectusersettings/', projctId);
  }

  public hideProject(hideProjectModel: ProjectHideModel) {
    new HttpHeaders().set('Content-Type', 'application/json');
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projects/hideprojects', hideProjectModel);
  }

  public showProject(showProjectModel: ProjectShowModel) {
    new HttpHeaders().set('Content-Type', 'application/json');
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projects/showprojects', showProjectModel);
  }

  public showOrganization(showOrganizationModel: OrganizationShowModel) {
    new HttpHeaders().set('Content-Type', 'application/json');
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/showorganizations', showOrganizationModel);
  }

  public hideOrganization(hideOrganizationModel: OrganizationHideModel) {
    new HttpHeaders().set('Content-Type', 'application/json');
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/hideorganizations', hideOrganizationModel);
  }

  public getIndustries() {
    return this
      .http
      .get<Industry[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getindustries');

  }

  public createOrganizationProject(newOrganizationRequest: NewOrganizationRequest) {
    new HttpHeaders().set('Content-Type', 'application/json');
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/setuporganization', newOrganizationRequest);

  }

  public deleteOrganization(organizationDeleteModel: OrganizationDeleteModel) {
    new HttpHeaders().set('Content-Type', 'application/json');
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/deleteorganizations', organizationDeleteModel);
  }

  public deleteProject(projectDeleteModel: ProjectDeleteModel) {
    new HttpHeaders().set('Content-Type', 'application/json');
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projects/deleteprojects', projectDeleteModel);
  }

  public getOrganizationFilterMenuData() {
    this.isVisible = this.viewHiddenOrgOrProjects ? false : true;
    const organizationfilter = new OrganizationFilterMenuDataModel();
    organizationfilter.IsVisible = this.isVisible;
    const usersetting = this.roleService.getUserRole();
    if (usersetting) {
    organizationfilter.IsAdminViewEnabled = usersetting.adminView;
    }
    return this
      .http
      .post(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/GetOrganizationFilterMenuData', organizationfilter);
  }

  public getOrganizationOnFilter(organizationFilterViewModel: OrganizationFilterViewModel) {
    return this
      .http
      .post<OrganizationResultModel>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/GetOrganizationOnFilter', organizationFilterViewModel);
  }

  public getProjectFilterMenuData(organizationId: string) {
    const projectFilterMenuData = new ProjectFilterMenuData();
    projectFilterMenuData.IsVisible = this.viewHiddenOrgOrProjects ? false : true;
    projectFilterMenuData.OrganizationId = organizationId;
    projectFilterMenuData.IsAdminViewEnabled = this.isAdminViewEnabled();
    return this
      .http
      .post(this.appConfig.ApiProjectSetupUrl() + '/api/projects/GetProjectFilterMenuData',projectFilterMenuData )
  }

  public updateOrganization(organizationViewModel: OrganizationRequest) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/updateorganization', organizationViewModel);
  }

  public updateProject(projectViewModel: ProjectRequest) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projects/updateproject', projectViewModel);
  }

  public copyProject(copyProjectViewModel: CopyProjectRequest) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projects/copy', copyProjectViewModel);
  }


  public getUseCases() {
    return this
      .http
      .get<UseCase[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getusecases');

  }

  public searchOrganization(term) {
    return this.http.get<OrganizationSearchResponse[]>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/SearchOrganization/?orgSearch=' + term);
  }

  public getAllGups() {
    return this
      .http
      .get<GUP[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getgups');

  }

  private isAdminViewEnabled(){
    const usersetting = this.roleService.getUserRole();
    return usersetting.adminView;
  }

  public getProjectById(id: string) {
    return this.http.get<any>(this.appConfig.ApiProjectSetupUrl() + '/api/projects/getprojectbyid/' + id);
  }

  public getOrganisationById(id: string) {
    return this.http.get<any>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/getorganizationbyid/' + id);
  }

  //Notification Section Starts
  public getNotificationFilter() {
    return this.http.get<NotificationFilterMenuViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/getnotificationfiltermenudata');
  }

  public getloadNotifyDetailsOnFilter(request :NotificationFilterRequestViewModel) {   
    return this.http.post<NotificationGridResponseViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/getnotificationonfilter', request);
  }

  public deleteNotifiyUser(notifyUserDeleteViewModel: NotifyUserDeleteViewModel) {    
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/deleteprojectuserright', notifyUserDeleteViewModel);
  }
  
  public updateReadNotifiyUser(notifyUserDeleteViewModel: NotifyUserDeleteViewModel) {    
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/deleteprojectuserright', notifyUserDeleteViewModel);
  }

  public updateStatusByAction(NotifyId, Action) {  
    return this.http.get<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/updateStatusByAction/?NotifyId=' + NotifyId + '&Action=' + Action);
  }
  //Notification Section Ends

}
