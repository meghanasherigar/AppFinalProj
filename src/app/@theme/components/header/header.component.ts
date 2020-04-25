import { Component, Input, OnInit, AfterViewInit, Inject, LOCALE_ID, OnDestroy } from '@angular/core';

import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AnalyticsService } from '../../../@core/utils';
import { LayoutService } from '../../../@core/utils';
import { UserService } from '../../../pages/user/user.service';
import { User, UserSetting, NotificationRequestModel, UserPreference } from '../../../@models/user';
import { filter } from 'rxjs/operators';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserNotification, contextMenu } from '../../../@models/common/notification';
import { StorageService, StorageKeys } from '../../../@core/services/storage/storage.service';
import { SessionStorageService } from '../../../@core/services/storage/sessionStorage.service';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { DialogTypes, Dialog } from '../../../@models/common/dialog';
import { DialogService } from '../../../shared/services/dialog.service';
import { NavigationEnd, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { Subject, Observable, Subscription } from 'rxjs';
import { EventConstants, eventConstantsEnum } from '../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { RoleService } from '../../../shared/services/role.service';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { ProjectAccessRight } from '../../../@models/organization';
import { DesignerService } from '../../../pages/project-design/services/designer.service';
import { NotificationService } from '../../../pages/home/notification.service';
import { ThemeSwitcherListComponent } from '../theme-switcher/themes-switcher-list/themes-switcher-list.component';
import { NotificationViewModel } from '../../../@models/notification';
import { NotificationHelper } from '../../../shared/notification-helper';
import { SubMenus, Menus as ProjectDesignerMenus } from '../../../@models/projectDesigner/designer';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TreeViewService } from '../../../shared/services/tree-view.service';
import { async } from 'rxjs/internal/scheduler/async';
import { ValueConstants } from '../../../@models/common/valueconstants';

enum Menus {
  Home = 1,
  ProjectSetup,
  ProjectDesigner,
  Transaction,
  ProjectManagement,
  Admin,
  FileUpload,
  Help,
  Notification
}

export const TopMenus = [
  {
    id: Menus.Home,
    url: '/#/pages/home',
    link: [{ outlets: { primary: 'pages/home' } }],
    picture: 'assets/images/L1_nav_tab/L1-Home.png',
    pictureSelected: 'assets/images/L1_nav_tab/L1-Home-Selected.png',
    disable: false,
    text: 'menuItems.Home',
    hidden: false
  },
  {
    id: Menus.ProjectSetup,
    link: ['pages/project-setup/projectSetupMain', { outlets: { primary: 'usersMain', level2Menu: 'usersLevel2Menu', leftNav: 'leftNav' } }],
    url: '/#/pages/project-setup/projectSetupMain/(usersMain//level2Menu:usersLevel2Menu//leftNav:leftNav)',
    picture: 'assets/images/L1_nav_tab/L1-ProjectSetup.png',
    pictureSelected: 'assets/images/L1_nav_tab/L1-ProjectSetup-Selected.png',
    disable: true,
    text: 'menuItems.ProjectSetup',
    hidden: false
  },
  {
    id: Menus.ProjectDesigner,
    link: ['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: 'iconViewRegion', level2Menu: 'iconViewLevel2Menu', topmenu: 'iconviewtopmenu' } }],
    url: '/#/pages/project-design/projectdesignMain/iconViewMain/(iconViewRegion//level2Menu:iconViewLevel2Menu//topmenu:iconviewtopmenu)',
    picture: 'assets/images/L1_nav_tab/L1-Project Designer.png',
    pictureSelected: 'assets/images/L1_nav_tab/L1-Project Designer-Selected.png',
    disable: true,
    text: 'menuItems.ProjectDesigner',
    hidden: false
  },
  {
    id: Menus.ProjectManagement,
    link: ['pages/project-management/ProjectManagementMain', { outlets: { primary: 'Deliverable', level2Menu: 'DeliverableLevel2Menu', topmenu: 'ProjectManagementTopMenu' } }],
    url: '/#/pages/project-management/ProjectManagementMain/(Deliverable//level2Menu:DeliverableLevel2Menu//topmenu:ProjectManagementTopMenu)',
    picture: 'assets/images/L1_nav_tab/L1-ProjMgnt.png',
    pictureSelected: 'assets/images/L1_nav_tab/L1-ProjMgnt-Selected.png',
    disable: true,
    text: 'menuItems.ProjectManagement',
    hidden: false
  },
  {
    id: Menus.Admin,
    link: ['pages/admin/adminMain', { outlets: { primary: 'usageReportMain', level2Menu: 'uageReportLevel2Menu', leftNav: 'leftNav' } }],
    url: '/#/pages/admin/adminMain/(usageReportMain//level2Menu:uageReportLevel2Menu//leftNav:leftNav)',
    picture: 'assets/images/L1_nav_tab/Admin.png',
    pictureSelected: 'assets/images/L1_nav_tab/Admin-selected.png',
    disable: true,
    text: 'menuItems.Admin',
    hidden: false
  },
  // {
  //   id: Menus.Help,
  //   url: '/#/pages/help/helpMain/(FAQMain//level2Menu:FAQLevel2Menu//leftNav:leftNav)',
  //   picture: 'assets/images/L1_nav_tab/L1-ProjMgnt.png',
  //   pictureSelected: 'assets/images/L1_nav_tab/L1-ProjMgnt-Selected.png',
  //   disable: false
  // },
];

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  // added by Divya starts
  // TODO: These menu variable should go inside dynamic menus once implemented
  topMenus = TopMenus;
  organizationName: string = '';
  projectName: string = '';
  isHelpActivated: boolean;
  isNotificationActivated: boolean;
  isGlobalAdmin: boolean = false;
  isCountryAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  selectedMenu: Menus;
  disAbleIcon: boolean;
  messageCount = 0;
  navbarOpen = false;
  treeViewService: any;
  subscriptions: Subscription = new Subscription();
  notificationGridMenu: NotificationViewModel[];
  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }
  //added by Divya ends
  @Input() position = 'normal';

  switcherListComponent = ThemeSwitcherListComponent;

  user: any;
  currentUser;
  adminView;
  userSetting;
  isWhatsNew;
  projectSetupView;
  isWhatsNewFlag;
  defaultLangCode = 'en-US';
  selectedLanguage: any = {
    title: 'English', code: 'en-US',
    data: 'menuItems.EnglishUS', picture: 'assets/images/flags/en-us.svg'
  };

  selectedLanguageTag = 'selectedLanguage';
  selectedUserTag = 'user';
  selectedNotificationTag = 'notification';
  userMenu = [{ title: 'Sign out', data: 'menuItems.LogOut' },
  { title: 'Language selection', data: 'menuItems.LanguageSelection' }
  ];
  notificationMenu = [{ title: 'No Notification', data: '' }];
  languages = [
    { title: 'English', code: 'en-US', picture: 'assets/images/flags/en-us.svg', data: 'menuItems.EnglishUS' },
    { title: 'English UK', code: 'en-GB', picture: 'assets/images/flags/en-gb.svg', data: 'menuItems.EnglishUK' },
    { title: 'Spanish', code: 'es-ES', picture: 'assets/images/flags/es-es.svg', data: 'menuItems.Spanish' },
    { title: 'Japanese', code: 'ja-JP', picture: 'assets/images/flags/ja-jp.svg', data: 'menuItems.Japanese' },
  ];

  private dialogTemplate: Dialog;

  constructor(@Inject(LOCALE_ID) private _locale: string, private menuService: NbMenuService,
    private readonly eventService: EventAggregatorService,
    private router: Router,
    private roleService: RoleService,
    private userservice: UserService,
    private authService: AuthService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private sharedservice: ShareDetailService,
    private storageService: StorageService,
    private sessionStorageService: SessionStorageService,
    private analyticsService: AnalyticsService,
    private translate: TranslateService,
    private designerService: DesignerService,
    private notificationService: NotificationService,
    private userService: UserService,
    private location: Location,
    private notificationHelper: NotificationHelper, private appConfig: AppliConfigService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.userMenu.forEach(element => {
        this.translate.get(element.data).subscribe((res: string) => {
          element.title = res;
        });
      });

      this.languages.forEach(element => {
        this.translate.get(element.data).subscribe((res: string) => {
          element.title = res;
        });
      });
    });
  }

  ngOnInit() {
    this.subscriptions.add(this.eventService.getEvent(EventConstants.DisAbleIcon).subscribe((payload: boolean) => {
      if (payload)
        this.disAbleIcon = true;
    }));
    this.subscriptions.add(this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.showOrHideProjectManagment).subscribe((payload: boolean) => {
      this.topMenus.find(x => x.id == Menus.ProjectManagement).hidden = payload;
    }))

    const userSetting = this.roleService.getUserRole();
    if (userSetting && !userSetting.isTermsAccepted) {
      this.disAbleIcon = false;
    }
    else {
      this.disAbleIcon = true;
    }
    this.getLoggedInUserSettings();
    this.user = this.userservice.getLoggedInUser();
    if (this.user != null && this.user !== undefined && this.user !== '') {
      this.getLoggedInUserSettings();
    }

    this.eventService.getEvent(EventConstants.UserDataCallBack).subscribe((payload) => {
      if (payload !== 'redirection') {
        this.getLoggedInUserSettings();
      }
    });

    this.subscriptions.add(this.eventService.getEvent(EventConstants.ActivateMenu).subscribe((payload: any) => {
      if (payload) {
        if (!this.roleService.getUserRole().adminView) {
          const UserAccessSetting = this.sharedservice.getORganizationDetail();
          if (UserAccessSetting.ProjectAccessRight) {
            if (UserAccessSetting.ProjectAccessRight.isCentralUser) {
              this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(true);
              this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
              this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
            } else {
              this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
              this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
            }
          }
        }
        this.activateCurrentTopMenu(payload);
      } else {
        const menuItem = this.topMenus.find((x) => {
          return x.url === '/#' + this.router.url;
        });

        if (menuItem && menuItem.id != Menus.Help) {
          this.selectedMenu = menuItem.id;
        }
      }
    }));

    this.subscriptions.add(this.eventService.getEvent(EventConstants.ProjectInContext).subscribe((payload: any) => {
      const projectInContext = this.sharedservice.getORganizationDetail();
      if (payload && projectInContext.projectId) {
        this.organizationName = projectInContext.organizationName;
        this.projectName = projectInContext.projectName;
      } else {
        this.organizationName = null;
        this.projectName = null;
      }
    }));

    this.subscriptions.add(this.eventService.getEvent(EventConstants.AdminView).subscribe((payload: boolean) => {
      if (payload == undefined) {
        this.selectedMenu = Menus.Admin;
      }
      const usersetting = this.roleService.getUserRole();
      if (!usersetting.adminView) {
        this.adminView = false;
        this.enableDisableMenusItems(true, Menus.Admin);
      } else {
        this.adminView = usersetting.adminView;
        this.enableDisableMenusItems(false, Menus.Admin);
      }
    }));
    this.subscriptions.add(this.eventService.getEvent(EventConstants.ProjectTabAccess).subscribe((payload: boolean) => {
      this.projectSetupView = payload;
      if (payload) {
        this.enableDisableMenusItems(false, Menus.ProjectSetup);
      }
      else { this.enableDisableMenusItems(true, Menus.ProjectSetup); }
    }));
    this.subscriptions.add(this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).subscribe((payload: boolean) => {
      if (payload) {
        this.enableDisableMenusItems(false, Menus.ProjectDesigner);
      }
      else { this.enableDisableMenusItems(true, Menus.ProjectDesigner); }
    }));
    this.subscriptions.add(this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).subscribe((payload: boolean) => {
      if (payload) { this.enableDisableMenusItems(false, Menus.ProjectManagement); }
      else { this.enableDisableMenusItems(true, Menus.ProjectManagement); }
    }));
    this.currentUser = JSON.parse(this.storageService.getItem('currentUser'));

    this.menuService.onItemClick()
      .pipe(filter(({ tag }) => tag === this.selectedUserTag))
      .subscribe(event => {
        this.userservice.logOutUser();
      });
    this.getNotifications();
    this.initSelectedMenu();

    this.subscriptions.add(this.eventService.getEvent(eventConstantsEnum.notification.loadNotifications)
      .subscribe((payload) => {
        
          switch(payload)
          {
            case eventConstantsEnum.notification.Reload:
              this.getNotifications();
              break;
              case eventConstantsEnum.notification.AutoRefresh:
                this.getNotifications(true);
                break;
          }
      }));

    //this.automaticNotification();
    if(this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) != null){
      this.topMenus.forEach((item) => {
        item.disable = true;
      });
    }
  }

  goToAdminVIew() {
    this.router.navigate(['pages/super-admin/superAdminMain', { outlets: { primary: ['AppUsers'], level2Menu: ['AppUsersLevel2Menu'], leftNav: ['superAdminLeftNav'] } }]);
  }

  activateCurrentTopMenu(currentUrl?) {
    this.topMenus.forEach((item, index) => {
      const url = item.url.substring(0, item.url.indexOf("("));
      if (currentUrl === url) {
        this.selectedMenu = item.id;
      }
    });
  }

  initSelectedMenu() {
    const userSetting = this.roleService.getUserRole();
    (userSetting.isGlobalAdmin || userSetting.isCountryAdmin) ? this.topMenus[4].hidden = false : this.topMenus[4].hidden = true;
    const currentUrl = '/#' + this.router.url;
    const Url = currentUrl.substring(0, currentUrl.indexOf("("));
    this.eventService.getEvent(EventConstants.ActivateMenu).publish(Url);
    const menuItem = this.topMenus.find((x) => {
      return x.url === '/#' + this.router.url;
    });

    if (menuItem && menuItem.id != Menus.Help) {
      this.selectedMenu = menuItem.id;
    }
    if (currentUrl === '/#/pages') {
      this.selectedMenu = Menus.Home;
    }
    if (menuItem) {
      this.isHelpActivated = this.router.url ==
        '/pages/help/helpMain/(FAQMain//level2Menu:FAQLevel2Menu//leftNav:leftNav)'
        || menuItem.id === Menus.Help;

    }
  }

  enableDisableMenusItems(menuDisable, menuitem) {
    this.topMenus.forEach((menu, i) => {
      if (menu.id === menuitem) {
        this.topMenus[i].disable = menuDisable;
      }
    });
  }

  goToHome() {
    this.menuService.navigateHome();
  }

  activeAdminViewRedirection(adminSwitch) {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    if (adminSwitch) {
      this.dialogTemplate.Message = this.translate.instant('screens.user.AdminView.EnableSwitch');
    } else {
      this.dialogTemplate.Message = this.translate.instant('screens.user.AdminView.DisableSwitch');
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const usersetting = this.roleService.getUserRole();
        usersetting.adminView = adminSwitch;
        this.roleService.setUserRole(usersetting);
        this.isHelpActivated = false;
        this.isNotificationActivated = false;
        //this.router.navigate(['/']);
        this.router.navigate(['pages/home']);
        this.designerService.isAdminModule = adminSwitch;
        this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(false);
        this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(false);
        this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(false);
        this.eventService.getEvent(EventConstants.AdminView).publish(adminSwitch);
        this.selectedMenu = Menus.Home;
      } else {
        this.eventService.getEvent(EventConstants.AdminView).publish(adminSwitch);
      }
    });

  }

  logOutUser() {
    this.userservice.logOutUser();
    if (this.appConfig.useDpassLogin())
      window.open(this.authService.getDpassSignOutCallURI(), '_self');
  }

  getLoggedInUserSettings() {
    const adminSwitch = this.roleService.getUserRole();
    this.AdminUrl(adminSwitch);
    this.isWhatsNew = adminSwitch.isWhatsNewHidden;
    this.isGlobalAdmin = adminSwitch.isGlobalAdmin;
    this.isCountryAdmin = adminSwitch.isCountryAdmin;
    this.isSuperAdmin = adminSwitch.isSuperAdmin;
    this.roleService.setUserRole(adminSwitch);
    if (!adminSwitch.adminView) {
      this.adminView = adminSwitch.adminView;
      this.enableDisableMenusItems(true, Menus.Admin);
    } else {
      this.adminView = adminSwitch.adminView;
      this.enableDisableMenusItems(false, Menus.Admin);
    }
    //Fetch user's preferred language:
    let userLanguage = adminSwitch.userPreferences ? adminSwitch.userPreferences.language : this.defaultLangCode;
    this.setSavedLanguage(userLanguage);
  }


  setSavedLanguage(userLanguage: string) {
    this.selectedLanguage = this.languages.find(c => c.code === userLanguage);
    this.translate.use(this.selectedLanguage.code);
    this.treeViewService = new TreeViewService(this.translate);
    this._locale = this.selectedLanguage;
    this.treeViewService = new TreeViewService(this.translate);
  }

  updateUserWelcomeViewSettings(evnt) {
    // this.isWhatsNew = evnt;
    this.userservice.updateWhatsNewSettings(evnt)
      .subscribe((response) => {
        const userSettings = this.roleService.getUserRole();
        if (response.status === ResponseStatus.Sucess) {
          userSettings.isWhatsNewHidden = evnt;
          this.roleService.setUserRole(userSettings);
          this.getLoggedInUserSettings();
          this.toastr.success(this.translate.instant('screens.user.WelcomeMessage.Success'));

        } else if (response.status) {
          userSettings.isWhatsNewHidden = evnt;
          this.roleService.setUserRole(userSettings);
          this.getLoggedInUserSettings();
          this.toastr.success(this.translate.instant('screens.user.WelcomeMessage.Success'));

        } else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      }, (error) => {
        console.log('watsnewerror', error);
        // this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        this.dialogService.Open(DialogTypes.Error, "Unauthorized");
      });
  }

  startSearch() {
    this.analyticsService.trackEvent('startSearch');
  }
  activateMenu(menu: Menus, url?: string) {
    this.closeDocumentView();
    if (menu === Menus.ProjectDesigner) {
      this.designerService.hideOrShowMenus(0);
      this.designerService.selectedSubmenus(0);
      this.designerService.selecteMenu(ProjectDesignerMenus.Block);
    }
    if ((menu === Menus.Home) || (menu === Menus.Admin)) {
      this.sessionStorageService.removeItem(StorageKeys.THEMINGCONTEXT);
      this.designerService.selectedThemeInContext = this.sharedservice.getSelectedTheme();
    }
    if (menu === Menus.Home) {
      this.designerService.hideOrShowMenus(0);
      this.designerService.selectedSubmenus(0);
      this.designerService.selecteMenu(ProjectDesignerMenus.Block);
      const ProjectAccessRights = this.sharedservice.getORganizationDetail();
      if (ProjectAccessRights) {
        if (ProjectAccessRights.ProjectAccessRight) {
          ProjectAccessRights.ProjectAccessRight = new ProjectAccessRight();
          this.sharedservice.setOrganizationDetail(ProjectAccessRights);
        }
      }
      this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(false);
      this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(false);
      this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(false);
    }
    this.isHelpActivated = menu === Menus.Help;
    this.isNotificationActivated = menu === Menus.Notification;
    let myUrl = url;
    //this.router.navigate([myUrl]);
  }
  closeDocumentView() {
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.designerService.isExtendedIconicView = false;
    this.designerService.changeIsDoubleClicked(false);
    this.designerService.changeIsDocFullView(false);
    this.designerService.LoadAllBlocksDocumentView = false;
    this.designerService.templateDetails = null;
    this.designerService.deliverableDetails = null;
    if (this.designerService.libraryDetails != undefined)
      this.designerService.libraryDetails.id = null;
  }
  isDisabled(menuList): boolean {
    return (menuList.disable) ? true : false;
  }

  adminViewState(adminSwitchStatus) {
    this.adminView = adminSwitchStatus;
    this.activeAdminViewRedirection(adminSwitchStatus);
  }
  selectLanguage(selectedLanguage: any) {
    this.selectedLanguage = selectedLanguage;
    this._locale = this.selectedLanguage;

    //### Save the language to user-preference
    let userPreference =
    {
      'language': selectedLanguage.code
    };
    this.userService.saveUserPreferences(userPreference).subscribe(response => {
      this.translate.use(this.selectedLanguage.code);
      this.treeViewService = new TreeViewService(this.translate);

      let userSetting = this.roleService.getUserRole();
      if (userSetting.userPreferences) {
        userSetting.userPreferences.language = this.selectedLanguage.code;
      } else {
        const newUserPreference = new UserPreference();
        newUserPreference.language = this.selectedLanguage.code;
        userSetting.userPreferences = newUserPreference;
      }
      this.roleService.setUserRole(userSetting);
    });
  }
  get myMenus() { return Menus; }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  AdminUrl(Access) {
    const topMenu = this.topMenus.find((x) => {
      return x.id === Menus.Admin;
    });
    if (Access.isGlobalAdmin) {
      topMenu.url = '/#/pages/admin/adminMain/(usageReportMain//level2Menu:uageReportLevel2Menu//leftNav:leftNav)';
    } else {
      topMenu.url = '/#/pages/admin/adminMain/(countryLibraryMain//level2Menu:CountryLibraryLevel2Menu//leftNav:leftNav)';
    }
  }

  getNotifications(refresh=false) {
    let notificationRequestModel = new NotificationRequestModel();
    this.notificationService.getNotifications(notificationRequestModel,refresh).subscribe((data: any) => {
      this.userService.getNotificationData = data;
      this.notificationGridMenu = data;
      this.notificationMenu = this.notificationHelper.updateNotificationMessage(data.notifications);
      this.messageCount = this.userService.getNotificationData.totalUnreadCount;
    });
  }
  
  notificationClicked() {
    this.router.navigate(['/']);
  }
  updateAllAsRead() {
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
  navigatetoLink(link, menu?: Menus) {
    const selectedTab = this.topMenus.find(item => item.id === menu);
    if (selectedTab) {
      if (!selectedTab.disable) {
        this.router.navigate(link);
        this.selectedMenu = menu;
      }
    } else {
      this.router.navigate(link);
      this.selectedMenu = menu;
    }
    if (menu)
      this.activateMenu(menu);
    return false;
  }

  rejectNotification(notification) {
    notification.NotificationViewModel.isActionRequired = false;
    notification.NotificationViewModel.actionTaken = false;

    this.notificationHelper.updateNotification(notification);
  }
  acceptNotification(notification) {
    notification.NotificationViewModel.isActionRequired = false;
    notification.NotificationViewModel.actionTaken = true;
    this.notificationHelper.acceptNotification(notification);
  }

  private enableApprovalButtons(notification) {
    return notification.NotificationViewModel && notification.NotificationViewModel.isActionRequired &&
      !notification.NotificationViewModel.actionTaken && !notification.NotificationViewModel.actionTakenOn;
  }

  navigate(notification) {
    this.notificationHelper.navigateFromNotification(notification);
  }

  //TODO: Activate in case the idle time out and notification interval changes
  // automaticNotification()
  // {
  //   Observable.interval(ValueConstants.NotificationTimeIntervalInMinutes * 60 * 1000)
  //   .timeInterval().subscribe(c=> this.getNotifications())
  // }
}
