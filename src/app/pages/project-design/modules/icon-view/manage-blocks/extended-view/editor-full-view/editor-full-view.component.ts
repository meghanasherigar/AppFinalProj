import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy, PipeTransform, Pipe, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TreeviewI18n, TreeviewI18nDefault } from 'ngx-treeview/src/treeview-i18n';
import { TreeviewSelection } from 'ngx-treeview';
// import MultirootEditor from '@ckeditor/ckeditor5-build-classic';
import MultirootEditor from '../../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, ColorCode } from '../../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { BlockAttributeRequest, BlockDetails, BlockType, BlockFootNote, FootNoteRequestiewModel, cssStyles, Guid, ParagraphSpacing, BlockImporter, CrossReference } from '../../../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../../services/designer.service';
import { DocumentViewService } from '../../../../../services/document-view.service';
import { ResponseStatus, ResponseType } from '../../../../../../../@models/ResponseStatus';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../../../../@models/common/dialog';
import { TemplateService } from '../../../../../services/template.service';
import { DeliverableService } from '../../../../../services/deliverable.service';
import { BlockService } from '../../../../../../admin/services/block.service';
import { LibraryService } from '../../../../../services/library.service';
import { LibraryDetailsRequestModel, TemplateAndBlockDetails, TemplateViewModel } from '../../../../../../../@models/projectDesigner/template';
import { LibraryEnum, LibrarySectionEnum, FullViewDefault, HeaderFooterViewModel, HeaderFooterResponseViewModel, WaterMarkViewModel, waterMarkProp, ActionEnum, HeaderTypeEnum, FooterTypeEnum, EditorInfo, EditorNamesPrefix, marginProp, MarginViewModel, DocumentConfigurationModel, ContentTypeViewModel, EditorFormatOptionsViewModel, FootNoteSymbolMasterViewModel,WatermarkSettings } from '../../../../../../../@models/projectDesigner/common';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TaskService } from '../../../../document-view/services/task.service';
import { DocViewDeliverableRoleViewModel, UserRightsViewModel, DocumentViewAccessRights } from '../../../../../../../@models/userAdmin';
import { LibraryBlockDetails, LibraryDropdownViewModel } from '../../../../../../../@models/projectDesigner/library';
import { Alignment, Rotation, HorizontalPosition, VerticalPosition } from '../../../../../../../@models/projectDesigner/report';
import { FullDocumentViewConst, SubMenus, BlockTypeConst } from '../../../../../../../@models/projectDesigner/designer';
import { StyleOn, DocumentStyle, DocumentLayoutStyle } from '../../../../../../../@models/projectDesigner/formatStyle';
import { CustomHTML } from '../../../../../../../shared/services/custom-html.service';
import { MultiRootEditorService } from '../../../../../../../shared/services/multi-root-editor.service';
import { QuestionTagViewModel } from '../../../../../../../@models/projectDesigner/task';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Index } from '../../../../../../../@models/projectDesigner/infoGathering';
import { marginValues, ValueConstants } from '../../../../../../../@models/common/valueconstants';
import { BlockTitleViewModel } from '../../../../../../project-management/@models/blocks/block';
import { ProjectContext } from '../../../../../../../@models/organization';
import { FormatStylingOptions } from '../../../../../../../shared/services/format-options.service';
import { DocumentMapper } from '../../../../../../../shared/services/document-mapper.service';
import { DocumentMapperModel } from '../../../../../../../@models/projectDesigner/documentMapper';
import { ToastrService } from 'ngx-toastr';
import { AnswerSaveDocView, BlockDetail, HashTagDomainModel } from '../../../../../../../@models/projectDesigner/answertag';
import 'rxjs/add/operator/toPromise';
import { StorageService } from '../../../../../../../@core/services/storage/storage.service';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
@Component({
  selector: 'ngx-editor-full-view',
  templateUrl: './editor-full-view.component.html',
  styleUrls: ['./editor-full-view.component.scss'],
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
export class EditorFullViewComponent implements OnInit, OnDestroy {
  contextmenuX: number;
  contextmenuY: number;
  selectedText: string;
  selectedQuestionType: string;
  selectedQuestionIndex: number;
  replaced: boolean;
  @Input()
  blockContentPayload;
  editor: any;
  subscriptions: Subscription = new Subscription();
  editordata: EditorInfo[] = [];
  footNoteEditorData: EditorInfo[] = [];
  showLoader: boolean = false;
  blockContentList = [];
  blockIds = [];
  flatView = [];
  currentBlock: string;
  currentPostion: number = 0;
  blockBatchSize = 3;
  findElements: any = [];
  subElements: any = [];
  outputSelectedText: string;
  footNotesBlock: BlockFootNote[] = [];
  footNotesIndex = [];
  //ngx-scrollbar options
  direction = '';
  scrollDistance = 9;
  scrollUpDistance = 2;
  throttle = 500;

  pageSize = 0;
  pageIndex = 1;
  focusElementId: any;
  loaderId = 'FullViewLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  answerTagToggled: boolean = false;
  //Header-Footer
  headerShow: boolean = false;
  footerShow: boolean = false;
  headerText: any = "";
  footerText: any = "";
  LibraryFormat: boolean = false;
  templateOrDeliverableId: string;
  headerRequestViewModel = new HeaderFooterViewModel();
  footerRequestViewModel = new HeaderFooterViewModel();
  waterMarkViewModel = new WaterMarkViewModel();
  marginViewModel = new MarginViewModel();
  headerFooterResponseViewModel: HeaderFooterResponseViewModel;
  questionTagViewModel = new QuestionTagViewModel();
  IsUpdateHeader: string = "";
  IsUpdateFooter: string = "";
  highlightContextMenu: boolean;
  placeHolder = ActionEnum.typeSomething;
  showBorderBottom: Boolean;
  showBorderTop: Boolean;
  onChange: boolean = false;
  hashTags: any = [];
  highlight: any = false;
  replacedSave: any;
  pageColor: any;
  pageBorder: any;
  outputText: string;
  pageOrientation: string;
  pageLayoutSize: string;
  waterMarkOrientation: string;
  addFootNote: boolean = false;
  deleteFootNote: boolean = false;
  toBeReplacedFN = [];
  rootsTobeSaved: EditorInfo[] = [];
  wrongNumber: any;
  answersSaveRequest: any = new AnswerSaveDocView();
  WaterMarkPropAlignment: Alignment = {
    orientation: 0,
    horizontalAlignment: 0,
    verticalAlignment: 0
  }
  waterMarkprop: waterMarkProp = {
    FontName: "", FontSize: "", Text: "",
    Alignment: this.WaterMarkPropAlignment
  }
  marginprop: marginProp = new marginProp();

  waterMarkPropTemp: waterMarkProp = {
    FontName: "", FontSize: "", Text: "",
    Alignment: this.WaterMarkPropAlignment
  }

  IsUpdatePageColor: string;
  IsUpdatePageMargin: string;
  pageMargin: any;
  IsUpdateTableOfContent: string;
  IsUpdateWaterMark: string;
  canEdit: boolean = false;
  docViewRoles: DocViewDeliverableRoleViewModel;
  docViewRights: UserRightsViewModel;
  IsUpdatePageOrientation: any;
  IsUpdatePageSize: string;
  users: any = [];
  suggestions: any = [];
  commentThreads: any = [];
  headerFootersuggestions: any = [];
  headerFootercommentThreads: any = [];
  loggedInUser: any = {};
  //isEnableDocContentLUReadOnly: boolean = true;
  tableOfContent: string;
  focusedBlockId: any;
  footNoteIndex: any = 0;

  dialogTemplate: Dialog;
  concurrencyData: EditorInfo[] = [];
  presentBlock: any;

  SelectedParagraphText: any;
  cssStyles = new Array<cssStyles>();
  removeCSSStylesList = new Array<cssStyles>();
  isPageBreakClicked: boolean;
  isPageBreak: boolean;
  rawView: DocumentMapperModel[] = [];
  projectDetails: ProjectContext;
  index: any;
  originalData = [];
  originalTitle = [];
  footNoteSymbols: FootNoteSymbolMasterViewModel[] = [];

  headerViewModel = new HeaderFooterViewModel();
  footerViewModel = new HeaderFooterViewModel();
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
  constructor(public designerService: DesignerService,
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
    private shareDetailService: ShareDetailService,
    private taskService: TaskService,
    private customHTML: CustomHTML,
    private multiRootEditorService: MultiRootEditorService,
    private elRef: ElementRef,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private sharedService: ShareDetailService,
    private formatStyling: FormatStylingOptions,
    private documentMapper: DocumentMapper,
    private storageService: StorageService) {
  }


  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.designerService.isAdminModule = false;
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.showBorderBottom = false;
    this.showBorderTop = false;
    this.blockContentList = new Array();
    let payload: any = {};
    payload.projectId = this.blockContentPayload.projectId;
    this.users = [];
    this.loggedInUser = this.multiRootEditorService.getLoggedInUserDetails();
    this.users.push(this.loggedInUser);
    this.questionTagViewModel.projectid = this.blockContentPayload.projectId;

    if (this.designerService.isDeliverableSection) {
      payload.Deliverables = [];
      payload.Deliverables.push(this.designerService.deliverableDetails.entityId);
      this.templateOrDeliverableId = this.designerService.deliverableDetails.entityId;
      this.questionTagViewModel.deliverableId = this.designerService.deliverableDetails.entityId;
      this.questionTagViewModel.templateId = null;
      this.loadFormatting();
    }
    else if (this.designerService.isTemplateSection) {
      payload.templateId = this.templateOrDeliverableId = this.blockContentPayload.templateId;
      this.templateOrDeliverableId = this.blockContentPayload.templateId;
      this.questionTagViewModel.templateId = this.blockContentPayload.templateId;
      this.questionTagViewModel.deliverableId = null;
      this.loadFormatting();
    }
    this.taskService.getAllHashtags(this.questionTagViewModel).subscribe(data => {
      this.hashTags = data;
      this.designerService.hashTagList = data;
    });
    this.taskService.getAllSymbols().subscribe((data: FootNoteSymbolMasterViewModel[]) => {
      this.footNoteSymbols = data;
    })
    // this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.isEnableDocContentLUReadOnly)
    // .subscribe((response: boolean) => {
    //   if(response == false){
    //     this.isEnableDocContentLUReadOnly = false;
    //   }
    //   else{
    //     this.isEnableDocContentLUReadOnly = true;
    //   }
    // }));
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
        this.templateOrDeliverableId = response;
        this.onChange = true;
        this.getHeaderFooterText();
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.customMargin).subscribe((payload: marginProp) => {
      this.marginprop = payload;
      this.getPageMargin(false);
    }))

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageColor)
      .subscribe((payload: any) => {
        this.pageColor = payload;
        this.getPageColor(false)
      }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageOrientation)
      .subscribe((payload: any) => {
        this.pageOrientation = payload;
        this.getPageOrientation(false)
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

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageSize)
      .subscribe((payload: any) => {
        this.pageLayoutSize = payload;
        this.getPageLayoutSize(false)
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
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.pageMargin).
      subscribe((payload: marginProp) => {
        this.marginprop = payload;
        this.getPageMargin(false);
      }));
    //toggle answer tag
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.toggleAnswerTag).
      subscribe((payload: boolean) => {
        this.answerTagToggled = payload;
        this.reloadEditorDocView();
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.addFootNote).
      subscribe((payload: any) => {
        let blockFootNote = new BlockFootNote();
        if (this.designerService.blockDetails == undefined) {
          if (this.loaderId)
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
          let warningMessage = this.translate.instant('screens.project-designer.document-view.footNote.no-cursor-message');
          this.toastr.warning(warningMessage);
          return;
        }
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        blockFootNote.blockId = this.designerService.blockDetails.blockId;
        // this.footNoteIndex  = '†';
        this.footNoteIndex = (this.footNotesIndex.length > 0) ? parseInt(this.footNotesIndex[this.footNotesIndex.length - 1]) + 1 : 1;
        let symbolFootNote = this.footNoteSymbols.find(x => x.symbolNumber == this.footNoteIndex);
        blockFootNote.referenceTag = (symbolFootNote != undefined) ? symbolFootNote.symbol : 'unknown';
        blockFootNote.index = this.footNoteIndex;
        blockFootNote.symbol = blockFootNote.referenceTag;
        var request = new FootNoteRequestiewModel();
        request.blockId = this.designerService.blockDetails.blockId;
        request.footNotes = blockFootNote;
        this.documentViewService.addFootNote(request).subscribe(response => {
          this.addFootNote = true;

          const viewFragment = this.editor.data.processor.toView('<sup id=' + '"' + response + '" class="footNtCss">' + blockFootNote.referenceTag + '</sup><span> </span><span>&nbsp;</span>');
          const modelFragment = this.editor.data.toModel(viewFragment);
          this.editor.model.insertContent(modelFragment);
          this.saveData(true);
          if (this.loaderId)
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
        }, error => {
          if (this.loaderId)
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.dialogService.Open(DialogTypes.Warning, error.message);
        });
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
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
            break;
          case ActionEnum.cancel:
            this.remove_Highlight(payload.searchedText);
            break;
        }
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action)
      .subscribe((action: any) => {
        switch (action) {
          case ActionEnum.saveAll:
            if (!this.designerService.findEnable) {
              this.saveData(false);
            }
            break;
          case ActionEnum.scrollToBlock:
            if (this.designerService.blockDetails != undefined)
              this.scrollToBlockContent();
            break;
          case ActionEnum.reload:
            this.taskService.getAllHashtags(this.questionTagViewModel).subscribe(data => {
              this.hashTags = data;
              if (document.querySelector('#toolbar-menu') != undefined) {
                document.querySelector('#toolbar-menu').childNodes.forEach(x => {
                  if (x.isEqualNode(this.editor.ui.view.toolbar.element))
                    document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
                });
              }
            });
            this.flatView = [];
            this.resetFormatting();
            this.ngAfterViewInit();//Todo : Get rid of call to ngAfterViewInIt(). 
            this.loadFormatting();
            break;
          case ActionEnum.reloadEditor:
            this.reCreateEditor();
            break;
        }
      }));
    // dropdown change in full view
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.changelibrarydropdown)
      .subscribe((value: any) => {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        if (this.editor != undefined) {
          if (document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
          this.editor.destroy();
          this.editor = undefined;
        }
        this.ngAfterViewInit();
      }));

    // dropdown change in full view
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.changelibrarydropdown)
      .subscribe((value: any) => {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        if (this.editor != undefined)
          if (document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
        this.editor.destroy();
        this.highlight = true;

        this.ngAfterViewInit();
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

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.applyLayoutStyleToContent).subscribe((selectedLayoutStyle: DocumentLayoutStyle) => {
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.selectedStyle = selectedLayoutStyle;
      if (this.editor != undefined)
        this.editor.destroy();
      this.editor = undefined;
      this.suggestions = []; this.commentThreads = [];
      this.getHeaderFooterText();
      if (selectedLayoutStyle) {
        this.flatView = [];
        this.rawView.forEach(item => {
          item.content = this.formatStyling.translateHTML(item.content, selectedLayoutStyle, StyleOn.Body);
          item.indentationLevel = item.indentationLevel == 0 ? 1 : item.indentationLevel;
          item.documentTitle = this.formatStyling.translateHTML(item.documentTitle, selectedLayoutStyle, StyleOn["Heading" + item.indentationLevel]);
          item.indentation = this.formatStyling.translateHTML(item.indentation, selectedLayoutStyle, StyleOn["Heading" + item.indentationLevel], true);

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
          _parent.createEditor(_parent.flatView);
          _parent.changeDetectorRef.detectChanges();
          _parent.ngxLoader.stopBackgroundLoader(_parent.loaderId);
        });
      }
    }));

    this.docViewRights = this.designerService.docViewAccessRights;
    if (this.designerService.isTemplateSection && this.designerService.docViewAccessRights.hasProjectTemplateAccess) {
      this.canEdit = true;
    }
    else {
      this.docViewRoles = this.designerService.docViewAccessRights.deliverableRole.find(x => x.entityId == this.designerService.deliverableDetails.entityId);
      this.canEdit = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanEditContent);
    }

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.pageBreak).subscribe((payload: any) => {
      this.isPageBreakClicked = true;
      this.isPageBreak = payload;
      if (this.designerService.blockDetails != null) {
        this.flatView.forEach(x => {
          if (x.blockId == this.designerService.blockDetails.blockId) {
            x.isPageBreak = this.isPageBreak;
          }
        });
        this.blockContentList.filter(x => {
          if (x.blockId == this.designerService.blockDetails.blockId) {
            x.isPageBreak = this.isPageBreak;
          }
        });
        this.saveData(true);
      }
    }));
    //changing the language.
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.reCreateEditor();
    });

  }
  async reCreateEditor() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.resetFormatting();
    await this.loadFormatting();
    this.taskService.getAllHashtags(this.questionTagViewModel).subscribe(data => {
      this.hashTags = data;
      if (document.querySelector('#toolbar-menu') != undefined) {
        document.querySelector('#toolbar-menu').childNodes.forEach(x => {
          if (x.isEqualNode(this.editor.ui.view.toolbar.element))
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
        });
      }
      if (this.editor != undefined)
        this.editor.destroy();
      this.editor = undefined;
      this.createEditor(this.flatView);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });

  }

  async loadFormatting() {
    this.designerService.currentProjectId = this.blockContentPayload.projectId;
    this.designerService.currentTemplateOrDeliverableId = this.templateOrDeliverableId;
    await this.documentViewService.getAllFormattingAsync(this.blockContentPayload.projectId, this.templateOrDeliverableId).then(response => {
      //footer
      if (response.footer != null) {
        this.IsUpdateFooter = response.footer.id;
        this.footerShow = true;
        this.footerText = response.footer.content;
        this.footerViewModel = new HeaderFooterViewModel();
        this.footerViewModel.Id = response.footer.id;
        this.footerViewModel.Content = response.footer.content;
      }
      else {
        this.IsUpdateFooter = '';
        this.footerShow = false;
        this.footerText = '';
        this.footerViewModel = new HeaderFooterViewModel();
        if (this.onChange === true) {
          if (this.editor != undefined && document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
        }
      }
      //header
      if (response.header != null) {
        this.IsUpdateHeader = response.header.id;
        this.headerShow = true;
        this.headerText = response.header.content;
        this.headerViewModel = new HeaderFooterViewModel();
        this.headerViewModel.Id = response.header.id;
        this.headerViewModel.Content = response.header.content;
        this.headerViewModel.IsRemoved = false;
      }
      else {
        this.IsUpdateHeader = '';
        this.headerShow = false;
        this.headerText = '';
        this.headerViewModel = new HeaderFooterViewModel();
        if (this.onChange === true) {
          if (this.editor != undefined && document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
        }
      }
      //Page color
      if (response.pageColor != null) {
        this.IsUpdatePageColor = response.pageColor.id;
        this.pageColor = response.pageColor.content;
      }
      else {
        this.IsUpdatePageColor = '';
      }
      //margin
      if (response.margin != null) {
        this.IsUpdatePageMargin = response.margin.id;
        this.pageMargin = response.margin.margin;
        this.designerService.currentMarginStyle = this.pageMargin.marginType;
      }
      else {
        this.IsUpdatePageMargin = '';
      }
      //watermark
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
      //page orientation
      if (response.orientation != null) {
        this.IsUpdatePageOrientation = response.orientation.id;
        this.pageOrientation = response.orientation.content;
      }
      else {
        this.IsUpdatePageOrientation = '';
      }
      //page size
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

  ngAfterViewInit() {
    let section: any;
    if (this.designerService.isDeliverableSection) {
      section = FullViewDefault.deliverable;
    }
    else if (this.designerService.isLibrarySection) {
      switch (this.designerService.libraryDetails.name.toLowerCase()) {
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
          break;
      }
    }
    else {
      section = FullViewDefault.template
    }

    this.getBlockContents(section).then(response => {
      let _parent = this;
      setTimeout(function () {
        _parent.createEditor(_parent.flatView);
        _parent.changeDetectorRef.detectChanges();
      });
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }

  createEditor(blockContentList) {
    this.originalData = [];
    this.originalTitle = [];
    let sourceElement: any = {};
    this.blockIds.forEach((item, index) => {
      var block = blockContentList.find(x => x.blockId == item);
      this.presentBlock = block;
      if (!block.isLocked) {
        if (!block.isStack) {
          sourceElement["header" + '-' + item + '-' + index] = document.querySelector('#editor' + index);
          sourceElement["header_title" + '-' + item + '-' + index] = document.querySelector('#editor_title_' + index);
        }
        if (block.footNotes) {
          block.footNotes.forEach(footNote => {
            sourceElement[EditorNamesPrefix.footNote + footNote.id] = document.querySelector('#footNoteEditor' + footNote.id);
          });
        }
      }
    });

    var instant = this;
    var saveFnc = {
      waitingTime: 30000,
      save(editor) {
        if (instant.highlight != undefined && !instant.highlight && (instant.designerService.findEnable == undefined || instant.designerService.findEnable == false)) {
          return instant.saveData(true);
        }
        instant.highlight = false;
      }
    }
    if (document.querySelector('#headerEditor') != undefined) {
      sourceElement["headerSection"] = document.querySelector('#headerEditor');
    }
    if (document.querySelector('#footerEditor') != undefined) {
      sourceElement["footerSection"] = document.querySelector('#footerEditor');
    }
    let _userContext = JSON.parse(this.storageService.getItem("currentUser"));
    let loggedInUserEmail = _userContext.profile.email;
    if (this.designerService.isLibrarySection) {
      if (this.designerService.libraryDetails.name.toLowerCase() === LibraryEnum.blocks || this.designerService.libraryDetails.name.toLowerCase() === LibraryEnum.user) {
        MultirootEditor.create1(sourceElement, saveFnc, this.hashTags, this.designerService.definedColorCodes, this.translate.currentLang).then(newEditor => {
          document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
          this.editor = newEditor;
          let rootNames = this.editor.model.document.getRootNames();
          rootNames.forEach(x => {
            if (x.includes("header-"))
              this.originalData.push(this.editor.getData({ rootName: x }));
            if (x.includes("header_title"))
              this.originalTitle.push(this.editor.getData({ rootName: x }));
          })
          this.designerService.ckeditortoolbar = this.editor;
        });
      }
      else {
        this.LibraryFormat = true;
      }
    } else {
      this.suggestions = [].concat(this.suggestions, this.headerFootersuggestions);
      this.commentThreads = [].concat(this.commentThreads, this.headerFootercommentThreads);
      this.multiRootEditorService.createInstance(sourceElement, saveFnc, loggedInUserEmail, this.users, this.suggestions, this.commentThreads, this.hashTags, this.designerService.definedColorCodes, 'ck ck-sidebar ck-reset ck-sidebar--wide', this.translate.currentLang).then(editor => {
        this.editor = editor;
        let rootNames = this.editor.model.document.getRootNames();
        rootNames.forEach(x => {
          if (x.includes("header-"))
            this.originalData.push(this.editor.getData({ rootName: x }));
          if (x.includes("header_title"))
            this.originalTitle.push(this.editor.getData({ rootName: x }));
        })
        this.setTableIDsInsideEditor();
        this.designerService.ckeditortoolbar = this.editor;
        this.editor.model.document.on('change', (event) => {
          if (document.activeElement.tagName == "TD" || document.activeElement.tagName == 'TH') {
            let tableElement = document.activeElement['offsetParent'];
            if (tableElement.tagName == "FIGURE") {
              this.hideBaloonPanel(tableElement);
            }
            else if (tableElement.tagName == "TABLE") {
              let tableFigureElement = tableElement.offsetParent;
              if (tableFigureElement.tagName == "FIGURE") {
                this.hideBaloonPanel(tableFigureElement);
              }
            }

          }
        });
      });
    }

    let blockList = blockContentList;
    var _parentThis = this;
    setTimeout(function () {
      blockList.forEach((item, index) => {
        _parentThis.customHTML.multiRootEditorGetResizedWidth(item.blockId, item.content);
      })
    });
  }
  setTableIDsInsideEditor() {
    let tableTypeEditors = document.querySelectorAll(BlockImporter.FigureQuerySelector);
    tableTypeEditors.forEach(tableEditor => {
      var editorDiv = tableEditor.getElementsByTagName(BlockImporter.TableTag);
      if (editorDiv.length > 0) {
        editorDiv[0].style.backgroundColor = BlockImporter.ColorYellow;
        let tableCells = editorDiv[0].getElementsByTagName(BlockImporter.TdTag);
        for (var cell = 0; cell < tableCells.length; cell++) {
          if (tableCells[cell][BlockImporter.ContentEditable] == "false")
            tableCells[cell][BlockImporter.Style][BlockImporter.PointerEvents] = BlockImporter.DisplayNoneValue;
        }
      }
    })
    let answers = document.querySelectorAll(BlockImporter.SpanQuerySelector);
    answers.forEach(ans => {
      ans[BlockImporter.Style][BlockImporter.BackGroundColor] = BlockImporter.ColorYellow;
    })
  }
  private showBaloonPanel() {
    let ballonPanelClass = document.getElementsByClassName(BlockImporter.CkEditorBaloonPanel);
    for (let index = 0; index < ballonPanelClass.length; index++) {
      if (ballonPanelClass.item(index)[BlockImporter.Style][BlockImporter.DisplayStyleAttribute] == BlockImporter.DisplayNoneValue)
        ballonPanelClass.item(index)[BlockImporter.Style][BlockImporter.DisplayStyleAttribute] = "";
    }
  }

  private hideBaloonPanel(tableElement: any) {
    if (tableElement.id.startsWith('#')) {
      let ballonPanelClass = document.getElementsByClassName(BlockImporter.CkEditorBaloonPanel);
      for (let index = 0; index < ballonPanelClass.length; index++) {
        ballonPanelClass.item(index).setAttribute(BlockImporter.Style, BlockImporter.HideElement);
      }
    }
    else {
      this.showBaloonPanel();
    }
  }

  contextMenu(event) {
    let selectedText = window.getSelection().toString().trim();
    let tagIndex = this.designerService.blockQuestionsData.findIndex(x => x.tag.toLowerCase() == selectedText.toLowerCase());
    if (tagIndex != -1) {
      this.selectedQuestionIndex = tagIndex;
      this.selectedQuestionType = this.designerService.blockQuestionsData[tagIndex].typeDetails.questionType.typeName;
      let answer = this.designerService.blockQuestionsData[tagIndex].answerDetails;
      var isInProgress = this.designerService.blockQuestionsData[tagIndex].isInfoRequestStatusInProgress
      var isAnswerExist = answer.templates.length > 0 || answer.deliverables.length > 0;
    }
    this.contextmenuX = event.x;
    this.contextmenuY = event.y;
    this.designerService.contextmenu = true;
    if (selectedText != "" && selectedText.startsWith('#') && isAnswerExist && !isInProgress) {
      this.selectedText = window.getSelection().toString().trim();
      this.highlightContextMenu = true;
    }
    else {
      this.highlightContextMenu = false;
    }
    return false;
  }
  hideContextMenu() {
    if (this.designerService.contextmenu) {
      this.designerService.contextmenu = false;
    }
  }

  getPageMargin(onInit: boolean) {
    if (onInit) {
      this.documentViewService.getPageMargin(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
      this.documentViewService.getPageMargin(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
  getPageColor(Oninit: boolean) {
    if (Oninit) {
      this.documentViewService.getPageColor(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
      this.documentViewService.getPageColor(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
      this.documentViewService.getPageOrientation(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
      this.documentViewService.getPageOrientation(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
      this.documentViewService.getPageLayoutSize(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
      this.documentViewService.getPageLayoutSize(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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

  getWaterMark(Oninit: boolean) {

    if (Oninit) {
      this.documentViewService.getWaterMark(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
      this.documentViewService.getWaterMark(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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

  replace_word(searchedText, replaceWith) {
    this.rootsTobeSaved = [];
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

  ExtractContentWithoutAns(content, isEditorData) {
    let divElement = document.createElement(BlockImporter.DivTag);
    divElement.innerHTML = content;
    let answers = divElement.querySelectorAll(BlockImporter.SpanQuerySelector);
    answers.forEach(answerEle => {
      let parentEle = answerEle.parentElement;
      parentEle.removeChild(answerEle);
    })
    let tableAnswers: any = [];
    if (isEditorData)
      tableAnswers = divElement.querySelectorAll(BlockImporter.FigureQuerySelector);
    else
      tableAnswers = divElement.querySelectorAll(BlockImporter.TableQuerySelector);
    tableAnswers.forEach(answerEle => {
      let parentEle = answerEle.parentElement;
      parentEle.removeChild(answerEle);
    })
    return divElement.innerHTML;
  }
  ExtractAnswerFromContent(content, isEditorData) {
    let divElement = document.createElement(BlockImporter.DivTag);
    divElement.innerHTML = content;
    let answers = divElement.querySelectorAll(BlockImporter.SpanQuerySelector);
    let tableAnswers: any = [];
    if (isEditorData)
      tableAnswers = divElement.querySelectorAll(BlockImporter.FigureQuerySelector);
    else
      tableAnswers = divElement.querySelectorAll(BlockImporter.TableQuerySelector);
    let totalAnswers = [];
    answers.forEach(ans => {
      totalAnswers.push(ans);
    })
    tableAnswers.forEach(tableAns => {
      totalAnswers.push(tableAns);
    })
    return totalAnswers;
  }
  CompareAnswers(editorAnswers, originalAnswers) {
    let modifiedAnswers = [];
    editorAnswers.forEach(ma => {
      originalAnswers.forEach(oa => {
        if ((ma.getAttribute(BlockImporter.IdAttribute) == oa.getAttribute(BlockImporter.IdAttribute)) && ma.innerHTML != oa.innerHTML)
          modifiedAnswers.push(ma);
      })
    })
    return modifiedAnswers;
  }
  prepareSaveAnswerModel(modifiedAnswers) {
    let listHashTagDomain: HashTagDomainModel[] = [];
    modifiedAnswers.forEach(answer => {
      const request = new HashTagDomainModel();
      request.hashTagQuestion = answer.getAttribute(BlockImporter.IdAttribute);
      let answerString: any = '';
      if (answer.innerHTML.length > 0) {
        let tableAnswer = answer.getElementsByTagName('table');
        if (tableAnswer != undefined && tableAnswer.length > 0)
          answerString = answer.innerHTML;
        else
          answerString = answer.innerHTML.slice(1, -1);
      }
      request.hashTagAnswer = answerString;
      listHashTagDomain.push(request);
    })
    return listHashTagDomain;
  }
  CompareData(rootNames) {
    let rootsTobeRemoved = [];
    let titleToRemove = [];
    this.answersSaveRequest = new AnswerSaveDocView();
    this.answersSaveRequest.projectId = this.projectDetails.projectId;
    if (this.designerService.isDeliverableSection) {
      this.answersSaveRequest.isTemplate = false;
      this.answersSaveRequest.templateOrDeliverableId = (this.designerService.deliverableDetails != null) ? this.designerService.deliverableDetails.entityId : '';
    }
    else if (this.designerService.isTemplateSection) {
      this.answersSaveRequest.isTemplate = true;
      this.answersSaveRequest.templateOrDeliverableId = (this.designerService.templateDetails != null) ? this.designerService.templateDetails.templateId : '';
    }

    this.editordata.forEach(e => {
      if (rootNames.filter(id => id == e.rootName).length > 0) {
        if (e.rootName.includes("header-")) {
          var editorData = this.editor.getData({ rootName: e.rootName });
          let modifiedData = this.addSpaceToFootNote(editorData);
          const initialData = {};
          initialData[e.rootName] = modifiedData;
          this.editor.setData(initialData);
          editorData = this.editor.getData({ rootName: e.rootName });
          editorData = editorData.replace(new RegExp(EditorNamesPrefix.footNoteToBeReplace, 'g'), EditorNamesPrefix.replaceWith);

          //when toggleOn
          if (this.answerTagToggled) {
            let editorAnswers = this.ExtractAnswerFromContent(editorData, true);
            let flatViewAnswers = this.ExtractAnswerFromContent(this.originalData[e.Index], true);
            let modifiedAnswers = this.CompareAnswers(editorAnswers, flatViewAnswers);
            if (modifiedAnswers.length > 0) {
              let blockDetails = new BlockDetail();
              var array = e.rootName.split("-");
              blockDetails.blockId = array[1];
              let answerModel = this.prepareSaveAnswerModel(modifiedAnswers);
              blockDetails.HashTags = answerModel;
              this.answersSaveRequest.blockDetails.push(blockDetails);
            }
            let editorExtractedContent = this.ExtractContentWithoutAns(editorData, true);
            let flatViewExtractedContent = this.ExtractContentWithoutAns(this.originalData[e.Index], true);
            if (flatViewExtractedContent == editorExtractedContent)
              rootsTobeRemoved.push(e);
          }
          else if (this.flatView[e.Index].content == editorData) {
            rootsTobeRemoved.push(e);
          };
        }
        if (e.rootName.includes("header_title")) {
          var editorTitleData = this.editor.getData({ rootName: e.rootName });
          if (this.answerTagToggled) {
            let editorAnswers = this.ExtractAnswerFromContent(editorTitleData, true);
            let flatViewAnswers = this.ExtractAnswerFromContent(this.originalTitle[e.Index], true);
            let modifiedAnswers = this.CompareAnswers(editorAnswers, flatViewAnswers);
            if (modifiedAnswers.length > 0) {
              let blockDetails = new BlockDetail();
              var array = e.rootName.split("-");
              blockDetails.blockId = array[1];
              let answerModel = this.prepareSaveAnswerModel(modifiedAnswers);
              blockDetails.HashTags = answerModel;
              this.answersSaveRequest.blockDetails.push(blockDetails);
            }
            let editorExtractedContent = this.ExtractContentWithoutAns(editorTitleData, true);
            let flatViewExtractedContent = this.ExtractContentWithoutAns(this.originalTitle[e.Index], true);
            if (flatViewExtractedContent == editorExtractedContent)
              titleToRemove.push(e);
          }
          else if (this.flatView[e.Index].documentTitle == editorTitleData) {
            titleToRemove.push(e);
          };
        }
      }
    });
    rootsTobeRemoved.forEach(x => {
      let indexTobeRemoved = this.editordata.findIndex(e => e.Index == x.Index);
      this.editordata.splice(indexTobeRemoved, 1);
    })
    titleToRemove.forEach(x => {
      let indexTobeRemoved = this.editordata.findIndex(e => e.Index == x.Index);
      this.editordata.splice(indexTobeRemoved, 1);
    });
    let footNoteTextTobeDeleted = [];
    this.footNoteEditorData.forEach((e, index) => {
      let fnNode = this.footNotesBlock.find(x => x.id == e.footNoteId);
      if (fnNode != undefined) {
        if (rootNames.filter(id => id == e.rootName).length > 0 && fnNode.text == this.editor.getData({ rootName: e.rootName })) {
          footNoteTextTobeDeleted.push(e);
        }
      }
    });
    footNoteTextTobeDeleted.forEach(x => {
      let indexTobeRemoved = this.footNoteEditorData.findIndex(e => e.footNoteId == x.footNoteId);
      this.footNoteEditorData.splice(indexTobeRemoved, 1);
    })
  }
  async getHeaderFooterText() {
    this.headerFootersuggestions = []; this.headerFootercommentThreads = [];
    await this.documentViewService.getHeaderFooterTextSync(this.blockContentPayload.projectId, this.templateOrDeliverableId).then(response => {
      if (response.footer != null) {
        this.footerViewModel.Id = response.footer.id;
        this.footerViewModel.Content = response.footer.content;
        this.footerViewModel.IsRemoved = false;

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

      if (response.header != null) {
        this.IsUpdateHeader = response.header.id;
        this.headerShow = true;
        this.headerText = response.header.content;
        this.headerViewModel.Id = response.header.id;
        this.headerViewModel.Content = response.header.content;
        this.headerViewModel.IsRemoved = false;

        if (this.multiRootEditorService.isTrackChangesEnabled) {

          if (response.header.headerTrackChanges != null)
            this.headerFootersuggestions = [].concat(this.headerFootersuggestions, JSON.parse(response.header.headerTrackChanges));

          if (response.header.headerCommentThreads != null)
            this.headerFootercommentThreads = [].concat(this.headerFootercommentThreads, JSON.parse(response.header.headerCommentThreads));
        }
      }
    });

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

  layoutIndex = 0;
  BlockFocusIn(event, index) {
    var editorInfo = new EditorInfo();
    editorInfo.Index = index;
    var arialabel = event.currentTarget.getAttribute('aria-label');
    var rootname = arialabel.split(", ");
    if (rootname.length > 1)
      editorInfo.rootName = rootname[1];

    if (this.designerService.selectedDocTab == SubMenus.Insert) {
      let payload: any = {};
      payload.blockId = this.blockIds[index];
      if (this.designerService.isDeliverableSection) {
        payload.editorId = editorInfo.rootName;
        if ((this.blockContentList.filter(item => item.blockId == payload.blockId && item.blockType == BlockTypeConst.CoveredTransactionsBlock).length > 0)
          && (document.activeElement.tagName != "TD" && document.activeElement.tagName != "TH"))
          payload.isImportEnabled = true;
        else
          payload.isImportEnabled = false;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconImportTransaction).publish(payload);
      }

      if (this.blockContentList.filter(item => item.blockId == payload.blockId && item.isPageBreak == true).length > 0)
        payload.isPageBreakApplied = true;
      else
        payload.isPageBreakApplied = false;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.highlight_Pageborder).publish(payload);
    }
    if (this.designerService.focusedEditor != undefined)
      index = this.designerService.focusedEditor;
    this.highlightBlockSelection(index);
    if (document.getElementsByClassName("editor-heading")[index]) {
      if (this.designerService.isLibrarySection) {
        if (this.designerService.libraryDetails.name.toLowerCase() === LibraryEnum.blocks) {
          document.getElementsByClassName("editor-heading")[index].classList.add("myClass");
        }
      } else {
        document.getElementsByClassName("editor-heading")[index].classList.add("myClass");
      }
    }

    let _parent = this;
    //to do will be removed later timeout
    setTimeout(function () {
      //set layout style config when the content is empty -- starts
      if (event.target.textContent.length == 0 && _parent.selectedStyle)
        _parent.formatStyling.setLayoutStyleForEmptyContent(_parent.editor, _parent.selectedStyle);
      //set layout style config when the content is empty -- ends
    })
  }

  editorDataTemp: EditorInfo[] = [];
  BlockEditing(event, index) {
    var editorInfo = new EditorInfo();
    editorInfo.Index = index;
    var arialabel = event.currentTarget.getAttribute('aria-label');
    var rootname = arialabel.split(", ")
    editorInfo.rootName = rootname[1];
    if (this.editorDataTemp.find(x => x.Index == editorInfo.Index && x.rootName == editorInfo.rootName) != null) {
      this.editorDataTemp.find(x => x.Index == editorInfo.Index).rootName = editorInfo.rootName;
    }
    else {
      this.editorDataTemp.push(editorInfo);
    }
    if (window.getSelection) {
      this.designerService.selectedText = window.getSelection().toString();
    }
    if (this.editorDataTemp.length > 0)
      this.editordata = [].concat(this.editordata, JSON.parse(JSON.stringify(this.editorDataTemp)));
    this.designerService.focusedEditor = index;
  }

  BlockTitleEditing(event, index) {
    var editorInfo = new EditorInfo();
    editorInfo.Index = index;
    var arialabel = event.currentTarget.getAttribute('aria-label');
    var rootname = arialabel.split(", ")
    editorInfo.rootName = rootname[1];
    if (this.editorDataTemp.find(x => x.Index == editorInfo.Index && x.rootName == editorInfo.rootName) != null) {
      this.editorDataTemp.find(x => x.Index == editorInfo.Index).rootName = editorInfo.rootName;
    }
    else {
      this.editorDataTemp.push(editorInfo);
    }
    if (window.getSelection) {
      this.designerService.selectedText = window.getSelection().toString();
    }
    if (this.editorDataTemp.length > 0)
      this.editordata = [].concat(this.editordata, JSON.parse(JSON.stringify(this.editorDataTemp)));
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
  setWaterMarkStyle() {
    let Size = this.waterMarkprop.FontSize
    let Fontfamily = this.waterMarkprop.FontName;
    let styles = {
      'font-size': Size + 'px',
      'font-family': Fontfamily
    };

    return styles;
  }
  onBlurMethod(index) {
    if (this.designerService.isLibrarySection) {
      if (this.designerService.libraryDetails.name.toLowerCase() === LibraryEnum.blocks && document.getElementsByClassName("editor-heading")[index]) {
        document.getElementsByClassName("editor-heading")[index].classList.remove("myClass");
      }
    } else if (document.getElementsByClassName("editor-heading")[index]) {
      document.getElementsByClassName("editor-heading")[index].classList.remove("myClass");
    }
  }

  saveData(autoSave: boolean, concurrencyFlow: boolean = false) {
    if (!this.editor) return false;

    let rootNames = this.editor.model.document.getRootNames();

    if (!concurrencyFlow) {
      this.CompareData(rootNames);
    }
    else {
      this.editordata = this.concurrencyData;
    }
    this.showBorderBottom = false;
    this.showBorderTop = false;
    let editableContent = [];
    let editableFootNotes = [];
    var rootsTobeSaved = [];

    if (this.replacedSave) {
      this.editordata = this.rootsTobeSaved;
    }
    //capture rootid when any modification done on trackchanges and comments -- starts
    let suggestionsData: any = [];
    let commentThreadsData: any = [];
    if (this.multiRootEditorService.isTrackChangesEnabled && !this.designerService.isLibrarySection) {
      const trackChanges = this.editor.plugins.get('TrackChanges');
      const comments = this.editor.plugins.get('Comments');
      suggestionsData = Array.from(trackChanges.getSuggestions());
      commentThreadsData = Array.from(comments.getCommentThreads());
      let modifiedData: any = [].concat(this.editordata, this.footNoteEditorData);
      this.customHTML.addEditorIdOnCommentTrackChangesModification(modifiedData, this.suggestions, this.commentThreads, suggestionsData, commentThreadsData);
      let editorData = modifiedData.filter(item => item.rootName.indexOf('footNote') == -1);
      let footNoteEditor = modifiedData.filter(item => item.rootName.indexOf('footNote') != -1);
      this.editordata = editorData.length > 0 ? editorData : [];
      this.footNoteEditorData = footNoteEditor.length > 0 ? footNoteEditor : [];
    }
    //capture rootid when any modification done on trackchanges and comments -- ends

    var _instant = this;
    if (this.answerTagToggled && this.answersSaveRequest != undefined && this.answersSaveRequest.blockDetails.length > 0) {
      this.saveAnswers(autoSave);
    }
    var footNotesTobeDeleted = [];
    if (this.editordata.length > 0 || this.footNoteEditorData.length > 0) {
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
    }
    this.concurrencyData = this.editordata;

    let editorContentData = this.editordata.filter(x => x.rootName.includes("header-"));
    let editorTitleData = this.editordata.filter(x => x.rootName.includes("header_title"));

    if (editorContentData.length > 0) {
      this.saveBlockContent(editorContentData, suggestionsData, autoSave, commentThreadsData, footNotesTobeDeleted, rootNames);
    }
    else if (this.isPageBreakClicked && this.designerService.blockDetails != null) {
      let pageBreakData = [];
      const request = new BlockAttributeRequest();
      request.blockId = this.designerService.blockDetails.blockId;
      let currBlock = this.flatView.filter(x => x.blockId == request.blockId)[0];
      if (this.designerService.isTemplateSection) {
        request.colorCode = ColorCode.White;
      }
      else if (this.designerService.isDeliverableSection && currBlock != undefined) {
        request.colorCode = currBlock.isReference ? ColorCode.White : ColorCode.Teal;
      }
      if (currBlock != undefined) {
        request.uId = currBlock.uId;
      }
      request.isPageBreak = this.isPageBreak;
      pageBreakData.push(request);

      this.updateBlockData(pageBreakData, autoSave, footNotesTobeDeleted);

    }
    if (editorTitleData.length > 0) {
      this.saveBlockTitle(editorTitleData, suggestionsData, commentThreadsData, footNotesTobeDeleted, rootNames);
    }

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
              //region for saving track changes -- ends
            }
            else {
              footNoteRequest.footNotes.footNotesTrackChanges = null;
              footNoteRequest.footNotes.footNotesCommentThreads = null;
            }
          }
          editableFootNotes.push(footNoteRequest);
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
    if (!this.headerViewModel.IsRemoved) {
      if (this.headerViewModel.Id && this.headerViewModel.Id != "") {
        this.IsUpdateHeader = this.headerViewModel.Id;
        this.saveHeader(this.IsUpdateHeader, suggestionsData, commentThreadsData, rootNames);
      }
      else {
        if (document.querySelector('#headerEditor') != undefined) {
          this.saveHeader('', suggestionsData, commentThreadsData, rootNames);
        }
      }
    }

    if (!this.footerViewModel.IsRemoved) {
      if (this.footerViewModel.Id && this.footerViewModel.Id != "") {
        this.IsUpdateFooter = this.footerViewModel.Id;
        this.saveFooter(this.IsUpdateFooter, suggestionsData, commentThreadsData, rootNames)
      }
      else {
        if (document.querySelector('#footerEditor') != undefined) {
          this.saveFooter('', suggestionsData, commentThreadsData, rootNames);
        }
      }
    }
    this.editordata = [];
    this.editorDataTemp = [];
  }

  processConcurrency(autoSave, response) {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Confirmation;
    this.dialogTemplate.Message = this.translate.instant("screens.project-designer.document-view.block-content-modified");
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resetConcurrencyData(response, true);
        this.saveData(autoSave, true);
      }
      else {
        this.resetConcurrencyData(response, false);
      }
    });
  }

  resetConcurrencyData(response, updateExisting) {
    this.flatView.forEach(x => {
      let block = response.responseData.find(b => b.blockId == x.blockId);
      if (block) {
        x.uId = block.uId;
        x.content = !updateExisting ? block.content : x.content;
        if (!updateExisting) {
          if (document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }

          this.ngAfterViewInit();
        }
      }
    });
    if (this.designerService.isTemplateSection)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.refreshTemplateBlocksUId).publish(response.responseData);
    else if (this.designerService.isDeliverableSection)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.common.refreshBlocksUId).publish(response.responseData);
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
  reloadEditorDocView() {
    if (document.querySelector('#toolbar-menu') != undefined) {
      document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
    }
    if (this.editor != undefined)
      this.editor.destroy();
    this.editor = undefined;
    this.ngAfterViewInit();
  }

  savePageMargin(marginId) {
    this.marginViewModel.Content = "";
    if (this.designerService.isDeliverableSection === true) {
      this.marginViewModel.IsTemplate = false;
    }
    else if (this.designerService.isTemplateSection === true) {
      this.marginViewModel.IsTemplate = true;
    }
    this.marginViewModel.ProjectId = this.blockContentPayload.projectId;
    this.marginViewModel.TemplateOrDeliverableId = this.templateOrDeliverableId;

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

  savePageColor(id) {
    this.headerRequestViewModel.Content = this.pageColor;
    this.headerRequestViewModel.ContentType = "PageColor";
    if (this.designerService.isDeliverableSection === true) {
      this.headerRequestViewModel.IsTemplate = false;
    }
    else if (this.designerService.isTemplateSection === true) {
      this.headerRequestViewModel.IsTemplate = true;
    }
    this.headerRequestViewModel.ProjectId = this.blockContentPayload.projectId;
    this.headerRequestViewModel.TemplateOrDeliverableId = this.templateOrDeliverableId;
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
    this.headerRequestViewModel.ContentType = "Orientation";
    if (this.designerService.isDeliverableSection === true) {
      this.headerRequestViewModel.IsTemplate = false;
    }
    else if (this.designerService.isTemplateSection === true) {
      this.headerRequestViewModel.IsTemplate = true;
    }
    this.headerRequestViewModel.ProjectId = this.blockContentPayload.projectId;
    this.headerRequestViewModel.TemplateOrDeliverableId = this.templateOrDeliverableId;
    if (id == "") {
      this.headerRequestViewModel.Id = null;
      this.documentViewService.savePageOrientation(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.home.labels.pageOrientaionAdddedSuccessfully'));

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
            this.toastr.success(this.translate.instant('screens.home.labels.pageOrientaionModifiedSuccessfully'));

          }
        });
    }
  }
  savePageLayoutSize(id) {
    this.headerRequestViewModel.Content = this.pageLayoutSize;
    this.headerRequestViewModel.ContentType = "PageSize";
    if (this.designerService.isDeliverableSection === true) {
      this.headerRequestViewModel.IsTemplate = false;
    }
    else if (this.designerService.isTemplateSection === true) {
      this.headerRequestViewModel.IsTemplate = true;
    }
    this.headerRequestViewModel.ProjectId = this.blockContentPayload.projectId;
    this.headerRequestViewModel.TemplateOrDeliverableId = this.templateOrDeliverableId;
    if (id == "") {
      this.headerRequestViewModel.Id = null;
      this.documentViewService.savePageLayoutSize(this.headerRequestViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.home.labels.pageSizeAddesSuccessfully'));

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
            this.toastr.success(this.translate.instant('screens.home.labels.pageSizemodifiedSuccessfully'));

          }
        });
    }
  }
  deleteWaterMark(Type) {
    this.documentViewService.getWaterMark(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
  saveWaterMark(Id) {
    this.waterMarkPropTemp = Object.assign({}, this.waterMarkprop);
    this.waterMarkViewModel.Content = "";
    if (this.designerService.isDeliverableSection === true) {
      this.waterMarkViewModel.IsTemplate = false;
    }
    else if (this.designerService.isTemplateSection === true) {
      this.waterMarkViewModel.IsTemplate = true;
    }
    this.waterMarkViewModel.ProjectId = this.blockContentPayload.projectId;
    this.waterMarkViewModel.TemplateOrDeliverableId = this.templateOrDeliverableId;
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
    this.waterMarkViewModel.ContentType = "Watermark"
    if (Id == "") {
      this.headerRequestViewModel.Id = null;
      this.documentViewService.saveWaterMark(this.waterMarkViewModel)
        .subscribe(response => {
          if (response.status != ResponseStatus.Sucess) {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          else {
            this.toastr.success(this.translate.instant('screens.home.labels.waterMarkAddedSuccessfully'));

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
            this.toastr.success(this.translate.instant('screens.home.labels.waterMarkModifiedSuccessfully'));

          }
        });
    }
  }

  saveHeader(id, suggestionsData, commentThreadsData, rootNames) {
    //Save Header.
    let headerNames = this.editor.model.document.getRootNames();
    const request1 = new BlockAttributeRequest();
    for (const rootName of headerNames) {
      if (rootNames.filter(id => id == rootName).length > 0 && rootName == "headerSection") {
        request1.content = this.editor.getData({ rootName });
      }
    }
    if (request1.content != undefined && request1.content != '') {
      this.headerRequestViewModel.Content = request1.content;
      this.headerRequestViewModel.ContentType = "Header";
      if (this.designerService.isDeliverableSection === true) {
        this.headerRequestViewModel.IsTemplate = false;
      }
      else if (this.designerService.isTemplateSection === true) {
        this.headerRequestViewModel.IsTemplate = true;
      }
      this.headerRequestViewModel.ProjectId = this.blockContentPayload.projectId;
      this.headerRequestViewModel.TemplateOrDeliverableId = this.templateOrDeliverableId;
      if (id == '') {
        let headerObject = JSON.parse(JSON.stringify(this.headerRequestViewModel));
        headerObject.Id = null;
        this.documentViewService.saveHeaderText(headerObject)
          .subscribe(response => {
            if (response.status != ResponseStatus.Sucess) {
              let headerErrorMessage = this.translate.instant('screens.project-designer.document-view.header-error-message');
              this.toastr.warning(headerErrorMessage);
            }
          });
      }
      else {
        this.headerRequestViewModel.Id = id;
        if (this.multiRootEditorService.isTrackChangesEnabled) {
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

  saveFooter(id, suggestionsData, commentThreadsData, rootNames) {
    //Save Footer.
    let footerNames = this.editor.model.document.getRootNames();
    const request2 = new BlockAttributeRequest();
    for (const rootName of footerNames) {
      if (rootNames.filter(id => id == rootName).length > 0 && rootName == "footerSection") {
        request2.content = this.editor.getData({ rootName });
      }
    }
    if (request2.content != undefined && request2.content != '') {
      this.footerRequestViewModel.Content = request2.content;
      this.footerRequestViewModel.ContentType = "Footer";
      if (this.designerService.isDeliverableSection === true) {
        this.footerRequestViewModel.IsTemplate = false;
      }
      else if (this.designerService.isTemplateSection === true) {
        this.footerRequestViewModel.IsTemplate = true;
      }
      this.footerRequestViewModel.ProjectId = this.blockContentPayload.projectId;
      this.footerRequestViewModel.TemplateOrDeliverableId = this.templateOrDeliverableId;
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
    globelRequest.IsAdmin = false;
    return globelRequest;
  }

  private async PopulateLayoutStyleId() {
    let layoutStyleId: string;
    if (this.designerService.isTemplateSection && this.designerService.templateDetails != null) {
      layoutStyleId = this.designerService.templateDetails.layoutStyleId;
    }
    else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails != null) {
      layoutStyleId = this.designerService.deliverableDetails.layoutStyleId;
    }
    if (!layoutStyleId) {
      //Setting to default value
      layoutStyleId = ValueConstants.DefaultId;
      this.assignStylesLayoutId(layoutStyleId);

      let request: any = {};
      request.IsTemplate = this.designerService.isTemplateSection;
      request.templateOrDeliverableId = this.designerService.isTemplateSection ?
        this.designerService.templateDetails.templateId :
        this.designerService.deliverableDetails.deliverableId;

      await this.documentViewService.getLayoutStyleId(request).then((response: string) => {
        layoutStyleId = response;
        this.assignStylesLayoutId(layoutStyleId);

      }).catch(error => { console.error(error); });
    }
  }

  private assignStylesLayoutId(layoutStyleId) {
    if (this.designerService.isTemplateSection) {
      this.designerService.templateDetails.layoutStyleId = layoutStyleId;
    }
    else if (this.designerService.isDeliverableSection) {
      this.designerService.deliverableDetails.layoutStyleId = layoutStyleId;
    }
  }

  async getBlockContents(source: string = FullViewDefault.template) {
    this.getDocumentLayoutStyle();
    let isInternalUser = (this.designerService.docViewAccessRights &&
      this.designerService.docViewAccessRights.isExternalUser) ? false : true;
    if (!this.designerService.isLibrarySection) {
      await this.documentViewService.getLayoutStylesSync(this.blockContentPayload.projectId, isInternalUser)
        .then(layoutStyles => {
          this.designerService.layoutStyles = layoutStyles;
          this.PopulateLayoutStyleId();
          this.getDocumentLayoutStyle();
        }
        ).catch(err => console.error(err));

      await this.getHeaderFooterText();
    }

    let result: any;
    switch (source.toLowerCase()) {
      case FullViewDefault.template:
        this.showLoader = true;

        if (this.answerTagToggled) {
          this.ngxLoader.startBackgroundLoader(this.loaderId);
          result = await this.templateService.documentContentAnswerTag(this.blockContentPayload.projectId,
            this.designerService.templateDetails.templateId, true);
        }

        else {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          result = await this.templateService.documentViewContent(this.blockContentPayload.projectId,
            this.designerService.templateDetails.templateId, this.pageIndex, this.pageSize);
        }

        let templateBlockDetails = new TemplateAndBlockDetails();
        templateBlockDetails.template = new TemplateViewModel();
        templateBlockDetails.template.templateId = this.designerService.templateDetails.templateId;
        templateBlockDetails.template.projectId = this.blockContentPayload.projectId;
        templateBlockDetails.template.uId = this.designerService.templateDetails.uId;
        templateBlockDetails.template.automaticPropagation = this.designerService.templateDetails.automaticPropagation;
        templateBlockDetails.template.layoutStyleId = this.designerService.templateDetails.layoutStyleId;

        let blocks = result['treeView'];
        blocks.forEach(x => {
          let blockType = new BlockType();
          blockType.blockTypeId = x.blockTypeId;
          blockType.blockType = x.blockType;
          x.blockType = blockType;
        })
        templateBlockDetails.blocks = blocks;

        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetails).publish(templateBlockDetails);
        break;
      case FullViewDefault.deliverable:
        this.showLoader = true;
        if (this.answerTagToggled)
          result = await this.templateService.documentContentAnswerTag(this.blockContentPayload.projectId,
            this.designerService.deliverableDetails.entityId, false);
        else
          result = await this.deliverableService.documentViewContent(this.designerService.deliverableDetails.entityId);
        //this.ngxLoader.stopBackgroundLoader(this.loaderId);
        //While Subscribing TemplateAndBlockDetails is used  as payload. So in deliverable also we have to use Template Model

        let deliverableDetails = new TemplateAndBlockDetails();
        deliverableDetails.template = new TemplateViewModel();
        deliverableDetails.template.templateId = this.designerService.deliverableDetails.entityId;
        deliverableDetails.template.templateName = this.designerService.deliverabletemplateDetails.templateName;
        deliverableDetails.template.projectId = this.blockContentPayload.projectId;
        deliverableDetails.template.deliverableId = this.designerService.deliverableDetails.entityId;

        let blocksDeliverable = result['treeView'];
        blocksDeliverable.forEach(x => {
          let blockType = new BlockType();
          blockType.blockTypeId = x.blockTypeId;
          blockType.blockType = x.blockType;
          x.blockType = blockType;
        })
        deliverableDetails.blocks = blocksDeliverable;

        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetails).publish(deliverableDetails);
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
        organizationlibRequest.organizationId = this.shareDetailService.getORganizationDetail().organizationId;
        result = await this.libraryService.getLibraryContents(organizationlibRequest);
        break;
      case LibraryEnum.user:
        let userlibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.user);
        result = await this.libraryService.getLibraryContents(userlibRequest);
        break;
      case LibraryEnum.blocks:
        let cbclibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.blocks);
        cbclibRequest.organizationId = this.shareDetailService.getORganizationDetail().organizationId;
        result = await this.libraryService.getLibraryContents(cbclibRequest);
        break;
      case LibraryEnum.globaloecd:
        let globalOECDlibRequest = this.libraryDetailsRequestModel(LibrarySectionEnum.globaloecd);
        result = await this.libraryService.getLibraryContents(globalOECDlibRequest);
        break;
      default:
        break;
    }
    if (this.designerService.isLibrarySection) {
      let libraryBlockDetails = new LibraryBlockDetails();
      libraryBlockDetails.library = new LibraryDropdownViewModel();
      libraryBlockDetails.blocks = result['treeView'];
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(libraryBlockDetails);
    }
    this.blockContentList = result['flatView'];
    this.blockIds = result['blockIds'];
    this.flatView = [];
    this.suggestions = []; this.commentThreads = [];
    this.footNotesIndex = [];
    this.footNotesBlock = [];
    this.blockIds.forEach((blockId, index) => {
      var blockListTemp = this.blockContentList.filter(x => x.isStack == false);
      let currentBlock = blockListTemp[index];
      if (this.selectedStyle && !currentBlock.titleFormatApplied && !this.designerService.isLibrarySection) {
        currentBlock.content = this.formatStyling.translateHTML(currentBlock.content, this.selectedStyle, StyleOn.Body);
        currentBlock.indentationLevel = currentBlock.indentationLevel == 0 ? 1 : currentBlock.indentationLevel;
        currentBlock.documentTitle = this.formatStyling.translateHTML(currentBlock.documentTitle, this.selectedStyle, StyleOn["Heading" + currentBlock.indentationLevel]);
        currentBlock.indentation = this.formatStyling.translateHTML(currentBlock.indentation, this.selectedStyle, StyleOn["Heading" + currentBlock.indentationLevel], true);
      }
      else {
        //below code is to set the marin for indent when no style applied
        let paragraph = document.createElement('p');
        paragraph.innerHTML = currentBlock.indentation;
        paragraph["style"].marginTop = '13px';
        currentBlock.indentation = paragraph.outerHTML;
      }
      if (currentBlock.content != null)
        currentBlock.content = currentBlock.content.replace(new RegExp("Wingdings>", 'g'), "Wingdings>");

      let content =
      {
        'title': currentBlock.title && currentBlock.title != null ? currentBlock.title : '',
        'blockId': currentBlock.blockId,
        'indentation': currentBlock ? currentBlock.indentation : '',
        'isStack': currentBlock ? currentBlock.isStack : '',
        'content': currentBlock ? currentBlock.content == "<p>null</p>" ? '' : currentBlock.content : '',//Todo : Change has to be implemented in API.
        'isLoaded': (currentBlock && currentBlock.content) ? true : false,
        'isReference': currentBlock && currentBlock.isReference,
        'isAppendixBlock': (currentBlock && currentBlock.isAppendixBlock) ? true : false,
        'uId': currentBlock && currentBlock.uId,
        'isLocked': currentBlock && currentBlock.isLocked,
        'footNotes': currentBlock ? currentBlock.footNotes : [],
        'indentationLevel': currentBlock.indentationLevel,
        'documentTitle': currentBlock.documentTitle ? currentBlock.documentTitle : '',
        'isPageBreak': currentBlock && currentBlock.isPageBreak,
        'trackChangesSuggestions': currentBlock.trackChangesSuggestions,
        'commentThreads': currentBlock.commentThreads,
        'titleFormatApplied': currentBlock.titleFormatApplied,
        'contentFormatApplied': currentBlock.contentFormatApplied,
        'colorCode': currentBlock.colorCode
      };

      if (this.multiRootEditorService.isTrackChangesEnabled && !this.designerService.isLibrarySection) {
        let editorFormatOptions = this.multiRootEditorService.setTrackChangesAndComments(currentBlock, this.suggestions, this.commentThreads, this.users);
        this.suggestions = editorFormatOptions.suggestions;
        this.commentThreads = editorFormatOptions.commentThreads;
        this.users = editorFormatOptions.users;
      }

      if (content.content) {
        content.content = content.content.replace(new RegExp(EditorNamesPrefix.footNoteToBeReplace, 'g'), EditorNamesPrefix.replaceWith);
      }
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
    this.rawView = JSON.parse(JSON.stringify(this.flatView));
    this.showLoader = false;
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
            this.flatView[idx].isLocked = element["isLocked"];
            let clickedBlock = document.getElementById('editor' + idx);
            if (element) {
              let topPos = clickedBlock.offsetTop;
              document.getElementById(ActionEnum.parentDiv).scrollTop = topPos;
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
        document.getElementById(ActionEnum.parentDiv).scrollTop = topPos;
        element.focus();
        if (document.getElementsByClassName("editor-heading")[index])
          document.getElementsByClassName("editor-heading")[index].classList.add("myClass");
      }
    }
  }
  scrollToFindNext(isNext, position, blockId) {
    let index = this.findElements.findIndex(x => x.index == position);
    var spans = document.querySelectorAll('span');
    var highlightedWords = [];
    spans.forEach(element => {
      if (element.outerHTML == this.searchTextFirstHalf + 'test' + "</span>") {
        highlightedWords.push(element);
      }
    });
    var topPos = highlightedWords[index].offsetTop;
    document.getElementsByClassName('trackChangeContainer')[0].scrollTo(0, topPos);
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
          document.getElementById(ActionEnum.parentDiv).scrollTop = topPos;
        }
      }
    }
  }

  ngOnDestroy() {
    this.saveData(true);
    this.subscriptions.unsubscribe();
    this.designerService.ckeditortoolbar = null;
    this.designerService.isToggleAnswerTag = false;
  }

  deleteHeaderFooter(Type) {
    this.documentViewService.getHeaderFooterText(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
      if (Type == "Header") {
        if (response.header != null) {
          this.IsUpdateHeader = response.header.id;
          this.deleteHeaderFooterByID(this.IsUpdateHeader, Type);
        }
        else {
          let headerErrorMessage = this.translate.instant('screens.project-designer.document-view.header-error-message');
          this.dialogService.Open(DialogTypes.Warning, headerErrorMessage);
        }
      }
      if (Type == "Footer") {
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

  deleteWatermarkByID(id, Type) {
    this.documentViewService.deleteWaterMark(id)
      .subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          if (Type == ActionEnum.noWaterMark) {
            this.toastr.success(this.translate.instant('screens.home.labels.waterMarkRemovedSuccessfully'));
          }
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      });
  }

  deleteHeaderFooterByID(id, Type) {
    this.documentViewService.deleteHeaderFooterText(id)
      .subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          if (Type == "Header") {
            this.headerViewModel = new HeaderFooterViewModel();
            this.headerViewModel.IsRemoved = true;
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.remove-header-success-message'));

          }
          else if (Type == "Footer") {
            this.footerViewModel = new HeaderFooterViewModel();
            this.footerViewModel.IsRemoved = true;
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.remove-footer-success-message'));

          }
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      });
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

  //Method to cascade the selection
  highlightBlockSelection(index: number) {
    if (index >= 0) {
      this.designerService.blockDetails = new BlockDetails();
      this.designerService.blockDetails.blockId = this.blockIds[index];
      if (this.designerService.isLibrarySection) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.docViewSelectedNodeLibrary).publish(this.designerService.blockDetails.blockId);
      } else if (this.designerService.isTemplateSection) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.docViewSelectedNodeTemplate).publish(this.designerService.blockDetails.blockId);
      } else if (this.designerService.isDeliverableSection) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.docViewSelectedNodeDeliverables).publish(this.designerService.blockDetails.blockId);
      }
    }
  }
  checkIsInRoles(roleToCompare) {
    if (this.docViewRoles && this.docViewRoles.roles) {
      if (this.docViewRoles.roles.find(i => i == roleToCompare))
        return true;
      else
        return false;
    }
    else {
      if (this.designerService.isTemplateSection && this.docViewRights.hasProjectTemplateAccess)
        return true;
    }
  }

  insertTableData(data) {
    const viewFragment = this.editor.data.processor.toView(data);
    const modelFragment = this.editor.data.toModel(viewFragment);
    this.editor.model.insertContent(modelFragment);
    var objRoot = new EditorInfo();
    objRoot.rootName = data.editorId;
    this.rootsTobeSaved.push(objRoot);
    //this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  setTrackChangesComments() {
    if (this.multiRootEditorService.isTrackChangesEnabled) {
      const trackChanges = this.editor.plugins.get('TrackChanges');
      let suggestionsData = Array.from(trackChanges.getSuggestions());


      const comments = this.editor.plugins.get('Comments');
      let commentThreadsData = Array.from(comments.getCommentThreads());

      let showTrackChanges: boolean = false;
      if (suggestionsData.length > 0 || commentThreadsData.length > 0) {
        showTrackChanges = true;
      }
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableTrackChanges).publish(showTrackChanges);
    }
  }

  getTableOfContent(Oninit: boolean) {
    if (Oninit) {
      this.documentViewService.getTableOfContent(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
      this.documentViewService.getTableOfContent(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
    if (this.designerService.isDeliverableSection === true) {
      this.headerRequestViewModel.IsTemplate = false;
    }
    else if (this.designerService.isTemplateSection === true) {
      this.headerRequestViewModel.IsTemplate = true;
    }
    this.headerRequestViewModel.ProjectId = this.blockContentPayload.projectId;
    this.headerRequestViewModel.TemplateOrDeliverableId = this.templateOrDeliverableId;
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
    this.documentViewService.getTableOfContent(this.blockContentPayload.projectId, this.templateOrDeliverableId).subscribe(response => {
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
  saveAnswers(autoSave) {
    this.documentViewService.updateAnswer(this.answersSaveRequest).subscribe(response => {
      if (response.status === ResponseStatus.Sucess) {
        if (!autoSave) {
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.answer-update-success-message'));
        }
        this.answersSaveRequest = new AnswerSaveDocView();
      }
      else {
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      }
    });
  }
  saveBlockContent(editorContentData, suggestionsData, autoSave, commentThreadsData, footNotesTobeDeleted, rootNames) {
    let editableContent = [];
    editorContentData.forEach(editordata => {
      if (rootNames.filter(id => id == editordata.rootName).length > 0 && editordata.rootName != FullDocumentViewConst.headerSection && editordata.rootName != FullDocumentViewConst.footerSection && editordata.rootName.indexOf('footNote-') == -1) {
        const request = new BlockAttributeRequest();
        //section to capture the resized table width for saving -- starts  
        request.content = this.customHTML.multiRootEditorSetResizedWidth(editordata.rootName, this.editor.getData({ rootName: editordata.rootName }));
        if (this.answerTagToggled) {
          request.content = request.content.replace(new RegExp(EditorNamesPrefix.tableExtraSpace, 'g'), EditorNamesPrefix.replaceWithForTable);
          request.content = this.ExtractContentWithoutAns(request.content, true);
        }
        request.contentFormatApplied = true;
        //section to capture the resized table width for saving -- ends         
        var array = editordata.rootName.split("-");
        request.blockId = array[1];

        if (this.multiRootEditorService.isTrackChangesEnabled && !this.designerService.isLibrarySection) {
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

        let currBlock = this.flatView.filter(x => x.blockId == request.blockId)[0];
        if (this.designerService.isTemplateSection) {
          request.colorCode = ColorCode.White
        }
        else if (this.designerService.isDeliverableSection && currBlock != undefined) {
          request.colorCode = currBlock.isReference ? ColorCode.White : ColorCode.Teal;
        }
        else if (this.designerService.isLibrarySection) {
          if (this.designerService.libraryDetails.name.toLowerCase() == LibraryEnum.blocks)
            request.colorCode = currBlock.colorCode;
          else
            request.colorCode = ColorCode.Grey
        }
        if (currBlock != undefined) {
          request.uId = currBlock.uId;
        }
        request.isPageBreak = this.isPageBreak;
        editableContent.push(request);

        //update raw view -- starts
        let selectedItem = this.rawView.filter(item => item.blockId == request.blockId)[0];
        if (selectedItem)
          this.documentMapper.documentMapper(selectedItem, request);
        //  //update raw view -- ends

      }

    })
    
    this.updateBlockData(editableContent, autoSave, footNotesTobeDeleted);
  }

  updateBlockData(blockDataToSave, autoSave, footNotesTobeDeleted) {
    if (blockDataToSave && blockDataToSave.length == 0) return false;
    blockDataToSave = Array.from(new Set(blockDataToSave.map(j => JSON.stringify(j)))).map((b: string) => JSON.parse(b));
    this.documentViewService.updateAllBlockData(blockDataToSave)
      .subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          this.rootsTobeSaved = [];
          this.replacedSave = false;
          if (this.isPageBreakClicked)
            this.isPageBreakClicked = false;
          if (response.responseData != null) {
            this.flatView.forEach(x => {
              let block = response.responseData.find(b => b.blockId == x.blockId);
              if (block) {
                x.uId = block.uId;
                x.isPageBreak = block.isPageBreak;
              }

            });
            if (this.isPageBreak)
              this.isPageBreak = false;
            if (this.designerService.isTemplateSection)
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.refreshTemplateBlocksUId).publish(response.responseData);
            else if (this.designerService.isDeliverableSection)
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.common.refreshBlocksUId).publish(response.responseData);
          }
          if (this.addFootNote) {
            this.reloadEditorDocView();
            this.addFootNote = false;
          }
          //reordering if any footnotes been deleted
          if (footNotesTobeDeleted.length > 0) {
            this.documentViewService.deleteFootNote(footNotesTobeDeleted).subscribe(response => {
              if (response.status == ResponseStatus.Sucess) {
                this.deleteFootNote = true;
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
          this.editordata = [];
        }
        else if (response.responseType == ResponseType.Mismatch) {
          this.processConcurrency(autoSave, response);
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      });
  }

  saveBlockTitle(editorTitleData, suggestionsData, commentThreadsData, footNotesTobeDeleted, rootNames) {
    var editableBlockTitle = [];
    editorTitleData.forEach(editorData => {
      var blockTitleModel = new BlockTitleViewModel();
      blockTitleModel.isAdmin = false;
      if (rootNames.filter(id => id == editorData.rootName).length > 0 && editorData.rootName != FullDocumentViewConst.headerSection && editorData.rootName != FullDocumentViewConst.footerSection) {
        var array = editorData.rootName.split("-");
        if (array.length >= 1) {
          blockTitleModel.id = array[1];
          this.presentBlock = this.blockContentList.filter(b => b.blockId == blockTitleModel.id)[0];
        }
        let editedData = this.editor.getData({ rootName: editorData.rootName });
        if (this.answerTagToggled)
          editedData = this.ExtractContentWithoutAns(editedData, true);
        blockTitleModel.documentTitle = editedData;
        var divCell = document.createElement("div");
        divCell.innerHTML = editedData;
        var editedText = divCell.innerText;
        blockTitleModel.title = editedData.indexOf('suggestion') == -1 ? editedText : (this.presentBlock ? this.presentBlock.title : '');
        blockTitleModel.description = this.presentBlock ? this.presentBlock.description : '';

        //update raw view -- starts
        blockTitleModel.titleFormatApplied = true;

        if (this.multiRootEditorService.isTrackChangesEnabled && !this.designerService.isLibrarySection) {
          //region for saving track changes -- starts
          let trackChangesCommentsObj = this.multiRootEditorService.getTrackChangesAndComments(blockTitleModel.documentTitle, suggestionsData, commentThreadsData, this.suggestions, this.commentThreads, this.loggedInUser.name, blockTitleModel.id);
          if (trackChangesCommentsObj) {
            blockTitleModel.titleTrackChanges = trackChangesCommentsObj.trackChanges;
            blockTitleModel.titleCommentThreads = trackChangesCommentsObj.comments;
            this.suggestions = this.multiRootEditorService.compareSuggestions(this.suggestions, trackChangesCommentsObj.trackChanges, blockTitleModel.id);
            this.commentThreads = this.multiRootEditorService.compareCommentThreads(this.commentThreads, trackChangesCommentsObj.comments, blockTitleModel.id);
          }
          //region for saving comments --ends
        }
        else {
          blockTitleModel.titleTrackChanges = null;
          blockTitleModel.titleCommentThreads = null;
        }

        let selectedItem = this.rawView.filter(item => item.blockId == blockTitleModel.id)[0];
        if (selectedItem)
          this.documentMapper.documentMapper(selectedItem, blockTitleModel);
        //update raw view -- ends
        editableBlockTitle.push(JSON.parse(JSON.stringify(blockTitleModel)));
      }
    });

    this.documentViewService.updateBlockDocumentTitle(editableBlockTitle).subscribe((data: any) => {
      if (this.designerService.isTemplateSection)
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.refreshTemplateBlocks).publish(editableBlockTitle);
      else if (this.designerService.isDeliverableSection)
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.common.refreshBlocks).publish(editableBlockTitle);

        if (this.addFootNote) {
          this.reloadEditorDocView();
          this.addFootNote = false;
        }
        //reordering if any footnotes been deleted
        if (footNotesTobeDeleted.length > 0) {
          this.documentViewService.deleteFootNote(footNotesTobeDeleted).subscribe(response => {
            if (response.status == ResponseStatus.Sucess) {
              this.deleteFootNote = true;
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
    }, error => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
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

  selectedStyle = new DocumentLayoutStyle();
  getDocumentLayoutStyle() {
    let layoutStyleId = "";
    if (this.designerService.isTemplateSection && this.designerService.templateDetails != null) layoutStyleId = this.designerService.templateDetails.layoutStyleId;
    else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails != null) layoutStyleId = this.designerService.deliverableDetails.layoutStyleId;
    if (layoutStyleId) {
      this.selectedStyle = this.designerService.layoutStyles.filter(item => item.id == layoutStyleId)[0];
      this.designerService.selectedLayoutStyleId = layoutStyleId;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.changeLayoutStyle).publish(true);
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
    let ele: any;
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
}
