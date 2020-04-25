import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProjectManagementService } from '../services/project-management.service';
import { Menus } from '../@models/common/Project-Management-menu';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-project-management-header',
  templateUrl: './project-management-header.component.html',
  styleUrls: ['./project-management-header.component.scss']
})
export class ProjectManagementHeaderComponent implements OnInit {
  position: any = '';
  selectedMenu: Menus;
  subscription: Subscription;

  constructor(private translate: TranslateService,
    private managementService: ProjectManagementService,
    private router: Router) {
    this.subscription = new Subscription();
  }

  get myMenus() { return Menus; }

  ngOnInit() {
    this.subscription.add(
      this.managementService.currentSelectedMenu.subscribe(currenTab => {
        this.selectedMenu = currenTab;
      }));
  }

  activateMenu(menu: Menus) {
    this.managementService.changeCurrentTab(menu);
    if(menu === Menus.Block) {  this.managementService.changeCurrentDeliverable(''); }
  }
  navigatetoLink(link, menu?: Menus) {
    this.router.navigate(link);
    if (menu)
      this.activateMenu(menu);
    return false;
  }
  toggleNavbar() {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
