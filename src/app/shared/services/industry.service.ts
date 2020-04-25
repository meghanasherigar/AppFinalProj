import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from './appconfig.service';
import { Industry } from '../../@models/masterData/masterDataModels';

@Injectable({
  providedIn: 'root',
})
export class IndustryService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getAllIndustries() {
    return this.http.get<Industry[]>(this.appConfig.ApiProjectSetupUrl() + '/industry');
  }
}
