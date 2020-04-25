// import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, ElementRef, ViewChild, OnInit, Input, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconViewService } from '../../../../services/icon-view.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants } from '../../../../../../../../@models/common/eventConstants';
import { LibraryBlockDetails, LibraryDropdownViewModel, SearchLibraryViewModel, Library, LibraryReferenceViewModel, DeleteBlockViewModel, ProjectDetailsViewModel, OrganizationViewModel, CBCBlocDeleteModel } from '../../../../../../../../@models/projectDesigner/library';
import { LibraryService } from '../../../../../../services/library.service';
import { BlockDetailsResponseViewModel, DragDropRequestViewModel, DragDropSection, ActionOnBlockStack, BlockStatus, BlockType, blockSelectedModel, ActionType, BlockRequest } from '../../../../../../../../@models/projectDesigner/block';
import { UserAssignmentDataModel, CheckConcurrencyRequestModel, CheckConcurrencyDestinationRequestModel, CheckConcurrencySourceRequestModel, BlockReferenceViewModel } from '../../../../../../../../@models/projectDesigner/stack';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { Dialog, DialogTypes } from '../../../../../../../../@models/common/dialog';
import { ConfirmationDialogComponent } from '../../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { BlockService } from '../../../../../../services/block.service';
import { TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../../@models/projectDesigner/template';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { Designer } from '../../../../../../../../@models/projectDesigner/designer';
import { DesignerService as oldDesignerService } from '../../../../../../services/designer.service';
import { DesignerService } from '../../services/designer.service';
import { ResponseType } from '../../../../../../../../@models/ResponseStatus';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemingContext } from '../../../../../../../../@models/projectDesigner/theming';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { ToastrService } from 'ngx-toastr';


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
  isCategory: boolean;
  usersAssignment: UserAssignmentDataModel[];
  colorCode: string;
  blockType: BlockType;
  blockStatus: BlockStatus;
  uId: string;
  isReference: boolean;
  isLocked: boolean;
  blockUser: UserAssignmentDataModel;
  libraryUId: string;
  libraryId: string;
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
  isCategory: boolean;
  colorCode: string;
  blockType: BlockType;
  blockStatus: BlockStatus;
  usersAssignment: UserAssignmentDataModel[];
  uId: string;
  isReference: boolean;
  isLocked: boolean;
  blockUser: UserAssignmentDataModel;
  libraryUId: string;
  libraryId: string;
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
  selector: 'ngx-library-content',
  templateUrl: './library-content.component.html',
  styleUrls: ['./library-content.component.scss'],
  providers: [ChecklistDatabase1]
})
export class LibraryContentComponent implements OnInit, OnDestroy {
  selectDeselectAllBlocks: boolean;
  [x: string]: any;
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
  subscriptions: Subscription = new Subscription();
  libraryList: any;
  dragNode: any;
  dragNodes = [];
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  projectDetails: ProjectContext;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  selectedBlocksStacks: any = [];
  @ViewChild('emptyItem') emptyItem: ElementRef;
  selectedLibrary: LibraryDropdownViewModel;
  blockExpandData: any;
  isEnableAttribute: boolean;
  blockCollection: any = [];
  disableCreate: boolean = false;
  libraryBlockDetails = new LibraryBlockDetails();
  themingContext: ThemingContext;
  DeleteBlockViewModel: DeleteBlockViewModel = new DeleteBlockViewModel();
  CBCBlocDeleteModel;
  requestModel = new SearchLibraryViewModel();
  private dialogTemplate: Dialog;
  blockViewType: string;
  selectedTemplate: TemplateViewModel;
  @Input("section") section: any;
  designer = new Designer();
  filterApplied: boolean =  false;
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  enableRemove: boolean = false;

  constructor(private database: ChecklistDatabase1,private toastr: ToastrService, private service: IconViewService, private designerService: DesignerService, private oldDesignerService: oldDesignerService,
    private blockService: BlockService, private ngxLoader: NgxUiLoaderService, private DialogService: DialogService,
    private readonly _eventService: EventAggregatorService, private libraryService: LibraryService, private sharedDetailService: ShareDetailService,
    private dialog: MatDialog, private router: Router, private translate: TranslateService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;

    });
  }
  loaderId = 'LibraryLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  ngOnInit() {
    this.loaderId = 'LibraryLoader_' + this.section;

    this.projectDetails = this.sharedDetailService.getORganizationDetail();
    var initialData: any;
    this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).subscribe((payload: LibraryBlockDetails) => {
      this.blockViewType = this.designerService.blockViewType;
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      initialData = payload.blocks;
      this.dataSource.data = initialData;
      this.selectedLibrary = payload.library;
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      let _library = this.sharedDetailService.getSelectedTheme().themeOptions.filter(item => item.name == this.section)[0].library;

      this.enableRemove = (_library.name == EventConstants.User) ? true : 
            ((_library.name == EventConstants.BlockCollection || _library.name == EventConstants.Organization) ? this.projectDetails.ProjectAccessRight.isCentralUser : false);

      let isNewDesignerInstance: boolean = true;
      if (this.designer != null && this.designer.libraryDetails != null && this.designer.libraryDetails.id == _library.id) {
        isNewDesignerInstance = false;
      }
      if (isNewDesignerInstance)
        this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService = new Designer();

      this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
      this.designer.libraryDetails = _library;
      if (this.designer.blockDetails != null) {
        if (this.isDocumnetViewDoubleClick) {
          if (this.designer.blockDetails.blockType != null) {
            var blocktype = this.treeControl.dataNodes.find(x => x.blockId == this.designer.blockDetails.blockType.blockTypeId);
            if (blocktype != undefined) {
              this.treeControl.expand(blocktype);
              this.expandBlock(blocktype);
            }
          }
        }
        else {
        }
      }

      //Check if filter data exists in the storage already
      this.checkIfFilterDataExists();
      if(!this.filterApplied) {
        this.expandCategoryNodesFromStorage();
      }
    }),
      (error) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        console.log(error);
      };
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockView).subscribe((selectedViewType: any) => {
      this.designerService.blockViewType = this.blockViewType = selectedViewType.value;
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.LibrarySection).subscribe((payload: any) => {
      if (payload == ActionOnBlockStack.delete) {
        this.deleteblock();
      }
    }));
  }

  expandCategoryNodesFromStorage() {
    let themingContext = this.sharedDetailService.getSelectedTheme();
    let currentDesigner = themingContext.themeOptions.find(item => item.name == this.section).designerService;

    if (currentDesigner && currentDesigner.blockList.length > 0) {
      currentDesigner.blockList.forEach(block => {
        let categoryNode = this.treeControl.dataNodes.find(x => block.blockType && x.blockId === block.blockType.blockTypeId);
        if (categoryNode && !this.treeControl.isExpanded(categoryNode) && !this.filterApplied) {
          this.treeControl.expand(categoryNode);
          this.expandBlock(categoryNode, true);
        }
      });
    }
    
  }


  loadData(payload: TemplateAndBlockDetails) {
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.checklistSelection.clear();
    var initialData: any;
    initialData = payload.blocks;
    if (initialData) this.dataSource.data = initialData;
    this.designer.templateDetails = this.selectedTemplate = payload.template;
    this.deliverablesInput.projectId = !this.projectDetails ? "5cf9fd3f155d2267843716aa" : this.projectDetails.projectId;
    this.deliverablesInput.templateId = this.selectedTemplate.templateId;
  }


  deleteblock() {

    this.designer.blockList.forEach(x => {
      var parentStack = this.getStackId(x);
      if (parentStack) {
        x.stackBlockId = parentStack.blockId;
        x.IsPartOfstack = true;
      }
    });

    let categorySelected = this.designer.blockList.filter(b=>!b.id);
    let selectedBlocks = this.designer.blockList;
    if(categorySelected)
    {
      selectedBlocks = selectedBlocks.concat(this.treeControl.dataNodes.filter(b=> b.blockType && categorySelected.find(c=>c.blockId == b.blockType.blockTypeId)));
      selectedBlocks = selectedBlocks.filter(b=>b.id);
    }
    if (this.designer.libraryDetails.name === EventConstants.BlockCollection) {
      this.CBCBlocDeleteModel = new CBCBlocDeleteModel();
      this.CBCBlocDeleteModel.OrganizationId = this.projectDetails.organizationId;
      this.CBCBlocDeleteModel.ProjectId = this.projectDetails.projectId;
      this.CBCBlocDeleteModel.BlockIds = selectedBlocks;
      this.CBCBlocDeleteModel.Status = 'pending';
    } else {
      this.CBCBlocDeleteModel = null;
      this.DeleteBlockViewModel.blockDetails = selectedBlocks;
      this.DeleteBlockViewModel.libraryReferenceModel = new LibraryReferenceViewModel();
      this.DeleteBlockViewModel.libraryReferenceModel.template = null;
      this.DeleteBlockViewModel.libraryReferenceModel.country = null;
      this.DeleteBlockViewModel.libraryReferenceModel.deliverable = null;
      this.DeleteBlockViewModel.libraryReferenceModel.organization = null;
      if (this.designer.libraryDetails.name === EventConstants.Organization) {
        this.DeleteBlockViewModel.libraryReferenceModel.organization = new OrganizationViewModel();
        this.DeleteBlockViewModel.libraryReferenceModel.organization.organizationId = this.projectDetails.organizationId;
        this.DeleteBlockViewModel.libraryReferenceModel.organization.organizationName = this.projectDetails.organizationName;
      }
      this.DeleteBlockViewModel.libraryReferenceModel.project = null;
      this.DeleteBlockViewModel.libraryReferenceModel.IsUserLibrary = false;
      if (this.designer.libraryDetails.name === EventConstants.User) {
        this.DeleteBlockViewModel.libraryReferenceModel.IsUserLibrary = true;
      }
    }

    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.dialogDeliverable.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordRemoveConfirmationMessage');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if(this.CBCBlocDeleteModel)
        {
          this.blockService.getCBCReferenceProjects(this.CBCBlocDeleteModel).subscribe((response :any) =>{
            dialogRef.close();
            this.processCBCResponse(response);
          },error => {
            this.DialogService.Open(DialogTypes.Warning, error.message);
          })
        }
        else
        {
          this.blockService.deleteBlocks(this.DeleteBlockViewModel, this.CBCBlocDeleteModel).subscribe((response) => {
            if (response) {
              this.toastr.success(this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockDeleted'));
             //Block(s) were deleted, now reload the Library section
              this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
              this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deleteAll).publish(true);
          
            } else {
              this.DialogService.Open(DialogTypes.Error, this.translate.instant('screens.user.AdminView.Library.SuccessMessages.BlockDeleteError'));
            }
            this.service.selectedNodes = [];
            this.designer.blockList = [];
            this.designerService.clear(this.section);
            this.checklistSelection.clear();
          },
            error => {
              this.DialogService.Open(DialogTypes.Warning, error.message);
            });
          dialogRef.close();
      }
      }
    });
  }

  processCBCResponse(response) {
    if(response.alreadyNotified) {
      this.DialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.iconview.thisActionHasAlreadyBeenNotifiedToLeads'));
    }
    else{
      if(response.projects && response.projects.length){
        let dialog = new Dialog();
        dialog.Type = DialogTypes.Delete;
        dialog.Message = this.translate.instant('screens.project-designer.iconview.selectedBlocksUsedInProjects') + " "+response.projects.toString();
        const deleteDialogRef = this.dialog.open(ConfirmationDialogComponent, {
          data: dialog
        });
        deleteDialogRef.afterClosed().subscribe((result) => {
          if(result) {
            this.sendNotificationToLeads();
          }
        });
      }
      else{
        this.sendNotificationToLeads();
      }
    }
  }

  sendNotificationToLeads()
  {
    this.blockService.notifyProjectLeadsForCBCDelete(this.CBCBlocDeleteModel).subscribe((response)=>{
      this.toastr.success(this.translate.instant('screens.project-designer.iconview.notificationSentToLeads'));
    },error => {
      this.DialogService.Open(DialogTypes.Warning, error.message);
    });
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

  expandBlock(node: TodoItemFlatNode, expand = false) {
    //this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    //this.designer.libraryDetails = this.sharedDetailService.getSelectedTheme().themeOptions.filter(item=>item.name == this.section)[0].library;

    if (this.treeControl.isExpanded(node) && (node.level == 0 || node.level == 1)) {
      if (node.isCategory) {
        this.requestModel.isGlobal = this.designer.filterLibraryModel.isGlobal;
        this.requestModel.isAdmin = false;
        this.requestModel.categoryId = node.blockId;
        if (this.designer.libraryDetails.name == EventConstants.Global) {
          this.requestModel.isGlobal = true;
          this.libraryService.getGlobalTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
            if(expand) {
              this.reAssignBlockSelectionFromStorage();
            }
          })
        } else if (this.designer.libraryDetails.name == EventConstants.Country) {
          this.requestModel.isGlobal = false;
          this.libraryService.getCountryTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
            if(expand) {
              this.reAssignBlockSelectionFromStorage();
            }
          })
        } else if (this.designer.libraryDetails.name == EventConstants.User) {
          this.libraryService.getPersonalTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
            if(expand) {
              this.reAssignBlockSelectionFromStorage();
            }
          })
        } else if (this.designer.libraryDetails.name == EventConstants.Organization) {
          this.requestModel.organizationId = this.sharedDetailService.getORganizationDetail().organizationId;
          this.libraryService.getOrgTemplates(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
            if(expand) {
              this.reAssignBlockSelectionFromStorage();
            }
          })
        } else if (this.designer.libraryDetails.name == EventConstants.BlockCollection) {
          this.requestModel.organizationId = this.sharedDetailService.getORganizationDetail().organizationId;
          this.libraryService.getBlockCollection(this.requestModel).subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.blockExpandData = data;
            let flatnode = this.flatNodeMap.get(node);
            flatnode.blocks = this.blockExpandData;
            this.dataSource.data = this.dataSource.data;
            if(expand) {
              this.reAssignBlockSelectionFromStorage();
            }
          })
        }
      } else {
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
    flatNode.isCategory = node.isCategory;
    flatNode.parentId = node.parentId;
    flatNode.indentation = node.indentation;
    flatNode.usersAssignment = node.usersAssignment;
    flatNode.colorCode = node.colorCode;
    flatNode.blockType = node.blockType;
    flatNode.blockStatus = node.blockStatus;
    flatNode.uId=node.uId;
    flatNode.libraryId = node.libraryId;
    flatNode.libraryUId = node.libraryUId;
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
    // this.checklistSelection.toggle(node);
    // const descendants = this.treeControl.getDescendants(node);
    // this.checklistSelection.isSelected(node)
    //   ? this.checklistSelection.select(...descendants)
    //   : this.checklistSelection.deselect(...descendants);
    this.saveSelectedThemeData(node);
    this.designer.blockList = [];
    this.designerService.clear(this.section);
    if (node.level != 0 && this.checklistSelection.isSelected(node))
    {
      this.designer.blockDetails = node;
      let parentNode = this.getStackId(node);
      if(parentNode)
      {
        this.designer.blockDetails.parentUId = parentNode.uId;
      }
    }    
    else
      this.designer.blockDetails = null;
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
    this.todoParentSelection(node);

    this.disableCreate = false;

    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
      });
      nodesArray.forEach((ele) => {
        var item = this.flatNodeMap.get(ele);
        this.getSelectedBlocks(item, nodesArray);
      });
      nodesArray.forEach(el => {
        this.designer.blockList.push(el);
      })

      if (this.designer.blockDetails == null && nodesArray.length == 1)
        this.designer.blockDetails = nodesArray[0];

      if (nodesArray.length == 1)
        this.disableCreate = true;
    }

    this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.iconicViewLibrarySection.updateHeader).publish(true);

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

  /* Select/Deselect the parent node*/
  todoParentSelection(node: TodoItemFlatNode): void {
    var parentNode = this.database.getParentFromNodes(this.flatNodeMap.get(node), this.dataSource.data);
    if (parentNode != undefined) {
      if (!this.checklistSelection.isSelected(node))
        this.checklistSelection.deselect(this.nestedNodeMap.get(parentNode));
      else {
        // var allchildren = this.descendantsAllSelected(this.nestedNodeMap.get(parentNode));
        // if (allchildren && parentNode.isStack)
        //   this.checklistSelection.select(this.nestedNodeMap.get(parentNode));
      }
    }
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
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database1.updateItem(nestedNode, itemValue);
  }
  handleDragStart(event, node) {

    //restrict category drag and drop
    if (node.isCategory || node.level === 2) {
      event.preventDefault();
      return;
    }

    if (this.checklistSelection["_selection"].size > 0) {
      let nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        if(element.id !== null){
        nodesArray.push(element);
      }
      });
      nodesArray.forEach((ele) => {
        let item = this.flatNodeMap.get(ele);
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

    this.service.source = (this.designer.libraryDetails.name == 'Blocks') ? DragDropSection.CBC : DragDropSection.Library;
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
    } else if (percentageY > 0.38) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
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
    if (this.service.source == DragDropSection.CBC || this.service.source == DragDropSection.Library) {
      message = this.translate.instant('screens.project-designer.iconview.dragDropAcrossLibrary');
    }
    else if (this.service.source == DragDropSection.Template || this.service.source == DragDropSection.Deliverable) {
      message = this.translate.instant('screens.project-designer.iconview.dragDropTemplateToLibrary');
    }
    if (message != "") {
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
    //Check Concurrency 
    var concurrencyRequest = new CheckConcurrencyRequestModel();
    var concurrencyDestination = new CheckConcurrencyDestinationRequestModel();
    var concurrencySource = new CheckConcurrencySourceRequestModel();
    var blockList: BlockReferenceViewModel[] = new Array();
    var dragDropRequestModel = new DragDropRequestViewModel();
    dragDropRequestModel.dragDropList = new Array();
    this.PrepareConcurrencyRequest(concurrencyDestination, node, concurrencySource);
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
            newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
            this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          } else if (this.dragNodeExpandOverArea === 'below') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
            nextNodeOfDragNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
            if (index == 0)
              newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
            else {
              newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(this.dragNodes[index - 1]), this.dataSource.data);
            }
            this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
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
            newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
            this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          } else if (this.dragNodeExpandOverArea === 'below') {
            nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
            if (index == 0)
              newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
            else
              newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(this.service.dragNodes[index - 1]), this.dataSource.data);
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
          newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
          this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          nextNodeOfDragNode = this.treeControl.dataNodes.find(el => el.previousId == this.dragNode.id);
          newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
          this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
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
          newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else if (this.dragNodeExpandOverArea === 'below') {
          nextNode = this.treeControl.dataNodes.find(el => el.previousId == node.id);
          newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.service.dragNode), this.flatNodeMap.get(node), this.dataSource.data);
          this.getDragDropRequestModel(newItem, dragDropRequestModel, node, nextNode, nextNodeOfDragNode, this.service.source, DragDropSection.Template);
          this.SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource);
        } else {
          // this.expandBlock(node, true, nextNode, nextNodeOfDragNode, dragDropRequestModel, this.service.source, DragDropSection.Template);
          return;
        }
      }
    }

  }

  private SaveDragDropBlockStack(dragDropRequestModel, concurrencyRequest, concurrencyDestination, concurrencySource) {
    //call check concurrency API
    // concurrencyRequest.source = concurrencySource;
    //concurrencyRequest.destination = concurrencyDestination;
    // this.service.checkConcurrency(concurrencyRequest).subscribe(response => {
    //Save block dragged and dropped from library to template
    // if (!response) {
    this.service.saveDragDrop(dragDropRequestModel).subscribe(data => {
      //refresh the tree data after save
      this.templateService.getTemplateBlocksByTemplateId(this.selectedTemplate.templateId).subscribe((data: any) => {
        this.dataSource.data = [];
        this.dataSource.data = data.blocks;
        this.selectedTemplate = this.designer.templateDetails = data.template;
      });
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
    if (destinationStack != undefined)
    {
      dragDropRequestModel.DestinationStackId = destinationStack.blockId;
      dragDropRequestModel.DestinationStackUId = destinationStack.uId;
    }
    var sourceStack = this.getStackId(currentNode);
    if (sourceStack != undefined)
    {
      dragDropRequestModel.SourceStackId = sourceStack.blockId;
      dragDropRequestModel.SourceStackUId = sourceStack.uId;
    }
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

  handleDragLeave() {
    this.dragNodeExpandOverArea = null;
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.service.dragNode = null;
    this.service.dragNodes = [];
    this.dragNodes = [];
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

  doubleClick(node) {
    let nodesArray: TodoItemFlatNode[];
    nodesArray = [];
    this.checklistSelection["_selection"].forEach(element => {
      nodesArray.push(element);
    });
    //map to old designer -- starts
    this.oldDesignerService.isTemplateSection = false;
    this.oldDesignerService.isDeliverableSection = false;
    this.oldDesignerService.isLibrarySection = true;
    this.oldDesignerService.LoadAllBlocksDocumentView = this.designer.LoadAllBlocksDocumentView;
    this.oldDesignerService.blockDetails = node;
    this.oldDesignerService.blockList = [];
    this.oldDesignerService.blockList.push(node);
    this.oldDesignerService.libraryDetails = this.designer.libraryDetails;
    this.oldDesignerService.changeIsDoubleClicked(true);
    //map to old desinger -- ends
    // this.saveSelectedThemeData();
    this.navigateToEditor();
  }

  saveSelectedThemeData(currentNode) {
    this.themingContext = this.sharedDetailService.getSelectedTheme();
    let currentDesigner = this.themingContext.themeOptions.find(item => item.name == this.section);
    const blockList = currentDesigner.designerService.blockList;
    if(blockList.length > 0) {
      const findNode  = blockList.find(node => node.id === currentNode.id);
      if(!findNode) {
        blockList.push(currentNode);
      } 
    } else {
      blockList.push(currentNode);
    }
    // const uniqueBlockList = new Set(this.designer.blockList);
    // currentDesigner.designerService.blockList = Array.from(uniqueBlockList.values());
    currentDesigner.designerService.blockList = blockList;
    currentDesigner.designerService.blockDetails = this.designer.blockDetails;

    this.sharedDetailService.setSelectedTheme(this.themingContext);
  }

  navigateToEditor() {
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }])
  }

  reAssignBlockSelectionFromStorage() {
    this.themingContext = this.sharedDetailService.getSelectedTheme();
    let currentDesigner = this.themingContext.themeOptions.find(item => item.name == this.section).designerService;
    if (currentDesigner.blockList.length > 0) {
      currentDesigner.blockList.forEach(block => { 
       let category = this.dataSource.data.find(x => x.blockId === block.blockType.blockTypeId);
       let currentBlock = category.blocks.find(y => y.id ===  block.id);
        let node = this.treeControl.dataNodes.find(y => y.id == currentBlock.id);
        if (node) {
          this.checklistSelection.toggle(node);
          this.todoItemSelectionToggle(node);
        }
      });
    }
  }

  checkIfFilterDataExists() {
    let themeContext = this.sharedDetailService.getSelectedTheme();
    let currentDesignerService = themeContext.themeOptions.find(x => x.name == this.section).designerService;

    if (currentDesignerService.selectedFilterProjectYear.length == 0 && currentDesignerService.selectedFilterBlockCreator.length == 0 && currentDesignerService.selectedFilterblockOrigin.length == 0 && currentDesignerService.selectedFilterblockState.length == 0
      && currentDesignerService.selectedFilterblockStatus.length == 0 && currentDesignerService.selectedFilterindustry.length == 0 && currentDesignerService.selectedFiltertitle.length == 0
      && currentDesignerService.selectedblockType.length == 0 && currentDesignerService.selectedStackType.length == 0 && currentDesignerService.selectedStackLevel.length == 0 && currentDesignerService.selectedStackTransactionType.length == 0) {
        this.filterApplied = false;
    } else {
      this.filterApplied = true;
    }
    
  }
  remove(node){
    if(this.designer.blockList.length == 0){
      this.designer.blockList =[];
      this.designer.blockList.push(node);
    }
    let payLoad = ActionOnBlockStack.delete;
    this.subscriptions.add(this._eventService.getEvent(this.section + "_" + EventConstants.LibrarySection).publish(payLoad));
  }
  closeContextMenu() {
    document.dispatchEvent(new Event('click'));
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
