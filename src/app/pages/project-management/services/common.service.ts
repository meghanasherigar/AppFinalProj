import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { UserRightsViewModel } from '../../../@models/userAdmin';
import { ShareDetailService } from '../../../shared/services/share-detail.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient,private sharedService:ShareDetailService,
    private appConfig: AppliConfigService) { }

  getUserRights() {
    let  projectId= this.sharedService.getORganizationDetail().projectId;
    return this.http.get<UserRightsViewModel>(this.appConfig.ApiProjectSetupUrl()
            + '/api/projectuserright/getuserrights/' + projectId);
  }

}
