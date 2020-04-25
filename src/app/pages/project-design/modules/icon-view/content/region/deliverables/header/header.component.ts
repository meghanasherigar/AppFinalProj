import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { DeliverableDropDownResponseViewModel, DeliverablesInput, EntityViewModel, SearchDeliverableViewModel } from '../../../../../../../../@models/projectDesigner/deliverable';
import { Subscription, Subject } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { viewAttributeModel, regions } from '../../../../../../../../@models/projectDesigner/common';
import { EventConstants, eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../../../services/designer.service';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { CreateBlockAttributesComponent } from '../../../../manage-blocks/create-block-attributes/create-block-attributes.component';
import { CreateStackAttributesComponent } from '../../../../manage-stacks/create-stack-attributes/create-stack-attributes.component';
import { NbDialogService } from '@nebular/theme';
import { ActionOnBlockStack, BlockDetailsResponseViewModel } from '../../../../../../../../@models/projectDesigner/block';
import { projectIcons, blockSelectedModel } from '../../../../../../../../@models/projectDesigner/block';
import { FilterBlockPopoverComponent } from '../../../../manage-blocks/filter-block-popover/filter-block-popover.component';
import { FilterDeliverablePopoverComponent } from '../../../../manage-blocks/filter-deliverable-popover/filter-deliverable-popover.component';
import { ViewBlockAttributesPopoverComponent } from '../../../../manage-blocks/view-block-attributes-popover/view-block-attributes-popover.component';
import { ViewStackAttributesPopoverComponent } from '../../../../manage-stacks/view-stack-attributes-popover/view-stack-attributes-popover.component';
import { AssignToComponent } from '../../templates/assign-to/assign-to.component';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { TemplateAndBlockDetails, TemplateViewModel, TemplateDetailsRequestModel, TemplateDeliverableViewModel } from '../../../../../../../../@models/projectDesigner/template';
import { TreeviewItem, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection, TreeviewConfig } from 'ngx-treeview';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectUserService } from '../../../../../../../admin/services/project-user.service';
import { ProjectDeliverableRightViewModel, DeliverableRoleViewModel } from '../../../../../../../../@models/userAdmin';
import { TemplateService } from '../../../../../../services/template.service';
import { ProjectContext } from '../../../../../../../../@models/organization';
import * as moment from 'moment';
import { ValueConstants } from '../../../../../../../../@models/common/valueconstants';
import { SubMenus } from '../../../../../../../../@models/projectDesigner/designer';


@Component({
  selector: 'ngx-deliverables-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          switch (selection.checkedItems.length) {
            case 0:
              return 'Deliverables';
            case 1:
              return selection.checkedItems[0].text;
            default:
              return selection.checkedItems.length + " options selected";
          }
        }
      })
    }
  ],
})
export class DeliverablesHeaderComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  templateDeliverableList:any;
  projectID: string;
  projectDetails: ProjectContext;
  deliverableList: any;
  isEnableAttribute: boolean;
  dropdownDeliverableSettings: {};
  selectedEntities: EntityViewModel[];
  selectedDeliverable: any;
  filterattribute: any;
  filterdeliverableattribute: any;
  deliverablesInput = new DeliverablesInput();
  attributeComponent: any;
  projectUserRightsData: ProjectDeliverableRightViewModel;
  accessRights: DeliverableRoleViewModel[];
  testDelList: any;

  searchText: string = "";
  isSearchBoxVisible: boolean = false;
  headerIcons: projectIcons;
  templateDetailsRequestModel = new TemplateDetailsRequestModel();
  searchTextChanged = new Subject<string>();
  subscription = new Subscription();
  delList: any = [];
  tempdeliverable: any

  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 600
  });

  buttonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark'
  ];
  buttonClass = this.buttonClasses[0];

  constructor(
    private deliverableService: DeliverableService,
    private readonly _eventService: EventAggregatorService,
    private designerService: DesignerService,
    private storageService: StorageService,
    private dialogService: NbDialogService,
    private router: Router,
    private elRef: ElementRef,
    private sharedService: ShareDetailService,
    private templateService: TemplateService,
    private projectUserService: ProjectUserService
  ) { }


  ngOnInit() {
    this.dropdownDeliverableSettings = {
      singleSelection: false,
      idField: 'entityId',
      textField: 'entityName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    this.headerIcons = new projectIcons();
    this.headerIcons.disableIconF = false;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIconD).subscribe((payload) => {

      if (payload)
        this.headerIcons.disableIconF = true;
      else
        this.headerIcons.disableIconF = false;
    }));
    this.projectDetails = this.sharedService.getORganizationDetail();
    var projectId = this.projectDetails.projectId;
    this.templateDetailsRequestModel.projectId = projectId;
    this.projectUserService.getProjectUserRights(projectId).subscribe((rolesData: ProjectDeliverableRightViewModel) => {
      if (rolesData) {
        this.designerService.projectUserRightsData = this.projectUserRightsData = rolesData;
        this.templateService.getTemplateDeliverables(this.templateDetailsRequestModel).subscribe((data: TemplateDeliverableViewModel[]) => {
          this.templateDeliverableList = data;
          this.designerService.attributeDeliverable=this.templateDeliverableList.deliverables.deliverableResponse;
          this.attributeHeader(this.designerService.attributeDeliverable);
        });
      }
    });

    //this.disableIconF=this.headerIcons.disableIconF;
    this.filterdeliverableattribute = FilterDeliverablePopoverComponent;
    this.subscription = this.searchTextChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => { this.searchDeliverables() });

    let projectDetails = this.sharedService.getORganizationDetail();
    this.projectID = projectDetails.projectId;

    this.isEnableAttribute = false;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).subscribe((payload: blockSelectedModel) => {
      this.headerIcons = new projectIcons();
      if (payload.nodeCount == 0) {
        this.headerIcons.disableIconCreate = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canCreateBlock;
        this.headerIcons.disableSelectAll = false;
      }
      else {
        this.headerIcons.disableSelectAll = true;
        if (payload.blockSelectCount == 0) {
          this.headerIcons.disableIconCreate = false;
          this.headerIcons.disableIconSe = true;
          this.headerIcons.disableIconAssignAll = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : false;
        }
        else {
          this.headerIcons.disableIconAssignAll = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : false;
          if (payload.blockSelectCount == 1) {
            this.headerIcons.disableIconAtt = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canViewAttribute;
            this.designerService.canEditAttributeFlag = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canEditAttribute;
            this.headerIcons.disableIconC = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canAddToUserLibrary;
            this.headerIcons.disableIconCopy = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canCopyPaste;
            this.headerIcons.disableIconCreate = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canCreateBlock;

            if (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) {
              this.headerIcons.disableIconAs = true;
              this.headerIcons.disableIconA = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : false;
            }
            this.headerIcons.disableIconSe = true;
            this.headerIcons.disableIconCS = false;
            if (payload.BlockStackRemoveAllowed)
              this.headerIcons.disableIconR = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canRemove;
            if (payload.isStack)
              this.headerIcons.disableIconUS = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canUngroupStack;
            if (!payload.isStack && payload.previousId != ValueConstants.DefaultId)
              this.headerIcons.disableIconDe = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canPromoteDemote;
            if (!payload.isStack && payload.nodeLevel != 0 && !payload.isParentStack)
              this.headerIcons.disableIconP = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canPromoteDemote;
          }
          else if (payload.blockSelectCount > 1) {
            this.headerIcons.disableIconC = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canAddToUserLibrary;
            this.headerIcons.disableIconCopy = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canCopyPaste;

            this.headerIcons.disableIconSe = true;
            if (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) {
              this.headerIcons.disableIconAs = true;
              this.headerIcons.disableIconA = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : false;
            }
            this.headerIcons.disableIconAtt = false;
            this.headerIcons.disableIconDe = false;
            this.headerIcons.disableIconP = false;
            if (payload.BlockStackRemoveAllowed)
              this.headerIcons.disableIconR = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canRemove;
            if (payload.nodeLevel == 0 && !payload.isStack && !payload.isParentStack && payload.canCreateStack)
              this.headerIcons.disableIconCS = (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) ? true : this.accessRights[0].canCreateStack;
          }
        }
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.popup).subscribe((payload) => {

      var elem1 = document.getElementById('test1');
      elem1.click();
      //this.popover.hide();
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.updateHeader).subscribe((template: any) => {
      this.attributeComponent = (this.designerService.blockDetails != null && this.designerService.blockDetails.isStack == false) ? ViewBlockAttributesPopoverComponent : ViewStackAttributesPopoverComponent;
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.disableDropdown).subscribe((payload) => {
      this.selectedEntities = new Array();
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).subscribe((payload) => {
      this.attributeHeader(payload);
    }));
  }

  attributeHeader(payload) {
    //Extract only deliverables
    let deliverableList= payload.filter(c=>c.deliverables.length === 0);
    //Get group
    let groups= payload.filter(c=>c.deliverables.length>0);
    if (groups && groups.length>0)
    {
      let deliverableUnderGroup=[];
      groups.forEach(grp=>
        {
          deliverableUnderGroup= grp.deliverables;
          deliverableList= deliverableList.concat(deliverableUnderGroup);
        });
        
    }
    let deliverableSet= new Set(deliverableList);
    deliverableList= Array.from(deliverableSet.values());
    this.testDelList=deliverableList;

    this.selectedDeliverable = deliverableList.find(c=>c.entityId===this.designerService.deliverableDetails.deliverableId);
    this.getTemplatesAndDeliverables(deliverableList);

    this.designerService.entityDetails = [];
    if (this.selectedDeliverable) {
      this.designerService.entityDetails.push(this.selectedDeliverable);
      this.designerService.deliverabletemplateDetails = new TemplateViewModel();
      this.designerService.deliverabletemplateDetails.templateId = this.selectedDeliverable.templateId;
      this.designerService.deliverabletemplateDetails.templateName = this.selectedDeliverable.templateName;
      this.deliverablesInput.id = this.selectedDeliverable.entityId;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable).publish(this.deliverablesInput);
      this.selectedDeliverableRights(this.selectedDeliverable);
    }
  }
  filterPopUp() {
    this.dialogService.open(FilterDeliverablePopoverComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  CopyToLibrary() {
    let payLoad = ActionOnBlockStack.copyToLibrary;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad));

  }
  demoteBlock() {
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(ActionOnBlockStack.demote));
  }
  promoteBlock() {
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(ActionOnBlockStack.promote));
  }
  deleteBlock() {

    let payLoad = ActionOnBlockStack.delete;
    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad));
  }
  showAttributeView() {
    this.attributeHeader(this.designerService.attributeDeliverable);
    this.isEnableAttribute = true;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.deliverables;
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
  }

  hideAttributeView() {
    this.isEnableAttribute = false;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.none;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
  }

  createBlockPopup() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.deliverables);

    this.dialogService.open(CreateBlockAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  createStackPopup() {
    this.dialogService.open(CreateStackAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  ungroupStack(event) {
    //this.treeControl.dataNodes.find(el => el.previousId == node.id);
    //TODO: Publish the selected stack to content.component
    //this.unGroupStack = true;
    let payLoad = ActionOnBlockStack.unGroupDeliverable;
    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad));

  }

  copyBlocksorStacks() {
    this.designerService.blocksToBeCopied = new Array();
    this.designerService.blocksToBeCopied = this.designerService.blockList;
    this.designerService.isCopied = true;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.copyDeliverable).publish(this.designerService.isCopied));
  }

  selectAllBlocks() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.selectAll).publish(true));
  }

  toggleSearchBox() {
    this.isSearchBoxVisible = !this.isSearchBoxVisible;
  }

  searchDeliverables() {
    let requestModel: SearchDeliverableViewModel =
    {
      searchText: this.searchText,
      PageIndex: 1,
      PageSize: 50,
      entityId: this.deliverablesInput.id
    }
    if (this.searchText.length > 0) {
      if (this.deliverablesInput.id) {
        this.deliverableService.searchDeliverables(requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          var payload = new TemplateAndBlockDetails();
          payload.blocks = data;
          payload.template = this.designerService.deliverabletemplateDetails;
          payload.filterApplied = true;
          this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.searchDeliverableDetails).publish(payload));
        });
      }
    }
    else {
      let payLoad = ActionOnBlockStack.cancelFilter;
      //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad));
    }
  }


  // To get the template/deliverables in tree view structure
  getTemplatesAndDeliverables(delItems) {
    let subDeliverables = [];
    delItems.forEach(ele => {
      ele.entityName = ele.entityName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
    });
    delItems.forEach(element => {
      if (element.entityName == this.selectedDeliverable.entityName)
        subDeliverables.push(new TreeviewItem({ checked: true, text: element.entityName, value: element.entityId }));
      else
        subDeliverables.push(new TreeviewItem({ checked: false, text: element.entityName, value: element.entityId }));

    });

    this.delList.push(new TreeviewItem({ checked: false, text: "Deliverables", value: "1", children: subDeliverables }));

    if (this.selectedDeliverable && this.selectedDeliverable.entityName) {
      this.setDropDownName(this.selectedDeliverable.entityName);
    }


    setTimeout(function () {
      var industryButtons = document.querySelectorAll('.home-industry .btn');
      industryButtons.forEach(item => {
        item.classList.add('industry');
      });
    });
  }

  onItemSelected(item) {
    if (this.testDelList) {
      if (item && item.length == 1) {
        var deliverable = this.testDelList.find(e => e.entityId == item[0]);
        this.tempdeliverable = deliverable;
        if (deliverable != null && deliverable != undefined) {
          this.designerService.clear();
          this.designerService.entityDetails = [];
          this.designerService.entityDetails.push(deliverable);
          this.designerService.deliverabletemplateDetails = new TemplateViewModel();
          this.designerService.deliverabletemplateDetails.templateId = this.selectedDeliverable.templateId;
          this.designerService.deliverabletemplateDetails.templateName = this.selectedDeliverable.templateName;
          this.deliverablesInput.id = deliverable.entityId;
          this.selectedDeliverable = deliverable;
          this.setDropDownName(this.selectedDeliverable.entityName);
          this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable).publish(this.deliverablesInput));
          this.selectedDeliverableRights(this.selectedDeliverable);
        }
      }
    }
  }

  setDropDownName(deliverableName) {
    if (deliverableName) {
      let treeView = this.elRef.nativeElement.querySelector('#deliverablesTreeView');
      if (treeView) {
        let dropDown = treeView.firstChild;
        if (dropDown && dropDown.firstChild) {
          dropDown.firstChild.textContent = deliverableName;
        }
      }
    }
  }

  assignToPopup() {
    this.designerService.isDeliverableSection = true;
    this.designerService.isTemplateSection = false;
    this.dialogService.open(AssignToComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.subscription.unsubscribe();
  }
  displayDocumentView() {
    this.designerService.LoadAllBlocksDocumentView = true;
    this.designerService.isDeliverableSection = true;
    this.designerService.isLibrarySection = false;
    this.designerService.isTemplateSection = false;
    this.designerService.selecteMenu(0);
    this.designerService.selectedSubmenus(SubMenus.Editor);
    this.designerService.changeTabDocumentView(SubMenus.Editor);
    this.designerService.hideOrShowMenus(0);
    //TODO: Fetch the selected template from the drop down instead of 0th index Id
    let deliverable = this.testDelList[0];
    if (deliverable != null && deliverable != undefined) {
      this.designerService.deliverableDetails = deliverable;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate)
        .publish(deliverable);
      this.designerService.changeIsDocFullView(true);
    }
    this.navigateToEditor();
  }
  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  selectedDeliverableRights(selectedDeliverable) {
    if (this.projectUserRightsData && this.projectUserRightsData.isCentralUser == false && this.projectUserRightsData.deliverableRole.length > 0) {
      this.accessRights = this.projectUserRightsData.deliverableRole.filter(e => e.entityId == selectedDeliverable.entityId);
      if (this.accessRights.length > 0) {
        let payLoad = ActionOnBlockStack.userRights;  
        this.designerService.selectedEntityRights = this.accessRights[0];
        this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad);
      }
    }
  }
}