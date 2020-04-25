import { Injectable } from '@angular/core';
import { AdminFilterRequestViewModel, AdminUserResponseViewModel, UserSearchResult, SearchViewModel, AdminUserModel, UserDeleteViewModel, UserDownloadViewModel, AdminMenuIcons, AdminUserGridData } from '../../../@models/admin/manageAdmin';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { KsResponse, KfsResponse } from '../../../@models/ResponseStatus';

@Injectable({
  providedIn: 'root'
})
export class ManageAdminService {

  adminMenuIcons: AdminMenuIcons;
  selectedAdminUserRows: AdminUserGridData[];

  constructor(
    private http: HttpClient,
    private appConfig: AppliConfigService
  ) {
    this.adminMenuIcons = new AdminMenuIcons();
  }

  getAdminUserData(adminFilterRequestViewModel: AdminFilterRequestViewModel) {
    return this.http.post<AdminUserResponseViewModel>(this.appConfig.ApiUserManagementUrl() + '/api/users/getusers', adminFilterRequestViewModel);
  }

  searchUser(input: SearchViewModel) {
    return this.http.post<UserSearchResult[]>(this.appConfig.ApiUserManagementUrl() + '/api/users/searchuser', input);
  }

  insertAdminUser(adminUserViewModel: AdminUserModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + '/api/users/insertadminuser', adminUserViewModel);
  }

  updateAdminUser(adminUserViewModel: AdminUserModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + '/api/users/updateuser', adminUserViewModel);
  }

  deleteAdminUsers(userDeleteViewModel: UserDeleteViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + '/api/users/deleteusers', userDeleteViewModel);
  }

  downloadAdminUsers(userDownloadViewModel: UserDownloadViewModel) {
    return this.http.post<KfsResponse>(this.appConfig.ApiUserManagementUrl() + '/api/users/downloadusers', userDownloadViewModel);
  }

  searchInternalUser(input: SearchViewModel){
    return this.http.post<UserSearchResult[]>(this.appConfig.ApiUserManagementUrl() + '/api/users/searchinternaluser', input);
  }

  public getAdminFilterMenuData() {
    return this
      .http
      .get(this.appConfig.ApiUserManagementUrl() + '/api/users/getfiltermenudata');
  }
}
