import { Component, OnInit, ViewChild } from '@angular/core';
import { DocumentViewIcons ,LibraryOptions} from '../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../project-design/services/designer.service';
import { DesignerService as adminDesignerService } from '../../../services/designer.service'; 
import { LibraryEnum, ActionEnum, TimeStampLists, Symbols} from '../../../../../@models/projectDesigner/common';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { NbPopoverDirective, NbDialogService } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { InsertCoverPageComponent } from '../../content/insert-cover-page/insert-cover-page.component';
import { CrossReferenceComponent } from '../../../../project-design/modules/document-view/insert/cross-reference/cross-reference.component';
import { BookMarkComponent } from '../../../../project-design/modules/document-view/insert/book-mark/book-mark.component';
import { AbbreviationsComponent } from '../../../../project-design/modules/document-view/insert/abbreviations/abbreviations.component';
import { SubMenus } from '../../../../../@models/projectDesigner/designer';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-insert-level2-menu-library',
  templateUrl: './insert-level2-menu-library.component.html',
  styleUrls: ['./insert-level2-menu-library.component.scss']
})
export class InsertLevel2MenuLibraryComponent implements OnInit {
  toolbarIcons = new DocumentViewIcons();
  timeStampLists = TimeStampLists;
  symbols = Symbols;
  appliedPageBreak: boolean;
  selectedLibrary:any;
 LibraryOptions=LibraryOptions;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
  subscriptions: Subscription = new Subscription();

  constructor(private designerService: DesignerService, private readonly _eventService: EventAggregatorService, private admindesignerService: adminDesignerService,
    private dialogService: NbDialogService,private router: Router) { }

  ngOnInit() {
    
    const currentLibrary = this.admindesignerService.getCurrentLibraryPayload(this.admindesignerService.SelectedOption);
    this.enableDisableIconsAsPerLibrary();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryChange).subscribe(payload => {
      this.enableDisableIconsAsPerLibrary();
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.selectedAdminLibaryDropdown).subscribe(payload => {
     this.selectedLibrary=payload;
  
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.adminModule.insert.highlight_Pageborder)
      .subscribe((payload: any) => {
        this.appliedPageBreak = payload.isPageBreakApplied;
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.adminModule.insert.pageBreak).subscribe(data => {
      if (this.admindesignerService.blockList.length > 1) {
        this.toolbarIcons.enablePageBreak = false;
      }
      else {
        this.toolbarIcons.enablePageBreak = true;
      }
    }));
  }
  enableDisableIconsAsPerLibrary() {
    if (this.designerService.manageLibraryDetails.name.toLowerCase() != LibraryEnum.globaloecd && this.designerService.manageLibraryDetails.name.toLowerCase() != LibraryEnum.countrytemplate)
      this.disableAllIconsForLibrary();
    else
      this.enableAllIcons();
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
  }
  enableAllIcons() {
    this.toolbarIcons.enableCoverPage = true;
    this.toolbarIcons.enablePageBreak = true;
    this.toolbarIcons.enableSectionBreak = true;
    this.toolbarIcons.enableCrossReference = true;
    this.toolbarIcons.enableShapes = true;
    this.toolbarIcons.enablePictures = true;
    this.toolbarIcons.enableHeadersAndFooters = true;
    this.toolbarIcons.enablePageNumber = true;
    this.toolbarIcons.enableTableofContent = true;
    this.toolbarIcons.enableCrossReference = true;
    this.toolbarIcons.enableFootNote = true;
    this.toolbarIcons.enableTimeStamp = true;
    this.toolbarIcons.enableSymbol = true;
    this.toolbarIcons.enableAbbreviation = true;
  }
  loadHeader(value) {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.documentHeaderType).publish(value);
  }

  loadFooter(value) {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.documentFooterType).publish(value);
  }
  addFootNote() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.addFootNote).publish(undefined);
  }
  RemoveHeader() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteHeader).publish("DeleteHeader");
  }

  RemoveFooter() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteFooter).publish("DeleteFooter");
  }
  
  loadTableOfContents(value){
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.tableOfContentType).publish(value);
  }

  RemoveTableOfContent(){
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.removeTableOfContent).publish(true);
  }
  insertSymbol(symbol) {
    let payload: any = {};
    payload.action = ActionEnum.InsertTable;
    payload.data = symbol;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
  } 
  abbreviationPopup() {
    this.dialogService.open(AbbreviationsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  viewAbbreviation() {
    this.router.navigate(['pages/admin/adminMain/', { outlets: { primary: ['viewabbreviations'], level2Menu: ['viewAbbLevel2Menu'], topmenu: ['libraryviewtopmenu'] } }]);
    this.admindesignerService.changeTabDocumentView(SubMenus.ViewAbbreviations);
  }
  importTransactionsPopup() {}
  
  dismiss() {
    this.popover.hide();
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

  openCoverPage() {
    this.dialogService.open(InsertCoverPageComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  crossReferenceBlock() {
    this.dialogService.open(CrossReferenceComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  
  generateBookMark(){
    this.dialogService.open(BookMarkComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }
  
}
