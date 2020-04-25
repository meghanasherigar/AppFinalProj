import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, Input, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../@models/common/eventConstants';
import { StorageService } from '../../../../@core/services/storage/storage.service';
import { NbDialogService } from '@nebular/theme';
import { ImportedBlocksExtendedComponent } from '../imported-blocks-extended/imported-blocks-extended.component';
import { DesignerService } from '../../services/designer.service';
import { BlockRequest, BlockAttribute, BlockType, BlockStatus, Industry } from '../../../../@models/projectDesigner/block';
import { LibraryReferenceViewModel} from '../../../../@models/projectDesigner/library';
import { BlockService } from '../../services/block.service';
import { TransactionTypeDataModel } from '../../../../@models/transaction';
import { viewAttributeModel, regions } from '../../../../@models/projectDesigner/common';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../@models/organization';
import { ThemingContext, Themes } from '../../../../@models/projectDesigner/theming';
import { MatDialog } from '@angular/material';
import { Dialog, DialogTypes } from '../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NgxUiLoaderService, POSITION,SPINNER } from 'ngx-ui-loader';
/**
 * Node for to-do item
 */
export class TodoItemNode {
  item: string;
  id: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  id: string;
}

/**
 * The Json object for to-do list data.
 */

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
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    //const data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    //this.dataChange.next(data);
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

  insertItemAbove(node: TodoItemNode, newItem: TodoItemNode): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    //const newItem = { item: name } as TodoItemNode;
    if (parentNode != null) {
      //parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.findIndex(id => id.id == node.id), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, newItem: TodoItemNode): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    // const newItem = { item: name } as TodoItemNode;
    if (node.id == newItem.id) {
      this.data.splice(this.data.findIndex(id => id.id == node.id), 0, newItem);
      //  parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    } else {

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
    // if (from.children) {
    //   from.children.forEach(child => {
    //     this.copyPasteItem(child, newItem);
    //   });
    // }
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
    nodes.splice(nodes.findIndex(id => id.id == nodeToDelete.id), 1);
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

  initialize() { }

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
    const parentNode = this.getParentFromNodes(node);
    const newItem = { item: name } as TodoItemNode;
    if (parentNode != null) {
      //parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, newItem: TodoItemNode): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    //const newItem = { item: name, } as TodoItemNode;
    if (parentNode != null) {
      //  parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
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


@Component({
  selector: 'ngx-imported-blocks',
  templateUrl: './imported-blocks.component.html',
  styleUrls: ['./imported-blocks.component.scss'],
  providers: [ChecklistDatabase, ChecklistDatabase1]
})

export class ImportedBlocksComponent implements OnInit,OnDestroy {
  subscriptions: Subscription = new Subscription();
  
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
  transactionList: TransactionTypeDataModel[];
  industryList : Industry[];
  blockIndustries = [];
  loader: boolean = true;
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
  themesList = Themes;
  themingContext: ThemingContext;


//ngx-ui-loader configuration
loaderId='ImportedMangeLoader';
loaderPosition=POSITION.centerCenter;
loaderFgsType=SPINNER.ballSpinClockwise; 
loaderColor = '#55eb06';


  @Input() IsGlobal: boolean;

  constructor(private database1: ChecklistDatabase, private sharedService: ShareDetailService,private ngxLoader: NgxUiLoaderService, private database2: ChecklistDatabase1, private _eventService: EventAggregatorService, private designerService: DesignerService, private dialogService: NbDialogService, private service: BlockService, private storageService: StorageService, private dialog: MatDialog) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, undefined);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource2 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


    database1.dataChange.subscribe(data => {
      this.dataSource1.data = [];
      data = data.sort((a, b) => {
        return <any>(a.id) - <any>(b.id);
      });
      this.designerService.biAvailableBlocks = this.availableCollection = this.dataSource1.data = data;
    });

    database2.dataChange.subscribe(data => {
      this.dataSource2.data = [];
      this.designerService.biSelectedBlocks = this.selectedCollection = this.dataSource2.data = data;
    });
    //this.showLoader = true;
  }

  dummyNode: any = {};
  //showLoader: boolean = false;
  private dialogTemplate: Dialog;
  isAddBtnDisabled: boolean = true;

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
 //   this.loader = true;
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.themingContext = this.sharedService.getSelectedTheme();
    var initialData: any;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.displayBlocks).subscribe((data: any) => {
      this.allNodeCollection = data;
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      const data1 = this.buildFileTree(data, 0);
      // Notify the change.
      this.database1.dataChange.next(data1);
      this.dummyNode.id = "-1";
      this.dummyNode.item = " ";
      var data2: any = [];
      data2.push(this.dummyNode);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.database2.dataChange.next(data2);
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.addBlock).subscribe((payload: any) => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      if (payload.flow == "Add")
        this.addBlock(payload.block);
      if (payload.flow == "Remove")
        this.removeBlock(payload.block);

      this.enableDisableAddBtn();
    }));

    this.getBlockAttributes();
  }

  /**
  * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
  * The return value is the list of `TodoItemNode`.
  */
  buildFileTree(obj: object, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = value.item;
      node.id = value.id;
      return accumulator.concat(node);
    }, []);
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

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
    flatNode.expandable = false;
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
        this.checklistSelection.toggle(this.nestedNodeMap.get(x));
        this.todoItemSelectionToggle(this.nestedNodeMap.get(x));
      })
    }
  }

  handleDragStart(event, node) {
    this.dragNodes = [];
    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
      });
      this.dragNodes = nodesArray;
      nodesArray = null;
      this.checklistSelection.clear();
    }
    else{
      this.dragNodes.push(node);
    }
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
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
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  handleDrop1(event, node) {
    event.preventDefault();
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  handleDrop2(event, node) {
    event.preventDefault();
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
    if (this.dragNodes.length > 0) {
      this.dragNodes.forEach((element, index) => {
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
        this.checklistSelection["_selection"].clear();
      });

      this.dragNodes = null;
      this.dragNodeExpandOverNode = null;
      this.dragNodeExpandOverTime = 0;
      this.enableDisableAddBtn();
    }
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  extendedPopup(_section, node) { 
    var blockList : any = [];
    blockList = _section == 'available' ? this.designerService.biAvailableBlocks : this.designerService.biSelectedBlocks;

    this.designerService.selectedImportedBlockId = node.id;
    this.dialogService.open(ImportedBlocksExtendedComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { blockList : blockList }
    });
  }

  removeItem(node) {
    this.database2.deleteItem(node);
    var prevNode = this.allNodeCollection.filter(item => item.id == (parseInt(node.id) - 1).toString() || node.id == 0)[0];
    var newNode: any = {};
    newNode.id = prevNode.id;
    newNode.item = prevNode.item;
    this.database1.copyPasteItemBelow(node, newNode);

    if (this.selectedCollection.length == 0) {
      var data2: any = [];
      data2.push(this.dummyNode);
      this.database2.dataChange.next(data2);
    }
    this.enableDisableAddBtn();
  }

  addBlock(block) {
    var lastNodeIndex = this.selectedCollection.length;
    var selectedNode = this.allNodeCollection.filter(item => item.id == (parseInt(block.id)).toString())[0];
    var newNode = new TodoItemNode();
    newNode.id = selectedNode.id;
    newNode.item = block.title;
    this.database2.copyPasteItemBelow(newNode, this.selectedCollection[lastNodeIndex - 1]);
    this.database1.deleteItem(newNode);
  }

  removeBlock(block) {
    var selectedNode = this.allNodeCollection.filter(item => item.id == (parseInt(block.id)).toString())[0];
    var newNode = new TodoItemNode();
    newNode.id = selectedNode.id;
    newNode.item = selectedNode.item;
    this.removeItem(newNode);
  }

  addBlocks() {
    if (this.isAddBtnDisabled)
      return;
    let requestList: BlockRequest[] = [];
    this.designerService.biSelectedBlocks.forEach(item => {
      var selectedBlock = this.designerService.importedBlocks.filter(id => id.id == item.id)[0];
      if (selectedBlock) {
        let request = new BlockRequest();
        request.isStack = false;
        request.isCopy = true;
        request.title = selectedBlock.title;
        request.description = selectedBlock.description ? selectedBlock.description : null;
        request.blockContent = selectedBlock.blockContent;
        request.blockType = selectedBlock.blockType ? selectedBlock.blockType : this.blockTypes.filter(id => id.blockType == "Other")[0];
        request.blockStatus = selectedBlock.blockStatus ? selectedBlock.blockStatus : this.blockStatus.filter(id => id.blockStatus == "Draft")[0];
        request.transactionType = this.transactionList[0];
        request.previousId = null;
        request.parentId = null;
        request.blockOrigin = null;
        request.industry = this.industryList;
        request.libraryReference = new LibraryReferenceViewModel();
        const libraryOptions = this.designerService.getCurrentLibraryPayload(this.designerService.SelectedOption);
        request.libraryReference.Global = (libraryOptions.Global) ? libraryOptions.Global : false;
        request.libraryReference.GlobalTemplate = (libraryOptions.GlobalTemplate) ? libraryOptions.GlobalTemplate : false;
        request.libraryReference.IsCountryLibrary = (libraryOptions.IsCountryLibrary) ? libraryOptions.IsCountryLibrary : false;
        request.libraryReference.CountryTemplate = (libraryOptions.CountryTemplate) ? libraryOptions.CountryTemplate : false;
        requestList.push(request);
      }
    });

    this.service.saveImportedBlocks(requestList)
      .subscribe((data: any) => {
        this.RefreshContent();
        let payLoad = new viewAttributeModel();
        payLoad.regionType = regions.none;
        this.dialogTemplate = new Dialog();
        this.dialogTemplate.Type = DialogTypes.Success;
        this.dialogTemplate.Message = "Block(s) imported successfully.";

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          data: this.dialogTemplate
        });

        dialogRef.afterClosed().subscribe(result => {
          var option = this.themesList[0];
          option.checked = true;
        });
      });
  }

  getBlockAttributes() {
    this.service.getBlockAttributes()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        this.transactionList = data.transactionType;
        this.industryList = data.industry;
      });
  }

  RefreshContent() {
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.none;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
    this._eventService.getEvent(EventConstants.LibrarySection).publish(payLoad);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  enableDisableAddBtn() {
    if (this.dataSource2.data && this.dataSource2.data.length > 0 && this.dataSource2.data.filter(item => item.id != "-1").length > 0)
      this.isAddBtnDisabled = false;
    else
      this.isAddBtnDisabled = true;
  }
}
