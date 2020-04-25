import { Component, OnInit, Input, ChangeDetectorRef, Pipe, PipeTransform, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { TreeviewSelection } from 'ngx-treeview';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { TreeviewI18n, TreeviewI18nDefault } from 'ngx-treeview/src/treeview-i18n';
import { Subscription } from 'rxjs';
import MultirootEditor from '../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { MultiRootEditorService } from '../../../../../shared/services/multi-root-editor.service';
import { CustomHTML } from '../../../../../shared/services/custom-html.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../project-design/services/designer.service';
import { LibraryEnum, FullViewDefault, LibrarySectionEnum } from '../../../../../@models/projectDesigner/common';
import { BlockAttributeRequest } from '../../../../../@models/projectDesigner/block';
import { DocumentViewService } from '../../../../project-design/services/document-view.service';
import { ResponseStatus } from '../../../../../@models/ResponseStatus';
import { TranslateService } from '@ngx-translate/core';
import { DialogTypes } from '../../../../../@models/common/dialog';
import { DialogService } from '../../../../../shared/services/dialog.service';
import { LibraryDetailsRequestModel } from '../../../../../@models/projectDesigner/template';
import { TemplateService } from '../../../../project-design/services/template.service';
import { LibraryService } from '../../../../project-design/services/library.service';
import { DeliverableService } from '../../../../project-design/services/deliverable.service';
import { SharedAdminService } from '../../../services/shared-admin.service';
import { BlockService } from '../../../services/block.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-block-suggestion-content',
  templateUrl: './block-suggestion-content.component.html',
  styleUrls: ['./block-suggestion-content.component.scss'],
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
export class BlockSuggestionContentComponent implements OnInit, OnChanges, AfterViewInit {

  @Input()
  blockContentPayload;
  private _blockId;
  private _blockName;
  public editable: boolean = true;

  editor: any;
  subscriptions: Subscription = new Subscription();
  currentBlock: string;
  blockBatchSize = 3;
  showLoader: boolean = false;

  //ngx-scrollbar options
  direction = '';
  scrollDistance = 9;
  scrollUpDistance = 2;
  throttle = 500;

  pageSize = 0;
  pageIndex = 1;
  loaderId = 'blockSuggestions';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  editorvalue: string;
  name: string;
  content;
  blockContentList = [];
  blockIds = [];
  flatView = [];
  users: any = [];
  suggestions: any = [];
  loggedInUserDetails: any = {};
  commentThreads: any = [];
  loggedInUser: any = {};

  _id;
  public discardheading: boolean = false;

  constructor(private ngxLoader: NgxUiLoaderService,private toastr: ToastrService, private designerService: DesignerService, private customHTML: CustomHTML, private documentViewService: DocumentViewService,
    private multiRootEditorService: MultiRootEditorService, private _eventService: EventAggregatorService, private translate: TranslateService, private dialogService: DialogService,
    private templateService: TemplateService, private libraryService: LibraryService, private deliverableService: DeliverableService, private blockService: BlockService,
    private changeDetectorRef: ChangeDetectorRef, private sharedAdminService: SharedAdminService) { }

  ngOnInit() {

    this.name = this._blockName;
    
    this.blockContentList = new Array();
    this._id = this._blockId;
    this.sharedAdminService.currentIndex = 0;

    this.users = [];
    this.loggedInUser = this.multiRootEditorService.getLoggedInUserDetails();
    this.users.push(this.loggedInUser);


  }

  @Input()
  set itemId(value: any) { this._blockId = value; }
  get itemId(): any { return this._blockId; }

  @Input()
  set blockName(value: any) { this._blockName = value; }
  get blockName(): any { return this._blockName; }

  ngOnChanges(changes: SimpleChanges) {
    this.changeDetectorRef.detectChanges();
    this._id = changes['itemId'].currentValue;
    this.name = changes['blockName'].currentValue;
    this.getBlockContents(this._id);
  }

  getBlockContents(id) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.blockService.getBlockContent(id).subscribe((response) => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.content = response;
      const data = (response !== null) ? response : '';
      this.editor.setData({ tablTypeHeader: data });
    }, (error) => {
      console.log('Block Content Service Call Error', error);
    });
  }

  ngAfterViewInit() {
    this.setCkEditor();
  }

  setCkEditor() {
    let sourceElement: any = {};
    let instant = this;
    let saveFnc = {
      waitingTime: 5000,
      save(editor) {
        return instant.saveData(1);
      }
    }
    sourceElement = { tablTypeHeader: document.querySelector('#suggestionBlockContentEditor') };
    MultirootEditor.create1(sourceElement, undefined, undefined,this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
        this.editor = newEditor;
        this.editor.setData({ tablTypeHeader: '' });
      })
      .catch(err => {
        console.error(err.stack);
      });
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }



  BlockEditing(event, index) {
    // alert("jkhjk");
    var blockTitle = document.getElementById("titleDiv" + index);
    document.getElementsByClassName("editor-heading")[index].classList.add("myClass");
    this.setTrackChangesComments();
  }
  onBlurMethod(index) {
    document.getElementsByClassName("editor-heading")[index].classList.remove("myClass");
  }


  saveData(autoSave) {
    let editableContent = [];
    let rootNames = this.editor.model.document.getRootNames();
    let suggestionsData: any = [];
    let commentThreadsData: any = [];

    for (const rootName of rootNames) {
      const request = new BlockAttributeRequest();
      let content = this.editor.getData({ rootName: rootName });
      request.content = content == null ? null : this.customHTML.multiRootEditorSetResizedWidth(rootName, content);
      if (this.multiRootEditorService.isTrackChangesEnabled) {
        //region for saving track changes -- starts
        const trackChanges = this.editor.plugins.get('TrackChanges');
        suggestionsData = Array.from(trackChanges.getSuggestions());
        let _trackChangesSuggestion: any = [];
        suggestionsData.forEach(item => {
          item.name = this.loggedInUser.name;
          if (request.content.indexOf(item.id) != -1)
            _trackChangesSuggestion.push(item);
        });
        request.trackChangesSuggestions = _trackChangesSuggestion.length > 0 ? JSON.stringify(_trackChangesSuggestion) : null;
        //region for saving track changes -- edns

        //region for saving comments -- starts
        const comments = this.editor.plugins.get('Comments');
        commentThreadsData = Array.from(comments.getCommentThreads());
        let _commentTreads: any = [];
        commentThreadsData.forEach(item => {
          item.name = this.loggedInUser.name;
          if (request.content.indexOf(item.threadId) != -1)
            _commentTreads.push(item);
        });
        request.commentThreads = _commentTreads.length > 0 ? JSON.stringify(_commentTreads) : null;
        //region for saving comments --ends
      }
      else {
        request.commentThreads = null;
        request.trackChangesSuggestions = null;
      }

      var array = rootName.split("-");
      request.blockId = array[1];

      if (request.content)
        editableContent.push(request);
    }
    this.documentViewService.updateAllBlockData(editableContent)
      .subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          if (!autoSave) {
            this.toastr.success(this.translate.instant('screens.project-designer.document-view.block-update-success-message'));
           
          }
        }
        else {
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      });
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
    let globalRequest = new LibraryDetailsRequestModel()
    globalRequest.librarySections = libSection;
    globalRequest.PageIndex = this.pageIndex;
    globalRequest.PageSize = this.pageSize;

    return globalRequest;
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
            let clickedBlock = document.getElementById('suggestionBlockContentEditor' + idx);
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

      let element = document.getElementById('suggestionBlockContentEditor' + index);
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

        let element = document.getElementById('suggestionBlockContentEditor' + index);
        if (element) {
          let topPos = element.offsetTop;
          document.getElementById('parentDiv').scrollTop = topPos;
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
    }
  }
}
