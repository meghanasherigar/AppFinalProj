import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { projectIcons, blockSelectedModel, ActionOnBlockStack, BlockDetailsResponseViewModel } from '../../../../../../../../@models/projectDesigner/block';
import { Subscription, Subject } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../../../@models/common/eventConstants';
import { viewAttributeModel, regions } from '../../../../../../../../@models/projectDesigner/common';
import { DesignerService } from '../../services/designer.service';
import { Designer } from '../../../../../../../../@models/projectDesigner/designer';
import { NbDialogService } from '@nebular/theme';
import { Router } from '@angular/router';
import { TemplateService } from '../../../../../../services/template.service';
import { SelectedSection, ThemingContext } from '../../../../../../../../@models/projectDesigner/theming';
import { CreateBlockAttributesComponent } from '../manage-blocks/create-block-attributes/create-block-attributes.component';
import { EditBlockAttributesComponent } from '../manage-blocks/edit-block-attributes/edit-block-attributes.component';
import { CreateStackAttributesComponent } from '../manage-stacks/create-stack-attributes/create-stack-attributes.component';
import { EditStackAttributesComponent } from '../manage-stacks/edit-stack-attributes/edit-stack-attributes.component';
import { LinkToDeliverableComponent } from '../link-to-deliverable/link-to-deliverable.component';
import { AssignToComponent } from '../assign-to/assign-to.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchTemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../../@models/projectDesigner/template';
import { SearchDeliverableViewModel, DeliverablesInput } from '../../../../../../../../@models/projectDesigner/deliverable';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { FilterTemplateComponent } from '../manage-blocks/filter-template/filter-template.component';
import { FilterDeliverableComponent } from '../manage-blocks/filter-deliverable/filter-deliverable.component';
import { ValueConstants } from '../../../../../../../../@models/common/valueconstants';
import { DeliverableRoleViewModel, ProjectDeliverableRightViewModel } from '../../../../../../../../@models/userAdmin';

@Component({
  selector: 'ngx-template-deliverable-header-icons',
  templateUrl: './template-deliverable-header-icons.component.html',
  styleUrls: ['./template-deliverable-header-icons.component.scss']
})
export class TemplateDeliverableHeaderIconsComponent implements OnInit,OnDestroy {
  headerIcons = new projectIcons();
  showIcons: boolean = false;
  subscriptions: Subscription = new Subscription();
  @Input("section") section: any;
  designer = new Designer();
  isEnableAttribute: boolean = false;
  isSearchBoxVisible: boolean = false;
  searchText: string = "";
  @Input("selectedSection") selectedSection: any;
  isStack: boolean = false;
  searchTextChanged = new Subject<string>();
  subscription = new Subscription();
  themingContext: ThemingContext;
  projectRightsData: ProjectDeliverableRightViewModel;
  accessRights: DeliverableRoleViewModel[];

  constructor(private readonly _eventService: EventAggregatorService, private sharedService : ShareDetailService, private dialogService: NbDialogService, private designerService: DesignerService, private router: Router, private templateService: TemplateService, private deliverableService : DeliverableService) { }

  ngOnInit() {
    this.projectRightsData = this.designerService.projectUserRightsData;
    this.showIcons = true;
    //this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    this.themingContext = this.sharedService.getSelectedTheme();
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).subscribe((payload: blockSelectedModel) => {
      this.showHideTemplateIcons(payload);
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.disableDeleteForLockedBlock).subscribe((payload: blockSelectedModel) => {
      this.headerIcons.disableIconR = (this.projectRightsData && this.projectRightsData.isCentralUser) ? payload.lockedBlockSelected : this.accessRights[0].canRemove;
    }));

    this.subscription.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.common.enableCreateBlock).subscribe((payload) => {
      if(payload) {
        this.showHideIcons(payload);
      }
    }))

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).subscribe((payload: blockSelectedModel) => {
      if (this.projectRightsData && this.projectRightsData.isCentralUser == false && this.projectRightsData.deliverableRole.length > 0) {
        this.selectedDeliverableRights();
      }
      this.showHideDeliverableIcons(payload);
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).subscribe((payload)=>{
      if(payload){
        this.headerIcons.disableIconF=true;
        //disable create button if filter is selected
        this.headerIcons.disableIconCreate=false;
      }
      else{
        this.headerIcons.disableIconF=false;
        this.headerIcons.disableIconCreate= (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canCreateBlock;
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockAttributes).subscribe((isStack: boolean) => {
      if (!isStack) {
        this.dialogService.open(EditBlockAttributesComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
          context: { section: this.section }
        });
      }

      if (isStack) {
        this.dialogService.open(EditStackAttributesComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
          context: { section: this.section }
        });
      }

    }));

    this.subscription = this.searchTextChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => { this.search() });
  }

  showHideIcons(showIcons) {
    if(showIcons) {
        this.headerIcons.disableIconCreate = false; 
        this.isSearchBoxVisible = false;
        this.headerIcons.disableIconAssignAll = false;
        this.headerIcons.disableIconF = false;
    }
   }

  showHideDeliverableIcons(payload) {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    this.isStack = false;
    this.headerIcons = new projectIcons();
    if (payload.nodeCount == 0 ) {
      this.headerIcons.disableIconCreate = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canCreateBlock;
      this.headerIcons.disableSelectAll = false;
    }
    else {
      this.headerIcons.disableSelectAll = true;
      if(payload.blockSelectCount > 0)
      {
        if (!payload.isStack && payload.previousId != ValueConstants.DefaultId)
        this.headerIcons.disableIconDe = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canPromoteDemote;
        if (!payload.isStack && payload.nodeLevel != 0 && !payload.isParentStack)
        this.headerIcons.disableIconP = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canPromoteDemote;
      }
      if (payload.blockSelectCount == 0) {
        this.headerIcons.disableIconCreate = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canCreateBlock;
        this.headerIcons.disableIconSe = true;
        this.headerIcons.disableIconAssignAll = this.canUserAssign();
      }
      else {
        this.headerIcons.disableIconAssignAll = this.canUserAssign();
        if (payload.blockSelectCount == 1) {
          this.headerIcons.disableIconAtt = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canViewAttribute;
          this.designer.canEditAttributeFlag = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canEditAttribute;
          this.headerIcons.disableIconC = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canAddToUserLibrary;
          this.headerIcons.disableIconCopy = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canCopyPaste;
          this.headerIcons.disableIconCreate = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canCreateBlock;
          this.headerIcons.disableIconL = (this.selectedSection == SelectedSection.Deliverables) ? false : true;
          this.headerIcons.disableIconA = this.canUserAssign();
          if (this.projectRightsData && this.projectRightsData.isCentralUser) {
            this.headerIcons.disableIconAs = true;
          }
          this.headerIcons.disableIconSe = true;
          this.headerIcons.disableIconCS = false;
          if (payload.BlockStackRemoveAllowed)
            this.headerIcons.disableIconR = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canRemove;
          if (payload.isStack) {
            this.headerIcons.disableIconUS = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canUngroupStack;
            this.isStack = true;
          }
         }
      
        else if (payload.blockSelectCount > 1) {
          this.headerIcons.disableIconCreate = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canCreateBlock;
          this.headerIcons.disableIconC = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canAddToUserLibrary;
          this.headerIcons.disableIconCopy = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canCopyPaste;
          this.headerIcons.disableIconL = (this.selectedSection == SelectedSection.Deliverables) ? false : true;
          this.headerIcons.disableIconSe = true;
          this.headerIcons.disableIconA = this.canUserAssign();
          if (this.projectRightsData && this.projectRightsData.isCentralUser) {
            this.headerIcons.disableIconAs = true;
          }
          this.headerIcons.disableIconAtt = false;
          if (payload.BlockStackRemoveAllowed)
            this.headerIcons.disableIconR = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canRemove;
          if (payload.nodeLevel == 0 && !payload.isStack && !payload.isParentStack)
            this.headerIcons.disableIconCS = (this.projectRightsData && this.projectRightsData.isCentralUser) ? true : this.accessRights[0].canCreateStack;
        }
      }
    }
    if(this.designerService.appendixBlockExists)
    this.headerIcons.disableIconR = false;
  }

  //Method to enable/disable assign access if the user has access on the chosen entity
  canUserAssign()
  {
    let currentEntityId=this.designer.deliverableDetails?this.designer.deliverableDetails.deliverableId:'';
    if(this.projectRightsData.isCentralUser) return true;
    let assignRights=
    this.projectRightsData.deliverableRole.find(x=>x.entityId===currentEntityId);
    if(assignRights)
    {
      return true;
    }
    return false;
  }

  showHideTemplateIcons(payload) {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    this.isStack = false;
    this.headerIcons = new projectIcons();
    if (payload.nodeCount == 0 ) {
      //Block creation should be enabled irrespective of block-selection
      this.headerIcons.disableIconCreate = true;
      this.headerIcons.disableSelectAll = false;
    }
    else {
      this.headerIcons.disableSelectAll = true;
      if (payload.blockSelectCount == 0) {
        //Block creation should be enabled irrespective of block-selection
        this.headerIcons.disableIconCreate = true;
        this.headerIcons.disableIconSe = true;
        this.headerIcons.disableIconAssignAll =true;
      }
      else {
        this.headerIcons.disableIconAssignAll = true;
        if(payload.blockSelectCount > 0)
        {
          if (!payload.isStack && payload.previousId != ValueConstants.DefaultId)
          this.headerIcons.disableIconDe = true;
          if (!payload.isStack && payload.nodeLevel != 0 && !payload.isParentStack)
          this.headerIcons.disableIconP = true;
        }
        if (payload.blockSelectCount == 1) {
          this.headerIcons.disableIconAtt = true;
          this.designer.canEditAttributeFlag = true;
          this.headerIcons.disableIconC = true;
          this.headerIcons.disableIconCopy = true;
          this.headerIcons.disableIconCreate = true;
          this.headerIcons.disableIconL = true;
          this.headerIcons.disableIconAs = true;
          this.headerIcons.disableIconA = true;
          this.headerIcons.disableIconSe = true;
          this.headerIcons.disableIconCS = false;
          if (payload.BlockStackRemoveAllowed)
            this.headerIcons.disableIconR = true;
          if (payload.isStack) {
            this.headerIcons.disableIconUS = true;
            this.isStack = true;
          }
         }
      
        else if (payload.blockSelectCount > 1) {
          this.headerIcons.disableIconC = true;
          this.headerIcons.disableIconCopy = true;
          this.headerIcons.disableIconL = true;
          this.headerIcons.disableIconSe = true;
          this.headerIcons.disableIconAs = true;
          this.headerIcons.disableIconA = true;
          this.headerIcons.disableIconAtt = false;
          if (payload.BlockStackRemoveAllowed)
            this.headerIcons.disableIconR = true;
          if (payload.nodeLevel == 0 && !payload.isStack && !payload.isParentStack)
            this.headerIcons.disableIconCS = true;
        }
      }
    }
  }

  selectedDeliverableRights() {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    var selectedSection = this.sharedService.getSelectedTheme().themeOptions.filter(item => item.name == this.section)[0];
    let selectedDeliverable = selectedSection.data.deliverable;
    this.accessRights = this.designerService.projectUserRightsData.deliverableRole.filter(e => e.entityId == selectedDeliverable.id);
    if(this.accessRights.length > 0) {
      let payLoad = ActionOnBlockStack.userRights;
      this.designer.selectedEntityRights = this.accessRights;
      this._eventService.getEvent(this.section + "_" + EventConstants.DeliverableSection).publish(payLoad);
    }
  }

  createBlockPopup() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.templates));

    this.dialogService.open(CreateBlockAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { section: this.section }
    });
  }

  createStackPopup() {
    this.dialogService.open(CreateStackAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { section: this.section }
    });
  }

  assignToPopup(assignAll:boolean=false) {
    this.dialogService.open(AssignToComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
      context: { section: this.section, reportReview:assignAll }
    });
  }
  filterPopUp() {
    let component : any;
    //component = this.designer.templateDetails != null ? FilterTemplateComponent : FilterDeliverableComponent;
    let designer;
    if(this.designer.templateDetails || this.designer.deliverableDetails)
    {
      designer= this.designer;
    }
    else
    {
      this.themingContext = this.sharedService.getSelectedTheme();
      designer= this.themingContext.themeOptions.find(item => item.name == this.section).designerService;
    }
    
    component = designer.templateDetails != null ? FilterTemplateComponent : FilterDeliverableComponent;
    this.dialogService.open(component, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
      context: { section: this.section }
    });
  }
  manageDeliverablePopup() {
    this.dialogService.open(LinkToDeliverableComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
      context: { section: this.section }
    });
  }
  deleteBlock() {
    let payLoad = ActionOnBlockStack.delete;
    var eventToPublish = this.designer.templateDetails != null ? EventConstants.TemplateSection : EventConstants.DeliverableSection;
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventToPublish).publish(payLoad));
  }

  copyBlocks() {
    this.designer.blocksToBeCopied = new Array();
    this.designer.blocksToBeCopied = this.designer.blockList;
    this.designer.isCopied = true;
    var eventToPublish = this.designer.templateDetails != null ? EventConstants.TemplateSection : eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.copyDeliverable;
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventToPublish).publish(this.designer.isCopied));
  }


  ungroupStack(event) {
    if (this.designer.templateDetails != null) {
      let payLoad = ActionOnBlockStack.unGroupTemplate;
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.TemplateSection).publish(payLoad));
    }
    else {
      let payLoad = ActionOnBlockStack.unGroupDeliverable;
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.DeliverableSection).publish(payLoad));
    }
  }
  demoteBlock() {
    var eventToPublish = this.designer.templateDetails != null ? EventConstants.TemplateSection : EventConstants.DeliverableSection;
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventToPublish).publish(ActionOnBlockStack.demote));

  }
  promoteBlock() {
    var eventToPublish = this.designer.templateDetails != null ? EventConstants.TemplateSection : EventConstants.DeliverableSection;
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventToPublish).publish(ActionOnBlockStack.promote));
  }


  displayDocumentView() {
    //no code in deliverable
    this.designer.LoadAllBlocksDocumentView = true;

    //TODO: Fetch the selected template from the drop down instead of 0th index Id
    // let template = this.templateDeliverableList.templates.templatesDropDown[0];
    // if (template != null && template != undefined) {
    //   this.designer.templateDetails = template;
    //   this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate)
    //     .publish(template);
    //   this.designerService.changeIsDocFullView(this.section, true);

    // }
    // this.navigateToEditor();
  }

  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  selectAllBlocks() {
    var eventToPublish = this.designer.templateDetails != null ? eventConstantsEnum.projectDesigner.iconicViewTemplateSection.selectAllTemp : eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.selectAll;
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventToPublish).publish(true));
  }

  toggleSearchBox() {
    this.isSearchBoxVisible = !this.isSearchBoxVisible;
  }

  //need to be reolved
  search() {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    if (this.designer.templateDetails != null) {
      let requestModel: SearchTemplateViewModel =
      {
        searchText: this.searchText,
        PageIndex: 1,
        PageSize: 50,
        templateId: this.designer.templateDetails.templateId
      }
      if (this.searchText.length > 0) {
        this.templateService.searchTemplates(requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
          var templateBlockDetails = new TemplateAndBlockDetails();
          templateBlockDetails.blocks = data;
          templateBlockDetails.filterApplied = true;
          templateBlockDetails.template = this.designer.templateDetails;
          this.subscriptions.add(this._eventService.getEvent(this.section + "_loadTemplateContent").publish(templateBlockDetails));
        });
      }
      else {
        let payLoad = ActionOnBlockStack.cancelFilter;
        this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.TemplateSection).publish(payLoad));
      }
    }
    else {
      let requestModel: SearchDeliverableViewModel =
      {
        searchText: this.searchText,
        PageIndex: 1,
        PageSize: 50,
        entityId: this.designer.deliverableDetails.entityId
      }
      if (this.searchText.length > 0) {
        if (this.designer.deliverableDetails.entityId) {
          this.deliverableService.searchDeliverables(requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            var payload = new TemplateAndBlockDetails();
            payload.blocks = data;
            payload.filterApplied = true;
            this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.searchDeliverableDetails).publish(payload));
          });
        }
      }
      else {
        var deliverableInput = new DeliverablesInput();
        deliverableInput = this.sharedService.getSelectedTheme().themeOptions.filter(id=>id.name == this.section)[0].data.deliverable;
        this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput));

      }
    }
  }

  copyToLibrary() {
    var eventToPublish = this.designer.templateDetails != null ? EventConstants.TemplateSection : EventConstants.DeliverableSection;
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventToPublish).publish(ActionOnBlockStack.copyToLibrary));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
