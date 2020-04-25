import { Component, OnInit, OnDestroy } from '@angular/core';

import { HELP_MENU_ITEMS } from '../../help-menu';
import { NbMenuItem, NbSidebarService, NbDialogService, NbMenuService } from '@nebular/theme';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LayoutService } from '../../../../@core/utils';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { PrivacyPolicyComponent } from '../../../../shared/privacyandlegal/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from '../../../../shared/privacyandlegal/terms-of-use/terms-of-use.component';
import { Subscription } from 'rxjs';
import { NbMenuBag } from '@nebular/theme/components/menu/menu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-left-navigation',
  templateUrl: './left-navigation.component.html',
  styleUrls: ['./left-navigation.component.scss']
})
export class LeftNavigationComponent implements OnInit, OnDestroy {
  menu: NbMenuItem[] = HELP_MENU_ITEMS;
  isExpanded = true;
  isExpandedLink = true;
  subscriptions: Subscription = new Subscription();
  constructor(private translationService: TranslateService,
    private sidebarService: NbSidebarService,
    private layoutService: LayoutService,
    private dialogService: NbDialogService,
    private sharedService: ShareDetailService,
    private nbMenuService: NbMenuService,
    private router: Router) {

      this.subscriptions.add(this.nbMenuService.onItemClick()
      .subscribe((bag: NbMenuBag) => {
        if(bag.item['ddData']) {
          this.router.navigate(bag.item['ddData']);
          this.activateMenu(bag.item);
        }
      }));
      this.translationService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.menu.forEach(element => { this.setTranslation(element); });
    });
    this.menu.forEach(element => { this.setTranslation(element); });
  }

  ngOnInit() {
    this.sharedService.changeHidefooter(false);
  }

  ngAfterViewInit() {
    this.menu.forEach(item => {
      item.selected = false;
    });
    this.menu[0].selected = true;
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

  setTranslation(menuItem: NbMenuItem) {
    // tslint:disable-next-line: triple-equals
    if (menuItem == undefined || menuItem == null)
      return;

    this.translationService.get(menuItem.data).subscribe((res: string) => { menuItem.title = res; });
    if (menuItem.children) {
      menuItem.children.forEach(childElement => {
        this.setTranslation(childElement);
      });
    }
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    this.sidebarService.toggle(true, 'left');
    return false;
  }
  toggleExpand() {
    this.isExpandedLink = !this.isExpandedLink;
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
    this.sharedService.changeHidefooter(true);
    this.subscriptions.unsubscribe();
  }
}
