import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { BlockRequestModel } from '../@models/blocks/block';

@Injectable({
  providedIn: 'root'
})
export class BlockReportService {

  constructor(private http: HttpClient,private sharedService:ShareDetailService,
    private appConfig: AppliConfigService) { }


    public getBlockReport(blockRequest:BlockRequestModel) {

      blockRequest.projectId= this.sharedService.getORganizationDetail().projectId;

      return this.http
        .post(this.appConfig.ApiProjectManagementUrl() + '/api/blockreport/blockreport',blockRequest);
    }

    public getBlockSummary(blockRequest:BlockRequestModel) {

      blockRequest.projectId= this.sharedService.getORganizationDetail().projectId;
      
      return this.http
        .post(this.appConfig.ApiProjectManagementUrl() + '/api/blockreport/blocksummary',blockRequest);
    }

    public updateBlockreference(blockRequest:BlockRequestModel[])
    {
      return this.http
        .post(this.appConfig.ApiProjectManagementUrl() + '/api/blockreport/updateblockreference',blockRequest);
    }

    getBlockFilterData() {
      const body = { projectId:  this.sharedService.getORganizationDetail().projectId}
      return this.http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/blockreport/blockfiltermenu/', body);
    }

    getBlockAssignToUsers(request) {
      request.projectId = this.sharedService.getORganizationDetail().projectId;
      return this.http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/blockreport/blockuserlist/', request);
    }
}




