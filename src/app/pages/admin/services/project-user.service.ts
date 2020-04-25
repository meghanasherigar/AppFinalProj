import { HttpClient } from "@angular/common/http";
import { AppliConfigService } from "../../../shared/services/appconfig.service";
import { Injectable } from "@angular/core";
import { RegionViewModel, CountryViewModel, EntityViewModel, SearchViewModel, UserSearchResult, EntityRoleViewModel, UserAdminGridData, ProjectUserRightViewModel, CountryEntitySearchViewModel, UserAdminFilterRequestViewModel, ProjectUserDeleteViewModel, UserAdminResponseViewModel, EditCountryViewModel, EditEntityViewModel, ProjectUserFilterMenuDomainModel, SendEmailViewModel, ProjectTemplateViewModel, RegionCountrySearchViewModel, ProjectDeliverableRightViewModel, UserRightsViewModel, SearchProjectExternalUser, SearchProjectIinternalUser } from "../../../@models/userAdmin";
import { KsResponse, KfsResponse } from "../../../@models/ResponseStatus";
import { ShareDetailService } from '../../../shared/services/share-detail.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectUserService {
  adminMenuIcons: EntityRoleViewModel;
  selectedAdminUserRows: UserAdminGridData[];

  constructor(
    private http: HttpClient,
    private appConfig: AppliConfigService,
    private sharedService : ShareDetailService
  ) {
    this.adminMenuIcons = new EntityRoleViewModel();
  }

  searchUser(input: SearchProjectIinternalUser, searchUserFlag) {
    if (!searchUserFlag) {
      return this.http.post<UserSearchResult[]>(this.appConfig.ApiUserManagementUrl() + '/api/users/searchexternaluser', input);
    }
    else {
      return this.http.post<UserSearchResult[]>(this.appConfig.ApiUserManagementUrl() + '/api/users/searchprojectinternalusers', input);
    }
  }
  
  sendEmailSearchUser(input: SearchViewModel) {
    return this.http.post<UserSearchResult[]>(this.appConfig.ApiUserManagementUrl() + '/api/users/searchuser', input);
  }
  getAllEntities(projectId){
    return this.http.get<EntityViewModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getallentities/'+projectId);
  }
  getAllRegions(projectId) {
    return this.http.get<RegionViewModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getregionbyproject/' + projectId);
  }

  getCountriesByRegion(viewModel: RegionCountrySearchViewModel) {
    return this.http.post<CountryViewModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getallcountriesbyregion', viewModel);
  }

  getEntitiesByCountry(countryEntitySearchViewModel: CountryEntitySearchViewModel) {
    return this.http.post<EntityViewModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/Getallentitiesbycountry', countryEntitySearchViewModel);
  }

  getprojectuserrightsonfilter(projectUserFilter: UserAdminFilterRequestViewModel) {
    return this.http.post<UserAdminResponseViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getprojectuserrightsonfilter', projectUserFilter);
  }

  insertProjectUser(projectUserRightViewModel: ProjectUserRightViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/insertone', projectUserRightViewModel);
  }

  updateProjectUser(projectUserRightViewModel: ProjectUserRightViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/updateone', projectUserRightViewModel);
  }

  deleteProjectUser(projectUserDeleteViewModel: ProjectUserDeleteViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/deleteprojectuserright', projectUserDeleteViewModel);
  }

  downloadProjectUsers(userAdminFilterRequestViewModel: UserAdminFilterRequestViewModel) {
    return this.http.post<KfsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/downloadprojectuserrights', userAdminFilterRequestViewModel);
  }

  getWhiteListedDomains(){
    let projectId=this.sharedService.getORganizationDetail().projectId;
    return this.http.get(this.appConfig.ApiProjectSetupUrl() + '/api/projectsetting/getwhitelisteddomains/'+projectId);
  
  }

  getProjectUserFilterMenuData(projectID) {
    return this.http.get<ProjectUserFilterMenuDomainModel>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getprojectuserfiltermenudata/' + projectID);
  }

  upload(file: FormData) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + "/api/projectuserright/uploadprojectuserfile", file);
  }

  getAllProjectTemplate(projectid) {
    return this.http.get<ProjectTemplateViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/template/gettemplatesbyprojectid/' + projectid);
  }

  getProjectUserRights(projectId) {
    return this.http.get<ProjectDeliverableRightViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getprojectuserrights/' + projectId);
  }

  getDomumentViewRights(projectId) {
    return this.http.get<UserRightsViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getuserrights/' + projectId);
  }

  //Fetch users staffed on a template/deliverable
  getTemplateDeliverableUsers(requestModel) {
    return this
      .http
      .post<UserSearchResult[]>(this.appConfig.ApiProjectDesignUrl() + '/api/assign/getusers', requestModel);
  }

  searchProjectExternalUser(searchModel: SearchProjectExternalUser) {
    return this.http.post<UserSearchResult[]>(this.appConfig.ApiUserManagementUrl() + '/api/users/searchprojectexternalusers', searchModel);
  }

}