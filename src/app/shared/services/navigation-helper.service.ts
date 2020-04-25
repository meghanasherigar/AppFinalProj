import { Injectable } from '@angular/core';
import { ShareDetailService } from './share-detail.service';
import { HomeService } from '../../pages/home/home.service';
import { RoleService } from './role.service';
import { DesignerService } from '../../pages/project-design/services/designer.service';
import { CreateInfoService } from '../../pages/project-design/modules/document-view/services/create-info.service';
import { ProjectContext, ProjectAccessRight } from '../../@models/organization';
import { EventConstants, NavigationSource } from '../../@models/common/eventConstants';
import { Menus, SubMenus } from '../../@models/projectDesigner/designer';
import { Router } from '@angular/router';
import { EventAggregatorService } from './event/event.service';
import { BlockDetails } from '../../@models/projectDesigner/block';
import { TemplateViewModel } from '../../@models/projectDesigner/template';
import { DeliverableViewModel } from '../../@models/projectDesigner/deliverable';
import { ValueConstants } from '../../@models/common/valueconstants';

@Injectable({
  providedIn: 'root'
})
export class NavigationHelperService {

  projectDetail = new ProjectContext();

  constructor(private shareDetailService: ShareDetailService,
    private homeService: HomeService, private roleService: RoleService,
    private designerService: DesignerService,
    private router: Router,
    private projectDesignerService: DesignerService,
    private readonly eventService: EventAggregatorService,
    private infoGatheringService: CreateInfoService) { }


  async navigateToInfoRequest(infoReqId, projectId) {
    await this.configureProjectDetails(projectId).then();
    await this.configureProjectUserRights(projectId).then();

    await this.infoGatheringService.getInformationRequestById(infoReqId).toPromise()
      .then((infoReq: any) => {
        this.designerService.infoRequestStatus = String(infoReq.status);
      });
    this.designerService.infoRequestId = infoReqId;
    this.designerService.navigation(NavigationSource.MyTask);
    this.designerService.hideOrShowMenus(Menus.InformationRequest);
    this.designerService.changeTabDocumentView(SubMenus.Editor);
    this.designerService.selectedSubmenus(0);
    this.designerService.selecteMenu(Menus.InformationRequest);
    this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain',
      { outlets: { primary: ['info-request'], level2Menu: ['inforequest-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
  }


  async navigateToExtendedView(projectId, templateId, deliverableId, blockId) {
    await this.configureProjectDetails(projectId).then();
    await this.configureProjectUserRights(projectId).then();

    this.setDesignerServiceBlockReview(blockId, templateId, deliverableId);

    this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  async navigateToDocumentView(projectId, templateId, deliverableId) {
    await this.configureProjectDetails(projectId).then();
    await this.configureProjectUserRights(projectId).then();

    this.setDesignerServiceReportReview(templateId, deliverableId);

    this.designerService.blockList = [];
    this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain/',
      {
        outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] }
      }]);

  }

  private async configureProjectDetails(projectId) {

    await this.homeService.getProjectById(projectId).toPromise()
      .then(response => {
        this.projectDetail.projectId = response.id;
        this.projectDetail.projectName = response.projectName;
        this.projectDetail.fiscalYear = response.fiscalYear;
        this.projectDetail.industry = response.industries;
        this.shareDetailService.setOrganizationDetail(this.projectDetail);
      }).catch();
  }

  private async configureProjectUserRights(projectId) {
    this.homeService.getProjectUserSetting(projectId).toPromise()
      .then((projectSetting) => {
        this.projectDetail.ProjectAccessRight = new ProjectAccessRight();
        this.projectDetail.ProjectAccessRight.isCentralUser = projectSetting.isCentralUser;
        this.projectDetail.ProjectAccessRight.isEntityDataAvailable = projectSetting.isEntityDataAvailable;
        this.projectDetail.ProjectAccessRight.isStaffedUsersDataAvailable = projectSetting.isStaffedUsersDataAvailable;
        this.projectDetail.ProjectAccessRight.isTransactionDataAvailable = projectSetting.isTransactionDataAvailable;

        this.shareDetailService.setOrganizationDetail(this.projectDetail);
        if (projectSetting.isCentralUser) {
          this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
          this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(true);
        }
      });
  }

  private setDesignerServiceBlockReview(blockId, templateId, deliverableId) {
    this.designerService.clear();
    this.designerService.navigation(NavigationSource.MyTask);
    this.designerService.isExtendedIconicView = true;
    this.designerService.isTemplateSection = false;
    this.designerService.isDeliverableSection = false;
    this.designerService.isLibrarySection = false;
    this.designerService.blockDetails = new BlockDetails();

    //This value isn't available in notification
    this.designerService.blockDetails.id = blockId;
    this.designerService.blockDetails.blockId = blockId;
    this.designerService.blockList = [];
    this.designerService.blockList.push(this.designerService.blockDetails);
    this.designerService.isProjectManagement = true;
    this.designerService.selectedSubmenus(SubMenus.Editor);
    this.designerService.hideOrShowMenus(0);
    this.designerService.changeTabDocumentView(SubMenus.Editor);
    this.designerService.changeIsDoubleClicked(true);

    if (templateId && templateId !== '' && templateId !== ValueConstants.DefaultId) {
      this.designerService.isTemplateSection = true;
      this.designerService.isDeliverableSection = false;
      this.designerService.templateDetails = new TemplateViewModel();
      this.designerService.templateDetails.templateId = templateId;

      //this.designerService.templateDetails.templateName = row.associatedDeliverable;
    }

    else if (deliverableId && deliverableId !== '' && deliverableId !== ValueConstants.DefaultId) {
      this.designerService.isDeliverableSection = true;
      this.designerService.isTemplateSection = false;
      this.designerService.deliverableDetails = new DeliverableViewModel();
      this.designerService.deliverableDetails.entityId = deliverableId;
      this.designerService.deliverableDetails.deliverableId = deliverableId;

      // this.designerService.deliverabletemplateDetails= new TemplateViewModel();
      // this.designerService.deliverabletemplateDetails.templateName = row.name;       

      this.designerService.entityDetails = [];
      let entityDetails: any = {};
      entityDetails.entityId = deliverableId;
      this.designerService.entityDetails.push(entityDetails);
    }
  }

  private setDesignerServiceReportReview(templateId, deliverableId) {
    this.designerService.LoadAllBlocksDocumentView = true;
    this.designerService.isExtendedIconicView = false;
    this.designerService.changeIsDoubleClicked(true);
    this.designerService.selectedSubmenus(SubMenus.Editor);
    this.designerService.hideOrShowMenus(0);
    this.designerService.changeTabDocumentView(SubMenus.Editor);
    if (templateId && templateId !== '' && templateId !== ValueConstants.DefaultId) {
      this.designerService.isTemplateSection = true;
      this.designerService.isDeliverableSection = false;
      this.designerService.templateDetails = new TemplateViewModel();
      this.designerService.templateDetails.templateId = templateId;
    }
    else if (deliverableId && deliverableId !== '' && deliverableId !== ValueConstants.DefaultId) {
      this.designerService.isDeliverableSection = true;
      this.designerService.isTemplateSection = false;
      this.designerService.deliverableDetails = new DeliverableViewModel();
      this.designerService.deliverableDetails.entityId = deliverableId;
      this.designerService.deliverableDetails.deliverableId = deliverableId;
      this.designerService.deliverabletemplateDetails = new TemplateViewModel();
      this.designerService.deliverabletemplateDetails.templateName = name;

      this.designerService.entityDetails = [];
      let entityDetails: any = {};
      entityDetails.entityId = deliverableId;
      this.designerService.entityDetails.push(entityDetails);
    }
  }
}
