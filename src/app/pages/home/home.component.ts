import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { HomeService } from './home.service';
import { Subscription } from 'rxjs';
import { EventConstants } from '../../@models/common/eventConstants';
import { EventAggregatorService } from '../../shared/services/event/event.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../shared/components/baseComponent';
import { RoleService } from '../../shared/services/role.service';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription;

  constructor(roleService: RoleService,
    private homeService: HomeService,
    private readonly eventService: EventAggregatorService,
    localeService: BsLocaleService,
    translateService: TranslateService,
    private authService: AuthService,
    private router: Router) {
      super(roleService, localeService, translateService);
      this.subscriptions = new Subscription();
      if (this.authService.isLoggedIn() && this.authService.isCurrentUserExist()
      && !this.authService.isTokenExpired()) {
        } else {
          this.router.navigate(['login'], { replaceUrl: true }).catch (error => {
            console.log(error);
          });
        }
    }

  ngOnInit() {
    this.subscriptions.add(this.eventService.getEvent(EventConstants.ProjectInContext).publish(null));
  }

  showHideProjects(event) {

  }

  setProjectIds(event) {

  }

  getOrganizationsList(organizationFilteredDataModel) {
    this.subscriptions.add(this.homeService.getOrganizationOnFilter(organizationFilteredDataModel)
    .subscribe(data => {
      },
      error => {
        console.log("error")
      }));
  }

  ngOnDestroy()
  {
    this.subscriptions.unsubscribe();
  }
}
