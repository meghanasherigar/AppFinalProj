import { Injectable } from '@angular/core';
import { SendEmailViewModel, InfoReqSendEmailViewModel, ForwardEmailViewModel, QuestionsUserViewModel, SendBackForwardQuestionsViewModel } from '../../@models/userAdmin';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from './appconfig.service';
import { KsResponse } from '../../@models/ResponseStatus';
import { InformationRequestViewModel } from '../../@models/projectDesigner/task';
import { InfoRequestSendEmailReminderModel } from '../../@models/projectDesigner/infoGathering';

@Injectable({
  providedIn: 'root'
})
export class SendEmailService {

  constructor(
    private http: HttpClient,
    private appConfig: AppliConfigService
  ) { }

  sendEmail(email : SendEmailViewModel) {   
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/common/addemailqueue', email);
  }
  reSendEmail(emailids : []) {   
    return this.http.post<KsResponse>(this.appConfig.ApiUserManagementUrl() + '/api/users/resendexternalusersinvites', emailids);
  }
  inforReq_SendEmail(email : InfoReqSendEmailViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/sendemail', email);
  }
  forwardMail(email : ForwardEmailViewModel) {   
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/forwardquestions', email);
  }
  sendBackForReview(informationRequestViewModel : InformationRequestViewModel) {  
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/sendbackforreview',informationRequestViewModel);
  }
  pullBack(informationRequestViewModel : InformationRequestViewModel[]) {   
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/pullback',informationRequestViewModel);
  }
  sendReminderEmail(email : InfoRequestSendEmailReminderModel[]) {   
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/sendreminderemail', email);
  }
  getusersforforwardquestions(email:ForwardEmailViewModel){
    return this.http.post<QuestionsUserViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/getusersforforwardquestions', email);
  }
  sendbackforreviewforforwardquestion(mdl:SendBackForwardQuestionsViewModel){
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/sendbackforreviewforforwardquestion', mdl);
  }
  
}
