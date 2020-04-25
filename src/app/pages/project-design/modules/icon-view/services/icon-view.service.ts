import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TodoItemFlatNode, TodoItemNode } from '../content/region/templates/content/content.component';
import { BlockRequest, DragDropRequestViewModel } from '../../../../../@models/projectDesigner/block';
import { KsResponse } from '../../../../../@models/ResponseStatus';
import { AppliConfigService } from '../../../../../shared/services/appconfig.service';
import { TemplateStackUngroupModel, TemplateBlockDemote } from '../../../../../@models/projectDesigner/template';
import { UserSearchResult } from '../../../../../@models/admin/manageAdmin';
import { GenericResponseModel } from '../../../../../@models/projectDesigner/common';
@Injectable({
  providedIn: 'root'
})
export class IconViewService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) {
  }
  public dragNode = null;
  public dragNodes = [];
  public source : number;
  public sourceId : string;
  public deliverableId : string;
  public templateId : string;
  public flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  public selectedNodes: string[];
  public sourceUId : string;
  public sourceAutomaticPropagation : boolean;

  public saveDragDrop(viewModel: DragDropRequestViewModel) {
    const body = JSON.stringify(viewModel);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<GenericResponseModel>(this.appConfig.ApiProjectDesignUrl() + '/api/common/performdragdrop', viewModel);
  }
  public checkConcurrency(concurrencyModel)
  {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/common/CheckConcurrency', concurrencyModel);
  }
  public promoteDemoteTemplateBlock(request:TemplateBlockDemote, action: number)
  {
    if(action == 2)
      return this
      .http
      .post(this.appConfig.ApiProjectDesignUrl() + '/api/block/DemoteTemplateBlock', request);
      else
      return this
      .http
      .post(this.appConfig.ApiProjectDesignUrl() + '/api/block/PromoteTemplateBlock', request);
  }
  public promoteDemoteDeliverableBlock(request:TemplateBlockDemote, action: number)
  {
    if(action == 2)
      return this
      .http
      .post(this.appConfig.ApiProjectDesignUrl() + '/api/block/demotedeliverableblock',request);
      else
      return this
      .http
      .post(this.appConfig.ApiProjectDesignUrl() + '/api/block/promotedeliverableblock', request);
  }
  public getUserDetails(requestModel)
  {
    return this
    .http
    .post<UserSearchResult[]>(this.appConfig.ApiProjectDesignUrl() + '/api/assign/getusers', requestModel);
  }
  public assignBlockUser(requestModel)
  {
    return this
    .http
    .post<UserSearchResult[]>(this.appConfig.ApiProjectDesignUrl() + '/api/assign/assigntousers', requestModel);
  }
  // public getLibraryBlockCopy(viewModel: DragDropRequestViewModel)
  // {
  //   const body = JSON.stringify(viewModel);
  //   const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //   return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/entities/InsertOne', viewModel);
  // }

}