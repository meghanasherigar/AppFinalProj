import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { Router } from '@angular/router';
import { EventAggregatorService } from '../../shared/services/event/event.service';
import { EventConstants } from '../../@models/common/eventConstants';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BaseComponent } from '../../shared/components/baseComponent';
import { RoleService } from '../../shared/services/role.service';
import { DesignerService } from '../project-design/services/designer.service';
import { ShareDetailService } from '../../shared/services/share-detail.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-project-setup',
  templateUrl: './project-setup.component.html',
  styleUrls: ['./project-setup.component.scss']
})
export class ProjectSetupComponent extends BaseComponent implements OnInit, AfterViewInit {

  constructor(roleService: RoleService, private sidebarService: NbSidebarService,
    private router: Router, private designerService: DesignerService,
    private sharedService: ShareDetailService,
    private readonly eventService: EventAggregatorService, localeService: BsLocaleService,
    translateService: TranslateService) {
    super(roleService, localeService, translateService);
    }

  ngOnInit() {
    const addurl = '/#' + this.router.url;
    const currentUrl = addurl.substring(0, addurl.indexOf("("));
    this.eventService.getEvent(EventConstants.ActivateMenu).publish(currentUrl);
    this.eventService.getEvent(EventConstants.ProjectInContext).publish(true);
  }

  toggle() {
    this.sidebarService.toggle(true, 'left');
    return false;
  }
}
