import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { KsResponse, KfsResponse } from '../../../@models/ResponseStatus';
import { DeliverableDropDownResponseViewModel } from '../../../@models/projectDesigner/deliverable';
import { DeliverableDataResponseViewModel, GetAppendixViewModel, AppendixDownloadRequestViewModel, AppendixDeleteViewModel, AssociateAppendixModel, UpdateAppendixModel, DisassociateAppendixModel } from '../../../@models/projectDesigner/appendix';

@Injectable({
  providedIn: 'root'
})
export class AppendixService {

public SelectedAppendixId: string;
public SelectedAppendicesIds: string[] =[];
public SelectedBlockId: string;
public selectedDeliverableData: any = [];
public SelectedAppendixCount : number;

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getAllAppendicesList(getAppendixViewModel: GetAppendixViewModel) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/appendices/getall', getAppendixViewModel);
  }

  public upload(formData) {
    return this.http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + "/api/appendices/upload", formData);
  }

  public getdeliverables(projectId: string) {
    return this.http.get<DeliverableDataResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/appendices/getdeliverables/' + projectId);
  }

  public downloadReport(appendixDownloadRequestViewModel: AppendixDownloadRequestViewModel[]) {
    return this.http.post<KfsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/appendices/download', appendixDownloadRequestViewModel);
  }

  public deleteAppendices(appendixDeleteViewModel: AppendixDeleteViewModel) {    
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/appendices/delete', appendixDeleteViewModel);
  }

  public AssociateDeliverables(associateDeliverablesModel: AssociateAppendixModel) {    
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/appendices/associatedeliverables', associateDeliverablesModel);
  }

  public UpdateAppendix(UpdateAppendix: UpdateAppendixModel) {    
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/appendices/update', UpdateAppendix);
  }

  public DisassociateDeliverables(disassociateDeliverablesModel: DisassociateAppendixModel) {    
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/appendices/disassociatedeliverables', disassociateDeliverablesModel);
  }
}
