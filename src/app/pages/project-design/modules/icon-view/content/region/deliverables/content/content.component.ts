// import { Component, OnInit } from '@angular/core';
// import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { IconViewService } from '../../../../services/icon-view.service';
import { DragDropRequestViewModel, DragDropSection, ActionType, BlockRequest, BlockDetailsResponseViewModel, ActionOnBlockStack, BlockStackViewModel, blockSelectedModel, BlockType, BlockStatus, TemplateDeliverableRequestModel } from '../../../../../../../../@models/projectDesigner/block';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, DeleteBlockViewModel, CBCBlocDeleteModel } from '../../../../../../../../@models/projectDesigner/library';
import { ProjectDetails } from '../../../../../../../../@models/projectDesigner/region';
import { eventConstantsEnum, EventConstants, ColorCode } from '../../../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { TemplateAndBlockDetails, TemplateViewModel, TemplateStackUngroupModel, TemplateBlockDemote, BlockDetail } from '../../../../../../../../@models/projectDesigner/template';
import { DesignerService } from '../../../../../../services/designer.service';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { DeliverableChildNodes, DeliverablesInput, DeliverableResponseViewModel, DeliverableViewModel } from '../../../../../../../../@models/projectDesigner/deliverable';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { initTransferState } from '@angular/platform-browser/src/browser/transfer_state';
import { Subscription } from 'rxjs';
import { regions, ActionEnum } from '../../../../../../../../@models/projectDesigner/common';
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
import { ProjectUserRightViewModel, EntityRoleViewModel, ProjectDeliverableRightViewModel, DeliverableRoleViewModel, DocViewDeliverableRoleViewModel, DocumentViewAccessRights } from '../../../../../../../../@models/userAdmin';
import { ProjectUserService } from '../../../../../../../admin/services/project-user.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { NbDialogService } from '@nebular/theme';
import { CreateBlockAttributesComponent } from '../../../../manage-blocks/create-block-attributes/create-block-attributes.component';
import { TranslateService } from '@ngx-translate/core';
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
  blockStatus: BlockStatus;
  uId: string;
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
  isReference:boolean;
  isLocked:boolean;
  blockUser:UserAssignmentDataModel;
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
  selector: 'ngx-deliverables-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  providers: [ChecklistDatabase1]
})
export class DeliverablesContentComponent implements OnInit, OnDestroy {
  filter: boolean = true;
  isAllselected: boolean = false;
  selectedBlockListId: any = [];
  [x: string]: any;
  private dialogTemplate: Dialog;
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
  disablePaste: boolean = false;
  blockSelectedModel = new blockSelectedModel();
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  selectedBlocksStacks: any = [];
  nodeIndex: number = 0;
  enableCreate: boolean = false;
  isDocumnetViewDoubleClick: any;
  dialogDeliverable: Dialog;
  projectUserRightsData: ProjectDeliverableRightViewModel;
  accessRights: DeliverableRoleViewModel;
  selectedDeliverableRights: any;
  blockViewType: string;
  enableCopy: boolean = false;

  constructor(private database1: ChecklistDatabase1, private DialogService: DialogService, private dialog: MatDialog, private router: Router, private service: IconViewService, private confirmationDialogService: DialogService,
    private readonly _eventService: EventAggregatorService, public designerService: DesignerService, private ngxLoader: NgxUiLoaderService,
    private deliverableService: DeliverableService, private storageService: StorageService, private stackService: StackService, private translate : TranslateService,
    private blockService: BlockService, private sharedService: ShareDetailService, private projectUserService: ProjectUserService, private dialogService: NbDialogService, private toastr: ToastrService
    ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener); //List 2
    database1.dataChange.subscribe(data => {
      this.dataSource1.data = [];
      this.dataSource1.data = data;
    });
  }
  loaderId = 'DeliverableLoader';
  loaderPosition = POSITION.centerLeft;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

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
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.nodeIndex = 0;
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockView).subscribe((selectedViewType: any) => {
      this.blockViewType = selectedViewType.value;
    }));
    this.designerService.currentDoubleClicked.subscribe(isDoubleClicked => this.isDocumnetViewDoubleClick = isDoubleClicked);

    this.designerService.selectedDesignerTab.subscribe(selectedTab => {
      this.selectedDesignerTab = selectedTab;
      if (this.selectedDesignerTab == 1) {
        this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
        this.blockSelectedModel.blockSelectCount = this.designerService.assignToBlockList.length;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
      }
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.common.refreshBlocks).subscribe((payload: any = []) => {
      let payloadData = payload;
      if(this.designerService.isExtendedIconicView && payloadData && payloadData.length == 1)
      {
        this.designerService.blockDetails.uId = payloadData[0].uId; 
        this.designerService.blockDetails.parentId = payloadData[0].parentUId; 
      }
      payloadData.forEach(item => {
        let data = this.treeControl.dataNodes.filter(id => id.blockId == item.id);
        if (data) {
          data.forEach(i=>{
          i.item = item.title;
          i["title"] = item.title;
          i.description = item.description;
          i.uId = item.uId ? item.uId : i.uId;
          });
        }
        this.updateDataSource(item, this.dataSource1.data);
        this.database1.dataChange.next(this.dataSource1.data);
      });
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.common.refreshBlocksUId).subscribe((payload: any = []) => {
      let payloadData = payload;
      if(this.designerService.isExtendedIconicView && payloadData && payloadData.length == 1)
      {
        this.designerService.blockDetails = payloadData[0]; 
      }
      payloadData.forEach(item => {
        let data = this.treeControl.dataNodes.filter(id => id.blockId == item.id);
        if (data) {
          data.forEach(i=>i.uId = item.uId);
          this.updateDataSourceUId(item, this.dataSource1.data);
          this.database1.dataChange.next(this.dataSource1.data);
        }
      });
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetails).subscribe((payload: TemplateAndBlockDetails) => {
      this.nodeIndex = 0;
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.checklistSelection.clear();
      var initialData: any;
      if (payload.blocks != undefined) {
        if (payload.blocks.length > 0) {
          payload.blocks.forEach(x => {
            var nestedBlock = x.blocks.find(y => y.parentId == x.id);
            if (x.isStack || nestedBlock != undefined) {
              if (x.blocks.length > 0)
                this.convertBlockType(x);
            }
          })
          initialData = payload.blocks;
          this.dataSource1.data = initialData;

          this.designerService.appendixBlocks = initialData.filter(id=>id.isAppendixBlock == true);
        }
      }
      this.designerService.deliverabletemplateDetails = this.selectedTemplate = payload.template;
      this.deliverablesInput.projectId = this.projectDetails.projectId;
      if(this.selectedTemplate){
        this.deliverablesInput.templateId = this.selectedTemplate.templateId;
      }
      if (!this.designerService.isDocFullViewEnabled.value && !this.designerService.isDoubleClicked.value) {
        // this.getDeliverableBlocks(this.deliverablesInput);
      }
      if (this.designerService.isDoubleClicked.value) {
        this.selectedDeliverable = new DeliverableViewModel();
        this.selectedDeliverable.deliverableId = this.designerService.deliverableDetails.entityId,
          this.selectedDeliverable.templateId = payload.template.templateId
      }

      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.blockSelectedModel.blockSelectCount = this.designerService.assignToBlockList.length;
      if (this.designerService.blockDetails != null) {
        if (this.isDocumnetViewDoubleClick) {
          let nodes = this.treeControl.dataNodes;
          let blockId = this.designerService.isProjectManagement ? this.designerService.blockDetails.id : this.designerService.blockDetails.blockId;
          let node = nodes.find(x => x.id == this.designerService.blockDetails.id);
          if(!node) {
            node = nodes.find(x => x.blockId == blockId);
            if(!node) {
                this.getParentBlockId(blockId, this.selectedDeliverable.deliverableId);
            } else {
              this.designerService.blockDetails = node;
              this.designerService.isProjectManagement = false;
            }
          }
          if (node != undefined) {
            this.checklistSelection.toggle(node);
            this.designerService.reportblockList.push(node);
          }
          this.blockSelectedModel.blockSelectCount = 1;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);

        }
        else {
          this.checklistSelection.toggle(this.designerService.blockDetails)
        }
      }
      if (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value) {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);

      }
      if (!this.isDocumnetViewDoubleClick) {
        this.designerService.blockList = [];
        this.designerService.assignToBlockList = [];
        this.designerService.clear();
      }
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.blockSelectedModel.blockSelectCount = this.designerService.assignToBlockList.length;
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(this.blockSelectedModel));
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.disableDropdown).publish("disable"));

    })),
      (error) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        console.log(error);
      };


    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetailsFilter).subscribe((payload: TemplateAndBlockDetails) => {
      this.nodeIndex = 0;
      if (payload.filterApplied == true)
        this.filter = false;
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.checklistSelection.clear();
      var initialData: any;
      if (payload.blocks != undefined) {
        if (payload.blocks.length > 0) {
          payload.blocks.forEach(x => {
            var nestedBlock = x.blocks.find(y => y.parentId == x.id);
            if (x.isStack || nestedBlock != undefined) {
              if (x.blocks.length > 0)
                this.convertBlockType(x);
            }
          })
          initialData = payload.blocks;
          this.dataSource1.data = initialData;
        }
      }
      this.designerService.deliverabletemplateDetails = this.selectedTemplate = payload.template;
      this.deliverablesInput.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
      this.deliverablesInput.templateId = this.selectedTemplate.templateId;
      if (this.designerService.blockDetails != null) {
        if (this.isDocumnetViewDoubleClick) {
          var node = this.treeControl.dataNodes.find(x => x.id == this.designerService.blockDetails.id);
          if (node != undefined) {
            this.checklistSelection.toggle(node);

            //todo need to remove timeout
            setTimeout(function () {
              var element = document.getElementById("item_" + node.nodeIndex);
              if (element && element != null)
                element.parentElement.classList.add(ActionEnum.blockactive);
            }, 1000);
          }
        }
        else {
          this.checklistSelection.toggle(this.designerService.blockDetails)
        }
      }
      this.designerService.blockList = [];
      this.designerService.assignToBlockList = [];
      this.designerService.clear();
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.blockSelectedModel.blockSelectCount = this.designerService.assignToBlockList.length;
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).publish(this.blockSelectedModel));
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.disableDropdown).publish("disable"));
    }));
    this.subscriptions.add(this._eventService.getEvent(EventConstants.DeliverableSection).subscribe((payload: any) => {
      if (payload == ActionOnBlockStack.unGroupDeliverable)
        this.unGroupStack();
      else if (payload == ActionOnBlockStack.demote)
        this.demoteBlock(2);
      else if (payload == ActionOnBlockStack.promote)
        this.demoteBlock(1);
      else if (payload == ActionOnBlockStack.delete) {
        this.deleteblock();
      }
      else if (payload == ActionOnBlockStack.copyToLibrary) {
        this.copyToLibrary();
      }
      else if (payload == ActionOnBlockStack.cancelFilter)
        this.cancelFilter();
      else if (payload == ActionOnBlockStack.userRights) {
        this.accessRights = this.designerService.selectedEntityRights;
      }
      else if (payload === true) {
        this.disablePaste = payload;
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable).subscribe((payload: DeliverablesInput) => {
      if(!this.designerService.isProjectManagement) {
        this.checklistSelection.clear();
        payload.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
        this.getDeliverableBlocks(payload); // commented as expand not working for nested block
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.docViewSelectedNodeDeliverables).subscribe((blockId: string) => {
      //This should be block referenceId instead of block Id
      this.highlightSelectedBlock(blockId);
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.selectAll).subscribe((payload) => {

      this.selectAllBlocks();
    }));


    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.copyDeliverable).subscribe((payload: boolean) => {

      this.disablePaste = payload;
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.searchDeliverableDetails).subscribe((payload: TemplateAndBlockDetails) => {
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      if (payload.filterApplied == true)
        this.filter = false;
      let data: any = payload.blocks;
      this.dataSource1.data = data;
      this.designerService.deliverabletemplateDetails = this.selectedTemplate = payload.template;
    }));
    this.designerService.blockSelectedModel = this.blockSelectedModel;
  }

  updateDataSource(payLoad, dataSource1)
  {
    if(dataSource1 && dataSource1.length){
      dataSource1.forEach(item => {
        if(payLoad.id == item.blockId){
        if (item) {
          item.item = payLoad.title;
          item.title = payLoad.title;
          item.description = payLoad.description;
          item.uId = payLoad.uId ? payLoad.uId : item.uId;
          }
        }
        this.updateDataSource(payLoad, item.blocks);
        });
    }
  }

  updateDataSourceUId(payLoad, dataSource1)
  {
    if(dataSource1 && dataSource1.length){
      dataSource1.forEach(item => {
        if(payLoad.id == item.blockId){
        if (item) {
          item.uId = payLoad.uId ? payLoad.uId : item.uId;
          }
        }
        this.updateDataSourceUId(payLoad, item.blocks);
        });
    }
  }
  private convertBlockType(x: BlockDetailsResponseViewModel) {
    x.blocks.forEach(z => {
      let blockTypeObj = new BlockType();
      blockTypeObj.blockTypeId = z.blockTypeId;
      blockTypeObj.blockType = String(z.blockType);
      z.blockType = blockTypeObj;
      if (z.blocks.length > 0) {
        this.convertBlockType(z);
      }
    });
  }
  getEmptyNode() {
    var newNode: any = {};
    newNode.id = "";
    newNode.item = "";
    newNode.parentId = ValueConstants.DefaultId;
    newNode.previousId = ValueConstants.DefaultId;
    var data: any = [];
    data.push(newNode);
    return data;
  }

  ngAfterViewInit() {
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  private getDeliverableBlocks(deliverableInput) {
    var initialData: any;
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.deliverableService.getDeliverable(deliverableInput).subscribe((data: DeliverableResponseViewModel) => {
      this.enableCopy = true;
      this.enableCreate = true;
      this.disablePaste = false;
      if (data) {
        this.filter = true;
        initialData = data.blocks;
        if (this.designerService.isExtendedIconicView) {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
          if (data.blocks.length) {
            initialData = data.blocks;
            this.dataSource1.data = initialData;
          }
          else {
            this.database1.dataChange.next(this.getEmptyNode());
          }
          let node = this.treeControl.dataNodes.find(x => x.id == this.designerService.blockDetails.id);
          if (node && !this.designerService.isProjectManagement){
            this.checklistSelection.toggle(node);
          }
          if(!node && this.designerService.isProjectManagement) {
            node = this.treeControl.dataNodes.find(x => x.blockId == this.designerService.blockDetails.id);
            if(node) {
              this.checklistSelection.toggle(node);
              this.designerService.blockDetails = node;
            }
            
          }
        }
        this.selectedDeliverable = new DeliverableViewModel();
        this.selectedDeliverable.deliverableId = data.id;
        this.selectedDeliverable.entityId = data.entityId;
        this.selectedDeliverable.projectId = data.projectId;
        this.selectedDeliverable.layoutStyleId = data.layoutStyleId;
        this.selectedDeliverable.uId = data.uId;
        this.selectedDeliverable.templateId = this.designerService.deliverabletemplateDetails ? this.designerService.deliverabletemplateDetails.templateId
          : this.designerService.deliverableDetails.templateId;
        this.designerService.deliverableDetails = this.selectedDeliverable;
        this.service.deliverableId = this.selectedDeliverable.deliverableId;
      }
      var dataPublish = new blockSelectedModel();
      dataPublish.blockSelectCount = 0;
      dataPublish.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).publish(dataPublish));
      this.processDeliverable(deliverableInput, data);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }),
      (error) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        console.log(error);
      };
    return initialData;
  }


  expandBlock(node: TodoItemFlatNode) {
    if (!this.designerService.isDocFullViewEnabled.value) {
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
    if (this.designerService.isDoubleClicked.value) {
      this.checklistSelection.clear();
      this.checklistSelection.toggle(node);
    }
    this.designerService.blockList = [];
    this.designerService.assignToBlockList = [];
    this.designerService.clear();
    if (this.checklistSelection.isSelected(node)) {
      this.designerService.blockDetails = node;
      let parentNode = this.getStackId(node);
      if(parentNode)
      {
        this.designerService.blockDetails.parentUId = parentNode.uId;
      }
      this.designerService.prevTempOrDelId = this.designerService.deliverableDetails.deliverableId;
      this.treeControl.dataNodes.find(x=>x.id == node.id)["isSelected"] = true;
    }
    else
    {
      this.designerService.blockDetails = null;
      this.treeControl.dataNodes.find(x=>x.id == node.id)["isSelected"] = false;
    }
    if (!this.designerService.isDoubleClicked.value) {
      const descendants = this.treeControl.getDescendants(node);
      if(node.isStack || this.isAllselected)
      this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);
      this.todoParentSelection(node);
    }

    this.enableCreate = true;
    this.enableCopy = true;
    this.disablePaste = false;
    this.designerService.reportblockList = this.treeControl.dataNodes.filter(x => x["isSelected"]);
    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
        let index = this.designerService.reportblockList.findIndex(x => x.id == element.id);
        if (index == -1)
          this.designerService.reportblockList.push(element);
      });
      this.designerService.assignToBlockList = this.treeControl.dataNodes.filter(x=>x["isSelected"])
      nodesArray.forEach((ele) => {
        var item = this.flatNodeMap.get(ele);
        if (node.isStack)
        this.getSelectedBlocks(item, nodesArray);
      });
      nodesArray.forEach(el => {
        this.designerService.blockList.push(el);
      })

      this.designerService.appendixBlockExists = false; 
      this.designerService.blockList.forEach( el =>{
        if (this.designerService.appendixBlocks && this.designerService.appendixBlocks.length > 0) {
          this.designerService.appendixBlocks.forEach( item => {
            if((el.blockId == item.blockId) || this.designerService.appendixBlockExists)
              this.designerService.appendixBlockExists = true;
            else
              this.designerService.appendixBlockExists = false; 
          })
        }
      })

      if (this.designerService.blockDetails == null && nodesArray.length == 1)
        this.designerService.blockDetails = nodesArray[0];

      if (nodesArray.length == 1)
        this.enableCreate = true;
      if (nodesArray.length >= 1) {
        this.enableCopy = true;
      }
    }
    this.selectedBlock();

    if (this.designerService.isExtendedIconicView && !node.isStack) {
      this.designerService.blockDetails = node;
      var activeClasses = document.getElementsByClassName(ActionEnum.blockactive);
      for (var i = 0; i < activeClasses.length; i++) {
        activeClasses[i].classList.remove(ActionEnum.blockactive)
      }

      document.getElementById("item_" + node.nodeIndex).parentElement.classList.add(ActionEnum.blockactive);
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.iconExtendedView).publish(undefined);
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editorBlockAttributes).publish(undefined);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.updateHeader).publish(undefined);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.deliverables);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('scrollToBlock');
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.displayQuestionList).publish('clearEditQuestion');
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.insert.pageBreak).publish(undefined);
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

    // this.designerService.blockDetails = null;

    // if (event.checked) {
    //   this.designerService.blockDetails = node;
    //   this.designerService.blockList.push(node);
    // }

    // if (!event.checked) {
    //   this.designerService.blockDetails = null;
    //   this.designerService.blockList = this.designerService.blockList.filter(function (obj) {
    //     return obj.id !== node.id;
    //   });

    // }
    this.selectedBlocksStacks = this.designerService.assignToBlockList;
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
    let differentParents = (parentIds && parentIds.length > 0) ? parentIds.filter((x, i, a) => a.indexOf(x) == i) : new Array();

    if (differentParents.length > 1) {
      this.blockSelectedModel.canCreateStack = false;

    }
    else {
      this.blockSelectedModel.canCreateStack = true;
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).publish(this.blockSelectedModel);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);

  }
  loadData(payload: TemplateAndBlockDetails) {
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.checklistSelection.clear();
    var initialData: any;
    initialData = payload.blocks;
    if (initialData) this.dataSource1.data = initialData;
    this.designerService.deliverabletemplateDetails = this.selectedTemplate = payload.template;
    this.deliverablesInput.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
    this.deliverablesInput.templateId = this.selectedTemplate.templateId;
  }
  cancelFilter() {
    this.deliverablesInput.id = this.designerService.entityDetails[0].entityId;
    this.getDeliverableBlocks(this.deliverablesInput);
  }

  createBlock(node) {
    this.designerService.blockList = [];
    this.designerService.blockList.push(node);
    this.designerService.blockDetails = node;
    this.designerService.prevTempOrDelId = this.designerService.deliverableDetails.deliverableId;
    this.designerService.isDeliverableSection = true;
    this.dialogService.open(CreateBlockAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  deleteblock() {
    this.designerService.blockList.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack != undefined) {
        x.stackBlockId = parentStack.blockId;
        x.IsPartOfstack = true;
        x.parentUId = parentStack.uId;
      }
    })

    this.DeleteBlockViewModel.blockDetails = this.designerService.blockList;
    this.DeleteBlockViewModel.libraryReferenceModel = new LibraryReferenceViewModel();
    this.DeleteBlockViewModel.libraryReferenceModel.template = null;
    this.DeleteBlockViewModel.libraryReferenceModel.country = null;
    this.DeleteBlockViewModel.libraryReferenceModel.deliverable = this.designerService.deliverableDetails;
    this.DeleteBlockViewModel.libraryReferenceModel.global = false;
    this.DeleteBlockViewModel.libraryReferenceModel.organization = null;
    this.DeleteBlockViewModel.libraryReferenceModel.project = null;
    this.dialogDeliverable = new Dialog();
    this.dialogDeliverable.Type = DialogTypes.Delete;
    this.dialogDeliverable.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordRemoveConfirmationMessage');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogDeliverable
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blockService.deleteBlocks(this.DeleteBlockViewModel, null).subscribe(
          response => {
            if (response && response.responseType === ResponseType.Mismatch) {
              this.toastr.warning(response.errorMessages.toString());
            }
            else {
              this.toastr.success(this.translate.instant('screens.home.labels.blockDeletedSuccessfully'));
             
              //Block(s) were deleted, now reload the template section
              this.deliverableService.reloadDeliverableDocumentView();
              this.deliverablesInput.id = this.designerService.entityDetails[0].entityId;
              this.deliverablesInput.pushBackBlocks = true;
              this.getDeliverableBlocks(this.deliverablesInput);
              if (this.designerService.isDocFullViewEnabled != null) {
                this.blockSelectedModel.blockSelectCount = 0;
                this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
                this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
              }
            }
            this.designerService.clear();
            this.service.selectedNodes = [];
            this.designerService.blockList = [];
            this.designerService.assignToBlockList = [];
            this.designerService.clear();
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
    if (this.designerService.isExtendedIconicView || (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value) || this.isDocumnetViewDoubleClick) {
      event.preventDefault();
      return;
    }
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
    if (!node.blockId) {
      this.dragNodeExpandOverArea = 'below';
    }
  }

  handleDrop(event, node) {
    if (this.designerService.isExtendedIconicView || (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value) || this.isDocumnetViewDoubleClick) {
      event.preventDefault();
      return;
    }
    this.projectUserRightsData = this.designerService.projectUserRightsData;
    if (this.designerService.selectedEntityRights)
      this.accessRights = this.designerService.selectedEntityRights;
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
    event.preventDefault();
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
      this.designerService.entititesSelectedInTemplate.forEach(x => {
        dragDropRequestModel.blockToMultipleEntities.push(x.entityId);
      });
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
      this.designerService.entititesSelectedInTemplate.forEach(x => {
        dragDropRequestModel.blockToMultipleEntities.push(x.entityId);
      });
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
          this.checklistSelection.clear();
          this.blockSelectedModel.blockSelectCount = 0;
          this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIconD).publish(this.blockSelectedModel));

        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          newItem = this.database1.copyPasteItemBelow(this.service.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Deliverable);
          this.SaveDragDropBlockStack(dragDropRequestModel);
          this.checklistSelection.clear();
          this.blockSelectedModel.blockSelectCount = 0;
          this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIconD).publish(this.blockSelectedModel));

        } else {
        }
      }
    }
    this.checklistSelection.clear();
    this.blockSelectedModel.blockSelectCount = 0;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIconD).publish(this.blockSelectedModel));


  }

  processDeliverable(payload, data)
  {
    if(payload.pushBackBlocks && data.automaticPropagation)
    {
      this.dialogDeliverable = new Dialog();
      this.dialogDeliverable.Type = DialogTypes.Confirmation;
      this.dialogDeliverable.Message = this.translate.instant("screens.project-designer.iconview.automatic-propagation");
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: this.dialogDeliverable
      });
      dialogRef.afterClosed().subscribe(action=>{
        if(action){
          this.deliverableService.pushBackBlocks(payload.entityId ? payload.entityId : payload.deliverableId ? payload.deliverableId : payload.id).subscribe(x=>{
             this.treeControl.dataNodes.forEach(b=>b.colorCode = b.colorCode == ColorCode.Teal ? ColorCode.White : b.colorCode);
             
          });
        }
        else{
          this.treeControl.dataNodes.forEach(b=>b.colorCode = b.colorCode == ColorCode.White ? ColorCode.Teal : b.colorCode);
          this.deliverableService.disassociateDeliverableFromTemplate(payload.entityId ? payload.entityId : payload.deliverableId ? payload.deliverableId : payload.id).subscribe(x=>{
            this.getDeliverableBlocks(this.designerService.deliverableDetails);
          });
        }
      })
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
            //this.dataSource1.data = response.blocks;
            this.selectedBlocksStacks = [];
            this.designerService.blockList = [];
            this.designerService.assignToBlockList = [];
            this.designerService.clear();
            this.checklistSelection.clear();
            this.deliverablesInput.id = this.designerService.entityDetails[0].entityId;
            this.deliverablesInput.pushBackBlocks = true;
            this.getDeliverableBlocks(this.deliverablesInput);
            if (this.designerService.isDocFullViewEnabled != null) {
              this.blockSelectedModel.blockSelectCount = 0;
              this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
            }
          }
        });
      }
    }
  }
  private SaveDragDropBlockStack(dragDropRequestModel) {
    //Save block dragged and dropped from library to template
    this.service.saveDragDrop(dragDropRequestModel).subscribe(data => {
      //refresh the tree data after save
      if (data.responseType === ResponseType.Mismatch) {
        this.toastr.warning(data.errorMessages.toString());
      }
      else {
        this.deliverablesInput.id = this.designerService.entityDetails[0].entityId;
        this.deliverablesInput.pushBackBlocks = true;
        this.getDeliverableBlocks(this.deliverablesInput);
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
    this.designerService.blockList = [];
    this.designerService.assignToBlockList = [];
    this.designerService.clear();
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
    if (obj.blockId) // This condition is to handle blank node.
    {
      dragDropRequestModel.dragDropList.push(obj);
    }
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
    this.dragNodeExpandOverArea = null;
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
      stackToUngroup.deliverableId = this.service.deliverableId;
      stackToUngroup.templateId = this.service.templateId;

      stackToUngroup.stackId = selectedStack.blockId;
      stackToUngroup.projectId = this.designerService.deliverabletemplateDetails.projectId;

      //Details needed for concurrency
      stackToUngroup.stackUid = selectedStack.uId;
      if(this.designerService.templateDetails){
        stackToUngroup.templateUid = this.designerService.templateDetails.uId;
      }
      if(this.designerService.deliverableDetails){
        stackToUngroup.deliverableUid = this.designerService.deliverableDetails.uId;
      }
      //stackToUngroup.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
      //let nextNode = this.treeControl.dataNodes.find(el => el.previousId == selectedStack.id);
      //stackToUngroup.nextId = nextNode ? nextNode.id : '000000000000000000000000';

      this.deliverableService.DeliverableStackUngroup(stackToUngroup).subscribe(
        (response: GenericResponse) => {

          if (response && response.isSuccess) {
            this.checklistSelection.clear();
            this.selectedBlocksStacks = [];
            this.designerService.blockList = [];

            this.deliverablesInput.id = this.designerService.entityDetails[0].entityId;
            this.deliverablesInput.pushBackBlocks = true;
            this.getDeliverableBlocks(this.deliverablesInput);
          }
          else {
            if (response && response.responseType === ResponseType.Mismatch) {
              this.toastr.warning(response.errorMessages.toString());
            }
          }

        });
    }
  }

  pasteStackOrBlock(node) {
    let copyblocksList: BlockStackViewModel[] = new Array();
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
      let parentnode = this.treeControl.dataNodes.find(x => x.blockId == node.parentId);
      if (parentnode) {
        this.blockRequestModel.parentUId = parentnode.uId;
      }
      copyblocksList.push(this.blockRequestModel);
    });

    if (this.designerService.isCopied) {
      this.blockService.copyBlocksStacks(copyblocksList).subscribe((data: any) => {
        if (data && data.responseType === ResponseType.Mismatch) {
          this.toastr.warning(data.errorMessages.toString());
        }
        else {
          this.toastr.success(this.translate.instant('screens.home.labels.blockCopiedSuccessfully'));
         
          this.deliverablesInput.id = this.designerService.entityDetails ? this.designerService.entityDetails[0].entityId : "";
          this.deliverablesInput.pushBackBlocks = true;
          this.getDeliverableBlocks(this.deliverablesInput);
          this.disablePaste = false;
          this.enableCopy = true;
          var dataPublish = new blockSelectedModel();
          dataPublish.blockSelectCount = 0;
          this.checklistSelection.clear();
          this.designerService.clear();
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).publish(dataPublish);
          if (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value) {
            this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(dataPublish);
          }
        }
      });
    }
  }

  // To get the library refernce
  getLibraryreference() {
    var libraryReference = new LibraryReferenceViewModel();

    //section to assign deliverables info if a block has been created from template section
    if (this.designerService.isDeliverableSection == true) {
      libraryReference.deliverable = new DeliverableViewModel();
      libraryReference.deliverable.deliverableId = this.designerService.deliverableDetails.deliverableId;
      libraryReference.deliverable.deliverableName = this.designerService.deliverableDetails.deliverableName;
      libraryReference.deliverable.templateId = this.designerService.deliverableDetails.templateId;
      libraryReference.deliverable.entityId = this.designerService.deliverableDetails.entityId;
      libraryReference.deliverable.uId = this.designerService.deliverableDetails.uId;
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
    let datanodesLength = this.treeControl.dataNodes.filter(x => x.id != "").length;
    this.isAllselected = true;
    if (this.checklistSelection["_selection"].size > 0 && this.checklistSelection["_selection"].size != datanodesLength)
      this.checklistSelection.clear();
    this.dataSource1.data.forEach(x => {
      this.checklistSelection.toggle(this.nestedNodeMap.get(x));
      this.todoItemSelectionToggle(this.nestedNodeMap.get(x));
    })
    this.isAllselected = false;
  }

  copySelectedItems(node) {
    if (!this.designerService.blockList || this.designerService.blockList.length == 0) {
      this.designerService.blockList = [];
      this.designerService.blockList.push(node);
    }
    this.designerService.isCopied = true;
    this.designerService.blocksToBeCopied = this.designerService.blockList;
    this.disablePaste = true;
  }

  copyToLibrary() {
    this.selectedBlockListId = [];
    this.selectedBlocksStacks = this.designerService.blockList;

    this.selectedBlocksStacks.forEach(element => {
      this.selectedBlockListId.push(element.blockId);
      //this.selectedBlockListId.add(element.blockId);
    })
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.AddtoUserLibrary;
    this.dialogTemplate.Message = this.translate.instant("screens.project-designer.iconview.stackAddedtoUserlibAlert");

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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }


  canCopy() {
    let hasAccess = ((this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.isCentralUser) ||
      this.checkIsInRoles(DocumentViewAccessRights.CanCopyPaste) || this.checkIsInRoles(DocumentViewAccessRights.CanCreateBlock));
    return this.enableCopy && hasAccess;
  }

  canCreate() {
    let hasAccess = ((this.designerService.docViewAccessRights && this.designerService.docViewAccessRights.isCentralUser) ||
      this.checkIsInRoles(DocumentViewAccessRights.CanCreateBlock));
    if (hasAccess && (this.dataSource1.data[0] && !this.dataSource1.data[0].id)) {
      return true;
    }
    return this.enableCreate && hasAccess;
  }
  highlightSelectedBlock(blockId: string) {
    let selectedNode = this.treeControl.dataNodes.find(x => x.blockId == blockId);
    if (selectedNode) {
      //if parent id is not null, then expand the parent node to show the selected block in doc view
      if (selectedNode.parentId && selectedNode.parentId !== '') {
        let parentNode = this.treeControl.dataNodes.find(x => x.id == selectedNode.parentId
          || x.blockId == selectedNode.parentId);
        if (parentNode) {
          this.treeControl.expandDescendants(parentNode);
        }
        // this.checklistSelection.clear();
        this.designerService.blockDetails = selectedNode;
        //this.checklistSelection.toggle(selectedNode);
        let activeClasses = document.getElementsByClassName(ActionEnum.blockactive);
        for (let i = 0; i < activeClasses.length; i++) {
          activeClasses[i].classList.remove(ActionEnum.blockactive)
        }
        let element = document.getElementById("item_" + selectedNode.nodeIndex);
        if (element && element != null) {
          element.parentElement.classList.add(ActionEnum.blockactive);
          let topPos = element.offsetTop;
          document.getElementById(ActionEnum.parentDiv).scrollTop = topPos;
        }
      }
    }
  }

  checkIsInRoles(roleToCompare) {
    if (this.designerService.selectedDeliverableDocRights && this.designerService.selectedDeliverableDocRights.length > 0) {
      if (this.designerService.selectedDeliverableDocRights[0].roles.find(i => i == roleToCompare))
        return true;
      else
        return false;
    }
  }

  pasteStackOrBlockAsReference(node) {
    let payload : any = {};
    payload.deliverableId = this.designerService.deliverableDetails.entityId;
    payload.blocks = this.designerService.blocksToBeCopied;

    payload.blocks.forEach((item, index) => {
      item.previousId = index == 0 ? node.id : eventConstantsEnum.emptyGuid;
      item.parentId = node.parentId;

      item.isParentStack = false;
      if(item.parentId != eventConstantsEnum.emptyGuid){
        let parentRecord = this.dataSource1.data.filter(id=>id.blockId == item.parentId);
        if(parentRecord.length > 0){
          item.isParentStack = parentRecord[0].isStack;
        }
      }
    });
    payload.uId = this.designerService.deliverableDetails.uId;

    if (this.designerService.isCopied) {
      //Concurrency check 
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.blockService.copyBlocksStacksAsReferenceForDeliverable(payload).subscribe((response: any) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        if (response && response.responseType === ResponseType.Mismatch) {
          this.toastr.warning(response.errorMessages.toString());
        }
        else{   
          this.toastr.success(this.translate.instant('screens.project-designer.iconview.blocksCopiedSuccessMsg'));
         this.deliverablesInput.id = this.designerService.deliverableDetails ? this.designerService.deliverableDetails.entityId : "";
        this.deliverablesInput.pushBackBlocks = true;
        this.getDeliverableBlocks(this.deliverablesInput);
        this.disablePaste = false;
        this.enableCopy = true;
        var dataPublish = new blockSelectedModel();
        dataPublish.blockSelectCount = 0;
        this.checklistSelection.clear();
        this.designerService.clear();
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewDeliverableSection.enableIcon).publish(dataPublish);
      }
      });
    }
  }

  getParentBlockId(blockId, deliverableId) {
    const request = new TemplateDeliverableRequestModel();
    request.BlockId = blockId;
    request.TemplateOrDeliverableId = deliverableId;
    request.IsTemplate = false;
    this.blockService.getParentBlockId(request).subscribe((response: any) => {
      if(response && response.id) {
        let node =  this.treeControl.dataNodes.find(x => x.id == response.id);
        if(node) {
         this.treeControl.expand(node);
          this.expandBlockOnNavigation(node);
          this.treeControl.expandDescendants(node);
        }
      }

    });
  }

  expandBlockOnNavigation(node: TodoItemFlatNode) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    if (!this.designerService.isDocFullViewEnabled.value) {
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
            if(this.designerService.isProjectManagement) {
              this.designerService.isProjectManagement = false;
              let assignedBlockNode = this.dataSource1.data.find(item => item.blockId === this.designerService.blockDetails.id);
              if(!assignedBlockNode && node.hasChildren) {
                let assignedNode = this.treeControl.dataNodes.find(item => item.blockId === this.designerService.blockDetails.id);
                this.designerService.blockDetails = assignedNode;
                this.treeControl.expandDescendants(node);
                this.todoItemSelectionToggle(assignedNode);
              }
            } else {
              let assignedNode = this.treeControl.dataNodes.find(item => item.blockId === this.designerService.blockDetails.blockId);
              this.designerService.blockDetails = assignedNode;
              this.treeControl.expandDescendants(node);
              this.todoItemSelectionToggle(assignedNode);
            }
            this.ngxLoader.stopBackgroundLoader(this.loaderId);
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
              let assignedNode = this.treeControl.dataNodes.find(item => item.blockId === this.designerService.blockDetails.blockId);
              this.designerService.blockDetails = assignedNode;
              this.treeControl.expandDescendants(node);
              this.todoItemSelectionToggle(assignedNode);
              this.ngxLoader.stopBackgroundLoader(this.loaderId);
            });
          }
          else {
            this.deliverableChildNodes.indentation = node.indentation;
            this.deliverableService.getBlocksByBlockId(this.deliverableChildNodes).subscribe((data: BlockDetailsResponseViewModel[]) => {
              this.blockExpandData = data;
              let flatnode = this.flatNodeMap.get(node);
              flatnode.blocks = this.blockExpandData;
              this.dataSource1.data = this.dataSource1.data;
              if(this.designerService.isProjectManagement) {
                this.designerService.isProjectManagement = false;
                if(node.hasChildren || node.expandable)
                {
                  this.treeControl.expand(node);
                  this.treeControl.expandDescendants(node);

                  let assignedBlockNode = this.treeControl.dataNodes.find(item => item.blockId === this.designerService.blockDetails.id);
                  if(assignedBlockNode) {
                    this.designerService.blockDetails = assignedBlockNode;
                    this.todoItemSelectionToggle(assignedBlockNode);
                  }

                }
              } else {
                let assignedNode = this.treeControl.dataNodes.find(item => item.blockId === this.designerService.blockDetails.blockId);
                this.designerService.blockDetails = assignedNode;
                this.treeControl.expandDescendants(node);
                this.todoItemSelectionToggle(assignedNode);
              } 
              this.ngxLoader.stopBackgroundLoader(this.loaderId);
            });
          }
        }
      }
    }

  }
}
