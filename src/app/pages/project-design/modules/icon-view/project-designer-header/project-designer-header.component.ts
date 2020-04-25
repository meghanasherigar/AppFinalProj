import { Component, OnInit, OnDestroy } from '@angular/core';
import { DesignerService } from '../../../services/designer.service';
import { ShareDetailService } from '../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../@models/organization';
import { DocumentViewAccessRights } from '../../../../../@models/userAdmin';
import { SubMenus } from '../../../../../@models/projectDesigner/designer';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionStorageService } from '../../../../../@core/services/storage/sessionStorage.service';
import { StorageKeys } from '../../../../../@core/services/storage/storage.service';

enum Menus {
  Block = 1,
  Templates_Deliverables,
  Appendices,
  InformationRequest
}

@Component({
  selector: 'ngx-project-designer-header',
  templateUrl: './project-designer-header.component.html',
  styleUrls: ['./project-designer-header.component.scss']
})
export class ProjectDesignerHeaderComponent implements OnInit, OnDestroy {
  position: any = '';
  selectedMenu: Menus;
  selectedSubMenu: SubMenus;
  isDocumnetViewDoubleClick: boolean;
  isDocFullViewEnabled: boolean;
  disableInfoReq:boolean=false;
  disableTab: boolean;
  hideOrShowMenus: boolean;
  isAppendixTabDisable: boolean;
  isUrlRedirectActive : boolean = false;
  projectDetails: ProjectContext;
  subscriptions: Subscription = new Subscription();
  constructor(private designerService: DesignerService,
    private sharedService: ShareDetailService, private router: Router, private sessionStorageService: SessionStorageService) { }
  
    ngOnInit() {
      if (this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) !== null) {
        this.isUrlRedirectActive = true;
      } else {
        this.isUrlRedirectActive = false;
      }
      this.projectDetails = this.sharedService.getORganizationDetail();
      this.selectedMenu = Menus.Block;
      this.designerService.hideShowMenu.subscribe((hideOrShow) => { this.hideShowMenus(hideOrShow); })
      this.designerService.currentDoubleClicked.subscribe(isDoubleClicked => this.isDocumnetViewDoubleClick = isDoubleClicked);
      this.designerService.isDocFullViewEnabled.subscribe(docFullView => { this.isDocFullViewEnabled = docFullView });
      this.designerService.disableInfoReqTab.subscribe(disable => { this.disableInfoReq = disable });
  
      if (this.projectDetails.ProjectAccessRight.isCentralUser)
        this.disableTab = false;
      else if (!this.projectDetails.ProjectAccessRight.isCentralUser) {
        if (this.checkIsInRoles(DocumentViewAccessRights.CanGenerate) || (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.hasProjectTemplateAccess))
          this.disableTab = false;
        else
          this.disableTab = true;
      }
      this.isAppendixTabDisable = this.projectDetails.ProjectAccessRight.isCentralUser ? false :
        (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.hasProjectTemplateAccess) ? false : true;
  
      this.designerService.selectedSubMenuTab.subscribe(submenu => {
        this.selectMenuSubMenu(submenu);
      });
  
      this.designerService.selectedMenu.subscribe(menus => {
        if (menus !== 0) {
          this.selectedMainMenu(menus);
        }
  
      });
  
      this.designerService.selectedSubMenus.subscribe(submenus => {
        if (submenus !== 0) {
          this.selectedSubMenus(submenus);
        }
      });

      // this.designerService.selectedSubMenus.subscribe(submenus => {
      //  if (submenus == 0) {
      //    this.selectedSubMenus(submenus);
      //   }
      // })
      // let menu = this.designerService.selectedDesignerTab.source['value'];
      // this.selectMenuSubMenu(menu);
    }

    hideShowMenus(menu: Menus) {
      switch (menu) {
        case Menus.InformationRequest:
          this.hideOrShowMenus = false;
          break;
        default:
          this.hideOrShowMenus = true;
      }
    }

  activateMenu(menu: Menus) {
    this.selectedMenu = menu;
    this.designerService.selectedSubmenus(0);
    this.designerService.selectedDocTab = menu;
    const enableMenu = (menu === Menus.InformationRequest) ? Menus.InformationRequest : 0; 
    this.designerService.hideOrShowMenus(enableMenu);
      this.designerService.selecteMenu(menu);
    if (menu === Menus.Block) {
      this.activateSubMenu(0);
      this.closeDocumentView();

    } else {
      switch (this.selectedMenu) {
        case Menus.Templates_Deliverables:
          this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['managetemplatedeliverable'], level2Menu: ['templatelevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
          break;
        case Menus.InformationRequest:
          this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-request'], level2Menu: ['inforequest-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
          break;
        case Menus.Appendices:
          this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['manageappendices'], level2Menu: ['appendiceslevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
          break;
        default:
          this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['iconViewRegion'], level2Menu: ['iconViewLevel2Menu'], topmenu: ['iconviewtopmenu'] } }]);
          break;

      }
    }
  }
  closeDocumentView() {
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.designerService.reportblockList = [];
    this.designerService.isExtendedIconicView = false;
    this.designerService.changeIsDoubleClicked(false);
    this.designerService.changeIsDocFullView(false);
    this.designerService.LoadAllBlocksDocumentView = false;
    this.designerService.deliverableDetails = null;
    this.designerService.templateDetails = null;
    if(this.designerService.libraryDetails != undefined)
    this.designerService.libraryDetails.id = null;
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['iconViewRegion'], level2Menu: ['iconViewLevel2Menu'], topmenu: ['iconviewtopmenu'] } }]);
  }
  activateSubMenu(menu: SubMenus) {
    this.designerService.hideOrShowMenus(0);
    if(menu != SubMenus.InformationRequest ) 
       this.designerService.disableInfoReqTab.next(true);
    else
        this.designerService.disableInfoReqTab.next(false);
    this.selectedSubMenu = menu;
    //Sub-menu value which is subscribed in editor-region to load menu data properly
    this.designerService.changeTabDocumentView(menu);
    this.designerService.selectedSubmenus(menu);
    this.designerService.selectedDocTab = menu;
    switch (this.selectedSubMenu) {
      case SubMenus.Tasks:
        this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['tasklevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
        break;
      case SubMenus.InformationRequest:
        // if (this.designerService.isDocFullViewEnabled)
        if(this.isDocFullViewEnabled){ this.designerService.changeIsDocFullView(true); }
        this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-list'], level2Menu: ['info-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
        break;
      case SubMenus.Review:
        this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['reviewlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
        break;
      case SubMenus.Layout:
        this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['layoutlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
        break;
      case SubMenus.Insert:
        this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['insertlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
        break;
      case SubMenus.Editor:
        this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
        break;
      // case SubMenus.AnswerTag:
      //   this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { level2Menu: ['answer-level2-menu'], topmenu: ['iconviewtopmenu'] } }], { replaceUrl: true} );
      //   break;
    }
  }



  get myMenus() { return Menus; }
  get mySubMenus() { return SubMenus; }

  selectedMainMenu(currentmenu) {
    switch (currentmenu) {
      case 1:
        this.selectedMenu = Menus.Block;
        this.selectedSubMenu = 0;
        break;
      case 2:
        this.selectedMenu = Menus.Templates_Deliverables;
        this.selectedSubMenu = 0;
        break;
      case 3:
        this.selectedMenu = Menus.Appendices;
        this.selectedSubMenu = 0;
        break;
      case 4:
        this.selectedMenu = Menus.InformationRequest;
        this.selectedSubMenu = 0;
        break;
      default:
        this.selectedMenu = Menus.Block;
        this.selectedSubMenu = SubMenus.Editor;
        break;
    }
  }

  selectedSubMenus(currentsubmenu: SubMenus) {

    switch (currentsubmenu) {
      case 1:
        this.selectedMenu = 0;
        this.selectedSubMenu = SubMenus.Editor;
        break;
      case 2:
        this.selectedMenu = 0;
        this.selectedSubMenu = SubMenus.Insert;
        break;
      case 3:
        this.selectedMenu = 0;
        this.selectedSubMenu = SubMenus.Layout;
        break;
      case 4:
        this.selectedMenu = 0;
        this.selectedSubMenu = SubMenus.Review;
        break;
      case 5:
        this.selectedMenu = 0;
        this.selectedSubMenu = SubMenus.Tasks;
        break;
      case 6:
        this.selectedMenu = 0;
        this.selectedSubMenu = SubMenus.InformationRequest;
        break;
      case 7:
        this.selectedMenu = 0;
        this.selectedSubMenu = SubMenus.AnswerTag;
        break;
      case 8:
        this.selectedMenu = 0;
        this.selectedSubMenu = SubMenus.ViewAbbreviations;
        break;
      default:
        this.selectedMenu = Menus.Block;
        this.selectedSubMenu = SubMenus.Editor;
        break;
    }
  }

  selectMenuSubMenu(menu: SubMenus) {
    switch (menu) {
      case 1:
        this.selectedMenu = Menus.Block;
        this.selectedSubMenu = SubMenus.Editor;
        break;
      default:
        this.selectedMenu = Menus.Block;
        this.selectedSubMenu = SubMenus.Editor;
        break;
    }
  }

  checkIsInRoles(roleToCompare) {
    if (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.deliverableRole && this.designerService.docViewAccessRights.deliverableRole.length > 0) {
      if (this.designerService.docViewAccessRights.deliverableRole.filter(e => e.roles.filter(x => x == roleToCompare)))
        return true;
      else
        return false;
    }
    return false;
  }
  toggleNavbar() {}
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
