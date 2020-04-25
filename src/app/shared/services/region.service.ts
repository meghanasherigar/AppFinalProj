import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Region } from '../../@models/user';
import { AppliConfigService } from './appconfig.service';

@Injectable({
  providedIn: 'root',
})
export class RegionService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getAllRegions(params: any) {
    return this.http.get<Region[]>(this.appConfig.ApiProjectSetupUrl() + '/region');
  }
}