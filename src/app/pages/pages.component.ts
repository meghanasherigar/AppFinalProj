import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { NbMenuItem } from '@nebular/theme';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
      
    </ngx-sample-layout>
  `,
})
export class PagesComponent {
  menu: NbMenuItem[] = MENU_ITEMS;
constructor(private translationService: TranslateService){
  this.translationService.onLangChange.subscribe((event: LangChangeEvent) => {
    this.menu.forEach(element => { this.setTranslation(element); });
    });
    this.menu.forEach(element => { this.setTranslation(element); });
}

setTranslation(menuItem: NbMenuItem) {
// tslint:disable-next-line: triple-equals
  if(menuItem == undefined || menuItem == null)
  return;

  this.translationService.get(menuItem.data).subscribe((res: string) => { menuItem.title = res; });
    if(menuItem.children) {
      menuItem.children.forEach(childElement => {
        this.setTranslation(childElement);
      });
    }
  }
}
