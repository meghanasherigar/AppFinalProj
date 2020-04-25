import { Component, OnInit } from '@angular/core';
import { SubMenus } from '../../../../../@models/projectDesigner/designer';
import { Router } from '@angular/router';
import { DesignerService } from '../../../services/designer.service';

@Component({
  selector: 'ngx-library-header-menu',
  templateUrl: './library-header-menu.component.html',
  styleUrls: ['./library-header-menu.component.scss']
})
export class LibraryHeaderMenuComponent implements OnInit {
  selectedSubMenu: SubMenus;
  position: any = '';
  defaultMenu:any;
  constructor(private router: Router, private designerService: DesignerService) { }

  ngOnInit() {
   this.defaultMenu=true;
  }
  activateSubMenu(menu: SubMenus) {
    this.selectedSubMenu = menu;
    this.designerService.changeTabDocumentView(menu);
    let libraryPath: string;
    if(this.designerService.isGLobal)
    {
      libraryPath = "globalLibraryMain";
    }
    else
    {
      libraryPath = "countryLibraryMain";
    }
      
    switch (this.selectedSubMenu) {
      case SubMenus.Tasks:
        this.router.navigate(['pages/admin/adminMain', { outlets: { primary: [libraryPath], level2Menu: ['EditorLevel2MenuLibrary'], leftNav: ['leftNav'], topmenu: ['libraryviewtopmenu'] } }]);
        this.defaultMenu=false;
        break;
      case SubMenus.Review:
        this.router.navigate(['pages/admin/adminMain', { outlets: { primary: [libraryPath], level2Menu: ['EditorLevel2MenuLibrary'], leftNav: ['leftNav'], topmenu: ['libraryviewtopmenu'] } }]);
        this.defaultMenu=false;
        break;
      case SubMenus.Layout:
        this.router.navigate(['pages/admin/adminMain', { outlets: { primary: [libraryPath], level2Menu: ['EditorLevel2MenuLibrary'], leftNav: ['leftNav'], topmenu: ['libraryviewtopmenu'] } }]);
        this.defaultMenu=false;
        break;
      case SubMenus.Insert:
        this.router.navigate(['pages/admin/adminMain', { outlets: { primary: [libraryPath], level2Menu: ['EditorLevel2MenuLibrary'], leftNav: ['leftNav'], topmenu: ['libraryviewtopmenu'] } }]);
        this.defaultMenu=false;
        break;
      case SubMenus.Editor:
        this.router.navigate(['pages/admin/adminMain', { outlets: { primary: [libraryPath], level2Menu: ['EditorLevel2MenuLibrary'], leftNav: ['leftNav'], topmenu: ['libraryviewtopmenu'] } }]);
        this.defaultMenu=true;
        break;
    }
  }
  toggleNavbar() { }
  get mySubMenus() { return SubMenus; }
}
