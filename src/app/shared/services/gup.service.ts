import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from './appconfig.service';
import { GUP } from '../../@models/organization';

@Injectable({
  providedIn: 'root'
})
export class GupService {

    constructor(private http: HttpClient, private appConfig: AppliConfigService) { }
    url = 'https://dforge-ccapi-intus.azurewebsites.net/clients/odata/GlobalClients?$select=global_Ultimate_Parent_Name__GUP_%20%2C%20global_Ultimate_Parent_Code__DGMF_ID_';
    getAllGUPList() {
      return this.http.get<GUP[]>(this.url);    
    }
   
}
