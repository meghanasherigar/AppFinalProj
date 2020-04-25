import { Component, OnInit, Injectable, ViewChild, ElementRef } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { CustomHTML } from '../../../../../../shared/services/custom-html.service';
import { BehaviorSubject, Subscription, Subject } from 'rxjs';
import { BlockAttribute, BlockType, BlockStatus, BlockRequest } from '../../../../../../@models/projectDesigner/block';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource, MatDialog } from '@angular/material';
import { ProjectContext } from '../../../../../../@models/organization';
import { SelectionModel } from '@angular/cdk/collections';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { DesignerService } from '../../../../services/designer.service';
import { NbDialogService } from '@nebular/theme';
import { BlockService } from '../../../../../admin/services/block.service';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { eventConstantsEnum, IconViewSection, DragNodeConst } from '../../../../../../@models/common/eventConstants';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LibrarySuggestedBlocksExtendedComponent } from '../library-suggested-blocks-extended/library-suggested-blocks-extended.component';
import { TemplateService } from '../../../../services/template.service';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, OrganizationViewModel } from '../../../../../../@models/projectDesigner/library';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { BlocksTagsRequestModel, BlocksTagsResponseModel } from '../../../../../../@models/projectDesigner/template';
import { BlocksEditTagComponent } from '../blocks-edit-tag/blocks-edit-tag.component';
import { ToastrService } from 'ngx-toastr';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  item: string;
  id: string;
  blocks: TodoItemNode[];
  hasChildren: boolean;
  level: number;
  blockId: string;
  isCategory: boolean;
  catId: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  id: string;
  hasChildren: boolean;
  blockId: string;
  isCategory: boolean;
  catId: string;
  blocks: any = [];
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);
  get data(): TodoItemNode[] { return this.dataChange.value; }


  constructor() {
    this.initialize();
  }

  initialize() {
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string): TodoItemNode {
    return null;
  }

  insertItemAbove(node: TodoItemNode, newItem: TodoItemNode): TodoItemNode {
    this.data.splice(this.data.findIndex(id => id.id == node.id), 0, newItem);
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, newItem: TodoItemNode): TodoItemNode {
    var data = this.data.filter(item => item.id == newItem.catId)[0];

    if (data) {
      if (!node)
        data.blocks.splice(1, 0, newItem);
      else if (node.id == newItem.id) {
        data.blocks.splice(data.blocks.findIndex(id => id.id == node.id), 0, newItem);
      } else {
        data.blocks.splice(parseInt(node.id) + 1, 0, newItem);
      }
    }
    else {
      if (!node)
        this.data.splice(1, 0, newItem);
      else if (node.id == newItem.id)
        this.data.splice(this.data.findIndex(id => id.id == node.id), 0, newItem);
      else
        this.data.splice(parseInt(node.id) + 1, 0, newItem);
    }


    this.dataChange.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: TodoItemNode): TodoItemNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode {
    return null;
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItem(to, from.item);
    return newItem;
  }

  copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemAbove(to, from);
    return newItem;
  }

  copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemBelow(to, from);
    return newItem;
  }

  deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
    if (nodes.filter(item => item.isCategory == true).length > 0) {
      let _node = nodes.filter(item => item.id == nodeToDelete.catId)[0];
      _node.blocks.splice(_node.blocks.findIndex(id => id.id == nodeToDelete.id), 1);
    }
    else {
      nodes.splice(nodes.findIndex(id => id.id == nodeToDelete.id), 1);
    }
  }
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

  constructor() {
    this.initialize();
  }

  initialize() {
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: object, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;
      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string): TodoItemNode {
    return null;
  }

  insertItemAbove(node: TodoItemNode, name: string): TodoItemNode {
    const newItem = { item: name } as TodoItemNode;
    this.data.splice(this.data.indexOf(node), 0, newItem);
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, newItem: TodoItemNode): TodoItemNode {
    this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    if (node.id == "-1") this.deleteItem(node)
    this.dataChange.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: TodoItemNode): TodoItemNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode {
    return null;
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItem(to, from.item);
    return newItem;
  }

  copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemAbove(to, from.item);
    return newItem;
  }

  copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemBelow(to, from);
    return newItem;
  }

  deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
    nodes.splice(nodes.findIndex(id => id.id == nodeToDelete.id), 1);
  }
}

export const BlockCategory = {
  LocalEntityInformationBlock: 'Local Entity Information Block',
  ComparabilityAnalysisBlock: 'Comparability Analysis Block',
  EconomicAnalysisBlock: 'Economic Analysis Block'
}

@Component({
  selector: 'ngx-library-suggested-blocks',
  templateUrl: './library-suggested-blocks.component.html',
  styleUrls: ['./library-suggested-blocks.component.scss'],
  providers: [ChecklistDatabase, ChecklistDatabase1]
})
export class LibrarySuggestedBlocksComponent implements OnInit {

  blockCategoryList: any = [];

  allBlockCategory: any = [BlockCategory.LocalEntityInformationBlock, BlockCategory.ComparabilityAnalysisBlock, BlockCategory.EconomicAnalysisBlock];

  blocksFromLibrary: any = [];


  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource1: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  dataSource2: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  allNodeCollection: TodoItemFlatNode[];
  availableCollection: TodoItemNode[];
  selectedCollection: TodoItemNode[];
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  blockIndustries = [];
  projectDetails: ProjectContext;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  /* Drag and drop */
  dragNode: any;
  dragNodes = [];
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;
  subscriptions: Subscription = new Subscription();
  libraryCheckbox: any = {};
  searchTextChanged = new Subject<string>();
  subscription = new Subscription();
  searchText: string = "";
  enableDisableSave: boolean;


  loaderId = 'CreateBlockSuggestionLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06'

  constructor(private database1: ChecklistDatabase, private sharedService: ShareDetailService, private toastr: ToastrService,private database2: ChecklistDatabase1,
    private _eventService: EventAggregatorService, private designerService: DesignerService, private dialogService: NbDialogService, private ngxLoader: NgxUiLoaderService,
    private service: BlockService, private dialog: MatDialog, private customHTML: CustomHTML, private templateService: TemplateService, private translate: TranslateService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource2 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


    database1.dataChange.subscribe(data => {
      this.dataSource1.data = [];
      if (data.length > 0) {
        //method to sort the array
        data.forEach(item => {
          if (item.blocks) {
            item.blocks = item.blocks.sort((a, b) => {
              return <any>(a.id) - <any>(b.id);
            });
          }
        });
      }
      this.designerService.biAvailableBlocks = this.availableCollection = this.dataSource1.data = data;
    });


    database2.dataChange.subscribe(data => {
      this.dataSource2.data = [];
      this.designerService.biSelectedBlocks = this.selectedCollection = this.dataSource2.data = data;
      this.enableDisableSave = (this.dataSource2.data.length > 0 && this.dataSource2.data[0].id === '-1') ? true : false;
    });
  }

  dummyNode: any = {};
  private dialogTemplate: Dialog;
  isAddBtnDisabled: boolean = true;

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectDetails = this.sharedService.getORganizationDetail();

    this.libraryCheckbox.checkbox1 = true;
    this.getBlocksFromLibrary(true);
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.addBlock).subscribe((payload: any) => {
      if (payload.flow == IconViewSection.Add)
        this.addBlock(payload.block);
      if (payload.flow == IconViewSection.Remove)
        this.removeBlock(payload.block);
      this.enableDisableAddBtn();
    }));

    this.getBlockAttributes();

    this.subscription = this.searchTextChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => { this.search() });
  }

  getBlocksFromLibrary(isGlobal) {
    let _payload: any = {};
    _payload.projectId = this.projectDetails.projectId;
    _payload.isGlobal = isGlobal;
    this.templateService.getSuggestionBlockFromLibraries(_payload).subscribe((response: any) => {
      var category = this.customHTML.groupBy(response.treeView, (c) => c.blockType);
      this.blocksFromLibrary = response.treeView;
      let categoryList = Object.keys(category);
      this.blockCategoryList = [];

      //compare with category and add default category when blocks doesn't have all category
      if (categoryList.length < 3) {
        this.allBlockCategory.forEach(item => {
          if (categoryList.filter(id => id == item).length == 0)
            categoryList.unshift(item);
        })
      }

      this.buildTreeNode(categoryList, category)

      //setting tree node 1 - left side -- starts
      this.allNodeCollection = this.blockCategoryList;
      const data1 = this.buildFileTree(this.blockCategoryList);
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.database1.dataChange.next(data1);
      //setting tree node 1 - left side -- ends

      // adding dummy node to right side tree on load as its empty -- starts
      this.dummyNode.id = "-1";
      this.dummyNode.item = " ";
      var data2: any = [];
      data2.push(this.dummyNode);
      this.database2.dataChange.next(data2);
      // adding dummy node to right side tree on load as its empty -- ends

      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }),
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      };
  }

  buildTreeNode(categoryList, category) {
    let index = 0;
    categoryList.forEach(item => {
      let catItem: any = {};
      catItem.id = 1 + "_" + index;
      catItem.item = item;
      catItem.blocks = [];
      if (category[item]) {
        category[item].forEach(blockItem => {
          let block: any = {};
          block.blockId = blockItem.blockId;
          block.id = index++;
          block.level = 1;
          block.item = blockItem.title != "" ? blockItem.title : blockItem.description;
          block.blockType = blockItem.blockType;
          block.isCategory = false;
          block.catId = catItem.id;
          catItem.blocks.push(block);
        });
      }
      else
        index++;

      catItem.hasChildren = true;
      catItem.level = 0;
      catItem.blockId = null;
      catItem.isCategory = true;
      this.blockCategoryList.push(catItem);
    });
  }

  buildFileTree(obj: object): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = value.item;
      node.id = value.id;
      if (value.blocks) {
        node.blocks = [];
        value.blocks.forEach(item => {
          item.level = 1;
          node.blocks.push(item)
        });
      }
      node.hasChildren = value.hasChildren;
      node.level = value.level;
      node.blockId = value.blockId;
      node.isCategory = value.isCategory;
      return accumulator.concat(node);
    }, []);
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
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.id = node.id;
    flatNode.blockId = node.blockId;
    flatNode.expandable = node.hasChildren;
    flatNode.isCategory = node.isCategory;
    flatNode.catId = node.catId;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
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
    let _blocks: any = [];
    if (node.isCategory)
      _blocks = this.availableCollection.filter(id => id.id == node.id)[0].blocks.filter(id => id.catId == node.id);

    let flatnode = this.flatNodeMap.get(node);
    flatnode.blocks = _blocks;
    this.dataSource1.data = this.dataSource1.data;

    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  selectAllBlocks() {
    if (this.checklistSelection["_selection"].size > 0 && this.checklistSelection["_selection"].size != this.treeControl.dataNodes.length)
      this.checklistSelection.clear();
    else {
      this.dataSource1.data.forEach(x => {
        x.blocks.forEach(y => {
          this.checklistSelection.toggle(this.nestedNodeMap.get(y));
          this.todoItemSelectionToggle(this.nestedNodeMap.get(y));
        })
        this.checklistSelection.toggle(this.nestedNodeMap.get(x));
        this.todoItemSelectionToggle(this.nestedNodeMap.get(x));
      })
    }
  }

  handleDragStart(event, node) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.dragNodes = [];
    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {

        nodesArray.push(element);
      });
      this.dragNodes = nodesArray;
      nodesArray = null;
    }
    else {
      this.dragNodes.push(node);
    }
    this.treeControl.collapse(node);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }


  handleDragOver(event, node) {

    event.preventDefault();

    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
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
      this.dragNodeExpandOverArea = DragNodeConst.above;
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = DragNodeConst.below;
    } else {
      this.dragNodeExpandOverArea = DragNodeConst.center;
    }
  }

  handleDrop1(event, node) {
    event.preventDefault();
  }

  handleDrop2(event, node) {
    event.preventDefault();
    if (this.dragNodes.length > 0) {
      this.dragNodes.forEach((element, index) => {
        if (!element.isCategory) {
          this.dragNode = element;
          if (node !== this.dragNode) {
            this.dragNode.level = 0;
            let newItem: TodoItemNode;
            if (index == 0)
              newItem = this.database2.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
            else {
              newItem = this.database2.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(this.dragNodes[index - 1]));
            }


            this.database1.deleteItem(this.flatNodeMap.get(this.dragNode));
            this.dragNode = null;
          }
        }
        this.checklistSelection["_selection"].clear();
      });

      this.dragNodes = null;
      this.dragNodeExpandOverNode = null;
      this.dragNodeExpandOverTime = 0;
      this.enableDisableAddBtn();
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }
  }

  expandBlock(node: TodoItemFlatNode) {
    let _blocks: any = [];
    this.dataSource2.data = this.dataSource2.data;

    this.allNodeCollection.forEach(item => {
      item.blocks.forEach(block => {
        if (this.selectedCollection.filter(id => id.id == block.id).length == 0 && node.id == block.catId)
          _blocks.push(block);
      })
    });

    let flatnode = this.flatNodeMap.get(node);
    flatnode.blocks = _blocks;
    this.dataSource1.data = this.dataSource1.data;
  }


  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  extendedPopup(_section, node) {
    var blockList: any = [];
    blockList = _section == 'available' ? this.designerService.biAvailableBlocks : this.designerService.biSelectedBlocks;

    let _blocks: any = [];
    let index = 1;
    if (_section == 'available') {
      blockList.forEach(item => {
        if (item.blocks) {
          item.blocks.forEach(block => {
            this.getSelectedBlocks(_blocks, block, index++);
          })
        }
        else {
          this.getSelectedBlocks(_blocks, item, index++);
        }
      });
    }
    else {
      blockList.forEach(block => {
        this.getSelectedBlocks(_blocks, block, index++);
      });
    }

    this.dialogService.open(LibrarySuggestedBlocksExtendedComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { blockList: _blocks, selectedBlock: node }
    });
  }

  getSelectedBlocks(_blocks, block, index) {
    let _selectedblock = this.blocksFromLibrary.filter(id => id.blockId == block.blockId);
    if (_selectedblock.length > 0) {
      _selectedblock[0].id = block.id;
      _selectedblock[0].index = index;
      _blocks.push(_selectedblock[0]);
    }
  }

  removeItem(node) {
    this.database2.deleteItem(node);
    var _prevCatNode: any = this.allNodeCollection.filter(item => item.id == node.catId)[0];
    var _prevNode = _prevCatNode.blocks.filter(item => item.id == (parseInt(node.id) - 1).toString() || node.id == 0)[0];
    var newNode: any = {};
    this.database1.copyPasteItemBelow(node, _prevNode);

    if (this.selectedCollection.length == 0) {
      var data2: any = [];
      data2.push(this.dummyNode);
      this.database2.dataChange.next(data2);
    }
    this.enableDisableAddBtn();
  }

  addBlock(block) {
    var lastNodeIndex = this.selectedCollection.length;
    var selectedNode = this.allNodeCollection.filter(id => id.item == block.blockType.blockType)[0].blocks.filter(item => item.id == (parseInt(block.id)).toString())[0];
    selectedNode.item = block.title;
    this.database2.copyPasteItemBelow(selectedNode, this.selectedCollection[lastNodeIndex - 1]);
    this.database1.deleteItem(selectedNode);

    let selectedBlock = this.blocksFromLibrary.filter(id => id.blockId == block.blockId)[0];

    if (selectedBlock) selectedBlock = block;
  }

  removeBlock(block) {
    var selectedNode = this.allNodeCollection.filter(id => id.item == block.blockType.blockType)[0].blocks.filter(item => item.id == (parseInt(block.id)).toString())[0];
    this.removeItem(selectedNode);
  }

  addBlocks() {
    if (this.designerService.isBlocksTagsEdited) {
      this.designerService.biSelectedBlocks.forEach(item => {
        let response =  new BlocksTagsResponseModel();
        response.blockId = item.blockId
        if(this.designerService.blocksTags != undefined) {
          let isBlock = this.designerService.blocksTags.find(x => x.blockId == item.blockId);
          if(!isBlock)
            this.designerService.blocksTags.push(response);
        }
      });
      this.suggestBlocks();
    } else {
      var payload = new BlocksTagsRequestModel();
      payload.projectId = this.projectDetails.projectId;
      this.designerService.biSelectedBlocks.forEach(item => {
        payload.blockIds.push(item.blockId);
      });
      this.templateService.getBlocksWithAnswertag(payload).subscribe((data: any) => {
        if (data != undefined && data.length > 0) {
          const sendReminderRef = this.dialogService.open(BlocksEditTagComponent, {
            closeOnBackdropClick: false,
            closeOnEsc: true,
          });
          sendReminderRef.componentRef.instance.blocksTagsModel = data;
          sendReminderRef.componentRef.instance.projectId = this.projectDetails.projectId;
        } else {
          this.designerService.biSelectedBlocks.forEach(item => {
            let response =  new BlocksTagsResponseModel();
            response.blockId = item.blockId
            this.designerService.blocksTags.push(response);
          });
          this.suggestBlocks();
        }
      });
    }
  }

  suggestBlocks() {
    if (this.isAddBtnDisabled)
      return;

    this.ngxLoader.startBackgroundLoader(this.loaderId);

    let requestList: BlockRequest[] = [];

    this.designerService.biSelectedBlocks.forEach(item => {

      var selectedBlock = this.blocksFromLibrary.filter(id => id.blockId == item.blockId)[0];

      if (selectedBlock) {
        let request = new BlockRequest();
        request.isStack = false;
        request.isCopy = true;
        request.title = selectedBlock.title;
        request.description = selectedBlock.description ? selectedBlock.description : null;
        request.blockContent = selectedBlock.blockContent;
        if (selectedBlock.blockType.blockType)
          request.blockType = selectedBlock.blockType ? selectedBlock.blockType : this.blockTypes.filter(id => id.blockType == Status.Other)[0];
        else
          request.blockType = selectedBlock.blockTypeList ? selectedBlock.blockTypeList : this.blockTypes.filter(id => id.blockType == Status.Other)[0];

        if (selectedBlock.blockStatus.blockStatus)
          request.blockStatus = selectedBlock.blockStatus ? selectedBlock.blockStatus : this.blockStatus.filter(id => id.blockStatus == Status.Draft)[0];
        else
          request.blockStatus = selectedBlock.blockStatusList ? selectedBlock.blockStatusList : this.blockStatus.filter(id => id.blockStatus == Status.Draft)[0];


        request.transactionType = selectedBlock.transactionType ? selectedBlock.transactionType : null;
        request.previousId = null;
        request.parentId = null;
        request.blockOrigin = null;
        request.industry = selectedBlock.industry.length > 0 ? selectedBlock.industry : this.projectDetails.industry;
        request.libraryReference = new LibraryReferenceViewModel();

        //section to assgin library info if a block has been created from cbc section
        request.libraryReference.global = false;
        if (this.projectDetails != null) {
          request.libraryReference.project = new ProjectDetailsViewModel();
          request.libraryReference.project.projectId = this.projectDetails.projectId;
          request.libraryReference.project.projectName = this.projectDetails.projectName;
          request.libraryReference.project.projectYear = this.projectDetails.fiscalYear;
        }

        request.libraryReference.organization = new OrganizationViewModel();
        request.libraryReference.organization.organizationId = this.projectDetails.organizationId;

        requestList.push(request);
      }
    });

    let payload: any = {};
    payload.projectId = this.projectDetails.projectId;
    payload.blocks = [];
    payload.blocks = requestList;
    payload.blockTags = this.designerService.blocksTags;
    this.service.addSuggestionBlocksToDefaultTemplate(payload)
      .subscribe((data: any) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.toastr.success(this.translate.instant('screens.project-designer.iconview.suggestBlock.addBlockSuccessMsg'));
        this.designerService.blocksTags = [];
        this.designerService.isBlocksTagsEdited = false;
            
        this.cancelSuggestions();
      }),
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      };

  }

  getBlockAttributes() {
    this.service.getBlockAttributes()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
      });
  }

  cancelSuggestions() {
    this.designerService.blocksTags = [];
    this.designerService.isBlocksTagsEdited = false;
    this._eventService.getEvent("LoadSelectedTheme").publish(true);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.designerService.blocksTags = [];
    this.designerService.isBlocksTagsEdited = false;
  }

  enableDisableAddBtn() {
    if (this.dataSource2.data && this.dataSource2.data.length > 0 && this.dataSource2.data.filter(item => item.id != "-1").length > 0)
      this.isAddBtnDisabled = false;
    else
      this.isAddBtnDisabled = true;
  }

  toggleCheckbox(event) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    if (event.currentTarget.id === LibraryConst.globalLibrary) {
      if (this.libraryCheckbox.checkbox1)
        this.libraryCheckbox.checkbox1 = false;
      else
        this.libraryCheckbox.checkbox1 = true;
      this.libraryCheckbox.checkbox2 = false;
      this.getBlocksFromLibrary(true);
    }
    else if (event.currentTarget.id === LibraryConst.countryLibrary) {
      if (this.libraryCheckbox.checkbox2)
        this.libraryCheckbox.checkbox2 = false;
      else
        this.libraryCheckbox.checkbox2 = true;
      this.libraryCheckbox.checkbox1 = false

      this.getBlocksFromLibrary(false);
    }
  }

  search() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    let _blocks: any = [];
    this.allNodeCollection.forEach(item => {
      item.blocks.forEach(block => {
        if (this.selectedCollection.filter(id => id.id == block.id).length == 0)
          _blocks.push(block);
      })
    });
    if (this.searchText.trim() != "")
      _blocks = _blocks.filter(id => id.item.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1);
    else
      _blocks = this.allNodeCollection;

    this.buildFileTree(_blocks);
    this.database1.dataChange.next(_blocks);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

}

export const Status = {
  Other: "Other",
  Draft: "Draft"
}

export const LibraryConst = {
  globalLibrary: 'globalLibrary',
  countryLibrary: 'countryLibrary'
}