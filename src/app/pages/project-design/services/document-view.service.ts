import { Injectable } from '@angular/core';
import { BlockAttributeRequest, FootNoteRequestiewModel } from '../../../@models/projectDesigner/block';
import { KsResponse, GenericResponse } from '../../../@models/ResponseStatus';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { HeaderFooterResponseViewModel, HeaderFooterViewModel, WaterMarkViewModel, AbbreviationViewModel, WaterMarkResponseViewModel, MarginViewModel, DocumentConfigurationModel } from '../../../@models/projectDesigner/common';
import { RequestMethod, RequestOptions } from '@angular/http';
import { headersToString } from 'selenium-webdriver/http';
import { BlockTitleViewModel } from '../../project-management/@models/blocks/block';
import { ReportRequest } from '../../../@models/projectDesigner/report';

@Injectable({
  providedIn: 'root'
})
export class DocumentViewService {

  constructor(
    private http: HttpClient,
    private appConfig: AppliConfigService) { }

  public updateBlockData(request: BlockAttributeRequest) {
    return this
      .http
      .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/updateblockdata', request);
  }
  public updateAnswer(request)
  {
    return this
    .http
    .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/AnswerTag/updateblockcontentanswer', request);
  }
  public getBlockAttribute(blockId: string) {
    return this
      .http
      .get<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getblockdetails/' + blockId);
  }

  public updateAllBlockData(request: BlockAttributeRequest[]) {

    return this
      .http
      .post<GenericResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/updateallblockdata', request);
  }

  public getHeaderFooterText(projectId, templateOrDeliverableId) {
    return this.http.get<HeaderFooterResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }
  public getAllFormatting(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }

  public getAllFormattingAsync(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId).toPromise();
  }

  public getHeaderFooterTextSync(projectId, templateOrDeliverableId) {
    return this.http.get<HeaderFooterResponseViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId).toPromise();
  }

  public saveHeaderText(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', headerFooterViewModel);
  }
  public getPageColor(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }
  public getPageMargin(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }
  public getPageOrientation(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }
  public getWaterMark(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }
  public getPageLayoutSize(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }
  public savePageColor(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', headerFooterViewModel);
  }
  public savePageOrientation(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', headerFooterViewModel);
  }
  public savePageLayoutSize(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', headerFooterViewModel);
  }

  public updatePageColor(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', headerFooterViewModel);
  }

  public updatePageOrientation(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', headerFooterViewModel);
  }
  public updatePageLayoutSize(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', headerFooterViewModel);
  }
  public saveWaterMark(waterMarkViewModel: WaterMarkViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', waterMarkViewModel);
  }
  public updateWaterMark(waterMarkViewModel: WaterMarkViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', waterMarkViewModel);
  }
  public savePageMargin(marginViewModel: MarginViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', marginViewModel);
  }
  public updatePageMargin(marginViewModel: MarginViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', marginViewModel);
  }
  public updateHeaderText(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', headerFooterViewModel);
  }

  public saveFooterText(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', headerFooterViewModel);
  }

  public updateFooterText(headerFooterViewModel: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', headerFooterViewModel);
  }

  public deleteHeaderFooterText(id) {
    return this.http.delete<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + id);
  }
  public deleteWaterMark(id) {
    return this.http.delete<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + id);
  }

  public getallabbreviationslist(projectId, templateOrDeliverableId) {
    return this.http.get<AbbreviationViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/abbreviation/getabbreviations/' + projectId + '/' + templateOrDeliverableId);
  }
  public getExistingAbbreviations(projectId, abbreviation) {
    return this.http.get<AbbreviationViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/abbreviation/getfullformbyabbreviation/' + projectId + '/' + abbreviation);
  }
  public createAbbreviation(abbreviationViewModel: AbbreviationViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/abbreviation/create', abbreviationViewModel);
  }
  public updateAbbreviation(abbreviationViewModel: AbbreviationViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/abbreviation/update', abbreviationViewModel);
  }
  public deleteAbbreviation(abbreviationIds: string[]) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/abbreviation/delete', abbreviationIds);
  }
  public searchabbreviations(projectId, templateOrDeliverableId, searchinput) {
    return this.http.get<AbbreviationViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/abbreviation/searchabbreviations/' + projectId + '/' + templateOrDeliverableId + '/' + searchinput);
  }
  public coveredTransactionForProject(payload) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/getcoveredblocktypetransactiondetails', payload);
  }

  public getTableOfContent(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }

  public saveTableOfContent(docConfigurationView: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', docConfigurationView);
  }

  public updateTableOfContent(docConfigurationView: HeaderFooterViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', docConfigurationView);
  }

  public removeTableOfContent(id) {
    return this.http.delete<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + id);
  }
  public updateAllBlockData_Admin(request: BlockAttributeRequest[]) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/block/updatelibrarycontent', request);
  }
  public addFootNote(request: FootNoteRequestiewModel) {
    const requestOptions: Object = {
      responseType: 'text'
    }
    return this
      .http
      .post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/blockfootnote/addfootnote', request, requestOptions);
  }
  public updateFootNote(request: FootNoteRequestiewModel[]) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/blockfootnote/updatefootnote', request);
  }
  public deleteFootNote(request: FootNoteRequestiewModel[]) {
    return this
      .http
      .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/blockfootnote/deletefootnotes', request);
  }
  public updateBlockDocumentTitle(blockDocumentTitles: BlockTitleViewModel[]) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/block/updateblockdocument', blockDocumentTitles);
  }

  public savePageBorder(documentconfigModel: DocumentConfigurationModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', documentconfigModel);
  }

  public updatePageBorder(documentconfigModel: DocumentConfigurationModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', documentconfigModel);
  }

  public getPageBorder(projectId, templateOrDeliverableId) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + projectId + '/' + templateOrDeliverableId);
  }

  public getLayoutStyles(projectId, isInternalUser) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + '/api/layoutstyle/get/' + projectId + '/' + isInternalUser);
  }

  public updateLayoutStyles(payload) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/layoutstyle/update/', payload);
  }

  public applyLayoutStyles(payload) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/layoutstyle/applylayout/', payload);
  }

  public addLayoutStyles(payload) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/layoutstyle/add/', payload);
  }

  public removeLayoutStyle(payload) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/layoutstyle/delete/', payload);
  }
  public previewDoc(request: ReportRequest)
  {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/report/generatereport', request, { responseType: 'arraybuffer' });
  }

  public removePageBorder(id) {
    return this.http.delete<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + id);
  }

  public async getLayoutStylesSync(projectId, isInternalUser) {
    return this.http.get<any>(this.appConfig.ApiProjectDesignUrl() + 
    '/api/layoutstyle/get/' + projectId + '/' + isInternalUser).toPromise();
  }
  
  public async getLayoutStyleId(request)
  {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/layoutstyle/templatedeliverablelayoutid',request,
    { responseType: 'text' } ).toPromise();
  }

  public saveDocumentConfiguration(payload: any) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', payload);
  }

  public updateDocumentConfiguration(payload: any) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', payload);
  }

  public deleteAbbreviationForAdmin(abbreviationIds: AbbreviationViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/abbreviation/deleteadminabbreviation', abbreviationIds);
  }

}
