import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { ProjectUsageFilterViewModel, ProjectUsageResponseViewModel } from '../../../@models/admin/usageReport';
import { KfsResponse } from '../../../@models/ResponseStatus';

@Injectable({
  providedIn: 'root',
})
export class UsageReportService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) {
   }

  public get(projectUsageFilterViewModel: ProjectUsageFilterViewModel) {
    return this
      .http
      .post<ProjectUsageResponseViewModel>(this.appConfig.ApiProjectManagementUrl() + '/api/projectusage/report', projectUsageFilterViewModel)
  }

  public getProjectUsageFilterMenuData() {
    return this
      .http
      .get(this.appConfig.ApiProjectManagementUrl() + '/api/projectusage/GetProjectUsageFilterMenuData')
  }
  download_UsageReport(viewModel: ProjectUsageFilterViewModel) {
    const body=JSON.stringify(viewModel);
    const headers=new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KfsResponse>(this.appConfig.ApiProjectManagementUrl() + "/api/projectusage/downloadreport/",viewModel);
  }
}
