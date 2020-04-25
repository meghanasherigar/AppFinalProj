// import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { IconViewService } from '../../../../../services/icon-view.service';
import { DesignerService } from '../../../../../services/designer.service';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../../@models/common/eventConstants';
import { LibraryBlockDetails, LibraryDropdownViewModel, DeleteBlockViewModel, LibraryReferenceViewModel, ProjectDetailsViewModel, manageLibrary, AccessLibraryMenus, LibraryBlockPromoteDemote, BlockDetail, blocksById } from '../../../../../../../@models/projectDesigner/library';
import { LibraryService } from '../../../../../services/library.service';
import { regions } from '../../../../../../../@models/projectDesigner/common';
import { BlockDetailsResponseViewModel, DragDropRequestViewModel, DragDropSection, blockSelectedModel, BlockRequest, BlockStackViewModel, ActionType, ActionOnBlockStack, BlockType, BlockStatus, LibraryOptions } from '../../../../../../../@models/projectDesigner/block';
import { UserAssignmentDataModel, CheckConcurrencyDestinationRequestModel, CheckConcurrencyRequestModel, CheckConcurrencySourceRequestModel, BlockReferenceViewModel, LibraryStackUngroupModel } from '../../../../../../../@models/projectDesigner/stack';
import { Dialog, DialogTypes } from '../../../../../../../@models/common/dialog';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../@models/projectDesigner/template';
import { ConfirmationDialogComponent } from '../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { BlockService } from '../../../../../services/block.service';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { StackService } from '../../../../../services/stack.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { ValueConstants } from '../../../../../../../@models/common/valueconstants';
import { libraryBlocksModel } from '../../../../../../../@models/admin/library';
import { libraryOptions } from '../../../../../@models/block-suggestion';
import { ResponseType } from '../../../../../../../@models/ResponseStatus';
import { ToastrService } from 'ngx-toastr';
import { SubMenus } from '../../../../../../../@models/projectDesigner/designer';
/**
 * Node for to-do item
 */
export class TodoItemNode {
  id: string;
  level: number;
  previousId: string;
  blockId: string;
  parentId: string;
  isStack: boolean;
  isRemoved: boolean;
  title: string;
  description: string;
  blocks: TodoItemNode[];
  hasChildren: boolean;
  indentation: string;
  IsPartOfstack: boolean;
  stackBlockId: string;
  colorCode: string;
  isCategory: boolean;
  usersAssignment: UserAssignmentDataModel[];
  blockType: BlockType;
  blockStatus: BlockStatus;
  uId: string;
  libraryUId: string;
  libraryId: string;
  isLocked: boolean;
  blockUser: UserAssignmentDataModel;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  id: string;
  blockId: string;
  item: string;
  previousId: string;
  level: number;
  expandable: boolean;
  isStack: boolean;
  description: string;
  parentId: string;
  nodeIndex: number;
  hasChildren: boolean;
  isRemoved: boolean;
  indentation: string;
  IsPartOfstack: boolean;
  stackBlockId: string;
  isCategory: boolean;
  usersAssignment: UserAssignmentDataModel[];
  colorCode: string;
  blockType: BlockType;
  blockStatus: BlockStatus;
  uId: string;
  libraryUId: string;
  libraryId: string;
  isReference: boolean;
  isLocked: boolean;
  blockUser: UserAssignmentDataModel;
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase1 {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: TodoItemNode[], level: number): TodoItemNode[] {
    return obj;
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, Fromnode: TodoItemNode, data: any): TodoItemNode {
    if (!parent.blocks) {
      parent.blocks = [];
    }
    const newItem = { id: Fromnode.id, title: Fromnode.title, blockId: Fromnode.blockId, level: Fromnode.level, previousId: Fromnode.previousId, parentId: Fromnode.parentId, isStack: Fromnode.isStack, description: Fromnode.description } as TodoItemNode;
    parent.blocks.push(newItem);
    this.dataChange.next(data);
    return newItem;
  }

  insertItemAbove(node: TodoItemNode, Fromnode: TodoItemNode, data: any): TodoItemNode {
    const parentNode = this.getParentFromNodes(node, data);
    const newItem = { id: Fromnode.id, title: Fromnode.title, blockId: Fromnode.blockId, level: Fromnode.level, previousId: Fromnode.previousId, parentId: Fromnode.parentId, isStack: Fromnode.isStack, description: Fromnode.description } as TodoItemNode;
    if (parentNode != null) {
      parentNode.blocks.splice(parentNode.blocks.indexOf(node), 0, newItem);
    } else {
      data.splice(data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, fromNode: TodoItemNode, data: any): TodoItemNode {
    const parentNode = this.getParentFromNodes(node, data);
    const newItem = { id: fromNode.id, title: fromNode.title, level: fromNode.level, blockId: fromNode.blockId, previousId: fromNode.previousId, parentId: fromNode.parentId, isStack: fromNode.isStack, description: fromNode.description } as TodoItemNode;
    if (parentNode != null) {
      parentNode.blocks.splice(parentNode.blocks.indexOf(node) + 1, 0, newItem);
    } else {
      data.splice(data.findIndex(x => x.id == node.id) + 1, 0, newItem);
    }
    this.dataChange.next(data);
    return newItem;
  }

  getParentFromNodes(node: TodoItemNode, data: any): TodoItemNode {
    for (let i = 0; i < data.length; ++i) {
      const currentRoot = data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode {
    if (currentRoot.blocks && currentRoot.blocks.length > 0) {
      for (let i = 0; i < currentRoot.blocks.length; ++i) {
        const child = currentRoot.blocks[i];
        if (JSON.stringify(child) === JSON.stringify(node)) {
          return currentRoot;
        } else if (child.blocks && child.blocks.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  updateItem(node: TodoItemNode, newDataNode: BlockRequest) {

    if (this.data.find(el => el.id == node.id) != undefined)
      this.data.find(el => el.id == node.id).previousId = newDataNode.previousId
    else
      this.data.forEach(element => {
        if (element.blocks.length > 0)
          element.blocks.find(x => x.id == node.id).previousId = newDataNode.previousId;
      });
    this.dataChange.next(this.data);
  }

  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: TodoItemNode, to: TodoItemNode, data: any): TodoItemNode {
    const newItem = this.insertItem(to, from, data);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem, data);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode, data: any): TodoItemNode {
    const newItem = this.insertItemAbove(to, from, data);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem, data);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode, data: any): TodoItemNode {
    const newItem = this.insertItemBelow(to, from, data);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem, data);
      });
    }
    return newItem;
  }

  deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.blocks && node.blocks.length > 0) {
          this.deleteNode(node.blocks, nodeToDelete);
        }
      });
    }
  }
}


@Component({
  selector: 'ngx-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  providers: [ChecklistDatabase1]
})
export class ContentComponent implements OnInit, OnDestroy {

  selectDeselectAllBlocks: boolean;
  [x: string]: any;
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  subscriptions: Subscription = new Subscription();

  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  flatNodeMap1 = new Map<TodoItemFlatNode, TodoItemNode>();
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  //List2

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  dragNode: any;
  dragNodes = [];
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;
  selectedLibrary: LibraryDropdownViewModel;
  isEnableAttribute: boolean;
  blockExpandData: any;
  selectedTemplate: TemplateViewModel;
  nodeIndex: number = 0;
  blockRequestModel: BlockStackViewModel;
  disablePaste: boolean = false;
  selectedBlocksStacks: any = [];
  blockSelectedModel = new blockSelectedModel();
  DeleteBlockViewModel: DeleteBlockViewModel = new DeleteBlockViewModel();
  selectedBlockListId: any = [];
  isDocumnetViewDoubleClick: boolean;
  disableCreate: boolean = false;
  blockViewType: string;
  private dialogTemplate: Dialog;

  //ngx-ui-loader configuration
  loaderId = 'manageLibraryLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  Librarymenus = new AccessLibraryMenus();

  constructor(private database: ChecklistDatabase1, private service: IconViewService,
    private ngxLoader: NgxUiLoaderService,
    private designerService: DesignerService,
    private stackService: StackService,
    private blockService: BlockService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private DialogService: DialogService,
    private readonly _eventService: EventAggregatorService, private libraryService: LibraryService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener); //List 2
    database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    this.nodeIndex = 0;
    this.designerService.blockDetails = null;
    this.designerService.currentDoubleClicked.subscribe(isDoubleClicked => this.isDocumnetViewDoubleClick = isDoubleClicked);
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    var initialData: any;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockView).subscribe((selectedViewType: any) => {
      this.blockViewType = selectedViewType.value;
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).subscribe((payload: LibraryBlockDetails) => {
      this.designerService.blockDetails = null;
      this.nodeIndex = 0;
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.checklistSelection.clear();
      var initialData: any;
      initialData = payload.blocks;
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

      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      initialData = payload.blocks;
      this.dataSource.data = initialData;
      this.selectedLibrary = payload.library;
      this.designerService.blockList = [];
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.length;
      this.blockSelectedModel.blockSelectCount = this.designerService.blockList.length;
      if (this.designerService.SelectedOption === LibraryOptions.OECDtemplates || this.designerService.SelectedOption === LibraryOptions.Countrytemplates) {
        this.expandStackNodes();
      } else {
        this.expandCategoryNodes();
      }
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.ManageLibrarySection).subscribe((payload: any) => {
      if (payload === ActionOnBlockStack.delete) {
        this.deleteblock();
      } else if (payload === ActionOnBlockStack.promote) {
        this.promoteDemoteBlock(1);
      } else if (payload === ActionOnBlockStack.demote) {
        this.promoteDemoteBlock(2);
      } else if (payload === ActionOnBlockStack.unGroupLibrary) {
        this.unGroupStack();
      } else {
        this.disablePaste = payload;
      }
    }));


  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.blocks;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

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
    flatNode.uId = node.uId;
    flatNode.libraryId = node.libraryId;
    flatNode.libraryUId = node.libraryUId;
    flatNode.blockType = node.blockType;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  buildFileTree(obj: object, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.title = value["title"];
      node.id = value["id"];

      if (value != null) {
        if (typeof value === 'object') {
          node.blocks = this.buildFileTree(value["blocks"], level + 1);
        } else {
          node.blocks = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  expandBlock(node: TodoItemFlatNode) {
    // this.nodeIndex = 0;
    const managelibrary = new manageLibrary();
    if (!this.treeControl.isExpanded(node) && node.isCategory) {
      this.removeExpandedCategory(node);
    }
    if (!this.treeControl.isExpanded(node) && node.isStack) {
      this.removeExpandedStacks(node);
    }
    if (this.treeControl.isExpanded(node) && (node.level == 0 || node.level == 1)) {
      this.nodeIndex = 0;
      var isStack: string = node.isStack.toString();
      const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
      if ((currentLibrary.CountryTemplate || currentLibrary.GlobalTemplate) && node.hasChildren && !node.isStack) {
        const request = new blocksById();
        request.blockId = node.id;
        request.isStack = node.isStack;
        request.isGlobalTemplate = (currentLibrary.GlobalTemplate) ? currentLibrary.GlobalTemplate : false;
        request.isCountryTemplate = (currentLibrary.CountryTemplate) ? currentLibrary.CountryTemplate : false;
        this.libraryService.libraryBlocksById(request).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.blockExpandData = data;
          let flatnode = this.flatNodeMap.get(node);
          flatnode.blocks = this.blockExpandData;
          this.dataSource.data = this.dataSource.data;
        })
      } else if (isStack == "true") {
        this.saveExpandedStacks(node);
        this.libraryService.getBlocks(node.blockId).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.blockExpandData = data;
          let flatnode = this.flatNodeMap.get(node);
          flatnode.blocks = this.blockExpandData;
          this.dataSource.data = this.dataSource.data;
          this.todoItemSelectionToggle(node);
        });
      } else if (node.isCategory) {
        this.saveExpandedCategory(node);
        const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
        managelibrary.isGlobal = (currentLibrary.Global) ? currentLibrary.Global : false;
        managelibrary.IsCountry = (currentLibrary.IsCountryLibrary) ? currentLibrary.IsCountryLibrary : false;
        managelibrary.IsGlobalTemplate = (currentLibrary.GlobalTemplate) ? currentLibrary.GlobalTemplate : false;
        managelibrary.IsCountryTemplate = (currentLibrary.CountryTemplate) ? currentLibrary.CountryTemplate : false;
        managelibrary.CategoryId = node.blockId;
        this.libraryService.getLibraries(managelibrary).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.blockExpandData = data;
          let flatnode = this.flatNodeMap.get(node);
          flatnode.blocks = this.blockExpandData;
          this.dataSource.data = this.dataSource.data;
          this.expandStackNodes();
        });
      } else {
        this.libraryService.getBlocks(node.blockId).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.blockExpandData = data;
          let flatnode = this.flatNodeMap.get(node);
          flatnode.blocks = this.blockExpandData;
          this.dataSource.data = this.dataSource.data;
          this.todoItemSelectionToggle(node);
        });
      }
    }
  }

  expandCategoryNodes() {
    let libraryData= this.designerService.getLibrarySectionOption(this.designerService.SelectedOption);
    let categoryList = libraryData.expandedCategories;
    if (categoryList && categoryList.length > 0) {
      categoryList.forEach(block => {
        let categoryNode = this.treeControl.dataNodes.find(x => x.blockId === block.blockId);
        if (categoryNode && !this.treeControl.isExpanded(categoryNode)) {
          this.treeControl.expand(categoryNode);
          this.expandBlock(categoryNode);
        }
      });
    }

  }

  expandStackNodes() {
    let libraryData= this.designerService.getLibrarySectionOption(this.designerService.SelectedOption);
    let stackList = libraryData.expandedStacks; 
    if (stackList && stackList.length > 0) {
      stackList.forEach(block => {
        let stackNode = this.treeControl.dataNodes.find(x => x.blockId === block.blockId);
        if (stackNode && !this.treeControl.isExpanded(stackNode)) {
          this.treeControl.expand(stackNode);
          this.expandBlock(stackNode);
        }
      });
    }
  }


  saveExpandedCategory(node) {
    let libraryData= this.designerService.getLibrarySectionOption(this.designerService.SelectedOption);
    const expandedNodes = libraryData.expandedCategories;
    if (expandedNodes.length > 0) {
      const findNode = expandedNodes.find(item => item.blockId === node.blockId);
      if (!findNode) {
        expandedNodes.push(node);
      }
    } else {
      expandedNodes.push(node);
    }
  }

  saveExpandedStacks(node) {
    let libraryData= this.designerService.getLibrarySectionOption(this.designerService.SelectedOption);
    const expandedStackNodes = libraryData.expandedStacks;
    if (expandedStackNodes.length > 0) {
      const findNode = expandedStackNodes.find(item => item.blockId === node.blockId);
      if (!findNode) {
        expandedStackNodes.push(node);
      }
    } else {
      expandedStackNodes.push(node);
    }
  }

  removeExpandedCategory(node) {
    let libraryData= this.designerService.getLibrarySectionOption(this.designerService.SelectedOption);
    const expandedNodes = libraryData.expandedCategories;
    if (expandedNodes.length > 0) {
      const index = expandedNodes.findIndex(item => item.blockId === node.blockId);
      if (index !== -1) {
        expandedNodes.splice(index, 1)
      }
    }
    libraryData.expandedCategories = expandedNodes;
  }

  removeExpandedStacks(node) {
    let libraryData= this.designerService.getLibrarySectionOption(this.designerService.SelectedOption);
    const expandedStackNodes = libraryData.expandedStacks;
    if (expandedStackNodes.length > 0) {
      const index = expandedStackNodes.findIndex(item => item.blockId === node.blockId);
      if (index !== -1) {
        expandedStackNodes.splice(index, 1)
      }
    } else {
      expandedStackNodes.push(node);
    }
    libraryData.expandedStacks = expandedStackNodes;
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

  getLibraryStackId(node, flatNodeMap) {
    var parentNode: any;
    var ParentstackId: any;
    for (var i = node.level; i > 0; i--) {
      if (i == node.level) {
        flatNodeMap.forEach(element => {
          if (element.id == node.parentId || element.blockId == node.parentId) {
            parentNode = element;
            return;
          }
        });
      }
      else {
        flatNodeMap.forEach(element => {
          if (element.id == parentNode.parentId || element.blockId == parentNode.parentId) {
            parentNode = element;
            return;
          }
        });
      }
      if (parentNode != undefined && parentNode.isStack) {
        ParentstackId = parentNode;
        break;
      }
    }
    return ParentstackId;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {

    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.designerService.blockList = [];
    if (this.checklistSelection.isSelected(node))
      this.designerService.blockDetails = node;
    else
      this.designerService.blockDetails = null;
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
    this.todoParentSelection(node);

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
    this.LibraryMenuAccess(node);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.updateHeader).publish(undefined);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.library);
    let payload: boolean = false;
    if (this.designerService.blockList.length == 1 && !this.designerService.blockDetails.isStack && !this.designerService.blockDetails.isCategory)
      payload = true;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.adminAction).publish(payload);

    this._eventService.getEvent(eventConstantsEnum.adminModule.insert.pageBreak).publish(undefined);
    if (this.designerService.selectedAdminDocTab == SubMenus.Insert) {
      this._eventService.getEvent(eventConstantsEnum.adminModule.insert.selectBlock_pagebreak).publish(this.designerService.blockDetails);
    }
  }

  LibraryMenuAccess(node: TodoItemFlatNode) {
    let parentNode = this.database.getParentFromNodes(this.flatNodeMap.get(node), this.dataSource.data);
    let BLocks = (!parentNode) ? null : parentNode.blocks;
    if (!this.designerService.blockDetails || this.designerService.blockDetails.isCategory) {
      this.Librarymenus.copy = false;
      this.Librarymenus.createStack = false;
      this.Librarymenus.ungroup = false;
      this.Librarymenus.remove = false;
      this.Librarymenus.attribute = false;
    } else {
      if (!this.designerService.blockDetails.isCategory) {
        if(parentNode && parentNode.isStack) {
          const selectedNode = parentNode.blocks.find(x => x.blockId === node.blockId && x.level === 0);
          if(selectedNode) {
            this.designerService.blockDetails.IsPartOfstack = true;  
          } else {
            this.designerService.blockDetails.IsPartOfstack = false;
          }
        } else {
          this.designerService.blockDetails.IsPartOfstack = false;
        }
        this.Librarymenus.copy = (this.designerService.blockList.length >= 1 && this.BlockCategories(this.designerService.blockList[0], this.designerService.blockDetails.blockId, BLocks) === true) ? true : false;
        this.Librarymenus.createStack = (!this.designerService.blockDetails.isStack && this.designerService.blockList.length >= 2 && this.BlockCategories(this.designerService.blockList[0], this.designerService.blockDetails.blockId, BLocks) === true) ? true : false;
        this.Librarymenus.ungroup = (this.designerService.blockDetails.isStack) ? true : false;
        this.Librarymenus.remove = (this.designerService.blockList.length >= 1) ? true : false;
        this.Librarymenus.attribute = (!this.designerService.blockDetails.isStack || this.designerService.blockDetails.isStack) ? true : false;
      }
    }
    this.designerService.changeAccessMenus(this.Librarymenus);
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
    if (item.blocks != null && item.hasChildren) {
      item.blocks.forEach((child) => {
        const index = nodesArray.findIndex(n => n.id === child.id);
        nodesArray.splice(index, 1);
        this.getSelectedBlocks(child, nodesArray);
      });
    }
    return nodesArray;
  }

  BlockCategories(PrevBlock, BlockId, Blocks): boolean {
    if (this.designerService.SelectedOption === LibraryOptions.OECDtemplates || this.designerService.SelectedOption === LibraryOptions.Countrytemplates) {
      return true;
    }
    if (PrevBlock.blockId) {
      const PartOfCategoryBlocks = Blocks.find(elements => PrevBlock.blockId === elements.blockId);
      const PartOfCategory = Blocks.find(elements => BlockId === elements.blockId);
      if (PartOfCategory && PartOfCategoryBlocks) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  selectAllBlocks() {
    if (this.checklistSelection["_selection"].size > 0 && this.checklistSelection["_selection"].size != this.treeControl.dataNodes.length)
      this.checklistSelection.clear();
    this.dataSource.data.forEach(x => {
      this.checklistSelection.toggle(this.nestedNodeMap.get(x));
      this.todoItemSelectionToggle(this.nestedNodeMap.get(x));
    })
    //this.designerService.blockList = this.checklistSelection["_selection"];
  }

  loadData(payload: TemplateAndBlockDetails) {
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.checklistSelection.clear();
    var initialData: any;
    initialData = payload.blocks;
    if (initialData) this.dataSource.data = initialData;
    this.designerService.templateDetails = this.selectedTemplate = payload.template;
    this.deliverablesInput.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
    this.deliverablesInput.templateId = this.selectedTemplate.templateId;
  }


  unGroupStack() {
    if (this.selectedBlocksStacks.length == 1) {
      let selectedStackArr: TodoItemNode[] = new Array();
      this.checklistSelection["_selection"].forEach(element => {
        selectedStackArr.push(element);
      });

      let selectedStack = selectedStackArr[0];
      const stackToUngroup = new LibraryStackUngroupModel();
      stackToUngroup.deliverableId = null;
      stackToUngroup.templateId = null;
      //stackToUngroup.previousId = selectedStack.previousId;
      stackToUngroup.stackId = selectedStack.blockId;
      stackToUngroup.stackrefrenceId = selectedStack.id;
      const libraryOptions = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
      stackToUngroup.IsGlobal = (libraryOptions.Global) ? libraryOptions.Global : false;
      stackToUngroup.IsGlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
      stackToUngroup.IsCountry = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
      stackToUngroup.IsCountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;

      this.stackService.StackUngroup(stackToUngroup).subscribe((response: any) => {
        if (response) {
          this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.Ungroup'));
           this.selectedBlocksStacks = [];
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
        } else {
          this.DialogService.Open(DialogTypes.Error, this.translate.instant('screens.user.AdminView.Library.SuccessMessages.UngroupError'));
        }
        this.service.selectedNodes = [];
        this.designerService.blockList = [];
        this.checklistSelection.clear();
        this.designerService.DisableMenus();
      });

    }

  }

  deleteblock() {

    this.designerService.blockList.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack) {
        x.stackBlockId = parentStack.blockId;
        x.IsPartOfstack = true;
      }
    });
    this.DeleteBlockViewModel.blockDetails = this.designerService.blockList;
    this.DeleteBlockViewModel.libraryReferenceModel = new LibraryReferenceViewModel();
    this.DeleteBlockViewModel.libraryReferenceModel.template = this.designerService.templateDetails;
    this.DeleteBlockViewModel.libraryReferenceModel.country = null;
    this.DeleteBlockViewModel.libraryReferenceModel.deliverable = null;
    const libraryOptions = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    this.DeleteBlockViewModel.libraryReferenceModel.Global = (libraryOptions.Global) ? libraryOptions.Global : false;
    this.DeleteBlockViewModel.libraryReferenceModel.GlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
    this.DeleteBlockViewModel.libraryReferenceModel.IsCountryLibrary = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
    this.DeleteBlockViewModel.libraryReferenceModel.CountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;
    this.DeleteBlockViewModel.libraryReferenceModel.organization = null;
    this.DeleteBlockViewModel.libraryReferenceModel.project = null;

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.user.AdminView.Library.SuccessMessages.DeleteConfirmation');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.blockService.deleteBlocks(this.DeleteBlockViewModel).subscribe((response) => {
          if (response) {
            this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockDeleted'));
             //Block(s) were deleted, now reload the Library section
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
          } else {
            this.DialogService.Open(DialogTypes.Error, this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockDeleteError'));
          }
          this.service.selectedNodes = [];
          this.designerService.blockList = [];
          this.checklistSelection.clear();
          this.designerService.DisableMenus();
        },
          error => {
            this.DialogService.Open(DialogTypes.Warning, error.message);
          });
        dialogRef.close();
      }
    });
  }

  promoteDemoteBlock(action) {

    if (this.selectedBlocksStacks.length > 0) {
      let blockDemote = new LibraryBlockPromoteDemote();
      if ((action == 2 && !this.selectedBlocksStacks[0].isStack && this.selectedBlocksStacks[0].previousId != ValueConstants.DefaultId)
        || (action == 1 && !this.selectedBlocksStacks[0].isStack && this.selectedBlocksStacks[0].level > 0)) {
        const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
        blockDemote.projectId = ValueConstants.DefaultId;
        blockDemote.IsCountryTemplate = (currentLibrary.CountryTemplate) ? true : false;
        blockDemote.IsOECDTemplate = (currentLibrary.GlobalTemplate) ? true : false;
        this.selectedBlocksStacks.forEach(selectedStackArr => {
          let blockDetail = new BlockDetail();
          blockDetail.blockIndex = selectedStackArr.nodeIndex;
          let parentBlock = this.treeControl.dataNodes.find(el => el.id == selectedStackArr.parentId || el.blockId == selectedStackArr.parentId);
          blockDetail.parentId = (parentBlock != undefined) ? parentBlock.id : ValueConstants.DefaultId;
          let previousBlock = this.treeControl.dataNodes.find(el => el.id == selectedStackArr.previousId);
          blockDetail.previousId = (previousBlock != undefined) ? previousBlock.id : ValueConstants.DefaultId;
          blockDetail.blockRefernceId = selectedStackArr.id;
          blockDetail.isStack = selectedStackArr.isStack;
          let parentStack = this.getStackId(selectedStackArr);
          blockDetail.stackUid = parentStack ? parentStack.uId : undefined;
          blockDetail.stackId = (parentStack != undefined) ? parentStack.blockId : (selectedStackArr.isStack) ? selectedStackArr.blockId : ValueConstants.DefaultId;
          blockDemote.BlockDetail.push(blockDetail);
        });

        this.blockService.promoteDemoteLibraryBlock(blockDemote, action).subscribe((res) => {
          if(res.status === 200) {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
          } 
          this.service.selectedNodes = [];
          this.designerService.blockList = [];
          this.designerService.blockDetails = null;
          this.checklistSelection.clear();
          this.designerService.DisableMenus();
        });
      }
    }
  }


  doubleClick(node) {
    let payload: any;
    payload = {};
    payload.section = "Template";
    this.designerService.blockDetails = node;
    var nodesArray: TodoItemFlatNode[];
    nodesArray = [];
    this.checklistSelection["_selection"].forEach(element => {
      nodesArray.push(element);
    });

    this.designerService.changeIsDoubleClicked(true);
    this.navigateToEditor();
  }

  copySelectedItems() {
    this.designerService.isCopied = true;
    this._eventService.getEvent(EventConstants.TemplateSection).publish(this.designerService.isCopied);
  }

  copyToLibrary() {
    this.selectedBlockListId = [];
    this.selectedBlocksStacks = this.designerService.blockList;

    this.selectedBlocksStacks.forEach(element => {
      this.selectedBlockListId.push(element.blockId);
    })
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.AddtoUserLibrary;
    this.dialogTemplate.Message = "The Selected Stack(s)/Block(s) will be added to your user library. Do you wish to continue?";

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blockService.copyToLibrary(this.selectedBlockListId).subscribe(response => {
          if (response.status === 1) {
            this.toastr.success(this.translate.instant('Copied to user library successfully'));
          }
          else {
            this.DialogService.Open(DialogTypes.Error, "Error Occured");
          }
        })
      }
    })
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

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    //
    this.isEnableAttribute = false;
    let payload = this.isEnableAttribute;
    this._eventService.getEvent(EventConstants.TemplateSection).publish(payload);

    //
    const parentNode = this.flatNodeMap.get(node);
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemNode, newDataNode: BlockRequest) {
    this.database.updateItem(node, newDataNode);
  }

  handleDragStart(event, node) {

    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
      });
      nodesArray.forEach((ele) => {
        var item = this.flatNodeMap.get(ele);
        if (item.blocks != null) {
          item.blocks.forEach((child) => {
            const index = nodesArray.findIndex(n => n.item === child.title);
            nodesArray.splice(index, 1);
            if (child.blocks != null) {
              child.blocks.forEach(ch => {
                const index = nodesArray.findIndex(n => n.item === ch.title);
                nodesArray.splice(index, 1);
                if (ch.blocks != null) {
                  ch.blocks.forEach(c => {
                    const index = nodesArray.findIndex(n => n.item === c.title);
                    nodesArray.splice(index, 1);
                  });
                }
              });
            }
          });
        }
      })
      this.dragNodes = nodesArray;
      this.service.dragNodes = this.dragNodes;
    }
    else {
      this.dragNode = node;
      this.service.dragNode = node;
    }
    this.service.source = DragDropSection.Library;
    this.service.flatNodeMap = this.flatNodeMap;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    event.preventDefault();
    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          // this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    const percentageX = event.offsetX / event.target.clientWidth;
    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.30) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  prepareConcurrencyDestinationRequestModel(node, concurrencySource: CheckConcurrencyDestinationRequestModel) {
    var blockList: any = [];
    blockList.push(node);
    if (this.dragNodeExpandOverArea == "above") {
      var previousNode = this.treeControl.dataNodes.find(x => x.id == node.previousId);
      blockList.push(previousNode);
    }
    else if (this.dragNodeExpandOverArea == "below") {
      var nextNode = this.treeControl.dataNodes.find(x => x.previousId == node.id);
      blockList.push(nextNode);
    }
    concurrencySource.destinationBlocks = blockList;
  }
  prepareConcurrencySourceRequestModel(blockList) {
    blockList.push(this.dragNode);
    var previousNode = this.treeControl.dataNodes.find(x => x.id == this.dragNode.previousId);
    blockList.push(previousNode);
    var nextNode = this.treeControl.dataNodes.find(x => x.previousId == this.dragNode.id);
    blockList.push(nextNode);
  }

  handleDragLeave() {
    this.dragNodeExpandOverArea = null;
  }

  handleDrop(event, node) {
    event.preventDefault();
    //Check Concurrency 
    var concurrencyRequest = new CheckConcurrencyRequestModel();
    var concurrencyDestination = new CheckConcurrencyDestinationRequestModel();
    var concurrencySource = new CheckConcurrencySourceRequestModel();
    var blockList: BlockReferenceViewModel[] = new Array();
    var dragDropRequestModel = new DragDropRequestViewModel();
    dragDropRequestModel.dragDropList = new Array();
    if (this.dragNodes.length > 0) {
      this.dragNodes.forEach((element, index) => {
        this.dragNode = element;
        this.prepareConcurrencySourceRequestModel(blockList);
        if (node !== this.dragNode) {
          var nextNode: any;
          var nextNodeOfDragNode: any;
          let newItem: TodoItemNode;
          if (this.dragNodeExpandOverArea === 'above') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
            newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
            this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Library);
          } else if (this.dragNodeExpandOverArea === 'below') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
            nextNodeOfDragNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
            if (index == 0)
              newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
            else {
              newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(this.dragNodes[index - 1]), this.dataSource.data);
            }
            this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Library);
          } else {
          }
        }
      });
      concurrencySource.sourceBlocks = blockList;
      this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
    }

    else if (this.service.dragNodes != null && this.service.dragNodes.length > 0) {
      this.service.dragNodes.forEach((element, index) => {
        this.service.dragNode = element;
        this.dragNode = element;
        this.prepareConcurrencySourceRequestModel(blockList);
        if (node !== this.dragNode) {
          var nextNode: any;
          let newItem: TodoItemNode;
          if (this.dragNodeExpandOverArea === 'above') {
            nextNode = this.treeControl.dataNodes.find(el => el.id == node.previousId);
            newItem = this.database.copyPasteItemAbove(this.service.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Library);
          } else if (this.dragNodeExpandOverArea === 'below') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
            if (index == 0)
              newItem = this.database.copyPasteItemBelow(this.service.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
            else
              newItem = this.database.copyPasteItemBelow(this.service.flatNodeMap.get(this.dragNode), this.service.flatNodeMap.get(this.service.dragNodes[index - 1]), this.dataSource.data);
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Library);
          } else {
            return;
          }

        }
        this.dragNode = null;
      });
      this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
    }
    else if (this.dragNode != null) {
      this.prepareConcurrencySourceRequestModel(blockList);
      if (node !== this.dragNode) {
        var nextNode: any;
        var nextNodeOfDragNode: any;
        let newItem: TodoItemNode;
        if (this.dragNodeExpandOverArea === 'above') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
          newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
          this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Library);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          nextNodeOfDragNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
          newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
          this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Library);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else {
          return;
        }

      }
    }
    else if (this.service.dragNode != null) {
      this.dragNode = this.service.dragNode;
      this.prepareConcurrencySourceRequestModel(blockList);
      if (node !== this.service.dragNode) {
        var nextNode: any;
        let newItem: TodoItemNode;
        if (this.dragNodeExpandOverArea === 'above') {
          nextNode = this.treeControl.dataNodes.find(el => el.id == node.previousId);
          newItem = this.database.copyPasteItemAbove(this.service.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Library);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          newItem = this.database.copyPasteItemBelow(this.service.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Library);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else {
          return;
        }
      }
    }

  }

  private PrepareConcurrencyRequest(concurrencyDestination: CheckConcurrencyDestinationRequestModel, node: any, concurrencySource: CheckConcurrencySourceRequestModel) {
    concurrencyDestination.section = DragDropSection.Library.toString();
    concurrencyDestination.sectionId = this.selectedTemplate.templateId;
    this.prepareConcurrencyDestinationRequestModel(node, concurrencyDestination);
    concurrencySource.section = this.service.source.toString();
    if (this.service.source == 1)
      concurrencySource.section = this.selectedTemplate.templateId;
  }

  private SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource) {

    this.service.saveDragDrop(dragDropRequestModel).subscribe(data => {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
    });
    this.service.dragNode = null;
    this.service.dragNodes = [];
    this.service.flatNodeMap = null;
    this.dragNode = null;
    this.dragNodes = [];
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.checklistSelection.clear();
    this.designerService.blockList = [];
    this.selectedBlocksStacks = [];
  }

  private getDragDropRequestModel(newItem: TodoItemNode, dragDropRequestModel: DragDropRequestViewModel, node: any, nextNode: any, nextNodeOfDragNode: any, source: any, destination: any) {
    this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
    dragDropRequestModel.source = source; //make this code as one time call
    dragDropRequestModel.destination = destination; //make this code to execute once

    var libraryReferenceModel = new LibraryReferenceViewModel(); //make this code to execute once
    libraryReferenceModel.template = this.selectedTemplate;
    if (this.projectDetails != null) {
      libraryReferenceModel.project = new ProjectDetailsViewModel();
      libraryReferenceModel.project.projectId = this.projectDetails.projectId;
      libraryReferenceModel.project.projectName = this.projectDetails.projectName;
      libraryReferenceModel.project.projectYear = this.projectDetails.fiscalYear;
    }
    dragDropRequestModel.libraryReference = libraryReferenceModel;
    if (dragDropRequestModel.source == 1 && dragDropRequestModel.destination == 1)
      dragDropRequestModel.action = this.GetActionType(dragDropRequestModel, this.dragNode, node, this.flatNodeMap);
    else
      dragDropRequestModel.action = this.GetActionType(dragDropRequestModel, this.dragNode, node, this.service.flatNodeMap);

    this.treeControl.dataNodes.find(x => x.id == this.dragNode.id).parentId = node.parentId;
    if (dragDropRequestModel.source == 0 && dragDropRequestModel.destination == 0) {
      this.dragNode.blockOrigin = this.dragNode.parentId;
      this.GetDragDropRequestModel(dragDropRequestModel, this.dragNode, this.flatNodeMap, false, false);
      if (dragDropRequestModel.action != ActionType.DragBlockToStack && dragDropRequestModel.action != ActionType.DragBlockOutOfStack
        && dragDropRequestModel.action != ActionType.DragBlockStackToStack) {
        this.GetDragDropRequestModel(dragDropRequestModel, node, this.flatNodeMap, false, false);
        if (nextNode != undefined) {
          this.GetDragDropRequestModel(dragDropRequestModel, nextNode, this.flatNodeMap, false, false);
        }
        if (nextNodeOfDragNode != undefined) {
          this.GetDragDropRequestModel(dragDropRequestModel, nextNodeOfDragNode, this.flatNodeMap, false, false);
        }
      }
    }
    else if (dragDropRequestModel.source == 0 && dragDropRequestModel.destination == 1) {
      this.dragNode.blockOrigin = this.dragNode.blockId;
      this.GetDragDropRequestModel(dragDropRequestModel, this.dragNode, this.service.flatNodeMap, true, true);
      if (dragDropRequestModel.action != ActionType.DragBlockToStack && dragDropRequestModel.action != ActionType.DragBlockOutOfStack
        && dragDropRequestModel.action != ActionType.DragBlockStackToStack) {
        if (this.dragNodeExpandOverArea === 'above')
          this.GetDragDropRequestModel(dragDropRequestModel, node, this.flatNodeMap, false, false);
        if (nextNode != undefined && this.dragNodeExpandOverArea === 'below') {
          this.GetDragDropRequestModel(dragDropRequestModel, nextNode, this.flatNodeMap, false, false);
        }
      }
    }
  }

  private GetActionType(dragDropRequestModel: DragDropRequestViewModel, currentNode, node, flatNodeMap) {
    var destinationStack = this.getStackId(node);
    if (destinationStack != undefined) {
      dragDropRequestModel.DestinationStackId = destinationStack.blockId;
      dragDropRequestModel.DestinationStackUId = destinationStack.uId;
    }
    var sourceStack = this.getStackId(currentNode);
    if (sourceStack != undefined) {
      dragDropRequestModel.SourceStackId = sourceStack.blockId;
      dragDropRequestModel.SourceStackUId = sourceStack.uId;
    }

    if (currentNode.parentId == node.parentId) {
      if (destinationStack != undefined && destinationStack.isStack && sourceStack != undefined && sourceStack.isStack)
        dragDropRequestModel.reorderWithinStack = true;
    }
    if (currentNode.parentId != node.parentId) {
      if (sourceStack != undefined && sourceStack.isStack) {

        if (destinationStack != undefined && destinationStack.isStack)
          return ActionType.DragBlockStackToStack;
        else {
          return ActionType.DragBlockOutOfStack;
        }
      }
      else {
        if (destinationStack != undefined && destinationStack.isStack)
          return ActionType.DragBlockToStack;
      }
    }
    else
      return ActionType.DragBlock;

  }

  private GetDragDropRequestModel(dragDropRequestModel: DragDropRequestViewModel, node: any, flatNodeMap: any, isCopy: any, isNew: any) {
    let obj = this.getSaveModel(node, flatNodeMap);
    obj.isStack = node.isStack;
    obj.isCopy = isCopy;
    obj.isNew = isNew;
    obj.blockOrigin = node.blockOrigin;
    obj.hasChildren = node.hasChildren;
    const currentLibrary = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    let libraryReferenceModel = new LibraryReferenceViewModel();
    libraryReferenceModel.template = this.selectedTemplate;
    libraryReferenceModel.Global = (currentLibrary.Global) ? currentLibrary.Global : false;
    libraryReferenceModel.IsCountryLibrary = (currentLibrary.IsCountryLibrary) ? currentLibrary.IsCountryLibrary : false;
    libraryReferenceModel.GlobalTemplate = (currentLibrary.GlobalTemplate) ? currentLibrary.GlobalTemplate : false;
    libraryReferenceModel.CountryTemplate = (currentLibrary.CountryTemplate) ? currentLibrary.CountryTemplate : false;
    obj.libraryReference = libraryReferenceModel;
    //  this.saveNode(flatNodeMap.get(node), obj);
    var indexExistNod = dragDropRequestModel.dragDropList.findIndex(el => el.id == obj.id);
    if (indexExistNod > -1)
      dragDropRequestModel.dragDropList.splice(indexExistNod, 1);
    dragDropRequestModel.dragDropList.push(obj);
    dragDropRequestModel.libraryReference = obj.libraryReference;
    return dragDropRequestModel;
  }

  private getDragDropLibraryBlock(dragDropRequestModel: DragDropRequestViewModel, node: any, flatNodeMap: any) {
    var node = flatNodeMap.get(node);
    var obj = new BlockRequest();
    obj.isStack = node.isStack;
    obj.isCopy = true;
    obj.blockOrigin = node.blockId;
    dragDropRequestModel.dragDropList.push(obj);
    return dragDropRequestModel;
  }

  private getSaveModel(node, flatNodeMap) {
    var index = this.treeControl.dataNodes.findIndex(record => record.id === node.id)
    var nodeData = this.treeControl.dataNodes[index];
    var obj = new BlockRequest();
    obj.id = nodeData.id;
    obj.blockId = nodeData.blockId;
    var previousNode: any;
    if (index > 0) {
      for (var k = index - 1; k > -1; k--) {
        previousNode = this.treeControl.dataNodes[k];
        if (previousNode.level == nodeData.level) {
          obj.previousId = previousNode.id;
          break;
        }
        else
          obj.previousId = '000000000000000000000000';
      }
    }
    else
      obj.previousId = '000000000000000000000000';
    obj.parentId = nodeData.parentId;
    return obj;
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.service.dragNode = null;
    this.service.dragNodes = [];
    this.dragNodes = [];
    this.checklistSelection.clear();
  }

  pasteStackOrBlock(node) {
    let parentNode = this.database.getParentFromNodes(this.flatNodeMap.get(node), this.dataSource.data);
    let concurrencyRequest = new CheckConcurrencyRequestModel();
    let concurrencyDestination = new CheckConcurrencyDestinationRequestModel();
    let concurrencySource = new CheckConcurrencySourceRequestModel();
    let blockList: BlockReferenceViewModel[] = new Array();
    let copyblocksList: BlockStackViewModel[] = new Array();
    if (this.designerService.SelectedOption === LibraryOptions.Globallibrary || this.designerService.SelectedOption === LibraryOptions.Countrylibrary) {
      let categoryMismatch = this.designerService.blocksToBeCopied.filter(x => x.blockType.blockTypeId != node.blockType.blockTypeId);
      if (categoryMismatch && categoryMismatch.length) {
        this.DialogService.Open(DialogTypes.Error, this.translate.instant('screens.user.AdminView.Library.SuccessMessages.CopyPasteError'));
        return;
      }

    }

    // this.prepareConcurrencySourceRequestModel(blockList);
    this.designerService.blocksToBeCopied.forEach((item, index) => {
      this.blockRequestModel = new BlockStackViewModel();
      this.blockRequestModel.id = item.id;
      this.blockRequestModel.blockId = item.blockId;
      this.blockRequestModel.isStack = item.isStack;
      this.blockRequestModel.previousId = index == 0 ? node.id : null;
      this.blockRequestModel.parentId = node.parentId;
      this.blockRequestModel.description = item.description;
      this.blockRequestModel.isCopy = this.designerService.isCopied;
      this.blockRequestModel.libraryReference = this.getLibraryreference();
      this.blockRequestModel.hasChildren = item.hasChildren;
      copyblocksList.push(this.blockRequestModel);
    });

    if (this.designerService.isCopied) {
      //Concurrency check 
      this.blockService.copyBlocksStacks(copyblocksList).subscribe((data: any) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
        this.disablePaste = false;
        var dataPublish = new blockSelectedModel();
        dataPublish.blockSelectCount = 0;
        this.designerService.DisableMenus();
      });
    }
  }


  // To get the library refernce
  getLibraryreference() {
    var libraryReference = new LibraryReferenceViewModel();

    //section to assign template info if a block has been created from template section
    if (this.designerService.isTemplateSection == true) {
      libraryReference.template = new TemplateViewModel();
      libraryReference.template.isDefault = null;
      libraryReference.template.templateId = null;
      libraryReference.template.templateName = null;
    }

    //section to assgin library info if a block has been created from cbc section
    libraryReference.global = false;
    if (this.projectDetails != null) {
      libraryReference.project = new ProjectDetailsViewModel();
      libraryReference.project.projectId = null;
      libraryReference.project.projectName = null;
      libraryReference.project.projectYear = null;
    }
    libraryReference.organization = null;
    const libraryOptions = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
    libraryReference.Global = (libraryOptions.Global) ? libraryOptions.Global : false;
    libraryReference.GlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
    libraryReference.IsCountryLibrary = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
    libraryReference.CountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;
    return libraryReference;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
