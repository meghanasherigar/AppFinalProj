import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { StorageService } from '../../@core/services/storage/storage.service';

@Injectable()
export class AppliConfigService {

  private config: ClientConfig;
  private get clientConfig(): ClientConfig {
    if (this.config == null) {
      var envConfig = this.storageService.getItem('client-config');
      if (envConfig != null) {
        this.config = JSON.parse(envConfig);
      }
    }
    return this.config;
  }
  private set clientConfig(value: ClientConfig) {
    this.config = value;
  }

  constructor(private http: HttpClient,
    private storageService: StorageService) {
  }

  public loadClientConfig() {
    return new Promise((resolve, reject) => {
      this.http.get('/assets/config/client-config.json').catch((error: any): any => {
        reject(true);
        return Observable.throw('Error: Failed to load client config');
      }).subscribe((envResponse: any) => {
        var envResponseStr = JSON.stringify(envResponse);
        this.clientConfig = JSON.parse(envResponseStr);
        this.storageService.addItem('client-config', envResponseStr);
        resolve(true);
      });
    });
  }

  Name() {
    return this.clientConfig.name;
  }

  // AAA Configuration
  AuthorityBaseAddress() {
    return this.clientConfig.authEndpoints.authority;
  }

  ClientID() {
    return this.clientConfig.authEndpoints.clientId;
  }

  Scope() {
    return this.clientConfig.authEndpoints.scope;
  }

  RedirectURI() {
    return this.clientConfig.authEndpoints.redirectURI;
  }

  PostLogoutRedirectURI() {
    return this.clientConfig.authEndpoints.postLogoutRedirectURI;
  }

  ResponseType() {
    return this.clientConfig.authEndpoints.responseType;
  }

  SilentRedirectURI() {
    return this.clientConfig.authEndpoints.silentRedirectURI;
  }

  UserProfileURI() {
    return this.clientConfig.userProfileAPIUrl;
  }

  UseAAALogin() {
    return this.clientConfig.useAAALogIn;
  }
  
  useDpassLogin() {
    return this.clientConfig.useDpassLogin;
  }
  EnableScripts() {
    return this.clientConfig.enableScripts;
  }
  ExpiryTimeInMinutes() {
    return this.clientConfig.expiryTimeInMinutes;
  }
  IdealTimoutInMinutes() {
    return this.clientConfig.idealTimoutInMinutes;
  }
  //section to define api urls -- starts

  ApiProjectSetupUrl() { // rename to ApiProjectSetupUrl
    return this.clientConfig.projectSetupApiUrl;
  }

  ApiUserManagementUrl() {
    return this.clientConfig.userManagementApiUrl;
  }

  ApiProjectManagementUrl() {
    return this.clientConfig.projectManagementApiUrl;
  }

  ApiProjectDesignUrl() {
    return this.clientConfig.projectDesignApiUrl;
  }

  //section to define api urls -- ends

  AdobeAnalyticsJavaScripts(): string {
    return this.clientConfig.adobeAnalyticsJavaScripts;
  }
  DpassAuthEndpointsUrl(): string {
    return this.clientConfig.dpassAuthEndpointsUrl;
  }
  ApiProjectSetUpUrlUS(){
    return this.clientConfig.projectSetupApiUrlUS;
  }
}

class ClientConfig {
  name: string;
  projectSetupApiUrl: string;
  userManagementApiUrl: string;
  projectManagementApiUrl: string;
  projectDesignApiUrl: string;
  useAAALogIn: boolean;
  useDpassLogin:boolean;
  useCcpLogin: boolean;
  enableScripts: boolean;
  userProfileAPIUrl: string;
  authEndpoints: AuthEndpoints;
  adobeAnalyticsJavaScripts: string;
  dpassAuthEndpointsUrl: string;
  projectSetupApiUrlUS: string;
  expiryTimeInMinutes: number;
  idealTimoutInMinutes: number;
}
class AuthEndpoints {
  authority: string;
  scope: string;
  clientId: string;
  redirectURI: string;
  postLogoutRedirectURI: string;
  responseType: string;
  silentRedirectURI: string;
}
