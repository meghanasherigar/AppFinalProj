import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { Entity, EntityFilterViewModel, EntityFilterDataModel,EntityResponseViewModel } from '../../../@models/entity';
import { KsResponse } from '../../../@models/ResponseStatus';
import { Http, Headers, RequestOptions } from '@angular/http';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { EntityOutScopeModel } from '../../../@models/notification';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})

export class EntitiesService {
  entityList: Entity[];


  reloadEntity = new BehaviorSubject<boolean>(false);
  refreshEntityGrid = this.reloadEntity.asObservable();
  
  constructor(private http: HttpClient, private appConfig: AppliConfigService, 
    private shareDetailService: ShareDetailService) { }
  public getEntities(entityfilterViewModel: EntityFilterViewModel) {
    return this
      .http
      .post<EntityResponseViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/entities/getentities', entityfilterViewModel);
  }
  public getFilterEntityData(projectId) {
    return this
      .http
      .get(this.appConfig.ApiProjectSetupUrl() + '/api/entities/getallentities?projectId=' + projectId);
  }

  public createEntity(viewModel: Entity) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/entities/InsertOne', viewModel);
  }
  public editEntity(viewModel: Entity) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/entities/UpdateOne', viewModel);
  }
  public deleteEntity(entityIds: string[]) {
    const project = this.shareDetailService.getORganizationDetail();
    let deleteEntityViewModel = { projectId: project.projectId, entityIds: entityIds };
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/entities/DeleteEntity', deleteEntityViewModel);
  }
  public deleteEntityRequest(entityIds: string[]) {
    const project = this.shareDetailService.getORganizationDetail();
    let deleteEntityViewModel = { projectId: project.projectId, entityIds: entityIds };
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/entities/deleteentityrequest', deleteEntityViewModel);
  }

  public EntityOutOfScope(entityOutScopeModel: EntityOutScopeModel){
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/entities/updateoutscope', entityOutScopeModel);
  }

  refreshEntity(refresh: boolean) {
    this.reloadEntity.next(refresh);
  }

} 