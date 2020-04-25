/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';

import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../app/shared/services/auth.service';
import { Location, DOCUMENT } from '@angular/common';
import { AppliConfigService } from './shared/services/appconfig.service'
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { User } from './@models/user';
import { UserService } from './pages/user/user.service';
import { RoleService } from './shared/services/role.service';
import { EventConstants, eventConstantsEnum } from './@models/common/eventConstants';
import { EventAggregatorService } from './shared/services/event/event.service';
import { userContext } from './@models/common/valueconstants';
import { TreeViewService } from './shared/services/tree-view.service';
import { StorageService, StorageKeys } from './@core/services/storage/storage.service';
import { Dialog, DialogTypes } from './@models/common/dialog';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, AfterViewInit {
  treeViewService: TreeViewService;
  silentRefresh: Subscription;

  OtherSubscriptions= new Subscription();

  constructor(
    private readonly eventService: EventAggregatorService,
    private analytics: AnalyticsService,
    private translate: TranslateService,
    private location: Location,
    private router: Router,
    private authService: AuthService,
    private appConfig: AppliConfigService,
    private userService: UserService,
    private roleService: RoleService,
    private storageService: StorageService,
    private dialog: MatDialog,
    @Inject(DOCUMENT) private doc: any,
  ) {
    this.translate.setDefaultLang('en-US');
    //this.translate.use('en');
    if (!appConfig.useDpassLogin()) {
      if (!appConfig.UseAAALogin()) {
        this.router.navigate(['pages/home']);
      }
      if (!location.path().startsWith('id_token=') && !authService.isLoggedIn()) {
        this.authService.loadUser();
      }
      this.userService.insertUserDetails();
      if (location.path().startsWith('id_token=') && authService.isLoggedIn()) {
        this.getAndSetUserRoles();
      }
    }
  }

  private getAndSetUserRoles() {
    if (this.authService.isLoggedIn()) {
      const userSetting = this.roleService.getUserRole();
      if (userSetting) {
        if (!userSetting.isTermsAccepted) {
          this.router.navigate(['pages/./home/terms-of-use']);
        }
        else {
          if (!userSetting.isWhatsNewHidden) {
            if (userSetting.whatsNewVisitCount <= 1) {
              this.router.navigate(['pages/./home/whatsnew']);
            } else {
              this.router.navigate(['pages/home']);
            }
          } else if (userSetting.isWhatsNewHidden) {
            this.router.navigate(['pages/./home/whatsnew']);
          }
        }

      } else {
        this.translate.use('en-US');

        this.treeViewService = new TreeViewService(this.translate);
        console.log('Error: Failed to load user roles');
      }

    }
  }

  ngOnInit(): void {
    if (this.appConfig.useDpassLogin()) {
     this.silentTokenRefresh();
    }
    this.setScriptTagManager();
    this.analytics.trackPageViews();
  }
  silentTokenRefresh() {
    let time = this.appConfig.ExpiryTimeInMinutes() * 60 * 1000;
    this.silentRefresh = Observable.interval(time).timeInterval().flatMap(() => this.authService.silentTokenRefresh()).subscribe(data => {
      this.idealTimeOut();
      if (data && data.access_token && data.access_token != "") {
        this.storageService.removeItem(userContext.userStorageKey);
        this.storageService.addItem(userContext.userStorageKey, JSON.stringify(data));
      }
      //Info: If the time interval changes, accordingly notification should be handled 10 mins with another observable
      this.getNotifications();
    }, error => {
      console.error(error);
      this.idealTimeOut();
      this.getNotifications();
    });
  }
  idealTimeOut() {
    let idealExpireTime = this.appConfig.IdealTimoutInMinutes();
    if (this.storageService.getItem(StorageKeys.IDEALTIME) != null) {
      let currentDate = new Date();
      let sessionDate = new Date(this.storageService.getItem(StorageKeys.IDEALTIME));
      let idealTime = this.getTimeDiffranceInMinute(currentDate, sessionDate);
     
      //if the expiiry time is 20 min, pop up should display.
      if (idealTime >= idealExpireTime) {
         // Avoid multiple pop up. 
        this.silentRefresh.unsubscribe();
        let expirytime = parseInt(idealExpireTime.toString()) + 10;
        if (idealTime >= expirytime) {
          // If the user is not doing any action after the popup came. Application should sign out
          this.authService.logoutUserWithRedirect();
        } else {
          let dialogTemplate = new Dialog();
          dialogTemplate.Type = DialogTypes.Info;
          dialogTemplate.Message = this.translate.instant('UserAccess.IdealTimOut');;
          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: dialogTemplate
          });
          dialogRef.afterClosed().subscribe(result => {
            let currentDate = new Date();
            idealTime = this.getTimeDiffranceInMinute(currentDate, sessionDate);
            if (idealTime >= expirytime) {
              // sign out the application if user is not respond the pop with in 10 minutes.
              this.authService.logoutUserWithRedirect();
            } else {
              this.silentTokenRefresh();
            }
          })
        }
      }
    }
  }

  getTimeDiffranceInMinute(currentDate, sessionDate) {
    let diff = (currentDate.getTime() - sessionDate.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff))
  }

  ngAfterViewInit() {
    if (this.authService.isLoggedIn()) {
      const userSetting = this.roleService.getUserRole();
      if (userSetting) {
        const userLanguage = userSetting.userPreferences ? userSetting.userPreferences.language : 'en-US';
        this.translate.use(userLanguage);

        this.treeViewService = new TreeViewService(this.translate);
      }
    }
  }
  private setScriptTagManager() {
    if (this.appConfig.EnableScripts()) {
      const s = this.doc.createElement('script');
      s.type = 'text/javascript';
      s.src = this.appConfig.AdobeAnalyticsJavaScripts();
      s.async = true;
      const head = this.doc.getElementsByTagName('head')[0];
      head.appendChild(s);
    }
  }

  private setCurrentUserRole(userRole) {
    if (userRole.isCountryAdmin || userRole.isGlobalAdmin) {
      this.roleService.setUserRole(userRole);
    } else {
      userRole.isPorjectUser = true;
      this.roleService.setUserRole(userRole);
    }
  }

  private getNotifications()
  {
    this.OtherSubscriptions.add(
      this.eventService.getEvent(eventConstantsEnum.notification.loadNotifications)
      .publish(eventConstantsEnum.notification.AutoRefresh)
    );
  }
}
