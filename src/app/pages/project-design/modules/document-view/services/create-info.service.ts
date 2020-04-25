import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../../../shared/services/appconfig.service';
import { KsResponse } from '../../../../../@models/ResponseStatus';

@Injectable({
  providedIn: 'root'
})
export class CreateInfoService {
  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }
  public getInfoReqFiltersMenu(projectId)
  {
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/getinformationrequestfiltermenu/' + projectId);
  }
  public getInfoGatheringRecords(requestedFilter)
  {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/getallinformationrequest',requestedFilter);
  }
  public getInformationRequestById(requestId)
  {
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/getinformationrequestbyid/' + requestId);
  }
  public deleteInfoRequests(ids:string[]) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/delete',ids);
  }
  public notApplicable(approveRejectModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/questionisnotapplicable', approveRejectModel);    
  }
 
}
