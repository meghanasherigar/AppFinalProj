import { Component, OnInit, AfterViewInit} from '@angular/core';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

import { TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../shared/services/role.service';
import { BaseComponent } from '../../shared/components/baseComponent';

@Component({
  selector: 'ngx-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent extends BaseComponent implements OnInit, AfterViewInit {

  constructor(roleService: RoleService, localeService: BsLocaleService,
    translateService: TranslateService) {
      super(roleService, localeService, translateService);
    }

  ngOnInit() {

  }

}
