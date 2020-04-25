import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderSummary, HeaderSummaryPart, ColorSummaryConstants } from '../../@models/common/header-summary';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { ProjectManagementService } from '../../services/project-management.service';
import { TaskReportService } from '../../services/task-report.service';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { Menus } from '../../@models/common/Project-Management-menu';
import { LocalDataSource } from '../../../../@core/components/ng2-smart-table';
import { taskFilterRequest, taskCompletionModel } from '../../@models/tasks/task';
import * as moment from 'moment';
import { GridCustomColumnComponent } from '../../shared/grid-custom-column/grid-custom-column.component';
import { TaskStatusConstant, TaskSubMenu, CustomColumns, ProjectManagementConstants, taskTypes, taskSummaryBarEnum } from '../../@models/Project-Management-Constants';
import { Subscription } from 'rxjs';
import { downloadFile } from '../../@models/common/common-helper';
import { CommonService } from '../../services/common.service';
import { UserRightsViewModel } from '../../../../@models/userAdmin';
import { SortEvents } from '../../../../@models/common/valueconstants';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {

  private _allTasks;
  public _allCurrentTab;
  taskSummaryOptions: HeaderSummary = new HeaderSummary();
  taskAssignmentSummaryOptions: HeaderSummary = new HeaderSummary();
  taskFilter: taskFilterRequest;
  //ngx-ui-loader configuration
  private loaderId = 'taskGridloader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  totalCount = 0;
  assignedToMe: boolean = false;
  assignedByMe: boolean = false;
  others: boolean = false;
  gridSettings = {

    selectMode: 'multi',
    noDataMessage: this.translate.instant('Notasksfound'),
    hideSubHeader: true,
    actions: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {}
  };

  gridDataSource = new LocalDataSource();
  selectedTasks: Array<any>;
  _pageSize: number = 10;
  _pageIndex: number = 1;

  userRights = new UserRightsViewModel();
  userHasAccess: boolean = false;

  selectedTaskMenu: TaskSubMenu;
  currentSubscriptions: Subscription;
  _sortColumn: string;
  _sortDirection: string;

  constructor(private ngxLoader: NgxUiLoaderService,
    private taskService: TaskReportService,
    private shareDetailService: ShareDetailService,
    private commonService: CommonService,
    private translate: TranslateService,
    private managementService: ProjectManagementService) {
    this.currentSubscriptions = new Subscription();
    this.managementService.changeFilter(this.taskMenuItems.AllTasks);

    this.currentSubscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setColumnSettings();
      this.gridDataSource.refresh();
    }));

    this.setColumnSettings();
    
  }

  ngOnInit() {
    this.managementService.changeCurrentTab(Menus.Task);
    this.getUserRights();
  }

  componentInitializer() {

    if (this.userHasAccess) {
      this.managementService.ResetTaskFilter();
      this.selectedTaskMenu = TaskSubMenu.AllTasks;
      this.subscriptions();

      //$$$ moved to constructor
      //this.managementService.changeFilter(this.taskMenuItems.AllTasks);
      this.getTaskAssignmentSummary();
      this.getTaskSummary();
      
      //$$$ removed API call as L2 menu handles this
      //this.getTaskReport();
      this.gridDataSource.onChanged().subscribe((change) => {
        if (change.action === 'page' || change.action === 'paging') {
          this._pageSize = change.paging.perPage;
          this._pageIndex = change.paging.page;
          this.getTaskReport();
        }
        if (change.action === SortEvents.sort || change.action === SortEvents.sorting)
        {
           this._sortDirection=  change.sort[0].direction.toUpperCase();
           this._sortColumn=  change.sort[0].field;
           this.getTaskReport();
        }
      });
    }
    else {
      //Logged in user is a local user
      this.toggleTaskMenu(TaskSubMenu.MyTasks);
    }
  }

  getUserRights() {
    this.ngxLoader.startLoader(this.loaderId);
    this.commonService.getUserRights().subscribe(userRights => {
      if (userRights) {
        this.userRights = userRights;
        this.userHasAccess = this.userRights.isCentralUser;
        this.managementService.changeCurrentUserRights(userRights);
      }
      this.componentInitializer();
    });
  }


  subscriptions() {

    this._allTasks = this.managementService.changeFilters.subscribe((currentTab) => {
      this._allCurrentTab = currentTab;
    });

    this.currentSubscriptions.add(this.managementService.currentTaskDueDate.subscribe(
      dueDate => {
        if (dueDate !== '' && this.selectedTasks && this.selectedTasks.length > 0) {
          this.saveTasksDueDate(dueDate);
        }
      })
    );

    this.currentSubscriptions.add(this.managementService.currentTaskFilter.subscribe(filters => {
      this.taskFilter = filters;
      if (filters) {
        //this.filterRecordCount();
        this.getTaskReport();
      }
    }));

    this.currentSubscriptions.add(this.managementService.currentDownloadTaskFlag.subscribe(isDownloadActive => {
      if (isDownloadActive) {
        this.downloadTasks();
        //Reset the download flag until user clicks again
        this.managementService.changeTaskDownloadFlag(false);
      }
    }));

    // this.currentSubscriptions.add(this.managementService.currentReloadDeliverableGrid.subscribe((refresh) => {
    //   if (refresh) {
    //     this.getTaskReport();
    //   }
    // }));
    this.currentSubscriptions.add(this.managementService.currentReloadTaskGrid.subscribe((refresh) => {
      if (refresh) {
        this.ngxLoader.startBackgroundLoader(this.loaderId);
        this.getTaskReport();
      }
    }));
  }

  get taskMenuItems() {
    return TaskSubMenu;
  }

  filterRecordCount() {
    let request = this.prepareTaskRequest();
    if (this._allCurrentTab === this.taskMenuItems.AllTasks) {
      this.taskService.getTaskAssignmentCount(request).subscribe(data => {
        this.totalCount = data;
        this.gridDataSource.totalCount = data;
        this.gridDataSource.refresh();
        this.ngxLoader.stopLoaderAll(this.loaderId);
      }),
        (error) => {
          this.ngxLoader.stopLoaderAll(this.loaderId);
          console.log(error);
        };
    }
  }

  toggleTaskMenu(menu: TaskSubMenu) {
    this.selectedTaskMenu = menu;
    this.managementService.changeFilter(menu);
    this.managementService.ResetTaskFilter();
  }

  downloadTasks() {
    let request: taskFilterRequest = {
      projectId: this.shareDetailService.getORganizationDetail().projectId,
      pageSize: 0,
      pageIndex: 0,
      myTasksOnly: false,
      nameId: this.selectedTasks && this.selectedTasks.length > 0 ? this.selectedTasks.map(x => x.id) : []
    }

    this.taskService.downloadTask(request).subscribe(response => {
      if (response) {
        downloadFile(response['content'], response['fileName']);
      }
    });
  }

  getTaskAssignmentSummary() {

    let request = new taskFilterRequest();
    request.projectId = this.shareDetailService.getORganizationDetail().projectId;
    this.taskService.getTaskAssignmentSummary(request).subscribe(
      (response: HeaderSummary) => {
        if (response) {
          this.taskAssignmentSummaryOptions = new HeaderSummary();
          this.taskAssignmentSummaryOptions = response;
          this.taskAssignmentSummaryOptions.header =this.translate.instant('AssignmentSummary') ;
          this.taskAssignmentSummaryOptions.colorArray =
            [ColorSummaryConstants.darkblue, ColorSummaryConstants.blue, ColorSummaryConstants.lightblue,
            ColorSummaryConstants.green];
          this.totalCount = response.count;
          this.gridDataSource.totalCount = this.totalCount;
          this.gridDataSource.refresh();
        }
      }),
      (error) => {
        this.ngxLoader.stopLoader(this.loaderId);
        console.log(error);
      };
  }
  getTaskSummary() {
    let request = new taskFilterRequest();
    request.projectId = this.shareDetailService.getORganizationDetail().projectId;
    this.taskService.getTaskSummary(request).subscribe(
      (response: HeaderSummary) => {
        if (response) {
          this.taskSummaryOptions = new HeaderSummary();
          this.taskSummaryOptions = response;
          this.taskSummaryOptions.header = this.translate.instant('TotalTasks');
          this.taskSummaryOptions.colorArray =
            [ColorSummaryConstants.lightblue, ColorSummaryConstants.red, ColorSummaryConstants.yellow,
            ColorSummaryConstants.green];
          this.totalCount = response.count;
          this.gridDataSource.totalCount = this.totalCount;
          this.gridDataSource.refresh();
        }
      }),
      (error) => {
        this.ngxLoader.stopLoader(this.loaderId);
        console.log(error);
      };
  }

  onTaskRowSelect(event) {
    this.selectedTasks = event.selected;
    let nonOtherTask = this.selectedTasks.filter(x => x.taskType !== taskTypes.OTHERS);
    this.managementService.changeTaskForReassign(nonOtherTask);
  }

  onCustomAction(event) {
  }

  getTaskReport() {
    this.ngxLoader.startLoader(this.loaderId);
    let request = this.prepareTaskRequest();
    if (this._allCurrentTab === this.taskMenuItems.AllTasks) {
      this.taskService.getTaskReport(request).subscribe(data => {
        if (data && data.tasks) {
          this.gridDataSource.load(data.tasks);
          this.gridDataSource.totalCount = this.totalCount;
        }
        this.ngxLoader.stopLoaderAll(this.loaderId);
      }),
        (error) => {
          this.ngxLoader.stopLoaderAll(this.loaderId);
          console.log(error);
        };
    }
  }

  prepareTaskRequest() {
    let request = new taskFilterRequest();
    request.projectId = this.shareDetailService.getORganizationDetail().projectId;
    request.pageSize = this._pageSize;
    request.pageIndex = this._pageIndex;
    request.sortColumn=this._sortColumn;
    request.sortDirection=this._sortDirection;
    request.others = this.others;
    request.assignedByMe = this.assignedByMe;
    request.assignedToMe = this.assignedToMe;
    if (this.taskFilter.statusId.length > 0 || this.taskFilter.dataSource.length > 0 || this.taskFilter.assignToId.length > 0 ||
      this.taskFilter.dueDateMin || this.taskFilter.dueDateMax || this.taskFilter.searchText) {

      request.statusId = this.taskFilter.statusId ? this.taskFilter.statusId : [];

      request.dataSource = this.taskFilter.dataSource ? this.taskFilter.dataSource : [];
      request.assignToId = this.taskFilter.assignToId ? this.taskFilter.assignToId : [];
      request.dueDateMax = this.taskFilter.dueDateMax ? this.taskFilter.dueDateMax : ProjectManagementConstants.DefaultDate;
      request.dueDateMin = this.taskFilter.dueDateMin ? this.taskFilter.dueDateMin : ProjectManagementConstants.DefaultDate;

    }
    request.searchText = this.taskFilter.searchText;
    request.myTasksOnly = false;
    return request;
  }

  saveTasksDueDate(dueDate: string) {
    this.selectedTasks.forEach(x => x.dueDate = dueDate);
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.taskService.updateTaskReport(this.selectedTasks).subscribe((result) => {
      this.gridDataSource.refresh();
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });
  }

  onTaskAssignmentSelection(taskAssignment) {
    this.others = taskAssignment ? taskAssignment.displayText == 'Others' : false;
    this.assignedByMe = taskAssignment ? taskAssignment.displayText == 'Assigned by Me' : false;
    this.assignedToMe = taskAssignment ? taskAssignment.displayText == 'Assigned to Me' : false;
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.getTaskReport();
  }

  onTaskSummarySelection(event) {
    this.taskFilter.statusId = [];
    if (event && event.displayText) {
      this.taskFilter.statusId.push(event.displayText);
    }
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.getTaskReport();
  }

  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.gridSettings));
    settingsTemp.columns = {
      name: {
        title: this.translate.instant('TaskName'),
      },
      taskType: {
        title: this.translate.instant('TaskType')
      },
      status: {
        title: this.translate.instant('Status'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return {
              cell, row, component: CustomColumns.Status
            }
          }
      },
      completionStatus: {
        title:  this.translate.instant('completionStatus'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return { cell, row, component: CustomColumns.TaskCompletionStatus }
          }
      },
      associatedDeliverable: {
        title: this.translate.instant('AssociatedDeliverable'),
        sort:false
      },
      assignedBy: {
        title:this.translate.instant('AssignedBy') ,
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return { cell, row, component: CustomColumns.AssignedBy }
          }
      },
      assignedTo: {
        title:  this.translate.instant('AssignedTo'),
        type: 'custom',
        sort:false,
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return { cell, row, component: CustomColumns.AssignedTo }
          }
      },
      lastUpdated: {
        title: this.translate.instant('LastUpdated'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return { cell, row, component: CustomColumns.LastUpdated }
          }
      },
      dueDate: {
        title: this.translate.instant('DueDate'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return { cell, row, component: CustomColumns.DueDate }
          }
      },
      comments: {
        title:this.translate.instant('Comments'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return {
              cell, row, component: CustomColumns.Comments
            }
          },
      }
    }
    this.gridSettings = Object.assign({}, settingsTemp );
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
    if (this._allTasks) {
      this._allTasks.unsubscribe();
    }
  }

}
