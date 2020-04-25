import { defineLocale } from 'ngx-bootstrap/chronos';
import * as locales from 'ngx-bootstrap/locale';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../shared/services/role.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker/ngx-bootstrap-datepicker';
import { AfterViewInit } from '@angular/core';
import * as moment from 'moment';

function defineLocales() {
  for (const locale in locales) {
      defineLocale(locales[locale].abbr, locales[locale]);
  }
}
defineLocales();

export class BaseComponent implements AfterViewInit {

    constructor(protected roleService: RoleService,
        protected localeService: BsLocaleService,
        protected translateService: TranslateService) {
        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
          this.localeService.use(this.translateService.currentLang.toLowerCase());
          moment.locale(this.translateService.currentLang.toLowerCase());
          });
      }

      ngAfterViewInit() {
        const userSettings = this.roleService.getUserRole();
        const userLanguage = userSettings && userSettings.userPreferences ? 
        userSettings.userPreferences.language
        : 'en-US';
        this.localeService.use(userLanguage.substring(0, 2));
        moment.locale(userLanguage.substring(0, 2));
        // console.log("notif after view init: " + userLanguage.substring(0, 2));
      }
}
