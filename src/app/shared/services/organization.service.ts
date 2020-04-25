import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Organization } from '../../@models/masterData/masterDataModels';
import { AppliConfigService } from './appconfig.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

  public getAllOrganizations() {
    return this.http.get<Organization[]>(this.appConfig.ApiProjectSetupUrl() + '/organizations');
  }
}
