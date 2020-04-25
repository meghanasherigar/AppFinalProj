import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { LibraryService } from '../../../services/library.service';
import { DesignerService } from '../../../services/designer.service';
import { LibraryBlockDetails, TodoItemFlatNode, TodoItemNode, libraryOptions, blockSelectedModel, BlockSuggestionResponseModel, acceptBlockRequest, rejectBlockRequest, libraryReference, AttributesOptions } from '../../../@models/block-suggestion';
import { RoleService } from '../../../../../shared/services/role.service';
import { NodeDataService } from '../../../services/node-data.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValueConstants } from '../../../../../@models/common/valueconstants';
import { blockSuggestionRequest, manageLibrary } from '../../../../../@models/projectDesigner/library';
import { RequestMethod } from '@angular/http';
import { BlockDetailsResponseViewModel } from '../../../../../@models/projectDesigner/block';
import { EventConstants, eventConstantsEnum } from '../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../shared/services/event/event.service';
import { BlockSuggestionFilterComponent } from './block-suggestion-filter/block-suggestion-filter.component';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'ngx-block-suggestion',
  templateUrl: './block-suggestion.component.html',
  styleUrls: ['./block-suggestion.component.scss'],
  providers: [NodeDataService]
})
export class BlockSuggestionComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  @ViewChild('toolTipRef') public toolTipRef: TemplateRef<any>;
  blockContentPayload: {};
  selectDeselectAllBlocks: boolean;
  [x: string]: any;

  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  flatNodeMap1 = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  checklistSelection = new SelectionModel<TodoItemFlatNode>(true);

  getLevel = (node: TodoItemFlatNode) => node.level;
  isExpandable = (node: TodoItemFlatNode) => node.expandable;
  getChildren = (node: TodoItemNode): TodoItemNode[] => node.blocks;
  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;
  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  libraryOptions: any;
  librarySections: boolean;
  blockId: string;
  blckName: string;
  PageIndex: number = 0;
  PageSize: number = 0;
  selectedLibrary: any;
  libraryBlockDetails = new LibraryBlockDetails();
  blockSelectedModel = new blockSelectedModel();
  hideBlockAttribute: boolean = true;

  constructor(private libraryService: LibraryService, private designerService: DesignerService, private database: NodeDataService, private translate: TranslateService,
    private roleService: RoleService, private readonly _eventService: EventAggregatorService,  private dialogService: NbDialogService) { }

  ngOnInit() {
    this.nodeIndex = 0;
    this.designerService.blockDetails = null;
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener); //List 2
    this.database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;
    });

    const selectedLib: boolean = (this.roleService.getUserRole().isGlobalAdmin) ? true : false;
    this.librarySections = (this.roleService.getUserRole().isGlobalAdmin) ? true : false;
    let libOptions = libraryOptions();
    if (this.roleService.getUserRole().isGlobalAdmin && this.roleService.getUserRole().isCountryAdmin) {
      this.libraryOptions = libOptions;
      this.selectedLibrary = libOptions.find(x => x.isGlobal === true);
    } else {
      this.libraryOptions = libOptions.filter(x => x.isGlobal === selectedLib);
      this.selectedLibrary = libOptions.find(x => x.isGlobal === selectedLib);
    }
    this.designerService.SelectedOption = this.selectedLibrary.name;
    this.suggestedBlocks();
    this.subscriptions.add(this._eventService.getEvent(EventConstants.SendEmail).subscribe((payload :boolean)=> {
      if(payload) {
        if(this.designerService.acceptORreject) { this.acceptedBlocks(); } else { this.rejectedBlocks(); }
      }
    }));

    this.subscriptions.add(
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).subscribe(data => {
        if (data === AttributesOptions.BlockAttributes) {
          this.hideStackAttribute = true;
          this.hideBlockAttribute = !this.hideBlockAttribute;
        } 
      })
    );
    this.subscriptions.add(
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).subscribe((suggestion) => {
        if(suggestion) {
          this.suggestedBlocks();
        }
      })
    );
  }

  suggestedBlocks() {
    let request = this.prepareRequest();
    this.libraryService.getSuggestedBlocks(request).subscribe((response: BlockSuggestionResponseModel[]) => {
      this.designerService.blockDetails = null;
      const blockid = response[0].blockId;
      const blkname = response[0].title;
      this.nodeIndex = 0;
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.checklistSelection.clear();
      var initialData: any;
      initialData = response;
      this.dataSource.data = initialData;

      if (this.designerService.blockDetails != null) {
        if (this.isDocumnetViewDoubleClick) {
          var node = this.treeControl.dataNodes.find(x => x.id == this.designerService.blockDetails.id);
          if (node != undefined) {
            this.checklistSelection.toggle(node);
          }
        }
        else {
          this.checklistSelection.toggle(this.designerService.blockDetails)
        }
      }

      if(!this.designerService.blockDetails) {
        this.designerService.blockDetails = this.treeControl.dataNodes[0];
        this.checklistSelection.toggle(this.treeControl.dataNodes[0]);
      }

      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      initialData = response;
      this.blockId = blockid; 
      this.blckName = blkname; 
      this.dataSource.data = initialData;
      // this.selectedLibrary = payload.library;
      this.designerService.blockList = [];
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.length;
      this.blockSelectedModel.blockSelectCount = this.designerService.blockList.length;
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });

  }


  acceptedBlocks() {
    const blocks = [];
    this.designerService.blockList.forEach(item => {
        blocks.push(item.blockId);
    });
    let request = new acceptBlockRequest();
    const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    request.blockids = blocks;
    request.libraryReference = new libraryReference();
    request.libraryReference.Global = (currentLibrary.Global) ? currentLibrary.Global : false;
    request.libraryReference.isCountryLibrary = (currentLibrary.IsCountryLibrary) ? currentLibrary.IsCountryLibrary : false;
    request.libraryReference.CountryTemplate = false;
    request.libraryReference.GlobalTemplate = false;
    request.libraryReference.countryId = ''
    request.libraryReference.organizationId = '';
    request.libraryReference.userId = '';
    this.libraryService.acceptedBlocks(request).subscribe((response) => {
      if(response) {
        this.suggestedBlocks();
      }
    });

  }

  rejectedBlocks() {
    const blocks = [];
    let request = new rejectBlockRequest();
    this.designerService.blockList.forEach(item => {
      blocks.push(item.blockId);
    });
    request.blockids = blocks;
    this.libraryService.rejectedtedBlocks(request).subscribe((response)=> {
      if(response) {
        this.suggestedBlocks();
      }
    });
  }

  /**
  * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
  */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.title
      ? existingNode
      : new TodoItemFlatNode();

    flatNode.id = node.id;
    flatNode.item = node.title;
    flatNode.blockId = node.blockId;
    flatNode.level = level;
    flatNode.expandable = node.hasChildren;
    flatNode.previousId = node.previousId;
    flatNode.isStack = node.isStack;
    flatNode.isCategory = node.isCategory;
    flatNode.description = node.description;
    flatNode.parentId = node.parentId;
    flatNode.nodeIndex = this.nodeIndex++;
    flatNode.hasChildren = node.hasChildren;
    flatNode.isRemoved = node.isRemoved;
    flatNode.indentation = node.indentation;
    flatNode.usersAssignment = node.usersAssignment;
    // flatNode.expandable = (node.blocks && node.blocks.length > 0);

    flatNode.colorCode = node.colorCode;
    flatNode.blockType = node.blockType;
    flatNode.userName = node.userName;
    flatNode.suggestionDate =  node.suggestionDate;
    flatNode.suggestedUserEmailId = node.suggestedUserEmailId;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.designerService.blockList = [];
    if (this.checklistSelection.isSelected(node))
      this.designerService.blockDetails = node;
    else
      this.designerService.blockDetails = null;
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node) ? this.checklistSelection.select(...descendants) : this.checklistSelection.deselect(...descendants);
    this.todoParentSelection(node);
    this.blockId = ' ';
    this.blockId = node.blockId;
    this.blckName = node.item;

    this.disableCreate = false;
    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
      });
      nodesArray.forEach((ele) => {
        var item = this.flatNodeMap.get(ele);
        this.getSelectedBlocks(item, nodesArray);
      });
      nodesArray.forEach(el => {
        this.designerService.blockList.push(el);
      })

      if (this.designerService.blockDetails == null && nodesArray.length == 1)
        this.designerService.blockDetails = nodesArray[0];

      if (nodesArray.length == 1)
        this.disableCreate = true;
    }
    this.selectedBlock();
    this.suggestionsMenusAccess(node);

  }

  /* Select/Deselect the parent node*/
  todoParentSelection(node: TodoItemFlatNode): void {
    let parentNode = this.database.getParentFromNodes(this.flatNodeMap.get(node), this.dataSource.data);
    if (parentNode != undefined) {
      if (!this.checklistSelection.isSelected(node))
        this.checklistSelection.deselect(this.nestedNodeMap.get(parentNode));
    }
  }

  getSelectedBlocks(item, nodesArray) {
    if (item.blocks !== null && item.hasChildren) {
      item.blocks.forEach((child) => {
        const index = nodesArray.findIndex(n => n.id === child.id);
        nodesArray.splice(index, 1);
        this.getSelectedBlocks(child, nodesArray);
      });
    }
    return nodesArray;
  }

  selectedBlock() {

    this.designerService.blockList.forEach(x => {
      let parentStack = this.getStackId(x);
      if (parentStack != undefined)
        x.stackBlockId = parentStack.blockId;
    })
    this.selectedBlocksStacks = this.designerService.blockList;
    this.blockSelectedModel.blockSelectCount = this.selectedBlocksStacks.length;
    this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.length;
    this.blockSelectedModel.isStack = false;
    this.blockSelectedModel.BlockStackRemoveAllowed = true;
    if (this.selectedBlocksStacks.length > 0) {
      this.selectedBlocksStacks.forEach(element => {
        if (element.isStack == true) {
          this.blockSelectedModel.isStack = true;
        }
        let parentStack = this.treeControl.dataNodes.find(x => x.blockId == element.parentId);
        if (parentStack != undefined && parentStack.isStack && this.flatNodeMap.get(parentStack).blocks.length == 1)
          this.blockSelectedModel.BlockStackRemoveAllowed = false;
      });
      this.blockSelectedModel.previousId = this.selectedBlocksStacks[0].previousId;
      if (this.blockSelectedModel.previousId == undefined)
        this.blockSelectedModel.previousId = ValueConstants.DefaultId;
      this.blockSelectedModel.nodeLevel = this.selectedBlocksStacks[0].level;
      let parentStack = this.treeControl.dataNodes.find(x => x.blockId == this.selectedBlocksStacks[0].parentId);
      this.blockSelectedModel.isParentStack = (parentStack != undefined) ? (parentStack.isStack) ? true : false : false;

    }
  }

  getStackId(node) {
    var parentNode: any;
    var ParentstackId: any;
    for (var i = node.level; i > 0; i--) {
      if (i == node.level)
        parentNode = this.treeControl.dataNodes.find(x => x.blockId == node.parentId || x.id == node.parentId);
      else
        parentNode = this.treeControl.dataNodes.find(x => x.blockId == parentNode.parentId || x.id == parentNode.parentId);
      if (parentNode != undefined && parentNode.isStack) {
        ParentstackId = parentNode;
        break;
      }
    }
    return ParentstackId;
  }

  suggestionsMenusAccess(node: TodoItemFlatNode) {
    let parentNode = this.database.getParentFromNodes(this.flatNodeMap.get(node), this.dataSource.data);
    let BLocks = (!parentNode) ? null : parentNode.blocks;
    // this.designerService.changeAccessMenus(this.Librarymenus);
  }

  libraryChange(item) {
    let libOptions = libraryOptions();
    this.designerService.SelectedOption = libOptions[item.target.selectedIndex].name;
    this.suggestedBlocks();
  }

  filterPopUp() {

    const CreateBlockDialogRef = this.dialogService.open(BlockSuggestionFilterComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
    
  }

  prepareRequest() {
    const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    let request = new manageLibrary();
    request.isGlobal = (currentLibrary.Global) ? currentLibrary.Global : false;
    request.IsCountry = (currentLibrary.IsCountryLibrary) ? currentLibrary.IsCountryLibrary : false;
    request.IsCountryTemplate = false;
    request.IsGlobalTemplate = false;
    request.CategoryId = '';
    return request;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
