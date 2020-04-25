import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

import { TranslateService } from '@ngx-translate/core';
import { DesignerService } from '../project-design/services/designer.service';
import { BaseComponent } from '../../shared/components/baseComponent';
import { RoleService } from '../../shared/services/role.service';

@Component({
  selector: 'ngx-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(roleService: RoleService,
    private sidebarService: NbSidebarService,
    localeService: BsLocaleService,
    translateService: TranslateService,
    private designerServiceProjDesign: DesignerService) {
      super(roleService, localeService, translateService);
    }

  ngOnInit() {
  }

  toggle() {
    this.sidebarService.toggle(true, 'left');
    return false;
  }

  ngOnDestroy() {
    this.designerServiceProjDesign.isLibrarySection = false;
  }

}
