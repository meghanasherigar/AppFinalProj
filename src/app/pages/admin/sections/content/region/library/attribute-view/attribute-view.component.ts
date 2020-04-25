// import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, OnDestroy} from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconViewService } from '../../../../../services/icon-view.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../@models/common/eventConstants';
import { LibraryBlockDetails, LibraryDropdownViewModel } from '../../../../../../../@models/projectDesigner/library';
import { LibraryService } from '../../../../../services/library.service';
import { BlockDetailsResponseViewModel, BlockType, BlockStatus } from '../../../../../../../@models/projectDesigner/block';
import { UserAssignmentDataModel } from '../../../../../../../@models/projectDesigner/stack';
/**
 * Node for to-do item
 */
export class TodoItemNode {
  // children: TodoItemNode[];
  // item: string;
  //new structure
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
  isCategory:boolean;
  usersAssignment: UserAssignmentDataModel[];
  blockType: BlockType;
  blockStatus:BlockStatus;
  uId:string;
  libraryUId: string;
  libraryId: string;
  isReference:boolean;
  isLocked:boolean;
  blockUser:UserAssignmentDataModel;
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
  colorCode: string;
  isCategory:boolean;
  usersAssignment: UserAssignmentDataModel[];
  blockType: BlockType;
  blockStatus:BlockStatus;
  uId:string;
  libraryUId: string;
  libraryId: string;
  isReference:boolean;
  isLocked:boolean;
  blockUser:UserAssignmentDataModel;
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

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string): TodoItemNode {
    if (!parent.blocks) {
      parent.blocks = [];
    }
    const newItem = { title: name } as TodoItemNode;
    parent.blocks.push(newItem);
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemAbove(node: TodoItemNode, name: string): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { title: name } as TodoItemNode;
    if (parentNode != null) {
      parentNode.blocks.splice(parentNode.blocks.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, name: string): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { title: name } as TodoItemNode;
    if (parentNode != null) {
      parentNode.blocks.splice(parentNode.blocks.indexOf(node) + 1, 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
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
    if (currentRoot.blocks && currentRoot.blocks.length > 0) {
      for (let i = 0; i < currentRoot.blocks.length; ++i) {
        const child = currentRoot.blocks[i];
        if (child === node) {
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

  updateItem(node: TodoItemNode, name: string) {
    node.title = name;
    this.dataChange.next(this.data);
  }

  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItem(to, from.title);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemAbove(to, from.title);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemBelow(to, from.title);
    if (from.blocks) {
      from.blocks.forEach(child => {
        this.copyPasteItem(child, newItem);
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
  selector: 'ngx-attribute-view',
  templateUrl: './attribute-view.component.html',
  styleUrls: ['./attribute-view.component.scss'],
  providers: [ChecklistDatabase1]
})
export class AttributeViewComponent implements OnInit,OnDestroy {
  subscriptions: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // constructor() { }

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

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  //List2

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
  selectedLibrary: LibraryDropdownViewModel;
  blockExpandData: any;

  constructor(private database: ChecklistDatabase1, private service: IconViewService,
    private readonly _eventService: EventAggregatorService, private libraryService: LibraryService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    var initialData: any;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).subscribe((payload: LibraryBlockDetails) => {
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      initialData = payload.blocks;
      this.dataSource.data = initialData;
      this.selectedLibrary = payload.library;
    }));
  }

  expandBlock(node: TodoItemFlatNode) {
    this.libraryService.getBlocks(node.blockId).subscribe((data: BlockDetailsResponseViewModel[]) => {
      this.blockExpandData = data;
      let flatnode = this.flatNodeMap.get(node);
      flatnode.blocks = this.blockExpandData;
      this.dataSource.data = this.dataSource.data;
    });
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
    flatNode.description = node.description;
    flatNode.parentId = node.parentId;
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
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.database.insertItem(parentNode, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode, itemValue);
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    //  event.dataTransfer.setData('foo', 'bar');
    // event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
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
    this.service.flatNodeMap = this.flatNodeMap;
    this.treeControl.collapse(node);
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
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  handleDrop(event, node) {
    event.preventDefault();
    if (this.dragNodes.length > 0) {
      this.dragNodes.forEach(element => {
        this.dragNode = element;
        if (node !== this.dragNode) {
          let newItem: TodoItemNode;
          if (this.dragNodeExpandOverArea === 'above') {
            newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
          } else if (this.dragNodeExpandOverArea === 'below') {
            newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
          } else {
            newItem = this.database.copyPasteItem(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
          }
          this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
          this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
        }
        this.dragNode = null;
        this.dragNodeExpandOverNode = null;
        this.dragNodeExpandOverTime = 0;
      });
      this.dragNodes = [];
      this.checklistSelection.clear();
    }
    else {
      if (node !== this.dragNode) {
        let newItem: TodoItemNode;
        if (this.dragNodeExpandOverArea === 'above') {
          newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
        } else if (this.dragNodeExpandOverArea === 'below') {
          newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
        } else {
          newItem = this.database.copyPasteItem(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
        }
        this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
        this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
      }
      this.dragNode = null;
      this.dragNodeExpandOverNode = null;
      this.dragNodeExpandOverTime = 0;
      this.service.dragNode = null;
      this.service.dragNodes = [];
      this.service.flatNodeMap = null;
    }
    this.checklistSelection.clear();
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.checklistSelection.clear();
  }
  promoteBlocks(event) {
    if (this.checklistSelection["_selection"].size > 0) {
      if (this.checklistSelection["_selection"].size > 1) {
        return;
      }
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
      nodesArray.forEach(element => {
        var parent = this.database.getParentFromNodes(this.flatNodeMap.get(element));
        if (parent != null) {
          var ind = parent.blocks.indexOf(this.flatNodeMap.get(element));
          //promoting descendents also
          var nodes = Object.assign([], parent.blocks);
          for (var k = ind + 1; k < nodes.length; k++) {
            this.dragNode = this.nestedNodeMap.get(nodes[k]);
            this.dragNodeExpandOverArea = "center";
            this.handleDrop(event, element);
          }
          this.dragNode = element;
          this.dragNodeExpandOverArea = "below";
          this.handleDrop(event, this.nestedNodeMap.get(parent));
        }
      });
    }

  }
  demoteBlocks(event) {
    if (this.checklistSelection["_selection"].size > 0) {
      if (this.checklistSelection["_selection"].size > 1) {
        return;
      }
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
      nodesArray.forEach(element => {
        var index = this.treeControl.dataNodes.indexOf(element);
        for (var k = index - 1; k > -1; k--) {
          var node = this.treeControl.dataNodes[k];
          if (node.level == element.level) {
            this.dragNode = element;
            this.dragNodeExpandOverArea = "center";
            this.handleDrop(event, node);
            break;
          }
        }
      });
    }
  }
}

