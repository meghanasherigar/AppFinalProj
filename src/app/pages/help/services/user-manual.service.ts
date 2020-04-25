import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { LanguageViewModel, UserManualViewModel } from '../../../@models/help/userManual';

@Injectable({
  providedIn: 'root'
})
export class UserManualService {
  constructor(private http: HttpClient, private appConfig: AppliConfigService) {
  }
  getLanguages() {    
    return this.http.get<LanguageViewModel[]>(this.appConfig.ApiProjectManagementUrl() + '/api/usermanual/languages');
  }
  // getManual(LanguageId) {
  //   var languageViewModel = new LanguageViewModel();  
  //   languageViewModel.id = "5cff6ea72bfae13cac0799c5";  
  //   return this.http.post(this.appConfig.ApiProjectManagementUrl() + '/api/usermanual/downloadusermanualstream', languageViewModel, { responseType: 'arraybuffer' });
  // }
}
