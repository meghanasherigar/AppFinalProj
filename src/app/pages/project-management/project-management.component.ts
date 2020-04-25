import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventConstants } from '../../@models/common/eventConstants';
import { EventAggregatorService } from '../../shared/services/event/event.service';
import { DesignerService } from '../project-design/services/designer.service';
import { ShareDetailService } from '../../shared/services/share-detail.service';
import { RoleService } from '../../shared/services/role.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../shared/components/baseComponent';

@Component({
  selector: 'ngx-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss']
})
export class ProjectManagementComponent extends BaseComponent implements OnInit, AfterViewInit {

  constructor(roleService: RoleService,
    private router: Router,
    private readonly eventService: EventAggregatorService, 
    private designerService: DesignerService, 
    private sharedService: ShareDetailService,
    localeService: BsLocaleService,
    translateService: TranslateService) {
    super(roleService, localeService, translateService);
    }

  ngOnInit() {
    const addurl = '/#' + this.router.url;
    const currentUrl = addurl.substring(0, addurl.indexOf("("));
    this.eventService.getEvent(EventConstants.ActivateMenu).publish(currentUrl);
  }

}
