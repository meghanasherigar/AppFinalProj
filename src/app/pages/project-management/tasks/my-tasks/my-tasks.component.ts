import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { LocalDataSource } from '../../../../@core/components/ng2-smart-table';
import { GridCustomColumnComponent } from '../../shared/grid-custom-column/grid-custom-column.component';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { TaskReportService } from '../../services/task-report.service';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { ProjectManagementService } from '../../services/project-management.service';
import { Subscription } from 'rxjs';
import { ColorSummaryConstants, HeaderSummary } from '../../@models/common/header-summary';
import { taskFilterRequest, taskCompletionModel } from '../../@models/tasks/task';
import { CustomColumns, ProjectManagementConstants, TaskSubMenu } from '../../@models/Project-Management-Constants';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.scss']
})
export class MyTasksComponent implements OnInit, OnDestroy {
  private _myTask;
  public _currentTab;
  mytaskFilter: taskFilterRequest;
  assignedToMe: boolean = false;
  assignedByMe: boolean = false;
  others: boolean = false;
  gridSettings = {
    //selectMode: 'multi',
    noDataMessage:this.translate.instant('Notasksfound'),
    hideSubHeader: true,
    actions: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {}
  };

  gridDataSource = new LocalDataSource();
  selectedTasks: [];
  _subscription = new Subscription();
  _pageSize: number = 0;
  _pageIndex: number = 0;
  totalCount = 0;
  taskSummaryOptions: HeaderSummary = new HeaderSummary();

  //ngx-ui-loader configuration
  loaderId = 'myTaskGridloader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  constructor(private ngxLoader: NgxUiLoaderService,
    private taskService: TaskReportService,
    private shareDetailService: ShareDetailService,
    private translate: TranslateService,
    private managementService: ProjectManagementService) {
    this._subscription = new Subscription();

    this._subscription.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setColumnSettings();
      this.gridDataSource.refresh();
    }));

    this.setColumnSettings();
  }

  ngOnInit() {
    this.myTaskSubscriptions();
    this.getUserTaskSummary();
    
    //$$$ removed API call as L2 menu handles this
    //this.getUserTasks();
    this.gridDataSource.onChanged().subscribe((change) => {
      if (change.action === 'page' || change.action === 'paging') {
        this._pageSize = change.paging.perPage;
        this._pageIndex = change.paging.page;
      }
    });

  }

  markTaskComplete(task) {
    let request = new Array<taskCompletionModel>();

    let row = new taskCompletionModel();
    row.blockId = task.id;
    row.taskType = task.taskType;
    row.templateId = task.templateId;
    row.deliverableId = task.deliverableId;

    request.push(row);

    if (request.length > 0) {
      this.taskService.markTaskAsComplete(request).subscribe(response => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        //this.filterRecordCount();

        this.getUserTasks();
      });
    }
  }

  myTaskSubscriptions() {

    this._subscription.add(this.managementService.currentCompleteTask.subscribe(
      completeTask => {
        if (completeTask) {
          this.markTaskComplete(completeTask);
        }
      })
    );

    this._subscription.add(this.managementService.changeFilters.subscribe((currentTab) => {
      this._currentTab = currentTab;
    }));

    this._myTask = this.managementService.currentTaskFilter.subscribe(filters => {
      this.mytaskFilter = filters;
      this.getUserTasks();
    });
  }

  get taskMenuItems() {
    return TaskSubMenu;
  }

  getUserTasks() {
    this.ngxLoader.startLoader(this.loaderId);

    let request = this.prepareRequest();

    if (this._currentTab === this.taskMenuItems.MyTasks) {
      this.taskService.getTaskReport(request).subscribe(data => {
        if (data && data.tasks) {
          this.gridDataSource.load(data.tasks);
          this.gridDataSource.totalCount = data.totalCount;
        }
        this.ngxLoader.stopLoader(this.loaderId);
      });
    }
  }

  prepareRequest() {
    let request = new taskFilterRequest();
    request.projectId = this.shareDetailService.getORganizationDetail().projectId;
    request.pageSize = this._pageSize;
    request.pageIndex = this._pageIndex;
    request.others = this.others;
    request.assignedByMe = this.assignedByMe;
    request.assignedToMe = this.assignedToMe;
    if (this.mytaskFilter.statusId.length > 0 || this.mytaskFilter.nameId.length > 0 || this.mytaskFilter.assignToId.length > 0 ||
      this.mytaskFilter.dataSource.length > 0 ||  this.mytaskFilter.dueDateMin || this.mytaskFilter.dueDateMax || this.mytaskFilter.searchText) {

      request.statusId = this.mytaskFilter.statusId ? this.mytaskFilter.statusId : [];
      request.nameId = this.mytaskFilter.nameId ? this.mytaskFilter.nameId : [];
      request.dataSource = this.mytaskFilter.dataSource ? this.mytaskFilter.dataSource : [];
      request.assignToId = this.mytaskFilter.assignToId ? this.mytaskFilter.assignToId : [];
      request.dueDateMax = this.mytaskFilter.dueDateMax ? this.mytaskFilter.dueDateMax : ProjectManagementConstants.DefaultDate;
      request.dueDateMin = this.mytaskFilter.dueDateMin ? this.mytaskFilter.dueDateMin : ProjectManagementConstants.DefaultDate;

    }
    request.searchText = this.mytaskFilter.searchText;
    request.myTasksOnly = true;
    return request;
  }

  getUserTaskSummary() {
    let request = new taskFilterRequest();
    request.projectId = this.shareDetailService.getORganizationDetail().projectId;
    request.myTasksOnly = true;
    this.taskService.getTaskSummary(request).subscribe(
      (response: HeaderSummary) => {
        if (response) {
          this.taskSummaryOptions = new HeaderSummary();
          this.taskSummaryOptions = response;
          this.taskSummaryOptions.header = this.translate.instant('MyTasks');
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
  }

  filterRecordCount()
  {
    let request = this.prepareRequest();
    if(this._currentTab === this.taskMenuItems.MyTasks) {
      this.taskService.getTaskAssignmentCount(request).subscribe(data => {
          this.totalCount = data;
          this.gridDataSource.totalCount = data;
          this.gridDataSource.refresh();
          this.ngxLoader.stopLoaderAll(this.loaderId);
      }),
      (error)=>{
        this.ngxLoader.stopLoaderAll(this.loaderId);
        console.log(error);
      };
    } 
  }

  onTaskAssignmentSelection(event)
  {
    this.mytaskFilter.statusId=[];
    if(event && event.displayText)
    {
      this.mytaskFilter.statusId.push(event.displayText);
    }
    this.getUserTasks();
    
  }
  onCustomAction(item: any) {}

  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.gridSettings));
    settingsTemp.columns = {
      name: {
        title: this.translate.instant('TaskName'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return { cell, row, component: CustomColumns.MyTaskName }
          }
      },
      taskType: {
        title: this.translate.instant('TaskType')
      },
      status: {
        title: this.translate.instant('Status')
      },
      completionStatus: {
        title: this.translate.instant('completionStatus'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return { cell, row, component: CustomColumns.MyTaskCompletionStatus }
          }
      },
      associatedDeliverable: {
        title:this.translate.instant('AssociatedDeliverable') 
      }, assignedBy: {
        title: this.translate.instant('AssignedBy'),
        type: 'custom',
        renderComponent: GridCustomColumnComponent,
        valuePrepareFunction:
          (cell, row) => {
            return { cell, row, component: CustomColumns.AssignedBy }
          }
      },
      assignedTo: {
        title:this.translate.instant('AssignedTo') ,
        type: 'custom',
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
            return { cell, row, component: CustomColumns.UserTaskDueDate }
          }
      },
      comment: {
        title: this.translate.instant('Comments') 
      }
    };
    this.gridSettings = Object.assign({}, settingsTemp );
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this._myTask.unsubscribe();
  }


}
