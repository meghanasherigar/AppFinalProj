import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { TemplateResponseViewModel, TemplateDetailsRequestModel, TemplateViewModel, CreateTemplateRequest, TemplateDeliverableViewModel, ImportTemplateRequest, BlocksTagsResponseModel, BlocksTagsRequestModel, TemplateDetailsAnswerTagRequestModel } from '../../../@models/projectDesigner/template';
import { BlockDetailsResponseViewModel, TemplateBlockDetails } from '../../../@models/projectDesigner/block';
import { KsResponse } from '../../../@models/ResponseStatus';
import { SearchRequestViewModel } from '../../../@models/projectDesigner/common';
import { ReportRequest, ReportHistoryFilterRequestViewModel, DeleteReportHistoryRequestViewModel, ReportDownloadRequestViewModel } from '../../../@models/projectDesigner/report';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import { DeleteBlockViewModel } from '../../../@models/projectDesigner/library';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  //this variable is to set the selected row template in template/deliverableSection
  public selectedTemplate: any = {};
  manageTemplateReload = new EventEmitter();
  pasteEvent = new EventEmitter<any>();
  subscription = Subscription;
  pasteNode: any;
  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getDefaultTemplateDeliverables(projectId) {
    var templateModel = new TemplateViewModel();
    templateModel.projectId = projectId;
    return this.http.post<TemplateResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/template/defaulttemplate', templateModel);
  }

  //TODO: Set default pageSize for pagination
  public getBlocksByTemplateId(templateId, pageIndex = 1, pageSize = 0) {

    var templateModel = new TemplateViewModel();
    templateModel.templateId = templateId;

    //TODO: uncomment for pagination
    // templateModel.pageIndex=pageIndex;
    // templateModel.pageSize=pageSize;
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/template/blocksbytemplate', templateModel);
  }

  public getTemplateBlocksByTemplateId(templateId, pageIndex = 1, pageSize = 0) {

    var templateModel = new TemplateViewModel();
    templateModel.templateId = templateId;
    templateModel.pageIndex = pageIndex;
    templateModel.pageSize = pageSize;
    return this.http.post<TemplateBlockDetails>(this.appConfig.ApiProjectDesignUrl() + '/api/template/templateblocksbytemplate', templateModel);
  }

  public getBlocksByBlockId(templateId, blockRefId, isStack, previousIndentation) {
    return this.http.get<BlockDetailsResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/template/blocksbyid/' + templateId + '/' + blockRefId + '/' + isStack + '/' + previousIndentation);
  }

  public getTemplateDetails(templatDetails: TemplateDetailsRequestModel) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/template/getprojecttemplateDetails', templatDetails);
  }

  public searchTemplates(templateSearchViewModel: SearchRequestViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/template/searchprojecttemplates', templateSearchViewModel);
  }

  public createTemplate(request: CreateTemplateRequest) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/template/createtemplate', request);
  }

  public ImportTemplates(request: ImportTemplateRequest) {
    const requestOptions: Object = {
      responseType: 'text'
    }
    return this.http.post<string>(this.appConfig.ApiProjectDesignUrl() + '/api/template/importtemplate', request, requestOptions);
  }

  public getalltemplatelist(request: any) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/template/getalltemplatelist', request);
  }

  public deleteTemplates(request: any) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/template/deletetemplates', request);
  }

  public notifyLeadsForTemplateDelete(request: any) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/template/notifyleadsfortemplatedelete', request);
  }

  public getTemplateDeliverables(templateDetails: TemplateDetailsRequestModel) {
    return this.http.post<TemplateDeliverableViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/Common/templatedeliverables', templateDetails);
  }

  public updatetemplate(request: any) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/template/updatetemplate', request);
  }

  public generateReport(request: ReportRequest) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/report/generatereport', request, { responseType: 'arraybuffer' });
  }
  public generationHistory(request: ReportHistoryFilterRequestViewModel) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/report/getreporthistory', request);
  }
  public deleteHistory(request: DeleteReportHistoryRequestViewModel) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/report/deletereporthistory', request);
  }
  public downloadReport(request: ReportDownloadRequestViewModel) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/report/downloadreport', request, { responseType: 'arraybuffer' });
  }
  public getReportGenerationHistoryFilter(projectId: string) {
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/report/getreporthistoryfiltermenus/' + projectId);

  }
  public async documentViewContent(projectId: string, templateId: string, pageIndex = 1, pageSize = 0) {
    let request = new TemplateDetailsRequestModel();
    request.projectId = projectId;
    request.templateId = templateId;

    //TODO: uncomment when pagination needs to be enabled
    // request.PageIndex=pageIndex;
    // request.PageSize=pageSize;

    let response =
      await this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/template/defaulttemplatefullview', request).toPromise();
    return response;

  }
 
  public async documentContentAnswerTag(projectId: string, templatedeliverableId: string, isTemplate: boolean) {
    let request = new TemplateDetailsAnswerTagRequestModel();
    request.projectId = projectId;
    request.templateOrDeliverableId = templatedeliverableId;
    request.isTemplate = isTemplate;
 
    let response =
      await this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/AnswerTag/blockcontentwithanswer', request).toPromise();
    return response;

  }
  public async documentViewContentByBlockIds(templateId: string, blockIds: string[]) {
    let request =
    {
      'templateId': templateId,
      'blockIds': blockIds
    };

    let response =
      await this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/template/templatecontentbyblockids', request).toPromise();
    return response;

  }
  public reloadTemplateDocumentView() {
    this.manageTemplateReload.emit();
  }

  public PasteEvent(pasteNode) {
    this.pasteEvent.emit(pasteNode);
  }
  public GetAllReferencedBlocks(reqObject: DeleteBlockViewModel) {
    const URL = '/api/block/blockoccurences';
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, reqObject);
  }

  public getSuggestionBlockFromLibraries(request: any) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/template/getsuggestionblockfromlibraries', request);
  }

  public getallpaginatedtemplatelist(request: any) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/template/getallpaginatedtemplatelist', request);
  }
  public getBlocksWithAnswertag(request: BlocksTagsRequestModel) {
    return this.http.post<BlocksTagsResponseModel>(this.appConfig.ApiProjectDesignUrl() + '/api/template/getblockswithanswertag', request);
  }
}

