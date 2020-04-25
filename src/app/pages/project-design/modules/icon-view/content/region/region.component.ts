import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum, IconViewSection } from '../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { viewAttributeModel, regions } from '../../../../../../@models/projectDesigner/common';
import { DesignerService } from '../../../../services/designer.service';
import { ThemingContext, Theme, Themes } from '../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { NbDialogService } from '@nebular/theme';
// import { ImportedBlocksPdfComponent } from '../../../../../admin/block-importer/imported-blocks-pdf/imported-blocks-pdf.component';
import { ImportedBlocksPdfHeaderComponent } from '../../../../../admin/block-importer/imported-blocks-pdf-header/imported-blocks-pdf-header.component';
import { ImportBlocksProcessComponent } from '../../block-importer/import-blocks-process/import-blocks-process.component';
import { DocumentLayoutStyle } from '../../../../../../@models/projectDesigner/formatStyle';
import { DocumentViewService } from '../../../../services/document-view.service';
import { ProjectContext } from '../../../../../../@models/organization';

@Component({
  selector: 'ngx-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss']
})
export class RegionComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor(
    private readonly _eventService: EventAggregatorService, private designerService: DesignerService, private dialogService: NbDialogService, private sharedService: ShareDetailService, private documentViewService: DocumentViewService
  ) { }

  subscriptions: Subscription = new Subscription();
  DisplayLibrary: boolean = false;
  DisplayTemplates: boolean = false;
  DisplayDeliverables: boolean = false;
  ShowLibrary1: boolean = false;
  ShowLibrary2: boolean = false;
  ShowTemplatesDeliverables: boolean = false;
  libraryAttributeViewFlag: boolean = false;
  deliverableAttributeViewFlag: boolean = false;
  templateAttributeViewFlag: boolean = false;
  DisplayBlock: boolean = false;
  DisplayBlockImporter: boolean = false;
  DisplayBlockImporterPdf: boolean = false;
  DisplayLibraryBlockSuggestion: boolean = false;
  isTheme2: boolean = false;
  isTheme3: boolean = false;
  isTheme4: boolean = false;
  themingContext: ThemingContext;
  projectDetails: ProjectContext;

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.designerService.isProjectManagement = false;
    this.getDocumentLayoutStyle();
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).subscribe((payload: viewAttributeModel) => {
      this.designerService.isExtendedIconicView = false;
      this.DisplayBlockImporter = false;
      this.DisplayBlockImporterPdf = false;
      this.DisplayLibraryBlockSuggestion = false;
      let regionName = regions[payload.regionType]
      this.isTheme3 = false;
      this.isTheme2 = false;
      this.isTheme4 = false;

      if (regionName == "library") {
        this.libraryAttributeViewFlag = true;
        this.DisplayLibrary = false;
        this.DisplayTemplates = false;
        this.DisplayDeliverables = false;
      }

      else if (regionName == "deliverables") {
        this.deliverableAttributeViewFlag = true;
        this.DisplayLibrary = false;
        this.DisplayTemplates = false;
        this.DisplayDeliverables = false;
      }

      else if (regionName == "templates") {
        this.templateAttributeViewFlag = true;
        this.DisplayLibrary = false;
        this.DisplayTemplates = false;
        this.DisplayDeliverables = false;
      }
      else if (regionName == "none") {
        this.libraryAttributeViewFlag = false;
        this.deliverableAttributeViewFlag = false;
        this.templateAttributeViewFlag = false;
        this.themingContext = this.sharedService.getSelectedTheme();

        if (this.themingContext && this.themingContext != null) {
          if (this.themingContext.theme.toString() == "Theme3")
            this.isTheme3 = true
          else if (this.themingContext.theme.toString() == "Theme2")
            this.isTheme2 = true
          else if (this.themingContext.theme.toString() == "Theme1") //to do name need to changed once its active
            this.isTheme4 = true
        }
        else {
          this.DisplayLibrary = true;
          this.DisplayTemplates = true;
          this.DisplayDeliverables = true;
        }
      }

    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme1).subscribe((payload: any) => {
      // To hide the theme2 sections
      this.ShowLibrary1 = false;
      this.ShowLibrary2 = false;
      this.ShowTemplatesDeliverables = false;
      // To hide the theme3 sections
      this.isTheme3 = false;
      this.isTheme2 = false;
      this.isTheme4 = false;
      this.libraryAttributeViewFlag = false;
      this.deliverableAttributeViewFlag = false;
      this.templateAttributeViewFlag = false;

      this.designerService.isExtendedIconicView = false;
      this.DisplayBlockImporter = false;
      this.DisplayBlockImporterPdf = false;
      this.DisplayLibraryBlockSuggestion = false;

      payload.theme_options.forEach(item => {
        if (item.value == "Theme1.1" && item.checked == true) {
          this.DisplayLibrary = true;
        }
        if (item.value == "Theme1.1" && item.checked == false) {
          this.DisplayLibrary = false;
        }
        if (item.value == "Theme1.2" && item.checked == true) {
          this.DisplayTemplates = true;
        }
        if (item.value == "Theme1.2" && item.checked == false) {
          this.DisplayTemplates = false;
        }
        if (item.value == "Theme1.3" && item.checked == true) {
          this.DisplayDeliverables = true;
        }
        if (item.value == "Theme1.3" && item.checked == false) {
          this.DisplayDeliverables = false;
        }
      });

    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme2).subscribe((payload: any) => {
      this.isTheme2 = true;
      this.isTheme3 = false;
      this.isTheme4 = false;
      this.DisplayLibrary = this.DisplayTemplates = this.DisplayDeliverables = false;
      this.ShowLibrary1 = this.ShowLibrary2 = this.ShowTemplatesDeliverables = false;
      this.libraryAttributeViewFlag = this.deliverableAttributeViewFlag = this.templateAttributeViewFlag = false;
      this.designerService.isExtendedIconicView = false;
      this.DisplayBlockImporter = false;
      this.DisplayBlockImporterPdf = false;
      this.DisplayLibraryBlockSuggestion = false;
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme3).subscribe((payload: any) => {
      this.isTheme3 = true;
      this.isTheme2 = false;
      this.isTheme4 = false;
      this.DisplayLibrary = this.DisplayTemplates = this.DisplayDeliverables = false;
      this.ShowLibrary1 = this.ShowLibrary2 = this.ShowTemplatesDeliverables = false;
      this.libraryAttributeViewFlag = this.deliverableAttributeViewFlag = this.templateAttributeViewFlag = false;
      this.designerService.isExtendedIconicView = false;
      this.DisplayBlockImporter = false;
      this.DisplayBlockImporterPdf = false;
      this.DisplayLibraryBlockSuggestion = false;
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme4).subscribe((payload: any) => {
      this.isTheme3 = false;
      this.isTheme2 = false;
      this.isTheme4 = true;
      this.DisplayLibrary = this.DisplayTemplates = this.DisplayDeliverables = false;
      this.ShowLibrary1 = this.ShowLibrary2 = this.ShowTemplatesDeliverables = false;
      this.libraryAttributeViewFlag = this.deliverableAttributeViewFlag = this.templateAttributeViewFlag = false;
      this.designerService.isExtendedIconicView = false;
      this.DisplayBlockImporter = false;
      this.DisplayBlockImporterPdf = false;
      this.DisplayLibraryBlockSuggestion = false;
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockExtendedView).subscribe((payload: any) => {
      if (payload.section == IconViewSection.Template) {
        this.DisplayTemplates = true;
        this.DisplayBlock = true;
        this.DisplayDeliverables = false;
        this.DisplayLibrary = false;
        this.designerService.isExtendedIconicView = true;
      }
      if (payload.section == IconViewSection.BlockImporter) {
        this.DisplayTemplates = false;
        this.DisplayBlock = false;
        this.DisplayDeliverables = false;
        this.DisplayLibrary = false;
        this.isTheme3 = false;
        this.isTheme2 = false;
        this.isTheme4 = false;
        this.designerService.isExtendedIconicView = false;
        this.libraryAttributeViewFlag = false;
        this.deliverableAttributeViewFlag = false;
        this.templateAttributeViewFlag = false;
        // this.DisplayBlockImporter = true;
        const blockImporter = this.dialogService.open(ImportBlocksProcessComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
        });
      }
      if (payload.section == IconViewSection.BlockImporterPdf) {
        this.DisplayBlockImporterPdf = true;
        this.dialogService.open(ImportedBlocksPdfHeaderComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
        });
      }
      if (payload.section == IconViewSection.LibraryBlockSuggestion) {
        this.DisplayTemplates = false;
        this.DisplayBlock = false;
        this.DisplayDeliverables = false;
        this.DisplayLibrary = false;
        this.isTheme3 = false;
        this.isTheme2 = false;
        this.isTheme4 = false;
        this.designerService.isExtendedIconicView = false;
        this.libraryAttributeViewFlag = false;
        this.deliverableAttributeViewFlag = false;
        this.templateAttributeViewFlag = false;
        this.DisplayBlockImporter = false;
        this.DisplayBlockImporterPdf = false;
        this.DisplayLibraryBlockSuggestion = true;
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).subscribe((selectedSection: any) => {
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
    }));
  }

  ngAfterViewInit() {
    this._eventService.getEvent(IconViewSection.LoadSelectedTheme).publish(true);
  }

  getDocumentLayoutStyle() {
    this.designerService.layoutStyles = [];
    this.designerService.isGlobalTemplate = null;
    let isInternalUser : boolean;
    isInternalUser = this.designerService.docViewAccessRights.isExternalUser ? false : true;
    this.documentViewService.getLayoutStyles(this.projectDetails.projectId, isInternalUser).subscribe(layoutStyles => {
      this.designerService.layoutStyles = layoutStyles;
    });
  }
}
