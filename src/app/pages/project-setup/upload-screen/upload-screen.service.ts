import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { KsResponse, KfsResponse } from '../../../@models/ResponseStatus';

@Injectable({
  providedIn: 'root'
})
export class UploadScreenService {

  apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }
  getUploadHistory(uploadHistoryFilterViewModel) {
    return this
      .http
      .post(this.appConfig.ApiProjectSetupUrl() + "/api/dataupload/getuploadhistory", uploadHistoryFilterViewModel);
  }
  getUploadFilters(projectId)
  {
    return this
    .http
    .get(this.appConfig.ApiProjectSetupUrl() + "/api/dataupload/getuploadhistoryall/" + projectId);
  }
  getFile(fileName) {
    return this
      .http
      .get(this.appConfig.ApiProjectSetupUrl() + "/api/dataupload/downloadimportfile/" + fileName, { responseType: 'arraybuffer' });
      //.get(this.appConfig.ApiBaseUrl() + "/api/dataupload/downloadtemplatefile/DigiDox3.0", { responseType: 'arraybuffer' });
  }
  download_FileUpload(projectId) {
    
    return this
      .http
      .get<KfsResponse>(this.appConfig.ApiProjectSetupUrl() + "/api/dataUpload/downloadtemplatefile/" + projectId);
  }
  upload(formData) {
    // var model = { file: formData };

    return this.http
      .post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + "/api/dataupload/uploadfile", formData);
  }
  private getEventMessage(event: HttpEvent<any>, formData) {

    switch (event.type) {

      case HttpEventType.UploadProgress:
        return this.fileUploadProgress(event);

      case HttpEventType.Response:
        return this.apiResponse(event);

      default:
        return `File  surprising upload event: ${event.type}.`;
    }
  }
  private fileUploadProgress(event) {
    const percentDone = Math.round(100 * event.loaded / event.total);
    return { status: 'progress', message: percentDone };
  }
  private apiResponse(event) {
    return event.body;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened. Please try again later.');
  }


}
