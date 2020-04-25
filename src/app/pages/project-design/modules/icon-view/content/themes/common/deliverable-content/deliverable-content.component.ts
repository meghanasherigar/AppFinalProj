import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, Input, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { IconViewService } from '../../../../services/icon-view.service';
import { DragDropRequestViewModel, DragDropSection, ActionType, BlockRequest, BlockDetailsResponseViewModel, ActionOnBlockStack, BlockStackViewModel, blockSelectedModel, BlockType, BlockStatus, BlockDetails, DeliverableRequestViewModel, StackModelFilter, BlockFilterDataModel } from '../../../../../../../../@models/projectDesigner/block';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, DeleteBlockViewModel, CBCBlocDeleteModel } from '../../../../../../../../@models/projectDesigner/library';
import { ProjectDetails } from '../../../../../../../../@models/projectDesigner/region';
import { eventConstantsEnum, EventConstants, ColorCode } from '../../../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { TemplateAndBlockDetails, TemplateViewModel, TemplateStackUngroupModel, TemplateBlockDemote, BlockDetail } from '../../../../../../../../@models/projectDesigner/template';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { DeliverableChildNodes, DeliverablesInput, DeliverableResponseViewModel, DeliverableViewModel, EntityViewModel } from '../../../../../../../../@models/projectDesigner/deliverable';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { initTransferState } from '@angular/platform-browser/src/browser/transfer_state';
import { Subscription } from 'rxjs';
import { regions, AddToUserLibraryModel, GenericResponseModel, RightClickOptionsModel } from '../../../../../../../../@models/projectDesigner/common';
import { StackService } from '../../../../../../services/stack.service';
import { BlockService } from '../../../../../../services/block.service';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { debug } from 'util';
import { CheckConcurrencyRequestModel, CheckConcurrencyDestinationRequestModel, CheckConcurrencySourceRequestModel, BlockReferenceViewModel, UserAssignmentDataModel } from '../../../../../../../../@models/projectDesigner/stack';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { ResponseStatus, ResponseType, GenericResponse } from '../../../../../../../../@models/ResponseStatus';
import { DialogTypes, Dialog } from '../../../../../../../../@models/common/dialog';
import { ValueConstants } from '../../../../../../../../@models/common/valueconstants';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ThemeSection, ThemingContext, Theme, ThemeConstant } from '../../../../../../../../@models/projectDesigner/theming';
import { DesignerService } from '../../services/designer.service';
import { Designer, SubMenus } from '../../../../../../../../@models/projectDesigner/designer';
import { DesignerService as oldDesigner } from '../../../../../../services/designer.service';
import { ProjectDeliverableRightViewModel, DeliverableRoleViewModel } from '../../../../../../../../@models/userAdmin';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { CreateBlockAttributesComponent } from '../manage-blocks/create-block-attributes/create-block-attributes.component';
import { NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
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
  usersAssignment: UserAssignmentDataModel[];
  colorCode: string;
  blockType: BlockType;
  uId: string;
  blockStatus: BlockStatus;
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
  usersAssignment: UserAssignmentDataModel[];
  colorCode: string;
  blockType: BlockType;
  blockStatus: BlockStatus;
  uId: string;
  isReference: boolean;
  isLocked: boolean;
  blockUser: UserAssignmentDataModel;
}


@Injectable()
export class ChecklistDatabase1 {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

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

  updateItem(node: TodoItemNode, name: string) {
    node.title = name;
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
  selector: 'ngx-deliverable-content',
  templateUrl: './deliverable-content.component.html',
  styleUrls: ['./deliverable-content.component.scss'],
  providers: [ChecklistDatabase1]
})
export class DeliverableContentComponent implements OnInit, OnDestroy {
  filter: boolean = true;
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
  selectedTemplate: TemplateViewModel;
  blockExpandData: any;
  deliverableChildNodes = new DeliverableChildNodes();
  deliverablesInput = new DeliverablesInput();
  selectedDeliverable: DeliverableViewModel;
  subscriptions: Subscription = new Subscription();
  blockRequestModel: BlockStackViewModel;
  DeleteBlockViewModel: DeleteBlockViewModel = new DeleteBlockViewModel();
  CBCBlocDeleteModel: CBCBlocDeleteModel = new CBCBlocDeleteModel();
  disablePaste: boolean = false;
  blockSelectedModel = new blockSelectedModel();
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  selectedBlocksStacks: any = [];
  nodeIndex: number = 0;
  enableCreate: boolean = true;
  isDocumnetViewDoubleClick: any;
  dialogDeliverable: Dialog;
  @Input("section") section: any;
  designer = new Designer();
  themingContext: ThemingContext;
  blockViewType: string;
  hasContent: boolean = true;
  projectUserRightsData: ProjectDeliverableRightViewModel;
  accessRights: DeliverableRoleViewModel;
  loaderId = 'DeliverableLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  addToLibraryViewModel = new AddToUserLibraryModel();
  //Added to persist filter
  filterApplied: boolean = false;
  rightClickOptions = new RightClickOptionsModel();

  constructor(private database1: ChecklistDatabase1, private dialog: MatDialog, private router: Router, private service: IconViewService, private confirmationDialogService: DialogService,
    private readonly _eventService: EventAggregatorService, private designerService: DesignerService,
    private deliverableService: DeliverableService, private storageService: StorageService, private stackService: StackService,
    private oldDesignerService: oldDesigner, private translate: TranslateService,
    private blockService: BlockService, private sharedService: ShareDetailService, private DialogService: DialogService, private ngxLoader: NgxUiLoaderService, private dialogService: NbDialogService,
    private toastr: ToastrService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener); //List 2
    database1.dataChange.subscribe(data => {
      this.dataSource1.data = [];
      this.dataSource1.data = data;
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
    flatNode.indentation = node.indentation;
    flatNode.usersAssignment = node.usersAssignment;
    flatNode.colorCode = node.colorCode;
    flatNode.blockType = node.blockType;
    flatNode.blockStatus = node.blockStatus;
    flatNode.uId = node.uId;
    flatNode.isReference = node.isReference;
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
  ngOnInit() {
    this.loaderId = 'DeliverableLoader_' + this.section;
    this.nodeIndex = 0;
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.themingContext = this.sharedService.getSelectedTheme();
    this.rightClickOptions.enableCreate = this.rightClickOptions.enableCopy = this.rightClickOptions.enableAddToLibrary = this.rightClickOptions.enableAssignTo = this.rightClickOptions.enableRemove = true;
    this.designerService.currentDoubleClicked.subscribe(isDoubleClicked => this.isDocumnetViewDoubleClick = isDoubleClicked);
    //Check if filter data exists in the storage already
    this.checkIfFilterDataExists();
    this.subscriptions.add(this._eventService.getEvent(this.section + "_loadDeliverableContent").subscribe((payload: any) => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.blockViewType = this.designerService.blockViewType;
      this.hasContent = true;
      // this.filterApplied = false;
      if (!payload.filterApplied) {
        this.filterApplied = payload.filterApplied;
      }

      this.nodeIndex = 0;
      this.loadDeliverableContent(payload);
    }));

    this.loadDeliverableFilterContent();

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteAll).subscribe((payload) => {
      if (payload)
        this.cancelFilter();
    }));
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockView).subscribe((selectedViewType: any) => {
      this.designerService.blockViewType = this.blockViewType = selectedViewType.value;
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).subscribe((payload: any) => {
      this.filterApplied = false;
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      if (!this.isDocumnetViewDoubleClick)
        this.designerService.clear(this.section);
      this.deliverableService.getDeliverable(payload).subscribe((data: DeliverableResponseViewModel) => {
        data.templateName = payload.templateName;
        this.subscriptions.add(this._eventService.getEvent(this.section + "_loadDeliverableContent").publish(data));
        this.processDeliverable(payload, data);
      });
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_loadEmptyContent").subscribe((payload) => {
      this.hasContent = false;
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetails).subscribe((payload: TemplateAndBlockDetails) => {
      this.nodeIndex = 0;
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.checklistSelection.clear();
      var initialData: any;
      initialData = payload.blocks;
      if (initialData) this.dataSource1.data = initialData;
      this.designer.templateDetails = this.selectedTemplate = payload.template;
      this.deliverablesInput.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
      this.deliverablesInput.templateId = this.selectedTemplate.templateId;
      this.getDeliverableBlocks(this.deliverablesInput);
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
      this.designer.blockList = [];
      this.designer.assignToBlockList = [];
      this.designerService.clear(this.section);
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.blockSelectedModel.blockSelectCount = this.designer.blockList.length;
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.DeliverableSection).publish(this.blockSelectedModel));
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.disableDropdown).publish("disable"));
    }));
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetailsFilter).subscribe((payload: TemplateAndBlockDetails) => {
      this.nodeIndex = 0;
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
      if (payload.filterApplied == true)
        this.filter = false;
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.checklistSelection.clear();
      let initialData: any;
      initialData = payload.blocks;
      if (initialData) this.dataSource1.data = initialData;
      this.deliverablesInput.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
      this.deliverablesInput.templateId = this.designer.deliverableDetails.templateId;
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
      this.designer.blockList = [];
      this.designer.assignToBlockList = [];
      this.designerService.clear(this.section);
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.blockSelectedModel.blockSelectCount = this.designer.blockList.length;
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.DeliverableSection).publish(this.blockSelectedModel));
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.disableDropdown).publish("disable"));
    }));
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.DeliverableSection).subscribe((payload: any) => {
      this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

      if (payload == ActionOnBlockStack.unGroupDeliverable)
        this.unGroupStack();
      else if (payload == ActionOnBlockStack.demote)
        this.demoteBlock(2);
      else if (payload == ActionOnBlockStack.copyToLibrary)
        this.copyToLibrary();
      else if (payload == ActionOnBlockStack.promote)
        this.demoteBlock(1);
      else if (payload == ActionOnBlockStack.delete) {
        this.deleteblock();
      }
      else if (payload == ActionOnBlockStack.cancelFilter)
        this.cancelFilter();
      else if (payload == ActionOnBlockStack.userRights) {
        this.accessRights = this.designer.selectedEntityRights[0];
      }
      else
        this.disablePaste = payload;
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.selectAll).subscribe((payload) => {

      this.selectAllBlocks();
    }));


    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.copyDeliverable).subscribe((payload: boolean) => {
      this.disablePaste = payload;
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.searchDeliverableDetails).subscribe((payload: TemplateAndBlockDetails) => {
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      let data: any = payload.blocks;
      this.dataSource1.data = data;
    }));

  }

  loadDeliverableFilterContent() {

    this.subscriptions.add(this._eventService.getEvent(this.section + "_loadDeliverableFilterContent").subscribe((payload: TemplateAndBlockDetails) => {
      this.nodeIndex = 0;
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
      if (payload.filterApplied == true)
        this.filter = false;
      this.filterApplied = payload.filterApplied;
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      let initialData: any;
      this.checklistSelection.clear();
      if (payload.blocks && payload.blocks.length) {
        this.hasContent = true;
        initialData = payload.blocks;
        this.dataSource1.data = initialData;
      }
      this.deliverablesInput.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
      this.deliverablesInput.templateId = this.designer.deliverableDetails.templateId;
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
      this.designer.blockList = [];
      this.designer.assignToBlockList = [];
      this.designerService.clear(this.section);
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.blockSelectedModel.blockSelectCount = this.designer.blockList.length;
      if (this.blockSelectedModel.nodeCount == 0) {
        this.rightClickOptions.enableCopy = this.rightClickOptions.enableAddToLibrary = this.rightClickOptions.enableRemove = false;
      }
      this._eventService.getEvent(this.section + "_" + EventConstants.DeliverableSection).publish(this.blockSelectedModel);
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.disableDropdown).publish("disable");
    }));
  }

  loadDeliverable() {
    if (!this.filterApplied) {
      this.subscriptions.add(this._eventService.getEvent(this.section + "_loadDeliverableContent").subscribe((payload: any) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.blockViewType = this.designerService.blockViewType;
        this.hasContent = true;
        this.nodeIndex = 0;
        this.loadDeliverableContent(payload);
      }));
    }
  }

  processDeliverable(payload, data) {
    if (payload.pushBackBlocks && data.automaticPropagation) {
      this.dialogDeliverable = new Dialog();
      this.dialogDeliverable.Type = DialogTypes.Confirmation;
      this.dialogDeliverable.Message = this.translate.instant("screens.project-designer.iconview.automatic-propagation");
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: this.dialogDeliverable
      });
      dialogRef.afterClosed().subscribe(action => {
        if (action) {
          this.deliverableService.pushBackBlocks(payload.entityId ? payload.entityId : payload.deliverableId ? payload.deliverableId : payload.id).subscribe(x => {
            let currentTemplate = this.themingContext.themeOptions.find(x => x.data && x.data.template != undefined);
            if (currentTemplate) {
              this.treeControl.dataNodes.forEach(b => b.colorCode = b.colorCode == ColorCode.Teal ? ColorCode.White : b.colorCode);
              this.designerService.pushBack = true;
              this.subscriptions.add(this._eventService.getEvent(currentTemplate.name + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(currentTemplate.data.template));
            }
          });
        }
        else {
          this.treeControl.dataNodes.forEach(b => b.colorCode = b.colorCode == ColorCode.White ? ColorCode.Teal : b.colorCode);
          this.deliverableService.disassociateDeliverableFromTemplate(payload.entityId ? payload.entityId : payload.deliverableId ? payload.deliverableId : payload.id).subscribe(x => {
            this.getDeliverableBlocks(this.designer.deliverableDetails);
          });
        }
      })
    }
  }
  checkIfFilterDataExists() {
    let currentDesignerService = this.themingContext.themeOptions.find(x => x.name == this.section).designerService;

    //TODO: check if all the filter arrays are checked
    if (currentDesignerService.selectedFilterProjectYear.length > 0
      || currentDesignerService.selectedFilterBlockCreator.length > 0
      || currentDesignerService.selectedFilterblockOrigin.length > 0
      || currentDesignerService.selectedFilterblockState.length > 0
      || currentDesignerService.selectedFilterblockStatus.length > 0
      || currentDesignerService.selectedFilterindustry.length > 0
      || currentDesignerService.selectedStackLevel.length > 0
      || currentDesignerService.selectedFiltertitle.length > 0
      || currentDesignerService.selectedStackType.length > 0
      || currentDesignerService.selectedblockType.length > 0) {
      let deliverableBlockFilter = new DeliverableRequestViewModel();

      this.filterApplied = true;
      if (currentDesignerService.selectedStackType.length > 0 ||
        currentDesignerService.selectedStackLevel.length > 0 ||
        currentDesignerService.selectedStackTransactionType.length > 0) {
        deliverableBlockFilter.stackFilter = new StackModelFilter();
        deliverableBlockFilter.stackFilter.stackType = currentDesignerService.selectedStackType;
        deliverableBlockFilter.stackFilter.level = currentDesignerService.selectedStackLevel;
        deliverableBlockFilter.stackFilter.transactionType = currentDesignerService.selectedStackTransactionType;

        //Map to designer from storage
        this.designer.selectedStackType = currentDesignerService.selectedStackType;
        this.designer.selectedStackLevel = currentDesignerService.selectedStackLevel;
        this.designer.selectedStackTransactionType = currentDesignerService.selectedStackTransactionType;
      }
      else {
        deliverableBlockFilter.blockFilterData = new BlockFilterDataModel();
        deliverableBlockFilter.blockFilterData.projectYear = currentDesignerService.selectedFilterProjectYear;
        deliverableBlockFilter.blockFilterData.BlockCreator = currentDesignerService.selectedFilterBlockCreator;
        deliverableBlockFilter.blockFilterData.blockOrigin = currentDesignerService.selectedFilterblockOrigin;
        deliverableBlockFilter.blockFilterData.blockState = currentDesignerService.selectedFilterblockState;
        deliverableBlockFilter.blockFilterData.blockStatus = currentDesignerService.selectedFilterblockStatus;
        deliverableBlockFilter.blockFilterData.industry = currentDesignerService.selectedFilterindustry;
        //templateBlockFilter.blockFilterData.title = currentDesignerService.selectedBlockProjectTselecteditle;
        deliverableBlockFilter.blockFilterData.blockType = currentDesignerService.selectedblockType;
        //templateBlockFilter.blockFilterData = currentDesignerService.block;

        //Map to designer service from storage
        this.designer.selectedFilterProjectYear = currentDesignerService.selectedFilterProjectYear;
        this.designer.selectedFilterBlockCreator = currentDesignerService.selectedFilterBlockCreator;
        this.designer.selectedFilterblockOrigin = currentDesignerService.selectedFilterblockOrigin;
        this.designer.selectedFilterblockState = currentDesignerService.selectedFilterblockState;
        this.designer.selectedFilterblockStatus = currentDesignerService.selectedFilterblockStatus;
        this.designer.selectedFilterindustry = currentDesignerService.selectedFilterindustry;
        this.designer.selectedblockType = currentDesignerService.selectedblockType;
      }

      deliverableBlockFilter.TemplateId = currentDesignerService.deliverableDetails.deliverableId;
      deliverableBlockFilter.EntityId = currentDesignerService.deliverableDetails.entityId;

      this.blockService.DeliverableSelectedFilter(deliverableBlockFilter).subscribe((response: any) => {
        let payload = new TemplateAndBlockDetails();
        payload.blocks = response;
        payload.filterApplied = true;
        this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((true)));
        this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetailsFilter).publish((payload)));
      });
    }
    else {
      this.filterApplied = false;
    }
  }

  getEmptyNode() {
    var newNode: any = {};
    newNode.id = "";
    newNode.item = "";
    newNode.parentId = "000000000000000000000000";
    newNode.previousId = "000000000000000000000000";
    var data: any = [];
    data.push(newNode);
    return data;
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

  private getDeliverableBlocks(deliverableInput) {
    this.deliverableService.getDeliverable(deliverableInput).subscribe((data: DeliverableResponseViewModel) => {
      this.processDeliverable(deliverableInput, data);
      this.loadDeliverableContent(data);
    });
  }

  loadDeliverableContent(data: any) {
    let isNewDesignerInstance: boolean = true;

    this.designerService.appendixBlocks = data.blocks.filter(id => id.isAppendixBlock == true);

    if (this.designer != null && this.designer.deliverableDetails != null && this.designer.deliverableDetails.deliverableId == data.id) {
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
    this.checklistSelection.clear();
    this.selectedBlocksStacks = [];
    this.designer.blockList = [];
    this.designerService.clear(this.section);
    this.rightClickOptions.enableCopy = true;
    this.rightClickOptions.enableCreate = true;
    this.disablePaste = false;
    var initialData: any;

    if (data) {
      this.filter = true;
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      if (data.blocks && data.blocks.length) {
        initialData = data.blocks;
        this.dataSource1.data = initialData;
      }
      else {
        this.database1.dataChange.next(this.getEmptyNode());
      }
      this.selectedDeliverable = new DeliverableViewModel();
      this.selectedDeliverable.deliverableId = data.id;
      this.selectedDeliverable.id = data.id;
      this.selectedDeliverable.entityId = data.entityId;
      this.selectedDeliverable.projectId = data.projectId;
      this.selectedDeliverable.templateId = data.templateId;
      this.selectedDeliverable.templateName = data.templateName;
      this.selectedDeliverable.uId = data.uId;
      this.selectedDeliverable.layoutStyleId = data.layoutStyleId;
      //this.selectedDeliverable.templateId =this.designer.templateDetails.templateId;
      this.designer.deliverableDetails = this.selectedDeliverable;
      this.service.deliverableId = this.selectedDeliverable.deliverableId;
      if (this.designer.blockDetails != null) {
        if (this.isDocumnetViewDoubleClick) {
          var node = this.treeControl.dataNodes.find(x => x.id == this.designer.blockDetails.id);
          if (node != undefined)
            this.checklistSelection.toggle(node);
        }
        else {
          this.checklistSelection.toggle(this.designer.blockDetails)
        }
      }

    }
    var dataPublish = new blockSelectedModel();
    dataPublish.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
    dataPublish.blockSelectCount = this.designer.blockList.length;
    if (dataPublish.nodeCount == 0)
      this.rightClickOptions.enableCopy = this.rightClickOptions.enableAddToLibrary = this.rightClickOptions.enableAssignTo = this.rightClickOptions.enableRemove = false;
    else
      this.rightClickOptions.enableCopy = this.rightClickOptions.enableAddToLibrary = this.rightClickOptions.enableAssignTo = this.rightClickOptions.enableRemove = true;
    this.designer.blockList = [];
    this.designer.assignToBlockList = [];
    this.designerService.clear(this.section);
    if (!this.filterApplied) {
      this.reAssignBlockSelectionFromStorage();
      this.expandNodes();
    }
    if (!this.filterApplied) {
      this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).publish(dataPublish));
    }
    this.disableDeleteForLockedBlock();
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

  expandBlockFromStorage(node: TodoItemFlatNode, ) {
    if (!this.treeControl.isExpanded(node) && node.level == 0) {
      var isStack: string = node.isStack.toString();
      this.deliverableChildNodes.blockid = node.id;
      this.deliverableChildNodes.id = this.selectedDeliverable.deliverableId;
      this.deliverableChildNodes.isstack = isStack;
      var previousNode = this.treeControl.dataNodes.find(x => x.id == node.previousId);
      if (isStack == "true") {
        this.deliverableChildNodes.blockid = node.blockId;
        this.deliverableChildNodes.indentation = (previousNode != undefined) ? previousNode.indentation : '0';
        this.deliverableService.getBlocksByBlockId(this.deliverableChildNodes).subscribe((data: BlockDetailsResponseViewModel[]) => {
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
          this.deliverableChildNodes.indentation = node.indentation;
          this.deliverableService.getBlocksByBlockId(this.deliverableChildNodes).subscribe((data: BlockDetailsResponseViewModel[]) => {
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

  expandBlock(node: TodoItemFlatNode) {
    if (this.checklistSelection.isSelected(node) && node.isStack) {
      const descendants = this.treeControl.getDescendants(node);
      this.checklistSelection.deselect(...descendants);
    }

    if (this.treeControl.isExpanded(node)) {
      this.saveExpandedNodes(node);
    }

    if (this.treeControl.isExpanded(node) && node.level == 0) {
      var isStack: string = node.isStack.toString();
      this.deliverableChildNodes.blockid = node.id;
      this.deliverableChildNodes.id = this.selectedDeliverable.deliverableId;
      this.deliverableChildNodes.isstack = isStack;
      var previousNode = this.treeControl.dataNodes.find(x => x.id == node.previousId);
      if (isStack == "true") {
        this.deliverableChildNodes.blockid = node.blockId;
        this.deliverableChildNodes.indentation = (previousNode != undefined) ? previousNode.indentation : '0';
        this.deliverableService.getBlocksByBlockId(this.deliverableChildNodes).subscribe((data: BlockDetailsResponseViewModel[]) => {
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
          this.deliverableChildNodes.indentation = node.indentation;
          this.deliverableService.getBlocksByBlockId(this.deliverableChildNodes).subscribe((data: BlockDetailsResponseViewModel[]) => {
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
    const descendants = this.treeControl.getDescendants(node);
    if (node.isStack)
      (this.checklistSelection.isSelected(node))
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);
    this.todoParentSelection(node);
    this.rightClickOptions.enableCreate = true;
    this.rightClickOptions.enableCopy = true;
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

      this.designerService.appendixBlockExists = false;
      this.designer.blockList.forEach(el => {
        this.designerService.appendixBlocks.forEach(item => {
          if ((el.blockId == item.blockId) || this.designerService.appendixBlockExists)
            this.designerService.appendixBlockExists = true;
          else
            this.designerService.appendixBlockExists = false;
        })
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
    this.disableDeleteForLockedBlock();
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

  selectedBlock() {
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
    if (!this.filterApplied) {
      this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).publish(this.blockSelectedModel);
    }
    this.disableDeleteForLockedBlock();
  }
  loadData(payload: TemplateAndBlockDetails) {
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.checklistSelection.clear();
    var initialData: any;
    initialData = payload.blocks;
    if (initialData) this.dataSource1.data = initialData;
    this.designer.templateDetails = this.selectedTemplate = payload.template;
    this.deliverablesInput.projectId = this.projectDetails.projectId;
    this.deliverablesInput.templateId = this.selectedTemplate.templateId;
  }
  cancelFilter() {
    this.deliverablesInput.id = this.designer.deliverableDetails.entityId;
    this.getDeliverableBlocks(this.deliverablesInput);
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
  deleteblock() {
    this.designer.blockList.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack != undefined) {
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

    this.DeleteBlockViewModel.libraryReferenceModel.template = null;
    this.DeleteBlockViewModel.libraryReferenceModel.country = null;
    this.DeleteBlockViewModel.libraryReferenceModel.deliverable = this.designer.deliverableDetails;
    this.DeleteBlockViewModel.libraryReferenceModel.global = false;
    this.DeleteBlockViewModel.libraryReferenceModel.organization = null;
    this.DeleteBlockViewModel.libraryReferenceModel.project = null;
    this.dialogDeliverable = new Dialog();
    this.dialogDeliverable.Type = DialogTypes.Delete;
    this.dialogDeliverable.Message = this.dialogDeliverable.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordRemoveConfirmationMessage');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogDeliverable
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blockService.deleteBlocks(this.DeleteBlockViewModel, null).subscribe(
          response => {

            if (response && response.responseType === ResponseType.Mismatch) {
              this.toastr.warning(response.errorMessages.toString());
            } else {
              this.toastr.success(this.translate.instant('screens.home.labels.blockDeletedSuccessfully'));
             
              var deliverableInput = new DeliverablesInput();
              deliverableInput = this.themingContext.themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
              deliverableInput.pushBackBlocks = true;
              this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput));
            }
            this.designerService.clear(this.section);
            this.service.selectedNodes = [];
            this.designer.blockList = [];
            this.designer.assignToBlockList = [];
            this.designerService.clear(this.section);
            this.checklistSelection.clear();
          },
          error => {
            this.confirmationDialogService.Open(DialogTypes.Warning, error.message);
          });
      }
    });
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    //this.database1.insertItem(parentNode, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database1.updateItem(nestedNode, itemValue);
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    // event.dataTransfer.setData('foo', 'bar');
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
    }
    else
      this.dragNode = node;
    this.service.source = DragDropSection.Deliverable;
    this.service.sourceId = this.designer.deliverableDetails.deliverableId;
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
    } else if (percentageY > 0.25) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }

    if (!node.blockId)
      this.dragNodeExpandOverArea = 'below';
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

    if (this.service.source == DragDropSection.Deliverable && this.service.sourceId != this.designer.deliverableDetails.deliverableId) {
      message = this.translate.instant("screens.project-designer.iconview.drag-and-drop-across-deliverable-restricted");
    }

    if (this.service.source == DragDropSection.Template && this.service.sourceId != this.designer.deliverableDetails.templateId) {
      message = this.translate.instant("screens.project-designer.iconview.drag-and-drop-across-template-deliverable-restricted");
    }

    if (this.service.source == DragDropSection.Template && this.service.sourceId == this.designer.deliverableDetails.templateId && this.service.sourceAutomaticPropagation) {
      message = this.translate.instant("screens.project-designer.iconview.restrict-template-deliverable-drag-automatic");
    }
    if (message != '') {
      this.dialogDeliverable = new Dialog();
      this.dialogDeliverable.Type = DialogTypes.Warning;
      this.dialogDeliverable.Message = message;
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: this.dialogDeliverable
      });

      dialogRef.afterClosed().subscribe(result => {
        this.removeDropCss();
      });

      if (message != '') return;
    }

    this.removeDropCss();
    this.projectUserRightsData = this.designerService.projectUserRightsData;
    if (this.designer.selectedEntityRights && this.designer.selectedEntityRights.length > 0)
      this.accessRights = this.designer.selectedEntityRights[0];
    if (this.projectUserRightsData && this.projectUserRightsData.isCentralUser) {
      this.executeDrop(event, node);
    }
    else if (this.accessRights && this.accessRights.canCreateBlock && this.accessRights.canReArrange) {
      this.executeDrop(event, node);
    }
    else if (this.accessRights && !this.accessRights.canCreateBlock && this.accessRights.canReArrange && this.service.source == 2) {
      this.executeDrop(event, node);
    }
    else if (this.accessRights && !this.accessRights.canCreateBlock && !this.accessRights.canReArrange) {
      this.handleDragEnd(event);
    }
    else if (this.accessRights && !this.accessRights.canCreateBlock && this.accessRights.canReArrange && this.service.source == 0) {
      this.handleDragEnd(event);
    }
  }

  executeDrop(event, node) {
    //Check Concurrency 
    var concurrencyRequest = new CheckConcurrencyRequestModel();
    var concurrencyDestination = new CheckConcurrencyDestinationRequestModel();
    var concurrencySource = new CheckConcurrencySourceRequestModel();
    var blockList: BlockReferenceViewModel[] = new Array();
    var dragDropRequestModel = new DragDropRequestViewModel();
    dragDropRequestModel.dragDropList = new Array();
    // this.PrepareConcurrencyRequest(concurrencyDestination, node, concurrencySource);
    dragDropRequestModel.blockToMultipleEntities = new Array();
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
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);

          } else if (this.dragNodeExpandOverArea === 'below') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
            nextNodeOfDragNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
            if (index == 0)
              newItem = this.database1.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
            else {
              newItem = this.database1.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(this.dragNodes[index - 1]), this.dataSource1.data);
            }
            this.database1.deleteItem(this.flatNodeMap.get(this.dragNode));
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);
          } else {
          }
        }
      });
      this.SaveDragDropBlockStack(dragDropRequestModel);
    }

    else if (this.service.dragNodes != null && this.service.dragNodes.length > 0) {
      if (this.designer.selectedEntityIds.length > 1) {
        this.designer.selectedEntityIds.forEach(x => {
          dragDropRequestModel.blockToMultipleEntities.push(x);
        });
      }
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
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);
          } else if (this.dragNodeExpandOverArea === 'below') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
            if (index == 0)
              newItem = this.database1.copyPasteItemBelow(this.service.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
            else
              newItem = this.database1.copyPasteItemBelow(this.service.flatNodeMap.get(this.dragNode), this.service.flatNodeMap.get(this.service.dragNodes[index - 1]), this.dataSource1.data);
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);
          } else {
          }
        }
      });
      this.SaveDragDropBlockStack(dragDropRequestModel);
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
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);
          this.SaveDragDropBlockStack(dragDropRequestModel);
        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          nextNodeOfDragNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
          newItem = this.database1.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.database1.deleteItem(this.flatNodeMap.get(this.dragNode));
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);
          this.SaveDragDropBlockStack(dragDropRequestModel);
        } else {
        }

      }
    }
    else if (this.service.dragNode != null) {
      if (this.designer.selectedEntityIds.length > 1) {
        this.designer.selectedEntityIds.forEach(x => {
          dragDropRequestModel.blockToMultipleEntities.push(x);
        });
      }
      this.dragNode = this.service.dragNode;
      this.prepareConcurrencySourceRequestModel(blockList);
      if (node !== this.service.dragNode) {
        var nextNode: any;
        let newItem: TodoItemNode;
        if (this.dragNodeExpandOverArea === 'above') {
          nextNode = this.treeControl.dataNodes.find(el => el.id == node.previousId);
          newItem = this.database1.copyPasteItemAbove(this.service.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);
          this.SaveDragDropBlockStack(dragDropRequestModel);
        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          newItem = this.database1.copyPasteItemBelow(this.service.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);
          this.SaveDragDropBlockStack(dragDropRequestModel);
        } else {
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

  demoteBlock(action) {
    if (this.selectedBlocksStacks.length > 0) {
      let blockDemote = new TemplateBlockDemote();
      if ((action == 2 && !this.selectedBlocksStacks[0].isStack && this.selectedBlocksStacks[0].previousId != ValueConstants.DefaultId)
        || (action == 1 && !this.selectedBlocksStacks[0].isStack && this.selectedBlocksStacks[0].level > 0)) {
        blockDemote.deliverableId = this.selectedDeliverable.deliverableId;
        blockDemote.deliverableUid = this.selectedDeliverable.uId;
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
        this.service.promoteDemoteDeliverableBlock(blockDemote, action).subscribe((response: any) => {
          if (response && response.responseType === ResponseType.Mismatch) {
            this.toastr.warning(response.errorMessages.toString());
          }
          else {
            this.selectedDeliverable.pushBackBlocks = true;
            this.getDeliverableBlocks(this.selectedDeliverable);
          }
        });
      }
    }
  }

  private SaveDragDropBlockStack(dragDropRequestModel) {
    if (this.service && this.service.source == DragDropSection.Template) {
      dragDropRequestModel.sourceTemplateId = this.service.sourceId;
      dragDropRequestModel.sourceTemplateUId = this.service.sourceUId;
    }

    //Save block dragged and dropped from library to template
    this.service.saveDragDrop(dragDropRequestModel).subscribe(data => {
      //refresh the tree data after save
      if (data.responseType === ResponseType.Mismatch) {
        this.toastr.warning(data.errorMessages.toString());
      }
      else {
        this.designer.deliverableDetails.pushBackBlocks = true;
        this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(this.designer.deliverableDetails);
      }
    })
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
    dragDropRequestModel.source = source;
    dragDropRequestModel.destination = destination;
    var libraryReferenceModel = new LibraryReferenceViewModel();
    libraryReferenceModel.deliverable = this.selectedDeliverable;
    if (this.projectDetails != null) {
      libraryReferenceModel.project = new ProjectDetailsViewModel();
      libraryReferenceModel.project.projectId = this.projectDetails.projectId;
      libraryReferenceModel.project.projectName = this.projectDetails.projectName;
      libraryReferenceModel.project.projectYear = this.projectDetails.fiscalYear;
    }
    libraryReferenceModel.organization = this.sharedService.getORganizationDetail();
    dragDropRequestModel.libraryReference = libraryReferenceModel;
    if (dragDropRequestModel.source == 2 && dragDropRequestModel.destination == 2)
      dragDropRequestModel.action = this.GetActionType(dragDropRequestModel, this.dragNode, node, this.flatNodeMap);
    else
      dragDropRequestModel.action = this.GetActionType(dragDropRequestModel, this.dragNode, node, this.service.flatNodeMap);

    this.treeControl.dataNodes.find(x => x.id == this.dragNode.id).parentId = node.parentId;
    if (dragDropRequestModel.source == 2 && dragDropRequestModel.destination == 2) {
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

    else {
      this.dragNode.blockOrigin = this.dragNode.blockId;
      this.GetDragDropRequestModel(dragDropRequestModel, this.dragNode, this.service.flatNodeMap, true, true);
      if (dragDropRequestModel.source != 1 || dragDropRequestModel.destination != 2) {
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
  }
  private GetDragDropRequestModel(dragDropRequestModel: DragDropRequestViewModel, node: any, flatNodeMap: any, isCopy: any, isNew: any) {
    var obj = this.getSaveModel(node, flatNodeMap);
    obj.isStack = node.isStack;
    obj.isCopy = isCopy;
    obj.isNew = isNew;
    obj.hasChildren = node.hasChildren;
    obj.blockOrigin = node.blockOrigin;
    var libraryReferenceModel = new LibraryReferenceViewModel();
    libraryReferenceModel.deliverable = this.selectedDeliverable;
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
    // var nodeData = this.database1.data[index];
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
    this.dragNodeExpandOverTime = 0;
    this.dragNodes = [];
    this.service.dragNode = null;
    this.service.dragNodes = [];
    this.checklistSelection.clear();
  }

  unGroupStack() {
    if (this.selectedBlocksStacks.length == 1) {
      let selectedStackArr: TodoItemNode[] = new Array();
      this.checklistSelection["_selection"].forEach(element => {
        selectedStackArr.push(element);
      });

      let selectedStack = selectedStackArr[0];
      const stackToUngroup = new TemplateStackUngroupModel();
      stackToUngroup.deliverableId = this.designer.deliverableDetails.deliverableId;
      stackToUngroup.templateId = this.designer.deliverableDetails.templateId;
      stackToUngroup.stackId = selectedStack.blockId;
      stackToUngroup.projectId = this.projectDetails.projectId;
      stackToUngroup.stackUid = selectedStack.uId;
      stackToUngroup.deliverableUid = this.designer.deliverableDetails.uId;
      this.ngxLoader.startBackgroundLoader(this.loaderId);

      this.deliverableService.DeliverableStackUngroup(stackToUngroup).subscribe(
        (response: GenericResponse) => {
          if (response && response.isSuccess) {
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
            this.checklistSelection.clear();
            var deliverableInput = new DeliverablesInput();
            deliverableInput = this.themingContext.themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
            deliverableInput.pushBackBlocks = true;
            this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput));
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

  pasteStackOrBlock(node) {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;

    let copyblocksList: BlockStackViewModel[] = new Array();
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
      copyblocksList.push(this.blockRequestModel);
    });

    if (this.designer.isCopied) {
      this.blockService.copyBlocksStacks(copyblocksList).subscribe((data: GenericResponseModel) => {

        if (data && data.responseType === ResponseType.Mismatch) {
          this.toastr.warning(data.errorMessages.toString());
        } else {
          var deliverableInput = new DeliverablesInput();
          deliverableInput = this.themingContext.themeOptions.filter(id => id.name == this.section)[0].data.deliverable;
          deliverableInput.pushBackBlocks = true;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(deliverableInput);
          this.disablePaste = false;
          var dataPublish = new blockSelectedModel();
          dataPublish.blockSelectCount = 0;
          this.checklistSelection.clear();
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).publish(dataPublish);
          this.disableDeleteForLockedBlock();
        }
      });
    }
  }

  // To get the library refernce
  getLibraryreference() {
    var libraryReference = new LibraryReferenceViewModel();

    //section to assign deliverables info if a block has been created from template section
    if (this.designer.deliverableDetails != null) {
      libraryReference.deliverable = new DeliverableViewModel();
      libraryReference.deliverable.deliverableId = this.designer.deliverableDetails.deliverableId;
      libraryReference.deliverable.deliverableName = this.designer.deliverableDetails.deliverableName;
      libraryReference.deliverable.templateId = this.designer.deliverableDetails.templateId;
      libraryReference.deliverable.entityId = this.designer.deliverableDetails.entityId;
      libraryReference.deliverable.uId = this.designer.deliverableDetails.uId;
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
  selectAllBlocks() {
    if (this.checklistSelection["_selection"].size > 0 && this.checklistSelection["_selection"].size != this.treeControl.dataNodes.length)
      this.checklistSelection.clear();
    this.dataSource1.data.forEach(x => {
      this.checklistSelection.toggle(this.nestedNodeMap.get(x));
      this.todoItemSelectionToggle(this.nestedNodeMap.get(x));
    })
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
    var selectedBlockListId: any = [];
    this.selectedBlocksStacks = this.designer.blockList;

    this.selectedBlocksStacks.forEach(element => {
      selectedBlockListId.push(element.blockId);
    })
    var dialogTemplate = new Dialog();
    dialogTemplate.Type = DialogTypes.AddtoUserLibrary;
    dialogTemplate.Message = this.translate.instant("screens.project-designer.iconview.stackAddedtoUserlibAlert");

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addToLibraryViewModel.DeliverableId = this.designer.deliverableDetails.deliverableId;
        this.addToLibraryViewModel.ProjectId = this.projectDetails.projectId;
        this.addToLibraryViewModel.Blocks = selectedBlockListId;
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

  doubleClick(node) {
    let payload: any;
    payload = {};
    payload.section = "Deliverable";
    //document view for single-block selection mode
    this.designer.LoadAllBlocksDocumentView = false;
    this.designer.blockDetails = node;
    this.designer.blockList.push(this.designer.blockDetails);
    this.designer.isDeliverableSection = true;
    var nodesArray: TodoItemFlatNode[];
    nodesArray = [];
    this.checklistSelection["_selection"].forEach(element => {
      nodesArray.push(element);
    });

    this.oldDesignerService.changeTabDocumentView(SubMenus.Editor);
    this.designerService.changeIsDoubleClicked(this.section, true);

    //map to old designer -- starts
    this.oldDesignerService.isDeliverableSection = true;
    this.oldDesignerService.isTemplateSection = false;
    this.oldDesignerService.isLibrarySection = false;

    this.oldDesignerService.deliverableDetails = this.designer.deliverableDetails;
    this.oldDesignerService.LoadAllBlocksDocumentView = this.designer.LoadAllBlocksDocumentView;
    this.oldDesignerService.blockDetails = this.designer.blockDetails;
    this.oldDesignerService.blockList.push(this.designer.blockDetails);
    this.oldDesignerService.deliverabletemplateDetails = new TemplateViewModel();
    this.oldDesignerService.deliverabletemplateDetails.templateId = this.designer.deliverableDetails.templateId;
    this.oldDesignerService.deliverabletemplateDetails.templateName = this.designer.deliverableDetails.templateName;
    this.oldDesignerService.entityDetails = [];
    var entityModel = new EntityViewModel();
    entityModel.entityId = this.designer.deliverableDetails.entityId;
    this.oldDesignerService.entityDetails.push(entityModel);
    this.oldDesignerService.changeIsDoubleClicked(true);
    //map to old desinger -- ends

    //this.todoItemSelectionToggle(node);
    this.saveSelectedThemeData();
    this.navigateToEditor();
  }
  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  canCopy() {
    this.projectUserRightsData = this.designerService.projectUserRightsData;
    if (this.designerService.selectedEntityRights)
      this.accessRights = this.designerService.selectedEntityRights;
    return this.rightClickOptions.enableCopy && ((this.projectUserRightsData && this.projectUserRightsData.isCentralUser) || (this.accessRights && (this.accessRights.canCopyPaste || this.accessRights.canCreateBlock)))
  }

  canRemove() {
    this.projectUserRightsData = this.designerService.projectUserRightsData;
    if (this.designerService.selectedEntityRights)
      this.accessRights = this.designerService.selectedEntityRights;
    return this.rightClickOptions.enableRemove && ((this.projectUserRightsData && this.projectUserRightsData.isCentralUser) || (this.accessRights && (this.accessRights.canRemove)))
  }

  canAddToLibrary() {
    this.projectUserRightsData = this.designerService.projectUserRightsData;
    if (this.designerService.selectedEntityRights)
      this.accessRights = this.designerService.selectedEntityRights;
    return this.rightClickOptions.enableAddToLibrary && ((this.projectUserRightsData && this.projectUserRightsData.isCentralUser) || (this.accessRights && (this.accessRights.canAddToUserLibrary || this.accessRights.canCreateBlock)))
  }


  canCreate() {
    this.projectUserRightsData = this.designerService.projectUserRightsData;
    if (this.designerService.selectedEntityRights)
      this.accessRights = this.designerService.selectedEntityRights;
    let hasAccess = ((this.projectUserRightsData && this.projectUserRightsData.isCentralUser) || (this.accessRights && this.accessRights.canCreateBlock));
    if (hasAccess && (this.dataSource1.data[0] && !this.dataSource1.data[0].id)) {
      return true;
    }
    return this.rightClickOptions.enableCreate && hasAccess;
  }

  pasteStackOrBlockAsReference(node) {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    let payload: any = {};
    payload.deliverableId = this.designer.deliverableDetails.deliverableId;
    payload.blocks = this.designer.blocksToBeCopied;
    payload.uId = this.designer.deliverableDetails.uId;

    payload.blocks.forEach((item, index) => {
      item.previousId = index == 0 ? node.id : eventConstantsEnum.emptyGuid;
      item.parentId = node.parentId;

      item.isParentStack = false;
      if (item.parentId != eventConstantsEnum.emptyGuid) {
        let parentRecord = this.dataSource1.data.filter(id => id.blockId == item.parentId);
        if (parentRecord.length > 0) {
          item.isParentStack = parentRecord[0].isStack;
        }
      }
    });

    if (this.designer.isCopied) {
      //Concurrency check 
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.blockService.copyBlocksStacksAsReferenceForDeliverable(payload).subscribe((response: any) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        if (response && response.responseType === ResponseType.Mismatch) {
          this.toastr.warning(response.errorMessages.toString());
        }
        else {
          this.toastr.success(this.translate.instant('screens.project-designer.iconview.blocksCopiedSuccessMsg'));
          this.designer.deliverableDetails.pushBackBlocks = true;
          this.subscriptions.add(this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.loadDeliverable).publish(this.designer.deliverableDetails));
          this.disablePaste = false;
          var dataPublish = new blockSelectedModel();
          dataPublish.blockSelectCount = 0;
          this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);
          this.disableDeleteForLockedBlock();
        }
      });
    }
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
