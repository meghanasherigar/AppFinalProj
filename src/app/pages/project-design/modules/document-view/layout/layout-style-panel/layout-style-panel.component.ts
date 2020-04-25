import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { DocumentLayoutStyle, DocumentStyle, StyleOn } from '../../../../../../@models/projectDesigner/formatStyle';
import { DesignerService } from '../../../../services/designer.service';
import { NbDialogService } from '@nebular/theme';
import { LayoutFormatStylingComponent } from '../layout-format-styling/layout-format-styling.component';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Subscription } from 'rxjs';
import { DocumentViewService } from '../../../../services/document-view.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-layout-style-panel',
  templateUrl: './layout-style-panel.component.html',
  styleUrls: ['./layout-style-panel.component.scss']
})
export class LayoutStylePanelComponent implements OnInit {

  constructor(private readonly _eventService: EventAggregatorService, private dialogService: NbDialogService, private ngxLoader: NgxUiLoaderService,
    private sharedService: ShareDetailService, private designerService: DesignerService, private documentService: DocumentViewService) { }
  projectDetails: ProjectContext;
  layoutStyle = new DocumentLayoutStyle();
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @ViewChild("layoutName") layoutName: ElementRef;
  subscriptions: Subscription = new Subscription();
  loaderId = 'StylePanelLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  isLayoutStyleEnabled : boolean;

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    let selectedStyle = this.designerService.layoutStyles.filter(item => item.id == this.designerService.selectedLayoutStyleId)[0];

    if (!selectedStyle) {
      selectedStyle = new DocumentLayoutStyle();
      selectedStyle.isActive = true;
      selectedStyle.isNew = true;
    }

    this.ngxLoader.startBackgroundLoader(this.loaderId);

    if (selectedStyle) {
      if (!selectedStyle.id) {
        this.layoutStyle = selectedStyle;
        this.layoutStyle.styles = [];
        let style: any = {};

        for (let i = 1; i <= 5; i++) {
          style = new DocumentStyle();
          style.styleOn = StyleOn["Heading" + i];
          this.layoutStyle.styles.push(style);
        }

        style = new DocumentStyle();
        style.styleOn = StyleOn.Body;
        this.layoutStyle.styles.push(style);

        style = new DocumentStyle();
        style.styleOn = StyleOn.Bullet;
        this.layoutStyle.styles.push(style);
      }
      else
        this.layoutStyle = selectedStyle;
    }

    this.isLayoutStyleEnabled =this.layoutStyle.isDefault ? false : ((this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.isExternalUser == true && this.layoutStyle.isInternalUser == true) ? false : true);


    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.setStyleForNewLayout).subscribe((data: any) => {
      this.layoutStyle = data;
    }));
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  showStylePanel() {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(eventConstantsEnum.projectDesigner.documentView.Layout.toggleStylePanel);
  }

  validateLayoutName(event){
    if (event.target.value == "") {
      this.layoutName.nativeElement.classList.add("layoutname-validation-error");
    }
    else
      this.layoutName.nativeElement.classList.remove("layoutname-validation-error");
  }

  addNewStyle() {
    if (this.layoutName.nativeElement.value == ""){ 
      this.layoutName.nativeElement.classList.add("layoutname-validation-error");
      return false;
    }

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.layoutStyle.layoutName = this.layoutName.nativeElement.value;
    if (this.designerService.isTemplateSection && this.designerService.templateDetails != null) {
      this.layoutStyle.isTemplate = true;
      this.layoutStyle.templateOrDeliverableId = this.designerService.templateDetails.templateId;
    }
    else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails != null) {
      this.layoutStyle.isTemplate = false;
      this.layoutStyle.templateOrDeliverableId = this.designerService.deliverableDetails.deliverableId;
    }
    else if(this.designerService.isGlobalTemplate != null){
      this.layoutStyle.isGlobalTemplate = this.designerService.isGlobalTemplate;
    }

    if (!this.layoutStyle.id) {
      this.layoutStyle.projectId = this.designerService.isGlobalTemplate != null ? this.designerService.globalOrCountryTemplateId :  this.projectDetails.projectId;
      this.layoutStyle.isActive = true;
      this.layoutStyle.isInternalUser = (this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.isExternalUser) ? false : true;
      this.layoutStyle.isDefault = false;

      this.documentService.addLayoutStyles(this.layoutStyle).subscribe(response => {
        if (response.tag) this.layoutStyle.id = response.tag;
        this.layoutStyle.isNew = true;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.updateLayoutStyleToContent).publish(this.layoutStyle);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.showStylePanel();
      },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });
    }
    else {
      this.documentService.updateLayoutStyles(this.layoutStyle).subscribe(response => {
        this.layoutStyle.isNew = false;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.updateLayoutStyleToContent).publish(this.layoutStyle);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.showStylePanel();
      },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });
    }
  }

  openFormattingOptionsPopup(style) {
    let layout: any = {};
    layout.selectedLayout = this.layoutStyle;
    layout.isNew = true;

    layout.style = style;
    this.dialogService.open(LayoutFormatStylingComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { layout: layout }
    });
  }

}
