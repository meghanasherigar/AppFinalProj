import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from './appconfig.service';
import { GlobalUltimateParent } from '../../@models/masterData/masterDataModels';

@Injectable({
  providedIn: 'root',
})
export class GlobalUltimateParentService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getAllGups() {
    return this.http.get<GlobalUltimateParent[]>(this.appConfig.ApiProjectSetupUrl() + '/gup');
  }
}
