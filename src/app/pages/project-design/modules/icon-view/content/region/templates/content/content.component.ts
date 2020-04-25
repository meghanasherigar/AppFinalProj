
// import { Component, OnInit } from '@angular/core';

import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { IconViewService } from '../../../../services/icon-view.service';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum, ColorCode } from '../../../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { TemplateAndBlockDetails, TemplateViewModel, TemplateStackUngroupModel, TemplateBlockDemote, BlockDetail } from '../../../../../../../../@models/projectDesigner/template';
import { TemplateService } from '../../../../../../services/template.service';
import { BlockRequest, DragDropRequestViewModel, DragDropSection, ActionType, BlockDetailsResponseViewModel, BlockDetails, ActionOnBlockStack, BlockStackViewModel, blockSelectedModel, BlockType, BlockStatus, TemplateBlockDetails, TemplateDeliverableRequestModel } from '../../../../../../../../@models/projectDesigner/block';
import { NbDialogService } from '@nebular/theme';
import { CreateBlockAttributesComponent } from '../../../../manage-blocks/create-block-attributes/create-block-attributes.component';
import { LibraryReferenceViewModel, ProjectDetailsViewModel, DeleteBlockViewModel, CBCBlocDeleteModel } from '../../../../../../../../@models/projectDesigner/library';
import { DesignerService } from '../../../../../../services/designer.service';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { ProjectDetails } from '../../../../../../../../@models/projectDesigner/region';
import { viewAttributeModel, regions, ActionEnum, GenericResponseModel } from '../../../../../../../../@models/projectDesigner/common';
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
import { CdkVirtualScrollViewport, ScrollDispatcher } from '@angular/cdk/scrolling';
import { ProjectUserService } from '../../../../../../../admin/services/project-user.service';
import { ProjectUserRightViewModel, EntityRoleViewModel } from '../../../../../../../../@models/userAdmin';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
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
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  providers: [ChecklistDatabase1]
})
export class TemplateContentComponent implements OnInit, OnDestroy {
  filter: boolean = true;
  isAllselected: boolean = false;
  selectDeselectAllBlocks: boolean;
  [x: string]: any;
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  //ngx-ui-loader configuration
  loaderId = 'TemplateLoader';
  loaderPosition = POSITION.centerLeft;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  pageIndex: number = 1;
  pageSize = 5;

  showLoader: boolean = false;
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
  selectedBlockListId: any = [];
  isDocumnetViewDoubleClick: boolean;
  enableCreate: boolean = false;
  enableCopy: boolean = false;
  pasteNode: any;
  blockViewType: string;
  private dialogTemplate: Dialog;
  projectUserRightsData: ProjectUserRightViewModel;
  accessRights: any;
  levelsLimit: any = 0;
  maxLength: any = 4;

  constructor(private readonly _eventService: EventAggregatorService, private database1: ChecklistDatabase1, protected storageService: StorageService,
    private service: IconViewService, private dialogService: NbDialogService,
    private templateService: TemplateService,
    private deliverableService: DeliverableService,
    public designerService: DesignerService,
    private stackService: StackService,
    private blockService: BlockService,
    private dialog: MatDialog,
    private DialogService: DialogService,
    private sharedService: ShareDetailService,
    private scrollDispatcher: ScrollDispatcher,
    private changeDetRef: ChangeDetectorRef,
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
    private projectUserService: ProjectUserService,
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

    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.nodeIndex = 0;
    var initialData: any;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockView).subscribe((selectedViewType: any) => {
      this.blockViewType = selectedViewType.value;
    }));
    this.designerService.currentDoubleClicked.subscribe(isDoubleClicked => this.isDocumnetViewDoubleClick = isDoubleClicked);
    this.projectDetails = this.sharedService.getORganizationDetail();

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteAll).subscribe((payload) => {
      if (payload)
        this.cancelFilter();
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.refreshTemplateBlocks).subscribe((payload: any = []) => {
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

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.refreshTemplateBlocksUId).subscribe((payload: any = []) => {
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

    this.designerService.selectedDesignerTab.subscribe(selectedTab => {
      this.selectedDesignerTab = selectedTab;
      // if (this.selectedDesignerTab == 1) {
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.blockSelectedModel.blockSelectCount = this.designerService.assignToBlockList.length;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
      // }
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetails).subscribe((payload: TemplateAndBlockDetails) => {
      if (payload.filterApplied == true)
        this.filter = false;
      this.nodeIndex = 0;
      this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.checklistSelection.clear();
      this.enableCopy = true;
      this.enableCreate = true;
      this.disablePaste = false;
      var initialData: any;
      if (payload.blocks != undefined) {
        if (payload.blocks.length) {

          payload.blocks.forEach(x => {
            var nestedBlock = x.blocks.find(y => y.parentId == x.id);
            if (x.isStack || nestedBlock != undefined) {
              this.convertBlockType(x);
            }
          })
          initialData = payload.blocks;
          this.dataSource1.data = initialData;
        }
        else {
          this.database1.dataChange.next(this.getEmptyNode());
        }
      }
      var templateName = this.designerService.templateDetails.templateName;
      this.designerService.templateDetails = this.selectedTemplate = payload.template;
      this.designerService.templateDetails.templateName = templateName;
      if (this.designerService.blockDetails != null) {
        if (this.isDocumnetViewDoubleClick) {
          let nodes = this.treeControl.dataNodes;
          let blockId = this.designerService.isProjectManagement ? this.designerService.blockDetails.id : this.designerService.blockDetails.blockId;
          let node = nodes.find(x => x.id == this.designerService.blockDetails.id);
          if (!node) {
            node = nodes.find(x => x.blockId == blockId);
            if(!node) {
              this.getParentBlockId(blockId, this.selectedTemplate.templateId);
            } else {
              this.designerService.isProjectManagement = false;
              this.designerService.blockDetails = node;
            }
          }
          if (node != undefined) {
            this.checklistSelection.toggle(node);
            this.designerService.reportblockList.push(node);
            //todo need to remove timeout
            setTimeout(function () {
              var element = document.getElementById("item_" + node.nodeIndex);
              if (element && element != null)
                element.parentElement.classList.add(ActionEnum.blockactive);
            }, 1000);
          }
          this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
          this.blockSelectedModel.blockSelectCount = 1;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
        }

        else {
          this.checklistSelection.toggle(this.designerService.blockDetails)
        }
      }
      if (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value) {
        this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
        this.blockSelectedModel.blockSelectCount = (this.designerService.assignToBlockList != null) ? this.designerService.assignToBlockList.length : 0;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);

      }
      this.designerService.blockList = [];
      this.designerService.assignToBlockList = [];
      if (!this.isDocumnetViewDoubleClick)
        this.designerService.clear();
      this.blockSelectedModel.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this.blockSelectedModel.blockSelectCount = this.designerService.assignToBlockList.length;
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(this.blockSelectedModel));

      if (this.selectedTemplate) {
        this.service.templateId = this.selectedTemplate.templateId;
      }

      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.docViewSelectedNodeTemplate).subscribe((blockId: string) => {
      this.highlightSelectedBlock(blockId);
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.selectAllTemp).subscribe((payload) => {
      this.selectAllBlocks();
    }));


    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).subscribe((payload: any) => {
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


    this.templateService.pasteEvent.subscribe(() => this.pasteStackOrBlock(this.pasteNode));
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
        this.levelsLimit = this.levelsLimit + 1;
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
    //TODO: Comment for scrolling
    // this.scrollDispatcher.scrolled().subscribe(res => {});
    // this.virtualScroll.renderedRangeStream.subscribe(range => {});
  }

  OnScroll(currentIndex) {
    let last = this.virtualScroll.getRenderedRange().end;
    //Call the API to load next set of records when the scroll is at the last position
    if (last && currentIndex && last === currentIndex + 1) {
      this.pageIndex++;
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.templateService.getTemplateBlocksByTemplateId(this.selectedTemplate.templateId, this.pageIndex, this.pageSize)
        .subscribe((data: TemplateBlockDetails) => {
          if (data) {
            let oldData = this.dataSource1.data;
            //Push the new data to existing data-Set
            oldData.push.apply(oldData, data.blocks);
            let newData = oldData;
            this.designerService.templateDetails = this.selectedTemplate = data.template;
            this.dataSource1.data = [];
            this.dataSource1.data = newData;
            this.changeDetRef.detectChanges();

            this.ngxLoader.stopBackgroundLoader(this.loaderId);
          }
        }, (error) => {
          console.error('Error', error);
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
        });
    }
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

    flatNode.colorCode = node.colorCode;
    flatNode.blockType = node.blockType;
    flatNode.blockStatus = node.blockStatus;
    //Unique Identifier for concurrency check
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
  expandBlock(node: TodoItemFlatNode, dragDropSave: boolean, nextNode: TodoItemFlatNode, nextNodeOfDragNode: TodoItemFlatNode, dragDropRequestModel: DragDropRequestViewModel, source: any, destination: any) {
    if (!this.designerService.isDocFullViewEnabled.value) {
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
    if (this.designerService.isDoubleClicked.value) {
      this.checklistSelection.clear();
      this.checklistSelection.toggle(node);
    }
    //this.checklistSelection.toggle(node);
    this.designerService.blockList = [];
    this.designerService.assignToBlockList = []
    this.designerService.clear();
    if (this.checklistSelection.isSelected(node)) {
      this.designerService.blockDetails = node;
      let parentNode = this.getStackId(node);
      if (parentNode) {
        this.designerService.blockDetails.parentUId = parentNode.uId;
      }
      this.designerService.prevTempOrDelId = this.designerService.templateDetails.templateId;
      this.treeControl.dataNodes.find(x => x.id == node.id)["isSelected"] = true;
    }
    else {
      this.designerService.blockDetails = null;
      this.treeControl.dataNodes.find(x => x.id == node.id)["isSelected"] = false;
    }
    if (!this.designerService.isDoubleClicked.value) {
      const descendants = this.treeControl.getDescendants(node);
      if (node.isStack || this.isAllselected)
        this.checklistSelection.isSelected(node)
          ? this.checklistSelection.select(...descendants)
          : this.checklistSelection.deselect(...descendants);
      this.todoParentSelection(node);
    }


    this.enableCreate = true;
    this.enableCopy = true;
    this.disablePaste = false;
    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
        let index = this.designerService.reportblockList.findIndex(x => x.id == element.id);
        if (index == -1)
          this.designerService.reportblockList.push(element);
      });
      nodesArray.forEach((ele) => {
        var item = this.flatNodeMap.get(ele);
        if (node.isStack)
          this.getSelectedBlocks(item, nodesArray);
      });
      nodesArray.forEach(el => {
        this.designerService.blockList.push(el);
      })
      this.treeControl.dataNodes.forEach(nodeEle => {
        let selectedNode = nodesArray.find(element => element.id == nodeEle.id);
        if (selectedNode != undefined)
          nodeEle["isSelected"] = true;
        else
          nodeEle["isSelected"] = false;
      });
      this.designerService.reportblockList = this.treeControl.dataNodes.filter(x => x["isSelected"]);
      this.designerService.assignToBlockList = this.treeControl.dataNodes.filter(x => x["isSelected"]);
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
      var nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.iconExtendedView).publish(nodeCount);
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editorBlockAttributes).publish(undefined);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.updateHeader).publish(undefined);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.region.selectedSection).publish(regions.templates);
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
  selectAllBlocks() {
    this.isAllselected = true;
    let datanodeLength = this.treeControl.dataNodes.filter(x => x.id != "").length;
    if (this.checklistSelection["_selection"].size > 0 && this.checklistSelection["_selection"].size != datanodeLength)
      this.checklistSelection.clear();
    this.dataSource1.data.forEach(x => {
      this.checklistSelection.toggle(this.nestedNodeMap.get(x));
      this.todoItemSelectionToggle(this.nestedNodeMap.get(x));
    })
    this.isAllselected = false;
    //this.designerService.blockList = this.checklistSelection["_selection"];
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
    this.designerService.blockList.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack != undefined)
        x.stackBlockId = parentStack.blockId;
    })
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

    //Check to enable-disable stack creation icon based on parents
    let differentParents = (parentIds && parentIds.length > 0) ? parentIds.filter((x, i, a) => a.indexOf(x) == i) : new Array();

    if (differentParents.length > 1) {
      this.blockSelectedModel.canCreateStack = false;

    }
    else {
      this.blockSelectedModel.canCreateStack = true;
    }

    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(this.blockSelectedModel);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);



  }
  loadData(payload: TemplateAndBlockDetails) {
    this.dataSource1 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.checklistSelection.clear();
    var initialData: any;
    initialData = payload.blocks;
    if (payload.blocks.length) {
      initialData = payload.blocks;
      this.dataSource1.data = initialData;
    }
    else {
      this.database1.dataChange.next(this.getEmptyNode());
    }
    this.designerService.templateDetails = this.selectedTemplate = payload.template;
    this.deliverablesInput.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
    this.deliverablesInput.templateId = this.selectedTemplate.templateId;
  }
  cancelFilter() {
    this.refreshTemplateBlocks();
  }

  //Method to perform get new data after any operation is performed
  refreshTemplateBlocks() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.templateService.getTemplateBlocksByTemplateId(this.selectedTemplate.templateId)
      .subscribe((data: any) => {
        this.filter = true;
        this.designerService.clear();
        this.dataSource1.data = [];
        this.dataSource1.data = data.blocks;
        this.designerService.templateDetails = this.selectedTemplate = data.template;
        //Reset the chosen values. Also check if designer.Clear needs to be called.
        this.designerService.blockList = [];
        this.designerService.assignToBlockList = [];
        this.designerService.clear();
        var dataPublish = new blockSelectedModel();
        dataPublish.blockSelectCount = 0;
        dataPublish.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
        this.designerService.templateDetails = this.selectedTemplate = data.template;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  deleteblock() {
    this.designerService.blockList.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack) {
        x.stackBlockId = parentStack.blockId;
        x.IsPartOfstack = true;
        x.parentUId = parentStack.uId;
      }
    })
    this.DeleteBlockViewModel.blockDetails = this.designerService.blockList;
    this.DeleteBlockViewModel.libraryReferenceModel = new LibraryReferenceViewModel();

    this.DeleteBlockViewModel.libraryReferenceModel.template = this.designerService.templateDetails;
    this.DeleteBlockViewModel.libraryReferenceModel.country = null;
    this.DeleteBlockViewModel.libraryReferenceModel.deliverable = null;
    this.DeleteBlockViewModel.libraryReferenceModel.global = false;
    this.DeleteBlockViewModel.libraryReferenceModel.organization = this.sharedService.getORganizationDetail();
    this.DeleteBlockViewModel.libraryReferenceModel.project = null;


    this.templateService.GetAllReferencedBlocks(this.DeleteBlockViewModel).subscribe((response: number) => {
      this.dialogTemplate = new Dialog();
      this.dialogTemplate.Type = DialogTypes.Delete;
      if (response > 0) {
        this.dialogTemplate.Message = `There are ${response} references of this block, are you sure want to remove the selected block(s)`;
        this.dialogTemplate.Type = 10;
      }
      else {
        this.dialogTemplate.Message = this.dialogDeliverable.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordRemoveConfirmationMessage');
      }
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: this.dialogTemplate
      });



      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.blockService.deleteBlocks(this.DeleteBlockViewModel, null).subscribe(
            response => {
              if (response && response.responseType === ResponseType.Mismatch) {
                this.toastr.warning(response.errorMessages.toString());
              }
              else if (response && response.isSuccess) {
                this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockDeleted'));

                //Block(s) were deleted, now reload the template section
                if (this.designerService.isDocFullViewEnabled != null) {
                  this.blockSelectedModel.blockSelectCount = 0;
                  this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
                  this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
                }
                this.templateService.getTemplateBlocksByTemplateId(this.selectedTemplate.templateId)
                  .subscribe((data: any) => {
                    this.designerService.clear();
                    this.dataSource1.data = [];
                    this.dataSource1.data = data.blocks;
                    //Reset the chosen values. Also check if designer.Clear needs to be called.
                    this.designerService.blockList = [];
                    this.designerService.assignToBlockList = [];
                    this.designerService.clear();
                    var dataPublish = new blockSelectedModel();
                    dataPublish.blockSelectCount = 0;
                    dataPublish.nodeCount = this.treeControl.dataNodes.length;
                    this.designerService.templateDetails = data.template;
                    if (!data || !data.blocks || !data.blocks.length) {
                      this.database1.dataChange.next(this.getEmptyNode());
                    }
                    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);
                  });
              }
              this.service.selectedNodes = [];
              this.designerService.blockList = [];
              this.designerService.assignToBlockList = [];
              this.checklistSelection.clear();
              this.designerService.clear();
            },
            error => {
              this.DialogService.Open(DialogTypes.Warning, error.message);
            });
        }
      });
    });
  }
  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    //

    this.isEnableAttribute = false;
    let payload = this.isEnableAttribute;
    // let payload= new viewAttributeModel();
    // payload.regionType=regions.library;
    this._eventService.getEvent(EventConstants.TemplateSection).publish(payload);

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
      this.service.dragNodes = this.dragNodes;
    }
    else {
      this.dragNode = node;
      this.service.dragNode = node;
    }
    this.service.source = DragDropSection.Template;
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
    if (!node.blockId) {
      this.dragNodeExpandOverArea = 'below';
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
  handleDrop(event, node) {
    event.preventDefault();
    if (this.designerService.isExtendedIconicView || (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value) || this.isDocumnetViewDoubleClick) {
      return;
    }
    //Check Concurrency 
    var concurrencyRequest = new CheckConcurrencyRequestModel();
    var concurrencyDestination = new CheckConcurrencyDestinationRequestModel();
    var concurrencySource = new CheckConcurrencySourceRequestModel();
    var blockList: BlockReferenceViewModel[] = new Array();
    var dragDropRequestModel = new DragDropRequestViewModel();
    dragDropRequestModel.dragDropList = new Array();
    this.PrepareConcurrencyRequest(concurrencyDestination, node, concurrencySource);
    let deliverableBlock = this.service.dragNodes.find(x => x.colorCode == ColorCode.Teal);
    if (deliverableBlock || (this.service.dragNode && this.service.dragNode.colorCode == ColorCode.Teal)) {
      let errorMsg = this.translate.instant('screens.project-designer.iconview.DragDropDeliverableBlockFromCBCToTemplate');
      this.DialogService.Open(DialogTypes.Error, errorMsg);
      this.dragNodeExpandOverArea = null;
      return;
    }
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
          this.blockSelectedModel.blockSelectCount = 0;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(this.blockSelectedModel);

        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          newItem = this.database1.copyPasteItemBelow(this.service.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource1.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
          this.blockSelectedModel.blockSelectCount = 0;
          this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(this.blockSelectedModel));

        } else {
          // this.expandBlock(node, true, nextNode, nextNodeOfDragNode, dragDropRequestModel, this.service.source, DragDropSection.Template);
          return;
        }
      }
    }
    this.checklistSelection.clear();
    this.blockSelectedModel.blockSelectCount = 0;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(this.blockSelectedModel));

  }

  private PrepareConcurrencyRequest(concurrencyDestination: CheckConcurrencyDestinationRequestModel, node: any, concurrencySource: CheckConcurrencySourceRequestModel) {
    concurrencyDestination.section = DragDropSection.Template.toString();
    concurrencyDestination.sectionId = this.selectedTemplate.templateId;
    this.prepareConcurrencyDestinationRequestModel(node, concurrencyDestination);
    concurrencySource.section = this.service.source.toString();
    if (this.service.source == 1)
      concurrencySource.section = this.selectedTemplate.templateId;
  }

  private SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource) {
    //call check concurrency API
    // concurrencyRequest.source = concurrencySource;
    //concurrencyRequest.destination = concurrencyDestination;
    // this.service.checkConcurrency(concurrencyRequest).subscribe(response => {
    //Save block dragged and dropped from library to template
    // if (!response) {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.service.saveDragDrop(dragDropRequestModel).subscribe(data => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      //refresh the tree data after save
      if (data.responseType === ResponseType.Mismatch) {
        this.toastr.warning(data.errorMessages.toString());
      }
      else {
        this.refreshTemplateBlocks();
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
    this.designerService.blockList = [];
    this.designerService.assignToBlockList = [];
    this.designerService.clear();
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
    }// 0 - Library, 1 - Template, 2 - Deliverables, 3 - CBC
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
    if (obj.blockId) // This condition is to handle blank node.
    {
      dragDropRequestModel.dragDropList.push(obj);
    }
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
    this.dragNodeExpandOverTime = 0;
    this.dragNodeExpandOverArea = null;
    this.service.dragNode = null;
    this.service.dragNodes = [];
    this.dragNodes = [];
    this.checklistSelection.clear();
  }

  createBlock(node) {
    this.designerService.blockList = [];
    this.designerService.blockList.push(node);
    this.designerService.blockDetails = node;
    this.designerService.prevTempOrDelId = this.designerService.templateDetails.templateId;
    this.dialogService.open(CreateBlockAttributesComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  pasteStackOrBlock(node) {
    var concurrencyRequest = new CheckConcurrencyRequestModel();
    var concurrencyDestination = new CheckConcurrencyDestinationRequestModel();
    var concurrencySource = new CheckConcurrencySourceRequestModel();
    var blockList: BlockReferenceViewModel[] = new Array();
    let copyblocksList: BlockStackViewModel[] = new Array();
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
      let parentnode = this.treeControl.dataNodes.find(x => x.blockId == node.parentId);
      if (parentnode) {
        this.blockRequestModel.parentUId = parentnode.uId;
      }
      copyblocksList.push(this.blockRequestModel);
    });

    if (this.designerService.isCopied) {
      //Concurrency check 
      this.blockService.copyBlocksStacks(copyblocksList).subscribe((data: GenericResponseModel) => {
        if (data && data.responseType === ResponseType.Mismatch) {
          this.toastr.warning(data.errorMessages.toString());
        }
        else {
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
          this.disablePaste = false;
          var dataPublish = new blockSelectedModel();
          dataPublish.blockSelectCount = 0;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);
          if (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value) {
            this.designerService.blockList = [];
            this.designerService.assignToBlockList = [];
            this.designerService.clear();
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadTemplate).publish(this.designerService.templateDetails);
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

    //section to assign template info if a block has been created from template section
    if (this.designerService.isTemplateSection == true) {
      libraryReference.template = new TemplateViewModel();
      libraryReference.template.isDefault = this.designerService.templateDetails.isDefault;
      libraryReference.template.templateId = this.designerService.templateDetails.templateId;
      libraryReference.template.templateName = this.designerService.templateDetails.templateName;
      libraryReference.template.uId = this.designerService.templateDetails.uId;
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


  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  demoteBlock(action) {
    if (this.selectedBlocksStacks.length > 0) {
      let blockDemote = new TemplateBlockDemote();
      if ((action == 2 && !this.selectedBlocksStacks[0].isStack && this.selectedBlocksStacks[0].previousId != ValueConstants.DefaultId)
        || (action == 1 && !this.selectedBlocksStacks[0].isStack && this.selectedBlocksStacks[0].level > 0)) {
        blockDemote.templateId = this.selectedTemplate.templateId;
        blockDemote.templateUid = this.selectedTemplate.uId;
        this.selectedBlocksStacks.forEach(selectedStackArr => {
          var blockDetail = new BlockDetail();
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
          else {
            if (data) {
              this.designerService.blockList = [];
              let dataPublish = new blockSelectedModel();
              dataPublish.blockSelectCount = 0;
              dataPublish.nodeCount = this.treeControl.dataNodes.filter(x => x.id != "").length;
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);
              this.selectedBlocksStacks = [];
              this.designerService.blockList = [];
              this.designerService.assignToBlockList = [];
              this.checklistSelection.clear();
              if (this.designerService.isDocFullViewEnabled != null) {
                this.blockSelectedModel.blockSelectCount = 0;
                this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
                this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
                this.refreshTemplateBlocks();
              }
            }
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
      stackToUngroup.templateId = this.selectedTemplate.templateId;
      stackToUngroup.stackId = selectedStack.blockId;
      stackToUngroup.deliverableId = this.service.deliverableId;

      //Details needed for concurrency
      stackToUngroup.stackUid = selectedStack.uId;
      if (this.designerService.templateDetails) {
        stackToUngroup.templateUid = this.designerService.templateDetails.uId;
      }
      if (this.designerService.deliverableDetails) {
        stackToUngroup.deliverableUid = this.designerService.deliverableDetails.uId;
      }

      this.stackService.StackUngroup(stackToUngroup).subscribe(

        (response: any) => {
          this.ngxLoader.startBackgroundLoader(this.loaderId);

          if (response && response.isSuccess) {
            this.checklistSelection.clear();
            this.designerService.clear();
            this.selectedBlocksStacks = [];
            this.designerService.blockList = [];
            this.designerService.assignToBlockList = [];
            //Reload deliverable section similar to link-to feature
            //Below event is getting fired multiple times and hence using cancel filter event
            //this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable            
            this._eventService.getEvent(EventConstants.TemplateSection).publish(ActionOnBlockStack.cancelFilter);
            if (this.designerService.isDocFullViewEnabled != null) {
              this.blockSelectedModel.blockSelectCount = 0;
              this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
            }
          }
          else {
            if (response && response.responseType === ResponseType.Mismatch) {
              this.toastr.warning(response.errorMessages.toString());
            }
          }
        });
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    }
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
        // this.checklistSelection.toggle(selectedNode);
        let activeClasses = document.getElementsByClassName(ActionEnum.blockactive);
        for (let i = 0; i < activeClasses.length; i++) {
          activeClasses[i].classList.remove(ActionEnum.blockactive)
        }
        let element = document.getElementById("item_" + selectedNode.nodeIndex);
        if (element && element != null) {
          element.parentElement.classList.add(ActionEnum.blockactive);
          let topPos = element.offsetTop;
          document.getElementById(ActionEnum.parentDiv).scrollTop = topPos;
          element.focus();
        }

      }
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  pasteStackOrBlockAsReference(node) {
    let payload: any = {};
    payload.templateId = this.designerService.templateDetails.templateId;
    payload.blocks = this.designerService.blocksToBeCopied;
    if (this.designerService.templateDetails.uId != undefined)
      payload.uId = this.designerService.templateDetails.uId;
    else
      payload.uId = this.designer.templateDetails.uId;

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

    if (this.designerService.isCopied) {
      //Concurrency check 
      this.ngxLoader.startBackgroundLoader(this.loaderId);
      this.blockService.copyBlocksStacksAsReference(payload).subscribe((response: any) => {
        if (response && response.responseType === ResponseType.Mismatch) {
          this.toastr.warning(response.errorMessages.toString());
        }
        else {
          this.ngxLoader.stopBackgroundLoader(this.loaderId);
          this.toastr.success(this.translate.instant('screens.project-designer.iconview.blocksCopiedSuccessMsg'));
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
          this.disablePaste = false;
          var dataPublish = new blockSelectedModel();
          dataPublish.blockSelectCount = 0;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.enableIcon).publish(dataPublish);

          if (this.designerService.isDocFullViewEnabled != null && this.designerService.isDocFullViewEnabled.value) {
            this.designerService.blockList = [];
            this.designerService.assignToBlockList = [];
            this.designerService.clear();
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadTemplate).publish(undefined);
            this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload'));
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(dataPublish);
          }
        }
      });
    }
  }

  getParentBlockId(blockId, templateId) {
    const request = new TemplateDeliverableRequestModel();
    request.BlockId = blockId;
    request.TemplateOrDeliverableId = templateId;
    request.IsTemplate = true;
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
            this.templateService.getBlocksByBlockId(templateId, node.id, isStack, node.indentation).subscribe((data: BlockDetailsResponseViewModel) => {
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