import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { UserManager, User, WebStorageStateStore, UserManagerSettings, Log, MetadataService } from 'oidc-client';
import { AppliConfigService } from './appconfig.service';
import { StorageService, StorageKeys } from '../../@core/services/storage/storage.service';
import { SessionStorageService } from '../../@core/services/storage/sessionStorage.service';
import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { EventConstants } from '../../@models/common/eventConstants';
import { EventAggregatorService } from './event/event.service';
import { CompileShallowModuleMetadata } from '@angular/compiler';
import { RoleService } from './role.service';
import { ShareDetailService } from './share-detail.service';
import { Location } from '@angular/common';
import { UserUISetting, TokenDetails } from '../../@models/user';
import { tokenKey } from '@angular/core/src/view';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { userContext } from '../../@models/common/valueconstants';
import { CacheMapService } from './cache/cache-map.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public mgr: UserManager;
  public user: User = null;

  constructor(
    private http: HttpClient,
    private appConfig: AppliConfigService,
    private storageService : StorageService,
    private sessionStorageService: SessionStorageService,
    private readonly eventService: EventAggregatorService,
    private roleService: RoleService,
    private sharedDetailService: ShareDetailService,
    private location: Location,
    private cacheService: CacheMapService
  ) {
    //this.mgr.signinRedirect();
   }
   initAuthentication(config: AppliConfigService) {
    if (!config.useDpassLogin()) {
        this.initManagerEvents(config); 
        return this.loadUser();
    }
   }
   initManagerEvents(config: AppliConfigService)
   {
        this.appConfig = config;
        this.mgr = new UserManager(getClientSettings(this.appConfig));

    this.mgr.events.addAccessTokenExpired(() => {
        /*alert('Your session has expired! You will logged back in and redirected to the homepage');*/
        this.user = null;
        this.storageService.removeItem(userContext.userStorageKey);
        this.startAuthentication();
    });

    this.mgr.events.addUserLoaded(() => {
        this.mgr.getUser().then((user) => {
            this.eventService.getEvent(EventConstants.UserDataCallBack).publish('redirection');
            this.updateUser(user);
        })
        .catch((err) => {
            console.log(err);
        });
    });

    this.mgr.events.addAccessTokenExpiring(() => {
    });

    this.mgr.events.addSilentRenewError(function(err){
        this.mgr.getUser().then((user) => {
            this.user=user;
            this.storageService.addItem(userContext.userStorageKey, JSON.stringify(user));
            if (user == null) {
                this.redirectForToken();
            }
        })
        .catch((err) => {
           console.log(err);
        });
    });
   }

  init() {
    return this.mgr.getUser()
        .then((user) => {
            this.updateUser(user);
        })
        .catch((err) => {
            this.storageService.removeItem(userContext.userStorageKey);
        });
}

signinRedirectCallback() {
if(this.appConfig.UseAAALogin())
{
    return this.mgr.signinRedirectCallback().then((user) => {
        this.updateUser(user);
        }).catch((err) => {
            console.log(err); 
        });
}
}

getProfile() {
  const httpOptions = {
      headers: new HttpHeaders({
      })
  };
  const url = this.appConfig.UserProfileURI();
  return this.http.get(url, httpOptions);
}

getUserLoggedInCount() {
    let currentUser = JSON.parse(this.storageService.getItem('currentUser'));
    const httpOptions = {
        headers: new HttpHeaders({
        })
    };
    const UserData = {
         mail: currentUser['profile']['email']
    }
    const url = this.appConfig.ApiUserManagementUrl();
  return this.http.post(url + "/api/users/uservisitcount", UserData, httpOptions);
}

callAPI()
    {
        const httpOptions = {
            headers : new HttpHeaders({
                'Content-Type': 'text/plain',
            })
        };
        const url =  this.appConfig.ApiProjectSetupUrl() + '/identity';
        return this.http.get(url, httpOptions);
    }

    isLoggedIn(): boolean {
        const currentUser = JSON.parse(this.storageService.getItem(userContext.userStorageKey));
        if (currentUser && !this.isDateExpired(currentUser.expires_at))
            return true;
        return false;
      }

      isTokenExpired(): boolean {
        const currentUser = JSON.parse(this.storageService.getItem(userContext.userStorageKey));
        if (currentUser && !this.isDateExpired(currentUser.expires_at))
            return false;
        return true;
      }

    isCurrentUserExist(): boolean {
        let currentuser = JSON.parse(this.storageService.getItem(userContext.userStorageKey));
        return currentuser ? true : false;
    }

    logout() {
        if (!this.appConfig.useDpassLogin()) {
            this.user = null;
            return this.mgr.signoutRedirect().then(() => {
                this.storageService.clearAll();
                this.sessionStorageService.clearAll();
            });
        } else {
            //this.logOutAPI();
            this.user = null;
            this.cacheService.clearAll();
            this.storageService.clearAll();
            this.sessionStorageService.clearAll();
        }
    }
    logoutUserWithRedirect() {
        this.logout();
        window.open(this.getDpassSignOutCallURI(), '_self');
    }

    getDpassSignOutCallURI() {
        return this.appConfig.DpassAuthEndpointsUrl() + '/Home/SignOut';
    }
    logOutAPI(){
        let currentUser = JSON.parse(this.storageService.getItem(userContext.userStorageKey));
        if (currentUser) {
            let objTokens = new TokenDetails();
            objTokens.identityToken = currentUser.id_token;
            objTokens.contextId = this.storageService.getItem(userContext.userContextId) + ":" + this.storageService.getItem(userContext.userContextValue);
            return this.http.post<any>(this.appConfig.ApiUserManagementUrl() + '/api/tokengeneration/signout', objTokens);
        }
    }
  private signinSilent() {
    if(this.appConfig.UseAAALogin())
    {
        return this.mgr.signinSilent().then((user) => {
            this.user=user;
            this.storageService.addItem(userContext.userStorageKey, JSON.stringify(user));
        })
            .catch((err) => {
                this.mgr.getUser().then((user) => {
                    this.user=user;
                    this.storageService.addItem(userContext.userStorageKey, JSON.stringify(user));
                    console.log("addSilentRenewError: Updated User Info: " + JSON.stringify(user));
                    if (user == null) {
                        this.redirectForToken();
                    }
                })
                .catch((err) => {
                   console.log(err);
                });
                /*this.redirectForToken();*/
                /*console.log('signinSilent catch block: ' + err);*/
            });
    }
}

private redirectForToken() {
    this.mgr.signinRedirect();
}

public updateUser(user : User){
    if (user) {
        this.user=user;
        this.storageService.addItem(userContext.userStorageKey, JSON.stringify(user));
        this.eventService.getEvent(EventConstants.UserDataCallBack).publish(user);
    } else {
        this.user=null;
        this.storageService.removeItem(userContext.userStorageKey);
        this.signinSilent();
    }
}

startAuthentication(): Promise<void> {
    return this.mgr.signinRedirect();
  }

  tryCompleteAuthentication(): Promise<User> {
    return this.mgr.signinRedirectCallback();
}
completeAuthentication(): Promise<void> {
    return this.mgr.signinRedirectCallback().then(user => {
        this.updateUser(user);
        /*alert(JSON.stringify(user));*/
    });
}

public loadUser() {

    if (!this.isLoggedIn()) {
        const currentUser = JSON.parse(this.storageService.getItem('currentUser'));
        if (currentUser && currentUser != 'null') {
            this.user = currentUser;
        }
    }

        if (location.hash.startsWith('#id_token=') && !this.isLoggedIn()) {
            return new Promise((resolve, reject) => {
              this.tryCompleteAuthentication().catch((error: any): any => {
                reject(true);
                return Observable.throw('Error: Failed to load client config');
              }).then((envResponse: any) => {
                this.updateUser(envResponse);
                const currentUser = this.roleService.getUserRole();
                if (!currentUser) {
                    this.sharedDetailService.insertUserDetails().subscribe((response) => {
                    this.sharedDetailService.getUserSettings().subscribe((userSetting) => {
                    if (!currentUser) {
                        userSetting.adminView = false;
                    }
                    if (userSetting.isCountryAdmin || userSetting.isGlobalAdmin) {
                        this.roleService.setUserRole(userSetting);
                    } else {
                        userSetting.isPorjectUser = true;
                        this.roleService.setUserRole(userSetting);
                    }

                    let userUISettings = new UserUISetting();
                    userUISettings.isLeftNavigationExpanded = true;
                    userUISettings.isMenuExpanded = true;

                    this.storageService.addItem(StorageKeys.USERUISETTINGS, JSON.stringify(userUISettings));

                    resolve(true);
                    }, (error) => {
                        reject(true);
                        return Observable.throw('Error: Failed to get userSettings for user');
                    });
                    }, (error: HttpErrorResponse) => {
                         reject(true);
                         if(error.status === 403){
                            this.storageService.clearAll();
                            this.sessionStorageService.clearAll();
                            //ToDo - Later, We need to update with multilingual support.
                            window.open(this.location.path.name + '/assets/static-pages/unauthorizeduser-en.html', '_self');
                         }                     
                     return Observable.throw('Error: Failed to get userSettings for user');
                });
                }
              });
            });
          }
          if (!this.isLoggedIn()) {
           return new Promise((resolve, reject) => {
        this.mgr.signinRedirect().then(user => {
            resolve(true);
        }).catch((error: any): any => {
            reject(true);
            return Observable.throw('Error: Failed to login for user');
        });
          });
        }
  }
    loadUserDpass() {
        if (!this.isLoggedIn()) {
            const currentUser = JSON.parse(this.storageService.getItem('currentUser'));
            if (currentUser && currentUser != 'null') {
                this.user = currentUser;
            }
        }
    }
  async regenerateToken(objTokens: TokenDetails){
    let http = new HttpHeaders({'Authorization':'Bearer '+ objTokens.identityToken, 'ContextId':  objTokens.contextId});
    return this.http.post<any>(this.appConfig.ApiUserManagementUrl() + '/api/tokengeneration/regenerate', objTokens, { headers: http }).toPromise();
  }
  getDpassPostCallURI() {
    return this.appConfig.DpassAuthEndpointsUrl() + '/Home/Index';
  }
    silentTokenRefresh() {
        let currentUser = JSON.parse(this.storageService.getItem(userContext.userStorageKey));
        if (currentUser) {
            let objTokens = new TokenDetails();
            objTokens.identityToken = currentUser.access_token;
            objTokens.expiryAt = currentUser.expires_at;
            objTokens.contextId = this.storageService.getItem(userContext.userContextId) + ":" + this.storageService.getItem(userContext.userContextValue);
            return this.http.post<any>(this.appConfig.ApiUserManagementUrl() + '/api/tokengeneration/silenttokenrefresh', objTokens);
        }
    }
    getUrlRedirect(redirecturlid) {
        const currentUser = JSON.parse(this.storageService.getItem('currentUser'));
        if (currentUser && currentUser != 'null') {
          let objModel = { email: currentUser.profile.email, redirectUrlId: redirecturlid };
          return this.http.post<any>(this.appConfig.ApiProjectDesignUrl() + "/api/informationrequest/getnotification", objModel);
        }
    }
    isDateExpired(expiredDate: string) {
        const selectedDate = moment(expiredDate).local();
        const now = moment().local();
        return now.isAfter(selectedDate);
      }
}

export const store = window.localStorage;
export function getClientSettings(appConfig: AppliConfigService): UserManagerSettings {
    return {
           client_id: appConfig.ClientID(),
            //userStore: new WebStorageStateStore({ store}),
            redirect_uri: appConfig.RedirectURI(),
            post_logout_redirect_uri: appConfig.PostLogoutRedirectURI(),
            response_type: appConfig.ResponseType(),
            scope: appConfig.Scope(),
            silent_redirect_uri: appConfig.SilentRedirectURI(),
            automaticSilentRenew: true,
            filterProtocolClaims: false,
            accessTokenExpiringNotificationTime: 600,
            authority: appConfig.AuthorityBaseAddress(),
    };
}
