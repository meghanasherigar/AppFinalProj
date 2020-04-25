import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../shared/components/baseComponent';
import { RoleService } from '../../shared/services/role.service';

@Component({
  selector: 'ngx-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent extends BaseComponent implements OnInit, AfterViewInit {

  constructor(roleService: RoleService,
    private sidebarService: NbSidebarService,
    localeService: BsLocaleService,
    translateService: TranslateService) {
    super(roleService, localeService, translateService);
    }

  ngOnInit() {
  }

  toggle() {
    this.sidebarService.toggle(true, 'left');
    return false;
  }
}
