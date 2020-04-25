import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
// import { Category, Question, Answer ,FAQ_Category} from '../../../@models/admin/contentFAQ';
import { Category, Question, WhatsNew_Category, WhatsNewLastModified } from '../../../@models/admin/content-whatsnew';
import { KsResponse } from '../../../@models/ResponseStatus';
import { Observable, from, observable } from 'rxjs';
import 'rxjs/add/observable/of';
@Injectable({
  providedIn: 'root'
})


export class ContentWhatsnewService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) {
  }

  getWhatsNewQuestion() {
    return this.http.get<Question[]>(this.appConfig.ApiProjectManagementUrl() + '/api/whatsnew/getall');
  }

  getLastModifiedData() {
    return this.http.get<WhatsNewLastModified>(this.appConfig.ApiProjectManagementUrl()+'/api/whatsnew/getupdatedaudit')
  }
  getLastPublishedData() {
    return this.http.get<WhatsNewLastModified>(this.appConfig.ApiProjectManagementUrl()+'/api/whatsnew/getpublishedby')
  }

  InsertUpdateWhatsNew(viewModel: WhatsNew_Category[]) {
    const body = JSON.stringify(viewModel);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.appConfig.ApiProjectManagementUrl() + "/api/whatsnew/update/", viewModel);
  }
  deleteQuestions(questionIds: string[]) {
    const body = JSON.stringify(questionIds);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/deletequestions', questionIds);
  }
  deleteCategories(categoryIds: string[]) {
    const body = JSON.stringify(categoryIds);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/whatsnew/delete', categoryIds);
  }
  publishCategories(categoryIds: string[]) {
    const body = JSON.stringify(categoryIds);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/whatsnew/publishall', categoryIds);
  }
}
