import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { KsResponse } from '../../../@models/ResponseStatus';
import { TermsofUseResponceViewModel, TermsofUseViewModel } from '../../../@models/admin/termsofuse';

@Injectable({
  providedIn: 'root'
})
export class TermsOfUseService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getTermsofUse(userType: string) {
    return this.http.get<TermsofUseResponceViewModel>(this.appConfig.ApiProjectManagementUrl() + '/api/termsofUse/gettermsofUse/' + userType);
  }
  public getLastPublishedData(userType: string) {
    return this.http.get<TermsofUseResponceViewModel>(this.appConfig.ApiProjectManagementUrl() + '/api/termsofUse/getpublishedby/'  + userType)
  }

  public save(termsofUseViewModel: TermsofUseViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/termsofUse/save', termsofUseViewModel)
  }

  public publish(termsofUseViewModel: TermsofUseViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/termsofUse/publish', termsofUseViewModel);
  }
}
