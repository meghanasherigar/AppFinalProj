import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { visualizationRequest, VisualizationGridResponseModel } from '../@models/visualization/visualization';

@Injectable({
  providedIn: 'root'
})
export class VisualizationService {

  constructor(private http: HttpClient,private appConfig: AppliConfigService)
    { }

    public getVisualizationData(request:visualizationRequest)
    {
      return this.http.post<VisualizationGridResponseModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/visualization/visualization', request);
    }

    public getVisualizationFilerMenu(projectId:string)
    {
      return this.http.get(this.appConfig.ApiProjectSetupUrl() + '/api/visualization/filtermenu/'+ projectId);
    }
}
