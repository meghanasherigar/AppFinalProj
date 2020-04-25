import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SUPER_ADMIN_MENU_ITEMS } from '../../super-admin-menu';
import { NbMenuItem, NbSidebarService } from '@nebular/theme';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-left-navigation',
  templateUrl: './left-navigation.component.html',
  styleUrls: ['./left-navigation.component.scss']
})
export class LeftNavigationComponent implements OnInit, AfterViewInit, OnDestroy {
  menu: NbMenuItem[] = SUPER_ADMIN_MENU_ITEMS;
  isExpanded = true;

  constructor(
    private translationService: TranslateService,
    private sidebarService: NbSidebarService,
  ) {
    this.translationService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.menu.forEach(element => { this.setTranslation(element); });
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.menu.forEach(item => {
      item.selected = false;
      this.setTranslation(item);
    });
    this.menu[0].selected = true;
  }

  setTranslation(menuItem: NbMenuItem) {
    // tslint:disable-next-line: triple-equals
    if(menuItem == undefined || menuItem == null)
      return;

    this.translationService.get(menuItem.data).subscribe((res: string) =>{
      menuItem.title = res;
    });

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

  ngOnDestroy() {
  }
}
