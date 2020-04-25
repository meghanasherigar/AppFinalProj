import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../../../shared/services/appconfig.service';
import { Observable } from 'rxjs';
import { QuestionTypeViewModel, QuestionsResponseViewModel, InformationRequestViewModel, ProjectUsersListViewModel, ProjectUsersListResultViewModel, ViewBlockResponseViewModel, InformationRequestPreviewViewModel, QuestionAnswersDetailsViewModel, AnswerAvailableViewModel, CommentsViewModel, AnswerDetailsDomainModel, AnswerDetailsRequestModel, UserInformationRequestViewModel, InformationRequestStatusViewModel, EntityRoleViewModel, AppendixDomainViewModel, QuestionFilterByTemplateOrDeliverableId, insertCoverPage, updateInsertCoverPageRequest} from '../../../../../@models/projectDesigner/task';
import { KsResponse, KfsResponse } from '../../../../../@models/ResponseStatus';
import { QuestionsBlockTypeDetails } from '../../../../../@models/projectDesigner/block';
import { RequestOptions } from '@angular/http';
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  selectedQuestionRows: QuestionsResponseViewModel[] = [];
  selectedFilters: any;
  constructor(private http: HttpClient, private appConfig: AppliConfigService) {
  }
  public getTasks() {
    return this.http.get<QuestionTypeViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getquestiontype');
  }
  public createQuestion(questionDataModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/question/createquestion', questionDataModel).toPromise();
  }
  public getQuestionsFilters(projectId) {
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/question/getquestionsmenu/' + projectId);

  }
  public getAllQuestionsTypes() {
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/question/getquestiontype');

  }
  public GetBlockTypesByQuestionIdsForTemplateDeliverable(InformationRequestPreviewViewModel) {
    return this.http.post<QuestionsBlockTypeDetails[]>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getblocktypesbyquestionidsfortemplatedeliverable', InformationRequestPreviewViewModel)
  }

  public getIsExternalUser() {
    return this.http.get<boolean>(this.appConfig.ApiUserManagementUrl() + '/api/users/getisexternaluser')
  }

  public GetAllQuestionAnswersDetails(InformationRequestPreviewViewModel) {
    return this.http.post<QuestionAnswersDetailsViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getallquestionanswersdetails', InformationRequestPreviewViewModel)
  }
  public getAllQuestions(questionFilteredRequest) {
    return this.http.post<QuestionsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getallquestions', questionFilteredRequest);
  }
  public getAllQuestionsByTemplateOrDeliverableId(questionsFilterByTemplateorDeliverable: QuestionFilterByTemplateOrDeliverableId) {
    return this.http.post<QuestionsResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getallquestionanswersdetailsbytemplateordelieverable', questionsFilterByTemplateorDeliverable);
  }
  public getAllHashtags(questionTagViewMode) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/question/getalltagbyprojectid', questionTagViewMode);
  }
  public getAllSymbols() {
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/blockfootnote/getallfootnotesymbols');
  }
  
  getFormUrlEncoded(toConvert) {
    const formBody = [];
    for (const property in toConvert) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(toConvert[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    return formBody.join('&');
  }
  public createinformationrequest(info: InformationRequestViewModel) {

    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/createinformationrequest', info);
  }
  public addAttachmentInfoRequest(file) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/question/addattachment', file);
  }
  public downloadAttachmentInfoRequest(file) {
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/question/downloadattachment/' + file, { responseType: 'arraybuffer' });
  }
  public deleteAttachmentInfoRequest(deleteAttachmentModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/question/removeattachment', deleteAttachmentModel);

  }
  public UpdateDetailsByAssignee(answers: InformationRequestStatusViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/updatedetailsbyassignee', answers)
  }
  public getuserslstonTemplateIdorDelieverables(projectUserFilter: ProjectUsersListViewModel) {
    return this.http.post<ProjectUsersListResultViewModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/gettemplateordelieverableusers', projectUserFilter);
  }
  public updatecoverpage(info: InformationRequestViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/updatecoverpage', info);
  }
  public getCoverpage(id) {
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/getCoverpage/' + id);
  }
  
  public getInsertCoverpage(projectId, templateOrDeliverableId) {
    let request = projectId + '/' + templateOrDeliverableId;
    return this.http.get(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/' + request);
  }

  public addInsertCoverPage(request: insertCoverPage) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/add', request);
  }

  public updateInsertCoverPage(request: updateInsertCoverPageRequest) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/documentconfiguration/update', request);
  } 

  public getallblocksbyquestionids(questionsIds) {
    return this.http.post<ViewBlockResponseViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getallblocksbyquestionids', questionsIds);
  }
  public questionTagIsExistByProjectId(questionTag) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/question/isexistquestiontagbyprojectid', questionTag);
  }

  public getAnswerForQuestion(questionnariesId, questionId) {
    return this.http.get<AnswerAvailableViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getanswerforquestion/' + questionnariesId + '/' + questionId);
  }
  public getQuestionAnsweByQuestionId(questionnariesId, questionId, templateordeliverableid) {
    return this.http.get<QuestionAnswersDetailsViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getquestionanswebyquestionId/' + questionnariesId + '/' + questionId + '/' + templateordeliverableid);
  }
  public getAnswerHistoryForQuestion(questionnariesId, questionId, tempDelId, isTemplate) {
    return this.http.get<AnswerAvailableViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/question/getanswerhistoryforquestion/' + questionnariesId + '/' + questionId + '/' + tempDelId + '/' + isTemplate);
  }
  public approveReject(approveRejectModel) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/approveorrejectanswer', approveRejectModel);
  }

  public update(questionDataModel) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/question/update', questionDataModel).toPromise();
  }
  public delete(questionnariesId, questionId) {
    return this.http.get<AnswerAvailableViewModel>(this.appConfig.ApiProjectDesignUrl() + '/api/question/delete/' + questionnariesId + '/' + questionId);
  }

  public getuserinformationrequestbyprojectId(projectid) {
    return this.http.get<UserInformationRequestViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/getuserinformationrequestbyprojectId/' + projectid);
  }
  public updateanswer(answer: AnswerDetailsRequestModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/updateanswerdetails', answer)
  }
  public updateSectionPage(selectedQuestion) {
    return this.http.post(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/updatesectionpage', selectedQuestion);
  }

  public sendbacktoassignee(inforRequest: InformationRequestViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/sendbacktoassignee', inforRequest);
  }

  public finalize(inforRequest: InformationRequestViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/finalize', inforRequest);
  }

  public validateinformationrequestquestions(info: InformationRequestViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/informationrequest/validateinformationrequestquestions', info);
  }

  public getentitiesbytemplate(templateId: string[]) {
    return this.http.post<EntityRoleViewModel[]>(this.appConfig.ApiProjectDesignUrl() + '/api/deliverable/getentitiesbytemplate', templateId);
  }

  public addattachmenttoappendix(appendixDomain: AppendixDomainViewModel) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectDesignUrl() + '/api/appendices/addattachmenttoappendix', appendixDomain);
  }

  upload(file: FormData) {
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + "/api/projectuserright/uploadprojectuserfile", file);
  }

  downloadTableType(payload) {
    return this.http.post<KfsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/projectuserright/downloadprojectuserrights', payload);
  }
}
