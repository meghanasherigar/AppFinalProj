import { Component, OnInit, ChangeDetectorRef, PipeTransform, Pipe } from '@angular/core';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import MultirootEditor from '../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { FormatOptions, Underline, Alignment, DocumentStyle, DefineColorSection } from '../../../../../../@models/projectDesigner/formatStyle';
import { DocumentViewService } from '../../../../services/document-view.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { DesignerService } from '../../../../services/designer.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TranslateService } from '@ngx-translate/core';
import { DefineColorsComponent } from '../../../icon-view/define-colors/define-colors.component';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { FormatStylingOptions } from '../../../../../../shared/services/format-options.service';
import { LineSpaceRule } from '../../../../../../@models/projectDesigner/block';
import { ToastrService } from 'ngx-toastr';
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'ngx-layout-format-styling',
  templateUrl: './layout-format-styling.component.html',
  styleUrls: ['./layout-format-styling.component.scss']
})

export class LayoutFormatStylingComponent implements OnInit {
  layout: any = {};
  style = new DocumentStyle();
  loaderId = 'StylingLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  subscriptions: Subscription = new Subscription();
  editor: any = {};
  previewText: string;
  formatTypes: any = [];
  selectedFormatType: any;
  leftIndentation: any;
  rightIndentation: any;
  lineSpaceBefore: any;
  lineSpaceAfter: any;
  lineSpaceRule: any;
  lineSpaceHeight: any;
  spacingList: any = ['none', '3pt', '6pt', '9pt', '12pt', '15pt', '18pt', '21pt', '24pt'];
  // lineSpacingList: any = ['Single', '1.5 lines', 'Double', 'At least', 'Exactly', 'Multiple'];
  lineSpacingMultipleList: any = ['none', 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];
  lineSpacingList: any = ['AtLeast', 'Exactly', 'Multiple'];
  indentationList: any = ['none', '0.1cm', '0.2cm', '0.3cm', '0.4cm', '0.5cm',
    '0.6cm', '0.7cm', '0.8cm', '0.9cm', '1cm',
    '1.1cm', '1.2cm', '1.3cm', '1.4cm', '1.5cm',
    '1.6cm', '1.7cm', '1.8cm', '1.9cm', '2cm',];

  constructor(protected ref: NbDialogRef<any>, private toastr: ToastrService,private dialogService: NbDialogService, private documentService: DocumentViewService, private ngxLoader: NgxUiLoaderService,
    private readonly _eventService: EventAggregatorService, private formatStyling: FormatStylingOptions, private designerService: DesignerService, private translate: TranslateService) { }

  ngOnInit() {
    this.style = this.layout.style;
    this.previewText = this.formatStyling.translateHTML('<p>' + this.translate.instant('screens.project-designer.document-view.previewText') + '</p>', this.layout.selectedLayout, this.style.styleOn);
    this.selectedFormatType = this.translate.instant('screens.project-designer.document-view.formatting');
    let formatType: any = {};
    formatType.type = this.translate.instant('screens.project-designer.document-view.formatting');
    this.formatTypes.push(formatType);
    formatType = {};
    formatType.type = this.translate.instant('screens.project-designer.document-view.paragraph');;
    this.formatTypes.push(formatType);

    if (this.style.properties.paragraphSpacing && this.style.properties.paragraphSpacing != null) {
      this.lineSpaceBefore = this.style.properties.paragraphSpacing.spaceBefore ? this.style.properties.paragraphSpacing.spaceBefore + 'pt' : 'none';
      this.lineSpaceAfter = this.style.properties.paragraphSpacing.spaceAfter ?this.style.properties.paragraphSpacing.spaceAfter + 'pt' : 'none';
      this.lineSpaceRule = LineSpaceRule[this.style.properties.paragraphSpacing.lineSpacingRule];
      this.lineSpaceHeight = this.style.properties.paragraphSpacing.lineSpacing ? this.style.properties.paragraphSpacing.lineSpacing : 'none';

      this.leftIndentation = this.style.properties.paragraphSpacing.leftIndentation ? this.style.properties.paragraphSpacing.leftIndentation + 'cm' : 'none';
      this.rightIndentation = this.style.properties.paragraphSpacing.rightIndentation ? this.style.properties.paragraphSpacing.rightIndentation + 'cm':'none';
    }
   
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.updateLayoutStyleToContent).subscribe((payload) => {
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      document.querySelector('#style-toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
      document.querySelector('#documentStyleEditor').innerHTML = '';
      if (this.editor != undefined)
        this.editor.destroy();
      this.editor = undefined;
      this.createEditor();
    }));
    this.createEditor(); 
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  createEditor() {
    let sourceElement = {
      tablTypeHeader: document.querySelector('#documentStyleEditor')
    };

    let toolBar = ['fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|', 'bold', 'italic', 'underline', '|', 'alignment:left', 'alignment:right', 'alignment:center', 'alignment:justify'];
    MultirootEditor.createInstanceWithCustomToolBars(sourceElement, undefined, undefined, this.designerService.definedColorCodes, toolBar,this.translate.currentLang).then(newEditor => {
      if (document.querySelector('#style-toolbar-menu')) {
        document.querySelector('#style-toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
      }
      this.editor = newEditor;
      return newEditor;
    });
  }

  dismiss() {
    this.ref.close();
  }

  modifyStyle() {

    let concatedStyle: any = {};
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    document.querySelectorAll('#documentStyleEditor [style]').forEach(item => {
      let _styleProperty: any = item.getAttribute("style").split(';');
      if (_styleProperty.length > 0) {
        _styleProperty.forEach(styleItem => {
          if (styleItem.indexOf(':') > -1) {
            let _style = styleItem.split(':');
            if (_style.length > 1) {
              if (_style[0] == "font-family")
                concatedStyle[FormatOptions.fontFamily] = _style[1];
              if (_style[0] == "font-size")
                concatedStyle[FormatOptions.fontSize] = parseInt(_style[1].toString().replace('px', ""));
              if (_style[0] == "color") {
                let result = _style[1].match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+))?\s*\)/);
                if (result != null && result.length > 0) concatedStyle[FormatOptions.fontColor] = { 'r': result[1], 'g': result[2], 'b': result[3] };
              }
              if (_style[0] == "background-color") {
                let result = _style[1].match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+))?\s*\)/);
                if (result != null && result.length > 0) concatedStyle[FormatOptions.fontBackgroundColor] = { 'r': result[1], 'g': result[2], 'b': result[3] };
              }
              if (_style[0] == "text-align")
                concatedStyle[FormatOptions.alignment] = Alignment[_style[1]];
            }
          }
        })
      }
    });

    if (!concatedStyle[FormatOptions.alignment]) concatedStyle[FormatOptions.alignment] = Alignment.left;

    document.querySelectorAll('#documentStyleEditor i,#documentStyleEditor u,#documentStyleEditor strong').forEach(item => {
      if (item.tagName == "I")
        concatedStyle["italic"] = true;
      if (item.tagName == "U")
        concatedStyle["underline"] = Underline.Single;
      if (item.tagName == "STRONG")
        concatedStyle["bold"] = true;
    })
    this.style.properties = concatedStyle;

    let paragraphSpacing: any = {};
    if (this.lineSpaceBefore && this.lineSpaceBefore != 'none') paragraphSpacing.spaceBefore = parseFloat(this.lineSpaceBefore.replace('pt', '').trim());
    if (this.lineSpaceAfter && this.lineSpaceAfter != 'none') paragraphSpacing.spaceAfter = parseFloat(this.lineSpaceAfter.replace('pt', '').trim());
    if (this.lineSpaceRule) paragraphSpacing.lineSpacingRule = LineSpaceRule[this.lineSpaceRule];
    if (this.lineSpaceRule && this.lineSpaceHeight && this.lineSpaceHeight != 'none') paragraphSpacing.lineSpacing = this.lineSpaceRule == FormatOptions.multiple ? parseFloat(this.lineSpaceHeight) : 0;

    if (this.leftIndentation && this.leftIndentation != 'none') paragraphSpacing.leftIndentation = parseFloat(this.leftIndentation.replace('cm', '').trim());
    if (this.rightIndentation && this.rightIndentation != 'none') paragraphSpacing.rightIndentation = parseFloat(this.rightIndentation.replace('cm', '').trim());

    if (this.lineSpaceBefore || this.lineSpaceAfter || this.lineSpaceRule)
      this.style.properties.paragraphSpacing = paragraphSpacing;
    else
      this.style.properties.paragraphSpacing = null;

    for (var i = 0; i < this.layout.selectedLayout.styles.length; i++) {
      if (this.layout.selectedLayout.styles[i].styleOn == this.style.styleOn) {
        this.layout.selectedLayout.styles[i] = this.style;
        break;
      }
    }

    if (!this.layout.isNew) {
      this.documentService.updateLayoutStyles(this.layout.selectedLayout).subscribe(response => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.updateLayoutStyleToContent).publish(this.layout.selectedLayout);
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.applyLayoutStyleToContent).publish(this.layout.selectedLayout);
        this.toastr.success(this.translate.instant('screens.home.labels.paragraphSpacing'));
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.ref.close();
      },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });
    }
    else {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.setStyleForNewLayout).publish(this.layout.selectedLayout);
      this.toastr.success(this.translate.instant('screens.home.labels.paragraphSpacing'));
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.ref.close();
    }
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  toggleDefineColors() {
    this.dialogService.open(DefineColorsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { section: DefineColorSection.formatStyling }
    });
  }
}
