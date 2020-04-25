import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum, ColorCode } from '../../../../../../../@models/common/eventConstants';
import { BlockService } from '../../../../../services/block.service';
import { BlockAttributeDetail, BlockDetails, BlockFootNote, FootNoteRequestiewModel, cssStyles, CrossReference } from '../../../../../../../@models/projectDesigner/block';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../../../../@models/common/dialog';
import { BlockAttributeRequest } from '../../../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../../services/designer.service';
import { DocumentViewService } from '../../../../../services/document-view.service';
import { ResponseStatus, ResponseType } from '../../../../../../../@models/ResponseStatus';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TreeviewI18n, TreeviewI18nDefault } from 'ngx-treeview/src/treeview-i18n';
import { TreeviewSelection } from 'ngx-treeview';
import { Subscription } from 'rxjs';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import MultirootEditor from '../../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { ActionEnum, LibraryEnum, EditorNamesPrefix, EditorInfo, FootNoteSymbolMasterViewModel } from '../../../../../../../@models/projectDesigner/common';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { SubMenus, BlockTypeConst } from '../../../../../../../@models/projectDesigner/designer';
import { CustomHTML } from '../../../../../../../shared/services/custom-html.service';
import { TaskService } from '../../../../document-view/services/task.service';
import { MultiRootEditorService } from '../../../../../../../shared/services/multi-root-editor.service';
import { ProjectContext } from '../../../../../../../@models/organization';
import { QuestionTagViewModel } from '../../../../../../../@models/projectDesigner/task';
import { ConfirmationDialogComponent } from '../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { DocumentLayoutStyle, StyleOn } from '../../../../../../../@models/projectDesigner/formatStyle';
import { FormatStylingOptions } from '../../../../../../../shared/services/format-options.service';
import { UserRightsViewModel, DocViewDeliverableRoleViewModel, DocumentViewAccessRights } from '../../../../../../../@models/userAdmin';
import { BlockTitleViewModel } from '../../../../../../project-management/@models/blocks/block';
import { DeliverablesInput } from '../../../../../../../@models/projectDesigner/deliverable';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../../../../@core/services/storage/storage.service';

@Component({
  selector: 'ngx-edit-block-content',
  templateUrl: './edit-block-content.component.html',
  styleUrls: ['./edit-block-content.component.scss'],
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
export class EditBlockContentComponent implements OnInit, OnDestroy {
  librarySection: string = '';
  isLoaded: boolean = false;
  replaced: boolean;
  editor: any;
  blockTitle: any = "";
  highlight: any = false;
  blockId: string;
  suggestions: any = [];
  users: any = [];
  projectDetails: ProjectContext;
  commentThreads: any = [];
  subElements: any = [];
  loggedInUser: any = {};
  hashTags: any = [];
  questionTagViewModel = new QuestionTagViewModel();
  loaderId = 'ExtendedViewLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  blocksCount: any;
  GlobalCountrylibrarySection: Boolean = false;
  GlobalCountryBlockContent: any;
  LockedBlockContent: any;
  footNoteIndex: number;
  findElements: any = [];
  outputSelectedText: string;
  outputText: string;
  footNotesIndex = [];
  addFootNote: boolean = false;
  blockFootNotes: any = [];
  footNoteEditorData: EditorInfo[] = [];
  LoadBlockData: any = "";
  extendedViewBlockId: any;
  count: any = 0;
  docViewRights: UserRightsViewModel;
  canEdit: boolean = false;
  docViewRoles: DocViewDeliverableRoleViewModel;
  selectedStyle = new DocumentLayoutStyle();
  deliverablesInput = new DeliverablesInput();
  SelectedParagraphText: any;
  rootsTobeSaved: EditorInfo[] = [];
  replacedSave: any;
  blockContentList = [];
  blockIds = [];
  cssStyles = new Array<cssStyles>();
  removeCSSStylesList = new Array<cssStyles>();
  blockDetail: any;
  footNoteSymbols: FootNoteSymbolMasterViewModel[] = [];
  pristineTitle: string;
  pristineContent: string;
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
  constructor(private readonly _eventService: EventAggregatorService,
    private documentViewService: DocumentViewService,
    private dialogService: DialogService,
    public designerService: DesignerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private ngxLoader: NgxUiLoaderService,
    private customHTML: CustomHTML,
    protected service: BlockService,
    private sharedService: ShareDetailService,
    private taskService: TaskService,
    private multiRootEditorService: MultiRootEditorService,
    private dialog: MatDialog,
    private elRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private formatStyling: FormatStylingOptions,
    private storageService: StorageService,
  ) {
  }
  subscriptions: Subscription = new Subscription();
  ngOnInit() {
    this.extendedViewBlockId = this.designerService.blockDetails == null ? "" : this.designerService.blockDetails.blockId;

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectDetails = this.sharedService.getORganizationDetail();

    this.users = [];
    this.loggedInUser = this.multiRootEditorService.getLoggedInUserDetails();
    this.users.push(this.loggedInUser);

    let payload: any = {};
    payload.projectId = this.projectDetails.projectId;
    this.questionTagViewModel.projectid = payload.projectId;
    if (this.designerService.isTemplateSection) {
      payload.templateId = this.designerService.templateDetails ? this.designerService.templateDetails.templateId : undefined;
      this.questionTagViewModel.templateId = payload.templateId;
      this.questionTagViewModel.deliverableId = null;
    }
    if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails && this.designerService.deliverableDetails != null) {
      payload.Deliverables = [];
      payload.Deliverables.push(this.designerService.deliverableDetails.entityId);
      this.questionTagViewModel.deliverableId = this.designerService.deliverableDetails.entityId;
      this.questionTagViewModel.templateId = null;
    }

    if (this.designerService.libraryDetails) {
      this.GlobalCountrylibrarySection = (
        this.designerService.libraryDetails.name.toLowerCase() === LibraryEnum.global ||
        this.designerService.libraryDetails.name.toLowerCase() === LibraryEnum.country);
    }
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
          case ActionEnum.cancel:
            this.remove_Highlight(payload.searchedText);
            break;
        }
      }));
    this.taskService.getAllHashtags(this.questionTagViewModel).subscribe(data => {
      this.hashTags = data;
    });
    this.taskService.getAllSymbols().subscribe((data: FootNoteSymbolMasterViewModel[]) => {
      this.footNoteSymbols = data;
    })
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.iconExtendedView).subscribe((payload: any) => {
      this.blocksCount = payload;
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      var ele = document.querySelector('#editor_' + this.extendedViewBlockId);
      var parentDiv = ele.parentElement;
      parentDiv.removeChild(ele);
      this.extendedViewBlockId = this.designerService.blockDetails.blockId;
      var newEle = document.createElement('div');
      newEle.setAttribute("id", "editor_" + this.extendedViewBlockId);
      // var footnoteEditor = this.elRef.nativeElement.querySelector('#footNoteEditor'+ this.blockFootNotes[0].id);
      if (parentDiv.hasChildNodes() && parentDiv.childNodes.length > 1)
        parentDiv.insertBefore(newEle, parentDiv.childNodes[1]);
      else
        parentDiv.appendChild(newEle);
      this.docViewRights = this.designerService.docViewAccessRights;
      if (this.designerService.isTemplateSection && this.designerService.docViewAccessRights.hasProjectTemplateAccess) {
        this.canEdit = true;
      }
      else {
        this.docViewRoles = this.designerService.docViewAccessRights.deliverableRole.find(x => x.entityId == this.designerService.deliverableDetails.entityId);
        this.canEdit = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanEditContent);
      }
      this.reloadEditorDocView();

    }));
    //Add footnote
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.addFootNote).
      subscribe((payload: any) => {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        let blockFootNote = new BlockFootNote();
        blockFootNote.blockId = this.designerService.blockDetails.blockId;
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
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action)
      .subscribe((action: any) => {
        switch (action) {
          case 'save':
            if (!this.designerService.findEnable) {
              this.saveData(false);
            }
        }
      }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction)
      .subscribe((payload: any) => {
        switch (payload.action) {
          case ActionEnum.insertTable:
            this.insertTableData(payload.data);
            break;
        }
      }));

    this.subscriptions.add(this._eventService.getEvent("ExtendedViewContentUpdate")
      .subscribe((blockId: any) => {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        this.highlight = true;
        this.taskService.getAllHashtags(this.questionTagViewModel).subscribe(data => {
          this.hashTags = data;
        });
        this.reloadEditorDocView()
      }));

    this.docViewRights = this.designerService.docViewAccessRights;
    if (this.designerService.isTemplateSection && this.designerService.docViewAccessRights.hasProjectTemplateAccess) {
      this.canEdit = true;
    }
    else {
      this.docViewRoles = this.designerService.docViewAccessRights.deliverableRole.find(x => x.entityId == this.designerService.deliverableDetails.entityId);
      this.canEdit = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.CanEditContent);
    }
    //changing the language.
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.reloadEditorDocView();
    });
  }

  ngAfterViewInit() {
    //this.getBlockAttributes(this.designerService.blockDetails.blockId);
  }

  ngOnDestroy() {
    this.designerService.blockDetails = this.blockDetail;
    this.saveData(true);
    this.subscriptions.unsubscribe();
    this.designerService.ckeditortoolbar = null;
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
  getfindElements(searchText, searchedText) {
    let searchTextBold = this.searchTextFirstHalf + this.boldText + searchedText + this.boldTextEnd + this.searchTextSecondHalf;
    let searchTextItalic = this.searchTextFirstHalf + this.italicText + searchedText + this.italicEnd + this.searchTextSecondHalf;
    let searchTextUnderline = this.searchTextFirstHalf + this.underlineText + searchedText + this.underlineTextEnd + this.searchTextSecondHalf;
    let searchTextBoldItalic = this.searchTextFirstHalf + this.italicText + this.boldText + + searchedText +  this.boldTextEnd + this.italicEnd + this.searchTextSecondHalf;
    let searchTextBoldUnderline = this.searchTextFirstHalf + this.boldText + this.underlineText + searchedText +  this.underlineTextEnd + this.boldTextEnd + this.searchTextSecondHalf;
    let searchTextItalicUnderline = this.searchTextFirstHalf + this.italicText + this.underlineText  + searchedText + this.underlineTextEnd + this.italicEnd +  this.searchTextSecondHalf;
    this.designerService.findEnable = true;
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

  Replace(text, start, end, replaceText) {
    return text.substring(0, start) + replaceText + text.substring(end);
  };
  setBackOldElement(searchedText, index, search, replaceText) {
    let length = search.length;
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

  createEditorInstance(data) {
    if (this.isLocked()) {
      this.LockedBlockContent = data.content;
      return;
    }
    var ele = document.querySelector('#editor_' + this.extendedViewBlockId);
    if (ele != undefined)
      ele.innerHTML = data.content;
    // else
    //   this.LoadBlockData = data.content;
    this.blockFootNotes = [];
    this.footNotesIndex = [];
    data.footNotes.forEach(x => {
      x.blockId = this.designerService.blockDetails.blockId;
      x.text = (x.text == '<p>null</p>' || x.text == null) ? '' : x.text;
      this.blockFootNotes.push(x);
      this.footNotesIndex.push(x.index);
    })
    this.footNotesIndex = this.footNotesIndex.sort((a, b) => {
      return a - b;
    });
    this.changeDetectorRef.detectChanges();
    if (this.editor != undefined) {
      this.editor.destroy();
      this.editor = undefined;
    }
    //   this.editor.setData({ tablTypeHeader: this.count});
    //   this.editor.setData({ tablTypeHeader: this.LoadBlockData });
    // }
    let sourceElement: any = {};
    sourceElement['tablTypeHeader_' + this.extendedViewBlockId] = document.querySelector('#editor_' + this.extendedViewBlockId);
    sourceElement['header_title' + '-' + this.extendedViewBlockId] = document.querySelector('#editor_title_' + this.extendedViewBlockId);
    data.footNotes.forEach(footNote => {
      sourceElement[EditorNamesPrefix.footNote + footNote.id] = document.querySelector('#footNoteEditor' + footNote.id);
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
    let _userContext = JSON.parse(this.storageService.getItem("currentUser"));
    let loggedInUserEmail = _userContext.profile.email;

    //Create editor only in case if its not global or country library
    if (!this.GlobalCountrylibrarySection && !this.isLocked()) {
      this.multiRootEditorService.createInstance(sourceElement, saveFnc, loggedInUserEmail, this.users, this.suggestions, this.commentThreads, this.hashTags, this.designerService.definedColorCodes, undefined, this.translate.currentLang).then(editor => {
        this.editor = editor;
        if (!this.canEdit)
          this.editor.isReadOnly = true;
        this.designerService.ckeditortoolbar = this.editor;
        if (this.editor && this.editor.model) {
          let getRootNames = this.editor.model.document.getRootNames();
          if (getRootNames.length > 0)
          {
            let editorTitleData = getRootNames.find(x => x.includes("header_title"));
            let editorContent = this.editor.getData({ rootName: 'tablTypeHeader_' + this.extendedViewBlockId });
            this.pristineTitle = this.editor.getData({ rootName: editorTitleData })
            this.pristineContent = editorContent;
          }
        }
      });
    }
    else {
      this.GlobalCountryBlockContent = data.content;
    }
  }

  async getBlockAttributes(blockId) {
    this.isLoaded = true;
    await this.getDocumentLayoutStyle();
    this.service.getBlockDetail(blockId)
      .subscribe((data: BlockAttributeDetail) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);

        this.designerService.blockAttributeDetail = data;
        this.blockDetail = this.designerService.blockDetails;

        if (data.content != null)
          data.content = data.content.replace(new RegExp(EditorNamesPrefix.footNoteToBeReplace, 'g'), EditorNamesPrefix.replaceWith);

        if (this.selectedStyle && !data.contentFormatApplied)
          data.content = this.formatStyling.translateHTML(data.content, this.selectedStyle, StyleOn.Body);

        let indentationLevel = this.designerService.blockDetails != null ? (this.designerService.blockDetails.level + 1) : 1;
        if (this.selectedStyle && !data.titleFormatApplied) {
          indentationLevel = indentationLevel == 0 ? 1 : indentationLevel;
          data.documentTitle = this.formatStyling.translateHTML(data.documentTitle, this.selectedStyle, StyleOn["Heading" + indentationLevel]);
        }

        this.blockTitle = data.documentTitle ? data.documentTitle : '';
        this.LoadBlockData = data.content;
        this.suggestions = [];
        this.commentThreads = [];

        if (this.multiRootEditorService.isTrackChangesEnabled) {
          let editorFormatOptions = this.multiRootEditorService.setTrackChangesAndComments(data, this.suggestions, this.commentThreads, this.users);
          this.suggestions = editorFormatOptions.suggestions;
          this.commentThreads = editorFormatOptions.commentThreads;
          this.users = editorFormatOptions.users;
        }

        if (this.editor) {
          // this.setContent(data.content);
          if (document.querySelector('#toolbar-menu') != undefined) {
            document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }

        }
        this.createEditorInstance(data);

      }),
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      };
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
  CompareData() {
    let footNotesTobeDeleted = [];
    this.footNoteEditorData.forEach((e, index) => {
      let fnNode = this.blockFootNotes.find(x => x.id == e.footNoteId);
      if (fnNode != undefined) {
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
  }

  isLocked() {
    return this.designerService.blockAttributeDetail && this.designerService.blockAttributeDetail.isLocked;
  }

  setContent(content) {
    this.editor.setData({ tablTypeHeader: (content == null ? '' : content) });

    var _parentThis = this;
    setTimeout(function () {
      _parentThis.customHTML.multiRootEditorGetResizedWidth('tablTypeHeader', content);
    });
  }

  saveData(autoSave) {
    if (!this.editor) return false;

    this.CompareData();
    let editableFootNotes = [];
    var footNotesTobeDeleted = [];
    let editorTitleData = [];


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
    this.blockFootNotes.forEach(x => {
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

    if (this.editor && this.editor.model) {
      let getRootNames = this.editor.model.document.getRootNames();
      if (getRootNames.length > 0)
        editorTitleData = getRootNames.filter(x => x.includes("header_title"));
    }
    var request = new BlockAttributeRequest();
    request.content = this.customHTML.multiRootEditorSetResizedWidth('tablTypeHeader_' + this.extendedViewBlockId, this.editor.getData({ rootName: 'tablTypeHeader_' + this.extendedViewBlockId }));
    request.contentFormatApplied = true;

    if (this.designerService.blockAttributeDetail == null) {
      return;
    }
    let modifiedContent = this.editor.getData({ rootName: 'tablTypeHeader_' + this.extendedViewBlockId });
    let modfiedTitle = this.editor.getData({ rootName: editorTitleData[0] });
    if(this.pristineContent == modifiedContent && this.pristineTitle== modfiedTitle)
    {
      return;
    }

    this.pristineContent = modifiedContent;
    this.pristineTitle = modfiedTitle; 
    request.blockId = this.designerService.blockDetails.blockId;

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

    if (this.designerService.isTemplateSection) {
      request.colorCode = ColorCode.White
    }
    else if (this.designerService.isDeliverableSection) {
      request.colorCode = this.designerService.blockDetails.isReference ? ColorCode.White : ColorCode.Teal;
    }

    else if (this.designerService.isLibrarySection) {
      if (this.designerService.libraryDetails.name.toLowerCase() == LibraryEnum.blocks)
        request.colorCode = this.designerService.blockDetails.colorCode;
      else
        request.colorCode = ColorCode.Grey
    }

    request.uId = this.designerService.blockAttributeDetail.uId;
    request.projectId = this.sharedService.getORganizationDetail().projectId;
    if (this.designerService.isDeliverableSection)
      request.entityId = this.designerService.deliverableDetails.entityId
    else
      request.entityId = null;
    this.documentViewService.updateBlockData(request)
      .subscribe(response => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);

        if (response.status === ResponseStatus.Sucess) {
          if (response.responseData != null) {
            this.designerService.blockAttributeDetail.uId = response.responseData.uId;
            if (this.designerService.blockDetails == null) this.designerService.blockDetails = this.blockDetail;
            this.designerService.blockDetails.uId = response.responseData.uId;
          }
          if (this.addFootNote) {
            this.reloadEditorDocView();
            this.addFootNote = false;
          }
          //Delete footnote
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
        }
        else if (response.responseType == ResponseType.Mismatch) {
          this.processConcurrency(autoSave, response);
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      }),
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      };
    //Update footnote
    this.footNoteEditorData.forEach(editordata => {
      if (editordata.rootName.indexOf(EditorNamesPrefix.footNote) > -1) {
        var footNoteRequest = new FootNoteRequestiewModel();
        footNoteRequest.footNotes = new BlockFootNote();
        if (editordata.rootName.split(EditorNamesPrefix.footNote).length > 0) {
          footNoteRequest.footNotes.id = editordata.rootName.split(EditorNamesPrefix.footNote)[1];
          var footNoteBlock = this.blockFootNotes.find(y => y.id == footNoteRequest.footNotes.id);
          if (footNoteBlock != undefined) {
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
    if (editorTitleData.length > 0) {
      this.saveBlockTitle(editorTitleData, suggestionsData, commentThreadsData);
    }
  }
  reloadEditorDocView() {
    if (this.editor && document.querySelector('#toolbar-menu') != undefined) {
      document.querySelector('#toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
    }
    if (this.editor != undefined)
      this.editor.destroy();
    this.editor = undefined;
    if(this.designerService.blockDetails && this.designerService.blockDetails!= null) this.getBlockAttributes(this.designerService.blockDetails.blockId);
  }
  processConcurrency(autoSave, response) {
    let dialogTemplate = new Dialog();
    dialogTemplate.Type = DialogTypes.Confirmation;
    dialogTemplate.Message = this.translate.instant("screens.project-designer.document-view.block-content-modified");
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogTemplate
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resetConcurrencyData(response, true);
        this.saveData(autoSave);
      }
      else {
        this.resetConcurrencyData(response, false);
      }
    });
  }

  resetConcurrencyData(response, updateExisting) {
    let block = response.responseData;
    if (block) {
      this.designerService.blockAttributeDetail.uId = block.uId;
      if (!updateExisting) {
        this.reloadEditorDocView();
      }
    }
    if (this.designerService.isTemplateSection)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.refreshTemplateBlocksUId).publish([response.responseData]);
    else if (this.designerService.isDeliverableSection)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.common.refreshBlocksUId).publish([response.responseData]);
  }

  BlockEditing(event) {
    if (this.designerService.selectedDocTab == SubMenus.Insert && this.designerService.isDeliverableSection) {
      let payload: any = {};
      payload.blockId = this.designerService.blockDetails.blockId;
      payload.editorId = 'tablTypeHeader_' + this.extendedViewBlockId;
      if (this.designerService.blockDetails.blockType.blockType == BlockTypeConst.CoveredTransactionsBlock)
        payload.isImportEnabled = true;
      else
        payload.isImportEnabled = false;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconImportTransaction).publish(payload);
    }
  }

  insertTableData(data) {
    const viewFragment = this.editor.data.processor.toView(data);
    const modelFragment = this.editor.data.toModel(viewFragment);
    this.editor.model.insertContent(modelFragment);
  }

  async getDocumentLayoutStyle() {
    await this.documentViewService.getLayoutStylesSync(this.projectDetails.projectId, false)
      .then(layoutStyles => {
        this.designerService.layoutStyles = layoutStyles;
        let layoutStyleId = "";
        if (this.designerService.isTemplateSection && this.designerService.templateDetails != null) layoutStyleId = this.designerService.templateDetails.layoutStyleId;
        else if (this.designerService.isDeliverableSection && this.designerService.deliverableDetails != null) layoutStyleId = this.designerService.deliverableDetails.layoutStyleId;
        this.selectedStyle = this.designerService.layoutStyles.filter(item => item.id == layoutStyleId)[0];
        if (layoutStyleId && layoutStyleId != "") {
          this.designerService.selectedLayoutStyleId = layoutStyleId;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.changeLayoutStyle).publish(true);
        }
        else {
          //when we navigate from task this method will be executed.
          this.PopulateLayoutStyleId();
        }
      }
      ).catch(err => console.error(err));
  }

  private async PopulateLayoutStyleId() {
    let request: any = {};
    request.IsTemplate = this.designerService.isTemplateSection;
    request.templateOrDeliverableId = this.designerService.isTemplateSection ?
      this.designerService.templateDetails.templateId :
      (this.designerService.deliverableDetails ? this.designerService.deliverableDetails.deliverableId : null);

    if (request.templateOrDeliverableId) {
      await this.documentViewService.getLayoutStyleId(request).then((response: string) => {
      let layoutStyleId = response;
      this.assignStylesLayoutId(layoutStyleId);
      this.designerService.selectedLayoutStyleId = layoutStyleId;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.changeLayoutStyle).publish(true);
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

  saveBlockTitle(editorTitleData, suggestionsData, commentThreadsData) {
    if (this.designerService.blockAttributeDetail) {
      let presentBlock = this.designerService.blockAttributeDetail;
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      var editableBlockTitle = [];
      const blockTitleModel = new BlockTitleViewModel();
      editorTitleData.forEach(editorData => {
        var array = editorData.split("-");
        if (array.length > 1)
          blockTitleModel.id = array[1];
        let editedData = blockTitleModel.documentTitle = this.editor.getData({ rootName: 'header_title' + '-' + this.extendedViewBlockId });
        var divCell = document.createElement("div");
        divCell.innerHTML = editedData;
        var editedText = divCell.innerText;
        blockTitleModel.title = editedData.indexOf('suggestion') == -1 ? editedText : presentBlock.title;
        blockTitleModel.description = presentBlock.description;
        blockTitleModel.uId = presentBlock.uId;

        if (this.multiRootEditorService.isTrackChangesEnabled) {
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

        editableBlockTitle.push(JSON.parse(JSON.stringify(blockTitleModel)));
      });

      this.documentViewService.updateBlockDocumentTitle(editableBlockTitle).subscribe((data: any) => {
        if (this.designerService.isTemplateSection && editableBlockTitle.length > 0) {
          let updateBlockModel = [];
          editableBlockTitle.forEach(x => {
            let editedTitle: any = {};
            editedTitle.id = x.id,
              editedTitle.title = x.title,
              editedTitle.description = x.description;
            editedTitle.uId = x.uId;
            updateBlockModel.push(editedTitle);
          });
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.refreshTemplateBlocks).publish(updateBlockModel);
        }
        else if (this.designerService.isDeliverableSection) {
          this.deliverablesInput.id = this.designerService.deliverableDetails ? this.designerService.deliverableDetails.entityId : undefined;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable).publish(this.deliverablesInput);
        }
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }, error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
    }
  }

  formatPainter() {
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
            if (model.key != CrossReference.spanTagId) {
              this.cssStyles.push(model);
            }
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
              if (modelRemove.key != CrossReference.spanTagId) {
                this.removeCSSStylesList.push(modelRemove);
              }
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

}
