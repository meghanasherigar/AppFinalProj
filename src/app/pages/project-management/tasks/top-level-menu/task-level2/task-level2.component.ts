import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { NbDialogService } from '@nebular/theme';
import { ReAssignComponent } from '../../re-assign/re-assign.component';
import { OtherTasksComponent } from '../../other-tasks/other-tasks.component';
import { ProjectManagementService } from '../../../services/project-management.service';
import { TaskSubMenu } from '../../../@models/Project-Management-Constants';
import { Subscription } from 'rxjs';
import { TaskReportService } from '../../../services/task-report.service';
import { taskFilterResponse } from '../../../@models/tasks/task';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-task-level2',
  templateUrl: './task-level2.component.html',
  styleUrls: ['./task-level2.component.scss']
})
export class TaskLevel2Component implements OnInit {

  show: boolean = true;
  imageName: string=this.translate.instant("collapse");
  selectedTab: number;

  currentSubscriptions = new Subscription();
  enableReAssignButton: boolean = false;
  enableEditButton: boolean = false;

  taskDueDate: string = '';
  showEditableFields: boolean = false;
  taskTypeSetting: any;
  taskStatusSetting: any;
  assignedBySetting: any;
  taskTypes;
  tasksStatus;
  assignedByList;
  minDueDate = new Date();
  maxDueDate = new Date();
  selectedTaskType = [];
  selectedTaskStatus = [];
  selectedAssignedBy = [];
  taskType = [];
  taskStatus = [];
  assignBy = [];
  DueDate = '';

  enableCompleteButton: boolean = false;

  constructor(private dialogService: NbDialogService, private taskService: TaskReportService,
    private managementService: ProjectManagementService,
    private translate:TranslateService
  ) { }

  ngOnInit() {
    this.activeSubscriptions();
    this.setTaskFilterSettings();

    //$$$ Commenting as component onInit will set necessary flags which's handled in activeSubscriptions
    //this.setTaskFilter(false);
  }

  activeSubscriptions() {
    this.currentSubscriptions.add(this.managementService.changeFilters.distinctUntilChanged()
    .subscribe((currentTab) => {
      // this.toggleCollapse();
      this.selectedTab = currentTab;
      // this.showEditableFields = false;
      const currenttab = (currentTab === this.taskMenuItems.MyTasks) ? true : false;
      this.setTaskFilter(currenttab);
    }));

    this.currentSubscriptions.add(this.managementService.currentTaskForReassign.subscribe(currentTasks => {
      if (currentTasks) {
        this.enableReAssignButton = currentTasks.length === 1;
        this.enableEditButton= currentTasks.length>0;
      }
    }));

  }

  setTaskFilter(mytaskonly) {
    this.taskService.taskFilterMenu(mytaskonly).subscribe((response: taskFilterResponse) => {
      const DueStartDate = this.GetDate(response.minDueDate);
      const DueEndDate = this.GetDate(response.maxDueDate);
      this.taskTypes = response.taskTypes;
      this.tasksStatus = response.taskStatus;
      this.minDueDate = new Date(DueStartDate.Year, DueStartDate.Month, DueStartDate.Day);
      this.maxDueDate = new Date(DueEndDate.Year, DueEndDate.Month, DueEndDate.Day);
      this.assignedByList = response.userAssignmentModel;
    }),
      (error) => {
        console.log(`Error loading filter menu: ${error}`);
      };
  }

  setTaskFilterSettings() {

    this.taskTypeSetting = {
      singleSelection: false,
      idField: 'id',
      textField: 'tasktype',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

    this.assignedBySetting = {
      singleSelection: false,
      idField: this.translate.instant('Email'),
      textField: this.translate.instant('fullName'),
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('unSelectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    }

    this.taskStatusSetting = {
      singleSelection: false,
      idField: 'taskStatusId',
      textField: 'taskStatus',
      selectAllText: this.translate.instant('selectAll'),
      unSelectAllText: this.translate.instant('selectAll'),
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };

  }

  ReassignTask() {
    if (this.enableReAssignButton) {
      const createDeliverableRef = this.dialogService.open(ReAssignComponent, {
        closeOnBackdropClick: false,
        closeOnEsc: true,
      });
    }
  }

  GetDate(date) {

    return {
      Year: parseInt(moment(date).local().format('YYYY')),
      Month: parseInt(moment(date).local().format('MM')),
      Day: parseInt(moment(date).local().format('D')),
    }
  }

  onTaskTypeSelect(items) {
    if (Array.isArray(items)) {
      items.forEach((element) => { this.selectedTaskType.push(element); })
    } else {
      this.selectedTaskType.push(items);
    }
    this.managementService.taskFilters.dataSource = this.selectedTaskType;
    this.managementService.setResetTaskFilter(this.managementService.taskFilters);
  }
  onTaskTypeDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.selectedTaskType = items;
    } else {
      const index = this.selectedTaskType.indexOf(items);
      (index !== -1) ? this.selectedTaskType.splice(index, 1) : this.selectedTaskType;
    }

    this.managementService.taskFilters.dataSource = this.selectedTaskType;
    this.managementService.setResetTaskFilter(this.managementService.taskFilters);
  }

  onTaskStatusSelect(items) {
    if (Array.isArray(items)) {
      items.forEach((element) => { this.selectedTaskStatus.push(element); })
    } else {
      this.selectedTaskStatus.push(items);
    }
    this.managementService.taskFilters.statusId = this.selectedTaskStatus;
    this.managementService.setResetTaskFilter(this.managementService.taskFilters);
  }

  onTaskStatusDeSelect(items) {

    if (Array.isArray(items) && items.length === 0) {
      this.selectedTaskStatus = items;
    } else {
      const index = this.selectedTaskStatus.indexOf(items);
      (index !== -1) ? this.selectedTaskStatus.splice(index, 1) : this.selectedTaskStatus;
    }
    this.managementService.taskFilters.statusId = this.selectedTaskStatus;
    this.managementService.setResetTaskFilter(this.managementService.taskFilters);

  }

  onAssignedBySelect(items) {

    if (Array.isArray(items)) {
      items.forEach((element) => { this.selectedAssignedBy.push(element.email); })
    } else {
      this.selectedAssignedBy.push(items.email);
    }
    this.managementService.taskFilters.assignToId = this.selectedAssignedBy;
    this.managementService.setResetTaskFilter(this.managementService.taskFilters);

  }

  onAssignedByDeSelect(items) {
    if (Array.isArray(items) && items.length === 0) {
      this.selectedAssignedBy = items;
    } else {
      const index = this.selectedAssignedBy.indexOf(items.email);
      (index !== -1) ? this.selectedAssignedBy.splice(index, 1) : this.selectedAssignedBy;
    }
    this.managementService.taskFilters.assignToId = this.selectedAssignedBy;
    this.managementService.setResetTaskFilter(this.managementService.taskFilters);
  }

  onDueDate(item) {
    if (item) {
      this.managementService.taskFilters.dueDateMin = item[0];
      this.managementService.taskFilters.dueDateMax = item[1];
      this.managementService.setResetTaskFilter(this.managementService.taskFilters);
    }
  }

  get taskMenuItems() {
    return TaskSubMenu;
  }

  otherTasks() {
    const createDeliverableRef = this.dialogService.open(OtherTasksComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }

  toggleCollapse() {
    this.show = !this.show;
    this.imageName = (this.show) ? this.translate.instant("collapse") : this.translate.instant("expand");
  }

  setTaskDueDate(event) {
    this.taskDueDate = event;
  }

  cancelTaskDueDate() {
    this.showEditableFields = false;
    this.taskDueDate = '';
    this.managementService.changeTaskDueDate(this.taskDueDate);
  }

  saveTaskDueDate() {
    if (this.taskDueDate !== '') {
      this.managementService.changeTaskDueDate(this.taskDueDate);
    }
    //Hide the edit window
    this.showEditableFields = false;
    this.enableEditButton = false;
  }

  onSearch(searchText) {
    this.managementService.taskFilters.searchText = searchText;
    this.managementService.setResetTaskFilter(this.managementService.taskFilters);
  }

  toggleEditableFields() {
    if(this.enableEditButton)
    { 
      this.showEditableFields = true;
      this.show = false;
    }
  }

  clearFilters() {
    this.selectedTaskStatus = [];
    this.selectedTaskType = [];
    this.selectedAssignedBy = [];
    this.minDueDate = new Date();
    this.maxDueDate = new Date();
    this.taskType = [];
    this.taskStatus = [];
    this.assignBy = [];
    this.DueDate = '';
    this.managementService.ResetTaskFilter();
  }

  downloadTasks() {
    this.managementService.changeTaskDownloadFlag(true);
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }
}
