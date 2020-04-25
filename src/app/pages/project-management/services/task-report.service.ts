import { Injectable } from '@angular/core';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { HttpClient } from '@angular/common/http';
import { taskReportResponse,taskFilterRequest, otherTaskrequest, taskCompletionModel, userSearchModel } from '../@models/tasks/task';
import { KsResponse } from '../../../@models/ResponseStatus';
import { ShareDetailService } from '../../../shared/services/share-detail.service';

@Injectable({
  providedIn: 'root'
})
export class TaskReportService {

  constructor(private http: HttpClient, private sharedService:ShareDetailService,
    private appConfig: AppliConfigService) 
    { }

  public getTaskAssignmentSummary(taskFitlerRequest:taskFilterRequest) {    
    return this.http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/tasksassignmentsummary',taskFitlerRequest);
  }

  public getTaskSummary(taskFitlerRequest:taskFilterRequest) {    
    return this.http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/taskssummary',taskFitlerRequest);
  }

  public getTaskReport(taskFitlerRequest:taskFilterRequest) {    
    return this.http
      .post<taskReportResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/alltasks',taskFitlerRequest);
  }

  public updateTaskReport(taskReportResponse:taskReportResponse[]) {    
    return this.http
      .post<KsResponse>(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/updatetask', taskReportResponse);
  }

  public createOfflineTask(request: otherTaskrequest) {
    return this.http
    .post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/createofflinetask', request);

  }

  public taskFilterMenu(mytaskOnly) {
    const body = { 
      projectId:  this.sharedService.getORganizationDetail().projectId,
      myTasksOnly : mytaskOnly
    }
    return this.http
    .post(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/taskfiltermenu', body);
  }

  public downloadTask(taskFitlerRequest:taskFilterRequest) {    
    return this.http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/downloadtasks', taskFitlerRequest);
  }

  public markTaskAsComplete(taskCompletionRequest:taskCompletionModel[])
  {
    return this.http
      .post(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/completetask', taskCompletionRequest);
  }

  public downloadOtherTaskFile(fileName) {
 
    let body = { 'fileName':fileName };
    return this.http.post(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/downloadtaskattachment', body, { responseType: 'arraybuffer' });
  }

  public searchProjectUsers(userSearch:userSearchModel)
  {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/assign/getusers',
    userSearch);
  }

  public reAssign(reassignRequest:taskCompletionModel[])
  {
    return this.http.post(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/reassign',
    reassignRequest);
  }

  public getTaskAssignmentCount(taskFitlerRequest:taskFilterRequest) {    
    return this.http
      .post<number>(this.appConfig.ApiProjectManagementUrl() + '/api/taskreport/tasksassignmentcount',taskFitlerRequest);
  }

}
