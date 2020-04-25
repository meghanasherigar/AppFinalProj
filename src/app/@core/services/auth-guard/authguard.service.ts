import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { AppliConfigService } from '../../../shared/services/appconfig.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService implements CanActivate {

  constructor(
    private authService: AuthService,
    private appConfig: AppliConfigService,
  ) { }

  canActivate(): boolean {
    if (!this.appConfig.useDpassLogin()) {
      if (!this.appConfig.UseAAALogin() || this.authService.isLoggedIn()) {
        return true;
      }
      this.authService.startAuthentication();
      return false;
    } else {
      if(this.authService.isLoggedIn())
        return true;
        
      return false;
    }
  }

}
