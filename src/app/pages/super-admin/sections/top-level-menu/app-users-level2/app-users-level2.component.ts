import { Component, NgModule, OnInit, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { TranslateService } from '@ngx-translate/core';
import { eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { ActionOnAppUsers } from '../../../../../@models/super-admin/appUsers';

@Component({
  selector: 'ngx-app-users-level2',
  templateUrl: './app-users-level2.component.html',
  styleUrls: ['./app-users-level2.component.scss']
})
export class AppUsersLevel2Component implements OnInit {

  public show: boolean;
  public levelTwoMenuShowHideLabel = this.translateService.instant('screens.commonLabel.collapse');

  constructor(
    private eventService: EventAggregatorService,
    private translateService: TranslateService,
  ) { }

  ngOnInit() {
  }

  toggleCollapse() {
    this.show = !this.show;
    this.levelTwoMenuShowHideLabel = this.show === true ? this.translateService.instant('screens.commonLabel.collapse'): this.translateService.instant('screens.commonLabel.expand');
  }

  addAppUser() {
    this.eventService.getEvent(eventConstantsEnum.superAdmin.appUsers.addAppUser).publish(ActionOnAppUsers.add);
  }

  getAppUserTemplate() {
    this.eventService.getEvent(eventConstantsEnum.superAdmin.appUsers.addAppUser).publish(ActionOnAppUsers.downloadTemplate);
  }

  uploadAppUser() {
    this.eventService.getEvent(eventConstantsEnum.superAdmin.appUsers.addAppUser).publish(ActionOnAppUsers.upload);
  }

}
