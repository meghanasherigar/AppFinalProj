import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { DesignerService } from '../../../../services/designer.service';
import { DocumentViewAccessRights } from '../../../../../../@models/userAdmin';

@Component({
  selector: 'ngx-manage-template-deliverable',
  templateUrl: './manage-template-deliverable.component.html',
  styleUrls: ['./manage-template-deliverable.component.scss']
})
export class ManageTemplateDeliverableComponent implements OnInit, AfterViewInit {

  projectDetails: ProjectContext;
  canViewDeliverableGenerate: boolean;
  canViewTemplates: boolean;

  constructor(private _eventService: EventAggregatorService,
    private sharedService: ShareDetailService,
    private eleRef: ElementRef,
    private designerService: DesignerService) { }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    if (this.projectDetails.ProjectAccessRight.isCentralUser) {
      this.canViewTemplates = true;
      this.canViewDeliverableGenerate = true;
    }
    else if (!this.projectDetails.ProjectAccessRight.isCentralUser) {
      if (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.hasProjectTemplateAccess) {
        this.canViewTemplates = true;
        this.canViewDeliverableGenerate = true;
      }
      else {
        this.canViewTemplates = false;
        this.canViewDeliverableGenerate = this.checkRoles();
      }
    }
  }

  ngAfterViewInit() {
    if (!this.projectDetails.ProjectAccessRight.isCentralUser) {
      this.disableTabsForUser();
    }
  }

  selectedTab(tab) {
    var payload: any = {};
    payload.action = tab.tabTitle;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.templateSection.manageTemplates).publish(payload);
  }

  checkRoles() {
    if (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.deliverableRole && this.designerService.docViewAccessRights.deliverableRole.length > 0) {
      if (this.designerService.docViewAccessRights.deliverableRole.length > 0)
        return true;
      else
        return false;
    }
    return false;
  }

  /* For Local Uer without "CanGenerate" permission Disable Deliverables and Generate History Tabs
    listItems[0].children[0] : "Templates" ; listItems[0].children[1] : "Deliverables" ; listItems[0].children[2] : "Generation History" 
  */
  disableTabsForUser() {
    var listItems = this.eleRef.nativeElement.getElementsByClassName('tabset');
    if (!this.canViewDeliverableGenerate) {
      listItems[0].children[1].classList.add('home-menu-opacity');
      listItems[0].children[2].classList.add('home-menu-opacity');
    }
    if (!this.canViewTemplates) {
      listItems[0].children[0].classList.add('home-menu-opacity');
    }
  }
}
