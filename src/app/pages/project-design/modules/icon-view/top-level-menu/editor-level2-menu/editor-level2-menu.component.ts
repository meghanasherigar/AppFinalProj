import { Component, OnInit, EventEmitter, Output, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { EventConstants, eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { NbDialogService, NbPopoverDirective } from '@nebular/theme';
import { GenerateReportComponent } from '../../report-generation/generate-report/generate-report.component';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../services/designer.service';
import { CreateStackAttributesComponent } from '../../../../../project-design/modules/icon-view/manage-stacks/create-stack-attributes/create-stack-attributes.component';
import { DeliverableBlockComponent } from '../../content/region/templates/deliverable-block/deliverable-block.component';
import { AssignToComponent } from '../../content/region/templates/assign-to/assign-to.component';
import { ActionOnBlockStack, blockSelectedModel, DocumentViewIcons } from '../../../../../../@models/projectDesigner/block';
import { CreateBlockAttributesComponent } from '../../manage-blocks/create-block-attributes/create-block-attributes.component';
import { regions, ActionEnum } from '../../../../../../@models/projectDesigner/common';
import { debug } from 'util';
import { TemplateService } from '../../../../services/template.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { SuggestBlockComponent } from '../../content/region/templates/suggest-block/suggest-block.component';
import { DeliverableService } from '../../../../services/deliverable.service';
import { LibraryService } from '../../../../services/library.service';
import { AddToLibraryComponent } from '../../manage-blocks/add-to-library/add-to-library.component';
import { ValueConstants } from '../../../../../../@models/common/valueconstants';
import { ProjectUserService } from '../../../../../admin/services/project-user.service';
import { UserRightsViewModel, DocumentViewAccessRights, DocViewDeliverableRoleViewModel } from '../../../../../../@models/userAdmin';
import { DeliverableViewModel } from '../../../../../../@models/projectDesigner/deliverable';
import { DefineColorsComponent } from '../../define-colors/define-colors.component';
import { PreviewDocViewComponent } from '../../report-generation/preview-doc-view/preview-doc-view.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-editor-level2-menu',
  templateUrl: './editor-level2-menu.component.html',
  styleUrls: ['./editor-level2-menu.component.scss']
})
export class EditorLevel2MenuComponent implements OnInit, OnDestroy {
  projectDetails: ProjectContext;
  subscriptions: Subscription = new Subscription();
  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;

  DisableLinkToForDeliverables: boolean = true;
  public show: boolean = true;
  public imageName: string = this.translate.instant("collapse");
  selectedDesignerTab: any;
  docViewToolbarIcons = new DocumentViewIcons();
  docViewRights: UserRightsViewModel;
  docViewRoles: DocViewDeliverableRoleViewModel[];
  selectedDeliverable: DeliverableViewModel;


  searchedText = '';
  replaceWith = '';

  blockList = [];

  blockSelectedModel = new blockSelectedModel();
  constructor(
    private el: ElementRef,
    private readonly _eventService: EventAggregatorService,
    private dialogService: NbDialogService,
    private translate: TranslateService,
    private designerService: DesignerService,
    private templateService: TemplateService,
    private libraryService: LibraryService,
    private deliverableService: DeliverableService,
    private sharedService: ShareDetailService,
    private projectUserService: ProjectUserService
  ) { }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.EnableDisableFormatPainter).subscribe((payloa) => {
      this.designerService.enableFormatPainter = false;
      this.designerService.enableDefaultPainter = false;
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.DismisFindReplace).subscribe((payload: any) => {
      if(payload == ActionEnum.cancel)
        this.dismiss(ActionEnum.cancel);
    }));

    this.blockList = this.designerService.blockList;

    this.designerService.selectedDesignerTab.subscribe(selectedTab => {
      this.selectedDesignerTab = selectedTab;
      this.designerService.selectedDocTab = selectedTab;
      this.blockSelectedModel.nodeCount = this.designerService.totalBlockCount;
      this.blockSelectedModel.blockSelectCount = (this.designerService.blockList != undefined) ? this.designerService.blockList.length : 0;
      this.enableDisableIconsAsPerRoles(this.blockSelectedModel);
    });
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DocumentViewToolBar).subscribe((payload: any) => {
      var tollbarDiv = document.getElementById("toolbar-menu");
      tollbarDiv.innerHTML = payload;
    }));
    if (this.designerService.isDeliverableSection === true) {
      this.DisableLinkToForDeliverables = false;
    }
    // this.blockSelectedModel.blockSelectCount = (this.designerService.blockList != undefined) ? this.designerService.blockList.length : 0;
    this.enableDisableIconsAsPerRoles(this.designerService.blockSelectedModel);
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).subscribe((payload: blockSelectedModel) => {
      this.enableDisableIconsAsPerRoles(payload);
    }));

    if (this.designerService.ckeditortoolbar != undefined)
      document.querySelector('#toolbar-menu').appendChild(this.designerService.ckeditortoolbar.ui.view.toolbar.element);

  }

  enableDisableIconsAsPerRoles(payload) {
    if (this.designerService.docViewAccessRights) {
      this.docViewRights = this.designerService.docViewAccessRights;
      if (!this.docViewRights.isCentralUser && !this.designerService.isTemplateSection) {
        this.checkDeliverableRoles();
      }
      this.enableDisableToolbarIcons(payload);
    }
  }
  saveData() {
    if (this.designerService.LoadAllBlocksDocumentView === true) {
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish("saveAll"));
    } else {
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish("save"));
    }
  }
  findText(event, action) {
    var payload: any = {};
    payload.action = action;
    payload.searchedText = this.searchedText;
    payload.replaceWith = this.replaceWith;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);

  }
  findNext() {
    var payload: any = {};
    payload.action = "FindNext";
    payload.searchedText = this.searchedText;
    payload.replaceWith = this.replaceWith;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
  }

  replaceSelected(event, action) {
    var payload: any = {};
    payload.action = action;
    payload.searchedText = this.searchedText;
    payload.replaceWith = this.replaceWith;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
  }

  findPrevious() {
    var payload: any = {};
    payload.action = "FindPrevious";
    payload.searchedText = this.searchedText;
    payload.replaceWith = this.replaceWith;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
  }

  dismiss(action) {
    var payload: any = {};
    payload.action = action;
    payload.searchedText = this.searchedText;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
    this.searchedText = "";
    this.replaceWith = "";
    this.popover.hide();
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  isNext() {
    return this.designerService.isFindNext;
  }

  isPrevious() {
    return (this.designerService.searchIndex > 1 && this.designerService.findElements.length > 1 && this.designerService.searchIndex <= this.designerService.findElements.length)
  }

  toggleCollapse() {
    this.show = !this.show;
    if (this.show) {
      this.imageName = this.translate.instant("collapse");
    }
    else {
      this.imageName = this.translate.instant("expand");
    }
  }

  generateReportPopup() {
    this.dialogService.open(GenerateReportComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  previewDocView()
  {
    this.dialogService.open(PreviewDocViewComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  ungroupStack() {
    if (this.designerService.isDeliverableSection === true) {
      let payLoad = ActionOnBlockStack.unGroupDeliverable;
      this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad);
    }
    else if (this.designerService.isTemplateSection === true) {
      let payLoad = ActionOnBlockStack.unGroupTemplate;
      this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad);
    }
  }

  createStackPopup() {
    this.dialogService.open(CreateStackAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  toggleDefineColors() {
    this.dialogService.open(DefineColorsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  toggleBlockAttributeComponent(action: string) {
    this.subscriptions.add(this._eventService
      .getEvent(eventConstantsEnum.projectDesigner.documentView.action)
      .publish('toggleblockattributecomponent'));
  }
  loadCreateBlock() {
    if (this.designerService.isDeliverableSection === true)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.deliverables);
    else if (this.designerService.isTemplateSection === true)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.templates);
    else if (this.designerService.isLibrarySection === true)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.library);

    this.dialogService.open(CreateBlockAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  removeBlock() {
    let payLoad = ActionOnBlockStack.delete;
    if (this.designerService.isDeliverableSection === true) {
      this._eventService.getEvent(EventConstants.DeliverableSection).publish(payLoad);
      this.deliverableService.reloadDeliverableDocumentView();
    } else if (this.designerService.isTemplateSection === true) {
      this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad);
      this.templateService.reloadTemplateDocumentView();
    }
    else if (this.designerService.isLibrarySection === true) {
      this._eventService.getEvent(EventConstants.LibrarySection).publish(payLoad);
      // this.libraryService.reloadLibraryDocumentView();
    }
  }

  demoteBlock() {
    if (this.designerService.isDeliverableSection === true) {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(ActionOnBlockStack.demote));

    }
    else {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(ActionOnBlockStack.demote));
      // this.templateService.reloadTemplateDocumentView();

    }
  }
  promoteBlock() {
    if (this.designerService.isDeliverableSection === true) {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(ActionOnBlockStack.promote));
    }
    else {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(ActionOnBlockStack.promote));

    }
  }
  copyBlocks() {
    this.designerService.blocksToBeCopied = new Array();
    this.designerService.blocksToBeCopied = this.designerService.blockList;
    this.designerService.isCopied = true;
    if (this.designerService.isDeliverableSection === true) {
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.copyDeliverable).publish(this.designerService.isCopied));

    }
    else {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(this.designerService.isCopied));

    }
  }
  pasteBlock(node) {
    // this.templateService.pasteEvent(node);
  }

  addToLibrary() {
    if (this.designerService.blockList.length == 0)
      this.designerService.blockList = this.blockList;
    this.dialogService.open(AddToLibraryComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  loadSuggest() {
    this.dialogService.open(SuggestBlockComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  generateLinkToPopup() {
    this.dialogService.open(DeliverableBlockComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  blockStaffingComponent() {
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockStaffingIcon).publish("EnableIcon"));
  }

  enableDisableToolbarIcons(payload) {
    this.docViewToolbarIcons = new DocumentViewIcons();
    this.docViewToolbarIcons.enableCreateQuestions = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanSave);
    this.designerService.canCreateQuestion = this.docViewToolbarIcons.enableCreateQuestions;
    this.docViewToolbarIcons.enableSave = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanSave);
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.isEnableDocContentLUReadOnly).publish(this.docViewToolbarIcons.enableSave));
    this.docViewToolbarIcons.enableFormatting = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanFormat);
    if (this.designerService.isLibrarySection === true && this.designerService.libraryDetails.id != 5 && this.designerService.libraryDetails.isActive === true) {
      if (payload.blockSelectCount == 1) {
        this.docViewToolbarIcons.enableAttributes = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanViewAttribute);
        return;
      }
    }
    if (this.designerService.isExtendedIconicView === true && !this.designerService.LoadAllBlocksDocumentView === true) {
      this.docViewToolbarIcons.enableGenerate = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanGenerate);
      if (payload.blockSelectCount >= 1) {
        this.docViewToolbarIcons.enableAttributes = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanViewAttribute);
        if (this.designerService.isLibrarySection == false && !this.designerService.isDeliverableSection == true) {
          this.docViewToolbarIcons.enableLinkTo = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanLink);
        }
        this.docViewToolbarIcons.enableAddToLibrary = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanEditAttribute);
        this.docViewToolbarIcons.enableSuggestForLib = (this.docViewRights && !this.docViewRights.isExternalUser) ? true : false;
      }
    }
    else if (!payload.nodeCount || payload.nodeCount <= 0 || payload.blockSelectCount <= 0) {
      this.docViewToolbarIcons.enableGenerate = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanGenerate);
      this.docViewToolbarIcons.enableCreateBlock = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCreateBlock);
    }
    else {
      this.docViewToolbarIcons.enableGenerate = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanGenerate);
      if(payload.blockSelectCount > 0 && payload.isStack === false)
      {
        if (payload.previousId !== ValueConstants.DefaultId) {
          this.docViewToolbarIcons.enableDemote = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPromoteDemote);
        }
        if (payload.nodeLevel != 0 && !payload.isParentStack) {
          this.docViewToolbarIcons.enablePromote = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPromoteDemote);
        }
      }
      if (payload.blockSelectCount == 1 && payload.isStack === false) {
        this.docViewToolbarIcons.enableCreateBlock = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCreateBlock);
        this.docViewToolbarIcons.enableAttributes = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanViewAttribute);
        this.docViewToolbarIcons.enableRemove = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanDelete);
        this.docViewToolbarIcons.enableCopy = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCopyPaste);
        this.docViewToolbarIcons.enableAddToLibrary = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanEditAttribute);
        this.docViewToolbarIcons.enableSuggestForLib = (this.docViewRights && !this.docViewRights.isExternalUser) ? true : false;
        if (this.designerService.isDeliverableSection === false && this.designerService.isLibrarySection == false) {
          this.docViewToolbarIcons.enableLinkTo = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanLink);
        }
        if (this.designerService.isDeliverableSection === true && this.projectDetails.ProjectAccessRight.isCentralUser === true) {
          this.docViewToolbarIcons.enableBlockStaff = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanStaff);
        }
        if (this.designerService.isDeliverableSection === true && this.projectDetails.ProjectAccessRight.isCentralUser === true) {
          this.docViewToolbarIcons.enableBlockStaff = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanStaff);
        }
      }
      else if (payload.blockSelectCount == 1 && payload.isStack) {
        this.docViewToolbarIcons.enableUnStack = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanUnstack);
        this.docViewToolbarIcons.enableCreateBlock = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCreateBlock);
        this.docViewToolbarIcons.enableAttributes = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanViewAttribute);
        this.docViewToolbarIcons.enableRemove = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanDelete);
        this.docViewToolbarIcons.enableCopy = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCopyPaste);
        if (this.designerService.isDeliverableSection === false && this.designerService.isLibrarySection == false) {
          this.docViewToolbarIcons.enableLinkTo = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanLink);
        }
      }
      else if (payload.blockSelectCount > 1 && payload.nodeLevel == 0 && !payload.isStack && !payload.isParentStack) {
        this.docViewToolbarIcons.enableCreateStack = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCreateStack);
        this.docViewToolbarIcons.enableRemove = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanDelete);
        this.docViewToolbarIcons.enableCopy = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCopyPaste);
        this.docViewToolbarIcons.enableAddToLibrary = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanEditAttribute);
        this.docViewToolbarIcons.enableSuggestForLib = (this.docViewRights && !this.docViewRights.isExternalUser) ? true : false;
        if (this.designerService.isDeliverableSection === false && this.designerService.isLibrarySection == false) {
          this.docViewToolbarIcons.enableLinkTo = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanLink);
        }
        if (this.designerService.isDeliverableSection === true && this.projectDetails.ProjectAccessRight.isCentralUser === true) {
          this.docViewToolbarIcons.enableBlockStaff = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanStaff);
        }
      }
    }
    if (this.designerService.appendixBlockExists)
      this.docViewToolbarIcons.enableRemove = false;
  }

  checkDeliverableRoles() {
    if (this.designerService.deliverableDetails && this.docViewRights.deliverableRole && this.docViewRights.deliverableRole.length > 0) {
      this.selectedDeliverable = this.designerService.deliverableDetails;
      this.docViewRoles = this.docViewRights.deliverableRole.filter(e => e.entityId === this.selectedDeliverable.entityId);
      this.designerService.selectedDeliverableDocRights = this.docViewRoles;
    }
  }

  checkIsInRoles(roleToCompare) {
    if (this.designerService.isTemplateSection && this.docViewRights.hasProjectTemplateAccess) {
        return true;
    }
    else if (this.docViewRoles && this.docViewRoles.length > 0) {
      if (this.docViewRoles[0].roles.find(i => i == roleToCompare))
        return true;
      else
        return false;
    }
  }

  disableAutoPropagation()
  {
    return (this.designerService.templateDetails && this.designerService.templateDetails.automaticPropagation)
  }
  formatPainter(){
    this.designerService.enableFormatPainter = true;
    this.designerService.enableDefaultPainter = false;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.FormatPainterAddClass).publish(true));
  }
  disableDeleteForLockedBlock()
  {
    return (this.designerService.assignToBlockList && this.designerService.assignToBlockList.filter(x=>x.isLocked).length)
  }
}
