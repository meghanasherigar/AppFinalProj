import { Injectable } from "@angular/core";
import { ErrorDialogService } from '../services/error-dialog/errordialog.service';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { StorageService, StorageKeys } from '../services/storage/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../shared/services/auth.service';
import { DialogService } from '../../shared/services/dialog.service';
import { DialogTypes } from '../../@models/common/dialog';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Location } from '@angular/common'


import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { CacheMapService } from '../../shared/services/cache/cache-map.service';
import { userContext } from '../../@models/common/valueconstants';
import { SessionStorageService } from '../services/storage/sessionStorage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  token: string;
  identity: string;

  constructor(
    private storageService: StorageService,
    private translateService: TranslateService,
    private errorDialogService: ErrorDialogService,
    private authService: AuthService,
    private dialogService: DialogService,
    private cache: CacheMapService,
    private location: Location
  ) { }

  // function which will be called for all http calls
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!request.url.includes('/api/tokengeneration/silenttokenrefresh') && !request.url.includes('/api/notification/refreshnotifications')) {
      let currentDate = new Date();
      this.storageService.addItem(StorageKeys.IDEALTIME, currentDate.toString());
    }
    const dpassValue = this.storageService.getItem(userContext.userContextId);
    const clientId = this.storageService.getItem(userContext.userContextValue);
    var currentUser = this.storageService.getItem(userContext.userStorageKey);
    if (currentUser != null && currentUser != 'null') {
      this.token = `${JSON.parse(currentUser).token_type} ${JSON.parse(currentUser).access_token}`;
      this.identity = `${JSON.parse(currentUser).id_token}`;
    }

    if (this.token) {
      request = request.clone({
        headers: request.headers.set('Authorization', this.token)
          .set('Identity', this.identity)
      });
    }

    const browserCulture = this.translateService.getBrowserCultureLang();
    const currentLang = this.translateService.currentLang;

    if (browserCulture) {
      request = request.clone({ headers: request.headers.set('BrowserLanguage', browserCulture) });
    }

    if (currentLang) {
      request = request.clone({ headers: request.headers.set('UserLanguage', currentLang) });
    }

    if (!request.headers.has('Content-Type')) {
      //request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
    }

    request = request.clone({ headers: request.headers.set('DD-Timezone-Offset', this.getTimezoneOffset()) });

    request = request.clone({ headers: request.headers.set('ContextId', dpassValue + ":" + clientId) });

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // console.log('event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('Unauthorized error--->>>', error);
            this.dialogService.Open(DialogTypes.Error, this.translateService.instant('UserAccess.401NotAuthorized'));
            this.authService.logoutUserWithRedirect();    
        }
        this.errorDialogService.showError(error);
        return throwError(error);
      }));
  }

  private getTimezoneOffset(): string {
    return (String(new Date().getTimezoneOffset()));
  }
}
