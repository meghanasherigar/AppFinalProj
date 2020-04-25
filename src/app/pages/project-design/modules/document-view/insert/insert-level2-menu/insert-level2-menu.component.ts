import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { NbDialogService, NbPopoverDirective } from '@nebular/theme';
import { AbbreviationsComponent } from '../abbreviations/abbreviations.component';
import { ViewAbbreviationsComponent } from '../view-abbreviations/view-abbreviations.component';
import { DesignerService } from '../../../../services/designer.service';
import { SubMenus } from '../../../../../../@models/projectDesigner/designer';
import { HyperlinkComponent } from '../hyperlink/hyperlink.component';
import { CrossReferenceComponent } from '../cross-reference/cross-reference.component';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../@models/common/eventConstants';
import { debug } from 'util';
import { blockSelectedModel, DocumentViewIcons } from '../../../../../../@models/projectDesigner/block';
import { UserRightsViewModel, DocViewDeliverableRoleViewModel, DocumentViewAccessRights } from '../../../../../../@models/userAdmin';
import { DeliverableViewModel } from '../../../../../../@models/projectDesigner/deliverable';
import { ImportTransactionsComponent } from '../import-transactions/import-transactions.component';
import { InsertCoverPageComponent } from '../../../icon-view/manage-blocks/extended-view/insert-cover-page/insert-cover-page.component';
//import moment = require('moment');
import * as moment from 'moment';
import { ActionEnum, Symbols, TimeStampLists, HeaderFooterViewModel, HeaderTypeEnum, FooterTypeEnum } from '../../../../../../@models/projectDesigner/common';
import { SymbolsComponent } from '../symbols/symbols.component';
import { TableOfContentsComponent } from '../table-of-contents/table-of-contents.component';
import { BookMarkComponent } from '../book-mark/book-mark.component';
import { IndentationLevelComponent } from '../indentation-level/indentation-level.component';
import { DocumentViewService } from '../../../../services/document-view.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-insert-level2-menu',
  templateUrl: './insert-level2-menu.component.html',
  styleUrls: ['./insert-level2-menu.component.scss']
})
export class InsertLevel2MenuComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
  toolbarIcons = new DocumentViewIcons();
  docViewRights: UserRightsViewModel;
  docViewRoles: DocViewDeliverableRoleViewModel[];
  selectedDeliverable: DeliverableViewModel;
  editorId: string = "";
  timeStampLists = TimeStampLists;
  symbols = Symbols;
  appliedPageBreak: boolean;
  loaderId = 'FullViewLoader';

  constructor(private dialogService: NbDialogService,
    private designerService: DesignerService,
    private readonly _eventService: EventAggregatorService,
    private el: ElementRef,
    private documentViewService: DocumentViewService,
    private ngxLoader : NgxUiLoaderService,
    private router: Router) {

  }

  ngOnInit() {
    this.toolbarIcons = new DocumentViewIcons();
    this.enableDisableIconsAsPerRoles();
    this.subscriptions.add(this._eventService.getEvent("insertLayoutToolbarIcons2").subscribe((data => {
      this.enableDisableIconsAsPerRoles();
    })));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconImportTransaction)
      .subscribe((payload: any) => {
        this.toolbarIcons.enableImportTransactions = payload.isImportEnabled;
        this.editorId = payload.editorId;
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.highlight_Pageborder)
      .subscribe((payload: any) => {
        this.appliedPageBreak = payload.isPageBreakApplied;
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.insert.pageBreak).subscribe(data => {
      if (this.designerService.blockList.length > 1) {
        this.toolbarIcons.enablePageBreak = false;
      }
      else {
        this.toolbarIcons.enablePageBreak = true;
      }
    }));
  }

  enableDisableIconsAsPerRoles() {
    if (this.designerService.docViewAccessRights) {
      this.docViewRights = this.designerService.docViewAccessRights;
      if (!this.docViewRights.isCentralUser && !this.designerService.isTemplateSection)
        this.checkDeliverableRoles();
      if (this.designerService.isLibrarySection && this.designerService.libraryDetails.name != EventConstants.BlockCollection && this.designerService.libraryDetails.isActive) {
        this.disableAllIconsForLibrary();
        return;
      }
      else if (this.designerService.isLibrarySection && this.designerService.libraryDetails.name == EventConstants.BlockCollection) {
        this.DisableIconsForExtendedView();
        return;
      }
      if (this.designerService.isExtendedIconicView && !this.designerService.LoadAllBlocksDocumentView) {
        this.DisableIconsForExtendedView();
        this.toolbarIcons.enableShapes = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanShapes);
        this.toolbarIcons.enablePictures = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPictures);
        this.toolbarIcons.enableFootNote = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanFootNote);
        this.toolbarIcons.enableTimeStamp = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanTimeStamp);
        this.toolbarIcons.enableSymbol = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanSymbol);
        this.toolbarIcons.enableAbbreviation = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanAbbreviation);
      }
      else {
        this.toolbarIcons.enableCoverPage = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCoverPage);
        this.toolbarIcons.enablePageBreak = (this.designerService.blockList.length > 1) ? false : (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPageBreak);
        this.toolbarIcons.enableSectionBreak = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanSectionBreak);
        this.toolbarIcons.enableCrossReference = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCrossReference);
        this.toolbarIcons.enableShapes = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanShapes);
        this.toolbarIcons.enablePictures = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPictures);
        this.toolbarIcons.enableHeadersAndFooters = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanHeadersAndFooters);
        this.toolbarIcons.enablePageNumber = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPageNumber);
        this.toolbarIcons.enableTableofContent = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanTableofContent);
        this.toolbarIcons.enableCrossReference = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanCrossReference);
        this.toolbarIcons.enableFootNote = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanFootNote);
        this.toolbarIcons.enableTimeStamp = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanTimeStamp);
        this.toolbarIcons.enableSymbol = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanSymbol);
        this.toolbarIcons.enableAbbreviation = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanAbbreviation);
        this.toolbarIcons.enableIndentation = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPageBreak);
      }

      this.toolbarIcons.enableImportTransactions = false;
    }
  }

  disableAllIconsForLibrary() {
    this.toolbarIcons.enableCoverPage = false;
    this.toolbarIcons.enablePageBreak = false;
    this.toolbarIcons.enableSectionBreak = false;
    this.toolbarIcons.enableCrossReference = false;
    this.toolbarIcons.enableShapes = false;
    this.toolbarIcons.enablePictures = false;
    this.toolbarIcons.enableHeadersAndFooters = false;
    this.toolbarIcons.enablePageNumber = false;
    this.toolbarIcons.enableTableofContent = false;
    this.toolbarIcons.enableCrossReference = false;
    this.toolbarIcons.enableFootNote = false;
    this.toolbarIcons.enableTimeStamp = false;
    this.toolbarIcons.enableSymbol = false;
    this.toolbarIcons.enableAbbreviation = false;
    this.toolbarIcons.enableIndentation = false;
  }

  symbolsPopUp() {
    this.dialogService.open(SymbolsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    })
  }

  abbreviationPopup() {
    this.dialogService.open(AbbreviationsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  viewAbbreviation() {
    this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['viewabbreviations'], level2Menu: ['viewAbbLevel2Menu'], topmenu: ['iconviewtopmenu'] } }]);
    this.designerService.changeTabDocumentView(SubMenus.ViewAbbreviations);
  }

  hyperlinkBlock() {
    this.dialogService.open(HyperlinkComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  addFootNote() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.addFootNote).publish(undefined);
  }

  crossReferenceBlock() {
    this.dialogService.open(CrossReferenceComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  loadHeader(value) {
    let placeHolder = ActionEnum.typeSomething;
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    let id = "";
    if (this.designerService.isTemplateSection && this.designerService.templateDetails) {
      id = this.designerService.templateDetails.templateId;
    }
    else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails) {
      id = this.designerService.deliverableDetails.deliverableId;
    }
    let headerText = "";
    switch (value) {
      case HeaderTypeEnum.headerType1:
        headerText = '<p>' + placeHolder + '</p><p></p>';
        break;
      case HeaderTypeEnum.headerType2:
        headerText = '<p>' + placeHolder + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'
          + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp' + placeHolder + '</p>';
        break;
      case HeaderTypeEnum.headerType3:
        headerText = '<p></p><p>' + placeHolder + '</p>';
        break;
      }

    this.documentViewService.getHeaderFooterText(this.designerService.currentProjectId, id).subscribe(response => {
      let headerRequestViewModel = new HeaderFooterViewModel();
      if (response.header != null) {
        headerRequestViewModel.Id = response.header.id;
      }
      headerRequestViewModel.Content = headerText;
      headerRequestViewModel.ContentType = "Header";
      if (this.designerService.isDeliverableSection === true) {
        headerRequestViewModel.IsTemplate = false;
      }
      else if (this.designerService.isTemplateSection === true) {
        headerRequestViewModel.IsTemplate = true;
      }
      headerRequestViewModel.ProjectId = this.designerService.currentProjectId;
      headerRequestViewModel.TemplateOrDeliverableId = id;
      let headerObject = JSON.parse(JSON.stringify(headerRequestViewModel));

      if (response.header != null)
        this.documentViewService.updateHeaderText(headerObject).subscribe(response => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(ActionEnum.reloadEditor);
        });
      else
        this.documentViewService.saveHeaderText(headerObject).subscribe(response => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(ActionEnum.reloadEditor);
        });
    });
  }

  loadFooter(value) {
    let placeHolder = ActionEnum.typeSomething;
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    let id = "";
    if (this.designerService.isTemplateSection && this.designerService.templateDetails) {
      id = this.designerService.templateDetails.templateId;
    }
    else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails) {
      id = this.designerService.deliverableDetails.deliverableId;
    }
    let footerText = "";
    switch (value) {
      case FooterTypeEnum.footerType1:
        footerText = '<p>' + placeHolder + '</p><p></p>';
        break;
      case FooterTypeEnum.footerType2:
        footerText = '<p>' + placeHolder + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'
          + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp' + placeHolder + '</p>';
        break;
      case FooterTypeEnum.footerType3:
        footerText = '<p></p><p>' + placeHolder + '</p>';
        break;
      }

    this.documentViewService.getHeaderFooterText(this.designerService.currentProjectId, id).subscribe(response => {
      let footerRequestViewModel = new HeaderFooterViewModel();
      if (response.footer != null) {
        footerRequestViewModel.Id = response.footer.id;
      }
      footerRequestViewModel.Content = footerText;
      footerRequestViewModel.ContentType = "Footer";
      if (this.designerService.isDeliverableSection === true) {
        footerRequestViewModel.IsTemplate = false;
      }
      else if (this.designerService.isTemplateSection === true) {
        footerRequestViewModel.IsTemplate = true;
      }
      footerRequestViewModel.ProjectId = this.designerService.currentProjectId;
      footerRequestViewModel.TemplateOrDeliverableId = id;
      let footerObject = JSON.parse(JSON.stringify(footerRequestViewModel));

      if (response.footer != null)
        this.documentViewService.updateFooterText(footerObject).subscribe(response => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(ActionEnum.reloadEditor);
        });
      else
        this.documentViewService.saveFooterText(footerObject).subscribe(response => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(ActionEnum.reloadEditor);
        });
    });
  }

  RemoveHeader() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteHeader).publish("DeleteHeader");
  }

  RemoveFooter() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteFooter).publish("DeleteFooter");
  }

  loadTableOfContents(value) {
    this.dialogService.open(TableOfContentsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { value }
    });
  }

  RemoveTableOfContent() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.removeTableOfContent).publish(true);
  }

  dismiss() {
    this.popover.hide();
  }

  DisableIconsForExtendedView() {
    this.toolbarIcons.enableCoverPage = false;
    this.toolbarIcons.enablePageBreak = false;
    this.toolbarIcons.enableSectionBreak = false;
    this.toolbarIcons.enableCrossReference = false;
    this.toolbarIcons.enableHeadersAndFooters = false;
    this.toolbarIcons.enableTableofContent = false;
    this.toolbarIcons.enablePageNumber = false;
    this.toolbarIcons.enableIndentation = false;
  }

  checkDeliverableRoles() {
    if (this.designerService.deliverableDetails && this.docViewRights.deliverableRole && this.docViewRights.deliverableRole.length > 0) {
      this.selectedDeliverable = this.designerService.deliverableDetails;
      this.docViewRoles = this.docViewRights.deliverableRole.filter(e => e.entityId === this.selectedDeliverable.entityId);
      this.designerService.selectedDeliverableDocRights = this.docViewRoles;
    }
  }

  checkIsInRoles(roleToCompare) {
    if (this.docViewRoles && this.docViewRoles.length > 0) {
      if (this.docViewRoles[0].roles.find(i => i == roleToCompare))
        return true;
      else
        return false;
    }
    else {
      if (this.designerService.isTemplateSection && this.docViewRights.hasProjectTemplateAccess)
        return true;
    }
  }

  openCoverPage() {
    this.dialogService.open(InsertCoverPageComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  importTransactionsPopup() {
    this.dialogService.open(ImportTransactionsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { editorId: this.editorId, entityId: this.designerService.deliverableDetails.deliverableId }
    });
  }
  insertSymbol(symbol) {
    let payload: any = {};
    payload.action = ActionEnum.InsertTable;
    payload.data = symbol;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  pageBreak() {
    if (!this.appliedPageBreak)
      this.appliedPageBreak = true;
    else
      this.appliedPageBreak = false;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.pageBreak).publish(this.appliedPageBreak);
  }

  generateBookMark() {
    this.dialogService.open(BookMarkComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  indentationLevelPopup() {
    let id: string;
    let isTemplate: boolean = false;
    if (this.designerService.isTemplateSection && this.designerService.templateDetails) {
      id = this.designerService.templateDetails.templateId;
      isTemplate = true;
    }
    else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails) {
      id = this.designerService.deliverableDetails.deliverableId;
      isTemplate = false;
    }

    this.dialogService.open(IndentationLevelComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { templateOrDeliverableId: id, isTemplate: isTemplate }
    });
  }
}
