import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TodoItemFlatNode, TodoItemNode } from '../sections/content/region/library/content/content.component';
import { DragDropRequestViewModel } from '../../../@models/projectDesigner/block';
import { KsResponse } from '../../../@models/ResponseStatus';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { TemplateStackUngroupModel } from '../../../@models/projectDesigner/template';
@Injectable({
  providedIn: 'root'
})
export class IconViewService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) {
  }
  public dragNode: null;
  public dragNodes = [];
  public source : number;
  public deliverableId : string;
  public templateId : string;
  public flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  public selectedNodes: string[];


  public saveDragDrop(viewModel: DragDropRequestViewModel) {
    const body = JSON.stringify(viewModel);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/library/rearrangeblockstack', viewModel);
  }
  public promoteDemoteBlock(request:TemplateStackUngroupModel, action: number)
  {
      return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/demoteblockcontent', request);
  }

  // public getLibraryBlockCopy(viewModel: DragDropRequestViewModel)
  // {
  //   const body = JSON.stringify(viewModel);
  //   const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //   return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/entities/InsertOne', viewModel);
  // }

}