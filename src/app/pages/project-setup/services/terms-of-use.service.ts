import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { TermsofUseResponceViewModel } from '../../../@models/admin/termsofuse';

@Injectable({
  providedIn: 'root'
})
export class TermsOfUseService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getLastPublishedData(userType : string) {
    return this.http.get<TermsofUseResponceViewModel>(this.appConfig.ApiProjectManagementUrl() + '/api/termsofUse/getpublishedby/' + userType);
  }

}
