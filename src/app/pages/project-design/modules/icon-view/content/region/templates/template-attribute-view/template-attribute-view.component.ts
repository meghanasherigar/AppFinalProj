// import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { IconViewService } from '../../../../services/icon-view.service';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { element } from '@angular/core/src/render3';
import { TemplateAndBlockDetails, TemplateViewModel, TemplateStackUngroupModel, TemplateBlockDemote, TemplateDeliverableViewModel, TemplateDetailsRequestModel } from '../../../../../../../../@models/projectDesigner/template';
import { TemplateService } from '../../../../../../services/template.service';
import { BlockRequest, DragDropRequestViewModel, DragDropSection, ActionType, BlockDetailsResponseViewModel, BlockDetails, ActionOnBlockStack, BlockStackViewModel, BlockAttribute, BlockType, BlockStatus, Industry, StackLevelDataModel, SubIndustry, DocumentViewIcons ,BlockState,blockColors} from '../../../../../../../../@models/projectDesigner/block';
import { NbDialogService } from '@nebular/theme';
import { CreateBlockAttributesComponent } from '../../../../manage-blocks/create-block-attributes/create-block-attributes.component';
import { LibraryReferenceViewModel, ProjectDetailsViewModel } from '../../../../../../../../@models/projectDesigner/library';
import { DesignerService } from '../../../../../../services/designer.service';
import { exists } from 'fs';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { ProjectDetails } from '../../../../../../../../@models/projectDesigner/region';
import { viewAttributeModel, regions, BlockTypeDataModel, BlockStateDataModel, BlockStatusDataModel, BlockIndustryDataModel } from '../../../../../../../../@models/projectDesigner/common';
import { StackService } from '../../../../../../services/stack.service';
import { Action } from 'rxjs/internal/scheduler/Action';
import { BlockService } from '../../../../../../services/block.service';
import { UpdateStackAttributeDetails, StackAttributeViewModel, StackLevelViewModel } from '../../../../../../../../@models/projectDesigner/stack';
import { TransactionTypeDataModel } from '../../../../../../../../@models/transaction';
import { TreeviewI18n, TreeviewI18nDefault, TreeviewSelection, TreeviewItem } from 'ngx-treeview';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { UserRightsViewModel, DocViewDeliverableRoleViewModel } from '../../../../../../../../@models/userAdmin';
import { ResponseType } from '../../../../../../../../@models/ResponseStatus';
import { ValueConstants } from '../../../../../../../../@models/common/valueconstants';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';

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
  stackLevel: StackLevelDataModel;
  isRemoved: boolean;
  title: string;
  hasChildren: boolean;
  description: string;
  blockType: BlockTypeDataModel;
  templatesUtilizedIn: string;
  transactionType: TransactionTypeDataModel;
  projectYear: number;
  blockStatus: BlockStatusDataModel;
  blockState: BlockStateDataModel;
  industry: BlockIndustryDataModel[];
  blockOrigin: string;
  creator: string;
  blocks: TodoItemNode[];
  indentation: string;
  uId:string;
  colorCode:string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  id: string;
  level: number;
  previousId: string;
  blockId: string;
  parentId: string;
  isStack: boolean;
  stackLevel: StackLevelDataModel;
  isRemoved: boolean;
  title: string;
  hasChildren: boolean;
  description: string;
  blockType: BlockTypeDataModel;
  templatesUtilizedIn: string;
  transactionType: TransactionTypeDataModel;
  projectYear: number;
  blockStatus: BlockStatusDataModel;
  blockState: BlockStateDataModel;
  industry: BlockIndustryDataModel[];
  blockOrigin: string;
  creator: string;
  blocks: BlockDetailsResponseViewModel[];
  expandable: boolean;
  nodeIndex: number;
  indentation: string;
  uId:string;
  colorCode:string;
}


@Injectable()
export class ChecklistDatabase1 {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor(private _eventService: EventAggregatorService) {
    // this.initialize();
  }

  subscriptions: Subscription = new Subscription();
  blocksResponseData: any;

  initialize() { }

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
      //this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
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
  selector: 'ngx-template-attribute-view',
  templateUrl: './template-attribute-view.component.html',
  styleUrls: ['./template-attribute-view.component.scss'],
  providers: [ChecklistDatabase1,
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
    }]
})


export class TemplateAttributeViewComponent implements OnInit, OnDestroy {
  blockColors=blockColors;
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

  //List2
  dataSource1: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
  projectDetails: ProjectContext;
  /* Drag and drop */
  dragNode: any;
  dragNodes = [];
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;
  isEnableAttribute: boolean;
  blockExpandData: any;
  selectedTemplate: TemplateViewModel;
  nodeIndex: number = 0;
  blockRequestModel: BlockRequest;
  disablePaste: boolean = false;
  templateUlitized: string;

  blockTypes: BlockType[];
  blockStates:BlockState[];
  blockStatus: BlockStatus[];
  blockIndustries = [];
  attribute: BlockAttribute;
  transactionList: TransactionTypeDataModel[];
  isLoaded: boolean = false;
  stackLevels: StackLevelViewModel[];
  stackTypes: BlockType[];
  industries: Industry[];
  templateDetailsRequestModel = new TemplateDetailsRequestModel();
  templateDeliverableList: any;
  templateBlockDetails = new TemplateAndBlockDetails();
  defaultSelectValue='--Select--';
  transactionTypeDefault = { id: ValueConstants.DefaultId, transactionType: ''};
  toolbarIcons = new DocumentViewIcons();
  userAccessRights: UserRightsViewModel;
  userRoles: DocViewDeliverableRoleViewModel[];

  loaderId = 'TemplateAttrLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  constructor(private readonly _eventService: EventAggregatorService, private database1: ChecklistDatabase1, protected storageService: StorageService,
    private service: IconViewService, private dialogService: NbDialogService,
    private templateService: TemplateService,
    private designerService: DesignerService,
    private stackService: StackService,
    private blockService: BlockService,
    private ngxLoader: NgxUiLoaderService,
    private sharedService: ShareDetailService, private toastr:ToastrService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener); //List 2
    database1.dataChange.subscribe(data => {
      this.dataSource1.data = [];
      this.dataSource1.data = data;
    });
  }

  ngOnInit() {

    
    this.nodeIndex = 0;
    var initialData: any;
    //let transactionType = this.designerService.blockAttributeDetail.transactionType.transactionType;

    this.projectDetails = this.sharedService.getORganizationDetail();
    var projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;

    if (this.projectDetails.ProjectAccessRight.isCentralUser)
      this.toolbarIcons.enableEditAttribute = true;
    else if (!this.projectDetails.ProjectAccessRight.isCentralUser) {
      if (this.designerService.docViewAccessRights) {
        this.userAccessRights = this.designerService.docViewAccessRights;
        this.toolbarIcons.enableEditAttribute = this.userAccessRights.hasProjectTemplateAccess ? true : false;
      }
    }
    this.getBlockAttributes();
    this.templateUlitized = this.designerService.templateDetails.templateName;


    //Commenting as "disablePaste" is not being used in the component
    // this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).subscribe((payload: boolean) => {
    //   this.disablePaste = payload;
    // }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetailsAttr).subscribe((payload: TemplateAndBlockDetails) => {
      this.bindBlocksForTemplate(payload);
    }));
    
  }

  bindBlocksForTemplate(payload: TemplateAndBlockDetails)
  {
    let defaultTemp = payload.template;
    this.selectedTemplate = defaultTemp;
    this.templateBlockDetails.template = defaultTemp;
    this.designerService.templateDetails = defaultTemp;
    this.templateBlockDetails.blocks = payload.blocks;
    //binding data blocks to attribute view
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.checklistSelection.clear();
    var initialData: any;
    initialData = this.templateBlockDetails.blocks;
    this.dataSource1.data = initialData;
    this.designerService.templateDetails = this.selectedTemplate = this.templateBlockDetails.template;
    this.designerService.blockList = [];
    this.service.templateId = this.selectedTemplate.templateId;
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
    flatNode.stackLevel = node.stackLevel;
    flatNode.description = node.description;
    flatNode.parentId = node.parentId;
    flatNode.nodeIndex = this.nodeIndex++;
    flatNode.hasChildren = node.hasChildren;
    flatNode.isRemoved = node.isRemoved;
    flatNode.blockState = node.blockState;
    flatNode.colorCode=node.colorCode;
    flatNode.blockType = node.blockType;
    flatNode.transactionType = (node.transactionType != null) ? node.transactionType : this.transactionTypeDefault;

    flatNode.projectYear = node.projectYear;
    flatNode.templatesUtilizedIn = node.templatesUtilizedIn;
    flatNode.blockStatus = node.blockStatus;
    flatNode.uId=node.uId;
    flatNode.industry = this.getIndustries(node.industry, this.industries);
    flatNode.indentation = node.indentation;

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

  /* To display the nested blocks on expand click of block/stack */
  expandBlock(node: TodoItemFlatNode, dragDropSave: boolean, nextNode: TodoItemFlatNode, nextNodeOfDragNode: TodoItemFlatNode, dragDropRequestModel: DragDropRequestViewModel, source: any, destination: any) {
    this.nodeIndex = 0;
    let templateId = this.selectedTemplate.templateId;
    var isStack: string = node.isStack.toString();
    let previousNode = this.treeControl.dataNodes.find(x => x.id == node.previousId);
    if (isStack == "true") {
      this.templateService.getBlocksByBlockId(templateId, node.blockId, isStack, (previousNode != undefined) ? previousNode.indentation : 0).subscribe((data: BlockDetailsResponseViewModel) => {
        this.blockExpandData = data;
        let flatnode = this.flatNodeMap.get(node);
        flatnode.blocks = this.blockExpandData;
        this.dataSource1.data = this.dataSource1.data;
        // this.treeControl.dataNodes.forEach(element => {
        //   this.getIndustries(element.industry, this.industries);
        // });
      });
    }
    else {
      let ParentstackId = this.getStackId(node);
      if (ParentstackId != null && ParentstackId != undefined && node.indentation.split('.').length === 1) {
        this.stackService.getNestedBlocksInStack(ParentstackId.blockId, node.id, node.indentation).subscribe((response: BlockDetailsResponseViewModel[]) => {
          this.blockExpandData = response;
          let flatnode = this.flatNodeMap.get(node);
          flatnode.blocks = this.blockExpandData;
          this.dataSource1.data = this.dataSource1.data;

        });
      }
      //Expand only if its the root level parent node as inner children will already be present
      if(node.indentation.split('.').length === 1)
      {
      this.templateService.getBlocksByBlockId(templateId, node.id, isStack, node.indentation).subscribe((data: BlockDetailsResponseViewModel) => {
        this.blockExpandData = data;
        let flatnode = this.flatNodeMap.get(node);
        flatnode.blocks = this.blockExpandData;
        this.dataSource1.data = this.dataSource1.data;

      });
    }
    }
  }
  getStackId(node) {
    let parentNode: any;
    let ParentstackId: any;
    for (let i = node.level; i > 0; i--) {
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
  getTemplatesDeliverables() { 
    let projectId = this.sharedService.getORganizationDetail().projectId;
    this.templateDetailsRequestModel.projectId = projectId;
    
    let currentTemplateId=this.service.templateId;
    if(currentTemplateId){
      this.templateDetailsRequestModel.templateId= currentTemplateId;
    }
    this.templateService.getTemplateDeliverables(this.templateDetailsRequestModel).subscribe((data: TemplateDeliverableViewModel[]) => {
      this.templateDeliverableList = data;

      let selectTemp= this.designerService.templateDetails;

      let defaultTemp;
      if(currentTemplateId){
        defaultTemp= this.templateDeliverableList.templates.templatesDropDown.find(x => x.templateId === selectTemp.templateId);
        }
        else
        {
         defaultTemp = this.templateDeliverableList.templates.templatesDropDown.find(x => x.isDefault == true);
        }

      this.selectedTemplate = defaultTemp;
      this.templateBlockDetails.template = defaultTemp;
      this.designerService.templateDetails = defaultTemp;
      this.templateBlockDetails.blocks = this.templateDeliverableList.templates.templateDetails.blocks;
      //binding data blocks to attribute view
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.checklistSelection.clear();
      var initialData: any;
      initialData = this.templateBlockDetails.blocks;
      this.dataSource1.data = initialData;
      this.designerService.templateDetails = this.selectedTemplate = this.templateBlockDetails.template;
      this.designerService.blockList = [];
      this.service.templateId = this.selectedTemplate.templateId;
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }
  // Saving Attribute Functions
  updateAttributeValue(event, node) {
    if(event instanceof Array)
    {
      return; // This method should be executed only when the user makes changes in the UI
    }
    
    //prevent API call as description is mandatory
    if(node.description.length===0) return;

    let updatedAttributes = new UpdateStackAttributeDetails();

    updatedAttributes.id = node.blockId;
    if (event.target.id === 'ddlStackLevel')
    {
      updatedAttributes.stackLevel = this.stackLevels.find(id => id.stackLevel == event.target.value);
    }

    if (event.target.id==='ddlTranType')
    {
      node.transactionType = this.transactionList.find(id => id.transactionType == event.target.value);
      updatedAttributes.transactionType = this.transactionList.find(id => id.transactionType == event.target.value);
    }
    if(event.target.id==='ddlBlockType')
    {
      node.blockType = this.blockTypes.find(id=> id.blockType ===  event.target.value);
      updatedAttributes.blockType = this.blockTypes.find(id=> id.blockType ===  event.target.value);
    }
    if(event.target.id==='ddlBlockStatus')
    {
      let blockStatus= this.blockStatus.find(id=> id.blockStatus ===  event.target.value);
      if(blockStatus){
      node.blockStatus= blockStatus;
      updatedAttributes.blockStatus = new BlockStatusDataModel
      {
          blockStatus.blockStatus,
          blockStatus.blockStatusId
      };
      }
    }
    
    if(!node.isStack)
    {
      updatedAttributes.blockState= node.blockState;
      updatedAttributes.blockType = node.blockType;
      updatedAttributes.transactionType= node.transactionType;
      updatedAttributes.blockStatus = node.blockStatus;
    }

    updatedAttributes.description = node.description;
    
    updatedAttributes.industry = new Array();
    if (event.type != undefined) {
      let selectedIndustries = new Array();
      node.industry.forEach(x => {
        if (x.internalChildren != undefined && x.internalChildren.length > 0) {
          let subIndustries = x.internalChildren.filter(x => x.checked == true);
          if (subIndustries != undefined) {
            subIndustries.forEach(y => {
              selectedIndustries.push(y.value);
            })
          }
        }
      })
      updatedAttributes.industry = this.getSelectedIndustries(node.industry, selectedIndustries, '');
    }
    else
      updatedAttributes.industry = this.getSelectedIndustries(node.industry, event, '');
    updatedAttributes.projectYear = node.projectYear;
    
    updatedAttributes.templatesUtilizedIn = node.templatesUtilizedIn;
    updatedAttributes.uId = node.uId;
    if(this.designerService.templateDetails){
      updatedAttributes.templateId = this.designerService.templateDetails.templateId;
      updatedAttributes.templateUId = this.designerService.templateDetails.uId;
    }
    if(this.designerService.deliverableDetails)
    {
      let deliverable = this.designerService.deliverableDetails;
      updatedAttributes.entityId = deliverable.id ? deliverable.id: deliverable.deliverableId ? deliverable.deliverableId : deliverable.entityId;
      updatedAttributes.entityUId = deliverable.uId;
    }
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
  getSelectedIndustries(allindustries, selIndustries, others) {
    let industryList = [];
    let subIndustriesName = [];

    if (selIndustries.length > 0) {
      allindustries.forEach(industry => {
        let _industry = new Industry();
        _industry.id = industry.value;
        _industry.subIndustries = [];
        selIndustries.forEach(element => {

          if (industry.internalChildren && industry.internalChildren.filter(id => id.value == element).length > 0) {
            let _subIndustry = new SubIndustry();
            _subIndustry.id = element;
            subIndustriesName = industry.internalChildren.filter(x => x.internalChecked == true);
            subIndustriesName.forEach(name => {
              _subIndustry.subIndustry = name.text;
            })
            _industry.subIndustries.push(_subIndustry);
          }
          else if (industry.value == element) {
            _industry.industryName = others;
          }
        });
        if (_industry.subIndustries.length > 0 || (_industry.industryName && _industry.industryName.length > 0)) {
          _industry.industryName = industry.text;
          industryList.push(_industry);
        }
      });
    }
    return industryList;
  }

  getBlockAttributes() {

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.blockService.getBlockMasterdata()
      .subscribe((data: BlockAttribute) => {
        this.blockTypes = data.blockType;
        this.blockStatus = data.blockStatus;
        this.blockService.getBlockTransactionTypes().subscribe((transTypes: TransactionTypeDataModel[]) => {
          //transTypes.find(c=>c.id=== ValueConstants.DefaultId).transactionType=this.defaultSelectValue;

          this.transactionList = transTypes;
        });
        this.blockStates=data.blockState;
        this.industries = data.industry;
        this.isLoaded = true;
        this.getStackAttributes();
      });
  }

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 250
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

  getStackAttributes() {
    this.stackService.getstackattributedetail()
      .subscribe((data: StackAttributeViewModel) => {
        this.stackTypes = data.stackType;
        this.stackLevels = data.stackLevel;
        this.transactionList = data.transactionType;
        this.getTemplatesDeliverables();
      });
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

