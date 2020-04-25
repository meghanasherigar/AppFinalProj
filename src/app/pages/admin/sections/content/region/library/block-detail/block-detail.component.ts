import { Component, OnInit, ElementRef } from '@angular/core';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../../../project-design/services/designer.service';
import { LibraryEnum, DocumentConfigurationModel, ContentTypeViewModel, BorderDetails, LineStyleViewModel, RGBColors } from '../../../../../../../@models/projectDesigner/common';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../../@models/common/eventConstants';
import { TemplateService } from '../../../../../../project-design/services/template.service';
import { TemplateResponseViewModel, TemplateViewModel, TemplateAndBlockDetails, LibraryDetailsRequestModel } from '../../../../../../../@models/projectDesigner/template';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeliverableDropDownResponseViewModel, DeliverablesInput, PageBorderStyles } from '../../../../../../../@models/projectDesigner/deliverable';
import { DeliverableService } from '../../../../../../project-design/services/deliverable.service';
import { LibraryService } from '../../../../../services/library.service';
import { LibraryDropdownViewModel, LibraryBlockDetails, SearchLibraryViewModel } from '../../../../../../../@models/projectDesigner/library';
import { BlockDetailsResponseViewModel } from '../../../../../../../@models/projectDesigner/block';
import { MultiRootEditorService } from '../../../../../../../shared/services/multi-root-editor.service';
import { ResponseStatus } from '../../../../../../../@models/ResponseStatus';
import { DialogTypes } from '../../../../../../../@models/common/dialog';
import { DocumentViewService } from '../../../../../../project-design/services/document-view.service';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { DesignerService as DesignerServiceAdmin} from '../../../../../services/designer.service';

@Component({
  selector: 'ngx-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss']
})
export class BlockDetailComponent implements OnInit {

  isDetailFound: boolean;
  viewAllMode: boolean = false;
  projectId: any;
  blockContentPayload: {};
  DisplayTemplates: boolean
  DisplayBlock: boolean
  templateList: any;
  selectedTemplate: any;
  selectedDeliverable: any;
  blockContentList = new Array();
  hideAttributeIcon: boolean = true;
  deliverablesInput = new DeliverablesInput();
  templateSection: boolean = false;
  deliverableSection: boolean = false;
  librarySection: boolean = false;
  subscriptions: Subscription = new Subscription();
  libraryList: any;
  blockCollection: any = [];
  selectedLibrary: any;
  libraryBlockDetails = new LibraryBlockDetails();
  shareDetailService: ShareDetailService
  requestModel = new SearchLibraryViewModel();
  showTrackChanges: boolean = false;

  constructor(
    private designerService: DesignerService,
    private deliverableService: DeliverableService,
    private libraryService: LibraryService,
    private _eventService: EventAggregatorService,
    private templateService: TemplateService,
    private router: Router,
    private multiRootEditorService: MultiRootEditorService,
    private elRef: ElementRef,
    private documentViewService: DocumentViewService,
    private dialogService: DialogService,
    private designerServiceAdmin: DesignerServiceAdmin
  ) { }

  ngOnInit() {
    this.showTrackChanges = this.multiRootEditorService.isTrackChangesEnabled;
    this.designerService.LoadAllBlocksDocumentView = true;
    this.designerService.isLibrarySection = true;
    this.designerService.libraryDetails = new LibraryDropdownViewModel();
    this.designerService.libraryDetails.name = LibraryEnum.global;
    this.isDetailFound = false;
    this.viewAllMode = true;
    this.projectId = this.designerServiceAdmin.dummyProjectDetails.projectId;

    if (this.designerService.isLibrarySection === true) {
      this.librarySection = true;
      this.libraryService.getlibrarytypes().subscribe((data: LibraryDropdownViewModel[]) => {
        this.libraryList = data;
        let blockList = { 'id': 4, name: "Blocks", isActive: true };
        this.blockCollection.push(blockList);
        let globalLib = this.libraryList.find(x => x.name == this.designerService.libraryDetails.name);
        if (globalLib != undefined) {
          this.selectedLibrary = globalLib;
          this.libraryBlockDetails.library = globalLib;
        } else {
          this.selectedLibrary = blockList;
          this.libraryBlockDetails.library = blockList;
        }
        this.requestModel.PageIndex = 1;
        this.requestModel.PageSize = 50;
        this.requestModel.isGlobal = false;

      });
    }

    this.designerService.isExtendedIconicView = true;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action)
      .subscribe(data => {
        if (data === 'toggleblockattributecomponent') {
          this.hideAttributeIcon = !this.hideAttributeIcon;
        }
      });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
