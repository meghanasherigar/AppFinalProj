import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { CreateStackAttributesComponent } from '../../../../manage-stacks/create-stack-attributes/create-stack-attributes.component'
import { DeliverableBlockComponent } from '../deliverable-block/deliverable-block.component';
import { TemplateService } from '../../../../../../services/template.service';
import { TemplateResponseViewModel, TemplateAndBlockDetails, TemplateViewModel, SearchTemplateViewModel, TemplateDetailsRequestModel, TemplateDeliverableViewModel } from '../../../../../../../../@models/projectDesigner/template';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { ViewBlockAttributesPopoverComponent } from '../../../../manage-blocks/view-block-attributes-popover/view-block-attributes-popover.component'
import { CreateBlockAttributesComponent } from '../../../../manage-blocks/create-block-attributes/create-block-attributes.component';
import { Subscription, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AdminUserEventPayload } from '../../../../../../../../@models/admin/manageAdmin';
import { IconViewService } from '../../../../services/icon-view.service';
import { BlockService } from '../../../../../../services/block.service';
import { EditBlockAttributesComponent } from '../../../../manage-blocks/edit-block-attributes/edit-block-attributes.component';
import { viewAttributeModel, regions } from '../../../../../../../../@models/projectDesigner/common';
import { BlockDetailsResponseViewModel, ActionOnBlockStack, projectIcons, blockSelectedModel, TemplateBlockDetails } from '../../../../../../../../@models/projectDesigner/block';
import { ProjectDetails } from '../../../../../../../../@models/projectDesigner/region';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { FilterBlockPopoverComponent } from '../../../../manage-blocks/filter-block-popover/filter-block-popover.component';
import { ResponseStatus } from '../../../../../../../../@models/ResponseStatus';
import { DialogTypes, Dialog } from '../../../../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { DesignerService } from '../../../../../../services/designer.service';
import { ViewStackAttributesPopoverComponent } from '../../../../manage-stacks/view-stack-attributes-popover/view-stack-attributes-popover.component';
import { EditStackAttributesComponent } from '../../../../manage-stacks/edit-stack-attributes/edit-stack-attributes.component';
import { AssignToComponent } from '../assign-to/assign-to.component';
import { debug } from 'util';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as moment from 'moment';
import { ValueConstants } from '../../../../../../../../@models/common/valueconstants';
import { SubMenus } from '../../../../../../../../@models/projectDesigner/designer';

@Component({
  selector: 'ngx-template-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          switch (selection.checkedItems.length) {
            case 0:
              return 'Templates';
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
export class TemplateHeaderComponent implements OnInit, OnDestroy {

  selectedTemplate: any;
  projectId: string;
  templateDeliverableList: any;
  templateList: any;
  attributeComponent: any;
  projectDetails: ProjectContext;
  filterattribute: any;
  demote: any;
  promote: any;
  subscriptions: Subscription = new Subscription();
  isEnableAttribute: boolean = false;
  libraryAttributeViewFlag: boolean;
  DisplayLibrary: boolean;
  DisplayTemplates: boolean;
  DisplayDeliverables: boolean;
  unGroupStack: boolean;
  blockData: any;
  templateBlockDetails = new TemplateAndBlockDetails();
  searchText: string = "";
  isSearchBoxVisible: boolean = false;
  private dialogTemplate: Dialog;
  assignToVariable: any;
  disableIcon: string;
  blockCount: any;
  headerIcons: projectIcons;
  templateDetailsRequestModel = new TemplateDetailsRequestModel();
  isDocumnetViewDoubleClick: boolean;
  showIcons: boolean;
  // selectedTemplate : TemplateViewModel[];
  delTempList: any = [];

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
  searchTextChanged = new Subject<string>();
  subscription = new Subscription();
  constructor(private dialogService: NbDialogService,
    private templateService: TemplateService,
    private elRef: ElementRef,
    private readonly _eventService: EventAggregatorService,
    private service: IconViewService, private blockService: BlockService,
    private storageService: StorageService,
    private designerService: DesignerService,
    private dialog: MatDialog,
    private confirmationDialogService: DialogService,
    private sharedService: ShareDetailService,
    private router: Router) { }

  ngOnInit() {
    this.headerIcons = new projectIcons();
    this.headerIcons.disableIconF = false;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).subscribe((payload) => {
      if (payload)
        this.headerIcons.disableIconF = true;
      else
        this.headerIcons.disableIconF = false;
    }));
    // this.disableIconF="disableIconF";
    this.projectDetails = this.sharedService.getORganizationDetail();
    var projectId = this.projectDetails.projectId;
    this.designerService.currentDoubleClicked.subscribe(isDoubleClicked => this.isDocumnetViewDoubleClick = isDoubleClicked);

    this.showIcons = this.designerService.showIconFlag;

    this.subscription = this.searchTextChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => { this.searchTemplates() });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).subscribe((payload: blockSelectedModel) => {
      this.headerIcons = new projectIcons();
      if (payload.nodeCount == 0) {
        this.headerIcons.disableIconCreate = true;
        this.headerIcons.disableSelectAll = false;
      }
      else {
        this.headerIcons.disableSelectAll = true;
        if (payload.blockSelectCount == 0) {
          this.headerIcons.disableIconCreate = false;
          this.headerIcons.disableIconSe = true;
          this.headerIcons.disableIconAssignAll = true;
        }
        else {
          this.headerIcons.disableIconAssignAll = true;
          if (payload.blockSelectCount == 1) {
            this.headerIcons.disableIconAtt = this.headerIcons.disableIconC = this.headerIcons.disableIconCopy = this.headerIcons.disableIconCreate = this.headerIcons.disableIconL = this.headerIcons.disableIconSe = this.headerIcons.disableIconAs = this.headerIcons.disableIconA = true;
            this.headerIcons.disableIconCS = false;
            if (payload.BlockStackRemoveAllowed)
              this.headerIcons.disableIconR = true;
            if (payload.isStack)
              this.headerIcons.disableIconUS = true;
            if (!payload.isStack && payload.previousId != ValueConstants.DefaultId)
              this.headerIcons.disableIconDe = true;
            if (!payload.isStack && payload.nodeLevel != 0 && !payload.isParentStack)
              this.headerIcons.disableIconP = true;
          }
          else if (payload.blockSelectCount > 1) {
            this.headerIcons.disableIconC = this.headerIcons.disableIconCopy = this.headerIcons.disableIconL = this.headerIcons.disableIconSe = this.headerIcons.disableIconAs = this.headerIcons.disableIconA = true;
            this.headerIcons.disableIconAtt = this.headerIcons.disableIconDe = this.headerIcons.disableIconP = false;
            if (payload.BlockStackRemoveAllowed)
              this.headerIcons.disableIconR = true;
            if (payload.nodeLevel == 0 && !payload.isStack && !payload.isParentStack && payload.canCreateStack)
              this.headerIcons.disableIconCS = true;
          }
        }
      }
    }));


    this.templateDetailsRequestModel.projectId = projectId;
    //TODO: Move the PageSize and PageIndex to a constant file
    //uncomment when pagination feature is needed
    // this.templateDetailsRequestModel.PageIndex = 1;
    // this.templateDetailsRequestModel.PageSize = 5;

    this.templateService.getTemplateDeliverables(this.templateDetailsRequestModel).subscribe((data: TemplateDeliverableViewModel[]) => {
      this.templateDeliverableList = data;

      let defaultTemp = this.templateDeliverableList.templates.templatesDropDown.find(x => x.isDefault == true);
      //Check if existing template is selected before making the default selection
      if (this.designerService.templateDetails) {
        defaultTemp = this.templateDeliverableList.templates.templatesDropDown
          .find(x => x.templateId === this.designerService.templateDetails.templateId);
      }

      if (defaultTemp && defaultTemp != undefined) {
        this.selectedTemplate = defaultTemp;
        this.templateBlockDetails.template = defaultTemp;
        this.designerService.templateDetails = defaultTemp;
      }
      else {
        if (this.templateDeliverableList.templates.templatesDropDown.length > 0) {
          this.selectedTemplate = this.templateDeliverableList.templates.templatesDropDown[0];
          this.templateBlockDetails.template = this.selectedTemplate;
          this.designerService.templateDetails = this.selectedTemplate;
        }
      }
      this.templateBlockDetails.blocks = this.templateDeliverableList.templates.templateDetails.blocks;
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetails).publish(this.templateBlockDetails));
      this.templateBlockDetails.blocks = [];
      this.getTemplatesAndDeliverables();
      this.designerService.attributeDeliverable = this.templateDeliverableList.deliverables.deliverableResponse;
      // this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.getDeliverables).publish(this.templateDeliverableList.deliverables.deliverableResponse));
    });

    this.filterattribute = FilterBlockPopoverComponent;
    this.assignToVariable = AssignToComponent;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockAttributes).subscribe((isStack: boolean) => {
      if (!isStack) {
        this.dialogService.open(EditBlockAttributesComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
        });
      }

      if (isStack) {
        this.dialogService.open(EditStackAttributesComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
        });
      }

    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.popup).subscribe((payload) => {

      var elem1 = document.getElementById('test1');
      elem1.click();
      //this.popover.hide();
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.popOver).subscribe((payload) => {

      var elem1: any;
      if (payload == 'AssignTo') {
        elem1 = document.getElementById('assignTo');
      }
      else
        elem1 = document.getElementById('test1');
      elem1.click();
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).subscribe((template: any) => {
      if (!this.isDocumnetViewDoubleClick)
        this.designerService.clear();
      this.selectedTemplate = template;
      this.templateService.getTemplateBlocksByTemplateId(template.templateId).subscribe((data: TemplateBlockDetails) => {
        this.templateBlockDetails.template = data.template;
        this.templateBlockDetails.blocks = data.blocks;
        this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetailsAttr).publish(this.templateBlockDetails));
        this.templateBlockDetails.blocks = [];
        // this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetails).publish(this.templateBlockDetails));
      });
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.updateHeader).subscribe((template: any) => {
      this.attributeComponent = (this.designerService.blockDetails != null && this.designerService.blockDetails.isStack == false) ? ViewBlockAttributesPopoverComponent : ViewStackAttributesPopoverComponent;
    }));
  }

  createBlockPopup() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.templates));

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

  assignToPopup() {
    this.designerService.isDeliverableSection = false;
    this.designerService.isTemplateSection = true;
    this.dialogService.open(AssignToComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  filterPopUp() {
    this.dialogService.open(FilterBlockPopoverComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  manageDeliverablePopup() {
    this.dialogService.open(DeliverableBlockComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  deleteBlock() {
    let payLoad = ActionOnBlockStack.delete;
    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
  }

  copyBlocks() {
    this.designerService.blocksToBeCopied = new Array();
    this.designerService.blocksToBeCopied = this.designerService.blockList;
    this.designerService.isCopied = true;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(this.designerService.isCopied));
  }


  ungroupStack(event) {
    //this.treeControl.dataNodes.find(el => el.previousId == node.id);
    //TODO: Publish the selected stack to content.component
    //this.unGroupStack = true;
    let payLoad = ActionOnBlockStack.unGroupTemplate;
    //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));

  }
  demoteBlock() {
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(ActionOnBlockStack.demote));
  }
  promoteBlock() {
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(ActionOnBlockStack.promote));
  }
  showAttributeView() {

    this.isEnableAttribute = true;
    this.designerService.showIconFlag = false;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.templates;
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
  }

  hideAttributeView() {
    this.isEnableAttribute = false;
    this.designerService.showIconFlag = true;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.none;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
  }

  displayDocumentView() {
    this.designerService.LoadAllBlocksDocumentView = true;
    this.designerService.isDeliverableSection = false;
    this.designerService.isLibrarySection = false;
    this.designerService.isTemplateSection = true;
    //TODO: Fetch the selected template from the drop down instead of 0th index Id
    let template = this.templateDeliverableList.templates.templatesDropDown[0];
    if (template != null && template != undefined) {
      this.designerService.templateDetails = template;
      this.designerService.selecteMenu(0);
      this.designerService.selectedSubmenus(SubMenus.Editor);
      this.designerService.changeTabDocumentView(SubMenus.Editor);
      this.designerService.hideOrShowMenus(0);
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate)
        .publish(template));
      this.designerService.changeIsDocFullView(true);

    }
    this.navigateToEditor();
  }

  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  selectAllBlocks() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.selectAllTemp).publish(true));
  }

  // To get the template/deliverables in tree view structure
  getTemplatesAndDeliverables() {
    let subDeliverables = [];
    let subTemplates = [];
    this.templateDeliverableList.templates.templatesDropDown.forEach(element => {
      if (element.templateId == this.selectedTemplate.templateId)
        subTemplates.push(new TreeviewItem({ checked: true, text: element.templateName, value: element.templateId }));
      else
        subTemplates.push(new TreeviewItem({ checked: false, text: element.templateName, value: element.templateId }));
    });

    this.templateDeliverableList.deliverables.deliverableResponse.forEach(ele => {
      ele.entityName = ele.entityName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
    });
    // this.templateDeliverableList.deliverables.deliverableResponse.forEach(element => {
    //   subDeliverables.push(new TreeviewItem({ checked: false, text: element.entityName, value: element.entityId }));
    // });

    this.delTempList.push(new TreeviewItem({ checked: false, text: "Templates", value: "1", children: subTemplates }));
    //this.delTempList.push(new TreeviewItem({ checked: false, text: "Deliverables", value: "2", children: subDeliverables }));

    //this.onItemSelected([this.selectedTemplate.templateId]);
    if (this.selectedTemplate && this.selectedTemplate.templateName) {
      this.setDropDownName(this.selectedTemplate.templateName);
    }


    setTimeout(function () {
      var industryButtons = document.querySelectorAll('.home-industry .btn');
      industryButtons.forEach(item => {
        item.classList.add('industry');
      });
    });
  }

  onItemSelected(item: Array<string>) {
    this.designerService.clear();
    if (this.templateDeliverableList) {
      var template = this.templateDeliverableList.templates.templatesDropDown.find(i => i.templateId == item[0]);
      var deliverable = this.templateDeliverableList.deliverables.deliverableResponse.filter(e => item.includes(e.entityId));

      if (template != null && template != undefined) {
        this.setDropDownName(template.templateName);
        this.designerService.templateDetails = template;
        this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(template));
      }
      if (deliverable) {
        this.designerService.entititesSelectedInTemplate = deliverable;
        // this.deliverablesInput.id = deliverable.entityId;
        // // this.displayDeliverableSection = true;
        // // this.displayTemplateSection = false;
        // this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable).publish(this.deliverablesInput);
      }
    }
  }

  setDropDownName(templateName) {
    if (templateName) {
      let treeView = this.elRef.nativeElement.querySelector('#templatesTreeView');
      if (treeView) {
        let dropDown = treeView.firstChild;
        if (dropDown && dropDown.firstChild) {
          dropDown.firstChild.textContent = templateName;
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleSearchBox() {
    this.isSearchBoxVisible = !this.isSearchBoxVisible;
  }

  searchTemplates() {
    let requestModel: SearchTemplateViewModel =
    {
      searchText: this.searchText,
      PageIndex: 1,
      PageSize: 50,
      templateId: this.selectedTemplate.templateId
    }
    if (this.searchText.length > 0) {
      this.templateService.searchTemplates(requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
        this.templateBlockDetails.blocks = data;
        this.templateBlockDetails.filterApplied = true;
        this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetails).publish(this.templateBlockDetails));
      });
    }
    else {
      let payLoad = ActionOnBlockStack.cancelFilter;
      //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(payLoad); 
      this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
    }
  }

  copyToLibrary() {
    let payLoad = ActionOnBlockStack.copyToLibrary;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
  }

}

