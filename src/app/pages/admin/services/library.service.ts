import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { LibraryDropdownViewModel, manageLibrary, SearchLibraryViewModel, FilterManageLibraryModel, blockSuggestionRequest, libraryRequestModel, getCoverPage, blocksById } from '../../../@models/projectDesigner/library';
import { BlockDetailsResponseViewModel, BlockFilterDataModel } from '../../../@models/projectDesigner/block';
import { JsonpModule } from '@angular/http';
import { acceptBlockRequest, rejectBlockRequest } from '../@models/block-suggestion';
import { OECDOrganizationViewModel } from '../../../@models/admin/library';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }
  

  public getlibrarytypes()
  {
    return this.http.get<LibraryDropdownViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getlibrarytypes');
  }

  public getLibraryId(selecteType) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    const URL = '/api/library/'+ selecteType;
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + URL, { headers, responseType: "text" });
  }

  public getCoverPage(request: libraryRequestModel) {
    return this.http.post<getCoverPage>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getcoverpage', request);
  }
  
  public addCoverPage(request: libraryRequestModel) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/library/addcoverpage', request);
  }

  public updateCoverPage(request: libraryRequestModel) {
    return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + '/api/library/updatecoverpage', request);
  }

  public getGlobalTemplates(managelibrary: manageLibrary)
  { 
    const URL = managelibrary.isGlobal ? '/api/library/getglobaltemplates' : '/api/library/getcountrytemplates';
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, managelibrary);
  }

  public getLibraries(managelibrary: manageLibrary)
  { 
    const URL = '/api/library/getlibraries';
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, managelibrary);
  }

  public getDummmyProjectDetails()
  {
    return this.http.get<OECDOrganizationViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/getoecdOrganization').toPromise();
  }

  public getManageLIbraryFilter(request: manageLibrary) {
    return this
    .http
    .post<BlockFilterDataModel>(this.appConfig.ApiProjectDesignUrl() + '/api/library/managelibraryfilter', request);
}

  public getAdminLibraryTypes(IsGlobal)
  { 
    const URL = '/api/library/adminlibrarytypes/' + IsGlobal;
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + URL);
  }

  public getCategories(){
    const URL = '/api/library/blockcategories';
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + URL);
  }

  public getCountryTemplates()
  {
    return this.http.get<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getcountrytemplates');
  }

  public getOrgTemplates()
  {
    const object = {
      "isGlobal": true,
      "organizationId": null,
      "countryId": null,
      "userId": null,
      "isAdmin": true
    };
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/library/getorgtemplates', object);
  }

  public getPersonalTemplates()
  {
    return this.http.get<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getpersonaltemplates');
  }

  public getCBC(userId)
  {
    return this.http.get<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getcbc/' + userId);
  }

  public getBlocks(stackId)
  {
    return this.http.get<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() +  '/api/library/getblocks/?stackId=' +  stackId);
  }

  public libraryBlocksById(request: blocksById) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/library/blocksbyid', request);
  }
  public SearchManageLibraries(serachmanagelibrary: SearchLibraryViewModel)
  { 
    const URL = '/api/searchlibrary/managelibrarysearch';
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, serachmanagelibrary);
  }

  public GetFilteredData(request) {
    const URL = '/api/filter/managelibraryblocks';
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, request);
  }

  public getSuggestedBlocks(request: manageLibrary) {
    const URL = '/api/library/getsuggestionblocksfromuser';
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, request);
  }

  public acceptedBlocks(request: acceptBlockRequest) {
    const URL = "/api/block/addsuggestedblockstomanagelibrary";
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, request);
  }

  public rejectedtedBlocks(request: rejectBlockRequest) {
    const URL = "/api/library/rejectsuggestedblocks";
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + URL, request.blockids);
  }
}
