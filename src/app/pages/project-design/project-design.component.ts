import { Component, OnInit, AfterViewInit } from '@angular/core';
import { StorageService } from '../../@core/services/storage/storage.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { EventConstants } from '../../@models/common/eventConstants';
import { EventAggregatorService } from '../../shared/services/event/event.service';
import { ProjectContext } from '../../@models/organization';
import { ShareDetailService } from '../../shared/services/share-detail.service';
import { HomeService } from '../home/home.service';
import { BaseComponent } from '../../shared/components/baseComponent';
import { RoleService } from '../../shared/services/role.service';

@Component({
  selector: 'ngx-project-design',
  templateUrl: './project-design.component.html',
  styleUrls: ['./project-design.component.scss']
})
export class ProjectDesignComponent extends BaseComponent implements OnInit, AfterViewInit {

  constructor(roleService: RoleService,
    private storageService: StorageService,
    private router: Router, 
    private homeService: HomeService,
    localeService: BsLocaleService, 
    private readonly eventService: EventAggregatorService,
    private shareDetailService: ShareDetailService,
    translateService: TranslateService) {
    super(roleService, localeService, translateService);
    }

  ngOnInit() {
    const addurl = '/#' + this.router.url;
    const currentUrl = addurl.substring(0, addurl.indexOf("("));
    this.eventService.getEvent(EventConstants.ActivateMenu).publish(currentUrl);
    this.eventService.getEvent(EventConstants.ProjectInContext).publish(true);
  }

}
