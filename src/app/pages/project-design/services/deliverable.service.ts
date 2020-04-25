import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { DeliverableDropDownResponseViewModel, DeliverablesInput, DeliverableResponseViewModel, DeliverableChildNodes, EntityViewModel, DeliverableViewModel, DeliverableMileStone, DeliverableCreateGroupRequestModel,DeliverableGroupLinkToResponseViewModel } from '../../../@models/projectDesigner/deliverable';
import { BlockDetailsResponseViewModel } from '../../../@models/projectDesigner/block';
import { TemplateStackUngroupModel, LinkToDeliverableRequestModel } from '../../../@models/projectDesigner/template';
import { Observable, throwError } from 'rxjs';
import { KsResponse, GenericResponse } from '../../../@models/ResponseStatus';
import { SearchRequestViewModel, SuggestForLibraryViewModel, BlockUserRightReqViewModel, BlockUserRightViewModel } from '../../../@models/projectDesigner/common';
import { catchError } from 'rxjs/operators';
import { ShareDetailService } from '../../../shared/services/share-detail.service';


@Injectable({
  providedIn: 'root'
})

export class DeliverableService {
  manageDeliverableReload = new EventEmitter();
  constructor(private http: HttpClient, private appConfig: AppliConfigService, private sharedService: ShareDetailService) { }

  public DeliverableStackUngroup(stackToUngroup: TemplateStackUngroupModel) {
    let body = JSON.stringify(stackToUngroup);
    let headers =
      new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() +
      '/api/stack/ungroupdeliverablestack', body, { headers });
  }

  public getentities(projectId) {
    return this.http.get<DeliverableDropDownResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getentities/' + projectId);
  }

  public getDeliverable(input: DeliverablesInput) {
    return this.http.post<DeliverableResponseViewModel>(this.appConfig.ApiProjectDesignUrl()
      + '/api/deliverable/getdeliverable', input)
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(error);
        }));

  }

  public getBlocksByBlockId(inputJson: DeliverableChildNodes) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/blocksbyid', inputJson);
  }
  public linkToDeliverables(model: LinkToDeliverableRequestModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/linkblockstodeliverablesfromtemplate', model);
  }
  public checkExistingDeliverableGroup(request:DeliverableCreateGroupRequestModel)
  {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/validategroupfortemplate', request);
  }
  public searchDeliverables(deliverableSearchViewModel: SearchRequestViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/searchdeliverable', deliverableSearchViewModel);
  }

  public getAllDeliverables(request: any) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getalldeliverableslist', request);
  }
  public async documentViewContent(entityId: string) {
    let request = new EntityViewModel();
    request.entityId = entityId;
    let response = await this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/defaultdeliverablefullview', request).toPromise();
    return response;
  }
  public updateSuggest(suggestedLibraryBlock: SuggestForLibraryViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/library/savesuggedtedblock', suggestedLibraryBlock);
  }
  public reloadDeliverableDocumentView() {
    this.manageDeliverableReload.emit();
  }
  public getBlockStaffingGridDetails(req: BlockUserRightReqViewModel) {
    return this.http.post<BlockUserRightViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/blockuserright/getblockusersright', req);
  }
  public updateblockuserright(blockUserRights: BlockUserRightViewModel[]) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/blockuserright/updateblockuserright', blockUserRights);
  }
  public getProjectMilestones() {
    let projectId = this.sharedService.getORganizationDetail().projectId;
    return this.http.get(this.appConfig.ApiProjectManagementUrl() + '/api/deliverable/projectmilestones/' + projectId);
  }
  public getBlocksByDeliverableId(deliverableId, pageIndex = 1, pageSize = 0) {
    var deliverableModel = new DeliverableViewModel();
    deliverableModel.entityId = deliverableId;
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getdeliverabledetails', deliverableModel);
  }

  public updateDeliverable(deliverableMileStone: DeliverableMileStone) {
    return this.http.post<void>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/updatedeliverable', deliverableMileStone);
  }



  public getentitiesByTemplateId(projectId) {
    let body = JSON.stringify(projectId);
    let headers =
      new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<DeliverableDropDownResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getentitiesbytemplateid', body, { headers });
  }
  public getAllPaginatedDeliverables(request: any) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getallpaginateddeliverableslist', request);
  }
  public getAllDeliverablesListForGroup(request: any) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getalldeliverableslistforgroup', request);
  }
  public checkDuplicateGroupName(projectId:string,name:string) {
    let relativeUrl=`/api/deliverable/isexistgroupname/${projectId}/${name}`; 
      return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() +relativeUrl);
    }
  public getDeliverableGroups(request: any) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getallgroups', request);
  }
   
  public getGroupDetails(groupId:string, projectId:string)
  {
    let relativeUrl=`/api/deliverable/getgroupbyid/${groupId}/${projectId}`; 
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + relativeUrl);
  }
  public createUpdateDeliverableGroup(request:any, update=false)
  {
    if(update)
    {
      return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/updategroup',request);  
    }
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/creategroup',request);
  }
  public deleteDeliverableGroup(groupIds)
  {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/deletegroups',groupIds);
  }
  public getGroupedEntitiesByTemplateId(templateId) {
    return this.http.get<DeliverableGroupLinkToResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getgroupentitiesbytemplateid/' + templateId);
  }
  

  public pushBackBlocks(deliverableId) {
    let body = JSON.stringify(deliverableId);
    let headers =
      new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<DeliverableDropDownResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/blockpropagation/pushback', body, { headers });
  }
  public disassociateDeliverableFromTemplate(deliverableId) {
    let body = JSON.stringify(deliverableId);
    let headers =
      new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<DeliverableDropDownResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/blockpropagation/disassociate', body, { headers });
  }
  
  public getDeliverableGroupFilter(projectId:string)
  {
    let relativeUrl= `/api/deliverable/deliverablegroupfilter/${projectId}`;
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + relativeUrl);
  }

}
