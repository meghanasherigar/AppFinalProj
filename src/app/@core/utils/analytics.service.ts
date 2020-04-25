import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../pages/user/user.service';
import { TranslateService } from '@ngx-translate/core';
import { AppliConfigService } from '../../shared/services/appconfig.service';

declare var _satellite: any;

// declare const ga: any;

@Injectable()
export class AnalyticsService {
  private enabled: boolean;

  constructor(private location: Location, private router: Router,
    private titleService: Title, private userService: UserService,
    private translationService: TranslateService,
    private appConfig: AppliConfigService) {
    this.enabled = appConfig.EnableScripts();
  }

  trackPageViews() {
    if (this.enabled) {
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
      )
        .subscribe((ev) => {
          // ga('send', {hitType: 'pageview', page: this.location.path()});
          window["digitalData"] = {
            page: {
              pageInfo: {
                destinationURL: this.location.path(),
                // contentTitle: this.initData['pageName'],
                pageName: this.titleService.getTitle(),
                // genericPageName: this.initData['pageName'],
                language: this.translationService.currentLang, // this.initData['language']
              },
              // category: {
              //   memberFirm: this.initData['memberFirm']
              // }
            },
            user: [{
              profile: [{
                profileInfo: {
                  userName: this.userService.getLoggedInUserName(),
                },
              }],
            }],
          };
          _satellite.track("page_load");
          // console.log("page_load: " + JSON.stringify(window["digitalData"]));
        });
    }
  }

  trackEvent(eventName: string) {
    if (this.enabled) {
      // console.log('event: ' + eventName);
      // ga('send', 'event', eventName);
    }
  }
}
