import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Entity } from '../../@models/user';
import { AppliConfigService } from './appconfig.service';

@Injectable({
  providedIn: 'root',
})
export class EntityService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getAllEntities(params: any) {
    return this.http.get<Entity[]>(this.appConfig.ApiProjectSetupUrl() + '/entity');
  }
}