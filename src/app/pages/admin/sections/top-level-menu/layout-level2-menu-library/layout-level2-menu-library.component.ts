import { Component, OnInit, ViewChild } from '@angular/core';
import { DocumentViewIcons, PageBorder,LibraryOptions } from '../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../project-design/services/designer.service';
import { LibraryEnum, DocumentConfigurationModel, ContentTypeViewModel, MarginTypes, marginProp, LineStyleViewModel, RGBColors, BorderDetails} from '../../../../../@models/projectDesigner/common';
import { eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { WatermarkComponent } from '../../../../project-design/modules/document-view/layout/watermark/watermark.component';
import { NbDialogService } from '@nebular/theme';
import { definedColors } from '../../../../../@models/admin/library';
import { Subscription } from 'rxjs';
import { ProjectContext } from '../../../../../@models/organization';
import { BorderWidth, PageBorderStyles } from '../../../../../@models/projectDesigner/deliverable';
import { ShareDetailService } from '../../../../../shared/services/share-detail.service';
import { DocumentViewService } from '../../../../project-design/services/document-view.service';
import { DefineColorsComponent } from '../../../../project-design/modules/icon-view/define-colors/define-colors.component';
import { CustomMarginComponent } from '../../../../project-design/modules/document-view/layout/custom-margin/custom-margin.component';
import { marginValues } from '../../../../../@models/common/valueconstants';
import { MarginStyles } from '../../../../../@models/common/commonmodel';
import { DesignerService as designerServiceAdmin } from '../../../services/designer.service';
import { ParagraphSpacingComponent } from '../../../../project-design/modules/document-view/layout/paragraph-spacing/paragraph-spacing.component';
import { DocumentLayoutStyle, DefineColorSection } from '../../../../../@models/projectDesigner/formatStyle';
import { FormatStylingOptions } from '../../../../../shared/services/format-options.service';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { LayoutFormatStylingComponent } from '../../../../project-design/modules/document-view/layout/layout-format-styling/layout-format-styling.component';
import { ResponseStatus } from '../../../../../@models/ResponseStatus';
import { DialogTypes, Dialog } from '../../../../../@models/common/dialog';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-layout-level2-menu-library',
  templateUrl: './layout-level2-menu-library.component.html',
  styleUrls: ['./layout-level2-menu-library.component.scss']
})
export class LayoutLevel2MenuLibraryComponent implements OnInit {
  @ViewChild('basicMenu') public basicMenu: ContextMenuComponent;
  @ViewChild('basicMenu1') public basicMenu1: ContextMenuComponent;
  toolbarIcons = new DocumentViewIcons();
  colors = definedColors;
  subscriptions: Subscription = new Subscription();
  selectedBorderColor: string;
  contentType = ContentTypeViewModel;
  selectedBorderWidth: string;
  borderStyles: string[] = PageBorder.borderStyles;
  borderTypes: string[] = PageBorder.borderTypes;
  selectedBorder: string;
  selectedBasicStyle: string;
  selectedLibrary:any;
  LibraryOptions=LibraryOptions;
  disableStyleFields: boolean = true;
  selectedBorderWidthStyles: BorderWidth[] = [];
  borderSides: any = [];
  pageBorderModel = new DocumentConfigurationModel();
  projectDetails: ProjectContext;
  isWidthSelected: boolean = false;
  templateOrDeliverableId: any;
  marginProp: marginProp = new marginProp();
  templateId: any;
  isBorderSidesSelected: boolean;
  selectedLayoutStyle = new DocumentLayoutStyle();
  layoutStyles: DocumentLayoutStyle[];
  isStyleRendered: boolean = false;
  libraryTemplate : any ;
  pageBorderStyles = new PageBorderStyles();
  isLayoutStyleEnabled: boolean = false;
  dialogTemplate: Dialog;

  constructor(private designerService: DesignerService,private toastr: ToastrService,
 private readonly _eventService: EventAggregatorService, private dialogService: NbDialogService,
    private sharedService: ShareDetailService, private documentViewService: DocumentViewService, private designerServiceAdmin: designerServiceAdmin,
    private formatSytling: FormatStylingOptions,private _dialogService: DialogService, private translate: TranslateService,private dialog: MatDialog) { }


  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.enableDisableIconsAsPerLibrary();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryChange).subscribe((payload: any) => {
      if (payload) {
        this.libraryTemplate = payload;
        this.getLayoutStyle()
      }
      else {
        this.layoutStyles = [];
        this.selectedLayoutStyle = new DocumentLayoutStyle();
      }
      this.enableDisableIconsAsPerLibrary();
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.selectedAdminLibaryDropdown).subscribe(payload => {
      this.selectedLibrary=payload;
  
      }
    ));

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

      if (this.selectedLayoutStyle) this.isLayoutStyleEnabled = this.selectedLayoutStyle.isDefault ? false : true;
      this.designerService.layoutStyles = this.layoutStyles;
      this.layoutStyles = this.layoutStyles.filter(item => item.isActive == true);
    }));

    let section = this.designerService.manageLibraryDetails.name.toLowerCase();
    if (section == LibraryEnum.globaloecd)
      this.templateId = this.designerServiceAdmin.dummyProjectDetails.oecdGlobalTemplateId;
    else if (section == LibraryEnum.countrytemplate)
      this.templateId = this.designerServiceAdmin.dummyProjectDetails.oecdCountryTemplateId;
    this.getPageBorder();
  }
  get marginStyles() { return MarginStyles; }

  enableDisableIconsAsPerLibrary() {
    if (this.designerService.manageLibraryDetails.name.toLowerCase() != LibraryEnum.globaloecd && this.designerService.manageLibraryDetails.name.toLowerCase() != LibraryEnum.countrytemplate)
      this.disableAllIcons();
    else
      this.enableAllIcons();
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
  }
  enableAllIcons() {
    this.toolbarIcons.enableMargins = true;
    this.toolbarIcons.enableSize = true;
    this.toolbarIcons.enableOrientation = true;
    this.toolbarIcons.enableColumns = true;
    this.toolbarIcons.enablePageBorder = true;
    this.toolbarIcons.enableColor = true;
    this.toolbarIcons.enablePageSize = true;
    this.toolbarIcons.enableWaterMark = true;
    this.toolbarIcons.enableRuler = true;
    this.toolbarIcons.enableNavigationPane = true;
    this.toolbarIcons.enableStylePanel = true;
    this.toolbarIcons.enableStyleSection = true;
  }
  waterMarkPopUp() {
    this.dialogService.open(WatermarkComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    })
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
  selectTheme(color) {
    if(color==null)
    {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageColor).publish(undefined);
    }
    else
    {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageColor).publish(color);
    }
   
  }
  selectOrientation(event) {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageOrientation).publish(event.target.innerText);
  }
  selectPageSize(event) {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageSize).publish(event.target.innerText);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getPageBorder() {
    if (this.templateId) {
      this.borderSides = [];
      this.documentViewService.getPageBorder(this.projectDetails.projectId, this.templateId).subscribe(response => {
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
    let lineStyles = LineStyleViewModel
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
      context: { section: DefineColorSection.fulldocumentView }
    });
  }

  setBorderType(type, event) {
    if (event.target.checked) {
      this.borderSides.push(type);
      this.isBorderSidesSelected = true;
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

  ParagraphSpacing() {
    this.dialogService.open(ParagraphSpacingComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    })
  }
  getLayoutStyle() {
    this.layoutStyles = this.designerService.layoutStyles;
    if (!this.layoutStyles || this.layoutStyles.length == 0) return false;
    let selectedStyle = this.layoutStyles.filter(item => item.id == this.designerService.selectedLayoutStyleId);

    if (selectedStyle.length > 0) {
      this.selectedLayoutStyle = selectedStyle[0];
      this.isStyleRendered = true;
      this.formatSytling.applyStyle(this.selectedLayoutStyle);
      this.isLayoutStyleEnabled = this.selectedLayoutStyle.isDefault ? false : true;

    }
    this.designerService.isGlobalTemplate = this.libraryTemplate.isGlobalTemplate;
    this.layoutStyles = this.layoutStyles.filter(item => item.isActive == true);
  }

  setLayoutStyle(id) {
    let layoutStyle = this.layoutStyles.filter(item => item.id == id)[0];
    layoutStyle.isTemplate = false;
    layoutStyle.templateOrDeliverableId = null;
    layoutStyle.isGlobalTemplate = this.libraryTemplate.isGlobalTemplate;
    this.designerService.isGlobalTemplate = layoutStyle.isGlobalTemplate;
    this.designerService.selectedLayoutStyleId = id;

    this.selectedLayoutStyle = layoutStyle;
    this.isStyleRendered = true;
    this.formatSytling.applyStyle(this.selectedLayoutStyle);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.applyLayoutStyleToContent).publish(layoutStyle);
    this.documentViewService.applyLayoutStyles(layoutStyle).subscribe();
    if (this.selectedLayoutStyle) this.isLayoutStyleEnabled = this.selectedLayoutStyle.isDefault ? false : true;
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
    this.documentViewService.removeLayoutStyle(item).subscribe(response => {
      for (var i = 0; i < this.layoutStyles.length; i++) {
        if (this.layoutStyles[i].id == item.id) {
          item.isActive = false;
          this.layoutStyles[i] = item;
          break;
        }
      }
      this.designerService.layoutStyles = this.layoutStyles;
      this.layoutStyles = this.layoutStyles.filter(item => item.isActive == true);
    });
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
