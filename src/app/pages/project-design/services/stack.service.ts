import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { TemplateStackUngroupModel } from '../../../@models/projectDesigner/template';
import { BlockDetailsResponseViewModel } from '../../../@models/projectDesigner/block';
import { StackRequestViewModel, StackAttributeDetail, StackAttributeViewModel, UpdateStackAttributeDetails } from '../../../@models/projectDesigner/stack'
import { KsResponse, GenericResponse } from '../../../@models/ResponseStatus';
import { Observable } from 'rxjs/Observable';
import { ShareDetailService } from '../../../shared/services/share-detail.service';

@Injectable({
  providedIn: 'root'
})


export class StackService {
  isExtendedIconicView: boolean = false;
  constructor(private http: HttpClient, private appConfig: AppliConfigService, private sharedService : ShareDetailService) {   
   }

   public StackUngroup(stackToUngroup: TemplateStackUngroupModel) {

    let body = JSON.stringify(stackToUngroup);
    let headers =
      new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() +
      '/api/stack/ungrouptemplatestack', body, { headers });
  }
  

  public createStack(request: StackRequestViewModel) {
    return this
      .http
      .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/createstack', request);
  }

  public getstackdetails(stackId: string) {
    return this
      .http
      .get<StackAttributeDetail>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/getstackdetails/' + stackId);
  }


  public updateStackDetails(request: StackAttributeDetail) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/updatestackattribute', request);
  }

  public getstackattributedetail() {
    let projectId = this.sharedService.getORganizationDetail().projectId;
    return this
      .http
      .get<StackAttributeViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/getstackattributedetail/'+ projectId);
  }

  public updateStackAttributeDetails(attributeDetails: UpdateStackAttributeDetails) {
    return this
        .http
        .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/updatestackattribute', attributeDetails);
   }

  public getNestedBlocksInStack(stackId: string, blockId: string,blockIndentation: any) {
    return this
      .http
      .get<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/nestedblocksinstack/' + stackId + '/' + blockId + '/' + blockIndentation);
  }

}
