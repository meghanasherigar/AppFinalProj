import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import {  Question } from '../../../@models/admin/content-whatsnew';
import 'rxjs/add/observable/of';
@Injectable({
  providedIn: 'root'
})


export class ContentWhatsnewService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) {
  }
  
  getWhatsNewList() {
    return this.http.get<Question[]>(this.appConfig.ApiProjectManagementUrl() + '/api/whatsnew/getall');
  }

   getWhatsNewListUser() {
    return this.http.get<Question[]>(this.appConfig.ApiProjectManagementUrl() + '/api/whatsnew/getalluser');
  }
}
