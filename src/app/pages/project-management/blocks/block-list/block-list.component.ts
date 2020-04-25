import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderSummaryPart, HeaderSummary, ColorSummaryConstants } from '../../@models/common/header-summary';
import { ProjectManagementService } from '../../services/project-management.service';
import { Subscription, Subject } from 'rxjs';
import { BlockReportService } from '../../services/block-report.service';
import { BlockRequestModel, BlockReportFlatNode, BlockReportItemNode, BlockReportFilterRequest } from '../../@models/blocks/block';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { TreeControl, NestedTreeControl, FlatTreeControl } from '@angular/cdk/tree';
import { TreeViewChecklistDatabase } from '../../services/check-list-db';
import { Menus } from '../../@models/common/Project-Management-menu';
import { ProjectManagementConstants } from '../../@models/Project-Management-Constants';
import { debounceTime, distinctUntilChanged, switchMap, first } from 'rxjs/operators';
import { FormArray, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'ngx-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss'],
  providers: [TreeViewChecklistDatabase]
})
export class BlockListComponent implements OnInit, OnDestroy {

  blockFilter: BlockRequestModel;

  //Tree view related
  flatNodeMap = new Map<BlockReportFlatNode, BlockReportItemNode>();
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<BlockReportFlatNode, BlockReportItemNode>();

  /** A selected parent node to be inserted */
  selectedParent: BlockReportFlatNode | null = null;

  treeControl: FlatTreeControl<BlockReportFlatNode>;
  treeFlattener: MatTreeFlattener<BlockReportItemNode, BlockReportFlatNode>;
  dataSource: MatTreeFlatDataSource<BlockReportItemNode, BlockReportFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<BlockReportFlatNode>(true);

  transformer = (node: BlockReportItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode ? existingNode : new BlockReportItemNode();

    flatNode.id = node.id;
    flatNode.title = node.title;
    flatNode.blockId = node.blockId;
    flatNode.level = level;
    flatNode.expandable = node.hasChildren;
    flatNode.previousId = node.previousId;
    flatNode.isStack = node.isStack;
    flatNode.description = node.description;
    flatNode.parentId = node.parentId;

    //flatNode.nodeIndex = this.nodeIndex++;
    flatNode.hasChildren = node.hasChildren;
    flatNode.blockType = node.blockType;
    flatNode.blockStatus = node.blockStatus;
    flatNode.colorCode = node.colorCode;
    flatNode.comment = node.comment;
    flatNode.userAssignment = node.userAssignment;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  summaryOptions: HeaderSummary;
  currentSubscriptions: Subscription;

  tempDeliverableId: string;

  templateId: string;
  deliverableId: string;
  warningMessage: boolean;
  comment = new Subject<string>();
  //ngx-ui-loader configuration
  loaderId = 'blockgridloader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  colorArray = [ColorSummaryConstants.darkblue,
  ColorSummaryConstants.blue,
  ColorSummaryConstants.lightblue];
  nodeToUpdate: any;
  constructor(private managementService: ProjectManagementService,
    private blockservice: BlockReportService,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService,
  ) {
    this.currentSubscriptions = new Subscription();
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<BlockReportItemNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.subscriptions();
  }


  getLevel = (node: BlockReportFlatNode) => node.level;
  isExpandable = (node: BlockReportFlatNode) => node.expandable;
  getChildren = (node: BlockReportItemNode): BlockReportItemNode[] => node.blocks;
  hasChild = (_: number, _nodeData: BlockReportFlatNode) => _nodeData.expandable;
  hasNoContent = (_: number, _nodeData: BlockReportFlatNode) => _nodeData.title === '';

  ngOnInit() {
    this.managementService.changeCurrentTab(Menus.Block);
    this.getBlockStatusSummary();
    this.getBlockDetails();
    this.subscriptions();
  }

  subscriptions() {
    this.currentSubscriptions.add(
      this.managementService.currentSelectedDeliverable.subscribe(selectedDeliverableId => {
        if (selectedDeliverableId) {
          this.deliverableId = selectedDeliverableId;
          this.tempDeliverableId= JSON.parse(JSON.stringify(selectedDeliverableId));
        }
      }));

    this.currentSubscriptions.add(this.managementService.CurrentBlockFilter.subscribe(filter => {
      this.blockFilter = filter;

      if (filter.entityId || filter.templateId) {
        this.tempDeliverableId = '';
        this.deliverableId = filter.entityId;
        this.templateId = filter.templateId;
        this.warningMessage = false;
      }

      if (this.tempDeliverableId) {
        this.warningMessage = false;
      } else {
        if (!this.tempDeliverableId) {
          if (!filter.templateId && !filter.entityId) {
            this.deliverableId = filter.entityId;
            this.templateId = filter.templateId;
            this.warningMessage = true;
          }
        }
      }
    }));

    this.currentSubscriptions.add(this.managementService.currentApplyBlockFilter.subscribe((appliedFilter) => {
      if (appliedFilter) {
        this.getBlockDetails();
        this.getBlockStatusSummary();
        let request = this.prepareRequestModel();
        let assignToRequest = {templateId: request.templateId, entityId : request.entityId};
        this.blockservice.getBlockAssignToUsers(assignToRequest).subscribe((userList:any)=>{
          if(userList){
          this.managementService.changeBlockAssignToUser(userList.userAssignment);
        }
        })
      }
    }));

    this.currentSubscriptions.add(
      this.comment.pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((node: any) => {
          let requestObj = this.prepareRequestModel();
          let parentStackNode = this.getStackId(this.nodeToUpdate);
          if (parentStackNode) {
            requestObj.parentStackId = parentStackNode.blockId;
          }
          requestObj.blockReferenceId = this.nodeToUpdate.id;
          requestObj.comment = node;
          let request = new Array<BlockRequestModel>();
          request.push(requestObj);
          return this.blockservice.updateBlockreference(request);
        })
      ).subscribe(
        response => {

        }));

  }

  updateComment(node:any)
  {
    this.nodeToUpdate = node;
    this.comment.next(node.comment);
  }

  //Method to invoke the API to load deliverable summary header
  getBlockStatusSummary() {
    let request = this.prepareRequestModel();
    this.summaryOptions = new HeaderSummary();
    this.blockservice.getBlockSummary(request).subscribe((response: HeaderSummary) => {
      if (response) {
        this.summaryOptions = response;
        this.summaryOptions.header = this.translate.instant('screens.Project-Management.Summary.CompletionStatus');;
        this.summaryOptions.colorArray = this.colorArray;
      }
    });
  }

  expandBlock(node: BlockReportFlatNode) {
    if (this.treeControl.isExpanded(node)) {
    }
  }

  prepareRequestModel(node = null) {
    let blockRequest = new BlockRequestModel();
    //Preference to deliverableId and then to templateId
    if (this.deliverableId) {
      blockRequest.entityId = this.deliverableId;
    }
    else {
      if (this.templateId !== '') {
        blockRequest.templateId = this.templateId;
      }
    }
    if(this.blockFilter){
      blockRequest.blockReportFilterRequest = blockRequest.blockReportFilterRequest ? blockRequest.blockReportFilterRequest : this.instantiateFilterRequest();
      blockRequest.blockReportFilterRequest.BlockType = this.blockFilter.blockReportFilterRequest.BlockType;
      blockRequest.blockReportFilterRequest.BlockStatus = this.blockFilter.blockReportFilterRequest.BlockStatus;
      blockRequest.blockReportFilterRequest.UserAssignment = this.blockFilter.blockReportFilterRequest.UserAssignment;
      blockRequest.templateId = this.blockFilter.templateId ? this.blockFilter.templateId : blockRequest.templateId;
      blockRequest.entityId = this.blockFilter.entityId ? this.blockFilter.entityId : blockRequest.entityId;
      blockRequest.blockReportFilterRequest.MinDueDate = (!this.blockFilter.blockReportFilterRequest.MinDueDate) ? ProjectManagementConstants.DefaultDate : this.blockFilter.blockReportFilterRequest.MinDueDate;
      blockRequest.blockReportFilterRequest.MaxDueDate = (!this.blockFilter.blockReportFilterRequest.MaxDueDate) ? ProjectManagementConstants.DefaultDate : this.blockFilter.blockReportFilterRequest.MaxDueDate;
      blockRequest.SearchText = this.blockFilter.SearchText;
      this.templateId = this.templateId ? this.templateId : blockRequest.templateId;
      this.deliverableId = this.deliverableId ? this.deliverableId : blockRequest.entityId;
    }
    return blockRequest;
  }

  prepareSearchRequest() {
    let blockRequest = new BlockRequestModel();
    //Preference to deliverableId and then to templateId
    if (this.deliverableId) {
      blockRequest.entityId = this.deliverableId;
    }
    else {
      if (this.templateId !== '') {
        blockRequest.templateId = this.templateId;
      }
    }
    if(this.blockFilter){

    }
  }

  getBlockDetails() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    let request = this.prepareRequestModel();
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.blockservice.getBlockReport(request).subscribe((response: any) => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      if (response) {
        this.dataSource.data = response;
      }
    });
  }


  getTitle(node)
  {
    return node.title?node.title:node.description;
  }
  getAssignedTo(node)
  {
    return !node.isStack && node.userAssignment && node.userAssignment.fullName?node.userAssignment.fullName :'--';
  }

  getDueDate(node)
  {
    return !node.isStack && node.userAssignment && node.userAssignment.dueDate?
    moment(node.userAssignment.dueDate).local().format('DD MMM YYYY')
    :'--';
  }

  getStackId(node) {
    let parentNode: any;
    let parentstackId: any;
    for (let i = node.level; i > 0; i--) {
      if (i == node.level)
        parentNode = this.treeControl.dataNodes.find(x => x.blockId == node.parentId || x.id == node.parentId);
      else
        parentNode = this.treeControl.dataNodes.find(x => x.blockId == parentNode.parentId || x.id == parentNode.parentId);
      if (parentNode != undefined && parentNode.isStack) {
        parentstackId = parentNode;
        break;
      }
    }
    return parentstackId;
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }

  onCompletionStatusSelection(completionStatus) {
    this.instantiateFilterRequest();
    if (completionStatus) {
      this.blockFilter.blockReportFilterRequest.BlockStatus = [completionStatus.displayText];
    }
    else {
      this.blockFilter = undefined;
    }
    this.getBlockDetails();
  }

  instantiateFilterRequest() {
    if (this.blockFilter.blockReportFilterRequest) {
      return this.blockFilter.blockReportFilterRequest;
    }
    this.blockFilter.blockReportFilterRequest = new BlockReportFilterRequest();
  }
}