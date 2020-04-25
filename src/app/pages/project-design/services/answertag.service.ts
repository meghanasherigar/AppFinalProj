import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { ProjectVariableFilterViewModel, ProjectVariableResponseViewModel, ProjectVariableInsertViewModel, ProjectVariableUpdateViewModel, ProjectVariableDeleteViewModel, EntityVariableFilterViewModel, EntityVariableResponseViewModel, ProjectVariableFilterMenuViewModel, EntityVariableFilterMenuViewModel, EntityFilterViewModel, AnswerTagsResponseViewModel, BlockType, ProjectVariableDownloadViewModel, EntityVariableDownloadViewModel, ProjectVariableResultViewModel, EntityVariableResultViewModel } from '../../../@models/projectDesigner/answertag';
import { KsResponse, KfsResponse } from '../../../@models/ResponseStatus';

@Injectable({
  providedIn: 'root'
})

export class AnswertagService {
  selectedProjectVariableRows: ProjectVariableResultViewModel[];
  selectedEntityVariableRows: EntityVariableResultViewModel[];


  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  //Load Entity Variable Details.
  public getentityvariables(entityVariableFilterViewModel: EntityVariableFilterViewModel) {
    return this.http.post<EntityVariableResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/getentityvariables', entityVariableFilterViewModel);
  }

  //Load Project Variable Details.
  public getprojectvariables(projectVariableFilterViewModel: ProjectVariableFilterViewModel) {
    return this.http.post<ProjectVariableResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/getprojectvariables', projectVariableFilterViewModel);
  }

  public insertprojectvariable(projectVariablerequestViewModel: ProjectVariableInsertViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/insertprojectvariable', projectVariablerequestViewModel);
  }

  public updateprojectvariable(projectVariableUpdateViewModel: ProjectVariableUpdateViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/updateprojectvariable', projectVariableUpdateViewModel);
  }

  public deleteprojectvariable(projectVariableDeleteViewModel: ProjectVariableDeleteViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/deleteprojectvariable', projectVariableDeleteViewModel);
  }

  public getprojectvariablefiltermenudata(projectId) {
    return this.http.get<ProjectVariableFilterMenuViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/getprojectvariablefiltermenudata/' + projectId);
  }

  public getentityvariablefiltermenudata(projectId) {
    return this.http.get<EntityVariableFilterMenuViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/getentityvariablefiltermenudata/' + projectId);
  }

  public getanswertagsbyblocktype(entityFilterViewModel: EntityFilterViewModel) {
    return this.http.post<AnswerTagsResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/getanswertagsbyblocktype', entityFilterViewModel);
  }

  public getBlockTypes() {
    return this.http.get<BlockType[]>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblocktype');
  }

  public downloadprojectvariables(projectVariableDownloadViewModel: ProjectVariableDownloadViewModel) {
    return this.http.post<KfsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/downloadprojectvariables', projectVariableDownloadViewModel);
  }

  public downloadentityvariables(entityVariableDownloadViewModel: EntityVariableDownloadViewModel) {
    return this.http.post<KfsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/answertag/downloadentityvariables', entityVariableDownloadViewModel);
  }
}
