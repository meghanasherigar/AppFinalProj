import { Component, Input, ViewChild } from '@angular/core';
import { NbPopoverDirective } from '@nebular/theme';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';

import { ThemeSwitcherListComponent } from './themes-switcher-list/themes-switcher-list.component';
import { UserService } from '../../../pages/user/user.service';
import { UserNotification } from '../../../@models/common/notification';
import { NotificationRequestModel } from '../../../@models/user';
import { NotificationService } from '../../../pages/home/notification.service';
import { NotificationViewModel } from '../../../@models/notification';

@Component({
  selector: 'ngx-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
})
export class ThemeSwitcherComponent {
  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;

  @Input() showTitle: boolean = true;
 
  switcherListComponent = ThemeSwitcherListComponent;
  theme: NbJSThemeOptions;
 
  messageCount = 0;
  constructor(  private userService: UserService,
    private notificationService: NotificationService
  ){}
  ngOnInit() {
    this.getNotifications();
  }
  getNotifications() {
    let notificationRequestModel = new NotificationRequestModel();
    this.notificationService.getNotifications(notificationRequestModel).subscribe((data: any) => {
      this.userService.getNotificationData = data;
      this.messageCount = this.userService.getNotificationData.totalUnreadCount;
    });
    ;
  } 

  ngOnDestroy() {

  }
}
