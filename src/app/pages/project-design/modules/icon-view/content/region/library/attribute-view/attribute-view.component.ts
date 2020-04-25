// import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconViewService } from '../../../../services/icon-view.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../../../@models/common/eventConstants';
import { LibraryBlockDetails, LibraryDropdownViewModel, SearchLibraryViewModel } from '../../../../../../../../@models/projectDesigner/library';
import { LibraryService } from '../../../../../../services/library.service';
import { BlockDetailsResponseViewModel, DragDropRequestViewModel, DragDropSection, BlockAttribute, BlockType, BlockStatus, Industry, SubIndustry, BlockState } from '../../../../../../../../@models/projectDesigner/block';
import { BlockTypeDataModel, BlockStatusDataModel, BlockStateDataModel, BlockIndustryDataModel } from '../../../../../../../../@models/projectDesigner/common';
import { BlockService } from '../../../../../../services/block.service';
import { TransactionTypeDataModel } from '../../../../../../../../@models/transaction';
import { TreeviewItem } from 'ngx-treeview';
import { UpdateStackAttributeDetails, StackLevelViewModel, StackAttributeViewModel } from '../../../../../../../../@models/projectDesigner/stack';
import { StackService } from '../../../../../../services/stack.service';
import { DesignerService } from '../../../../../../services/designer.service';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { ResponseType } from '../../../../../../../../@models/ResponseStatus';
import { ToastrService } from 'ngx-toastr';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  id : string;
  level : number;
  previousId : string;
  blockId : string;
  parentId : string;
  isStack : boolean;
  isRemoved : boolean;
  title : string;
  hasChildren : boolean;
  description : string;
  blockType : BlockTypeDataModel;
  templatesUtilizedIn : string;
  transactionType : string;
  projectYear : number;
  blockStatus : BlockStatusDataModel;
  blockState : BlockStateDataModel;
  industry: BlockIndustryDataModel[];
  blockOrigin : string;
  creator : string;
  blocks: TodoItemNode[];
  uId:string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  id : string;
  level : number;
  previousId : string;
  blockId : string;
  parentId : string;
  isStack : boolean;
  isRemoved : boolean;
  title : string;
  hasChildren : boolean;
  description : string;
  blockType : BlockTypeDataModel;
  templatesUtilizedIn : string;
  transactionType : string;
  projectYear : number;
  blockStatus : BlockStatusDataModel;
  blockState : BlockStateDataModel;
  industry: BlockIndustryDataModel[];
  blockOrigin : string;
  creator : string;
  blocks : BlockDetailsResponseViewModel[];
  expandable: boolean;
  nodeIndex: number;
  uId:string;
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
export class AttributeViewComponent  implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  buttonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark'
  ];
  buttonClass = this.buttonClasses[0];

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
  requestModel = new SearchLibraryViewModel();
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;
  selectedLibrary: LibraryDropdownViewModel;
  blockExpandData: any;
  nodeIndex: number = 0;
  disabled:boolean=false;
  blockTypes: BlockType[];
  blockStatus: BlockStatus[];
  blockIndustries = [];
  industries: Industry[];
  attribute: BlockAttribute;
  stackTypes: BlockType[];
  blockStates:BlockState[];
  stackLevels: StackLevelViewModel[];
  transactionList : TransactionTypeDataModel[];
  constructor(private database: ChecklistDatabase1, private service: IconViewService,private designerService: DesignerService, private sharedDetailService: ShareDetailService,
    private readonly _eventService: EventAggregatorService, private libraryService: LibraryService, private blockService: BlockService, private stackService: StackService, private toastr : ToastrService) {
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
    this.getBlockAttributes();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).subscribe((payload: LibraryBlockDetails) => {
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      initialData = payload.blocks;
      this.dataSource.data = initialData;
      this.selectedLibrary = payload.library;
      this.getStackAttributes();
    }));
  }

  expandBlock(node: TodoItemFlatNode) {
    var isStack: string = node.isStack.toString();
    if (this.treeControl.isExpanded(node) && (node.level == 0 || node.level == 1)&& (isStack == "true")) {
        
        this.disabled=false;
        this.libraryService.getBlocks(node.blockId).subscribe((data: BlockDetailsResponseViewModel[]) => {
          
          this.blockExpandData = data;
          let flatnode = this.flatNodeMap.get(node);
          flatnode.blocks = this.blockExpandData;
          this.dataSource.data = this.dataSource.data;
        });
      
    }
    if (this.treeControl.isExpanded(node) && (node.level == 0 || node.level == 1)&& (isStack == "false")) {
        this.requestModel.isGlobal = this.designerService.filterLibraryModel.isGlobal;
        this.requestModel.isAdmin = false;
        this.requestModel.categoryId = node.blockId;
        if (this.designerService.libraryDetails.name == EventConstants.Global) {
          this.disabled=true;
          this.requestModel.isGlobal = true;
          this.libraryService.getGlobalTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
          })
        } else if (this.designerService.libraryDetails.name == EventConstants.Country) {
          this.disabled=true;
          this.requestModel.isGlobal = false;
          this.libraryService.getCountryTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
          })
        } else if (this.designerService.libraryDetails.name == EventConstants.User) {
          this.disabled=false;
          this.libraryService.getPersonalTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
          })
        } else if (this.designerService.libraryDetails.name == EventConstants.Organization) {
          this.disabled=false;
          this.requestModel.organizationId = this.sharedDetailService.getORganizationDetail().organizationId;
          this.libraryService.getOrgTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
          })
        } else if (this.designerService.libraryDetails.name == EventConstants.BlockCollection) {
          this.disabled=false;
          this.requestModel.organizationId = this.sharedDetailService.getORganizationDetail().organizationId;
          this.libraryService.getBlockCollection(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
          })
        }
      
       else {
         
           this.disabled=false;
        this.libraryService.getBlocks(node.blockId).subscribe((data: BlockDetailsResponseViewModel[]) => {
          this.blockExpandData = data;
          let flatnode = this.flatNodeMap.get(node);
          flatnode.blocks = this.blockExpandData;
          this.dataSource.data = this.dataSource.data;
        });
      }
    }
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.blocks;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.title === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.title === node.title
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.id = node.id;
    flatNode.title = node.title;
    flatNode.blockId = node.blockId;
    flatNode.level = level;
    flatNode.expandable = node.hasChildren;
    flatNode.previousId = node.previousId;
    flatNode.isStack = node.isStack;
    flatNode.description = node.description;
    flatNode.parentId = node.parentId;
    flatNode.nodeIndex = this.nodeIndex++;
    flatNode.hasChildren = node.hasChildren;
    flatNode.isRemoved = node.isRemoved; 

    flatNode.blockType = node.blockType;
    flatNode.blockState=node.blockState;
    flatNode.transactionType = node.transactionType;
 
    flatNode.projectYear = node.projectYear;
    flatNode.templatesUtilizedIn = node.templatesUtilizedIn;
    flatNode.blockStatus = node.blockStatus;
    flatNode.blockState = node.blockState;
    flatNode.industry = this.getIndustries(node.industry, this.industries);
    flatNode.uId=node.uId;

    // flatNode.expandable = (node.blocks && node.blocks.length > 0);
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
  
  getBlockAttributes() {

    this.blockService.getBlockMasterdata()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        this.blockStates = data.blockState;
        this.blockService.getBlockTransactionTypes().subscribe((transTypes: TransactionTypeDataModel[]) => {
          this.transactionList = transTypes;
        });
        this.industries = data.industry;
      });
  }

  config = {  
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 250
  }
  getSelectedIndustries(allindustries, selIndustries, others) {
    var industryList = [];
    var subIndustriesName =[];

    if (selIndustries.length > 0) {
      allindustries.forEach(industry => {
        var _industry = new Industry();
        _industry.id = industry.value;
        _industry.subIndustries = [];
        selIndustries.forEach(element => {

          if (industry.internalChildren && industry.internalChildren.filter(id => id.value == element).length > 0) {
            var _subIndustry = new SubIndustry();
            _subIndustry.id = element;
            subIndustriesName = industry.internalChildren.filter(x=>x.internalChecked==true);
            subIndustriesName.forEach(name => {
              _subIndustry.subIndustry = name.text;
            })
            _industry.subIndustries.push(_subIndustry);
          }
          else if (industry.value == element) {
            _industry.industryName = others;
          }
        });
        if (_industry.subIndustries.length > 0 || (_industry.industryName && _industry.industryName.length > 0)){
          _industry.industryName =industry.text;
          industryList.push(_industry);
        }
      });
    }
    return industryList;
  }
  getIndustries(selectedIndustries, data: Industry[]) {
    var _industries = [];
    data.forEach(element => {
      var isIndustrySelected = false;
      var selectedIndustry = selectedIndustries.filter(item => item.id == element.id);
      if (selectedIndustry && selectedIndustry.length > 0)
        isIndustrySelected = true;

      var subIndustries = [];
      element.subIndustries.forEach(subelement => {
        var isSubIndustrySelected = false;

        if (isIndustrySelected && selectedIndustry[0].subIndustries.length > 0) {
          var subIndustrySelected = selectedIndustry[0].subIndustries.filter(item => item.id == subelement.id);

          if (subIndustrySelected && subIndustrySelected.length > 0)
            isSubIndustrySelected = true;
        }

        subIndustries.push(new TreeviewItem({ checked: isSubIndustrySelected, text: subelement.subIndustry, value: subelement.id }));

      });

      if (!element.subIndustries || element.subIndustries.length == 0) {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id }));

        // if (element && element.industryName.indexOf('Other') > -1 && selectedIndustry.length > 0) {
        //   if (this.editBlockForm.controls["BlockIndustryOthers"])
        //     this.editBlockForm.controls["BlockIndustryOthers"].setValue(selectedIndustry[0].industry);
        // }
      }
      else {
        _industries.push(new TreeviewItem({ checked: isIndustrySelected, text: element.industryName, value: element.id, children: subIndustries }));
      }
    });

    return Object.assign([], _industries);
  }


  updateAttributeValue(event, node) {

    if(event instanceof Array)
    {
      return; // This method should be executed only when the user makes changes in the UI
    }
    let updatedAttributes = new UpdateStackAttributeDetails();
    updatedAttributes.id = node.blockId;
    if (node.stackLevel != "" && node.stackLevel != null) {
      updatedAttributes.stackLevel = this.stackLevels.filter(id => id.stackLevel == node.stackLevel.stackLevel)[0];
    }
    if (node.transactionType)
      updatedAttributes.transactionType = this.transactionList.filter(id => id.transactionType == node.transactionType.transactionType)[0];

    updatedAttributes.description = node.description;
    if (node.blockType != "" && node.blockType != null) {
      updatedAttributes.blockType = this.stackTypes.filter(id => id.blockTypeId == node.blockType)[0];
    }
    updatedAttributes.blockType = node.blockType;
    updatedAttributes.blockState=node.blockState;
    updatedAttributes.industry = new Array();
    if (event.type != undefined){
      var selectedIndustries = new Array();
      node.industry.forEach(x => {
        if(x.internalChildren != undefined && x.internalChildren.length > 0)
        {
            var subIndustries = x.internalChildren.filter(x => x.checked == true);
            if(subIndustries != undefined)
              {
                subIndustries.forEach(y => {
                  selectedIndustries.push(y.value);
                })
              }
        }
      })
      updatedAttributes.industry = this.getSelectedIndustries(node.industry,selectedIndustries,'');
    }
    else
      updatedAttributes.industry = this.getSelectedIndustries(node.industry, event, '');
    updatedAttributes.projectYear = node.projectYear;
    updatedAttributes.blockStatus = node.blockStatus;
    updatedAttributes.templatesUtilizedIn = node.templatesUtilizedIn;
    updatedAttributes.uId = node.uId;
    this.stackService.updateStackAttributeDetails(updatedAttributes).subscribe(
      (response: any) => {
        if(response && response.responseType === ResponseType.Mismatch)
        {
          this.toastr.warning(response.errorMessages.toString());
        }
        else{
          node.uId = response.responseData; 
          this.treeControl.dataNodes.filter(item => item.blockId == node.blockId).forEach(x=>{
            x.uId = node.uId;
            x.description = node.description;
            x.blockType = node.blockType;
            x.blockState=node.blockState;
          });
        }  
      });

  }
  getStackAttributes() {
    this.stackService.getstackattributedetail()
      .subscribe((data: StackAttributeViewModel) => {
        this.stackTypes = data.stackType;
        this.stackLevels = data.stackLevel;
        this.transactionList = data.transactionType;
      });
  }
    
}
