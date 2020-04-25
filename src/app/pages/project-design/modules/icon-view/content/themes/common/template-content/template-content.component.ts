import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, Input, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { IconViewService } from '../../../../services/icon-view.service';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum, ColorCode } from '../../../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { TemplateAndBlockDetails, TemplateViewModel, TemplateStackUngroupModel, TemplateBlockDemote, BlockDetail } from '../../../../../../../../@models/projectDesigner/template';
import { TemplateService } from '../../../../../../services/template.service';
import { BlockRequest, DragDropRequestViewModel, DragDropSection, ActionType, BlockDetailsResponseViewModel, BlockDetails, ActionOnBlockStack, BlockStackViewModel, blockSelectedModel, BlockType, BlockStatus, TemplateBlockDetails, BlockFilterRequestDataModel, StackModelFilter, BlockFilterDataModel } from '../../../../../../../../@models/projectDesigner/block';
import { NbDialogService } from '@nebular/theme';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, DeleteBlockViewModel, CBCBlocDeleteModel } from '../../../../../../../../@models/projectDesigner/library';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { ProjectDetails } from '../../../../../../../../@models/projectDesigner/region';
import { viewAttributeModel, regions, AddToUserLibraryModel, RightClickOptionsModel } from '../../../../../../../../@models/projectDesigner/common';
import { StackService } from '../../../../../../services/stack.service';
import { BlockService } from '../../../../../../services/block.service';
import { CheckConcurrencyRequestModel, CheckConcurrencyDestinationRequestModel, CheckConcurrencySourceRequestModel, BlockReferenceViewModel } from '../../../../../../../../@models/projectDesigner/stack';
import { Dialog, DialogTypes } from '../../../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { DialogService } from '../../../../../../.././../shared/services/dialog.service';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { debug } from 'util';
import { Router } from '@angular/router';
import { ResponseStatus, ResponseType } from '../../../../../../../../@models/ResponseStatus';
import { UserAssignmentDataModel } from '../../../../../../../../@models/projectDesigner/stack';
import { element } from '@angular/core/src/render3';
import { ValueConstants } from '../../../../../../../../@models/common/valueconstants';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ThemingContext, ThemeSection, ThemeOptions, SelectedSection, Theme, ThemeConstant } from '../../../../../../../../@models/projectDesigner/theming';
import { DesignerService } from '../../services/designer.service';
import { Designer, SubMenus } from '../../../../../../../../@models/projectDesigner/designer';
import { DesignerService as oldDesigner } from '../../../../../../services/designer.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { CreateBlockAttributesComponent } from '../manage-blocks/create-block-attributes/create-block-attributes.component';
import { TranslateService } from '@ngx-translate/core';
import { LinkToDeliverableComponent } from '../link-to-deliverable/link-to-deliverable.component';
import { AssignToComponent } from '../assign-to/assign-to.component';
import { ToastrService } from 'ngx-toastr';


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
  blockType: BlockType;
  blockStatus: BlockStatus;
  usersAssignment: UserAssignmentDataModel[];
  colorCode: string;
  uId: string;
  isReference: boolean;
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
  hasChildren: boolean;
  nodeIndex: number;
  isRemoved: boolean;
  indentation: string;
  IsPartOfstack: boolean;
  stackBlockId: string;
  blockType: BlockType;
  blockStatus: BlockStatus;
  usersAssignment: UserAssignmentDataModel[];
  colorCode: string;
  uId: string;
  isReference: boolean;
  isLocked: boolean;
  blockUser: UserAssignmentDataModel;
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

  initialize() {
    //Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //    file node as children.
    //const data = this.buildFileTree(TREE_Data_Actual, 0);
    // this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateDetails).subscribe((payload : TodoItemNode[]) => {
    //   this.blocksResponseData = payload;
    // }));
    // const data = this.buildFileTree(this.blocksResponseData, 0);

    // Notify the change.
    //this.dataChange.next(data);
  }
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
      //this.data.splice(this.data.indexOf(node), 0, newItem);
      data.splice(data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, fromNode: TodoItemNode, data: any): TodoItemNode {
    const parentNode = this.getParentFromNodes(node, data);
    const newItem = { id: fromNode.id, title: fromNode.title, level: fromNode.level, blockId: fromNode.blockId, previousId: fromNode.previousId, parentId: fromNode.parentId, isStack: fromNode.isStack, description: fromNode.description } as TodoItemNode;
    if (parentNode != null) {
      parentNode.blocks.splice(parentNode.blocks.findIndex(x => x.id == node.id) + 1, 0, newItem);
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
        if (child.id === node.id) {
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
    // node.title = newDataNode.item;
    // (this.data.find(el => el.id == node.id) != undefined) ? this.data.find(el => el.id == node.id).previousId = newDataNode.previousId : this.data.find(el => el.blocks.find(x => x.id == node.id).previousId = newDataNode.previousId);
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
  selector: 'ngx-template-content',
  templateUrl: './template-content.component.html',
  styleUrls: ['./template-content.component.scss'],
  providers: [ChecklistDatabase1]
})
export class TemplateContentComponent implements OnInit, OnDestroy {
  filter: boolean = true;
  isAllselected: boolean = false;
  selectDeselectAllBlocks: boolean;
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
  blockRequestModel: BlockStackViewModel;
  disablePaste: boolean = false;
  selectedBlocksStacks: any = [];
  blockSelectedModel = new blockSelectedModel();
  DeleteBlockViewModel: DeleteBlockViewModel = new DeleteBlockViewModel();
  CBCBlocDeleteModel: CBCBlocDeleteModel = new CBCBlocDeleteModel();
  selectedBlockListId: any = [];
  isDocumnetViewDoubleClick: boolean;
  enableCreate: boolean = true;
  enableCopy: boolean = true;
  themingContext: ThemingContext;
  private dialogTemplate: Dialog;
  @Input("section") section: any;
  selectedSection: ThemeOptions;
  designer = new Designer();
  blockViewType: string;
  hasContent: boolean = true;

  loaderId = 'TemplateLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  addToLibraryViewModel = new AddToUserLibraryModel();
  rightClickOptions = new RightClickOptionsModel();

  //Added to persist filter
  filterApplied: boolean = false;

  constructor(private readonly _eventService: EventAggregatorService, private database1: ChecklistDatabase1, protected storageService: StorageService,
    private service: IconViewService, private dialogService: NbDialogService,
    private templateService: TemplateService,
    private designerService: DesignerService,
    private oldDesignerService: oldDesigner,
    private stackService: StackService,
    private blockService: BlockService,
    private dialog: MatDialog,
    private DialogService: DialogService,
    private sharedService: ShareDetailService,
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService,
    private toastr: ToastrService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener); //List 2
    database1.dataChange.subscribe(data => {
      this.dataSource1.data = [];
      this.dataSource1.data = data;
    });
  }

  ngOnInit() {
    this.loaderId = 'TemplateLoader_' + this.section;
    this.nodeIndex = 0;
    this.themingContext = this.sharedService.getSelectedTheme();
    this.selectedSection = this.themingContext.themeOptions.filter(item => item.name == this.section)[0];
    this.designerService.currentDoubleClicked.subscribe(isDoubleClicked => this.isDocumnetViewDoubleClick = isDoubleClicked);
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.rightClickOptions.enableCreate = this.rightClickOptions.enableCopy = this.rightClickOptions.enableAddToLibrary = this.rightClickOptions.enableAssignTo = this.rightClickOptions.enableRemove = this.rightClickOptions.enableLinkTo = true;


    //Check if filter data exists in the storage already
    this.checkIfFilterDataExists();

    this.subscriptions.add(this._eventService.getEvent(this.section + "_loadTemplateContent").subscribe((payload: any) => {
      this.LoadTemplateData(payload);
    }));
    this.subscriptions.add(this._eventService.getEvent(this.section + "_loadTemplateFilterContent").subscribe((payload: boolean) => {
      this.LoadTemplateData(payload);
    }));
    this.subscriptions.add(this._eventService.getEvent(this.section + "_templateFilterApplied").subscribe((payload: boolean) => {
      this.filterApplied = payload;
    }));


    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).subscribe((template: any) => {
      this.ngxLoader.startBackgroundLoader(this.loaderId);

      if (!this.isDocumnetViewDoubleClick)
        this.designerService.clear(this.section);
      this.templateService.getTemplateBlocksByTemplateId(template.templateId).subscribe((data: TemplateBlockDetails) => {
        var templateBlockDetails = new TemplateAndBlockDetails();
        templateBlockDetails.template = data.template;
        templateBlockDetails.blocks = data.blocks;
        templateBlockDetails.filterApplied = false;
        this.selectedTemplate = this.designer.templateDetails = data.template;
        this.LoadTemplateData(templateBlockDetails);
        this.refreshDeliverableSection();
      });
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteAll).subscribe((payload) => {
      if (payload)
        this.cancelFilter();
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_loadEmptyContent").subscribe((payload) => {
      this.hasContent = false;
    }));


    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.selectAllTemp).subscribe((payload) => {
      this.selectAllBlocks();
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockView).subscribe((selectedViewType: any) => {
      this.designerService.blockViewType = this.blockViewType = selectedViewType.value;
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.TemplateSection).subscribe((payload: any) => {
      if (payload == ActionOnBlockStack.unGroupTemplate)
        this.unGroupStack();
      else if (payload == ActionOnBlockStack.demote)
        this.demoteBlock(2);
      else if (payload == ActionOnBlockStack.promote)
        this.demoteBlock(1);
      else if (payload == ActionOnBlockStack.copyToLibrary)
        this.copyToLibrary();
      else if (payload == ActionOnBlockStack.delete) {
        this.deleteblock();
      }
      else if ((payload == ActionOnBlockStack.cancelFilter)) {
        this.cancelFilter();
      }
      else
        this.disablePaste = payload;
    }));

    // this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).subscribe((payload: boolean) => {
    //   this.disablePaste = payload;
    // }));
  }

  reAssignBlockSelectionFromStorage() {
    this.themingContext = this.sharedService.getSelectedTheme();
    let currentDesigner = this.themingContext.themeOptions.find(item => item.name == this.section).designerService;
    if (currentDesigner.blockList) {
      currentDesigner.blockList.forEach(block => {
        let node = this.treeControl.dataNodes.find(x => x.id == block.id);
        if (node) {
          this.checklistSelection.toggle(node);
          this.todoItemSelectionToggle(node);
        }
      });
    }
  }

  expandNodes() {
    this.themingContext = this.sharedService.getSelectedTheme();
    let currentDesigner = this.themingContext.themeOptions.find(item => item.name == this.section).designerService;
    if (currentDesigner.expandedNodes) {
      currentDesigner.expandedNodes.forEach(node => {
        const nodeToExpand = this.treeControl.dataNodes.find(item => item.blockId == node.blockId);
        //Update the block properties before expanding
        if(nodeToExpand)
        {
          this.updateStorageBlockDetails(nodeToExpand);
          this.expandBlockFromStorage(nodeToExpand);
          this.treeControl.expand(nodeToExpand);
        }
      });
    }
}

  //This is the function to update the block attributes in case of operatins like
  //promote and demote where the indentation changes
  updateStorageBlockDetails(node,remove=false)
  {
      this.themingContext = this.sharedService.getSelectedTheme();
      let currentDesigner = this.themingContext.themeOptions.find(item => item.name == this.section);
      const expandedNodes = currentDesigner.designerService.expandedNodes;
      if (expandedNodes.length > 0) {
        const findNode = expandedNodes.find(item => item.blockId === node.blockId);
        const idx= expandedNodes.findIndex(item => item.blockId === node.blockId);
        if (findNode && expandedNodes.length>0 && idx >-1) {
          //Now, replace the old node with new node
          expandedNodes.splice(idx,1,node);
        }
      } 
      currentDesigner.designerService.expandedNodes = expandedNodes;
      this.sharedService.setSelectedTheme(this.themingContext);
  }

  ngAfterViewInit() {
    if (this.designer.blockDetails != null && this.designer.isExtendedIconicView) {
      var _nodeIndex = this.designer.blockDetails.nodeIndex;
      setTimeout(function () {
        document.getElementById("item_" + _nodeIndex).parentElement.classList.add("block-active");
      }, 1500)
    }
  }

  disableDeleteForLockedBlock() {
    let dataPublish = new blockSelectedModel();
    dataPublish.lockedBlockSelected = this.designer.assignToBlockList.length > 0 && this.designer.assignToBlockList.filter(x => x.isLocked).length == 0;
    this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.disableDeleteForLockedBlock).publish(dataPublish);
  }
  LoadTemplateData(payload) {
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
    this.hasContent = true;

    let isNewDesignerInstance: boolean = true;
    if (this.designer != null && this.designer.templateDetails != null && this.designer.templateDetails.templateId == payload.template.templateId) {
      isNewDesignerInstance = false;
    }

    if (isNewDesignerInstance) {
      let deliverableDesigner = this.designerService.themeOptions.find(item => item.name == this.section);
      if (!deliverableDesigner) {
        let themeList = this.sharedService.getSelectedTheme();
        let selected = themeList.themeOptions.filter(item => item.name === this.section)[0];
        if (selected)
          this.designerService.themeOptions.push(selected);
      }
      //Existing code:
      this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService = new Designer();
    }
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    //this.designer= this.themingContext.themeOptions.find(x=>x.name== this.section).designerService;

    this.rightClickOptions.enableCreate = this.rightClickOptions.enableCopy = true;
    this.disablePaste = false;
    this.filter = true;

    this.blockViewType = this.designerService.blockViewType;
    if (payload.filterApplied == true)
      this.filter = false;
    this.nodeIndex = 0;
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.checklistSelection.clear();
    var initialData: any;
    if (payload.blocks && payload.blocks.length) {
      initialData = payload.blocks;
      this.dataSource1.data = initialData;
    }
    else {
      this.database1.dataChange.next(this.getEmptyNode());
    }
    this.designer.templateDetails = this.selectedTemplate = payload.template;
    if (this.designer.blockDetails != null) {
      if (this.isDocumnetViewDoubleClick) {
        var node = this.treeControl.dataNodes.find(x => x.id == this.designer.blockDetails.id);
        if (node != undefined) {
          this.checklistSelection.toggle(node);
        }
      }
      else {
        this.checklistSelection.toggle(this.designer.blockDetails)
      }
    }

    this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
    this.blockSelectedModel.blockSelectCount = this.designer.blockList.length;
    if (this.blockSelectedModel.nodeCount == 0)
      this.rightClickOptions.enableLinkTo = this.rightClickOptions.enableCopy = this.rightClickOptions.enableAddToLibrary = this.rightClickOptions.enableAssignTo = this.rightClickOptions.enableRemove = false;
    else
      this.rightClickOptions.enableLinkTo = this.rightClickOptions.enableCopy = this.rightClickOptions.enableAddToLibrary = this.rightClickOptions.enableAssignTo = this.rightClickOptions.enableRemove = true;
    this.designer.blockList = [];
    this.designer.assignToBlockList = [];
    this.designerService.clear(this.section);

    if (payload.filterApplied == false) {
      this.reAssignBlockSelectionFromStorage();
      this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(this.blockSelectedModel);
      this.disableDeleteForLockedBlock();
      this.expandNodes();

    }
    else {
      this.blockSelectedModel.nodeCount = 0;
      this.blockSelectedModel.blockSelectCount = 0;
      this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(this.blockSelectedModel);
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((true)));
    }

    let themeContext = this.themingContext.themeOptions.find(x => x.name == this.section);

    let templateId = themeContext.data && themeContext.data.template && themeContext.data.template.templateId ?
      themeContext.data.template.templateId : this.designer.templateDetails.templateId;

    this.service.templateId = templateId;
    this.ngxLoader.stopLoaderAll(this.loaderId);
  }

  checkIfFilterDataExists() {
    let themeContext = this.themingContext.themeOptions.find(x => x.name == this.section);
    let currentDesignerService = this.themingContext.themeOptions.find(x => x.name == this.section).designerService;

    let templateId = themeContext.data && themeContext.data.template && themeContext.data.template.templateId ?
      themeContext.data.template.templateId : this.designer.templateDetails ? this.designer.templateDetails.templateId : '';
    if (templateId) {
      let templateBlockFilter = this.designerService.CheckIfFilterExsists(this.section, templateId);

      if (templateBlockFilter && (templateBlockFilter.stackFilter || templateBlockFilter.blockFilterData)) {
        this.filterApplied = true;
        this.blockService.blockSelectedFilter(templateBlockFilter).subscribe((response: any) => {
          let payload = new TemplateAndBlockDetails();
          payload.blocks = response;
          payload.template = currentDesignerService.templateDetails;
          payload.filterApplied = true;
          this.subscriptions.add(this._eventService.getEvent(this.section + "_loadTemplateFilterContent").publish(payload));
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" +
            eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((true)));
        });
      }
      else {
        this.filterApplied = false;
      }
    }
  }

  getEmptyNode() {
    let newNode: any = {};
    newNode.id = '';
    newNode.item = '';
    newNode.parentId = ValueConstants.DefaultId;
    newNode.previousId = ValueConstants.DefaultId;
    let data: any = [];
    data.push(newNode);
    return data;
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
    flatNode.item = node.title == "" ? node.description : node.title;
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
    flatNode.indentation = node.indentation;
    flatNode.usersAssignment = node.usersAssignment;
    // flatNode.expandable = (node.blocks && node.blocks.length > 0);
    flatNode.blockType = node.blockType;
    flatNode.blockStatus = node.blockStatus;
    flatNode.colorCode = node.colorCode;
    flatNode.uId = node.uId;
    flatNode.isLocked = node.isLocked;
    flatNode.blockUser = node.blockUser;
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
  expandBlock(node: TodoItemFlatNode, dragDropSave?: boolean, nextNode?: TodoItemFlatNode, nextNodeOfDragNode?: TodoItemFlatNode, dragDropRequestModel?: DragDropRequestViewModel, source?: any, destination?: any) {
    if (this.checklistSelection.isSelected(node) && node.isStack) {
      const descendants = this.treeControl.getDescendants(node);
      this.checklistSelection.deselect(...descendants);
    }
    if (this.treeControl.isExpanded(node)) {
      this.saveExpandedNodes(node);
    }
    if (this.treeControl.isExpanded(node) && node.level == 0) {
      this.nodeIndex = 0;
      let templateId = this.selectedTemplate.templateId;
      var isStack: string = node.isStack.toString();
      var previousNode = this.treeControl.dataNodes.find(x => x.id == node.previousId);
      if (isStack == "true") {
        this.templateService.getBlocksByBlockId(templateId, node.blockId, isStack, (previousNode != undefined) ? previousNode.indentation : 0).subscribe((data: BlockDetailsResponseViewModel) => {
          this.blockExpandData = data;
          let flatnode = this.flatNodeMap.get(node);
          flatnode.blocks = this.blockExpandData;
          this.dataSource1.data = this.dataSource1.data;
          this.todoItemSelectionToggle(node);
        });
      }
      else {
        var ParentstackId = this.getStackId(node);
        if (ParentstackId != null && ParentstackId != undefined) {
          this.stackService.getNestedBlocksInStack(ParentstackId.blockId, node.id, node.indentation).subscribe((response: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = response;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource1.data = this.dataSource1.data;
            this.todoItemSelectionToggle(node);

          });
        }
        else {
          this.templateService.getBlocksByBlockId(templateId, node.id, isStack, node.indentation).subscribe((data: BlockDetailsResponseViewModel) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource1.data = this.dataSource1.data;
            this.todoItemSelectionToggle(node);

          });
        }
      }
    }

    if (!this.treeControl.isExpanded(node)) {
      this.removeExpandedNodes(node);
    }

  }

  expandBlockFromStorage(node: TodoItemFlatNode, ) {
    if (!this.treeControl.isExpanded(node) && node.level == 0) {
      this.nodeIndex = 0;
      let templateId = this.selectedTemplate.templateId;
      var isStack: string = node.isStack.toString();
      var previousNode = this.treeControl.dataNodes.find(x => x.id == node.previousId);
      if (isStack == "true") {
        this.templateService.getBlocksByBlockId(templateId, node.blockId, isStack, (previousNode != undefined) ? previousNode.indentation : 0).subscribe((data: BlockDetailsResponseViewModel) => {
          this.blockExpandData = data;
          const currentNode = this.dataSource1.data.find(item => item.blockId == node.blockId);
          let flatnode = currentNode;
          if (flatnode) {
            flatnode.blocks = this.blockExpandData;
          }
          this.dataSource1.data = this.dataSource1.data;
          this.todoItemSelectionToggle(node);
          this.expandNestedInsideStack();
        });
      }
      else {
        var ParentstackId = this.getStackId(node);
        if (ParentstackId != null && ParentstackId != undefined) {
          this.stackService.getNestedBlocksInStack(ParentstackId.blockId, node.id, node.indentation).subscribe((response: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = response;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource1.data = this.dataSource1.data;
            this.todoItemSelectionToggle(node);

          });
        }
        else {
          this.templateService.getBlocksByBlockId(templateId, node.id, isStack, node.indentation).subscribe((data: BlockDetailsResponseViewModel) => {
            this.blockExpandData = data;
            const currentNode = this.dataSource1.data.find(item => item.blockId == node.blockId);
            let flatnode = currentNode;
            if (flatnode) {
              flatnode.blocks = this.blockExpandData;
            }
            this.dataSource1.data = this.dataSource1.data;
            this.todoItemSelectionToggle(node);
            this.expandNestedInsideStack();
          });
        }
      }
    }
  }

  expandNestedInsideStack() {
    const themingContext = this.sharedService.getSelectedTheme();
    let currentDesigner = themingContext.themeOptions.find(item => item.name == this.section).designerService;
    if (currentDesigner.expandedNodes) {
      const nestedBlocksInsideStack = currentDesigner.expandedNodes;
      if (nestedBlocksInsideStack.length > 0) {
        nestedBlocksInsideStack.forEach(element => {
          const nodeToExpand = this.treeControl.dataNodes.find(item => item.blockId == element.blockId);
          if (nodeToExpand)
            this.treeControl.expand(nodeToExpand);
        });
      }
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
    //this.checklistSelection.toggle(node);
    this.designer.blockList = [];
    this.designer.assignToBlockList = [];
    this.designerService.clear(this.section);
    if (this.checklistSelection.isSelected(node)) {
      this.designer.blockDetails = node;
      let parentNode = this.getStackId(node);
      if (parentNode) {
        this.designer.blockDetails.parentUId = parentNode.uId;
      }
    }
    else
      this.designer.blockDetails = null;
    const descendants = this.treeControl.getDescendants(node);;
    if (node.isStack || this.isAllselected)
      this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);
    this.todoParentSelection(node);

    this.rightClickOptions.enableCreate = this.rightClickOptions.enableCopy = true;
    this.disablePaste = false;
    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
        this.designer.assignToBlockList.push(element);
      });
      nodesArray.forEach((ele) => {
        var item = this.flatNodeMap.get(ele);
        if (ele.isStack)
          this.getSelectedBlocks(item, nodesArray);
      });
      nodesArray.forEach(el => {
        this.designer.blockList.push(el);
      })

      if (this.designer.blockDetails == null && nodesArray.length == 1)
        this.designer.blockDetails = nodesArray[0];

    }
    this.selectedBlock();
    if (this.designer.isExtendedIconicView && !node.isStack) {
      this.designer.blockDetails = node;
      var activeClasses = document.getElementsByClassName("block-active");
      for (var i = 0; i < activeClasses.length; i++) {
        activeClasses[i].classList.remove("block-active")
      }

      document.getElementById("item_" + node.nodeIndex).parentElement.classList.add("block-active");
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.iconExtendedView).publish(undefined);
    }
    //Save data to persist when navigation happens through other sections 
    this.saveSelectedThemeData();
  }

  /* Select/Deselect the parent node*/
  todoParentSelection(node: TodoItemFlatNode): void {
    var parentNode = this.database1.getParentFromNodes(this.flatNodeMap.get(node), this.dataSource1.data);
    if (parentNode != undefined) {
      // if (!this.checklistSelection.isSelected(node))
      //   this.checklistSelection.deselect(this.nestedNodeMap.get(parentNode));
      // else {
      //   // var allchildren = this.descendantsAllSelected(this.nestedNodeMap.get(parentNode));
      //   // if (allchildren && parentNode.isStack)
      //   //   this.checklistSelection.select(this.nestedNodeMap.get(parentNode));
      // }
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
  selectAllBlocks() {
    this.isAllselected = true;
    if (this.checklistSelection["_selection"].size > 0 && this.checklistSelection["_selection"].size != this.treeControl.dataNodes.length)
      this.checklistSelection.clear();
    this.dataSource1.data.forEach(x => {
      this.checklistSelection.toggle(this.nestedNodeMap.get(x));
      this.todoItemSelectionToggle(this.nestedNodeMap.get(x));
    })
    this.isAllselected = false;
    //this.designer.blockList = this.checklistSelection["_selection"];
  }
  validateBlockSelectionForDelete(blockList: BlockDetails[]) {
    let isValid = true;
    this.treeControl.dataNodes.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack != undefined) {
        x.stackBlockId = parentStack.blockId;
      }
    });
    blockList.forEach(element => {
      if (element.parentId && element.parentId != ValueConstants.DefaultId) {
        let parentNode = this.treeControl.dataNodes.find(x => x.blockId == element.parentId || x.id == element.parentId);
        if (parentNode.isStack) {
          let deleteBlockList = blockList.filter(b => b.stackBlockId == parentNode.blockId || b.stackBlockId == parentNode.id);
          let totalNodesInStack = this.treeControl.dataNodes.filter(b => b.stackBlockId == parentNode.blockId || b.stackBlockId == parentNode.id);
          let nestedBlockToDelete = deleteBlockList.filter(x => x.hasChildren);
          let excludedDelete = 0;
          nestedBlockToDelete.forEach(n => {
            excludedDelete += this.treeControl.dataNodes.filter(child => child.parentId == n.id || child.parentId == n.blockId).length;

          })
          if (totalNodesInStack.length - (deleteBlockList.length + excludedDelete) < 2) {
            isValid = false;
            return false;
          }
        }
      }
    });
    return isValid;
  }

  selectedBlock() {
    this.designer.blockList.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack != undefined)
        x.stackBlockId = parentStack.blockId;
    })
    this.selectedBlocksStacks = this.designer.blockList;
    this.blockSelectedModel.blockSelectCount = this.selectedBlocksStacks.length;
    this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
    this.blockSelectedModel.isStack = false;
    this.blockSelectedModel.BlockStackRemoveAllowed = true;
    if (this.selectedBlocksStacks.length > 0) {
      this.selectedBlocksStacks.forEach(element => {
        if (element.isStack == true) {
          this.blockSelectedModel.isStack = true;
        }
        var parentStack = this.treeControl.dataNodes.find(x => x.blockId == element.parentId);
        if (parentStack != undefined && parentStack.isStack && this.flatNodeMap.get(parentStack).blocks.length == 1)
          this.blockSelectedModel.BlockStackRemoveAllowed = false;
      });
      this.blockSelectedModel.previousId = this.selectedBlocksStacks[0].previousId;
      if (this.blockSelectedModel.previousId == undefined)
        this.blockSelectedModel.previousId = ValueConstants.DefaultId;
      this.blockSelectedModel.nodeLevel = this.selectedBlocksStacks[0].level;
      var parentIds = this.selectedBlocksStacks.map(x => x.parentId);
      var parentStack = this.treeControl.dataNodes.filter(x => parentIds.includes(x.blockId) && x.isStack);
      this.blockSelectedModel.isParentStack = (parentStack && parentStack.length > 0);

    }
    //Publish if filter is not applied
    if (!this.filterApplied) {
      this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(this.blockSelectedModel);
    }



  }


  cancelFilter() {

    this.templateService.getTemplateBlocksByTemplateId(this.selectedTemplate.templateId)
      .subscribe((data: any) => {

        this.filter = true;
        this.designerService.clear(this.section);
        this.dataSource1.data = [];
        this.dataSource1.data = data.blocks;
        //Reset the chosen values. Also check if designer.Clear needs to be called.
        this.designer.blockList = [];
        this.designer.assignToBlockList = [];

        this.designerService.clear(this.section);
        var dataPublish = new blockSelectedModel();
        dataPublish.blockSelectCount = 0;
        dataPublish.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
        this.selectedTemplate = this.designer.templateDetails = data.template;
        this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);


      });
  }

  deleteblock() {

    this.designer.blockList.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack) {
        x.stackBlockId = parentStack.blockId;
        x.IsPartOfstack = true;
        x.parentUId = parentStack.uId;
      }
    });
    if (!this.validateBlockSelectionForDelete(this.designer.blockList)) {
      this.DialogService.Open(DialogTypes.Warning, "Stack should have 2 blocks atleast.");
      return false;
    }
    this.DeleteBlockViewModel.blockDetails = this.designer.blockList;
    this.DeleteBlockViewModel.libraryReferenceModel = new LibraryReferenceViewModel();
    this.DeleteBlockViewModel.libraryReferenceModel.template = this.designer.templateDetails;
    this.DeleteBlockViewModel.libraryReferenceModel.country = null;
    this.DeleteBlockViewModel.libraryReferenceModel.deliverable = null;
    this.DeleteBlockViewModel.libraryReferenceModel.global = false;
    this.DeleteBlockViewModel.libraryReferenceModel.organization = this.sharedService.getORganizationDetail();
    this.DeleteBlockViewModel.libraryReferenceModel.project = null;

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordRemoveConfirmationMessage');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blockService.deleteBlocks(this.DeleteBlockViewModel, null).subscribe(
          response => {
            if (response && response.responseType === ResponseType.Mismatch) {
              this.toastr.warning(response.errorMessages.toString());
            } else {
              this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockDeleted'));

              this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails));
            }
            this.service.selectedNodes = [];
            this.designer.blockList = [];
            this.designer.assignToBlockList = [];
            this.designerService.clear(this.section);
            this.checklistSelection.clear();
          },
          error => {
            this.DialogService.Open(DialogTypes.Warning, error.message);
          });
      }
    });
  }
  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    //
    this.isEnableAttribute = false;
    let payload = this.isEnableAttribute;
    // let payload= new viewAttributeModel();
    // payload.regionType=regions.library;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payload));

    //
    const parentNode = this.flatNodeMap.get(node);
    //this.database1.insertItem(parentNode, '',this.dataSource1.data);
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemNode, newDataNode: BlockRequest) {
    this.database1.updateItem(node, newDataNode);
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    // event.dataTransfer.setData('foo', 'bar');
    // event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);

    //Skip drag-drop when filter is applied
    if (this.filterApplied) { return; };

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
    this.service.source = DragDropSection.Template;
    this.service.sourceId = this.designer.templateDetails.templateId;
    this.service.sourceUId = this.designer.templateDetails.uId;
    this.service.flatNodeMap = this.flatNodeMap;
    this.service.sourceAutomaticPropagation = this.designer.templateDetails.automaticPropagation;
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

    if (!node.blockId)
      this.dragNodeExpandOverArea = 'below';
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

  removeDropCss() {
    var belowelement = document.getElementsByClassName("drop-below");
    var aboveelement = document.getElementsByClassName("drop-above");
    for (var i = 0; i < belowelement.length; i++)
      belowelement[i].classList.remove("drop-below");
    for (var i = 0; i < aboveelement.length; i++)
      aboveelement[i].classList.remove("drop-above");
  }

  handleDrop(event, node) {
    event.preventDefault();
    var message = '';
    if (this.service.source == DragDropSection.Template && this.service.sourceId != this.designer.templateDetails.templateId) {
      message = "Drag and drop across template is restricted.";
    }

    if (this.service.source == DragDropSection.Deliverable) {
      message = "Drag and drop from deliverable to template is restricted.";
    }

    if (message != '') {
      this.dialogTemplate = new Dialog();
      this.dialogTemplate.Type = DialogTypes.Warning;
      this.dialogTemplate.Message = message;

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: this.dialogTemplate
      });

      dialogRef.afterClosed().subscribe(result => {
        this.removeDropCss();
      });

      if (message != '') return;
    }

    this.removeDropCss();
    //Check Concurrency 
    var concurrencyRequest = new CheckConcurrencyRequestModel();
    var concurrencyDestination = new CheckConcurrencyDestinationRequestModel();
    var concurrencySource = new CheckConcurrencySourceRequestModel();
    var blockList: BlockReferenceViewModel[] = new Array();
    var dragDropRequestModel = new DragDropRequestViewModel();
    dragDropRequestModel.dragDropList = new Array();
    let deliverableBlock = this.service.dragNodes.find(x => x.colorCode == ColorCode.Teal);
    if (deliverableBlock || (this.service.dragNode && this.service.dragNode.colorCode == ColorCode.Teal)) {
      let errorMsg = this.translate.instant('screens.project-designer.iconview.DragDropDeliverableBlockFromCBCToTemplate');
      this.DialogService.Open(DialogTypes.Error, errorMsg);
      this.removeDropCss();
      return;
    }
    this.PrepareConcurrencyRequest(concurrencyDestination, node, concurrencySource);
    if (this.dragNodes.length > 0) {
      this.dragNodes = this.dragNodes.sort((a,b)=> {
        return a.nodeIndex - b.nodeIndex;
      });
      this.dragNodes.forEach((element, index) => {
        this.dragNode = element;
        this.prepareConcurrencySourceRequestModel(blockList);
        if (node !== this.dragNode) {
          var nextNode: any;
          var nextNodeOfDragNode: any;
          let newItem: TodoItemNode;
          if (this.dragNodeExpandOverArea === 'above') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
            newItem = this.database1.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
            this.database1.deleteItem(this.flatNodeMap.get(this.dragNode));
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          } else if (this.dragNodeExpandOverArea === 'below') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
            nextNodeOfDragNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
            if (index == 0)
              newItem = this.database1.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
            else {
              newItem = this.database1.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(this.dragNodes[index - 1]), this.dataSource1.data);
            }
            this.database1.deleteItem(this.flatNodeMap.get(this.dragNode));
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          } else {
            //this.expandBlock(node, true, nextNode, nextNodeOfDragNode, dragDropRequestModel, this.service.source, DragDropSection.Template);
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
            newItem = this.database1.copyPasteItemAbove(this.service.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          } else if (this.dragNodeExpandOverArea === 'below') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
            if (index == 0)
              newItem = this.database1.copyPasteItemBelow(this.service.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
            else
              newItem = this.database1.copyPasteItemBelow(this.service.flatNodeMap.get(this.dragNode), this.service.flatNodeMap.get(this.service.dragNodes[index - 1]), this.dataSource1.data);
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          } else {
            // this.expandBlock(node, true, nextNode, nextNodeOfDragNode, dragDropRequestModel, this.service.source, DragDropSection.Template);
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
          newItem = this.database1.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.database1.deleteItem(this.flatNodeMap.get(this.dragNode));
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          nextNodeOfDragNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
          newItem = this.database1.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.database1.deleteItem(this.flatNodeMap.get(this.dragNode));
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else {
          // this.expandBlock(node, true, nextNode, nextNodeOfDragNode, dragDropRequestModel, this.service.source, DragDropSection.Template);
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
          newItem = this.database1.copyPasteItemAbove(this.service.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          newItem = this.database1.copyPasteItemBelow(this.service.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else {
          // this.expandBlock(node, true, nextNode, nextNodeOfDragNode, dragDropRequestModel, this.service.source, DragDropSection.Template);
          return;
        }
      }
    }

  }

  private PrepareConcurrencyRequest(concurrencyDestination: CheckConcurrencyDestinationRequestModel, node: any, concurrencySource: CheckConcurrencySourceRequestModel) {
    concurrencyDestination.section = DragDropSection.Template.toString();
    concurrencyDestination.sectionId = this.selectedTemplate.templateId;
    this.prepareConcurrencyDestinationRequestModel(node, concurrencyDestination);
    concurrencySource.section = this.service.source.toString();
    if (this.service.source == 1)
      concurrencySource.section = this.selectedTemplate.templateId;
  }

  private refreshDeliverableSection() {
    if (this.selectedTemplate.automaticPropagation) {
      this.themingContext = this.sharedService.getSelectedTheme();
      let selectedDeliverable = this.themingContext.themeOptions.find(x => x.data && x.data.deliverable != undefined);
      if (selectedDeliverable && !this.designerService.pushBack && selectedDeliverable.data.deliverable.templateId == this.designer.templateDetails.templateId) {
        this.subscriptions.add(this._eventService.getEvent(selectedDeliverable.name + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(selectedDeliverable.data.deliverable));
      }
      this.designerService.pushBack = false;
    }
  }

  private SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource) {
    //call check concurrency API
    // concurrencyRequest.source = concurrencySource;
    //concurrencyRequest.destination = concurrencyDestination;
    // this.service.checkConcurrency(concurrencyRequest).subscribe(response => {
    //Save block dragged and dropped from library to template
    // if (!response) {
    this.service.saveDragDrop(dragDropRequestModel).subscribe(response => {
      //refresh the tree data after save
      if (response && response.responseType === ResponseType.Mismatch) {
        this.toastr.warning(response.errorMessages.toString());
      }
      else {
        this.templateService.getTemplateBlocksByTemplateId(this.selectedTemplate.templateId).subscribe((data: any) => {
          this.dataSource1.data = [];
          this.dataSource1.data = data.blocks;
          this.selectedTemplate = this.designer.templateDetails = data.template;
          this.refreshDeliverableSection();
        });
      }
    })
    // }
    // });
    this.service.dragNode = null;
    this.service.dragNodes = [];
    this.service.flatNodeMap = null;
    this.dragNode = null;
    this.dragNodes = [];
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.checklistSelection.clear();
    this.designer.blockList = [];
    this.designer.assignToBlockList = [];
    this.designerService.clear(this.section);
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
    libraryReferenceModel.organization = this.sharedService.getORganizationDetail();
    dragDropRequestModel.libraryReference = libraryReferenceModel;
    if (dragDropRequestModel.source == 1 && dragDropRequestModel.destination == 1)
      dragDropRequestModel.action = this.GetActionType(dragDropRequestModel, this.dragNode, node, this.flatNodeMap);
    else
      dragDropRequestModel.action = this.GetActionType(dragDropRequestModel, this.dragNode, node, this.service.flatNodeMap);

    this.treeControl.dataNodes.find(x => x.id == this.dragNode.id).parentId = node.parentId;
    if (dragDropRequestModel.source == 1 && dragDropRequestModel.destination == 1) {
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
    else if (dragDropRequestModel.source == DragDropSection.CBC) {
      this.dragNode.blockOrigin = this.dragNode.blockId;
      this.GetDragDropRequestModel(dragDropRequestModel, this.dragNode, this.service.flatNodeMap, true, true);
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
    // let parentNodeOfCurrent: any;
    // let parentNodeOfNode = this.treeControl.dataNodes.find(x => x.id == node.parentId || x.blockId == node.parentId);
    // flatNodeMap.forEach(element => {
    //   if (element.id == currentNode.parentId || element.blockId == currentNode.parentId) {
    //     parentNodeOfCurrent = element;
    //     return;
    //   }
    // });
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
    var obj = this.getSaveModel(node, flatNodeMap);
    obj.isStack = node.isStack;
    obj.isCopy = isCopy;
    obj.isNew = isNew;
    obj.blockOrigin = node.blockOrigin;
    obj.hasChildren = node.hasChildren;
    var libraryReferenceModel = new LibraryReferenceViewModel();
    libraryReferenceModel.template = this.selectedTemplate;
    obj.libraryReference = libraryReferenceModel;
    //  this.saveNode(flatNodeMap.get(node), obj);
    var indexExistNod = dragDropRequestModel.dragDropList.findIndex(el => el.id == obj.id);
    if (indexExistNod > -1)
      dragDropRequestModel.dragDropList.splice(indexExistNod, 1);
    dragDropRequestModel.dragDropList.push(obj);
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

  handleDragLeave() {
    this.dragNodeExpandOverArea = null;
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverArea = null;
    this.dragNodeExpandOverTime = 0;
    this.service.dragNode = null;
    this.service.dragNodes = [];
    this.dragNodes = [];
    this.checklistSelection.clear();
  }

  createBlock(node) {

    this.designer.blockList = [];
    this.designer.blockList.push(node);
    this.designer.blockDetails = node;

    this.dialogService.open(CreateBlockAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      context: { section: this.section }
    });
  }

  pasteStackOrBlock(node) {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    var concurrencyRequest = new CheckConcurrencyRequestModel();
    var concurrencyDestination = new CheckConcurrencyDestinationRequestModel();
    var concurrencySource = new CheckConcurrencySourceRequestModel();
    var blockList: BlockReferenceViewModel[] = new Array();
    let copyblocksList: BlockStackViewModel[] = new Array();
    // this.prepareConcurrencySourceRequestModel(blockList);
    this.designer.blocksToBeCopied.forEach((item, index) => {
      this.blockRequestModel = new BlockStackViewModel();
      this.blockRequestModel.id = item.id;
      this.blockRequestModel.blockId = item.blockId;
      this.blockRequestModel.isStack = item.isStack;
      this.blockRequestModel.previousId = index == 0 ? node.id : null;
      this.blockRequestModel.parentId = node.parentId;
      this.blockRequestModel.description = item.description;
      this.blockRequestModel.isCopy = this.designer.isCopied;
      this.blockRequestModel.libraryReference = this.getLibraryreference();
      this.blockRequestModel.hasChildren = item.hasChildren;
      let parentnode = this.treeControl.dataNodes.find(x => x.blockId == node.parentId);
      if (parentnode) {
        this.blockRequestModel.parentUId = parentnode.uId;
      }
      copyblocksList.push(this.blockRequestModel);
    });

    if (this.designer.isCopied) {
      //Concurrency check 
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.blockService.copyBlocksStacks(copyblocksList).subscribe((data: any) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        if (data && data.responseType === ResponseType.Mismatch) {
          this.toastr.warning(data.errorMessages.toString());
        }
        else {
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails));
          this.disablePaste = false;
          var dataPublish = new blockSelectedModel();
          dataPublish.blockSelectCount = 0;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);
        }
      });
    }
  }

  // To get the library refernce
  getLibraryreference() {
    var libraryReference = new LibraryReferenceViewModel();

    //section to assign template info if a block has been created from template section
    if (this.designer.templateDetails != null) {
      libraryReference.template = new TemplateViewModel();
      libraryReference.template.isDefault = this.designer.templateDetails.isDefault;
      libraryReference.template.templateId = this.designer.templateDetails.templateId;
      libraryReference.template.templateName = this.designer.templateDetails.templateName;
      libraryReference.template.uId = this.designer.templateDetails.uId;
    }

    //section to assgin library info if a block has been created from cbc section
    libraryReference.global = false;
    if (this.projectDetails != null) {
      libraryReference.project = new ProjectDetailsViewModel();
      libraryReference.project.projectId = this.projectDetails.projectId;
      libraryReference.project.projectName = this.projectDetails.projectName;
      libraryReference.project.projectYear = this.projectDetails.fiscalYear;
    }
    libraryReference.organization = this.sharedService.getORganizationDetail();
    return libraryReference;
  }

  doubleClick(node) {
    let payload: any;
    payload = {};
    payload.section = "Template";
    //document view for single-block selection mode
    this.designer.LoadAllBlocksDocumentView = false;
    this.designer.blockDetails = node;
    this.designer.blockList.push(this.designer.blockDetails);
    var nodesArray: TodoItemFlatNode[];
    nodesArray = [];
    this.checklistSelection["_selection"].forEach(element => {
      nodesArray.push(element);
    });

    this.oldDesignerService.changeTabDocumentView(SubMenus.Editor);
    this.designerService.changeIsDoubleClicked(this.section, true);

    //map to old designer -- starts
    this.oldDesignerService.isTemplateSection = true;
    this.oldDesignerService.isDeliverableSection = false;
    this.oldDesignerService.isLibrarySection = false;
    this.oldDesignerService.templateDetails = this.designer.templateDetails;
    this.oldDesignerService.LoadAllBlocksDocumentView = this.designer.LoadAllBlocksDocumentView;
    this.oldDesignerService.blockDetails = this.designer.blockDetails;
    this.oldDesignerService.blockList.push(this.designer.blockDetails);
    this.oldDesignerService.changeIsDoubleClicked(true);
    //map to old desinger -- ends

    this.saveSelectedThemeData();
    this.navigateToEditor();
  }
  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  saveSelectedThemeData() {
    this.themingContext = this.sharedService.getSelectedTheme();
    let currentDesigner = this.themingContext.themeOptions.find(item => item.name == this.section);
    const uniqueBlockList = new Set(this.designer.blockList);

    currentDesigner.designerService.blockList = Array.from(uniqueBlockList.values());
    currentDesigner.designerService.blockDetails = this.designer.blockDetails;

    this.sharedService.setSelectedTheme(this.themingContext);
    this.disableDeleteForLockedBlock();
  }

  saveExpandedNodes(node) {
    this.themingContext = this.sharedService.getSelectedTheme();
    let currentDesigner = this.themingContext.themeOptions.find(item => item.name == this.section);
    const expandedNodes = currentDesigner.designerService.expandedNodes;
    if (expandedNodes.length > 0) {
      const findNode = expandedNodes.find(item => item.blockId === node.blockId);
      if (!findNode) {
        expandedNodes.push(node);
      }
    } else {
      expandedNodes.push(node);
    }
    currentDesigner.designerService.expandedNodes = expandedNodes;
    this.sharedService.setSelectedTheme(this.themingContext);
  }

  removeExpandedNodes(node) {
    this.themingContext = this.sharedService.getSelectedTheme();
    let currentDesigner = this.themingContext.themeOptions.find(item => item.name == this.section);
    const expandedNodes = currentDesigner.designerService.expandedNodes;
    if (expandedNodes.length > 0) {
      const index = expandedNodes.findIndex(item => item.blockId === node.blockId);
      if (index !== -1) {
        expandedNodes.splice(index, 1);
      }
    }
    currentDesigner.designerService.expandedNodes = expandedNodes;
    this.sharedService.setSelectedTheme(this.themingContext);
  }

  demoteBlock(action) {
    if (this.selectedBlocksStacks.length > 0) {
      let blockDemote = new TemplateBlockDemote();
      if ((action == 2 && !this.selectedBlocksStacks[0].isStack && this.selectedBlocksStacks[0].previousId != ValueConstants.DefaultId)
        || (action == 1 && !this.selectedBlocksStacks[0].isStack && this.selectedBlocksStacks[0].level > 0)) {
        blockDemote.templateId = this.selectedTemplate.templateId;
        blockDemote.templateUid = this.selectedTemplate.uId;
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
        this.service.promoteDemoteTemplateBlock(blockDemote, action).subscribe((data: any) => {
          if (data && data.responseType === ResponseType.Mismatch) {
            this.toastr.warning(data.errorMessages.toString());
          }
          else if (data) {
            this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails);
          }
        });
      }
    }
  }

  unGroupStack() {
    if (this.selectedBlocksStacks.length == 1) {
      let selectedStackArr: TodoItemNode[] = new Array();
      this.checklistSelection["_selection"].forEach(element => {
        selectedStackArr.push(element);
      });

      let selectedStack = selectedStackArr[0];

      const stackToUngroup = new TemplateStackUngroupModel();
      //stackToUngroup.deliverableId = this.service.deliverableId;
      stackToUngroup.templateId = this.designer.templateDetails.templateId;
      stackToUngroup.stackId = selectedStack.blockId;
      stackToUngroup.projectId = this.projectDetails.projectId;
      stackToUngroup.stackUid = selectedStack.uId;
      stackToUngroup.templateUid = this.designer.templateDetails.uId;
      this.ngxLoader.startBackgroundLoader(this.loaderId);

      this.stackService.StackUngroup(stackToUngroup).subscribe(
        (response: any) => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);

          if (response && response.isSuccess) {
            this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails);
            //Reload deliverable section similar to link-to feature
            //Below event is getting fired multiple times and hence using cancel filter event
            //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable            
            // this._eventService.getEvent(this.section + "_" + EventConstants.DeliverableSection).publish(ActionOnBlockStack.cancelFilter);
          }
          else {
            if (response && response.responseType === ResponseType.Mismatch) {
              this.toastr.warning(response.errorMessages.toString());
            }
          }
        },
        error => {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });

    }

  }

  copySelectedItems(node) {

    if (this.designer.blockList.length == 0) {
      this.designer.blockList = [];
      this.designer.blockList.push(node);
    }
    this.designer.isCopied = true;
    this.designer.blocksToBeCopied = new Array();
    this.designer.blocksToBeCopied = this.designer.blockList;
    this.disablePaste = true;
  }

  copyToLibrary() {
    this.selectedBlockListId = [];
    this.selectedBlocksStacks = this.designer.blockList;

    this.selectedBlocksStacks.forEach(element => {
      this.selectedBlockListId.push(element.blockId);
    })
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.AddtoUserLibrary;
    this.dialogTemplate.Message = this.translate.instant("screens.project-designer.iconview.stackAddedtoUserlibAlert");

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addToLibraryViewModel.DeliverableId = null;
        this.addToLibraryViewModel.ProjectId = this.projectDetails.projectId;
        this.addToLibraryViewModel.Blocks = this.selectedBlockListId;
        this.blockService.copyToLibrary(this.addToLibraryViewModel).subscribe(response => {
          if (response.status === 1) {
            let themingContext = this.sharedService.getSelectedTheme();
            if (themingContext.theme == ThemeConstant.Theme1)
              this._eventService.getEvent(ThemeSection.Theme1_1 + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
            else {
              this._eventService.getEvent(ThemeSection.Theme2_1 + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
              this._eventService.getEvent(ThemeSection.Theme2_2 + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
            }
            this.toastr.success(this.translate.instant('Copied to user library successfully'));

          }
          else {
            this.DialogService.Open(DialogTypes.Error, "Error Occured");
          }
        })
      }
    })
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  pasteStackOrBlockAsReference(node) {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    let payload: any = {};
    payload.templateId = this.designer.templateDetails.templateId;
    payload.blocks = this.designer.blocksToBeCopied;
    payload.uId = this.designer.templateDetails.uId;
    payload.blocks.forEach((item, index) => {
      item.previousId = index == 0 ? node.id : eventConstantsEnum.emptyGuid;
      item.parentId = node.parentId;

      item.isParentStack = false;
      if (item.parentId != eventConstantsEnum.emptyGuid) {
        let parentRecord = this.dataSource1.data.filter(id => id.blockId == item.parentId);
        if (parentRecord.length > 0) {
          item.isParentStack = parentRecord[0].isStack;
          item.parentUId = parentRecord[0].uId;
        }
      }
    });

    if (this.designer.isCopied) {
      //Concurrency check 
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.blockService.copyBlocksStacksAsReference(payload).subscribe((response: any) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        if (response && response.responseType === ResponseType.Mismatch) {
          this.toastr.warning(response.errorMessages.toString());
        }
        else {
          this.toastr.success(this.translate.instant('screens.project-designer.iconview.blocksCopiedSuccessMsg'));
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designer.templateDetails));
          this.disablePaste = false;
          var dataPublish = new blockSelectedModel();
          dataPublish.blockSelectCount = 0;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);
        }
      });
    }
  }

  linkTo(node) {
    if (this.designer.blockList.length == 0) {
      this.designer.blockList = [];
      this.designer.blockList.push(node);
    }

    this.dialogService.open(LinkToDeliverableComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
      context: { section: this.section }
    });
  }

  assignTo(node) {
    if (this.designer.blockList.length == 0) {
      this.designer.blockList = [];
      this.designer.blockList.push(node);
      this.designer.assignToBlockList.push(node);
    }
    this.assignToPopup(false);
  }

  assignToPopup(assignAll: boolean) {
    this.dialogService.open(AssignToComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
      context: { section: this.section, reportReview: assignAll }
    });
  }

  remove(node) {
    if (this.designer.blockList.length == 0) {
      this.designer.blockList = [];
      this.designer.blockList.push(node);
    }

    let payLoad = ActionOnBlockStack.delete;
    var eventToPublish = this.designer.templateDetails != null ? EventConstants.TemplateSection : EventConstants.DeliverableSection;
    this._eventService.getEvent(this.section + "_" + eventToPublish).publish(payLoad);
  }

  addToUserLibrary(node) {
    if (this.designer.blockList.length == 0) {
      this.designer.blockList = [];
      this.designer.blockList.push(node);
    }
    var eventToPublish = this.designer.templateDetails != null ? EventConstants.TemplateSection : EventConstants.DeliverableSection;
    this._eventService.getEvent(this.section + "_" + eventToPublish).publish(ActionOnBlockStack.copyToLibrary);
  }

  closeContextMenu() {
    document.dispatchEvent(new Event('click'));
  }

}