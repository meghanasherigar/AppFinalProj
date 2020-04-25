import { Component, OnInit, Injectable, OnDestroy } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AuditTrailService } from './audit-trail.service';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../@models/organization';
import { AuditTrailLogFilterViewModel, AuditTrailLogFilterMenuViewModel, AuditTrailLogDomainModel, EditFieldAuditDomainModel, ActionTypes, ActionMessages } from '../../../@models/audit-trail/audit-trail';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { SelectionModel } from '@angular/cdk/collections';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { eventConstantsEnum } from '../../../@models/common/eventConstants';
import { DialogTypes } from '../../../@models/common/dialog';
import { DialogService } from '../../../shared/services/dialog.service';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  item: string;
  id: string;
  level: number;
  children: TodoItemNode[];
  parentId: string;
  isParent: boolean;
  action: string;
}


/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  id: string;
  level: number;
  expandable: boolean;
  parentId: string;
  isParent: boolean;
  action: string;
}

export class DateModel {
  year: number;
  months: Months[] = [];
}
export class Months {
  name: string;
  maxDay: number;
  minDay: number;
}

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor(private _eventService: EventAggregatorService) {
  }

  subscriptions: Subscription = new Subscription();
  blocksResponseData: any;

  initialize() {
  }

  buildFileTree(obj: TodoItemNode[], level: number): TodoItemNode[] {
    return obj;
  }
}

@Component({
  selector: 'ngx-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss'],
  providers: [ChecklistDatabase]
})
export class AuditTrailComponent implements OnInit, OnDestroy {
  projectDetails: ProjectContext;
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
  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  dateModel: any = [];
  todoItemList = [];
  auditData: AuditTrailLogFilterMenuViewModel;
  auditTrailLogs: AuditTrailLogDomainModel[] = [];
  subscriptions: Subscription = new Subscription();
  yearMonthsSelectCount: number;
  selectedAuditLogs = [];
  actionType: any = ActionTypes;
  actionMaxDate: any;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  loaderId = 'CreateBlockLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  actionMinDate: any;
  isSelectAllChecked: boolean;

  constructor(
    private auditTrailService: AuditTrailService,
    private sharedetailService: ShareDetailService,
    private database: ChecklistDatabase,
    private datepipe: DatePipe,
    private _eventService: EventAggregatorService,
    private dialogService: DialogService,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;
    });
  }


  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projectDetails = this.sharedetailService.getORganizationDetail();
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.loadAuditDataByProjectId();

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.auditTrailFilter).subscribe((payload: AuditTrailLogFilterViewModel) => {
      if (payload) {
        let startDate = this.datepipe.transform(payload.actionMaximumDate, 'yyyy-MM-dd');
        let endDate = this.datepipe.transform(payload.actionMinimumDate, 'yyyy-MM-dd');
        this.auditTrailService.logFilterViewModel = new AuditTrailLogFilterViewModel();
        this.auditTrailService.logFilterViewModel.actionMaximumDate = payload.actionMaximumDate;
        this.auditTrailService.logFilterViewModel.actionMinimumDate = payload.actionMinimumDate;
        this.auditTrailService.logFilterViewModel.actionBy = [];
        if (payload.actionBy && payload.actionBy.length > 0) {
          payload.actionBy.forEach(id => {
          this.auditTrailService.logFilterViewModel.actionBy.push(id);
          });
        }
        if (startDate && startDate !== null && endDate && endDate !== null)
          this.getMonths(startDate, endDate);
        else {
          this.auditTrailService.logFilterViewModel.actionMaximumDate = this.actionMaxDate;
          this.auditTrailService.logFilterViewModel.actionMinimumDate = this.actionMinDate;
        }
        this.getFilteredData();
      }
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.loadAction).subscribe((payload: any) => {
      this.loadAuditDataByProjectId();
    }));

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.refreshPage).subscribe((payload: any) => {
      this.dataSource.data.forEach(x => {
          for (let i = 0; i <= x.children.length; i++) {
            this.selectedAuditLogs.forEach((item, n) => {
              x.children.forEach(parent => {
                let nodeToDelete = parent.children.filter(child => child.id == item.id)[0];
                const index = parent.children.indexOf(nodeToDelete, 0);
                if (index > -1) {
                  parent.children.splice(index, 1);
                }
              });
            });
          }
      });
      this.database.dataChange.next(this.dataSource.data);
      this.auditTrailService.logFilterViewModel = null;
    }));
  }

  loadAuditDataByProjectId() {
    this.auditTrailService.getFilterMenu(this.projectDetails.projectId).subscribe((auditData: AuditTrailLogFilterMenuViewModel) => {
      if (auditData) {
        this.auditData = auditData;
        let startDate = this.actionMaxDate = this.datepipe.transform(auditData.actionMaximumDate, 'yyyy-MM-dd');
        let endDate = this.actionMinDate = this.datepipe.transform(auditData.actionMinimumDate, 'yyyy-MM-dd');
        this.auditTrailService.logFilterViewModel = new AuditTrailLogFilterViewModel();
        this.auditTrailService.logFilterViewModel.actionMaximumDate = auditData.actionMaximumDate;
        this.auditTrailService.logFilterViewModel.actionMinimumDate = auditData.actionMinimumDate;
        this.auditTrailService.logFilterViewModel.actionBy = [];
        if (auditData.actionBy && auditData.actionBy.length > 0) {
          auditData.actionBy.forEach(item => {
            this.auditTrailService.logFilterViewModel.actionBy.push(item.id);
          });
        }
        this.getMonths(startDate, endDate);
        this.getFilteredData(auditData);
        this.ngxLoader.stopBackgroundLoader(this.loaderId);

      }
    },
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      });
  }

  getMonths(fromDate, toDate) {
    this.dateModel = [];
    var start = fromDate.split('-');
    var end = toDate.split('-');
    var startYear = parseInt(start[0]);
    var endYear = parseInt(end[0]);
    var startMonth = parseInt(start[1]);
    var endMonth = parseInt(end[1]);
    var dates = [];

    var dateFrom = new Date(fromDate); 
    var dateTo= new Date(toDate);
    var compareDate = new Date(this.actionMaxDate);

    if (compareDate >= dateFrom && compareDate >= dateTo) {
      for (var i = startYear; i >= endYear; i--) {
        let yearModel = new DateModel();
        yearModel.year = i;
        var maxMonth: number, minMonth: number, maxDays , minDays;
        if (i == startYear && startYear == endYear) {
          maxMonth = startMonth;
          minMonth = endMonth;
          maxDays = start[2];
          minDays = end[2];
        }
        else if (i == startYear) {
          maxMonth = startMonth;
          minMonth = 1;
          maxDays = start[2];
          minDays = end[2];
        }
        else if (i > endYear && i !== endYear) {
          maxMonth = 12;
          minMonth = 1;
        }
        else if (i == endYear) {
          maxMonth = 12;
          minMonth = endMonth;
          maxDays = start[2];
          minDays = end[2];
        }
        for (var j = maxMonth; j >= minMonth; j--) {
          var displayMonth = j < 10 ? '0' + j : j;
          dates.push([i, displayMonth, '01'].join('-'));
          let months = new Months();
          months.name = moment(displayMonth, 'MM').format('MMMM');
          if (maxDays) {
            months.maxDay = maxDays;
            months.minDay = minDays;
          }
          else {
            months.maxDay = moment([i, displayMonth].join('-'), 'YYYY-MM').daysInMonth();
            months.minDay = 1;
          }
          yearModel.months.push(months);
        }
        this.dateModel.push(yearModel);
      }
    }
    else {
      this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-setup.auditTrail.audit-trail-validation.NoLogsFoundMsg'));
    }
  }

  expandMonth(node: TodoItemFlatNode) {
    if (this.treeControl.isExpanded(node) && node.level == 1 && !this.isSelectAllChecked) {
      node.isParent = true;
      node.expandable = true;
      let selectedYear = this.todoItemList.filter(x => x.id == node.parentId)[0];
      let monthDetails = selectedYear.children.filter(n => n.name == node.item)[0];
      let selectedMonth = moment().month(monthDetails.name).format("MM");
      let maxDays = monthDetails.maxDay;
      let minDays = monthDetails.minDay;
      let selectedMaxDate = this.datepipe.transform(selectedYear.item + "-" + selectedMonth + "-" + maxDays, 'yyyy-MM-dd');
      let selctedMinDate = this.datepipe.transform(selectedYear.item + "-" + selectedMonth + "-" + minDays, 'yyyy-MM-dd');
      var auditTrailLogFilter = new AuditTrailLogFilterViewModel();
      auditTrailLogFilter.actionBy = [];
      auditTrailLogFilter.projectId = this.projectDetails.projectId;
      if (this.auditTrailService.logFilterViewModel.actionBy.length > 0) {
        this.auditTrailService.logFilterViewModel.actionBy.forEach(item => {
          auditTrailLogFilter.actionBy.push(item);
        });
      } 
      else {
        this.auditData.actionBy.forEach(item => {
          auditTrailLogFilter.actionBy.push(item.id);
        });
      }
      auditTrailLogFilter.actionMaximumDate = new Date(selectedMaxDate);
      auditTrailLogFilter.actionMinimumDate = new Date(selctedMinDate);
      this.ngxLoader.startBackgroundLoader(this.loaderId);

      this.getMonthAuditRecords(auditTrailLogFilter);
    }
  }

  getActionMessage(action) {
    switch (action) {
      case ActionTypes.create:
        return ActionMessages.creted;
        break;
      case ActionTypes.edit:
        return ActionMessages.edited;
        break;
      case ActionTypes.delete:
        return ActionMessages.deleted;
        break;
      case ActionTypes.sendIR:
        return ActionMessages.sentIR;
        break;
      case ActionTypes.sendBackToAssignee:
        return ActionMessages.sendBackToAssignee;
        break;
      case ActionTypes.sendBackToQuestionReview:
        return ActionMessages.sendBackToQuestionReview;
        break;
      case ActionTypes.sendBackToReview:
        return ActionMessages.sendBackToReview;
        break;
      case ActionTypes.pullBack:
        return ActionMessages.pullBack;
        break;
      case ActionTypes.forward:
        return ActionMessages.forward;
        break;
      case ActionTypes.finalize:
        return ActionMessages.finalize;
        break;
      case ActionTypes.reminder:
        return ActionMessages.reminder;
        break;
      case ActionTypes.reSendIR:
        return ActionMessages.reSendIR;
        break;
    }
  }

  toDate(dateStr: any) {
    return new Date(moment.utc(dateStr).local().format());
  }

  getFilteredData(auditData?) {
    this.todoItemList = [];
    let index = 0;
    this.dateModel.forEach(item => {
      let testData: any = {};
      testData.id = index++;
      testData.children = item.months;
      testData.level = 0;
      testData.item = item.year;
      testData.action = "";
      this.todoItemList.push(testData);
    });
    const data1 = this.buildFileTree(this.todoItemList);
    this.database.dataChange.next(data1);
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode
      ? existingNode
      : new TodoItemFlatNode();

    flatNode.item = node.item;
    flatNode.id = node.id;
    flatNode.expandable = node.isParent;
    flatNode.level = node.level;
    flatNode.parentId = node.parentId;
    flatNode.action = node.action;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  buildFileTree(obj: object): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = value.item;
      node.id = value.id;
      node.isParent = true;
      node.action = "";
      node.level = 0;
      let index = 0;
      if (value.children) {
        node.children = [];
        value.children.forEach(item => {
          let mnthData = new TodoItemNode();
          mnthData.level = 1;
          mnthData.id = (index++).toString();
          mnthData.item = item.name;
          mnthData.parentId = node.id;
          mnthData.isParent = true;
          mnthData.action = "";
          mnthData.children = [];
          node.children.push(mnthData);
        });
      }
      return accumulator.concat(node);
    }, []);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    let selectedAudtDetails: any;
    this.selectedAuditLogs = [];
    if (this.checklistSelection.isSelected(node))
      selectedAudtDetails = node;
    else
      selectedAudtDetails = null;
    if (this.checklistSelection["_selection"].size > 0) {
      var nodesArray: TodoItemFlatNode[];
      nodesArray = [];
      this.checklistSelection["_selection"].forEach(element => {
        nodesArray.push(element);
      });
      nodesArray.forEach(el => {
        this.selectedAuditLogs.push(el);
      });
    }
    this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.enableDisableIcons).publish(this.selectedAuditLogs);
  }

  getSelectedChildren(item, nodesArray) {
    if (item.children != null && item.hasChildren) {
      item.children.forEach((child) => {
        const index = nodesArray.findIndex(n => n.id === child.id);
        nodesArray.splice(index, 1);
        this.getSelectedChildren(child, nodesArray);
      });
    }
    return nodesArray;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async selectAllRecords(checked, node) {
    if (this.checklistSelection["_selection"].size > 0 && this.checklistSelection["_selection"].size != this.treeControl.dataNodes.length)
      this.checklistSelection.clear();
    this.auditTrailService.logFilterViewModel.projectId = this.projectDetails.projectId;
    await this.getMonthAuditRecords(this.auditTrailService.logFilterViewModel);
    this.dataSource.data.forEach(x => {
      if (x.item == node.item) {
        if (x.children.length > 0) {
          x.children.forEach(y => {
            if (y.children.length > 0) {
              y.children.forEach(z => {
                  if (!checked) {
                    this.checklistSelection.clear();
                    this.selectedAuditLogs = [];
                    this._eventService.getEvent(eventConstantsEnum.projectSetUp.auditTrail.enableDisableIcons).publish(this.selectedAuditLogs);
                  }
                  else {
                    this.checklistSelection.toggle(this.nestedNodeMap.get(z));
                    this.todoItemSelectionToggle(this.nestedNodeMap.get(z));
                  }
              });
            }
          });
        }
      }
    });
    if (checked) 
      this.isSelectAllChecked = true;
    else
      this.isSelectAllChecked = false;
  }

  async getMonthAuditRecords(auditTrailLogFilter, node?) {
    await this.auditTrailService.getAllAuditTrailLogs(auditTrailLogFilter).then((filteredData: AuditTrailLogDomainModel[]) => {
      if (filteredData.length > 0) {
        let flatnode;
        this.auditTrailLogs = filteredData;
        if(node == undefined)
          flatnode = new TodoItemNode();
        else 
          flatnode = this.flatNodeMap.get(node);
        let data: any = [];
        this.auditTrailLogs.forEach(audit => {
          let _data: any = {};
          _data.level = 2;
          _data.isParent = false;
          if (audit.entity) {
            _data.id = audit.id;
            _data.action = audit.entity.action;
            let actionName = this.getActionMessage(audit.entity.action);
            _data.item = '<span>' + '<b>' + '"' + audit.entity.entityName + '"' + '</b>' + '<span class="editedBy">' + actionName + '</span>' + '<b>' + audit.auditTrail.updatedBy.firstName + ' ' + audit.auditTrail.updatedBy.lastName + '</b>' + '</span>' +
              '<p class="CreatedBy">' + moment(audit.auditTrail.updatedOn).local().format("Do MMMM, YYYY") + '<span>' + moment(audit.auditTrail.updatedOn).local().format("hh:mm a") + '.' + '</span>' + '</p>';
            _data.monthItem = moment(audit.auditTrail.updatedOn).local().format("MMMM");
            _data.year = moment(audit.auditTrail.updatedOn).local().format("YYYY");
          }
          else if (audit.transaction) {
            _data.id = audit.id;
            _data.action = audit.transaction.action;
            let actionName = this.getActionMessage(audit.transaction.action);
            _data.item = '<span>' + '<b>' + '"' + audit.transaction.name + '"' + '</b>' + '<span class="editedBy">' + actionName + '</span>' + '<b>' + audit.auditTrail.updatedBy.firstName + ' ' + audit.auditTrail.updatedBy.lastName + '</b>' + '</span>' +
              '<p class="CreatedBy">' + moment(audit.auditTrail.updatedOn).local().format("Do MMMM, YYYY") + '<span>' + moment(audit.auditTrail.updatedOn).local().format("hh:mm a") + '.' + '</span>' + '</p>';
            _data.monthItem = moment(audit.auditTrail.updatedOn).local().format("MMMM");
            _data.year = moment(audit.auditTrail.updatedOn).local().format("YYYY");
          }
          else if (audit.blockStack) {
            _data.id = audit.id;
            _data.action = audit.blockStack.action;
            let actionName = this.getActionMessage(audit.blockStack.action);
            _data.item = '<span>' + '<b>' + '"' + audit.blockStack.title + '"' + '</b>' + '<span class="editedBy">' + actionName + '</span>' + '<b>' + audit.auditTrail.updatedBy.firstName + ' ' + audit.auditTrail.updatedBy.lastName + '</b>' + '</span>' +
              '<p class="CreatedBy">' + moment(audit.auditTrail.updatedOn).local().format("Do MMMM, YYYY") + '<span>' + moment(audit.auditTrail.updatedOn).local().format("hh:mm a") + '.' + '</span>' + '</p>';
            _data.monthItem = moment(audit.auditTrail.updatedOn).local().format("MMMM");
            _data.year = moment(audit.auditTrail.updatedOn).local().format("YYYY");
          }
          else if (audit.project) {
            _data.id = audit.id;
            _data.action = audit.project.action;
            let actionName = this.getActionMessage(audit.project.action);
            let organizationName;
            if (audit.project.projectName == null) {
              organizationName = '<span class="orgText">' + this.translate.instant('screens.home.labels.Organization') + '</span>' + '<b>' + '"' + audit.project.organizationName + '"' + '</b>';
            }
            else {
              organizationName = '<b>' + '"' + audit.project.organizationName + '/' + audit.project.projectName + '"' + '</b>';
            }
            _data.item = '<span>' + organizationName + '<span class="editedBy">' + actionName + '</span>' + '<b>' + audit.auditTrail.updatedBy.firstName + ' ' + audit.auditTrail.updatedBy.lastName + '</b>' + '</span>' +
              '<p class="CreatedBy">' + moment(audit.auditTrail.updatedOn).local().format("Do MMMM, YYYY") + '<span>' + moment(audit.auditTrail.updatedOn).local().format("hh:mm a") + '.' + '</span>' + '</p>';
            _data.monthItem = moment(audit.auditTrail.updatedOn).local().format("MMMM");
            _data.year = moment(audit.auditTrail.updatedOn).local().format("YYYY");
          }
          else if (audit.infoRequest) {
            _data.id = audit.id;
            _data.action = audit.infoRequest.action;
            let actionName = this.getActionMessage(audit.infoRequest.action);
            _data.item = '<span>' + '<b>' + '"' + audit.infoRequest.name + '"' + '</b>' + '<span class="editedBy">' + actionName + '</span>' + '<b>' + audit.auditTrail.updatedBy.firstName + ' ' + audit.auditTrail.updatedBy.lastName + '</b>' + '</span>' +
              '<p class="CreatedBy">' + moment(audit.auditTrail.updatedOn).local().format("Do MMMM, YYYY") + '<span>' + moment(audit.auditTrail.updatedOn).local().format("hh:mm a") + '.' + '</span>' + '</p>';
            _data.monthItem = moment(audit.auditTrail.updatedOn).local().format("MMMM");
            _data.year = moment(audit.auditTrail.updatedOn).local().format("YYYY");
            }
          data.push(_data);
        });
        flatnode.children = data;
        
        this.dataSource.data.forEach(x => {
          let yearRecord = flatnode.children.filter(y => y.year == x.item);
          if (x.level == 0 && yearRecord && yearRecord.length > 0) {
            let getMonthRecord = x.children.filter(x => x.level == 1);
            getMonthRecord.forEach(el => {
              let monthRecord = flatnode.children.filter(y => y.monthItem == el.item);
              if (monthRecord && monthRecord.length > 0)
                el.children = monthRecord;
            });
          }
        });
        this.dataSource.data = this.dataSource.data;
      }
      else {
        this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-setup.auditTrail.audit-trail-validation.NoLogsFoundMsg'));
      }
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    },
      error => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
    );
  }

}
