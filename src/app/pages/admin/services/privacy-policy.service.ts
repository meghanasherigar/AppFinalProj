import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { PrivacyStatementViewModel, PrivacyStatementResponceViewModel } from '../../../@models/admin/privacyPolicy';
import { KsResponse } from '../../../@models/ResponseStatus';


@Injectable({
  providedIn: 'root'
})
export class PrivacyPolicyService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getPrivacyStatement(userType : string) {
    return this.http.get<PrivacyStatementResponceViewModel>(this.appConfig.ApiProjectManagementUrl() + '/api/privacystatement/getprivacystatement/' + userType);
  }
  public getLastPublishedData(userType : string) {
    return this.http.get<PrivacyStatementResponceViewModel>(this.appConfig.ApiProjectManagementUrl() + '/api/privacystatement/getpublishedby/' + userType);
  }

  public save(privacyStatementViewModel: PrivacyStatementViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/privacystatement/save', privacyStatementViewModel);
  }

  public publish(privacyStatementViewModel: PrivacyStatementViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/privacystatement/publish', privacyStatementViewModel);
  }

  public getUserType() {
    return this.http.get<string[]>(this.appConfig.ApiProjectManagementUrl() + '/api/privacystatement/getusertype');
  }
}
