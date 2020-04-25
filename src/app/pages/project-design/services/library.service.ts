import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { LibraryDropdownViewModel, SearchLibraryViewModel } from '../../../@models/projectDesigner/library';
import { BlockDetailsResponseViewModel } from '../../../@models/projectDesigner/block';
import { LibraryDetailsRequestModel } from '../../../@models/projectDesigner/template';
import { OECDOrganizationViewModel } from '../../../@models/admin/library';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getlibrarytypes() {
    return this.http.get<LibraryDropdownViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getlibrarytypes');
  }

  public getCategories() {
    const URL = '/api/library/blockcategories';
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + URL);
  }

  public getGlobalTemplates(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getglobaltemplates', librarySearchViewModel);
  }

  public getCountryTemplates(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getcountrytemplates', librarySearchViewModel);
  }

  public getOrgTemplates(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getorgtemplates', librarySearchViewModel);
  }

  public getPersonalTemplates(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getpersonaltemplates', librarySearchViewModel);
  }

  public getBlockCollection(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/clientblockcollection', librarySearchViewModel);
  }

  public async documentViewContent(request: LibraryDetailsRequestModel) {
    let response = await this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/library/cbcdocumentview', request).toPromise();;
    return response;
  }

  public getBlocks(stackId) {
    return this.http.get<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/library/getblocks/?stackId=' + stackId);
  }

  public searchGlobalLibraries(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/searchlibrary/globallibraries/', librarySearchViewModel);
  }

  public searchOrganizationLibraries(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/searchlibrary/organizationlibraries/', librarySearchViewModel);
  }

  public searchCountryLibraries(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/searchlibrary/countrylibraries/', librarySearchViewModel);
  }

  public searchUserLibraries(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/searchlibrary/userlibraries/', librarySearchViewModel);
  }
  public async getLibraryContents(request: LibraryDetailsRequestModel) {
    let response = await this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/library/getLibrariescontent', request).toPromise();;
    return response;
  }
  public getAllQuestions(blockIds: string[]) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/question/getallquestionanswersbyblockIds/', blockIds);

  }
  public getDummmyProjectDetails()
  {
    return this.http.get<OECDOrganizationViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/organizations/getoecdOrganization');
  }
  public searchCbcBlockContent(librarySearchViewModel: SearchLibraryViewModel) {
    return this.http.post<BlockDetailsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/searchlibrary/searchcbcblockcontent/', librarySearchViewModel);
  }
}
