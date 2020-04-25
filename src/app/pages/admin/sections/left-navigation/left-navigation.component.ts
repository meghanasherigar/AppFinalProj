import { Component, OnInit, OnDestroy } from '@angular/core';
import {  eventConstantsEnum } from '../../../../../app/@models/common/eventConstants';
import { ADMIN_MENU_ITEMS } from '../../admin-menu';
import { NbMenuItem, NbSidebarService, NbDialogService, NbMenuService } from '@nebular/theme';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LayoutService } from '../../../../@core/utils';
import { Router } from '@angular/router';
import { TermsOfUseComponent } from '../../../../shared/privacyandlegal/terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from '../../../../shared/privacyandlegal/privacy-policy/privacy-policy.component';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { takeWhile } from 'rxjs/operators';
import { DesignerService } from '../../services/designer.service';
import { Subscription } from 'rxjs';
import { LibraryOptions } from '../../../../../app/@models/projectDesigner/block';

import { NbMenuBag } from '@nebular/theme/components/menu/menu.service';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';

@Component({
  selector: 'ngx-left-navigation',
  templateUrl: './left-navigation.component.html',
  styleUrls: ['./left-navigation.component.scss']
})
export class LeftNavigationComponent implements OnInit, OnDestroy {
  menu: NbMenuItem[] = ADMIN_MENU_ITEMS;
  isExpanded = true;
  isExpandedLink = true;
  private alive: boolean = true;
  subscriptions: Subscription = new Subscription();

  constructor(private translationService: TranslateService,
    private sidebarService: NbSidebarService,
    private router: Router,
    private readonly _eventService: EventAggregatorService,
    private layoutService: LayoutService,
    private dialogService: NbDialogService,
    private sharedService: ShareDetailService,
    private menuService: NbMenuService,
    private designerService: DesignerService,
    private nbMenuService: NbMenuService) {

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
  }

  ngOnInit() {
    this.menu[2].expanded = false;
    this.sharedService.changeHidefooter(false);
  }

  ngAfterViewInit() {
    const currentUrl = '/#' + this.router.url;
    this.menu.forEach((item, indexi) => {
      item.selected = false;
      this.setTranslation(item);
      if (item.children && item.children.length > 0) {
        item.children.forEach((subItem, indexj) => {
          subItem.selected = false;
          this.setTranslation(subItem);
          if(currentUrl === subItem['ddUrl']) {
            this.menu[indexi].selected = true;
            this.menu[indexi].expanded = true;
            this.menu[indexi].children[indexj].selected = true;
          } else {
            this.menu[indexi].expanded = false;
            this.menu[indexi].children[indexj].selected = false;
          }
        })
      } else if(currentUrl === item['ddUrl']) {
        this.menu[indexi].selected = true;
      }
    });
    // this.menu[0].selected = true;
  }

  activateMenu(selectedItem: NbMenuItem) {
    let atleastOneChildActive = false;
    this.menu.forEach((item, indexi) => {
      item.selected = false;
      atleastOneChildActive = false;
      if (item.children && item.children.length > 0) {
        item.children.forEach((subItem, indexj) => {
          subItem.selected = false;
          if(selectedItem.data === subItem.data) {
            this.menu[indexi].selected = true;
            this.menu[indexi].expanded = true;
            atleastOneChildActive = true;
            this.menu[indexi].children[indexj].selected = true;
            if(subItem.title==LibraryOptions.Countrylibrary||subItem.title==LibraryOptions.Globallibrary){
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.selectedAdminLibaryDropdown).publish(subItem.title);
            }
          } else {
            this.menu[indexi].expanded = atleastOneChildActive;
            this.menu[indexi].children[indexj].selected = false;
          }
        });
      } else if(selectedItem.data === item.data) {
        this.menu[indexi].selected = true;
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
    this.alive = false;
    this.sharedService.changeHidefooter(true);
    this.subscriptions.unsubscribe();
  }
}
