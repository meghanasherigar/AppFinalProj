import { Injectable } from '@angular/core';
import { AppUserGridDataModel, AppUserFilterRequestModel, AppUserResponseViewModel, AppUserAddRequestViewModel, AppUsersCountryMasterViewModel } from '../../../@models/super-admin/appUsers';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { KsResponse, KfsResponse } from '../../../@models/ResponseStatus';


export enum AppUsersAPIEndPoints {
  GetAppUsersonFiler = '/api/appusers/getappusersonfilter',
  RemoveAppAccess = '/api/appusers/removeappaccess',
  GrantAppAccess = '/api/appusers/grantappaccess',
  DeleteAppUsers = '/api/appusers/deleteappusers',
  InsertOne = '/api/appusers/insertone',
  AddAppUsers = '/api/appusers/addappusers',
  GetAppUsersCountryMaster = '/api/common/getappuserscountrymaster',
  GetAppUserTemplate = '/api/appusers/getappusertemplate',
  UploadFile = '/api/appusers/uploadappuserfile',
}

@Injectable({
  providedIn: 'root'
})

export class AppUsersService {

  selectedAppUserRows: AppUserGridDataModel[];

  constructor(
    private http: HttpClient,
    private appConfig: AppliConfigService,
  ) { }

  getAppUsersData(appUserFilterRequestModel: AppUserFilterRequestModel){
    return this.http.post<AppUserResponseViewModel>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.GetAppUsersonFiler, appUserFilterRequestModel);
  }

  removeAppAccess(appUsersId: string[]) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.RemoveAppAccess, appUsersId);
  }

  grantAppAccess(appUsersId: string[]) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.GrantAppAccess, appUsersId);
  }

  deleteAppUsers(appUsersId: string[]){
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.DeleteAppUsers, appUsersId);
  }

  insertOneAppUser(appUser: AppUserAddRequestViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.InsertOne, appUser);
  }

  addAppUsers(appUsers: AppUserAddRequestViewModel[]) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.AddAppUsers, appUsers);
  }

  getAppUsersCountryMaster() {
    return this.http.get<AppUsersCountryMasterViewModel[]>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.GetAppUsersCountryMaster);
  }

  getAppUserTemplate() {
    return this.http.get<KfsResponse>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.GetAppUserTemplate);
  }

  upload(file: FormData) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + AppUsersAPIEndPoints.UploadFile, file);
  }
}
