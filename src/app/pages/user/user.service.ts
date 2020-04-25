import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AppliConfigService } from '../../shared/services/appconfig.service';
import { User, UserSetting, UserUISetting, NotificationRequestModel } from '../../@models/user';
import { KsResponse } from '../../@models/ResponseStatus';
import { AuthService } from '../../shared/services/auth.service'
import { StorageService, StorageKeys } from '../../@core/services/storage/storage.service';
import { UserNotification } from '../../@models/common/notification';
import { ProjectUserSettingModel } from '../../@models/project';
import { NotificationViewModel, NotificationResponseModel } from '../../@models/notification';
import { CacheMapService } from '../../shared/services/cache/cache-map.service';
import { UserSearchResult } from '../../@models/userAdmin';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private appConfig: AppliConfigService,
    private authService: AuthService,
    private storageService: StorageService,
    private cacheService: CacheMapService) {
   }

  public getNotificationData: NotificationResponseModel;

  public getUsers(params: any) {
    return this.http.get<User[]>(this.appConfig.ApiUserManagementUrl() + '/users',
      {
        params: { pageNumber: params.offset, pageSize: params.limit }
      });
  }

  public acceptTermOfUse(){
    return this.http.post(this.appConfig.ApiUserManagementUrl() + 'api/users/accepttermsofuse','');
  }
  public createUser(userToCreate: User) {
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + '/users', userToCreate);
  }

  public getUser(userId: number) {
    return this.http.get<User>(this.appConfig.ApiUserManagementUrl() + '/users/' + userId);
  }

  public insertOrUpdateUserDetails() {
    return this.http.post(this.appConfig.ApiUserManagementUrl() + "/api/users/insertorupdateuserdetails",'');
  }

  public getLoggedInUser() {
    var currentUser = this.storageService.getItem('currentUser');
    if (currentUser != null) {
      const currUser = JSON.parse(currentUser);
      let users = currUser != null ? JSON.parse(currentUser).profile.given_name + ' '
        + JSON.parse(currentUser).profile.family_name : '';
      return users;
    }
    else {
      return '';
    }
  }

  public getLoggedInUserName() {
    var currentUser = this.storageService.getItem('currentUser');
    if (currentUser != null) {
      return JSON.parse(currentUser).profile.preferred_username;
    }
    else {
      return '';
    }
  }

  public getLoggedInUserEmail() {
    var currentUser = this.storageService.getItem('currentUser');
    if (currentUser != null) {
      return JSON.parse(currentUser).profile.email;
    }
    else {
      return '';
    }
  }

  getUserSettings() {
    return this.http.post<UserSetting>(this.appConfig.ApiUserManagementUrl() + "/api/users/getusersettings",'');
  }
  
  getUsersByEmails(emailids: []) {
    return this.http.post<UserSearchResult[]>(this.appConfig.ApiUserManagementUrl() + '/api/users/getusersbyemails', emailids);
  }

  insertUserDetails() {
    return this.http.post(this.appConfig.ApiUserManagementUrl() + "/api/users/insertuserdetails",'');
  }
  updateWhatsNewSettings(whatsNewStatus) {
    const userWhatsNewSettings = {
      IsWhatsNewHidden: whatsNewStatus
    }
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + "/api/users/updatewhatsnewsettings", userWhatsNewSettings);
  }

  getUserLoggedInCount() {
    let currentUser = JSON.parse(this.storageService.getItem('currentUser'));

    const httpOptions = {
      headers: new HttpHeaders({
      })
    };
    const UserData = {
      email: currentUser['profile']['email']
    }
    const url = this.appConfig.ApiUserManagementUrl();
    return this.http.post(url + "/api/users/uservisitcount", UserData, httpOptions);
  }

  public getNotifications(notificationRequestModel: NotificationRequestModel) {    
    return this.http.post<UserNotification[]>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/getnotifications', notificationRequestModel);
  }

  public updateNotificationRead() {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/notification/updatenotification', '');
  }
  public logOutUser() {
    // Clear all master data which is cached
    this.cacheService.clearAll();
    return this.authService.logout();
  }

  public getCurrentUserUISettings(): UserUISetting{
    var currentUserUISettings = this.storageService.getItem('CurrentUserUISettings');
    let userSettings = JSON.parse(currentUserUISettings);
    return userSettings;
  }


  public updateCurrentUserUISettings(userUISettings: UserUISetting ){
    this.storageService.addItem(StorageKeys.USERUISETTINGS, JSON.stringify(userUISettings));
  }

  public getProjectUserSetting(projectId) {
    let request= 
    {
      'projectid':projectId
    };
    return this
    .http
    .post<ProjectUserSettingModel>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/getprojectusersettings/', request);
  }

  public isExternalUser() {
    return this.http.get<boolean>(this.appConfig.ApiUserManagementUrl() + '/api/users/getisexternaluser')
  }

  public saveUserPreferences(preference:any)
  {
    let currentUser = JSON.parse(this.storageService.getItem('currentUser'));
    let userRequest=
    {
      userPreferences:preference,
      email:currentUser.profile.email
    };

    return this.http.post(this.appConfig.ApiUserManagementUrl() + '/api/users/saveuserpreferences',userRequest);

  }

}