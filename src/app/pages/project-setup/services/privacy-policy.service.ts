import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { PrivacyStatementResponceViewModel } from '../../../@models/admin/privacyPolicy';

@Injectable({
  providedIn: 'root'
})
export class PrivacyPolicyService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getLastPublishedData(userType : string) {
    return this.http.get<PrivacyStatementResponceViewModel>(this.appConfig.ApiProjectManagementUrl() + '/api/privacystatement/getpublishedby/' + userType);
  }
}
