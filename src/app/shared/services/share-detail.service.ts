import { Injectable } from '@angular/core';
import { StorageKeys, StorageService } from '../../@core/services/storage/storage.service';
import { SessionStorageService } from '../../@core/services/storage/sessionStorage.service';
import { ProjectContext, ProjectAccessRight } from '../../@models/organization';
import { BehaviorSubject, Subject } from 'rxjs';
import { ThemingContext } from '../../@models/projectDesigner/theming';
import { AppliConfigService } from './appconfig.service';
import { UserSetting } from '../../@models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Organization } from '../../@models/masterData/masterDataModels';
import { validInputSymbols } from '../../@models/common/valueconstants';

@Injectable({
  providedIn: 'root'
})
export class ShareDetailService {
  sourceElement: any = {};
  newEditor: any;
  hidefooter = new BehaviorSubject<boolean>(true);
  isHidefooter = this.hidefooter.asObservable();
  faqSearch: Subject<string> = new Subject<string>();
  constructor(private storageService: StorageService,
    private appConfig: AppliConfigService,
    private http: HttpClient,
    private sessionStorageService: SessionStorageService) { }

  changeHidefooter(ishidefooter: boolean) {
    this.hidefooter.next(ishidefooter);
  }
  setOrganizationDetail(organizationDetail: ProjectContext) {
    if (this.sessionStorageService.getItem(StorageKeys.PROJECTINCONTEXT) !== null) {
      const organization = this.getORganizationDetail();
      if (organizationDetail.organizationId) {
        organization.organizationId = organizationDetail.organizationId;
        organization.organizationName = organizationDetail.organizationName;
        organization.ProjectAccessRight = new ProjectAccessRight();
      } else {
        organization.projectId = organizationDetail.projectId;
        organization.projectName = organizationDetail.projectName;
        organization.fiscalYear = organizationDetail.fiscalYear;
        organization.industry = organizationDetail.industry;
        if(organizationDetail.ProjectAccessRight) {
          organization.ProjectAccessRight.isCentralUser = organizationDetail.ProjectAccessRight.isCentralUser;
          organization.ProjectAccessRight.isEntityDataAvailable = organizationDetail.ProjectAccessRight.isEntityDataAvailable;
          organization.ProjectAccessRight.isStaffedUsersDataAvailable = organizationDetail.ProjectAccessRight.isStaffedUsersDataAvailable;
          organization.ProjectAccessRight.isTransactionDataAvailable = organizationDetail.ProjectAccessRight.isTransactionDataAvailable;
        } else {
          organization.ProjectAccessRight = new ProjectAccessRight(); 
        }
      }
      this.sessionStorageService.addItem(StorageKeys.PROJECTINCONTEXT, JSON.stringify(organization));
    } else {
      this.sessionStorageService.addItem(StorageKeys.PROJECTINCONTEXT, JSON.stringify(organizationDetail));
    }
  }

  getORganizationDetail(): ProjectContext {
    return JSON.parse(this.sessionStorageService.getItem(StorageKeys.PROJECTINCONTEXT));
  }

  setSelectedTheme(selectedTheme: ThemingContext) {
    this.sessionStorageService.addItem(StorageKeys.THEMINGCONTEXT, JSON.stringify(selectedTheme));
  }

  getSelectedTheme() {
    return JSON.parse(this.sessionStorageService.getItem(StorageKeys.THEMINGCONTEXT));
  }

  getUserSettings() {
    return this.http.post<UserSetting>(this.appConfig.ApiUserManagementUrl() + "/api/users/getusersettings",'');
  }
  insertUserDetails() {
    return this.http.post(this.appConfig.ApiUserManagementUrl() + "/api/users/insertuserdetails",'');
  }
  validateSpecialChar(key) {
      if(validInputSymbols.symbol.indexOf(key) != -1){
       return false;
      } else {
        return true;
      }
  }
}
