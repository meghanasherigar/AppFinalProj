import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NbThemeService, NbPopoverDirective, NbPosition } from '@nebular/theme';
import { AnalyticsService } from '../../../../@core/utils/analytics.service';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';
import { UserNotification } from '../../../../@models/common/notification';
import { UserService } from '../../../../pages/user/user.service';
import { Router } from '@angular/router';
import { NotificationViewModel, NotificationGridModel } from '../../../../@models/notification';
import { NotificationHelper } from '../../../../shared/notification-helper';
import { DialogService } from '../../../../shared/services/dialog.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../pages/home/notification.service';
import { ResponseStatus } from '../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-theme-switcher-list',
  templateUrl: './theme-switcher-list.html',
  styleUrls: ['./theme-switcher-list.component.scss'],
})
export class ThemeSwitcherListComponent implements OnInit, OnDestroy {

  @Input() popover: NbPopoverDirective;

  theme: NbJSThemeOptions;

  notificationGridMenu: NotificationViewModel[];
  notificationMenu: NotificationGridModel[];
  subscriptions: Subscription = new Subscription();
  messageCount = 0;
  constructor(
    private router: Router,
    private themeService: NbThemeService,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private toastr: ToastrService,
    private notificationHelper: NotificationHelper,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private translate: TranslateService,) {
  }
  ngOnInit() {
    this.getNotifications();
    this.popover.position = NbPosition.BOTTOM; 
  }
  private getNotifications() {
    this.notificationGridMenu = this.userService.getNotificationData.notifications;
    this.notificationMenu = this.notificationHelper.updateNotificationMessage(this.notificationGridMenu);
  }
 
  onToggleTheme(themeKey: string) {
    this.themeService.changeTheme(themeKey);
    this.analyticsService.trackEvent('switchTheme');
    this.popover.hide();
  }

  updateAllAsRead(){
    this.subscriptions.add(this.notificationService.updateAllRead()
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.notification-screen.updatedSuccesfully'));
           
            this.getNotifications();
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
