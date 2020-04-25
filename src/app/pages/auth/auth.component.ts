import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service'
import { UserService } from '../../pages/user/user.service';
import { StorageService, StorageKeys } from '../../@core/services/storage/storage.service';
import { SessionStorageService } from '../../@core/services/storage/sessionStorage.service';
import { RoleService } from '../../shared/services/role.service';
import { Roles } from '../../@models/roles/roles';
import { EventAggregatorService } from '../../shared/services/event/event.service';
import { EventConstants } from '../../@models/common/eventConstants';
import { NgLocalization } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AppliConfigService } from '../../shared/services/appconfig.service';
import { Location } from '@angular/common';
import { TokenDetails, UserUISetting } from '../../@models/user';
import { ShareDetailService } from '../../shared/services/share-detail.service';
import { HttpErrorResponse } from '@angular/common/http';
import { userContext } from '../../@models/common/valueconstants';
import { ProjectContext, ProjectAccessRight } from '../../@models/organization';
import { Menus, SubMenus } from '../../@models/projectDesigner/designer';
import { DesignerService } from '../project-design/services/designer.service';
@Component({
  selector: 'ngx-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private storageService: StorageService,
    private sessionStorageService: SessionStorageService,
    private authService: AuthService,
    private userService: UserService,
    private roleService: RoleService,
    private readonly eventService: EventAggregatorService,
    private appConfig: AppliConfigService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private sharedDetailService: ShareDetailService,
    private designerService: DesignerService,

  ) {
  }

  ngOnInit() {
    if (!this.appConfig.useDpassLogin()) {
      this.subscriptions.add(this.eventService.getEvent(EventConstants.UserDataCallBack).subscribe((action) => {
        if (action === 'redirection') {
          //this.getUserSettings();
        }
      }));
    } else {
      this.activatedRoute.queryParams.subscribe(async params => {
        const id_token = params['id_token'];
        const client_id = params['client_id'];
        await this.getRegerateToken(id_token, client_id);
      });

    }
  }
  async getRegerateToken(id_token, client_id) {
    let currentUser = this.storageService.getItem(userContext.userStorageKey);
    if (currentUser == null) {
        this.storageService.addItem(userContext.userContextValue, client_id)
        let tokendetails = new TokenDetails();
        tokendetails.contextId = this.storageService.getItem(userContext.userContextId) + ":" + client_id;
        tokendetails.identityToken = id_token;
        await this.authService.regenerateToken(tokendetails).then(response => {
          if (response) {
            this.storageService.addItem(userContext.userStorageKey, JSON.stringify(response));
            this.authService.loadUserDpass();
            this.loadUserDetailsDpass();
          } else {
            this.authService.logout();
            window.open(this.location.path.name + '/assets/static-pages/unauthorizeduser-en.html', '_self');
          }
        }).catch(error => {
          this.authService.logout();
          // this.router.navigate(['login'], { replaceUrl: true }).catch (error1 => {
          //   console.log(error1);
          // });
          console.error(error);
        });
    } else {
      if (currentUser && !this.authService.isTokenExpired) {
        this.authService.loadUserDpass();
        this.getAndSetUserRoles();
      } else {
        this.authService.logout();
        this.router.navigate(['login'], { replaceUrl: true }).catch (error => {
          console.log(error);
        });
      }
    }
  }
  loadUserDetailsDpass() {
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
                this.getAndSetUserRoles();
            }, (error) => {
                return Observable.throw('Error: Failed to get userSettings for user');
            });
        }, (error: HttpErrorResponse) => {
            if (error.status === 403) {
                this.storageService.clearAll();
                this.sessionStorageService.clearAll();
                window.open(this.location.path.name + '/assets/static-pages/unauthorizeduser-en.html', '_self');
            }
            return Observable.throw('Error: Failed to get userSettings for user');
        });
    }
}
  getAndSetUserRoles() {
    if (this.authService.isLoggedIn()) {
      //redirecturl-from-email
      if (this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) != null) {
        this.getProjectDetailsForRedirectUrl();
      } else {
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
        }
        else {
          console.log('Error: Failed to load user roles');
        }
      }

    }
  }
  getProjectDetailsForRedirectUrl() {
    this.authService.getUrlRedirect(this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID)).subscribe((data)  => {
      if (data) {
        let projectContext = new ProjectContext();
        projectContext = data;
        projectContext.ProjectAccessRight = new ProjectAccessRight();
        projectContext.ProjectAccessRight = data.projectAccessRight;
        this.sessionStorageService.addItem(StorageKeys.PROJECTINCONTEXT, JSON.stringify(projectContext));
      
        this.designerService.hideOrShowMenus(Menus.InformationRequest);
        this.designerService.changeTabDocumentView(SubMenus.Editor);
        this.designerService.selectedSubmenus(0);
        this.designerService.selecteMenu(Menus.InformationRequest);
        this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-request'], level2Menu: ['inforequest-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
      }
    });
  }

  getUserSettings() {
    this.userService.getUserSettings().subscribe((userSetting) => {
      userSetting.adminView = false;
      this.setCurrentUserRole(userSetting);
      if (!userSetting.isWhatsNewHidden) {
        if (userSetting.whatsNewVisitCount <= 5) {
          this.router.navigate(['pages/./home/whatsnew']);
        } else {
          this.router.navigate(['pages/home']);
        }
      } else if (userSetting.isWhatsNewHidden) {
        this.router.navigate(['pages/./home/whatsnew']);
      }
    }, (error) => {
    });
  }
  setCurrentUserRole(userRole) {
    if (userRole.isCountryAdmin || userRole.isGlobalAdmin) {
      this.roleService.setUserRole(userRole);
    } else {
      userRole.isPorjectUser = true;
      this.roleService.setUserRole(userRole);
    }
  }
}
