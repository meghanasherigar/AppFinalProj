import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { DesignerService } from '../../../services/designer.service';
import { eventConstantsEnum, EventConstants } from '../../../../../@models/common/eventConstants';
import { regions, viewAttributeModel, LibraryEnum } from '../../../../../@models/projectDesigner/common';
import { Subscription } from 'rxjs';
import { LibraryService } from '../../../services/library.service';
import { LibraryBlockDetails, LibraryDropdownViewModel } from '../../../../../@models/projectDesigner/library';
import { BlockDetailsResponseViewModel } from '../../../../../@models/projectDesigner/block';
import { DesignerService as DesignerServiceProjDesign } from '../../../../project-design/services/designer.service';
import { NbDialogService } from '@nebular/theme';
import { ImportBlocksProcessComponent } from '../../../../project-design/modules/icon-view/block-importer/import-blocks-process/import-blocks-process.component';

export const RegionNames = {
  "LIBRARY": "library",
  "DELIVERABLES": "deliverables",
  "TEMPLATES": "templates",
  "NONE": "none",
  "BLOCKIMPORTER": "BlockImporter",
  "TEMPLATE": "Template",
  "GLOBAL": "Global"
}

@Component({
  selector: 'ngx-global-library',
  templateUrl: './global-library.component.html',
  styleUrls: ['./global-library.component.scss']
})
export class GlobalLibraryComponent implements OnInit, OnDestroy {

  constructor(private readonly _eventService: EventAggregatorService,
    private libraryService: LibraryService,
    private dialogService: NbDialogService,
    private designerService: DesignerService, private designerServiceProjectDesigner: DesignerServiceProjDesign) { }

  subscriptions: Subscription = new Subscription();
  DisplayLibrary: boolean = true;
  DisplayTemplates: boolean = true;
  DisplayDeliverables: boolean = true;
  isEnableAttribute: boolean;
  Theme2Library: boolean = false;
  libraryAttributeViewFlag: boolean = false;
  deliverableAttributeViewFlag: boolean = false;
  templateAttributeViewFlag: boolean = false;
  DisplayBlock: boolean = false;
  libraryList: any;
  selectedLibrary: any;
  libraryBlockDetails = new LibraryBlockDetails();
  DisplayBlockImporter: boolean = false;

  ngOnInit() {
    this.designerService.isGLobal = true;
    this.designerServiceProjectDesigner.manageLibraryDetails = new LibraryDropdownViewModel();
    this.designerServiceProjectDesigner.manageLibraryDetails.name = LibraryEnum.global;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryChange).publish(undefined);

    this.designerService.isExtendedIconicView = false;
    this.designerService.SelectedOption = '';
    this.isEnableAttribute = false;
    this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
      this.libraryBlockDetails.blocks = data;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);
    });
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.adminAction).publish(false);

    this.subscriptions.add(this._eventService.getEvent(EventConstants.LibrarySection).subscribe((payload: viewAttributeModel) => {
      let regionName = regions[payload.regionType];
      if (regionName == RegionNames.LIBRARY) {
        this.libraryAttributeViewFlag = true;
        this.DisplayLibrary = false;
        this.DisplayTemplates = false;
        this.DisplayDeliverables = false;
      }
      else if (regionName == RegionNames.NONE) {
        this.libraryAttributeViewFlag = false;
        this.deliverableAttributeViewFlag = false;
        this.templateAttributeViewFlag = false;
        this.DisplayLibrary = true;
        this.DisplayTemplates = true;
        this.DisplayDeliverables = true;
        this.DisplayBlockImporter = false;
      }

    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.editBlockExtendedViewGlobal).subscribe((payload: any) => {
      if (payload.section == RegionNames.TEMPLATE) {
        this.DisplayTemplates = true;
        this.DisplayBlock = true;
        this.DisplayDeliverables = false;
        this.DisplayLibrary = false;
        this.designerService.isExtendedIconicView = true;
      } else if (payload.section == RegionNames.BLOCKIMPORTER) {
        this.DisplayTemplates = false;
        this.DisplayBlock = false;
        this.DisplayDeliverables = false;
        this.DisplayLibrary = false;
        this.designerService.isExtendedIconicView = false;
        this.libraryAttributeViewFlag = false;
        this.deliverableAttributeViewFlag = false;
        this.templateAttributeViewFlag = false;
       this.dialogService.open(ImportBlocksProcessComponent, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
      }
    }));

    this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).subscribe((selectedSection: any) => {
      if (regions.deliverables == selectedSection) {
        this.designerService.isDeliverableSection = true;
        this.designerService.isLibrarySection = false;
        this.designerService.isTemplateSection = false;
      }
      if (regions.library == selectedSection) {
        this.designerService.isDeliverableSection = false;
        this.designerService.isLibrarySection = true;
        this.designerService.isTemplateSection = false;
      }
      if (regions.templates == selectedSection) {
        this.designerService.isDeliverableSection = false;
        this.designerService.isLibrarySection = false;
        this.designerService.isTemplateSection = true;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
