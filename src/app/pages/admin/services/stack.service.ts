import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { TemplateStackUngroupModel } from '../../../@models/projectDesigner/template';
import { BlockDetailsResponseViewModel } from '../../../@models/projectDesigner/block';
import { StackRequestViewModel, StackAttributeDetail, StackAttributeViewModel, LibraryStackUngroupModel } from '../../../@models/projectDesigner/stack'
import { KsResponse } from '../../../@models/ResponseStatus';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root'
  })
  
  
  export class StackService {
    isExtendedIconicView: boolean = false;
    constructor(private http: HttpClient, private appConfig: AppliConfigService){}
    
  
   
  public StackUngroup(stackToUngroup: LibraryStackUngroupModel): Observable<BlockDetailsResponseViewModel[]> {
    let body = JSON.stringify(stackToUngroup);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/ungrouplibrarystack', body, { headers });
  }

  public createStack(request: StackRequestViewModel) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/createstack', request);
  }

  public getstackdetails(stackId: string) {
    return this
      .http
      .get<StackAttributeDetail>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/getstackdetails/' + stackId);
  }


  public updateStackDetails(request : StackAttributeDetail){
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/updatestackattribute', request);
  }

  public getstackattributedetail() {
    return this
      .http
      .get<StackAttributeViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/stack/getstackattributedetail');
  }

}
