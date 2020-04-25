import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { Observable } from 'rxjs';
import { ProjectSettings } from '../../../@models/project-settings/project-settings';

@Injectable({
  providedIn: 'root'
})
export class ProjectSettingService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService,private sharedService : ShareDetailService) { }

  getProjectManagementSettings(){
    let projectId=this.sharedService.getORganizationDetail().projectId;
    return this.http.get(this.appConfig.ApiProjectSetupUrl() + '/api/projectsetting/projectsetting/'+projectId);
  
  }
  updateProjectManagementSettings(settingsRequest:ProjectSettings){
     const body = JSON.stringify(settingsRequest);
     const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.appConfig.ApiProjectSetupUrl()+ '/api/projectsetting/updateprojectsetting', body,{headers});
  }
}


