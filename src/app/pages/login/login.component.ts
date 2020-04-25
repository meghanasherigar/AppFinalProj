import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service'
import { Router, ActivatedRoute } from '@angular/router';
import { AppliConfigService } from '../../shared/services/appconfig.service';
import { Guid } from "guid-typescript";
import { userContext } from '../../@models/common/valueconstants';
import { StorageKeys, StorageService } from '../../@core/services/storage/storage.service';
import { Menus, SubMenus } from '../../@models/projectDesigner/designer';
import { DesignerService } from '../project-design/services/designer.service';
import { NavigationSource } from '../../@models/common/eventConstants';
import { ProjectContext, ProjectAccessRight } from '../../@models/organization';
import { SessionStorageService } from '../../@core/services/storage/sessionStorage.service';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoginError: boolean = false;
  _cookieValue: string;
  _timeStamp: string;
  public id: Guid;
  public apiGet: string;
  public guidwithTimeStamp: string;
  @ViewChild('loginForm') loginForm: ElementRef;
  @ViewChild('cookies') cookies: ElementRef;
  dpassURI: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private appConfig: AppliConfigService,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private designerService: DesignerService,
    private storrageService: StorageService,
    private sessionStorageService: SessionStorageService,
  ) { }

  ngOnInit() {
    //redirecturl-from-email
    this.activatedRoute.queryParams.subscribe(params => {
      if (params) {
        const redirectId = params[StorageKeys.REDIRECTURLID];
        if (redirectId && redirectId != "") {
          this.sessionStorageService.addItem(StorageKeys.REDIRECTURLID, redirectId)
        }
      }
    });

    this.dpassURI = this.authService.getDpassPostCallURI();
    if (this.appConfig.useDpassLogin()) {
      if (this.authService.isLoggedIn() && this.authService.isCurrentUserExist() && !this.authService.isTokenExpired()) {
         //redirecturl-from-email
        if (this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) != null) {
          this.getProjectDetailsForRedirectUrl();
        } else {
          this.router.navigate(['pages/home']);
        }
      } else {
        
        if (this.storrageService.getItem(userContext.userContextId) == null) {
          this.id = Guid.create();
          this._timeStamp = new Date().toLocaleString();
          this._timeStamp = this._timeStamp.replace(/[^\w\s]/gi, '');
          this._timeStamp = this._timeStamp.replace(" ", '');
          this._timeStamp = this._timeStamp.replace("AM", '');
          this._timeStamp = this._timeStamp.replace("PM", '');
          this.guidwithTimeStamp = this.id.toString() + this._timeStamp.toString();
          this.storrageService.addItem(userContext.userContextId, this.guidwithTimeStamp.trim());
        } else {
          this.guidwithTimeStamp = this.storrageService.getItem(userContext.userContextId);
        }
      }
    } else {
      if (!this.appConfig.UseAAALogin() || this.authService.isLoggedIn()) {
        this.router.navigate(['iot-dashboard']);
      }
    }
  }

  ngAfterViewInit() {
    const currentUser = this.storrageService.getItem(userContext.userStorageKey);
    if(currentUser && !this.authService.isTokenExpired()) {
      this.authService.loadUserDpass();
      //redirecturl-from-email
      if (this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) == null) {
        this.router.navigate(['pages/home']);
      }
    } else {
      if (this.guidwithTimeStamp != null || this.guidwithTimeStamp == "") {
        this.cookies.nativeElement.value = this.guidwithTimeStamp.trim();
        this.loginForm.nativeElement.submit();
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
  

}
