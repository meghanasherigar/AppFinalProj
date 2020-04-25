import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { Category, Question, Answer, FAQ_Category, FAQLastModified } from '../../../@models/admin/contentFAQ';
import { KsResponse } from '../../../@models/ResponseStatus';
@Injectable({
  providedIn: 'root'
})
export class ContentFaqService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) {
  }
  getCategories() {
    return this.http.get<Category[]>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/getall');
  }
  getQuestions(categoryId) {
    return this.http.get<Question[]>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/getquestions/' + categoryId);
  }
  getAnswers(questionId) {
    return this.http.get<Answer>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/getanswer/' + questionId);
  }
  getLastModifiedData() {
    return this.http.get<FAQLastModified>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/getupdatedaudit')
  }
  getLastPublishedData() {
    return this.http.get<FAQLastModified>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/getlastpublishedby')
  }
  InsertUpdateFAQ(viewModel: FAQ_Category[]) {
    const body = JSON.stringify(viewModel);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.appConfig.ApiProjectManagementUrl() + "/api/faq/addupdate/", viewModel);
  }
  deleteQuestions(questionIds: string[]) {
    const body = JSON.stringify(questionIds);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/delete', questionIds);
  }
  deleteCategories(categoryIds: string[]) {
    const body = JSON.stringify(categoryIds);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/delete', categoryIds);
  }
  publishCategories(categoryIds: string[]) {
    const body = JSON.stringify(categoryIds);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/faq/publishall', categoryIds);
  }
}
