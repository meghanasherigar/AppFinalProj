import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { DeliverableReport, deliverableFilterViewModel } from '../@models/deliverable/deliverable';
import { UserGrid, GridColumn, DeliverableReportRequestModel } from '../@models/deliverable/deliverable-columns';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { Observable } from 'rxjs';
import { HeaderSummary } from '../@models/common/header-summary';

@Injectable({
  providedIn: 'root'
})
export class ProjectDeliverableService {

  projectId:string;
  constructor(private http: HttpClient,private sharedService:ShareDetailService,
    private appConfig: AppliConfigService) { }


  public createDeliverable(deliverable: DeliverableReport) {
    return this
      .http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/createdeliverable', deliverable);
  }

  public updateDeliverable(deliverable: any) {
    return this
      .http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/updatedeliverable', deliverable);
  }

  public userGridColumns():Observable<UserGrid> {
    let request: UserGrid = new UserGrid();
    this.projectId = this.sharedService.getORganizationDetail().projectId;

    request.projectId= this.projectId;

    return this.http.post<UserGrid>(this.appConfig.ApiProjectManagementUrl() + '/api/gridsetting/usergridcolumns', request);
  }

  public updateUserGridSettings(gridColumns:GridColumn[])
  {
    let request: UserGrid = new UserGrid();
    this.projectId = this.sharedService.getORganizationDetail().projectId;
    request.projectId= this.projectId;
    request.userGridColumns=gridColumns;

    return this.http.post<UserGrid>(this.appConfig.ApiProjectManagementUrl() + '/api/gridsetting/updateusergridcolumns', request);
  }

  public getDeliverablesList(deliverable: deliverableFilterViewModel) {
    return this
      .http
      .post<Array<any>>(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/deliverable', deliverable);
  }

  public downloadDeliverable(deliverable: deliverableFilterViewModel) {
    return this
      .http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/download', deliverable);
  }


  public getDeliverableSummary(deliverable: DeliverableReportRequestModel)
  {
    return this
      .http
      .post<HeaderSummary>(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/deliverablesummary', deliverable);
  }


  public updateDeliverableReportDates(deliverableRequest:any)
  {
    return this.http
    .post(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/updatedeliverabledates', deliverableRequest);
  }

  public loadFilterData()
  {
    // this.projectId = this.sharedService.getORganizationDetail().projectId;
    const body = { projectId:  this.sharedService.getORganizationDetail().projectId}
    return this.http
    .post(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/deliverablefiltermenu/', body);
  }

  public getAllMilestones()
  {
    this.projectId = this.sharedService.getORganizationDetail().projectId;
    return this.http
    .get(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/projectmilestones/'+this.projectId);
  }

}
