import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../@models/common/eventConstants';
import { NbDialogService, NbDialogRef, NbPopoverDirective } from '@nebular/theme';
import { WatermarkComponent } from '../watermark/watermark.component';
import { Subscription } from 'rxjs';
import { blockSelectedModel, DocumentViewIcons, PageBorder } from '../../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../services/designer.service';
import { UserRightsViewModel, DocViewDeliverableRoleViewModel, DocumentViewAccessRights } from '../../../../../../@models/userAdmin';
import { DeliverableViewModel, PageBorderStyles, BorderWidth } from '../../../../../../@models/projectDesigner/deliverable';
import { DefineColorsComponent } from '../../../icon-view/define-colors/define-colors.component';
import { DocumentConfigurationModel, ContentTypeViewModel, LineStyleViewModel, RGBColors, BorderDetails } from '../../../../../../@models/projectDesigner/common';
import { ProjectContext } from '../../../../../../@models/organization';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogTypes, Dialog } from '../../../../../../@models/common/dialog';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { MarginTypes, MarginViewModel, marginProp } from '../../../../../../@models/projectDesigner/common';
import { CustomMarginComponent } from '../custom-margin/custom-margin.component';
import { marginValues } from '../../../../../../@models/common/valueconstants';
import { MarginStyles } from '../../../../../../@models/common/commonmodel';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { LayoutFormatStylingComponent } from '../layout-format-styling/layout-format-styling.component';
import { DocumentViewService } from '../../../../services/document-view.service';
import { CustomHTML } from '../../../../../../shared/services/custom-html.service';
import { DocumentLayoutStyle, DefineColorSection } from '../../../../../../@models/projectDesigner/formatStyle';
import { FormatStylingOptions } from '../../../../../../shared/services/format-options.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ParagraphSpacingComponent } from '../paragraph-spacing/paragraph-spacing.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'ngx-layout-level2-menu',
  templateUrl: './layout-level2-menu.component.html',
  styleUrls: ['./layout-level2-menu.component.scss']
})
export class LayoutLevel2MenuComponent implements OnInit, OnDestroy {
  public pageOrientation: string;
  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
  @ViewChild('basicMenu') public basicMenu: ContextMenuComponent;
  @ViewChild('basicMenu1') public basicMenu1: ContextMenuComponent;

  public colors: string[] = [
    '#ffffff',
    '#000105',
    '#3e6158',
    '#3f7a89',
    '#96c582',
    '#b7d5c4',
    '#bcd6e7',
    '#7c90c1',
    '#9d8594',
    '#dad0d8',
    '#4b4fce',
    '#4e0a77',
    '#a367b5',
    '#ee3e6d',
    '#d63d62',
    '#c6a670',
    '#f46600',
    '#cf0500',
    '#efabbd',
    '#8e0622',
    '#f0b89a',
    '#f0ca68',
    '#62382f',
    '#c97545',
    '#c1800b'
  ];
  subscriptions: Subscription = new Subscription();
  toolbarIcons = new DocumentViewIcons();
  docViewRights: UserRightsViewModel;
  docViewRoles: DocViewDeliverableRoleViewModel[];
  selectedDeliverable: DeliverableViewModel;
  selectedBorderColor: string;
  contentType = ContentTypeViewModel;
  selectedBorderWidth: string;
  borderStyles: string[] = PageBorder.borderStyles;
  borderTypes: string[] = PageBorder.borderTypes;
  selectedBorder: string;
  selectedBasicStyle: string;
  disableStyleFields: boolean = true;
  selectedBorderWidthStyles: BorderWidth[] = [];
  borderSides: any = [];
  pageBorderModel = new DocumentConfigurationModel();
  projectDetails: ProjectContext;
  isWidthSelected: boolean = false;
  templateOrDeliverableId: any;
  marginProp: marginProp = new marginProp();
  selectedLayoutStyle = new DocumentLayoutStyle();
  layoutStyles: DocumentLayoutStyle[];
  isStyleRendered: boolean = false;
  isBorderSidesSelected: boolean;
  isLayoutStyleEnabled: boolean;
  pageBorderStyles = new PageBorderStyles();
  lineStyles = LineStyleViewModel;
  dialogTemplate: Dialog;

  constructor(private readonly _eventService: EventAggregatorService, private toastr: ToastrService,
    private dialogService: NbDialogService, private designerService: DesignerService, private el: ElementRef, private sharedService: ShareDetailService,
    private documentViewService: DocumentViewService,private translate: TranslateService, private _dialogService: DialogService, private customHTML: CustomHTML, private formatSytling: FormatStylingOptions, private ngxLoader: NgxUiLoaderService, private dialog: MatDialog,) { }
  dialogRef: NbDialogRef<WatermarkComponent>;
  isNavigationPaneChecked: boolean = true;
  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.toolbarIcons = new DocumentViewIcons();
    this.enableDisableIconsAsPerRoles();
    this.subscriptions.add(this._eventService.getEvent("insertLayoutToolbarIcons3").subscribe((data => {
      this.enableDisableIconsAsPerRoles();
    })));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.changeLayoutStyle).subscribe((id: any) => {
      this.getLayoutStyle();
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.updateLayoutStyleToContent).subscribe((data: DocumentLayoutStyle) => {
      if (!data.isNew) {
        for (var i = 0; i < this.layoutStyles.length; i++) {
          if (this.layoutStyles[i].id == data.id) {
            this.layoutStyles[i] = data;
            break;
          }
        }
        if (data.id == this.selectedLayoutStyle.id) {
          this.selectedLayoutStyle = data;
          this.formatSytling.applyStyle(this.selectedLayoutStyle);
        }
      }
      else {
        this.layoutStyles.push(data);
      }
      this.designerService.layoutStyles = this.layoutStyles;
      this.layoutStyles = this.layoutStyles.filter(item => item.isActive == true);
    }));

    this.getPageBorder();
    this.getLayoutStyle();
  }

  getPageBorder() {
    if (this.designerService.isDeliverableSection)
      this.templateOrDeliverableId = this.designerService.deliverableDetails ? this.designerService.deliverableDetails.entityId : undefined;
    else
      this.templateOrDeliverableId = this.designerService.templateDetails ? this.designerService.templateDetails.templateId : undefined;
    if (this.templateOrDeliverableId) {
      this.borderSides = [];
      this.documentViewService.getPageBorder(this.projectDetails.projectId, this.templateOrDeliverableId).subscribe(response => {
        if (response.pageBorder != null && response.pageBorder.border !== null && response.pageBorder.border.content !== null) {
          let responseData = JSON.parse(response.pageBorder.border.content);
          this.selectedBasicStyle = this.selectedBorder = responseData.border;
          this.selectedBorderColor = responseData.borderColor;
          this.borderSides = responseData.borderStyle;
          if (this.selectedBorder && this.selectedBorder !== "")
            this.getWidthStylesBasedOnBorder();
          this.isWidthSelected = true;
          this.disableStyleFields = false;
        }
        else {
          this.selectedBorder = LineStyleViewModel[0];
          this.disableStyleFields = true;
          this.isWidthSelected = false;
          this.isBorderSidesSelected = false;
          this.borderSides = [];
          this.selectedBorderColor = "";
        }
      });
    }
  }
  get marginStyles() { return MarginStyles; }

  enableDisableIconsAsPerRoles() {
    if (this.designerService.docViewAccessRights) {
      this.docViewRights = this.designerService.docViewAccessRights;
      if (!this.docViewRights.isCentralUser && !this.designerService.isTemplateSection)
        this.checkDeliverableRoles();
      if (this.designerService.isLibrarySection && this.designerService.libraryDetails.name != EventConstants.BlockCollection && this.designerService.libraryDetails.isActive) {
        this.disableAllIcons();
        return;
      }
      if (this.designerService.isExtendedIconicView && !this.designerService.LoadAllBlocksDocumentView) {
        this.disableAllIcons();
      }
      else {
        this.toolbarIcons.enableMargins = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanMargins);
        this.toolbarIcons.enableSize = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanSize);
        this.toolbarIcons.enableOrientation = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanOrientation);
        this.toolbarIcons.enableColumns = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanColumns);
        this.toolbarIcons.enablePageBorder = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPageBorder);
        this.toolbarIcons.enableColor = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanColor);
        this.toolbarIcons.enablePageSize = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanPageSize);
        this.toolbarIcons.enableWaterMark = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanWaterMark);
        this.toolbarIcons.enableRuler = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanRuler);
        this.toolbarIcons.enableNavigationPane = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanNavigationPane);
        this.toolbarIcons.enableStylePanel = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanStylePanel);
        this.toolbarIcons.enableStyleSection = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanStyleSection);
        this.toolbarIcons.enableParagraphSpacing = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanParagraphSpacing);
      }
    }
  }

  waterMarkPopUp() {
    this.dialogService.open(WatermarkComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    })
  }
  selectTheme(color) {
    if(color==null)
    {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageColor).publish(color);
    }
    else{
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageColor).publish(color);
    }
  }
  selectOrientation(event) {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageOrientation).publish(event.target.innerText);
  }
  selectMargin(config) {
    this.marginProp.MarginType = config;
    switch (config) {
      case MarginTypes.normal:
        this.marginProp.Top = marginValues.normal;
        this.marginProp.Bottom = marginValues.moderate;
        this.marginProp.Left = marginValues.moderate;
        this.marginProp.Right = marginValues.moderate;
        break;
      case MarginTypes.narrow:
        this.marginProp.Top = marginValues.narrow;
        this.marginProp.Bottom = marginValues.narrow;
        this.marginProp.Left = marginValues.narrow;
        this.marginProp.Right = marginValues.narrow;
        break;
      case MarginTypes.moderate:
        this.marginProp.Top = marginValues.moderate;
        this.marginProp.Bottom = marginValues.moderate;
        this.marginProp.Left = marginValues.normal;
        this.marginProp.Right = marginValues.normal;
        break;
      case MarginTypes.wide:
        this.marginProp.Top = marginValues.moderate;
        this.marginProp.Bottom = marginValues.moderate;
        this.marginProp.Left = marginValues.wide;
        this.marginProp.Right = marginValues.wide;
        break;
      case MarginTypes.custom:
        this.dialogService.open(CustomMarginComponent, {
          closeOnBackdropClick: true,
          closeOnEsc: true,
        })
        break;
      default:
        break;
    }
    if (config != MarginTypes.custom) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageMargin).publish(this.marginProp);
    }

  }
  selectPageSize(event) {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageSize).publish(event.target.innerText);
  }

  setBorder(border) {
    if (border == LineStyleViewModel[0]) {
      this.disableStyleFields = true;
      this.selectedBasicStyle = this.selectedBorder = border;
      this.selectedBorderColor = "";
      this.selectedBorderWidth = "";
      this.borderSides = [];
      this.isBorderSidesSelected = false;
    }
    else {
      this.selectedBasicStyle = this.selectedBorder = border;
      this.disableStyleFields = false;
      this.selectedBorderWidthStyles = [];
      this.getWidthStylesBasedOnBorder();
    }
  }

  setPageBorderColor(color) {
    this.selectedBorderColor = color;
    this.selectedBorderWidthStyles.forEach(y => {
      if (this.selectedBorderColor) {
        let getColor = y.borderWidth.split(' ');
        if (getColor.length == 3) {
          let replaceColor = y.borderWidth.replace(getColor[2], this.selectedBorderColor);
          y.borderWidth = replaceColor;
        }
      }
    });
  }

  setBorderWidth(width) {
    this.isWidthSelected = true;
    this.selectedBorder = width;
  }

  getWidthStylesBasedOnBorder() {
    PageBorder.widthStyles.forEach((x, i) => {
      let getWidth = this.selectedBorder.split(' ');
      if (getWidth.length == 3) {
        if (this.selectedBorderColor) {
          let replaceColor = this.selectedBorder.replace(getWidth[2], this.selectedBorderColor);
          this.selectedBorder = replaceColor;
        }
        let replaceWidth = this.selectedBorder.replace(getWidth[0], x);
        let widthStyle = new BorderWidth();
        widthStyle.name = x;
        widthStyle.borderWidth = replaceWidth;
        this.selectedBorderWidthStyles.push(widthStyle);
      }
    });
  }

  disableAllIcons() {
    this.toolbarIcons.enableMargins = false;
    this.toolbarIcons.enableSize = false;
    this.toolbarIcons.enableOrientation = false;
    this.toolbarIcons.enableColumns = false;
    this.toolbarIcons.enablePageBorder = false;
    this.toolbarIcons.enableColor = false;
    this.toolbarIcons.enablePageSize = false;
    this.toolbarIcons.enableWaterMark = false;
    this.toolbarIcons.enableRuler = false;
    this.toolbarIcons.enableNavigationPane = false;
    this.toolbarIcons.enableStylePanel = false;
    this.toolbarIcons.enableStyleSection = false;
    this.toolbarIcons.enableParagraphSpacing = false;
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  checkValue(isChecked) {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.blockSecHide).publish(isChecked);
  }

  openSaveConfirmDialog(): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.document-view.pageborder.confirm-message');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.savePageBorderStyles();
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  savePageBorderStyles() {
    let lineStyles = LineStyleViewModel;
    this.pageBorderStyles.border = this.selectedBasicStyle;
    if (!this.isBorderSidesSelected && this.borderSides.length == 0) {
      this.pageBorderStyles.borderStyle = this.borderTypes;
    }
    else {
      this.pageBorderStyles.borderStyle = this.borderSides;
    }
    if (this.selectedBorderColor)
      this.pageBorderStyles.borderColor = this.selectedBorderColor;
    if (this.isWidthSelected)
      this.pageBorderStyles.borderWidth = this.selectedBorder;
    this.documentViewService.getPageBorder(this.projectDetails.projectId, this.templateOrDeliverableId).subscribe(response => {
      if (response.pageBorder != null) {
        if (this.pageBorderStyles.border !== lineStyles[0]) {
          this.savePageBorder(response.pageBorder.id);
        }
        else {
          this.removePageBorder(response.pageBorder.id);
        }
      }
      else {
        if (this.pageBorderStyles.border !== lineStyles[0]) 
          this.savePageBorder("");
      }
    });
  }

  toggleDefineColors() {
    this.dialogService.open(DefineColorsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context:{section: DefineColorSection.fulldocumentView}
    });
  }

  setBorderType(type, event) {
    if (event.target.checked) {
      this.isBorderSidesSelected = true;
      this.borderSides.push(type);
    }
    else {
      let index = this.borderSides.findIndex(x => x == type);
      this.borderSides.splice(index, 1);
      if (this.borderSides.length == 0)
        this.isBorderSidesSelected = false;
    }
  }


  isChecked(borderName) {
    if (this.borderSides && this.borderSides.length > 0) {
      if (this.borderSides.filter(x => x == borderName).length > 0) {
        return true;
      }
      else
        return false;
    }
    else
      return false;
  }

  getLayoutStyle() {
    this.layoutStyles = this.designerService.layoutStyles;
    if(!this.layoutStyles) return false;
    
    let layoutStyleId = "";

    if (!this.designerService.selectedLayoutStyleId) {
      if (this.designerService.isTemplateSection && this.designerService.templateDetails != null) layoutStyleId = this.designerService.templateDetails.layoutStyleId;
      else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails != null) layoutStyleId = this.designerService.deliverableDetails.layoutStyleId;
    } else {
      layoutStyleId = this.designerService.selectedLayoutStyleId;
    }

    let selectedStyle = this.layoutStyles.filter(item => item.id == layoutStyleId);

    if (selectedStyle.length > 0) {
      this.selectedLayoutStyle = selectedStyle[0];
      this.isLayoutStyleEnabled =this.selectedLayoutStyle.isDefault ? false : ((this.designerService.docViewAccessRights.isExternalUser == true && this.selectedLayoutStyle.isInternalUser == true) ? false : true);
      this.isStyleRendered = true;
      this.formatSytling.applyStyle(this.selectedLayoutStyle);
    }
    this.designerService.selectedLayoutStyleId = layoutStyleId;
    this.getActiveLayoutStylesByUser();
  }

  getActiveLayoutStylesByUser() {
    let isInternalUser = this.designerService.docViewAccessRights.isExternalUser ? false : true;
    if (isInternalUser)
      this.layoutStyles = this.layoutStyles.filter(item => item.isActive == true);
    else
      this.layoutStyles = this.layoutStyles.filter(item => item.isActive == true && item.isInternalUser == false);
  }

  setLayoutStyle(id) {
    let layoutStyle = this.layoutStyles.filter(item => item.id == id)[0];
    if (this.designerService.isTemplateSection && this.designerService.templateDetails != null) {
      layoutStyle.isTemplate = true;
      layoutStyle.templateOrDeliverableId = this.designerService.templateDetails.templateId;
      this.designerService.templateDetails.layoutStyleId = id;
    }
    else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails != null) {
      layoutStyle.isTemplate = false;
      layoutStyle.templateOrDeliverableId = this.designerService.deliverableDetails.deliverableId;
      this.designerService.deliverableDetails.layoutStyleId = id;
    }
    this.designerService.selectedLayoutStyleId = id;

    this.selectedLayoutStyle = layoutStyle;
    this.isLayoutStyleEnabled =this.selectedLayoutStyle.isDefault ? false : ((this.designerService.docViewAccessRights.isExternalUser == true && this.selectedLayoutStyle.isInternalUser == true) ? false : true);
    this.isStyleRendered = true;
    this.formatSytling.applyStyle(this.selectedLayoutStyle);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.applyLayoutStyleToContent).publish(layoutStyle);
    this.documentViewService.applyLayoutStyles(layoutStyle).subscribe();
    this.popover.hide();
  }

  openFormattingOptionsPopup(style) {
    let layout: any = {};
    layout.selectedLayout = this.selectedLayoutStyle;
    layout.isNew = false;
    layout.style = style;
    this.dialogService.open(LayoutFormatStylingComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { layout: layout }
    });
  }

  addNewStylePanel() {
    let id = "-1";
    this.showStylePanel(id);
  }

  showStylePanel(id) {
    this.designerService.selectedLayoutStyleId = id;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish(eventConstantsEnum.projectDesigner.documentView.Layout.toggleStylePanel);
  }

  removeStyle(item) {
    this.ngxLoader.startBackgroundLoader("FullViewLoader");
    this.documentViewService.removeLayoutStyle(item).subscribe(response => {
      for (var i = 0; i < this.layoutStyles.length; i++) {
        if (this.layoutStyles[i].id == item.id) {
          item.isActive = false;
          this.layoutStyles[i] = item;
          break;
        }
      }
      this.designerService.layoutStyles = this.layoutStyles;
      this.getActiveLayoutStylesByUser();
      this.ngxLoader.stopBackgroundLoader("FullViewLoader");
    });
}
ParagraphSpacing(){
  this.dialogService.open(ParagraphSpacingComponent, {
    closeOnBackdropClick: false,
    closeOnEsc: false,
  })
}


  savePageBorder(id) {
    let contentData = new PageBorderStyles();
    contentData.border = this.selectedBasicStyle;
    contentData.borderColor = this.selectedBorderColor;
    contentData.borderStyle = this.borderSides;
    contentData.borderWidth = this.selectedBorder;
    this.pageBorderModel = new DocumentConfigurationModel();
    this.pageBorderModel.border = this.formatPageBorderStyles();
    this.pageBorderModel.border.content = JSON.stringify(contentData);
    this.pageBorderModel.contentType = ContentTypeViewModel.PageBorder;
    if (this.designerService.isDeliverableSection === true) {
      this.pageBorderModel.isTemplate = false;
      this.pageBorderModel.templateOrDeliverableId = this.designerService.deliverableDetails.entityId;
    }
    else if (this.designerService.isTemplateSection === true) {
      this.pageBorderModel.isTemplate = true;
      this.pageBorderModel.templateOrDeliverableId = this.designerService.templateDetails.templateId;
    }
    this.pageBorderModel.projectId = this.projectDetails.projectId;

    if (id == "") {
      this.pageBorderModel.id = null;
      this.documentViewService.savePageBorder(this.pageBorderModel)
        .subscribe(response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.pageborder.success-message'));
           
          }
          else {
            this._dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        });
    }
    else {
      this.pageBorderModel.id = id;
      this.documentViewService.updatePageBorder(this.pageBorderModel)
        .subscribe(response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.pageborder.update-message'));
            
          }
          else {
            this._dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        });
    }
  }

  formatPageBorderStyles() {
    var borderDetails: any = {};
    let rgbColors = RGBColors;
    let lineStyles = LineStyleViewModel;
    var getRGBColor, getWidth, getLineStyle;
    let contentData: any = {};

    if (this.pageBorderStyles.border && this.pageBorderStyles.border !== lineStyles[0]) {
      let splitData = this.pageBorderStyles.border.split(" ");
      if (splitData.length == 3) {
        var lineStyle = splitData[1];
        getLineStyle = lineStyles[lineStyle];
        let splitWidth = splitData[0].split('px');
        if (splitWidth.length > 0) {
          let widthValue = Number(splitWidth[0]);
          getWidth = widthValue;
        }
        getRGBColor = { 'r': 0, 'g': 0, 'b': 0 };
      }
    }
    else {
      getLineStyle = lineStyles[this.pageBorderStyles.border];
    }

    if (this.pageBorderStyles.borderColor && this.pageBorderStyles.borderColor !== "") {
      rgbColors.forEach(x => {
        if (x.colorCode == this.pageBorderStyles.borderColor) {
          var colorValue = x.rgb;
          var rgbColor = colorValue.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+))?\s*\)/);
          if (rgbColor.length >= 4) {
            getRGBColor = { 'r': rgbColor[1], 'g': rgbColor[2], 'b': rgbColor[3] };
          }
        }
      });
    }

    if (this.pageBorderStyles.borderWidth && this.pageBorderStyles.borderWidth !== "") {
      let width = this.pageBorderStyles.borderWidth.split(" ");
      if (width.length == 3) {
        let splitWidth = width[0].split('px');
        if (splitWidth.length > 0) {
          let widthValue = Number(splitWidth[0]);
          getWidth = widthValue;
        }
      }
    }

    if (this.pageBorderStyles.borderStyle.length > 0) {
      this.pageBorderStyles.borderStyle.forEach(el => {
        contentData[BorderDetails.lineStyle] = (getLineStyle !== undefined && getLineStyle !== null) ? getLineStyle : null;
        contentData[BorderDetails.lineWidth] = (getWidth !== undefined && getWidth !== null) ? getWidth : null;
        contentData[BorderDetails.color] = (getRGBColor !== undefined && getRGBColor !== null) ? getRGBColor : null;
        borderDetails[el] = contentData;
      });
    }
    return borderDetails;
  }

  removePageBorder(id) {
    this.documentViewService.removeTableOfContent(id).subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          this.pageBorderStyles = null;
          this.selectedBasicStyle = "";
          this.selectedBorder = LineStyleViewModel[0];
          this.disableStyleFields = true;
          this.isWidthSelected = false;
          this.isBorderSidesSelected = false;
          this.borderSides = [];
          this.selectedBorderColor = "";
        }
        else {
          this._dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
    });
  }

}
