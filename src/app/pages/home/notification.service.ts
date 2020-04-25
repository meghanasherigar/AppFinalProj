import { Injectable } from '@angular/core';
import { KsResponse } from '../../@models/ResponseStatus';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../shared/services/appconfig.service';
import { NotificationRequestModel } from '../../@models/user';
import { UserNotification } from '../../@models/common/notification';
import { NotificationViewModel, NotificationResponseModel } from '../../@models/notification';
import { NotificationFilterRequestViewModel } from '../../@models/organization';
import { ProjectResponse } from '../../@models/project';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private http: HttpClient,
    private appConfig: AppliConfigService,
    private authService: AuthService,
  ) { }

  public getNotifications(notificationRequestModel: NotificationRequestModel, refresh = false) {
    if (refresh) {
      return this.http.post<NotificationResponseModel>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/refreshnotifications', notificationRequestModel);
    } else {
      return this.http.post<NotificationResponseModel>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/getnotifications', notificationRequestModel);
    }
  }

  public updateIsRead(notificationID: string[]) {
    return this.http.post(this.appConfig.ApiProjectSetupUrl() + '/api/notification/updateisread', notificationID);
  }
  public ApproveRejectNotification(notificationViewModel: NotificationViewModel) {
    return this.http.post(this.appConfig.ApiProjectSetupUrl() + '/api/notification/approverejectnotification', notificationViewModel);
  }

  public updateAllRead() {
    return this.http.get<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/updateallread');
  }

  public deleteNotifications(notificationID: string[]) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/updateisdelete', notificationID);
  }

  public getNotificationFilterData(request: NotificationFilterRequestViewModel) {
    return this.http.post<NotificationResponseModel>(this.appConfig.ApiProjectSetupUrl() + '/api/notification/getnotifications', request);
  }
}
