import { Component, AfterViewInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../shared/components/baseComponent';
import { RoleService } from '../../shared/services/role.service';

@Component({
  selector: 'ngx-user',
  template: `
    <router-outlet></router-outlet>
  `,
})
export class UserComponent extends BaseComponent implements AfterViewInit {
  constructor(roleService: RoleService,
    localeService: BsLocaleService,
    translateService: TranslateService) {
   super(roleService, localeService, translateService);
    }

}
