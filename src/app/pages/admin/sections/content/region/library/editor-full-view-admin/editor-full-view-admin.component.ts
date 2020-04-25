import { Component, OnInit, Input, ChangeDetectorRef, Pipe, PipeTransform, ElementRef } from '@angular/core';
import { TreeviewI18n, TreeviewI18nDefault } from 'ngx-treeview/src/treeview-i18n';
import { TreeviewSelection } from 'ngx-treeview';
// import MultirootEditor from '@ckeditor/ckeditor5-build-classic';
import MultirootEditor from '../../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { BlockAttributeRequest, BlockFootNote, FootNoteRequestiewModel, cssStyles, Guid, ParagraphSpacing, CrossReference } from '../../../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../../../project-design/services/designer.service';
import { ResponseStatus } from '../../../../../../../@models/ResponseStatus';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../@models/common/dialog';
import { BlockService } from '../../../../../../admin/services/block.service';
import { LibraryService } from '../../../../../../project-design/services/library.service';
import { LibraryDetailsRequestModel } from '../../../../../../../@models/projectDesigner/template';
import { LibraryEnum, LibrarySectionEnum, FullViewDefault, waterMarkProp, ActionEnum, HeaderTypeEnum, FooterTypeEnum, HeaderFooterViewModel, WaterMarkViewModel, EditorInfo, EditorNamesPrefix, marginProp, MarginViewModel, FootNoteSymbolMasterViewModel, WatermarkSettings } from '../../../../../../../@models/projectDesigner/common';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { DocumentViewService } from '../../../../../../project-design/services/document-view.service';
import { DeliverableService } from '../../../../../../project-design/services/deliverable.service';
import { TemplateService } from '../../../../../../project-design/services/template.service';
import { CustomHTML } from '../../../../../../../shared/services/custom-html.service';
import { MultiRootEditorService } from '../../../../../../../shared/services/multi-root-editor.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ManageAdminService } from '../../../../../services/manage-admin.service';
import { Alignment, HorizontalPosition, VerticalPosition, Rotation } from '../../../../../../../@models/projectDesigner/report';
import { DesignerService as DesignerServiceAdmin } from '../../../../../services/designer.service';
import { libraryActions } from '../../../../../../../@models/admin/library';
import { marginValues, highlightValues } from '../../../../../../../@models/common/valueconstants';
import { BlockTitleViewModel } from '../../../../../../project-management/@models/blocks/block';
import { DocumentLayoutStyle, StyleOn } from '../../../../../../../@models/projectDesigner/formatStyle';
import { FormatStylingOptions } from '../../../../../../../shared/services/format-options.service';
import { DocumentMapper } from '../../../../../../../shared/services/document-mapper.service';
import { DocumentMapperModel } from '../../../../../../../@models/projectDesigner/documentMapper';
import { ToastrService } from 'ngx-toastr';
import { SubMenus } from '../../../../../../../@models/projectDesigner/designer';
import { TaskService } from '../../../../../../project-design/modules/document-view/services/task.service';
import { Index } from '../../../../../../../@models/projectDesigner/infoGathering';

@Component({
  selector: 'ngx-editor-full-view-admin',
  templateUrl: './editor-full-view-admin.component.html',
  styleUrls: ['./editor-full-view-admin.component.scss'],
  providers: [
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          switch (selection.checkedItems.length) {
            case 0:
              return '--Select--';
            case 1:
              return selection.checkedItems[0].text;
            default:
              return selection.checkedItems.length + " options selected";
          }
        }
      })
    }
  ],
})
export class EditorFullViewAdminComponent implements OnInit {
  @Input()
  blockContentPayload;

  editor: any;
  subscriptions: Subscription = new Subscription();
  marginViewModel: MarginViewModel = new MarginViewModel();
  IsUpdatePageMargin: string;
  pageMargin: any;
  marginprop: marginProp;
  showLoader: boolean = false;
  blockContentList = [];
  blockIds = [];
  flatView = [];
  currentBlock: string;
  blockBatchSize = 3;

  //ngx-scrollbar options
  direction = '';
  scrollDistance = 9;
  scrollUpDistance = 2;
  throttle = 500;

  pageSize = 0;
  pageIndex = 1;

  loaderId = 'FullViewLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  users: any = [];
  suggestions: any = [];
  loggedInUserDetails: any = {};
  commentThreads: any = [];
  headerFootersuggestions: any = [];
  headerFootercommentThreads: any = [];
  loggedInUser: any = {};
  rootsTobeSaved: EditorInfo[] = [];
  projectId: any;
  templateId: any;
  highlight: any = false;
  outputText: string;
  headerRequestViewModel = new HeaderFooterViewModel();
  footerRequestViewModel = new HeaderFooterViewModel();
  waterMarkViewModel = new WaterMarkViewModel();
  IsUpdateHeader: string = "";
  IsUpdateFooter: string = "";
  showBorderBottom: Boolean;
  showBorderTop: Boolean;
  headerShow: boolean = false;
  footerShow: boolean = false;
  placeHolder = ActionEnum.typeSomething;
  headerText: any = "";
  footerText: any = "";
  pageColor: any;
  IsUpdatePageColor: string;
  IsUpdatePageOrientation: any;
  IsUpdatePageSize: string;
  pageOrientation: string;
  pageLayoutSize: string;
  IsUpdateWaterMark: string;
  waterMarkOrientation: string;
  onChange: boolean = false;
  IsUpdateTableOfContent: string;
  WaterMarkPropAlignment: Alignment = {
    orientation: 0,
    horizontalAlignment: 0,
    verticalAlignment: 0
  }
  waterMarkprop: waterMarkProp = {
    FontName: "", FontSize: "", Text: "",
    Alignment: this.WaterMarkPropAlignment
  }
  waterMarkPropTemp: waterMarkProp = {
    FontName: "", FontSize: "", Text: "",
    Alignment: this.WaterMarkPropAlignment
  }
  tableOfContent: string;
  footNotesIndex = [];
  outputSelectedText: string;
  findElements: any = [];
  replaced: boolean;
  replacedSave: any;
  footNotesBlock: BlockFootNote[] = [];
  addFootNote: boolean = false;
  footNoteEditorData: EditorInfo[] = [];
  blockTitleEditorData: EditorInfo[] = [];
  editableBlockTitle = [];
  blockId: string;
  presentBlock: any;
  isPageBreakClicked: boolean;
  isPageBreak: boolean;
  selectedStyle = new DocumentLayoutStyle();
  rawView: DocumentMapperModel[] = [];

  SelectedParagraphText: any;
  cssStyles = new Array<cssStyles>();
  removeCSSStylesList = new Array<cssStyles>();
  index: any;
  footNoteSymbols: FootNoteSymbolMasterViewModel[] = [];
  //constant for pattern
  searchTextFirstHalf = '<span style="color:blue;background-color:yellow;">';
  searchTextSecondHalf = "</span>";
  boldText = '<strong>';
  boldTextEnd = "</strong>";
  italicText = '<i>';
  italicEnd = "</i>";
  underlineTextEnd = "</u>";
  underlineText = '<u>';
  searchGrayColor = '<span style="color:black;background-color:gray;">';

  constructor(private designerService: DesignerService,
    private _eventService: EventAggregatorService,
    private documentViewService: DocumentViewService,
    private dialogService: DialogService,
    private translate: TranslateService,
    private templateService: TemplateService,
    private deliverableService: DeliverableService,
    private blockService: BlockService,
    private changeDetectorRef: ChangeDetectorRef,
    private libraryService: LibraryService,
    private ngxLoader: NgxUiLoaderService,
    private customHTML: CustomHTML,
    private multiRootEditorService: MultiRootEditorService,
    private elRef: ElementRef,
    private formatStyling: FormatStylingOptions,
    private taskService: TaskService,
    private manageAdminService: ManageAdminService, private designerServiceAdmin: DesignerServiceAdmin, private toastr: ToastrService, private documentMapper: DocumentMapper) { }

  ngOnInit() {
    this.designerService.isAdminModule = true;
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.blockContentList = new Array();
    this.users = [];
    this.loggedInUser = this.multiRootEditorService.getLoggedInUserDetails();
    this.users.push(this.loggedInUser);
    this.selectedStyle = null;

    //changing the language.
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createEditor(this.flatView);
    });
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryChange).subscribe(payload => {
      this.getDocumentLayoutStyle();
      this.resetFormatting();
      this.projectId = this.designerServiceAdmin.dummyProjectDetails.projectId;
      let section = this.designerService.manageLibraryDetails.name.toLowerCase();
      if (section == LibraryEnum.globaloecd)
        this.templateId = this.designerServiceAdmin.dummyProjectDetails.oecdGlobalTemplateId;
      else if (section == LibraryEnum.countrytemplate)
        this.templateId = this.designerServiceAdmin.dummyProjectDetails.oecdCountryTemplateId;
      if (section == (LibraryEnum.countrytemplate) || section == LibraryEnum.globaloecd) {
        this.getAllFormatting();
      }
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction)
      .subscribe((payload: any) => {
        switch (payload.action) {
          case ActionEnum.find:
            this.highlight_word(payload.searchedText);
            break;
          case ActionEnum.findNext:
            this.findNext(payload.searchedText);
            break;
          case ActionEnum.replaceSelected:
            this.replace_selected(payload.searchedText, payload.replaceWith);
            break;
          case ActionEnum.findPrevious:
            this.findPrevious(payload.searchedText);
            break;
          case ActionEnum.replace:
            if (!this.highlight)
              this.highlight_word(payload.searchedText);
            this.replace_word(payload.searchedText, payload.replaceWith);
            break;
          case ActionEnum.insertTable:
            this.insertTableData(payload.data);
            break;
          case ActionEnum.cancel:
            this.remove_Highlight(payload.searchedText);
            break;
        }
      }));
    //add footnote
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.addFootNote).
      subscribe((payload: any) => {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        let blockFootNote = new BlockFootNote();
        if (this.blockId == undefined) {
          if (this.loaderId)
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
          let warningMessage = this.translate.instant('screens.project-designer.document-view.footNote.no-cursor-message');
          this.toastr.warning(warningMessage);
          return;
        }
        blockFootNote.blockId = this.blockId;
        let fnIndex = (this.footNotesIndex.length > 0) ? parseInt(this.footNotesIndex[this.footNotesIndex.length - 1]) + 1 : 1;
        let symbolFootNote = this.footNoteSymbols.find(x => x.symbolNumber == fnIndex);
        blockFootNote.referenceTag = (symbolFootNote != undefined) ? symbolFootNote.symbol : 'unknown';
        blockFootNote.symbol = blockFootNote.referenceTag;
        blockFootNote.index = fnIndex;
        var request = new FootNoteRequestiewModel();
        request.blockId = this.blockId;
        request.footNotes = blockFootNote;
        this.documentViewService.addFootNote(request).subscribe(response => {
          this.addFootNote = true;
          const viewFragment = this.editor.data.processor.toView('<sup id=' + '"' + response + '" class="footNtCss">' + blockFootNote.referenceTag + '</sup><span> </span><span>&nbsp;</span>');
          const modelFragment = this.editor.data.toModel(viewFragment);
          this.editor.model.insertContent(modelFragment);
          this.blockId = null;
          this.ngxLoader.stopBackground(this.loaderId);
        })
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action)
      .subscribe((action: any) => {
        switch (action) {
          case 'saveAll':
            this.saveData(false);
            break;
          case 'scrollToBlock':
            this.scrollToBlockContent();
            break;
          case 'reload':
            this.ngxLoader.startBackgroundLoader(this.loaderId);
            this.ngAfterViewInit();//Todo : Get rid of call to ngAfterViewInIt(). 
            break;
        }
      }));
    this.taskService.getAllSymbols().subscribe((data: FootNoteSymbolMasterViewModel[]) => {
      this.footNoteSymbols = data;
    })
    //questions list
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByLibrary)
      .subscribe((payload: any) => {
        this.getQuestionsByBlockId();
      }));
    //formatting starts

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.EnableDisableFormatPainter)
    .subscribe((payload: any) => {
      //TODO: This code should be optimized to bulk update/remove/add operations
      let count = this.flatView.length;
      for (let i = 0; i < count; i++) {
        document.getElementsByClassName("editor-heading")[i].classList.remove("myClass", "formatPainterClass");
      }
    }));
    
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.FormatPainterAddClass)
    .subscribe((payload: any) => {
      //TODO: This code should be optimized to bulk update/remove/add operations
        let count = this.flatView.length;
        for (let i = 0; i < count; i++) {
        document.getElementsByClassName("editor-heading")[i].classList.add("myClass","formatPainterClass");
        }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ApplyParagraphSpacing)
      .subscribe((payload: any) => {
        this.ApplyParagraphSpacing(payload);
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.AddBookmark)
      .subscribe((payload: any) => {
        this.AddBookMark(payload);
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.bookmarkList)
      .subscribe((payload: any) => {
        this.GetAllBookmark();
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ApplyCrossReference)
      .subscribe((payload: any) => {
        this.ApplyCrossReference(payload);
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.reloadHeaderFooterByTemplateId)
      .subscribe((response: any) => {
        // this.templateOrDeliverableId = response;
        this.onChange = true;
        this.getHeaderFooterText();
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageColor)
      .subscribe((payload: any) => {
        this.pageColor = payload;
        this.getPageColor(false)
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageMargin).
      subscribe((payload: marginProp) => {
        this.marginprop = payload;
        this.getPageMargin(false);
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.customMargin).subscribe((payload: marginProp) => {
      this.marginprop = payload;
      this.getPageMargin(false);
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageOrientation)
      .subscribe((payload: any) => {
        this.pageOrientation = payload;
        this.getPageOrientation(false)
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageSize)
      .subscribe((payload: any) => {
        this.pageLayoutSize = payload;
        this.getPageLayoutSize(false)
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.tableOfContentType)
      .subscribe((payload: any) => {
        this.tableOfContent = payload;
        this.getTableOfContent(false);
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.removeTableOfContent)
      .subscribe((payload: any) => {
        this.removeTableOfContent();
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.waterwark).
      subscribe((payload: any) => {
        this.waterMarkOrientation = this.getOrientation(payload.Alignment);
        if (payload.Text == null) {
          this.waterMarkprop = payload;
          this.deleteWaterMark(ActionEnum.noWaterMark);
        }
        else {
          this.waterMarkprop = payload;
          this.getWaterMark(false);
        }
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.documentHeaderType)
      .subscribe((value: any) => {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        switch (value) {
          case HeaderTypeEnum.headerType1:
            this.headerShow = true;
            this.showBorderBottom = true;
            this.headerText = '<p>' + this.placeHolder + '</p><p></p>';
            this.ngAfterViewInit();
            break;
          case HeaderTypeEnum.headerType2:
            this.headerShow = true;
            this.showBorderBottom = true;
            this.headerText = '<p>' + this.placeHolder + '</p>' +
              '<p>' + this.placeHolder + '</p>';
            this.ngAfterViewInit();
            break;
          case HeaderTypeEnum.headerType3:
            this.headerShow = true;
            this.showBorderBottom = true;
            this.headerText = '<p></p><p>' + this.placeHolder + '</p>';
            this.ngAfterViewInit();
            break;

        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.documentFooterType)
      .subscribe((value: any) => {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        switch (value) {
          case FooterTypeEnum.footerType1:
            this.footerShow = true;
            this.showBorderTop = true;
            this.footerText = '<p>' + this.placeHolder + '</p><p></p>';
            this.ngAfterViewInit();
            break;
          case FooterTypeEnum.footerType2:
            this.footerShow = true;
            this.showBorderTop = true;
            this.footerText = '<p>' + this.placeHolder + '</p>' +
              '<p>' + this.placeHolder + '</p>';
            this.ngAfterViewInit();
            break;
          case FooterTypeEnum.footerType3:
            this.footerShow = true;
            this.showBorderTop = true;
            this.footerText = '<p></p><p>' + this.placeHolder + '</p>';
            this.ngAfterViewInit();
            break;
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteHeader)
      .subscribe((value) => {
        if (value == ActionEnum.deleteHeader) {
          this.deleteHeaderFooter(ActionEnum.header);
          this.headerShow = false;
          this.headerText = "";
        }
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteFooter)
      .subscribe((value) => {
        if (value == ActionEnum.deleteFooter) {
          this.deleteHeaderFooter(ActionEnum.footer);
          this.footerShow = false;
          this.footerText = "";
        }
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.pageBreak).subscribe((payload: any) => {
      if (this.blockId == undefined || this.blockId == null)
        this.blockId = this.designerServiceAdmin.blockDetails.blockId;
      this.isPageBreakClicked = true;
      this.isPageBreak = payload;
      this.flatView.forEach(x => {
        if (x.blockId == this.blockId) {
          x.isPageBreak = this.isPageBreak;
        }
      });
      this.blockContentList.filter(x => {
        if (x.blockId == this.blockId) {
          x.isPageBreak = this.isPageBreak;
        }
      });
      this.saveData(true);
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.applyLayoutStyleToContent).subscribe((selectedLayoutStyle: DocumentLayoutStyle) => {
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.selectedStyle = selectedLayoutStyle;
      if (this.editor != undefined)
        this.editor.destroy();
      this.editor = undefined;
      if (selectedLayoutStyle) {
        this.flatView = [];
        this.rawView.forEach(item => {
          item.content = this.formatStyling.translateHTML(item.content, selectedLayoutStyle, StyleOn.Body);
          item.documentTitle = this.formatStyling.translateHTML(item.documentTitle, selectedLayoutStyle, StyleOn["Heading1"]);

          //set track changes and comments at block level in order to show right side bar -- starts.
          if (this.multiRootEditorService.isTrackChangesEnabled) {
            let editorFormatOptions = this.multiRootEditorService.setTrackChangesAndComments(item, this.suggestions, this.commentThreads, this.users);
            this.suggestions = editorFormatOptions.suggestions;
            this.commentThreads = editorFormatOptions.commentThreads;
            this.users = editorFormatOptions.users;
          }
          //set track changes and comments at block level in order to show right side bar -- ends.

          this.flatView.push(item)
        });

        let _parent = this;
        setTimeout(function () {
          _parent.changeDetectorRef.detectChanges();
          _parent.createEditor(_parent.flatView);
          _parent.ngxLoader.stopBackgroundLoader(_parent.loaderId);
        });
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.adminModule.insert.selectBlock_pagebreak).subscribe((data: any) => {
      if (data && data !== null) {
        let payload: any = {};
        payload.blockId = this.blockId = data.blockId;
        if (this.blockContentList.filter(item => item.blockId == payload.blockId && item.isPageBreak == true).length > 0)
          payload.isPageBreakApplied = true;
        else
          payload.isPageBreakApplied = false;
        this._eventService.getEvent(eventConstantsEnum.adminModule.insert.highlight_Pageborder).publish(payload);
      }
    }));
  }
  ngAfterViewInit() {
    var section: any;
    if (this.designerService.isDeliverableSection) {
      section = FullViewDefault.deliverable;
    }
    else if (this.designerService.isLibrarySection) {
      switch (this.designerService.manageLibraryDetails.name.toLowerCase()) {
        case LibraryEnum.global:
          section = LibraryEnum.global
          break;
        case LibraryEnum.country:
          section = LibraryEnum.country
          break;
        case LibraryEnum.organization:
          section = LibraryEnum.organization
          break;
        case LibraryEnum.user:
          section = LibraryEnum.user
          break;
        case LibraryEnum.blocks:
          section = LibraryEnum.blocks
          break;
        case LibraryEnum.globaloecd:
          section = LibraryEnum.globaloecd
          this.templateId = this.designerServiceAdmin.dummyProjectDetails.oecdGlobalTemplateId
          break;
        case LibraryEnum.countrytemplate:
          section = LibraryEnum.countrytemplate
          this.templateId = this.designerServiceAdmin.dummyProjectDetails.oecdCountryTemplateId
          break;
      }

    }
    else {
      section = FullViewDefault.template
    }
    this.getBlockContents(section).then(response => {
      this.createEditor(this.flatView);
      this.getQuestionsByBlockId();
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }).catch(error => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }

  createEditor(blockContentList) {
    let sourceElement: any = {};
    this.blockIds.forEach((item, index) => {
      var block = blockContentList.find(x => x.blockId == item);
      this.presentBlock = block;
      if (!block.isStack) {
        sourceElement["header" + '-' + item] = document.querySelector('#editor' + index);
        sourceElement["header_title" + '-' + item] = document.querySelector('#editor_title' + index);
      }
      if (block.footNotes) {
        block.footNotes.forEach(footNote => {
          sourceElement[EditorNamesPrefix.footNote + footNote.id] = document.querySelector('#footNoteEditor' + footNote.id);
        });
      }
    });
    if (document.querySelector('#headerEditor') != undefined) {
      sourceElement["headerSection"] = document.querySelector('#headerEditor');
    }
    if (document.querySelector('#footerEditor') != undefined) {
      sourceElement["footerSection"] = document.querySelector('#footerEditor');
    }
    var instant = this;
    var saveFnc = {
      waitingTime: 30000,
      save(editor) {
        if (instant.highlight != undefined && !instant.highlight) {
          return instant.saveData(1);
        }
      }
    }
    if (document.querySelector('#toolbar-menu') != undefined) {
      document.querySelector('#toolbar-menu')['innerText'] = '';
    }
    if (this.editor != undefined) {
      if (document.querySelector('#toolbar-menu') != undefined) {
        document.querySelector('#toolbar-menu').childNodes.forEach(x => {
          if (x.isEqualNode(this.editor.ui.view.toolbar.element))
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
        });
      }
      this.editor.destroy();
      this.editor = undefined;
    }

    this.suggestions = [].concat(this.suggestions, this.headerFootersuggestions);
    this.commentThreads = [].concat(this.commentThreads, this.headerFootercommentThreads);
    this.multiRootEditorService.createInstance(sourceElement, saveFnc, this.loggedInUser.id, this.users, this.suggestions, this.commentThreads, undefined, this.designerService.definedColorCodes, 'ck ck-sidebar ck-reset ck-sidebar--wide', this.translate.currentLang).then(editor => {
      this.editor = editor;
    });

    let blockList = blockContentList;
    var _parentThis = this;
    setTimeout(function () {
      blockList.forEach(item => {
        if (item.content != null)
          _parentThis.customHTML.multiRootEditorGetResizedWidth(item.blockId, item.content);
      })
    });
  }

  highlight_word(searchedText) {
    this.highlight = true;
    if (searchedText) {
      var pattern = new RegExp("(" + searchedText + ")", "gi");
      this.outputText = this.searchTextFirstHalf + searchedText + this.searchTextSecondHalf;
      this.outputSelectedText = this.searchGrayColor + searchedText + this.searchTextSecondHalf;
      var rootNames = this.editor.model.document.getRootNames();
      for (const rootName of rootNames) {
        var searchpara = this.editor.getData({ rootName });
        var new_text = searchpara.replace(pattern, this.outputText);
        const initialData = {};
        initialData[rootName] = new_text;
        this.editor.setData(initialData);
      }
      this.getfindElements(this.outputText, searchedText);
      this.designerService.searchIndex = 0;
      if (this.findElements.length > 0 && this.designerService.searchIndex < this.designerService.findElements.length) {
        this.designerService.isFindNext = true;
      }

    }
  }
  replace_word(searchedText, replaceWith) {
    if (replaceWith) {
      let searchText = this.searchTextFirstHalf + searchedText + this.searchTextSecondHalf;
      let searchTextBold = this.searchTextFirstHalf + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
      let searchTextItalic = this.searchTextFirstHalf + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
      let searchTextUnderline = this.searchTextFirstHalf + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;
      let searchTextBoldItalic = this.searchTextFirstHalf + this.italicText + this.boldText + searchedText + this.boldTextEnd + this.italicEnd + this.searchTextSecondHalf;
      let searchTextBoldUnderline = this.searchTextFirstHalf + this.boldText + this.underlineText + searchedText + this.underlineTextEnd + this.boldTextEnd + this.searchTextSecondHalf;
      let searchTextItalicUnderline = this.searchTextFirstHalf + this.italicText + this.underlineText + searchedText + this.underlineTextEnd + this.italicEnd + this.searchTextSecondHalf;

      var rootNames = this.editor.model.document.getRootNames();
      for (const rootName of rootNames) {
        let blockId = rootName.split("-")[1];
        let block = this.blockContentList.find(x => x.blockId == blockId);
        if (block && block.isLocked) {
          continue;
        }
        var searchpara = this.editor.getData({ rootName });
        let indexes = [];
        indexes = this.getIndicesOf(searchText, searchpara, false);
        let indexesBold, indexesItalic, indexesUnderline, indexesBoldItalic, indexesBoldUnderline, indexesItalicUnderline = [];
        indexesBold = this.getIndicesOf(searchTextBold, searchpara, false);
        indexesBold.forEach(index => {
          indexes.push(index);
        })
        indexesItalic = this.getIndicesOf(searchTextItalic, searchpara, false);
        indexesItalic.forEach(index => {
          indexes.push(index);
        })
        indexesUnderline = this.getIndicesOf(searchTextUnderline, searchpara, false);
        indexesUnderline.forEach(index => {
          indexes.push(index);
        })
        indexesBoldItalic = this.getIndicesOf(searchTextBoldItalic, searchpara, false);
        indexesBoldItalic.forEach(index => {
          indexes.push(index);
        })
        indexesBoldUnderline = this.getIndicesOf(searchTextBoldUnderline, searchpara, false);
        indexesBoldUnderline.forEach(index => {
          indexes.push(index);
        })
        indexesItalicUnderline = this.getIndicesOf(searchTextItalicUnderline, searchpara, false);
        indexesItalicUnderline.forEach(index => {
          indexes.push(index);
        })
        indexesBold = this.getIndicesOf(searchTextBold, searchpara, false);
        let new_text = searchpara;
        for (let i = 0; i < indexes.length; i++) {
          this.searchAndReplaceEditor(rootName, searchText, replaceWith);
          this.searchAndReplaceEditor(rootName, searchTextBold, replaceWith);
          this.searchAndReplaceEditor(rootName, searchTextItalic, replaceWith);
          this.searchAndReplaceEditor(rootName, searchTextUnderline, replaceWith);
          this.searchAndReplaceEditor(rootName, searchTextBoldItalic, replaceWith);
          this.searchAndReplaceEditor(rootName, searchTextBoldUnderline, replaceWith);
          this.searchAndReplaceEditor(rootName, searchTextItalicUnderline, replaceWith);
        }
      }
    }
    this.replace_selected(searchedText, replaceWith);
    this.remove_Highlight(searchedText)
    this.designerService.findEnable = false;
  }
  getfindElements(searchText, searchedText) {
    let searchTextBold = this.searchTextFirstHalf + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
    let searchTextItalic = this.searchTextFirstHalf + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
    let searchTextUnderline = this.searchTextFirstHalf + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;
    let searchTextBoldItalic = this.searchTextFirstHalf + this.italicText + this.boldText + + searchedText +  this.boldTextEnd + this.italicEnd + this.searchTextSecondHalf;
    let searchTextBoldUnderline = this.searchTextFirstHalf + this.boldText + this.underlineText + searchedText +  this.underlineTextEnd + this.boldTextEnd + this.searchTextSecondHalf;
    let searchTextItalicUnderline = this.searchTextFirstHalf + this.italicText + this.underlineText  + searchedText + this.underlineTextEnd + this.italicEnd +  this.searchTextSecondHalf;
    this.findElements = [];
    var rootNames = this.editor.model.document.getRootNames();
    rootNames.forEach(rootName => {
      var findEle = [];
      var searchpara = this.editor.getData({ rootName });
      let indexes = this.getIndicesOf(searchText, searchpara, false);
      indexes.forEach((index) => {
        let element = { 'rootName': rootName, 'index': index };
        findEle.push(element);
      })
      let indexesBold = this.getIndicesOf(searchTextBold, searchpara, false);
      indexesBold.forEach((index) => {
        let element = { 'rootName': rootName, 'index': index };
        findEle.push(element);
      })
      let indexesItalic = this.getIndicesOf(searchTextItalic, searchpara, false);
      indexesItalic.forEach((index) => {
        let element = { 'rootName': rootName, 'index': index };
        findEle.push(element);
      })
      let indexesUnderline = this.getIndicesOf(searchTextUnderline, searchpara, false);
      indexesUnderline.forEach((index) => {
        let element = { 'rootName': rootName, 'index': index };
        findEle.push(element);
      })
      let indexesBoldItalic = this.getIndicesOf(searchTextBoldItalic, searchpara, false);
      indexesBoldItalic.forEach((index) => {
        let element = { 'rootName': rootName, 'index': index };
        findEle.push(element);
      })
      let indexesBoldUnderline = this.getIndicesOf(searchTextBoldUnderline, searchpara, false);
      indexesBoldUnderline.forEach((index) => {
        let element = { 'rootName': rootName, 'index': index };
        findEle.push(element);
      })
      let indexesItalicUnderline = this.getIndicesOf(searchTextItalicUnderline, searchpara, false);
      indexesItalicUnderline.forEach((index) => {
        let element = { 'rootName': rootName, 'index': index };
        findEle.push(element);
      })
      findEle = findEle.sort((a, b) => {
        return a.index - b.index;
      })
      findEle.forEach(x => {
        this.findElements.push(x);
      })
    });
    this.designerService.findElements = this.findElements;
  }

  findNext(searchedText) {
    let search = this.searchTextFirstHalf + searchedText + this.searchTextSecondHalf;
    let searchTextBold = this.searchTextFirstHalf + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
    let searchTextItalic = this.searchTextFirstHalf + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
    let searchTextUnderline = this.searchTextFirstHalf + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;
    let replaceText = this.searchGrayColor + searchedText + this.searchTextSecondHalf;
    let replaceTextBold = this.searchGrayColor + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
    let replaceTextItalic = this.searchGrayColor + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
    let replaceTextUnderline = this.searchGrayColor + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;
    this.highlightNext(search, searchedText, replaceText, true);
    this.highlightNext(searchTextBold, searchedText, replaceTextBold, true);
    this.highlightNext(searchTextItalic, searchedText, replaceTextItalic, true);
    this.highlightNext(searchTextUnderline, searchedText, replaceTextUnderline, true);

    if (this.findElements.length >= this.designerService.searchIndex + 1) {
      this.designerService.searchIndex = this.designerService.searchIndex + 1;
    }
    if (this.designerService.searchIndex == this.designerService.findElements.length) {
      this.designerService.isFindNext = false;
    }
    else {
      this.designerService.isFindNext == true;
    }
  }


  private highlightNext(search: string, searchedText: any, replaceText: string, isNext: boolean) {
    let replaceTextOldElement = this.searchTextFirstHalf + searchedText + this.searchTextSecondHalf;
    let searchOldElement = this.searchGrayColor + searchedText + this.searchTextSecondHalf;
    let replaceTextBoldOldElement = this.searchTextFirstHalf = this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
    let replaceTextItalicOldElement = this.searchTextFirstHalf + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
    let replaceTextUnderlineOldElement = this.searchTextFirstHalf + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;
    let searchTextBoldOldElement = this.searchGrayColor + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
    let searchTextItalicOldElement = this.searchGrayColor + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
    let searchTextUnderlineOldElement = this.searchGrayColor + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;

    let length = search.length;
    var rootName, position: any;
    if (isNext) {
      rootName = this.findElements[this.designerService.searchIndex].rootName;
      position = this.findElements[this.designerService.searchIndex].index;
    }
    else {
      rootName = this.findElements[this.designerService.searchIndex - 2].rootName;
      position = this.findElements[this.designerService.searchIndex - 2].index
    }
    var searchpara = this.editor.getData({ rootName });
    if (this.designerService.searchIndex > 0) {
      this.setBackOldElement(searchedText, this.designerService.searchIndex - 1, replaceTextOldElement, searchOldElement);
      this.setBackOldElement(searchedText, this.designerService.searchIndex - 1, replaceTextBoldOldElement, searchTextBoldOldElement);
      this.setBackOldElement(searchedText, this.designerService.searchIndex - 1, replaceTextItalicOldElement, searchTextItalicOldElement);
      this.setBackOldElement(searchedText, this.designerService.searchIndex - 1, replaceTextUnderlineOldElement, searchTextUnderlineOldElement);

      this.getfindElements(search, searchedText);
            var rootName, position: any;
      if (isNext) {
        rootName = this.findElements[this.designerService.searchIndex].rootName;
        position = this.findElements[this.designerService.searchIndex].index;
      }
      else {
        rootName = this.findElements[this.designerService.searchIndex - 2].rootName;
        position = this.findElements[this.designerService.searchIndex - 2].index
      }
      var searchpara = this.editor.getData({ rootName });
    }
    if (searchpara.substr(position, length) == search) {
      this.outputText = this.Replace(searchpara, position, position + length, replaceText);
      const initialData = {};
      initialData[rootName] = this.outputText;
      this.editor.setData(initialData);
    }
  }


  setBackOldElement(searchedText, index, search, replaceText) {
    var pattern = new RegExp("(" + search + ")", "gi");
    var rootName = this.findElements[index].rootName;
    var position = this.findElements[index].index
    var searchpara = this.editor.getData({ rootName });
    if (this.replaced) {
      if (searchpara.substr(position, length) == search) {
        this.outputText = this.Replace(searchpara, position, position + replaceText.length, replaceText)
        this.replaced = false;
      }
    }
    else {
      if (searchpara.substr(position, length) == search) {
        this.outputText = this.Replace(searchpara, position, position + search.length, replaceText)
      }
    }
    const initialData = {};
    initialData[rootName] = this.outputText;
    this.editor.setData(initialData);
  }

  findPrevious(searchedText) {
    let search = this.searchTextFirstHalf + searchedText + this.searchTextSecondHalf;
    let replaceText = this.searchGrayColor + searchedText + this.searchTextSecondHalf;
    let searchTextBold = this.searchTextFirstHalf + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
    let searchTextItalic = this.searchTextFirstHalf + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
    let searchTextUnderline = this.searchTextFirstHalf + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;
    let replaceTextBold = this.searchGrayColor + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
    let replaceTextItalic = this.searchGrayColor + this.italicEnd + this.italicEnd + this.searchTextSecondHalf;
    let replaceTextUnderline = this.searchGrayColor + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;

    this.highlightNext(search, searchedText, replaceText, false);
    this.highlightNext(searchTextBold, searchedText, replaceTextBold, false);
    this.highlightNext(searchTextItalic, searchedText, replaceTextItalic, false);
    this.highlightNext(searchTextUnderline, searchedText, replaceTextUnderline, false);
    this.designerService.searchIndex = this.designerService.searchIndex - 1;
    if (this.designerService.searchIndex == this.designerService.findElements.length) {
      this.designerService.isFindNext = false;
    }
    else {
      this.designerService.isFindNext = true;
    }
  }


  Replace(text, start, end, replaceText) {
    return text.substring(0, start) + replaceText + text.substring(end);
  };

  getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  remove_Highlight(searchedText) {
    this.highlight = false;
    if (searchedText) {
      var pattern = new RegExp("(" + this.searchTextFirstHalf + searchedText + this.searchTextSecondHalf + ")", "gi");
      var otherpattern = new RegExp("(" + this.searchGrayColor + searchedText + this.searchTextSecondHalf + ")", "gi");
      this.outputText = searchedText;
      var rootNames = this.editor.model.document.getRootNames();
      for (const rootName of rootNames) {
        var searchpara = this.editor.getData({ rootName });
        var new_text = searchpara.replace(pattern, this.outputText);
        var new_text = new_text.replace(pattern, otherpattern);
        const initialData = {};
        initialData[rootName] = new_text;
        this.editor.setData(initialData);
      }
    }
    this.removeSelected(searchedText);
    this.designerService.isFindPrevious = false;
    this.designerService.isFindNext = false;
    this.designerService.findEnable = false;
  }
  replace_selected(searchedText, replaceWith) {
    if (replaceWith) {
      let searchTextBold = this.searchGrayColor + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
      let searchTextItalic = this.searchGrayColor + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
      let searchTextUnderline = this.searchGrayColor + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;

      var rootNames = this.editor.model.document.getRootNames();
      for (const rootName of rootNames) {
        this.searchAndReplaceEditor(rootName, this.outputSelectedText, replaceWith);
        this.searchAndReplaceEditor(rootName, searchTextBold, replaceWith);
        this.searchAndReplaceEditor(rootName, searchTextItalic, replaceWith);
        this.searchAndReplaceEditor(rootName, searchTextUnderline, replaceWith);
      }
      let search = this.searchTextFirstHalf + searchedText + this.searchTextSecondHalf;
      this.getfindElements(search, searchedText);
      this.designerService.searchIndex = this.designerService.searchIndex - 1;
      this.replaced = true;
    }
  }

  searchAndReplaceEditor(rootName, outputTobeReplace, replaceWith) {
    var searchpara = this.editor.getData({ rootName });
    if (searchpara.indexOf(outputTobeReplace) > -1) {
      var new_text = searchpara.replace(new RegExp(outputTobeReplace.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), replaceWith);
      const initialData = {};
      var objRoot = new EditorInfo();
      objRoot.rootName = rootName;
      let blockId = rootName.split("-")[1];
      let index = this.blockIds.findIndex(x => x == blockId);
      objRoot.Index = index;
      if (this.rootsTobeSaved.findIndex(x => x.Index == objRoot.Index) == -1)
        this.rootsTobeSaved.push(objRoot);
      initialData[rootName] = new_text;
      this.editor.setData(initialData);
      this.highlight = false;
      this.replacedSave = true;
    }
  }

  removeSelected(searchedText) {
    this.highlight = false;
    if (searchedText) {
      var pattern = new RegExp("(" + this.searchGrayColor + searchedText + this.searchTextSecondHalf + ")", "gi");
      this.outputText = searchedText;
      var rootNames = this.editor.model.document.getRootNames();
      for (const rootName of rootNames) {
        this.removeHighlightedCommon(rootName, pattern, this.outputText);
        //for Bold
        pattern = new RegExp("(" + this.searchGrayColor + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf + ")", "gi");
        var removeHighlightBold = this.boldText + searchedText + this.boldTextEnd;
        this.removeHighlightedCommon(rootName, pattern, removeHighlightBold);
        //for italic
        pattern = new RegExp("(" + this.searchGrayColor + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf + ")", "gi");
        var removeHighlightitalic = this.italicText + searchedText + this.italicEnd;
        this.removeHighlightedCommon(rootName, pattern, removeHighlightitalic);
        //underline
        pattern = new RegExp("(" + this.searchGrayColor + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf + ")", "gi");
        var removeHighlightunderline = this.underlineText + searchedText + this.underlineTextEnd;
        this.removeHighlightedCommon(rootName, pattern, removeHighlightunderline);
      }
    }
  }

  private removeHighlightedCommon(rootName: any, pattern: RegExp, replaceWith) {
    var searchpara = this.editor.getData({ rootName });
    var new_text = searchpara.replace(pattern, replaceWith);
    var initialData = {};
    initialData[rootName] = new_text;
    this.editor.setData(initialData);
  }

  FootNotesEditing(event, id) {
    var editorInfo = new EditorInfo();
    editorInfo.footNoteId = id;
    var arialabel = event.currentTarget.getAttribute('aria-label');
    var rootname = arialabel.split(", ")
    editorInfo.rootName = rootname[1];
    if (this.footNoteEditorData.find(x => x.footNoteId == editorInfo.footNoteId) != null) {
      this.footNoteEditorData.find(x => x.footNoteId == editorInfo.footNoteId).rootName = editorInfo.rootName;
    }
    else {
      this.footNoteEditorData.push(editorInfo);
    }
  }
  resetFormatting() {
    this.pageColor = undefined;
    this.waterMarkOrientation = '';
    this.waterMarkprop = {
      FontName: "", FontSize: "", Text: "",
      Alignment: this.WaterMarkPropAlignment
    }
    this.headerShow = false;
    this.footerShow = false;
  }

  insertTableData(data) {
    const viewFragment = this.editor.data.processor.toView(data);
    const modelFragment = this.editor.data.toModel(viewFragment);
    this.editor.model.insertContent(modelFragment);
    var objRoot = new EditorInfo();
    objRoot.rootName = data.editorId;
    this.rootsTobeSaved.push(objRoot);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  getPageMargin(onInit: boolean) {
    if (onInit) {
      this.documentViewService.getPageColor(this.projectId, this.templateId).subscribe(response => {
        if (response.margin != null) {
          this.IsUpdatePageMargin = response.margin.id;
          this.pageMargin = response.margin.margin;
          this.designerService.currentMarginStyle = this.pageMargin.marginType;
        }
        else {
          this.IsUpdatePageMargin = '';
        }
      });
    }
    else {
      this.documentViewService.getPageColor(this.projectId, this.templateId).subscribe(response => {
        if (response.margin != null) {
          this.IsUpdatePageMargin = response.margin.id;
          this.savePageMargin(response.margin.id);
        }
        else {
          this.savePageMargin("");
          this.IsUpdatePageMargin = '';
        }
      });
    }
  }

  savePageMargin(marginId) {
    this.marginViewModel.Content = "";
    this.marginViewModel.IsTemplate = true;
    this.marginViewModel.ProjectId = this.designerServiceAdmin.dummyProjectDetails.projectId;
    //this.blockContentPayload.projectId;
    this.marginViewModel.TemplateOrDeliverableId = this.templateId;

    this.marginViewModel.Margin = this.marginprop;
    this.marginViewModel.ContentType = marginValues.margin;
    if (marginId == "") {
      this.marginViewModel.Id = null;
      this.documentViewService.savePageMargin(this.marginViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.designerService.currentMarginStyle = this.marginViewModel.Margin.MarginType;
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.MarginAddSuccess'));


          }
        });
    }
    else {
      this.marginViewModel.Id = marginId;
      this.documentViewService.updatePageMargin(this.marginViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.designerService.currentMarginStyle = this.marginViewModel.Margin.MarginType;
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.MarginUpdateSuccess'));

          }
        });
    }
  }

  getHeaderFooterText() {
    this.headerFootersuggestions = []; this.headerFootercommentThreads = [];

    this.documentViewService.getHeaderFooterText(this.projectId, this.templateId).subscribe(response => {
      if (response.footer != null) {
        this.IsUpdateFooter = response.footer.id;
        this.footerShow = true;
        this.footerText = response.footer.content;
        if (this.multiRootEditorService.isTrackChangesEnabled) {

          if (response.footer.footerTrackChanges != null)
            this.headerFootersuggestions = [].concat(this.headerFootersuggestions, JSON.parse(response.footer.footerTrackChanges));

          if (response.footer.footerCommentThreads != null)
            this.headerFootercommentThreads = [].concat(this.headerFootercommentThreads, JSON.parse(response.footer.footerCommentThreads));
        }
      }
      else {
        this.IsUpdateFooter = '';
        this.footerShow = false;
        this.footerText = '';
        if (this.onChange === true) {
          if (document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
        }
      }
      if (response.header != null) {
        this.IsUpdateHeader = response.header.id;
        this.headerShow = true;
        this.headerText = response.header.content;

        if (this.multiRootEditorService.isTrackChangesEnabled) {

          if (response.header.headerTrackChanges != null)
            this.headerFootersuggestions = [].concat(this.headerFootersuggestions, JSON.parse(response.header.headerTrackChanges));

          if (response.header.headerCommentThreads != null)
            this.headerFootercommentThreads = [].concat(this.headerFootercommentThreads, JSON.parse(response.header.headerCommentThreads));
        }
      }
      else {
        this.IsUpdateHeader = '';
        this.headerShow = false;
        this.headerText = '';
        if (this.onChange === true) {
          if (document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
        }
      }
    });
  }

  getQuestionsByBlockId() {
    this.libraryService.getAllQuestions(this.blockIds).subscribe(data => {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
    })
  }
  getPageColor(Oninit: boolean) {
    if (Oninit) {
      this.documentViewService.getPageColor(this.projectId, this.templateId).subscribe(response => {
        if (response.pageColor != null) {
          this.IsUpdatePageColor = response.pageColor.id;
          this.pageColor = response.pageColor.content;
        }
        else {
          this.IsUpdatePageColor = '';
        }
      });
    }
    else {
      this.documentViewService.getPageColor(this.projectId, this.templateId).subscribe(response => {
        if (response.pageColor != null) {

          this.IsUpdatePageColor = response.pageColor.id;
          this.savePageColor(response.pageColor.id);
        }
        else {
          this.savePageColor("");
          this.IsUpdatePageColor = '';
        }
      });
    }
  }
  getPageOrientation(Oninit: boolean) {
    if (Oninit) {
      this.documentViewService.getPageOrientation(this.projectId, this.templateId).subscribe(response => {
        if (response.orientation != null) {
          this.IsUpdatePageOrientation = response.orientation.id;
          this.pageOrientation = response.orientation.content;
        }
        else {
          this.IsUpdatePageOrientation = '';
        }
      });
    }
    else {
      this.documentViewService.getPageOrientation(this.projectId, this.templateId).subscribe(response => {
        if (response.orientation != null) {
          this.IsUpdatePageOrientation = response.orientation.id;
          this.savePageOrientation(response.orientation.id);
        }
        else {
          this.savePageOrientation("");
          this.IsUpdatePageOrientation = '';
        }
      });
    }
  }
  getPageLayoutSize(Oninit: boolean) {
    if (Oninit) {
      this.documentViewService.getPageLayoutSize(this.projectId, this.templateId).subscribe(response => {
        if (response.pageSize != null) {
          this.IsUpdatePageSize = response.pageSize.id;
          this.pageLayoutSize = response.pageSize.content;
        }
        else {
          this.IsUpdatePageSize = '';
        }
      });
    }
    else {
      this.documentViewService.getPageLayoutSize(this.projectId, this.templateId).subscribe(response => {
        if (response.pageSize != null) {
          this.IsUpdatePageSize = response.pageSize.id;
          this.savePageLayoutSize(response.pageSize.id);
        }
        else {
          this.savePageLayoutSize("");
          this.IsUpdatePageSize = '';
        }
      });
    }
  }
  
  getOrientation(alignment: Alignment): string {
    if (alignment.horizontalAlignment == HorizontalPosition.Center &&
      alignment.verticalAlignment == VerticalPosition.Center &&
      alignment.orientation == Rotation.ClockWise40) {
      return WatermarkSettings.Clockwise
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Center &&
      alignment.verticalAlignment == VerticalPosition.Center &&
      alignment.orientation == Rotation.AntiClockWise40) {
      return WatermarkSettings.AntiClockwise
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Right &&
      alignment.verticalAlignment == VerticalPosition.Top &&
      alignment.orientation == Rotation.RotationNone) {
      return WatermarkSettings.TopRight
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Left &&
      alignment.verticalAlignment == VerticalPosition.Top &&
      alignment.orientation == Rotation.RotationNone
    ) {
      return WatermarkSettings.TopLeft
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Left &&
      alignment.verticalAlignment == VerticalPosition.Bottom &&
      alignment.orientation == Rotation.RotationNone) {
      return WatermarkSettings.BottomLeft
    }
    else if (alignment.horizontalAlignment == HorizontalPosition.Right &&
      alignment.verticalAlignment == VerticalPosition.Bottom &&
      alignment.orientation == Rotation.RotationNone) {
      return WatermarkSettings.BottomRight
    }
    else {
      return WatermarkSettings.noRotation;
    }
  }

  getTableOfContent(Oninit: boolean) {
    if (Oninit) {
      this.documentViewService.getTableOfContent(this.projectId, this.templateId).subscribe(response => {
        if (response.tableOfContent != null) {
          this.IsUpdateTableOfContent = response.tableOfContent.id;
          this.tableOfContent = response.tableOfContent.content;
        }
        else {
          this.IsUpdateTableOfContent = '';
        }
      });
    }
    else {
      this.documentViewService.getTableOfContent(this.projectId, this.templateId).subscribe(response => {
        if (response.tableOfContent != null) {
          this.IsUpdateTableOfContent = response.tableOfContent.id;
          this.saveTableOfContent(response.tableOfContent.id);
        }
        else {
          this.saveTableOfContent('');
          this.IsUpdateTableOfContent = '';
        }
      });
    }
  }
  saveTableOfContent(id) {
    this.headerRequestViewModel.Content = this.tableOfContent;
    this.headerRequestViewModel.ContentType = "TableOfContent";
    this.headerRequestViewModel.ProjectId = this.projectId;
    this.headerRequestViewModel.TemplateOrDeliverableId = this.templateId;
    this.headerRequestViewModel.IsTemplate = true;

    if (id == "") {
      this.headerRequestViewModel.Id = null;
      this.documentViewService.saveTableOfContent(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        });
    }
    else {
      this.headerRequestViewModel.Id = id;
      this.documentViewService.updateTableOfContent(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        });
    }
  }

  removeTableOfContent() {
    this.documentViewService.getTableOfContent(this.projectId, this.templateId).subscribe(response => {
      if (response.tableOfContent != null) {
        this.documentViewService.removeTableOfContent(response.tableOfContent.id)
          .subscribe(response => {
            if (response.status === ResponseStatus.Sucess) {
              this.toastr.success(this.translate.instant('screens.home.labels.tableContentRemovedSuccessfully'));

            }
            else {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
          });
      }
      else {
        this.dialogService.Open(DialogTypes.Warning, "Table of content does not exsist.");
      }
    });

  }
  deleteWaterMark(Type) {
    this.documentViewService.getWaterMark(this.projectId, this.templateId).subscribe(response => {
      if (Type == ActionEnum.noWaterMark) {
        if (response.watermark != null) {
          this.IsUpdateHeader = response.watermark.id;
          this.deleteWatermarkByID(this.IsUpdateWaterMark, Type);
        }
        else {
          let waterMarkErrorMessage = "Error Occured while removing WaterMark"
          this.dialogService.Open(DialogTypes.Warning, waterMarkErrorMessage);
        }
      }
    });
  }
  deleteWatermarkByID(id, Type) {
    this.documentViewService.deleteWaterMark(id)
      .subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          if (Type == "WaterMark") {
            this.toastr.success(this.translate.instant('screens.home.labels.waterMarkRemovedSuccessfully'));

          }
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      });
  }

  getWaterMark(Oninit: boolean) {
    if (Oninit) {
      this.documentViewService.getWaterMark(this.projectId, this.templateId).subscribe(response => {
        if (response.watermark != null) {
          this.IsUpdateWaterMark = response.watermark.id;
          var watermarkprop = response.watermark.watermark;
          var fontName = watermarkprop.fontName;
          var fontSize = watermarkprop.fontSize;
          var text = watermarkprop.text;
          var alignment = watermarkprop.alignment;
          this.waterMarkprop = { FontName: fontName, FontSize: fontSize, Text: text, Alignment: alignment }
          this.waterMarkOrientation = this.getOrientation(this.waterMarkprop.Alignment);
        }
        else {
          this.IsUpdateWaterMark = '';
        }
      });
    }
    else {
      this.documentViewService.getWaterMark(this.projectId, this.templateId).subscribe(response => {
        if (response.watermark != null) {
          this.IsUpdateWaterMark = response.watermark.id;
          this.saveWaterMark(response.watermark.id);
        }
        else {
          this.saveWaterMark("");
          this.IsUpdateWaterMark = '';
        }
      });
    }
  }
  setWaterMarkStyle() {
    let Size = this.waterMarkprop.FontSize
    let Fontfamily = this.waterMarkprop.FontName;
    let styles = {
      'font-size': Size + 'px',
      'font-family': Fontfamily
    };

    return styles;
  }
  deleteHeaderFooter(Type) {
    this.documentViewService.getHeaderFooterText(this.projectId, this.templateId).subscribe(response => {
      if (Type == libraryActions.Header) {
        if (response.header != null) {
          this.IsUpdateHeader = response.header.id;
          this.deleteHeaderFooterByID(this.IsUpdateHeader, Type);
        }
        else {
          let headerErrorMessage = this.translate.instant('screens.project-designer.document-view.header-error-message');
          this.dialogService.Open(DialogTypes.Warning, headerErrorMessage);
        }
      }
      if (Type == libraryActions.Footer) {
        if (response.footer != null) {
          this.IsUpdateFooter = response.footer.id;
          this.deleteHeaderFooterByID(this.IsUpdateFooter, Type);
        }
        else {
          let footerErrorMessage = this.translate.instant('screens.project-designer.document-view.footer-error-message');
          this.dialogService.Open(DialogTypes.Warning, footerErrorMessage);
        }
      }
    });
  }
  deleteHeaderFooterByID(id, Type) {
    this.documentViewService.deleteHeaderFooterText(id)
      .subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          if (Type == libraryActions.Header) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.remove-header-success-message'));

          }
          else if (Type == libraryActions.Footer) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.remove-footer-success-message'));

          }
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      });
  }
  savePageColor(id) {
    this.headerRequestViewModel.Content = this.pageColor;
    this.headerRequestViewModel.ContentType = libraryActions.PageColor;
    this.headerRequestViewModel.ProjectId = this.projectId;
    this.headerRequestViewModel.TemplateOrDeliverableId = this.templateId;
    this.headerRequestViewModel.IsTemplate = true;
    if (id == "") {
      this.headerRequestViewModel.Id = null;
      this.documentViewService.savePageColor(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        });
    }
    else {
      this.headerRequestViewModel.Id = id;
      this.documentViewService.updatePageColor(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        });
    }
  }
  savePageOrientation(id) {
    this.headerRequestViewModel.Content = this.pageOrientation;
    this.headerRequestViewModel.ContentType = libraryActions.Orientation;
    this.headerRequestViewModel.ProjectId = this.projectId;
    this.headerRequestViewModel.TemplateOrDeliverableId = this.templateId;
    this.headerRequestViewModel.IsTemplate = true;

    if (id == "") {
      this.headerRequestViewModel.Id = null;
      this.documentViewService.savePageOrientation(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.pageOrientation-success-message'));

          }
        });
    }
    else {
      this.headerRequestViewModel.Id = id;
      this.documentViewService.updatePageOrientation(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.pageOrientation-success-message'));

          }
        });
    }
  }
  savePageLayoutSize(id) {
    this.headerRequestViewModel.Content = this.pageLayoutSize;
    this.headerRequestViewModel.ContentType = libraryActions.PageSize;
    this.headerRequestViewModel.ProjectId = this.projectId;
    this.headerRequestViewModel.TemplateOrDeliverableId = this.templateId;
    this.headerRequestViewModel.IsTemplate = true;

    if (id == "") {
      this.headerRequestViewModel.Id = null;
      this.documentViewService.savePageLayoutSize(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.pageSize-success-message'));

          }
        });
    }
    else {
      this.headerRequestViewModel.Id = id;
      this.documentViewService.updatePageLayoutSize(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.pageSize-updated-success-message'));

          }
        });
    }
  }
  saveWaterMark(Id) {
    this.waterMarkPropTemp = Object.assign({}, this.waterMarkprop);
    this.waterMarkViewModel.Content = "";
    this.waterMarkViewModel.ProjectId = this.projectId;
    this.waterMarkViewModel.TemplateOrDeliverableId = this.templateId;
    this.waterMarkViewModel.IsTemplate = true;

    if (this.waterMarkOrientation == "Clockwise") {
      this.waterMarkPropTemp.Alignment.horizontalAlignment = HorizontalPosition.Center;
      this.waterMarkPropTemp.Alignment.verticalAlignment = VerticalPosition.Center;
      this.waterMarkPropTemp.Alignment.orientation = Rotation.ClockWise40;
    }
    else if (this.waterMarkOrientation == "AntiClockwise") {
      this.waterMarkPropTemp.Alignment.horizontalAlignment = HorizontalPosition.Center;
      this.waterMarkPropTemp.Alignment.verticalAlignment = VerticalPosition.Center;
      this.waterMarkPropTemp.Alignment.orientation = Rotation.AntiClockWise40;
    }
    else if (this.waterMarkOrientation == "TopRight") {

      this.waterMarkPropTemp.Alignment.horizontalAlignment = HorizontalPosition.Right;
      this.waterMarkPropTemp.Alignment.verticalAlignment = VerticalPosition.Top;
      this.waterMarkPropTemp.Alignment.orientation = Rotation.RotationNone;
    }
    else if (this.waterMarkOrientation == "TopLeft") {
      this.waterMarkPropTemp.Alignment.horizontalAlignment = HorizontalPosition.Left;
      this.waterMarkPropTemp.Alignment.verticalAlignment = VerticalPosition.Top;
      this.waterMarkPropTemp.Alignment.orientation = Rotation.RotationNone;
    }
    else if (this.waterMarkOrientation == "BottomLeft") {
      this.waterMarkPropTemp.Alignment.horizontalAlignment = HorizontalPosition.Left;
      this.waterMarkPropTemp.Alignment.verticalAlignment = VerticalPosition.Bottom;
      this.waterMarkPropTemp.Alignment.orientation = Rotation.RotationNone;
    }
    else if (this.waterMarkOrientation == "BottomRight") {
      this.waterMarkPropTemp.Alignment.horizontalAlignment = HorizontalPosition.Right;
      this.waterMarkPropTemp.Alignment.verticalAlignment = VerticalPosition.Bottom;
      this.waterMarkPropTemp.Alignment.orientation = Rotation.RotationNone;
    }
    else {
      this.waterMarkPropTemp.Alignment.horizontalAlignment = HorizontalPosition.Center;
      this.waterMarkPropTemp.Alignment.verticalAlignment = VerticalPosition.Center;
      this.waterMarkPropTemp.Alignment.orientation = Rotation.RotationNone;
    }

    this.waterMarkViewModel.waterMark = this.waterMarkPropTemp;
    this.waterMarkViewModel.ContentType = libraryActions.Watermark;
    if (Id == "") {
      this.headerRequestViewModel.Id = null;
      this.documentViewService.saveWaterMark(this.waterMarkViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.watermark-success-message'));

          }
        });
    }
    else {
      this.waterMarkViewModel.Id = Id;
      this.documentViewService.updateWaterMark(this.waterMarkViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.watermark-updated-success-message'));

          }
        });
    }
  }

  BlockEditing(event, index, blockId) {
    this.blockId = blockId;
    var blockTitle = document.getElementById("titleDiv" + index);
    var editorInfo = new EditorInfo();
    editorInfo.Index = blockId;
    var arialabel = event.currentTarget.getAttribute('aria-label');
    var rootname = arialabel.split(", ")
    if (rootname.length > 1) {
      editorInfo.rootName = rootname[1];
      if (editorInfo.rootName.includes("header_title")) {
        if (this.blockTitleEditorData.find(x => x.Index == editorInfo.Index) != null) {
          this.blockTitleEditorData.find(x => x.Index == editorInfo.Index).rootName = editorInfo.rootName;
        }
        else {
          this.blockTitleEditorData.push(editorInfo);
        }
      }
    }
    document.getElementsByClassName("editor-heading")[index].classList.add("myClass");
    if (this.designerServiceAdmin.selectedAdminDocTab == SubMenus.Insert) {
      let payload: any = {};
      payload.blockId = blockId;
      if (this.blockContentList.filter(item => item.blockId == payload.blockId && item.isPageBreak == true).length > 0)
        payload.isPageBreakApplied = true;
      else
        payload.isPageBreakApplied = false;
      this._eventService.getEvent(eventConstantsEnum.adminModule.insert.highlight_Pageborder).publish(payload);
    }
  }
  onBlurMethod(index) {
    document.getElementsByClassName("editor-heading")[index].classList.remove("myClass");
    // document.getElementsByClassName("")[index].classList.add("editor-heading");
  }
  CompareData(rootNames) {
    let footNotesTobeDeleted = [];

    this.footNoteEditorData.forEach((e, index) => {
      let fnNode = this.footNotesBlock.find(x => x.id == e.footNoteId);
      if (rootNames.filter(id => id == e.rootName).length > 0 && fnNode != undefined) {
        var editorData = this.editor.getData({ rootName: e.rootName });
        editorData = editorData.replace(new RegExp(EditorNamesPrefix.footNoteToBeReplace, 'g'), EditorNamesPrefix.replaceWith);
        if (fnNode.text == editorData) {
          footNotesTobeDeleted.push(e);
        }
      }
    });
    footNotesTobeDeleted.forEach(x => {
      let indexTobeRemoved = this.footNoteEditorData.findIndex(e => e.footNoteId == x.footNoteId);
      this.footNoteEditorData.splice(indexTobeRemoved, 1);
    })
    let rootsTobeRemoved = [];
    this.blockTitleEditorData.forEach((e, index) => {
      let titleNode = this.rawView.find(x => x.blockId == e.Index.toString());
      if (rootNames.filter(id => id == e.rootName).length > 0 && titleNode != undefined && e.rootName.includes("header_title")) {
        var editorData = this.editor.getData({ rootName: e.rootName });
        if (titleNode.documentTitle == editorData) {
          rootsTobeRemoved.push(e);
        }
      }
    });
    rootsTobeRemoved.forEach(x => {
      let indexTobeRemoved = this.blockTitleEditorData.findIndex(e => e.Index == x.Index);
      this.blockTitleEditorData.splice(indexTobeRemoved, 1);
    })
  }
  saveData(autoSave) {
    if (!this.editor) return false;
    let rootNames = this.editor.model.document.getRootNames();

    this.CompareData(rootNames);
    var footNotesTobeDeleted = [];

    //capture rootid when any modification done on trackchanges and comments -- starts
    let suggestionsData: any = [];
    let commentThreadsData: any = [];
    if (this.multiRootEditorService.isTrackChangesEnabled) {
      const trackChanges = this.editor.plugins.get('TrackChanges');
      const comments = this.editor.plugins.get('Comments');
      suggestionsData = Array.from(trackChanges.getSuggestions());
      commentThreadsData = Array.from(comments.getCommentThreads());
      let modifiedData: any = this.footNoteEditorData;
      this.customHTML.addEditorIdOnCommentTrackChangesModification(modifiedData, this.suggestions, this.commentThreads, suggestionsData, commentThreadsData);
      let footNoteEditor = modifiedData.filter(item => item.rootName.indexOf('footNote') != -1);
      this.footNoteEditorData = footNoteEditor.length > 0 ? footNoteEditor : [];
    }
    //capture rootid when any modification done on trackchanges and comments -- ends

    var els = this.elRef.nativeElement.querySelectorAll('sup.footNtCss');
    this.footNotesBlock.forEach(x => {
      var footNoteRequest = new FootNoteRequestiewModel();
      footNoteRequest.footNotes = new BlockFootNote();
      var exists = false;
      els.forEach(sup => {
        if (sup.id == x.id && sup.innerText != '' && sup.textContent == x.symbol)
          exists = true;
      });
      if (!exists) {
        footNoteRequest.blockId = x.blockId;
        footNoteRequest.footNotes.id = x.id;
        footNoteRequest.footNotes.text = x.text;
        footNoteRequest.footNotes.index = x.index;
        footNoteRequest.footNotes.symbol = x.symbol;
        footNotesTobeDeleted.push(footNoteRequest);
      }
    })
    let editableContent = [];
    let editableFootNotes = [];
    this.editableBlockTitle = [];

    if (this.blockTitleEditorData.length > 0) {
      this.saveBlockTitle(this.blockTitleEditorData, suggestionsData, commentThreadsData, rootNames);
    }
    for (const rootName of rootNames) {
      if (rootName.includes('header-')) {
        const request = new BlockAttributeRequest();
        let content = this.editor.getData({ rootName: rootName });
        //to add space to footnote symbol
        let modifiedData = this.addSpaceToFootNote(content);
          const initialData = {};
          initialData[rootName] = modifiedData;
          this.editor.setData(initialData);
          content = this.editor.getData({ rootName: rootName });
          content = content.replace(new RegExp(EditorNamesPrefix.footNoteToBeReplace, 'g'), EditorNamesPrefix.replaceWith);

        var array = rootName.split("-");
        request.blockId = array[1];
        request.content = content == null && content != '' ? null : this.customHTML.multiRootEditorSetResizedWidth(rootName, content);
        request.contentFormatApplied = true;

        if (this.multiRootEditorService.isTrackChangesEnabled) {
          //region for saving track changes -- starts
          let trackChangesCommentsObj = this.multiRootEditorService.getTrackChangesAndComments(request.content, suggestionsData, commentThreadsData, this.suggestions, this.commentThreads, this.loggedInUser.name, request.blockId);
          if (trackChangesCommentsObj) {
            request.trackChangesSuggestions = trackChangesCommentsObj.trackChanges;
            request.commentThreads = trackChangesCommentsObj.comments;
            this.suggestions = this.multiRootEditorService.compareSuggestions(this.suggestions, trackChangesCommentsObj.trackChanges, request.blockId);
            this.commentThreads = this.multiRootEditorService.compareCommentThreads(this.commentThreads, trackChangesCommentsObj.comments, request.blockId);
          }
          //region for saving comments --ends
        }
        else {
          request.commentThreads = null;
          request.trackChangesSuggestions = null;
        }

        this.flatView.forEach(x => {
          if (x.blockId == request.blockId) {
            request.isPageBreak = x.isPageBreak;
          }
        });
        editableContent.push(request);

        //update raw view -- starts
        let selectedItem = this.rawView.filter(item => item.blockId == request.blockId)[0];
        if (selectedItem)
          this.documentMapper.documentMapper(selectedItem, request);
        //update raw view -- ends
      }
    }

    //update block document title
    if (this.editableBlockTitle.length > 0) {
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.documentViewService.updateBlockDocumentTitle(this.editableBlockTitle).subscribe((data: any) => {
        this.editableBlockTitle = [];
        this.blockTitleEditorData = [];
        this.blockId = null;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }, error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
    }
    //update footnote
    this.footNoteEditorData.forEach(editordata => {
      if (editordata.rootName.indexOf(EditorNamesPrefix.footNote) > -1) {
        var footNoteRequest = new FootNoteRequestiewModel();
        footNoteRequest.footNotes = new BlockFootNote();
        if (editordata.rootName.split(EditorNamesPrefix.footNote).length > 0) {
          footNoteRequest.footNotes.id = editordata.rootName.split(EditorNamesPrefix.footNote)[1];
          var footNoteBlock = this.footNotesBlock.find(y => y.id == footNoteRequest.footNotes.id);
          if (footNoteBlock != undefined && rootNames.filter(id => id == editordata.rootName).length > 0) {
            footNoteRequest.blockId = footNoteBlock.blockId;
            footNoteRequest.footNotes.index = footNoteBlock.index;
            footNoteRequest.footNotes.symbol = footNoteBlock.symbol;
            footNoteRequest.footNotes.text = this.editor.getData({ rootName: editordata.rootName });
            if (this.multiRootEditorService.isTrackChangesEnabled) {
              //region for saving track changes -- starts
              let trackChangesCommentsObj = this.multiRootEditorService.getTrackChangesAndComments(footNoteRequest.footNotes.text, suggestionsData, commentThreadsData, this.suggestions, this.commentThreads, this.loggedInUser.name, footNoteRequest.footNotes.id);
              if (trackChangesCommentsObj) {
                if (trackChangesCommentsObj.trackChanges && trackChangesCommentsObj.trackChanges != null) footNoteRequest.footNotes.footNotesTrackChanges = trackChangesCommentsObj.trackChanges;
                if (trackChangesCommentsObj.comments && trackChangesCommentsObj.comments != null) footNoteRequest.footNotes.footNotesCommentThreads = trackChangesCommentsObj.comments;
                this.suggestions = this.multiRootEditorService.compareSuggestions(this.suggestions, trackChangesCommentsObj.trackChanges, footNoteRequest.footNotes.id);
                this.commentThreads = this.multiRootEditorService.compareCommentThreads(this.commentThreads, trackChangesCommentsObj.comments, footNoteRequest.footNotes.id);
              }
            }
            else {
              footNoteRequest.footNotes.footNotesTrackChanges = null;
              footNoteRequest.footNotes.footNotesCommentThreads = null;
            }
            editableFootNotes.push(footNoteRequest);
          }
        }
      }
    });
    if (editableFootNotes.length > 0) {
      this.documentViewService.updateFootNote(editableFootNotes).subscribe(response => {
        if (response.status != ResponseStatus.Sucess) {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      })
    }
    this.documentViewService.updateAllBlockData_Admin(editableContent)
      .subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          if (this.addFootNote) {
            this.reloadEditorDocView();
            this.addFootNote = false;
          }
          //delete footnote
          if (footNotesTobeDeleted.length > 0) {
            this.documentViewService.deleteFootNote(footNotesTobeDeleted).subscribe(response => {
              if (response.status == ResponseStatus.Sucess) {
                this.reloadEditorDocView();
                var els = this.elRef.nativeElement.querySelectorAll('sup.footNtCss');
                els.forEach(sup => {
                  var ele = document.getElementById(sup.id) as HTMLElement;
                  if (ele != undefined && ele.textContent == '') {
                    var parentDiv = ele.parentElement;
                    parentDiv.removeChild(ele);
                  }
                });
              }
              else
                this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            })
          }
          if (!autoSave) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.block-update-success-message'));
          }
          this.flatView.forEach(x => {
            if (x.blockId == this.blockId) {
              x.isPageBreak = this.isPageBreak;
            }
          });
          if (this.isPageBreak)
            this.isPageBreak = false;
          this.blockId = null;
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      });
    //Save header and footer for Template -
    if (this.designerService.manageLibraryDetails.name == LibraryEnum.globaloecd || this.designerService.manageLibraryDetails.name == LibraryEnum.countrytemplate) {
      this.documentViewService.getHeaderFooterText(this.projectId, this.templateId).subscribe(response => {
        if (response.header != null) {
          this.IsUpdateHeader = response.header.id;
          this.saveHeader(this.IsUpdateHeader);
        }
        else {
          if (document.querySelector('#headerEditor') != undefined) {
            this.saveHeader('');
          }
        }
        if (response.footer != null) {
          this.IsUpdateFooter = response.footer.id;
          this.saveFooter(this.IsUpdateFooter)
        }
        else {
          if (document.querySelector('#footerEditor') != undefined) {
            this.saveFooter('');
          }
        }
      });
    }
  }
  addSpaceToFootNote(editorData) {
    var regex = /<\/sup>/gi, result, indices = [];
    while ((result = regex.exec(editorData))) {
      indices.push(result.index);
    }
    let replacementLength = 0;
    indices.forEach(index => {
      let subString = editorData.substring(index + Index.six + replacementLength, index + Index.six + Index.one);
      if (subString != " ") {
        subString = editorData.substring(index + Index.six + replacementLength, index + Index.six + Index.four);
        if (subString == "</p>") {
          editorData = this.replaceAt(editorData, index, EditorNamesPrefix.replaceWithJustSpace);
          replacementLength = replacementLength + EditorNamesPrefix.lengthOfSpaceSpan;
        }
        else {
          editorData = this.replaceAt(editorData, index, " ");
          replacementLength = replacementLength + 1;
        }
      }
    })
    return editorData;
  }
  replaceAt(editorData, index, replacement) {
    return editorData.substr(0, index + Index.six) + replacement + editorData.substr(index + Index.six);
  }
  reloadEditorDocView() {
    if (document.querySelector('#toolbar-menu') != undefined) {
      document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
    }
    if (this.editor != undefined)
      this.editor.destroy();
    this.editor = undefined;
    this.ngAfterViewInit();
  }
  saveHeader(id) {
    //Save Header.
    let headerNames = this.editor.model.document.getRootNames();
    const request1 = new BlockAttributeRequest();
    for (const rootName of headerNames) {
      if (rootName == libraryActions.headerSection) {
        request1.content = this.editor.getData({ rootName });
      }
    }
    if (request1.content != undefined && request1.content != '') {
      this.headerRequestViewModel.Content = request1.content;
      this.headerRequestViewModel.ContentType = libraryActions.Header;
      this.headerRequestViewModel.ProjectId = this.projectId;
      this.headerRequestViewModel.TemplateOrDeliverableId = this.templateId;
      this.headerRequestViewModel.IsTemplate = true;

      if (id == '') {
        let headerObject = JSON.parse(JSON.stringify(this.headerRequestViewModel));
        headerObject.Id = null;
        this.documentViewService.saveHeaderText(headerObject)
          .subscribe(response => {
            if (response.status === ResponseStatus.Sucess) {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
          });
      }
      else {
        this.headerRequestViewModel.Id = id;

        if (this.multiRootEditorService.isTrackChangesEnabled) {
          const trackChanges = this.editor.plugins.get('TrackChanges');
          let suggestionsData = Array.from(trackChanges.getSuggestions());

          const comments = this.editor.plugins.get('Comments');
          let commentThreadsData = Array.from(comments.getCommentThreads());

          //region for saving track changes -- starts
          let trackChangesCommentsObj = this.multiRootEditorService.getTrackChangesAndComments(this.headerRequestViewModel.Content, suggestionsData, commentThreadsData, this.suggestions, this.commentThreads, this.loggedInUser.name, this.headerRequestViewModel.Id);
          if (trackChangesCommentsObj) {
            this.headerRequestViewModel.HeaderTrackChanges = trackChangesCommentsObj.trackChanges;
            this.headerRequestViewModel.HeaderCommentThreads = trackChangesCommentsObj.comments;
            this.suggestions = this.multiRootEditorService.compareSuggestions(this.suggestions, trackChangesCommentsObj.trackChanges, this.headerRequestViewModel.Id);
            this.commentThreads = this.multiRootEditorService.compareCommentThreads(this.commentThreads, trackChangesCommentsObj.comments, this.headerRequestViewModel.Id);
          }
          //region for saving comments --ends
        }
        else {
          this.headerRequestViewModel.HeaderTrackChanges = null;
          this.headerRequestViewModel.HeaderCommentThreads = null;
        }

        this.documentViewService.updateHeaderText(this.headerRequestViewModel)
          .subscribe(response => {
            if (response.status != ResponseStatus.Sucess) {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
          });
      }
    }
  }

  saveFooter(id) {
    //Save Footer.
    let footerNames = this.editor.model.document.getRootNames();
    const request2 = new BlockAttributeRequest();
    for (const rootName of footerNames) {
      if (rootName == libraryActions.footerSection) {
        request2.content = this.editor.getData({ rootName });
      }
    }
    if (request2.content != undefined && request2.content != '') {
      this.footerRequestViewModel.Content = request2.content;
      this.footerRequestViewModel.ContentType = libraryActions.Footer;
      this.footerRequestViewModel.ProjectId = this.projectId;
      this.footerRequestViewModel.TemplateOrDeliverableId = this.templateId;
      this.footerRequestViewModel.IsTemplate = true;

      if (id == '') {
        let footerObject = JSON.parse(JSON.stringify(this.footerRequestViewModel));
        footerObject.Id = null;
        this.documentViewService.saveFooterText(footerObject)
          .subscribe(response => {
            if (response.status != ResponseStatus.Sucess) {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
          });
      }
      else {
        this.footerRequestViewModel.Id = id;

        if (this.multiRootEditorService.isTrackChangesEnabled) {
          const trackChanges = this.editor.plugins.get('TrackChanges');
          let suggestionsData = Array.from(trackChanges.getSuggestions());

          const comments = this.editor.plugins.get('Comments');
          let commentThreadsData = Array.from(comments.getCommentThreads());

          //region for saving track changes -- starts
          let trackChangesCommentsObj = this.multiRootEditorService.getTrackChangesAndComments(this.footerRequestViewModel.Content, suggestionsData, commentThreadsData, this.suggestions, this.commentThreads, this.loggedInUser.name, this.footerRequestViewModel.Id);
          if (trackChangesCommentsObj) {
            this.footerRequestViewModel.FooterTrackChanges = trackChangesCommentsObj.trackChanges;
            this.footerRequestViewModel.FooterCommentThreads = trackChangesCommentsObj.comments;
            this.suggestions = this.multiRootEditorService.compareSuggestions(this.suggestions, trackChangesCommentsObj.trackChanges, this.footerRequestViewModel.Id);
            this.commentThreads = this.multiRootEditorService.compareCommentThreads(this.commentThreads, trackChangesCommentsObj.comments, this.footerRequestViewModel.Id);
          }
          //region for saving comments --ends
        }
        else {
          this.footerRequestViewModel.FooterTrackChanges = null;
          this.footerRequestViewModel.FooterCommentThreads = null;
        }

        this.documentViewService.updateFooterText(this.footerRequestViewModel)
          .subscribe(response => {
            if (response.status != ResponseStatus.Sucess) {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
          });
      }
    }
  }

  onScrollUp(event) {
    this.direction = 'up';
    let blockIds = [];
    if (this.currentBlock) {
      //Find relative blockIds
      let chosenIndex = this.flatView.findIndex(x => x.blockId === this.currentBlock);

      let lastLoadedIndex = this.flatView.findIndex(x => x.isLoaded === true);

      for (let i = chosenIndex; i > lastLoadedIndex; i--) {
        //Fetch records which are not loaded
        if (this.flatView[i] && !this.flatView[i].isLoaded) {
          blockIds.push(this.flatView[i].blockId);
        }
      }
      blockIds = blockIds.slice(0, this.blockBatchSize);

      this.getContentOnScroll(FullViewDefault.template, blockIds);
    }
  }


  onScrollDown(event) {
    this.getContentOnScroll().then().catch(err => console.error(err));
  }
  libraryDetailsRequestModel(libSection: number) {
    let globelRequest = new LibraryDetailsRequestModel()
    globelRequest.librarySections = libSection;
    globelRequest.PageIndex = this.pageIndex;
    globelRequest.PageSize = this.pageSize;
    globelRequest.IsAdmin = true;
    return globelRequest;
  }

  async getBlockContents(source: string = FullViewDefault.template) {
    let result: any;
    switch (source.toLowerCase()) {
      case FullViewDefault.template:
        this.showLoader = true;
        result =
          await this.templateService.documentViewContent(this.blockContentPayload.projectId,
            this.blockContentPayload.templateId, this.pageIndex, this.pageSize);
        break;
      case FullViewDefault.deliverable:
        this.showLoader = true;
        result =
          await this.deliverableService.documentViewContent(this.designerService.deliverableDetails.entityId);
        break;
      case LibraryEnum.global:
        let globallibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.global);
        result = await this.libraryService.getLibraryContents(globallibRequest);
        break;
      case LibraryEnum.country:
        let countrylibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.country);
        result = await this.libraryService.getLibraryContents(countrylibRequest);
        break;
      case LibraryEnum.organization:
        let organizationlibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.organization);
        organizationlibRequest.organizationId = this.blockContentPayload.organizationId;
        result = await this.libraryService.getLibraryContents(organizationlibRequest);
        break;
      case LibraryEnum.user:
        let userlibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.user);
        result = await this.libraryService.getLibraryContents(userlibRequest);
        break;
      case LibraryEnum.blocks:
        let cbclibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.blocks);
        cbclibRequest.organizationId = this.blockContentPayload.organizationId;
        result = await this.libraryService.getLibraryContents(cbclibRequest);
        break;
      case LibraryEnum.globaloecd:
        let globalOECDlibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.globaloecd);
        result = await this.libraryService.getLibraryContents(globalOECDlibRequest);
        break;
      case LibraryEnum.countrytemplate:
        let countryTemplatelibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.countrytemplate);
        result = await this.libraryService.getLibraryContents(countryTemplatelibRequest);
        break;
      default:
        break;
    }
    this.blockContentList = result['flatView'];
    this.blockIds = result['blockIds'];
    this.flatView = [];
    this.suggestions = []; this.commentThreads = [];

    this.blockIds.forEach((blockId, index) => {
      let currentBlock = this.blockContentList.find(i => i.blockId === blockId);
      if (this.selectedStyle && this.selectedStyle != null && !currentBlock.contentFormatApplied)
        currentBlock.content = this.formatStyling.translateHTML(currentBlock.content, this.selectedStyle, StyleOn.Body);

      if (this.selectedStyle && this.selectedStyle != null && !currentBlock.titleFormatApplied) {
        currentBlock.documentTitle = this.formatStyling.translateHTML(currentBlock.documentTitle, this.selectedStyle, StyleOn["Heading1"]);
      }

      let content =
      {
        'title': currentBlock.title && currentBlock.title != null ? currentBlock.title : '',
        'blockId': blockId,
        'indentation': currentBlock ? currentBlock.indentation : '',
        'isStack': currentBlock ? currentBlock.isStack : '',
        'content': currentBlock ? (currentBlock.content == "<p>null</p>" || currentBlock.content == null) ? '' : currentBlock.content : '',//Todo : Change has to be implemented in API.
        //element.text = (element.text == '<p>null</p>' || element.text == null) ? '' : element.text;
        'isLoaded': (currentBlock && currentBlock.content) ? true : false,
        'footNotes': currentBlock ? currentBlock.footNotes : [],
        'documentTitle': currentBlock.documentTitle ? currentBlock.documentTitle : '',
        'isPageBreak': currentBlock && currentBlock.isPageBreak,
        'trackChangesSuggestions': currentBlock.trackChangesSuggestions,
        'commentThreads': currentBlock.commentThreads,
        'titleFormatApplied': currentBlock.titleFormatApplied,
        'contentFormatApplied': currentBlock.contentFormatApplied
      };

      if (this.multiRootEditorService.isTrackChangesEnabled) {
        let editorFormatOptions = this.multiRootEditorService.setTrackChangesAndComments(currentBlock, this.suggestions, this.commentThreads, this.users);
        this.suggestions = editorFormatOptions.suggestions;
        this.commentThreads = editorFormatOptions.commentThreads;
        this.users = editorFormatOptions.users;
      }

      if (content.content != null)
        content.content = content.content.replace(new RegExp(EditorNamesPrefix.footNoteToBeReplace, 'g'), EditorNamesPrefix.replaceWith);
      this.flatView.push(content);
      if (content.footNotes) {
        content.footNotes.forEach(element => {
          this.footNotesIndex.push(element.index);
          let footNoteBlock = new BlockFootNote();
          footNoteBlock.blockId = content.blockId;
          footNoteBlock.id = element.id;
          element.text = (element.text == '<p>null</p>' || element.text == null) ? '' : element.text;
          footNoteBlock.text = element.text;
          footNoteBlock.index = element.index;
          footNoteBlock.symbol = element.symbol;
          this.footNotesBlock.push(footNoteBlock);
        });
        this.footNotesIndex = this.footNotesIndex.sort((a, b) => {
          return a - b;
        });
      }
    });
    this.showLoader = false;
    this.rawView = JSON.parse(JSON.stringify(this.flatView));
    this.changeDetectorRef.detectChanges();
  }
  async getContentOnScroll(source: string = FullViewDefault.template, blockIds = []) {
    let result: any;
    let slicedArray = [];

    switch (source.toLowerCase()) {
      case FullViewDefault.template:
        this.showLoader = true;
        let lastIndexOfDataLoaded = this.flatView.findIndex(x => x['isLoaded'] === false);
        if (blockIds.length === 0) {
          this.flatView.forEach((element, index) => {
            if (index >= lastIndexOfDataLoaded && !element.isLoaded) {
              blockIds.push(element.blockId);
            }
          });
          //Slice based on the batch Size
          slicedArray = blockIds.slice(0, this.blockBatchSize);
        }
        else {
          //Assign the incoming blockIds
          slicedArray = blockIds;
        }

        result =
          await this.templateService.documentViewContentByBlockIds(this.blockContentPayload.templateId, slicedArray);
        this.showLoader = false;

        break;
      default:
        break;
    }
    let newblockContentList: [] = result['flatView'];

    //Perform operation only if API returned Data
    if (newblockContentList && newblockContentList.length > 0) {
      newblockContentList.forEach(element => {
        let currentBlock = this.flatView.find(x => x.blockId == element['blockId']);
        if (currentBlock) {
          let idx = this.flatView.indexOf(currentBlock);
          //Element exists, so update the content
          if (idx >= 0) {
            let rootNames = this.editor.model.document.getRootNames();
            for (const rootName of rootNames) {
              var array = rootName.split("-");
              if (array[1] == currentBlock.blockId) {
                const initialData = {};
                initialData[rootName] = element['content'];
                this.editor.setData(initialData);
              }
            }
            this.flatView[idx].content = element['content'];
            this.flatView[idx].indentation = element['indentation'];
            this.flatView[idx].title = element['title'];
            this.flatView[idx].isLoaded = true;
            let clickedBlock = document.getElementById('editor' + idx);
            if (element) {
              let topPos = clickedBlock.offsetTop;
              document.getElementById('parentDiv').scrollTop = topPos;
              event.preventDefault();
            }
          }
        }
      });
    }


  }


  scrollToBlockContent() {
    if (this.designerService.blockDetails != undefined) {
      this.currentBlock = this.designerService.blockDetails.blockId;

      let index = this.blockIds.findIndex(x => x === this.currentBlock);

      let element = document.getElementById('editor' + index);
      if (element) {
        let topPos = element.offsetTop;
        document.getElementById('parentDiv').scrollTop = topPos;
        element.focus();
      }
    }
  }

  //TODO: method to be utilized during virtual scroll
  scrollToBlockContent1() {
    if (this.designerService.blockDetails != undefined) {
      this.currentBlock = this.designerService.blockDetails.blockId;
      //Check in flatView, if isLoaded is true, do nothing.

      let chosenBlockDetails = this.flatView.find(x => x.blockId === this.currentBlock);
      if (chosenBlockDetails && !chosenBlockDetails.isLoaded) {
        let idArray = [];
        idArray.push(this.currentBlock);
        //Get the block content and then navigate to the block
        this.blockService.getBlockDetail(this.currentBlock).subscribe(blockDetail => {
          if (blockDetail) {
            let currBlock = this.flatView.find(x => x.blockId === this.currentBlock);
            currBlock.content = blockDetail.content;
            currBlock.title = blockDetail.title;


            //TODO: uncomment when scrolling feature needs to be enabled
            //this.getContentOnScroll().then().catch(err => console.error(err));

            //Comment when pagination is enabled

          }
        });

      }
      else {
        let index = this.blockIds.findIndex(x => x === this.currentBlock);

        let element = document.getElementById('editor' + index);
        if (element) {
          let topPos = element.offsetTop;
          document.getElementById('parentDiv').scrollTop = topPos;
        }
      }
    }
  }

  ngOnDestroy() {
    this.saveData(true);
    this.subscriptions.unsubscribe();
    this.designerService.ckeditortoolbar = null;
  }

  saveBlockTitle(editorData, suggestionsData, commentThreadsData, rootNames) {
    const blockTitleModel = new BlockTitleViewModel();
    editorData.forEach(rootName => {
      if (rootNames.filter(id => id == rootName.rootName).length > 0) {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        this.presentBlock = this.blockContentList.filter(b => b.blockId == rootName.Index)[0];
        let editedData = blockTitleModel.documentTitle = this.editor.getData({ rootName: rootName.rootName });
        var divCell = document.createElement("div");
        divCell.innerHTML = editedData;
        var editedText = divCell.innerText;
        blockTitleModel.title = editedData.indexOf('suggestion') == -1 ? editedText : this.presentBlock.title;;
        blockTitleModel.description = this.presentBlock.description;

        blockTitleModel.titleFormatApplied = true;
        blockTitleModel.id = rootName.Index;
        blockTitleModel.isAdmin = true;

        if (this.multiRootEditorService.isTrackChangesEnabled) {
          //region for saving track changes -- starts
          let trackChangesCommentsObj = this.multiRootEditorService.getTrackChangesAndComments(blockTitleModel.documentTitle, suggestionsData, commentThreadsData, this.suggestions, this.commentThreads, this.loggedInUser.name, blockTitleModel.id);
          if (trackChangesCommentsObj) {
            blockTitleModel.titleTrackChanges = trackChangesCommentsObj.trackChanges;
            blockTitleModel.titleCommentThreads = trackChangesCommentsObj.comments;
            //updating the main list when there is an change -- starts
            this.suggestions = this.multiRootEditorService.compareSuggestions(this.suggestions, trackChangesCommentsObj.trackChanges, blockTitleModel.id);
            this.commentThreads = this.multiRootEditorService.compareCommentThreads(this.commentThreads, trackChangesCommentsObj.comments, blockTitleModel.id);
            //updating the main list when there is an change -- ends
          }
          //region for saving comments --ends
        }
        else {
          blockTitleModel.titleTrackChanges = null;
          blockTitleModel.titleCommentThreads = null;
        }

        //update raw view -- starts
        let selectedItem = this.rawView.filter(item => item.blockId == blockTitleModel.id)[0];
        if (selectedItem)
          this.documentMapper.documentMapper(selectedItem, blockTitleModel);
        //update raw view -- ends

        this.editableBlockTitle.push(JSON.parse(JSON.stringify(blockTitleModel)));
      }
    });
  }

  formatPainter(index) {
    this.index = index;
    this.SelectedParagraphText = window.getSelection().toString().trim();
    if (this.SelectedParagraphText != '' && this.SelectedParagraphText != undefined) {
      if (this.designerService.enableDefaultPainter == false) {
        this.designerService.enableDefaultPainter = true
        if (this.designerService.enableFormatPainter == false || this.designerService.enableFormatPainter == undefined) {
          this.designerService.selectedTextStyle = this.editor.model.document.selection.getAttributes();
          this.cssStyles = new Array<cssStyles>();
          var attributes = this.designerService.selectedTextStyle.next().value;
          while (attributes != undefined) {
            var model = new cssStyles()
            model.key = attributes[0];
            model.value = attributes[1];
            this.cssStyles.push(model);
            attributes = this.designerService.selectedTextStyle.next().value;
          }
        }
        else if (this.designerService.enableFormatPainter == true) {
          this.editor.model.change(writer => {
            var removeItems = this.editor.model.document.selection.getAttributes();
            this.removeCSSStylesList = new Array<cssStyles>();
            var attributesRemove = removeItems.next().value;
            while (attributesRemove != undefined) {
              var modelRemove = new cssStyles()
              modelRemove.key = attributesRemove[0];
              modelRemove.value = attributesRemove[1];
              this.removeCSSStylesList.push(modelRemove);
              attributesRemove = removeItems.next().value;
            }
            this.removeCSSStylesList.forEach(data => {
              writer.removeAttribute(data.key, this.editor.model.document.selection.getFirstRange());
            });
            this.cssStyles.forEach(data => {
              writer.setAttribute(data.key, data.value, this.editor.model.document.selection.getFirstRange());
            });
          })
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.EnableDisableFormatPainter).publish('Disable');
        }
      }
      else {
        this.designerService.enableFormatPainter = false;
      }
    }
    else {
      this.designerService.enableDefaultPainter = false
      this.designerService.enableFormatPainter = false;
    }
  }

  ApplyParagraphSpacing(payload) {
    let data: any;
    let PtRight: any;
    let PtTop: any;
    let PtLeft: any;
    let PtButtom: any;
    let textAlign: any;
    let lineHeight: any;
    if (payload.onSpecialIndentationValue == ParagraphSpacing.Firstline) {
      textAlign = ParagraphSpacing.center;
    }
    else if (payload.onSpecialIndentationValue == ParagraphSpacing.Hanging) {
      textAlign = ParagraphSpacing.left;
    }
    else {
      textAlign = ParagraphSpacing.left;
    }
    if (payload.onSpecialSpacingValue == ParagraphSpacing.Single) {
      lineHeight = ParagraphSpacing.SingleValue;
    }
    else if (payload.onSpecialSpacingValue == ParagraphSpacing.SingleAndHalf) {
      lineHeight = ParagraphSpacing.SingleAndHalfValue;
    }
    else if (payload.onSpecialSpacingValue == ParagraphSpacing.Double) {
      lineHeight = ParagraphSpacing.DoubleValue;
    }
    else if (payload.onSpecialSpacingValue == ParagraphSpacing.Atleast) {
      lineHeight = ParagraphSpacing.AtleastValue;
    }
    else if (payload.onSpecialSpacingValue == ParagraphSpacing.Exactly) {
      lineHeight = ParagraphSpacing.ExactlyValue;
    }
    else if (payload.onSpecialSpacingValue == ParagraphSpacing.Multiple) {
      lineHeight = payload.onLineSpacingMultipleValue * ParagraphSpacing.MultipleValue + 'em';
    }
    else {
      lineHeight = ParagraphSpacing.SingleValue;
    }
    if (payload.onBeforeSpacingValue != '' && payload.onBeforeSpacingValue != undefined) {
      PtTop = payload.onBeforeSpacingValue;
    }
    else {
      PtTop = ParagraphSpacing.DefalutMarginnValue;
    }
    if (payload.onRightIndentationValue != '' && payload.onRightIndentationValue != undefined) {
      PtRight = payload.onRightIndentationValue;
    }
    else {
      PtRight = ParagraphSpacing.DefalutMarginnValue;
    }
    if (payload.onAfterSpacingValue != '' && payload.onAfterSpacingValue != undefined) {
      PtButtom = payload.onAfterSpacingValue;
    }
    else {
      PtButtom = ParagraphSpacing.DefalutMarginnValue;
    }
    if (payload.onLeftIndentationValue != '' && payload.onLeftIndentationValue != undefined) {
      PtLeft = payload.onLeftIndentationValue;
    }
    else {
      PtLeft = ParagraphSpacing.DefalutMarginnValue;
    }
    if (this.SelectedParagraphText != '' && this.SelectedParagraphText != undefined) {
      data = '<p style="text-align:' + textAlign +
        ';line-height:' + lineHeight +
        ';margin-left:' + PtLeft.toString() +
        ';margin-right:' + PtRight.toString() +
        ';margin-top:' + PtTop.toString() +
        ';margin-bottom:' + PtButtom.toString() + '" >' + this.SelectedParagraphText + ' </p>';
      this.insertTableData(data);
      this.designerService.enableFormatPainter = false;
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ReloadParagraphSpacing).publish('Dismiss');
  }

  getDocumentLayoutStyle() {
    if (this.designerService.isGlobalTemplate != null && this.designerService.layoutStyles.length > 0)
      this.selectedStyle = this.designerService.layoutStyles.filter(item => item.id == this.designerService.selectedLayoutStyleId)[0];
  }

  AddBookMark(payload) {
    let data: any;
    let id = Guid.newGuid();
    let setStyle: any = '';
    let finalSetStyle: any = '';
    if (this.SelectedParagraphText != '' && this.SelectedParagraphText != undefined) {
      this.designerService.selectedTextStyle = this.editor.model.document.selection.getAttributes();
      this.cssStyles = new Array<cssStyles>();
      var attributes = this.designerService.selectedTextStyle.next().value;
      while (attributes != undefined) {
        var model = new cssStyles()
        model.key = attributes[0];
        model.value = attributes[1];
        this.cssStyles.push(model);
        attributes = this.designerService.selectedTextStyle.next().value;
      }
      this.cssStyles.forEach(item => {
        if (item.key != CrossReference.spanTagId) {
          if (item.key == CrossReference.bold) {
            setStyle = CrossReference.boldValue;
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key == CrossReference.italic) {
            setStyle = CrossReference.italicValue;
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key == CrossReference.underline) {
            setStyle = CrossReference.underlineValue;
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key == CrossReference.strikethrough) {
            setStyle = CrossReference.strikethroughValue;
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key == CrossReference.superscript) {
            setStyle = CrossReference.superscriptValue;
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key == CrossReference.fontColor) {
            setStyle = CrossReference.color + item.value + ";";
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key == CrossReference.fontBackgroundColor) {
            setStyle = CrossReference.backgroundColor + item.value + ";";
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key == CrossReference.fontFamily) {
            setStyle = CrossReference.fontFamilyValue + item.value + ";";
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key == CrossReference.fontSize) {
            setStyle = CrossReference.fontSizeValue + item.value + ";";
            finalSetStyle = finalSetStyle + setStyle;
          }
          if (item.key != CrossReference.bold && item.key != CrossReference.italic
            && item.key != CrossReference.underline && item.key != CrossReference.strikethrough
            && item.key != CrossReference.superscript && item.key != CrossReference.fontColor
            && item.key != CrossReference.fontBackgroundColor && item.key != CrossReference.fontFamily
            && item.key != CrossReference.fontSize) {
            setStyle = item.key + ':' + item.value + ';';
            finalSetStyle = finalSetStyle + setStyle;
          }
        }
      })
      data = '<span class="bookmarkCss"  style ="' + finalSetStyle + '" id="' + payload + '__' + id + '__' + this.index + '">' + this.SelectedParagraphText + '</span>'
      this.insertTableData(data);
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ReloadAddBookMark).publish('Dismiss');
  }


  GetAllBookmark() {
    let ele1: any;
    let ele1Italic: any;
    let ele1Strikethrough: any;
    let ele1Bold: any; //Strong
    let ele1Superscript: any;
    let ele1Underline: any;
    let ele2: any;
    let ele2Italic: any;
    let ele2Strikethrough: any;
    let ele2Bold: any; //Strong
    let ele2Superscript: any;
    let ele2Underline: any;
    let eleTitle1: any;
    let eleTitle1Italic: any;
    let eleTitle1Strikethrough: any;
    let eleTitle1Bold: any; //Strong
    let eleTitle1Superscript: any;
    let eleTitle1Underline: any;
    let eleTitle2: any;
    let eleTitle2Italic: any;
    let eleTitle2Strikethrough: any;
    let eleTitle2Bold: any; //Strong
    let eleTitle2Superscript: any;
    let eleTitle2Underline: any;
    let count = this.flatView.length;
    this.designerService.bookmarkList = [];
    for (let i = 0; i < count; i++) {
      ele1 = document.querySelectorAll('#editor' + i + '> p > .bookmarkCss');
      ele1.forEach(item1 => {
        this.designerService.bookmarkList.push(item1['id']);
      })

      ele1Italic = document.querySelectorAll('#editor' + i + '> p > i > .bookmarkCss');
      ele1Italic.forEach(item1Italic => {
        this.designerService.bookmarkList.push(item1Italic['id']);
      })

      ele1Strikethrough = document.querySelectorAll('#editor' + i + '> p > i > s > .bookmarkCss');
      ele1Strikethrough.forEach(item1Strikethrough => {
        this.designerService.bookmarkList.push(item1Strikethrough['id']);
      })

      ele1Bold = document.querySelectorAll('#editor' + i + '> p > i > s > strong > .bookmarkCss');
      ele1Bold.forEach(item1Bold => {
        this.designerService.bookmarkList.push(item1Bold['id']);
      })

      ele1Superscript = document.querySelectorAll('#editor' + i + '> p > i > s > strong > sup > .bookmarkCss');
      ele1Superscript.forEach(item1Superscript => {
        this.designerService.bookmarkList.push(item1Superscript['id']);
      })

      ele1Underline = document.querySelectorAll('#editor' + i + '> p > i > s > strong > sup > u > .bookmarkCss');
      ele1Underline.forEach(item1Underline => {
        this.designerService.bookmarkList.push(item1Underline['id']);
      })

      ele2 = document.querySelectorAll('#editor' + i + '> p > span > .bookmarkCss');
      ele2.forEach(item2 => {
        this.designerService.bookmarkList.push(item2['id']);
      })

      ele2Italic = document.querySelectorAll('#editor' + i + '> p > span > i > .bookmarkCss');
      ele2Italic.forEach(item2Italic => {
        this.designerService.bookmarkList.push(item2Italic['id']);
      })

      ele2Strikethrough = document.querySelectorAll('#editor' + i + '> p > span > i > s > .bookmarkCss');
      ele2Strikethrough.forEach(item2Strikethrough => {
        this.designerService.bookmarkList.push(item2Strikethrough['id']);
      })

      ele2Bold = document.querySelectorAll('#editor' + i + '> p > span > i > s > strong > .bookmarkCss');
      ele2Bold.forEach(item2Bold => {
        this.designerService.bookmarkList.push(item2Bold['id']);
      })

      ele2Superscript = document.querySelectorAll('#editor' + i + '> p > span > i > s > strong > sup > .bookmarkCss');
      ele2Superscript.forEach(item2Superscript => {
        this.designerService.bookmarkList.push(item2Superscript['id']);
      })

      ele2Underline = document.querySelectorAll('#editor' + i + '> p > span > i > s > strong > sup > u > .bookmarkCss');
      ele2Underline.forEach(item2Underline => {
        this.designerService.bookmarkList.push(item2Underline['id']);
      })

      eleTitle1 = document.querySelectorAll('#editor_title_' + i + '> p > .bookmarkCss');
      eleTitle1.forEach(itemTitle1 => {
        this.designerService.bookmarkList.push(itemTitle1['id']);
      })

      eleTitle1Italic = document.querySelectorAll('#editor_title_' + i + '> p > i > .bookmarkCss');
      eleTitle1Italic.forEach(itemTitle1Italic => {
        this.designerService.bookmarkList.push(itemTitle1Italic['id']);
      })

      eleTitle1Strikethrough = document.querySelectorAll('#editor_title_' + i + '> p > i > s > .bookmarkCss');
      eleTitle1Strikethrough.forEach(itemTitle1Strikethrough => {
        this.designerService.bookmarkList.push(itemTitle1Strikethrough['id']);
      })

      eleTitle1Bold = document.querySelectorAll('#editor_title_' + i + '> p > i > s > strong > .bookmarkCss');
      eleTitle1Bold.forEach(itemTitle1Bold => {
        this.designerService.bookmarkList.push(itemTitle1Bold['id']);
      })

      eleTitle1Superscript = document.querySelectorAll('#editor_title_' + i + '> p > i > s > strong > sup > .bookmarkCss');
      eleTitle1Superscript.forEach(itemTitle1Superscript => {
        this.designerService.bookmarkList.push(itemTitle1Superscript['id']);
      })

      eleTitle1Underline = document.querySelectorAll('#editor_title_' + i + '> p > i > s > strong > sup > u > .bookmarkCss');
      eleTitle1Underline.forEach(itemTitle1Underline => {
        this.designerService.bookmarkList.push(itemTitle1Underline['id']);
      })

      eleTitle2 = document.querySelectorAll('#editor_title_' + i + '> p > span > .bookmarkCss');
      eleTitle2.forEach(itemTitle2 => {
        this.designerService.bookmarkList.push(itemTitle2['id']);
      })

      eleTitle2Italic = document.querySelectorAll('#editor_title_' + i + '> p > span > i > .bookmarkCss');
      eleTitle2Italic.forEach(itemTitle2Italic => {
        this.designerService.bookmarkList.push(itemTitle2Italic['id']);
      })

      eleTitle2Strikethrough = document.querySelectorAll('#editor_title_' + i + '> p > span > i > s > .bookmarkCss');
      eleTitle2Strikethrough.forEach(itemTitle2Strikethrough => {
        this.designerService.bookmarkList.push(itemTitle2Strikethrough['id']);
      })

      eleTitle2Bold = document.querySelectorAll('#editor_title_' + i + '> p > span > i > s > strong > .bookmarkCss');
      eleTitle2Bold.forEach(itemTitle2Bold => {
        this.designerService.bookmarkList.push(itemTitle2Bold['id']);
      })

      eleTitle2Superscript = document.querySelectorAll('#editor_title_' + i + '> p > span > i > s > strong > sup > .bookmarkCss');
      eleTitle2Superscript.forEach(itemTitle2Superscript => {
        this.designerService.bookmarkList.push(itemTitle2Superscript['id']);
      })

      eleTitle2Underline = document.querySelectorAll('#editor_title_' + i + '> p > span > i > s > strong > sup > u > .bookmarkCss');
      eleTitle2Underline.forEach(itemTitle2Underline => {
        this.designerService.bookmarkList.push(itemTitle2Underline['id']);
      })
    }
  }

  ApplyCrossReference(payload) {
    let ele1: any;
    let ele1Italic: any;
    let ele1Strikethrough: any;
    let ele1Bold: any; //Strong
    let ele1Superscript: any;
    let ele1Underline: any;
    let ele2: any;
    let ele2Italic: any;
    let ele2Strikethrough: any;
    let ele2Bold: any; //Strong
    let ele2Superscript: any;
    let ele2Underline: any;
    let eleTitle1: any;
    let eleTitle1Italic: any;
    let eleTitle1Strikethrough: any;
    let eleTitle1Bold: any; //Strong
    let eleTitle1Superscript: any;
    let eleTitle1Underline: any;
    let eleTitle2: any;
    let eleTitle2Italic: any;
    let eleTitle2Strikethrough: any;
    let eleTitle2Bold: any; //Strong
    let eleTitle2Superscript: any;
    let eleTitle2Underline: any;
    let editorIndex = payload.split('__')[2];
    if (this.SelectedParagraphText != '' && this.SelectedParagraphText != undefined) {
      ele1 = document.querySelectorAll('#editor' + editorIndex + '> p > #' + payload);
      if (ele1[0] != undefined) {
        this.SelectedParagraphText = ele1[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele1Italic = document.querySelectorAll('#editor' + editorIndex + '> p > i > #' + payload);
      if (ele1Italic[0] != undefined) {
        this.SelectedParagraphText = ele1Italic[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele1Strikethrough = document.querySelectorAll('#editor' + editorIndex + '> p > i > s > #' + payload);
      if (ele1Strikethrough[0] != undefined) {
        this.SelectedParagraphText = ele1Strikethrough[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele1Bold = document.querySelectorAll('#editor' + editorIndex + '> p > i > s > strong > #' + payload);
      if (ele1Bold[0] != undefined) {
        this.SelectedParagraphText = ele1Bold[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele1Superscript = document.querySelectorAll('#editor' + editorIndex + '> p > i > s > strong > sup > #' + payload);
      if (ele1Superscript[0] != undefined) {
        this.SelectedParagraphText = ele1Superscript[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele1Underline = document.querySelectorAll('#editor' + editorIndex + '> p > i > s > strong > sup > u > #' + payload);
      if (ele1Underline[0] != undefined) {
        this.SelectedParagraphText = ele1Underline[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele2 = document.querySelectorAll('#editor' + editorIndex + '> p > span > #' + payload);
      if (ele2[0] != undefined) {
        this.SelectedParagraphText = ele2[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele2Italic = document.querySelectorAll('#editor' + editorIndex + '> p > span > i > #' + payload);
      if (ele2Italic[0] != undefined) {
        this.SelectedParagraphText = ele2Italic[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele2Strikethrough = document.querySelectorAll('#editor' + editorIndex + '> p > span > i > s > #' + payload);
      if (ele2Strikethrough[0] != undefined) {
        this.SelectedParagraphText = ele2Strikethrough[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele2Bold = document.querySelectorAll('#editor' + editorIndex + '> p > span > i > s > strong > #' + payload);
      if (ele2Bold[0] != undefined) {
        this.SelectedParagraphText = ele2Bold[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele2Superscript = document.querySelectorAll('#editor' + editorIndex + '> p > span > i > s > strong > sup > #' + payload);
      if (ele2Superscript[0] != undefined) {
        this.SelectedParagraphText = ele2Superscript[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      ele2Underline = document.querySelectorAll('#editor' + editorIndex + '> p > span > i > s > strong > sup > u > #' + payload);
      if (ele2Underline[0] != undefined) {
        this.SelectedParagraphText = ele2Underline[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle1 = document.querySelectorAll('#editor_title_' + editorIndex + '> p > #' + payload);
      if (eleTitle1[0] != undefined) {
        this.SelectedParagraphText = eleTitle1[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle1Italic = document.querySelectorAll('#editor_title_' + editorIndex + '> p > i > #' + payload);
      if (eleTitle1Italic[0] != undefined) {
        this.SelectedParagraphText = eleTitle1Italic[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle1Strikethrough = document.querySelectorAll('#editor_title_' + editorIndex + '> p > i > s > #' + payload);
      if (eleTitle1Strikethrough[0] != undefined) {
        this.SelectedParagraphText = eleTitle1Strikethrough[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle1Bold = document.querySelectorAll('#editor_title_' + editorIndex + '> p > i > s > strong > #' + payload);
      if (eleTitle1Bold[0] != undefined) {
        this.SelectedParagraphText = eleTitle1Bold[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle1Superscript = document.querySelectorAll('#editor_title_' + editorIndex + '> p > i > s > strong > sup > #' + payload);
      if (eleTitle1Superscript[0] != undefined) {
        this.SelectedParagraphText = eleTitle1Superscript[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle1Underline = document.querySelectorAll('#editor_title_' + editorIndex + '> p > i > s > strong > sup > u > #' + payload);
      if (eleTitle1Underline[0] != undefined) {
        this.SelectedParagraphText = eleTitle1Underline[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle2 = document.querySelectorAll('#editor_title_' + editorIndex + '> p > span > #' + payload);
      if (eleTitle2[0] != undefined) {
        this.SelectedParagraphText = eleTitle2[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle2Italic = document.querySelectorAll('#editor_title_' + editorIndex + '> p > span > i > #' + payload);
      if (eleTitle2Italic[0] != undefined) {
        this.SelectedParagraphText = eleTitle2Italic[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle2Strikethrough = document.querySelectorAll('#editor_title_' + editorIndex + '> p > span > i > s > #' + payload);
      if (eleTitle2Strikethrough[0] != undefined) {
        this.SelectedParagraphText = eleTitle2Strikethrough[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle2Bold = document.querySelectorAll('#editor_title_' + editorIndex + '> p > span > i > s > strong > #' + payload);
      if (eleTitle2Bold[0] != undefined) {
        this.SelectedParagraphText = eleTitle2Bold[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle2Superscript = document.querySelectorAll('#editor_title_' + editorIndex + '> p > span > i > s > strong > sup > #' + payload);
      if (eleTitle2Superscript[0] != undefined) {
        this.SelectedParagraphText = eleTitle2Superscript[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

      eleTitle2Underline = document.querySelectorAll('#editor_title_' + editorIndex + '> p > span > i > s > strong > sup > u > #' + payload);
      if (eleTitle2Underline[0] != undefined) {
        this.SelectedParagraphText = eleTitle2Underline[0].innerHTML;
        this.insertTableData(this.SelectedParagraphText);
      }

    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ReloadApplyCrossReference).publish('Dismiss');
  }

  getAllFormatting() {
    this.headerFootersuggestions = []; this.headerFootercommentThreads = [];

    this.documentViewService.getAllFormatting(this.projectId, this.templateId).subscribe(response => {
      if (response.footer != null) {
        this.IsUpdateFooter = response.footer.id;
        this.footerShow = true;
        this.footerText = response.footer.content;
        if (this.multiRootEditorService.isTrackChangesEnabled) {

          if (response.footer.footerTrackChanges != null)
            this.headerFootersuggestions = [].concat(this.headerFootersuggestions, JSON.parse(response.footer.footerTrackChanges));

          if (response.footer.footerCommentThreads != null)
            this.headerFootercommentThreads = [].concat(this.headerFootercommentThreads, JSON.parse(response.footer.footerCommentThreads));
        }
      }
      else {
        this.IsUpdateFooter = '';
        this.footerShow = false;
        this.footerText = '';
        if (this.onChange === true) {
          if (document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
        }
      }
      if (response.header != null) {
        this.IsUpdateHeader = response.header.id;
        this.headerShow = true;
        this.headerText = response.header.content;

        if (this.multiRootEditorService.isTrackChangesEnabled) {

          if (response.header.headerTrackChanges != null)
            this.headerFootersuggestions = [].concat(this.headerFootersuggestions, JSON.parse(response.header.headerTrackChanges));

          if (response.header.headerCommentThreads != null)
            this.headerFootercommentThreads = [].concat(this.headerFootercommentThreads, JSON.parse(response.header.headerCommentThreads));
        }
      }
      else {
        this.IsUpdateHeader = '';
        this.headerShow = false;
        this.headerText = '';
        if (this.onChange === true) {
          if (document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
        }
      }
      if (response.pageColor != null) {
        this.IsUpdatePageColor = response.pageColor.id;
        this.pageColor = response.pageColor.content;
      }
      else {
        this.IsUpdatePageColor = '';
      }

      if (response.margin != null) {
        this.IsUpdatePageMargin = response.margin.id;
        this.pageMargin = response.margin.margin;
        this.designerService.currentMarginStyle = this.pageMargin.marginType;
      }
      else {
        this.IsUpdatePageMargin = '';
      }

      if (response.watermark != null) {
        this.IsUpdateWaterMark = response.watermark.id;
        var watermarkprop = response.watermark.watermark;
        var fontName = watermarkprop.fontName;
        var fontSize = watermarkprop.fontSize;
        var text = watermarkprop.text;
        var alignment = watermarkprop.alignment;
        this.waterMarkprop = { FontName: fontName, FontSize: fontSize, Text: text, Alignment: alignment }
        this.waterMarkOrientation = this.getOrientation(this.waterMarkprop.Alignment);
      }
      else {
        this.IsUpdateWaterMark = '';
      }

      if (response.orientation != null) {
        this.IsUpdatePageOrientation = response.orientation.id;
        this.pageOrientation = response.orientation.content;
      }
      else {
        this.IsUpdatePageOrientation = '';
      }

      if (response.pageSize != null) {
        this.IsUpdatePageSize = response.pageSize.id;
        this.pageLayoutSize = response.pageSize.content;
      }
      else {
        this.IsUpdatePageSize = '';
      }

      if (response.tableOfContent != null) {
        this.IsUpdateTableOfContent = response.tableOfContent.id;
        this.tableOfContent = response.tableOfContent.content;
      }
      else {
        this.IsUpdateTableOfContent = '';
      }
    });
  }
}
