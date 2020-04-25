import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbMenuItem, NbSidebarService, NbDialogService, NbMenuService } from '@nebular/theme';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PROJECT_SETUP_MENU_ITEMS, DDMenuItem } from '../project-setup-menu';
import { LayoutService } from '../../../@core/utils';
import { Router } from '@angular/router';
import { PrivacyPolicyComponent } from '../../../shared/privacyandlegal/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from '../../../shared/privacyandlegal/terms-of-use/terms-of-use.component';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { UserUISetting } from '../../../@models/user';
import { StorageService, StorageKeys } from '../../../@core/services/storage/storage.service';
import { UserService } from '../../user/user.service';
import { NbMenuBag } from '@nebular/theme/components/menu/menu.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-left-navigation',
  templateUrl: './left-navigation.component.html',
  styleUrls: ['./left-navigation.component.scss']
})
export class LeftNavigationComponent implements OnInit, OnDestroy {
  menu: NbMenuItem[] = PROJECT_SETUP_MENU_ITEMS;
  isExpanded=true;
  Show = true;
  userUISetting: UserUISetting;
  subscriptions: Subscription = new Subscription();

  constructor(private translationService: TranslateService,
    private router: Router,
    private sidebarService: NbSidebarService,
    private layoutService: LayoutService,
    private dialogService: NbDialogService,
    private sharedService: ShareDetailService,
    private storageService: StorageService, private userservice: UserService,
    private nbMenuService: NbMenuService) {

     this.subscriptions.add(this.nbMenuService.onItemClick()
      .subscribe((bag: NbMenuBag) => {
        if(bag.item['ddData']) {
          this.router.navigate(bag.item['ddData']);
          this.activateMenu(bag.item);
        }
      }));

  this.userUISetting = new UserUISetting();
  this.translationService.onLangChange.subscribe((event: LangChangeEvent) => {
    this.menu.forEach(element => { this.setTranslation(element); });
    });
    this.menu.forEach(element => { this.setTranslation(element); });
}
activateMenu(selectedItem: NbMenuItem) {
  this.menu.forEach((item, index) => {
    if(item.data === selectedItem.data) {
      item.selected = true;
      this.menu[index].selected = true;
    } else {
      item.selected = false;
    }
  });
}
ngOnInit() {   
  this.sharedService.changeHidefooter(false);

  this.userUISetting = this.userservice.getCurrentUserUISettings();

  if(!this.userUISetting.isLeftNavigationExpanded){
  this.isExpanded = !this.isExpanded;
  this.sidebarService.toggle(true, 'left');
   return false;
  }
}

ngAfterViewInit(){
  this.menu.forEach((item, index) => {
    const addurl = '/#' + this.router.url;
    if(item['ddUrl'] === addurl) {
      item.selected = true;
      this.menu[index].selected = true;
    } else { 
      item.selected = false;
    }
  });
}

setTranslation(menuItem: NbMenuItem) {
// tslint:disable-next-line: triple-equals
  if(menuItem == undefined || menuItem == null)
  return;

  this.translationService.get(menuItem.data).subscribe((res: string) => { menuItem.title = res; });
    if (menuItem.children) {
      menuItem.children.forEach(childElement => {
        this.setTranslation(childElement);
      });
    }
  }
  toggle() {

    if(this.userUISetting.isLeftNavigationExpanded)
      this.userUISetting.isLeftNavigationExpanded =false;
    else
    this.userUISetting.isLeftNavigationExpanded = true;
 
    
    this.userservice.updateCurrentUserUISettings(this.userUISetting);
    this.isExpanded = !this.isExpanded;
    this.sidebarService.toggle(true, 'left');
     return false;
    }
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    //this.sidebarService.toggle(true, 'left');
     return false;
  }

  generatePrivacyPolicy() {
    this.dialogService.open(PrivacyPolicyComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    return false;
  }
  generateTermsofUse() {
    this.dialogService.open(TermsOfUseComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    return false;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.sharedService.changeHidefooter(true);
  }
 
}
