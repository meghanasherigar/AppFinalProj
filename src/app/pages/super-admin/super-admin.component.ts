import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { RoleService } from '../../shared/services/role.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { DesignerService } from '../project-design/services/designer.service';
import { BaseComponent } from '../../shared/components/baseComponent';

@Component({
  selector: 'ngx-super-admin',
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.scss']
})
export class SuperAdminComponent extends BaseComponent implements OnInit, AfterViewInit {

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

}
