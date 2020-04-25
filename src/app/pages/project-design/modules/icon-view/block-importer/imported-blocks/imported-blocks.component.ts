import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../@models/common/eventConstants';
import { StorageService } from '../../../../../../@core/services/storage/storage.service';
import { NbDialogService } from '@nebular/theme';
import { ImportedBlocksExtendedComponent } from '../imported-blocks-extended/imported-blocks-extended.component';
import { DesignerService } from '../../../../services/designer.service';
import { BlockRequest, BlockAttribute, BlockType, BlockStatus, Industry, BlockFootNote, BlockImporter } from '../../../../../../@models/projectDesigner/block';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, OrganizationViewModel } from '../../../../../../@models/projectDesigner/library';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { BlockService } from '../../../../services/block.service';
import { TransactionTypeDataModel } from '../../../../../../@models/transaction';
import { TreeviewItem } from 'ngx-treeview';
import { viewAttributeModel, regions, ActionEnum } from '../../../../../../@models/projectDesigner/common';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { Themes, ThemingContext, Theme } from '../../../../../../@models/projectDesigner/theming';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Title } from '@angular/platform-browser';
import MultirootEditor from '../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { ImportedBlocksPartialMergeComponent } from './imported-blocks-partial-merge/imported-blocks-partial-merge.component';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { Index } from '../../../../../../@models/projectDesigner/infoGathering';



/**
 * Node for to-do item
 */
export class TodoItemNode {
  item: string;
  id: string;
  content: string;
  isSplitNode: boolean;
  mergedNodes: string[] = [];
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  id: string;
  content: string;
  isSplitNode: boolean;
  mergedNodes: string[] = [];
}

/**
 * The Json object for to-do list data.
 */
const TREE_DATA = {
  'Almond Meal flour': null,
  'Organic eggs': null,
  'Protein Powder': null,
};

const TREE_DATA1 = {
  'Almond Meal flour': null,
};

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

      // if (value != null) {
      //   if (typeof value === 'object') {
      //     node.children = this.buildFileTree(value, level + 1);
      //   } else {
      //     node.item = value;
      //   }
      // }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string): TodoItemNode {
    // if (!parent.children) {
    //   parent.children = [];
    // }
    // const newItem = { item: name } as TodoItemNode;
    // parent.children.push(newItem);
    // this.dataChange.next(this.data);
    //return newItem;
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
    // if (currentRoot.children && currentRoot.children.length > 0) {
    //   for (let i = 0; i < currentRoot.children.length; ++i) {
    //     const child = currentRoot.children[i];
    //     if (child === node) {
    //       return currentRoot;
    //     } else if (child.children && child.children.length > 0) {
    //       const parent = this.getParent(child, node);
    //       if (parent != null) {
    //         return parent;
    //       }
    //     }
    //   }
    // }
    return null;
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
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
    // if (from.children) {
    //   from.children.forEach(child => {
    //     this.copyPasteItem(child, newItem);
    //   });
    // }
    return newItem;
  }

  copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemBelow(to, from);

    // if (from.children) {
    //   from.children.forEach(child => {
    //     this.copyPasteItem(child, newItem);
    //   });
    // }
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

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    //const data = this.buildFileTree({}, 0);

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

      // if (value != null) {
      //   if (typeof value === 'object') {
      //     node.children = this.buildFileTree(value, level + 1);
      //   } else {
      //     node.item = value;
      //   }
      // }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string): TodoItemNode {
    // if (!parent.children) {
    //   parent.children = [];
    // }
    // const newItem = { item: name } as TodoItemNode;
    // parent.children.push(newItem);
    // this.dataChange.next(this.data);
    //return newItem;
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
      this.data.splice(this.data.findIndex(id => id.id == node.id), 0, newItem);

    }
    if (node.id == "-1") this.deleteItem(node)
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
    // if (currentRoot.children && currentRoot.children.length > 0) {
    //   for (let i = 0; i < currentRoot.children.length; ++i) {
    //     const child = currentRoot.children[i];
    //     if (child === node) {
    //       return currentRoot;
    //     } else if (child.children && child.children.length > 0) {
    //       const parent = this.getParent(child, node);
    //       if (parent != null) {
    //         return parent;
    //       }
    //     }
    //   }
    // }
    return null;
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
  }

  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
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
    const newItem = this.insertItemAbove(to, from.item);
    // if (from.children) {
    //   from.children.forEach(child => {
    //     this.copyPasteItem(child, newItem);
    //   });
    // }
    return newItem;
  }

  copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemBelow(to, from);
    // if (from.children) {
    //   from.children.forEach(child => {
    //     this.copyPasteItem(child, newItem);
    //   });
    // }
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

export class ImportedBlocksComponent implements OnInit, OnDestroy {
  loaderId = 'ImportedIconicViewLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';
  editor: any;

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
  blockIndustries = [];
  projectDetails: ProjectContext;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
  checklistSelection_dest = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
  selectAllEnabled: boolean = false;
  selectAllEnabled_dest: boolean = false;
  loadPartialMerge = false;
  /* Drag and drop */
  dragNode: any;
  dragNodes = [];
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  themesList = Themes;
  subscriptions: Subscription = new Subscription();
  themingContext: ThemingContext;
  enableIcons: boolean = false;
  enableMergeIcon_BlockImport = new BehaviorSubject<boolean>(false);
  isEnabledMergeIcon_BlockImport = this.enableMergeIcon_BlockImport.asObservable();
  constructor(private database1: ChecklistDatabase, private ngxLoader: NgxUiLoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private sharedService: ShareDetailService, private database2: ChecklistDatabase1, private _eventService: EventAggregatorService, private designerService: DesignerService, private dialogService: NbDialogService, private service: BlockService, private storageService: StorageService, private dialog: MatDialog) {
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
      if (data.length > 0) {
        this.changeDetectorRef.detectChanges();

        this.ngAfterViewInit();
        // this.editor.setData({ header: data }); 
      }
    });


    database2.dataChange.subscribe(data => {
      this.dataSource2.data = [];
      this.designerService.biSelectedBlocks = this.selectedCollection = this.dataSource2.data = data;
      this.designerService.biSelectedBlocks.forEach(x => {
        let data = this.designerService.addedCollectionBlocks.find(ob => ob.id === x.id);
        if (data === undefined) {
          let blockReqObj = new BlockRequest();
          blockReqObj.title = x.item;
          blockReqObj.displayBlockContent = x.content;
          blockReqObj.blockContent = x.content;
          blockReqObj.id = x.id;
          //should parse only word to extract footnotes
          if (this.designerService.selectedFileFormat != undefined && this.designerService.selectedFileFormat != BlockImporter.FileExtPDF) {
            var doc = new DOMParser().parseFromString(x.content, BlockImporter.ParseType);
            var divsTobeRemoved = [];
            var divs = doc.getElementsByTagName(BlockImporter.DivTag);
            for (let el = 0; el < divs.length; el++) {
              let footNoteExists = divs[el].id.includes(BlockImporter.FootNoteId);
              if (footNoteExists) {
                let footNoteIdStr = divs[el].id.split(BlockImporter.FootNoteId);
                var blockFootNote = new BlockFootNote();
                var footNoteNumbers = (footNoteIdStr.length > 0) ? divs[el].getElementsByTagName(BlockImporter.AnchorTag) : undefined;
                if (footNoteNumbers != undefined && footNoteNumbers.length > 0) {
                  for (let anchor = 0; anchor < footNoteNumbers.length; anchor++) {
                    if (footNoteNumbers[anchor].getAttribute(BlockImporter.HREF) == BlockImporter.FootNoteRef + footNoteIdStr[1]) {
                      var parentElementOfFootNote = footNoteNumbers[0].parentElement;
                      parentElementOfFootNote.removeChild(footNoteNumbers[0]);
                    }
                  }
                }
                blockFootNote.text = divs[el].innerHTML.trim();

                blockFootNote.index = (footNoteIdStr.length > 0) ? parseInt(footNoteIdStr[1]) : -1;
                blockReqObj.footNotes.push(blockFootNote);
                divsTobeRemoved.push(divs[el]);
              }
            }
            var spanTags = doc.getElementsByTagName(BlockImporter.SpanTag);
            for (let el = 0; el < spanTags.length; el++) {
              let style = spanTags[el].getAttribute(BlockImporter.Style);
              if (style != null && style.includes(BlockImporter.Templafy)) {
                var spanParent = spanTags[el].parentElement;
                spanParent.removeChild(spanTags[el]);
              }
            }
            divsTobeRemoved.forEach(element => {
              let parentFootNoteDiv = element.parentElement;
              parentFootNoteDiv.removeChild(element);
            })
            let hrElement = doc.getElementsByTagName(BlockImporter.HRTag);
            if (hrElement != undefined && hrElement.length > 0) {
              let parentHrElement = hrElement[hrElement.length - 1].parentElement;
              parentHrElement.removeChild(hrElement[hrElement.length - 1]);
            }
            blockReqObj.blockContent = doc.firstElementChild.outerHTML;
          }
          this.designerService.addedCollectionBlocks.push(blockReqObj);
        }

      });
      let recordsTobeRemoved = [];
      this.designerService.addedCollectionBlocks.forEach((b, index) => {
        var removeIndex = this.designerService.biSelectedBlocks.findIndex(y => y.id == b.id)
        if (removeIndex == -1) {
          recordsTobeRemoved.push(b);
          // this.designerService.addedCollectionBlocks.splice(index, 1);
          if (this.designerService.savedBlockArray != undefined && this.designerService.savedBlockArray.length > 0) {
            this.designerService.savedBlockArray.splice(index, 1);
          }
        }
      });
      recordsTobeRemoved.forEach(x => {
        if (this.designerService.addedCollectionBlocks.length > 0) {
          let indextobeRemoved = this.designerService.addedCollectionBlocks.findIndex(y => y.id == x.id);
          this.designerService.addedCollectionBlocks.splice(indextobeRemoved, 1);
        }
      })
    });
    // this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.disableNext).publish(this.designerService.addedCollectionBlocks)
  }

  dummyNode: any = {};
  private dialogTemplate: Dialog;
  isAddBtnDisabled: boolean = true;

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.designerService.addedCollectionBlocks = [];
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
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockExtendedView).subscribe((payload: any) => {
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.addBlocksPartialMerge).subscribe((data: any) => {
      this.AddBlocks_PartialMerge(data.title, data.content);
    }));
    this.designerService.loadPartialMerge.subscribe(value => {
      this.loadPartialMerge = value;
    });
    this.getBlockAttributes();
    this.enableMergeIcon_BlockImport.subscribe(isEnabled =>
      this.enableIcons = isEnabled);
  }
  ngAfterViewInit() {

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
      node.content = value.content;
      node.isSplitNode = false;
      node.mergedNodes = [];//value.mergedNodes;
      return accumulator.concat(node);
    }, []);
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  //getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  mergedNode = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.mergedNodes.length > 0 ? true : false;

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
    flatNode.content = node.content;
    flatNode.isSplitNode = node.isSplitNode;
    flatNode.expandable = false;
    flatNode.mergedNodes = node.mergedNodes;
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
  todoItemSelectionToggle(node: TodoItemFlatNode, event): void {
    if (event != null) {
      this.clearSelectAll();
    }
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
    if (this.checklistSelection.selected.length > 0)
      this.enableMergeIcon_BlockImport.next(true);
    else
      this.enableMergeIcon_BlockImport.next(false);
  }
  clearSelectAll() {
    var test = document.getElementById('selectAllCheckBox');
    if ((<HTMLInputElement>test).checked != undefined)
      (<HTMLInputElement>test).checked = false;
  }
  todoItemSelectionToggle_dest(node: TodoItemFlatNode, event): void {
    if (event != null) {
      this.clearSelectAll_dest();
    }
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection_dest.isSelected(node)
      ? this.checklistSelection_dest.select(...descendants)
      : this.checklistSelection_dest.deselect(...descendants);
  }
  clearSelectAll_dest() {
    var test = document.getElementById('selectAllCheckBox_dest');
    if ((<HTMLInputElement>test).checked != undefined)
      (<HTMLInputElement>test).checked = false;
  }
  selectAllBlocks() {
    // this.selectAllBlocks=true;
    if (this.checklistSelection["_selection"].size > 0 && this.checklistSelection["_selection"].size != this.treeControl.dataNodes.length) {
      this.checklistSelection.clear();
      this.enableMergeIcon_BlockImport.next(false);
    }
    else {
      this.dataSource1.data.forEach(x => {
        this.checklistSelection.toggle(this.nestedNodeMap.get(x));
        this.todoItemSelectionToggle(this.nestedNodeMap.get(x), null);
      })
    }
    //this.designerService.blockList = this.checklistSelection["_selection"];
  }

  selectAllBlocks_dest() {

    if (this.checklistSelection_dest["_selection"].size > 0 && this.checklistSelection_dest["_selection"].size != this.treeControl.dataNodes.length)
      this.checklistSelection_dest.clear();
    else {
      this.dataSource2.data.forEach(x => {
        this.checklistSelection_dest.toggle(this.nestedNodeMap.get(x));
        this.todoItemSelectionToggle_dest(this.nestedNodeMap.get(x), null);
      })
    }
    //this.designerService.blockList = this.checklistSelection["_selection"];
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
      this.enableMergeIcon_BlockImport.next(false);
    }
    else {
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
          newItem = this.database2.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(this.dragNodes[index]));
        }
        if (!element.isSplitNode) {
          const indexTmp = this.dataSource1.data.findIndex(x => x.id == element.id);
          this.dataSource1.data.splice(indexTmp, 1);
        }
        this.checklistSelection["_selection"].clear();
        this.clearSelectAll();
        this.enableMergeIcon_BlockImport.next(false);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
      this.database1.dataChange.next(this.dataSource1.data);
      this.database2.dataChange.next(this.dataSource2.data);

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
    var blockList: any = [];
    blockList = _section == 'available' ? this.designerService.biAvailableBlocks : this.designerService.biSelectedBlocks;

    this.designerService.selectedImportedBlockId = node.id;
    this.dialogService.open(ImportedBlocksExtendedComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { blockList: blockList }
    });
  }
  removeAll() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    if (this.checklistSelection_dest["_selection"].size > 0) {
      this.checklistSelection_dest["_selection"].forEach(element => {
        if (element.id != -1)
          this.removeItem(element, false);
      });
      this.checklistSelection_dest.clear();
      this.clearSelectAll_dest();
      this.enableMergeIcon_BlockImport.next(false);
    }
    this.database1.dataChange.next(this.dataSource1.data);
    this.database2.dataChange.next(this.dataSource2.data);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  removeItem(node, isRefresh) {
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
    this.database2.deleteItem(node);
    if (node.mergedNodes != undefined)
      node.mergedNodes.forEach(id => {
        node.mergedNodes.filter(x => x != id).forEach(element => {
          let dataNode = this.dataSource1.data.find(x => x.id == id);
          if (dataNode != undefined) {
            let indexTmp = dataNode.mergedNodes.findIndex(x => x == element);
            if (indexTmp > -1)
              dataNode.mergedNodes.splice(indexTmp, 1);
          }
        });
      });

    if (node.mergedNodes != undefined)
      if (!node.isSplitNode && node.mergedNodes.length <= 0) {
        var prevNode = this.allNodeCollection.filter(item => item.id == (parseInt(node.id) - 1).toString() || node.id == 0)[0];
        var newNode: any = {};
        newNode.id = prevNode.id;
        newNode.item = prevNode.item;
        this.database1.copyPasteItemBelow(node, newNode);
      }
    if (this.selectedCollection.length == 0) {
      var data2: any = [];
      data2.push(this.dummyNode);
    }
    if (isRefresh) {
      this.database1.dataChange.next(this.dataSource1.data);
      this.database2.dataChange.next(this.dataSource2.data);
    }
    this.enableDisableAddBtn();
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
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
    this.removeItem(newNode, false);
    this.database1.dataChange.next(this.dataSource1.data);
    this.database2.dataChange.next(this.dataSource2.data);
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
        request.transactionType = selectedBlock.transactionType ? selectedBlock.transactionType : null;
        request.previousId = null;
        request.parentId = null;
        request.blockOrigin = null; //data.blockOrigin;
        request.industry = selectedBlock.industry;
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
        // request.libraryReference.organization.organizationName = "";

        requestList.push(request);
      }
    });

    this.service.saveImportedBlocks(requestList)
      .subscribe((data: any) => {
        this.dialogTemplate = new Dialog();
        this.dialogTemplate.Type = DialogTypes.Success;
        this.dialogTemplate.Message = "Block(s) imported successfully.";

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          data: this.dialogTemplate
        });

        dialogRef.afterClosed().subscribe(result => {
          var option = this.themesList[0];
          option.checked = true;

          this.cancelBlockImporter();

        });
      });
  }

  getBlockAttributes() {
    this.service.getBlockAttributes()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        this.transactionList = data.transactionType;
      });
  }

  cancelBlockImporter() {
    this._eventService.getEvent("LoadSelectedTheme").publish(true);
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
  addToCollection() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    //Step 1 : insert to dragNodes
    this.dragNodes = [];
    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
      });
      this.dragNodes = nodesArray;
      nodesArray = null;
      //Step 2 : add blocks to collection
      if (this.dragNodes.length > 0) {
        this.dragNodes.forEach((element, index) => {
          this.dragNode = element;
          this.dragNode.level = 0;
          let newItem: TodoItemNode;
          newItem = this.database2.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(this.dragNodes[index]));
          this.checklistSelection["_selection"].clear();
          this.clearSelectAll();
          this.enableMergeIcon_BlockImport.next(false);
          if (!element.isSplitNode) {
            const indexTmp = this.dataSource1.data.findIndex(x => x.id == element.id);
            this.dataSource1.data.splice(indexTmp, 1);

          }
        });
        this.database1.dataChange.next(this.dataSource1.data);
        this.database2.dataChange.next(this.dataSource2.data);

        this.dragNodes = null;
        this.dragNodeExpandOverNode = null;
        this.dragNodeExpandOverTime = 0;
        this.enableDisableAddBtn();

      }
    }
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }
  // splitandAddToCollection()
  splitBlock(selectedNode) {
    this.dragNodes = [];
    var text: any;
    var htmlContent = document.createElement('html');
    if (window.getSelection) {
      text = window.getSelection();
      if (text.rangeCount) {
        var htmlBody = document.createElement('body');
        for (var i = 0; i < text.rangeCount; i++) {
          var htmlCode = text.getRangeAt(i).cloneContents();
          var htmlDiv = document.createElement('div');
          htmlDiv.appendChild(htmlCode);
          htmlBody.appendChild(htmlDiv);
        }

        // insert footnote - start
        for (var i = 0; i < text.rangeCount; i++) {
          var doc = new DOMParser().parseFromString(selectedNode.content, BlockImporter.ParseType);
          var divs = doc.getElementsByTagName('div');

          var nodeLst = window.getSelection().getRangeAt(i).cloneContents().querySelectorAll('a');
          nodeLst.forEach(item => {
            let href = item.getAttribute(BlockImporter.HREF);
            if (href != null)
              var res = href.slice(1, href.length);
            for (let el = 0; el < divs.length; el++) {
              let footNoteExists = divs[el].id.includes(BlockImporter.FootNoteId);
              if (footNoteExists && divs[el].id == res) {
                let temp = document.createElement('div');
                temp.innerHTML = divs[el].outerHTML;
                htmlBody.appendChild(temp);
              }
            }
          });
        }
        //insert footnote - end
        htmlContent.appendChild(htmlBody);
      }
    } else if (document.getSelection() && document.getSelection().type != "Control") {
    }
    let node = new TodoItemNode;
    node.content = "<html>" + htmlContent.innerHTML + "</html>";
    node.isSplitNode = true;
    node.item = selectedNode.item;
    node.id = selectedNode.id;
    let newItem = new TodoItemNode;
    newItem = this.database2.copyPasteItemBelow(node, node);
    this.database1.dataChange.next(this.dataSource1.data);
    this.database2.dataChange.next(this.dataSource2.data);
  }
  mergeBlocks_Full() {
    this.dragNodes = [];
    let newNode = new TodoItemFlatNode();
    newNode.isSplitNode = false;
    newNode.expandable = false;
    if (this.checklistSelection["_selection"].size > 0) {
      var appendedContent = "";
      var temp: TodoItemFlatNode[];
      temp = this.checklistSelection["_selection"];
      var myArr = Array.from(temp);
      for (let i = 0; i < myArr.length; i++) {
        if (i == 0) {
          newNode.item = myArr[i].item;
          newNode.id = myArr[i].id;
          let divParse = document.createElement(BlockImporter.HTMLTag);
          divParse.innerHTML = myArr[i].content;
          appendedContent += divParse.getElementsByTagName(BlockImporter.BodyTag)[0].innerHTML;
          newNode.mergedNodes.push(myArr[i].id);

        }
        else {
          appendedContent += myArr[i].item;
          let divParse = document.createElement(BlockImporter.HTMLTag);
          divParse.innerHTML = myArr[i].content;
          appendedContent += divParse.getElementsByTagName(BlockImporter.BodyTag)[0].innerHTML;
          newNode.mergedNodes.push(myArr[i].id);
        }
      }
      newNode.mergedNodes.forEach(id => {
        newNode.mergedNodes.filter(x => x != id).forEach(element => {
          this.dataSource1.data.find(x => x.id == id).mergedNodes.push(element);
        });
      });

      this.checklistSelection["_selection"].clear();
      this.clearSelectAll();
      newNode.content = "<div>" + appendedContent + "</div>";
      let newItem = new TodoItemNode;
      newItem = this.database2.copyPasteItemBelow(newNode, newNode);
      this.dragNodes.push(newNode);
      this.database1.dataChange.next(this.dataSource1.data);
      this.database2.dataChange.next(this.dataSource2.data);
    }
  }
  mergeBlocks_Partial(selectedNode) {
    var text: any;
    var htmlContent = document.createElement('html');

    if (window.getSelection) {
      text = window.getSelection();
      if (text.rangeCount) {
        var htmlBody = document.createElement('span');
        for (var i = 0; i < text.rangeCount; i++) {
          var htmlCode = text.getRangeAt(i).cloneContents();
          htmlBody.appendChild(htmlCode);
        }
        // insert footnote - start
        for (var i = 0; i < text.rangeCount; i++) {
          var doc = new DOMParser().parseFromString(selectedNode.content, BlockImporter.ParseType);
          var divs = doc.getElementsByTagName('div');

          var nodeLst = window.getSelection().getRangeAt(i).cloneContents().querySelectorAll('a');
          nodeLst.forEach(item => {
            var href = item.getAttribute(BlockImporter.HREF);
            if (href != null)
              var res = href.slice(1, href.length);
            for (let el = 0; el < divs.length; el++) {
              let footNoteExists = divs[el].id.includes(BlockImporter.FootNoteId);
              if (footNoteExists && divs[el].id == res) {
                var temp = document.createElement('div');
                temp.innerHTML = divs[el].outerHTML;
                htmlBody.appendChild(temp);
              }
            }
          });
        }
        //insert footnote - end

        htmlContent.appendChild(htmlBody);
      }
    } else if (document.getSelection() && document.getSelection().type != "Control") {
    }
    this.designerService.loadPartialMerge.next(true);
    this.designerService.partialMergeBlockTitle.next(this.designerService.partialMergeBlockTitle.value.length > 0 ? this.designerService.partialMergeBlockTitle.value : selectedNode.item);
    this.designerService.partialMergeContent.next(this.designerService.partialMergeContent.value + " " + htmlContent.innerHTML);
    this.database1.dataChange.next(this.dataSource1.data);
    this.database2.dataChange.next(this.dataSource2.data);
    // this.dialogService.open(ImportedBlocksPartialMergeComponent, {
    //   // closeOnBackdropClick: false,
    //   // closeOnEsc: true,
    //   context: { blockContent : htmlContent.innerHTML }

    // });


    // var node=this.dataSource1.data.find(x=>x.id==selectedNode.id);
    // stripH
    // node.content
    // if(node!=undefined)
    // if (node.content.indexOf(text) > -1) {
    //   node.content.replace(new RegExp(text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")), htmlContent.innerHTML);
    // }
  }
  AddBlocks_PartialMerge(title, content) {
    this.dragNodes = [];
    let node = new TodoItemNode;
    node.content = content;
    node.id = String(this.dataSource1.data.length + 1);
    node.item = title;
    let newItem = new TodoItemNode;
    newItem = this.database2.copyPasteItemBelow(node, node);
    this.database1.dataChange.next(this.dataSource1.data);
    this.database2.dataChange.next(this.dataSource2.data);
  }
  toggleCheckbox(event) {
    this.checklistSelection.clear();
    this.enableMergeIcon_BlockImport.next(false);
    if (event.target.checked) {
      this.dataSource1.data.forEach(x => {
        this.checklistSelection.toggle(this.nestedNodeMap.get(x));
        this.todoItemSelectionToggle(this.nestedNodeMap.get(x), null);
      })
    }
  }
  toggleCheckbox_dest(event) {
    this.checklistSelection_dest.clear();
    if (event.target.checked) {
      this.dataSource2.data.forEach(x => {
        this.checklistSelection_dest.toggle(this.nestedNodeMap.get(x));
        this.todoItemSelectionToggle_dest(this.nestedNodeMap.get(x), null);
      })
    }
  }
  toggleCheckbox1(event) {
    this.checklistSelection.clear();
    this.enableMergeIcon_BlockImport.next(false);
    if (event.target.checked) {
      this.dataSource1.data.forEach(x => {
        this.checklistSelection.toggle(this.nestedNodeMap.get(x));
        this.todoItemSelectionToggle(this.nestedNodeMap.get(x), null);
      })
    }
  }

  closeContextMenu() {
    document.dispatchEvent(new Event('click'));
  }
}
