import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { deliverableFilterViewModel } from '../@models/deliverable/deliverable';
import { Menus } from '../@models/common/Project-Management-menu';
import { BlockRequestModel, BlockReportFilterRequest } from '../@models/blocks/block';
import { TaskSubMenu } from '../@models/Project-Management-Constants';
import { taskFilterRequest } from '../@models/tasks/task';
import { visualizationRequest } from '../@models/visualization/visualization';
import { UserRightsViewModel } from '../../../@models/userAdmin';

@Injectable({
  providedIn: 'root'
})
export class ProjectManagementService {


  userRights= new BehaviorSubject<UserRightsViewModel>(new UserRightsViewModel());
  currentUserRights= this.userRights.asObservable();

  showDeliverableDialog = new BehaviorSubject<boolean>(false);
  currentCreateDeliverableFlag = this.showDeliverableDialog.asObservable();

  reloadDeliverableGrid = new BehaviorSubject<boolean>(false);
  currentReloadDeliverableGrid = this.reloadDeliverableGrid.asObservable();

  reloadDeliverableSummary = new BehaviorSubject<boolean>(false);
  currentReloadDeliverableSummary = this.reloadDeliverableSummary.asObservable();

  deliverableIdsForEdit = new BehaviorSubject<any[]>([]);
  currentDeliverableIdsForEdit = this.deliverableIdsForEdit.asObservable();

  DeliverableFilters = new deliverableFilterViewModel();
  DeliverableFilter$: BehaviorSubject<deliverableFilterViewModel> = new BehaviorSubject(this.DeliverableFilters);
  CurrentDeliverableFilter = this.DeliverableFilter$.asObservable();

  applyDeliverableFilter = new BehaviorSubject<boolean>(false);
  currentApplyDeliverableFilter = this.applyDeliverableFilter.asObservable();

  selectedDeliverable = new BehaviorSubject<string>('');
  currentSelectedDeliverable = this.selectedDeliverable.asObservable();

  selectedMenu = new BehaviorSubject<Menus>(Menus.Deliverable);
  currentSelectedMenu = this.selectedMenu.asObservable();

  downloadDeliverable = new BehaviorSubject<boolean>(false);
  currentDownloadDeliverableFlag = this.downloadDeliverable.asObservable();

  deliverableGridRefresh= new BehaviorSubject<boolean>(false);
  currentDeliverableGridRefresh= this.deliverableGridRefresh.asObservable();

  downloadTask = new BehaviorSubject<boolean>(false);
  currentDownloadTaskFlag = this.downloadTask.asObservable();

  blockAssignToUsers = new BehaviorSubject<any>(null);
  blockAssignToUsersFlag = this.blockAssignToUsers.asObservable();

  // Block Filter BehaviourSubject Starts 

  BlockFilters = new BlockRequestModel();
  BlockFilter$: BehaviorSubject<BlockRequestModel> = new BehaviorSubject(this.BlockFilters);
  CurrentBlockFilter = this.BlockFilter$.asObservable();

  applyBlockFilter = new BehaviorSubject<boolean>(false);
  currentApplyBlockFilter = this.applyBlockFilter.asObservable();

  // Block FIlter BehaviourSubject Ends

  taskDuedate = new BehaviorSubject<string>('');
  currentTaskDueDate = this.taskDuedate.asObservable();


  // Task Tab Behaviour subject Start
  taskTab$: BehaviorSubject<TaskSubMenu> = new BehaviorSubject(TaskSubMenu.AllTasks);
  changeFilters = this.taskTab$.asObservable();

  taskFilters = new taskFilterRequest();
  taskFilter$: BehaviorSubject<taskFilterRequest> = new BehaviorSubject(this.taskFilters);
  currentTaskFilter = this.taskFilter$.asObservable();

  applyTaskFilter = new BehaviorSubject<boolean>(false);

  reloadTaskGrid = new BehaviorSubject<boolean>(false);
  currentReloadTaskGrid = this.reloadTaskGrid.asObservable();

  tasksForReassign= new BehaviorSubject<any[]>(new Array());
  currentTaskForReassign= this.tasksForReassign.asObservable();

  completeTask= new BehaviorSubject<any>(null);
  currentCompleteTask= this.completeTask.asObservable();

  currentApplyTaskFilter = this.applyTaskFilter.asObservable();
  // Task Tab Behaviour subject End

  entity= new BehaviorSubject<any>(null);
  currentEntity= this.entity.asObservable();

  visualizationFilter= new visualizationRequest();
  visualizationFilter$= new BehaviorSubject<visualizationRequest>(this.visualizationFilter);
  currentVisualizationFilter= this.visualizationFilter$.asObservable();
  enableVisualizationClearFilter= new BehaviorSubject<boolean>(false);
  currentVisClearFilter= this.enableVisualizationClearFilter.asObservable();


  applyVisFilter= new BehaviorSubject<boolean>(false);
  currentApplyVisFilter= this.applyVisFilter.asObservable();

  countriesStyleReset= new BehaviorSubject<boolean>(false);
  currentCountriesResetStyle = this.countriesStyleReset.asObservable();

  constructor() { }

  changeCurrentUserRights(userRights:UserRightsViewModel)
  {
    this.userRights.next(userRights);
  }

  changeDeliverableGridRefresh(refresh:boolean)
  {
    this.deliverableGridRefresh.next(refresh);
  }

  changeCreateDeliverableFlag(showDeliverableDialog: boolean) {
    this.showDeliverableDialog.next(showDeliverableDialog);
  }


  changeReloadDeliverableGrid(reload: boolean) {
    this.reloadDeliverableGrid.next(reload);
  }

  changeDeliverableIdsForEdit(deliverableIds: any[]) {
    this.deliverableIdsForEdit.next(deliverableIds);
  }

  changeReloadDeliverableSummaryFlag(reloadDeliverableSummary: boolean) {
    this.reloadDeliverableSummary.next(reloadDeliverableSummary);
  }

  changeDownloadDeliverableFlag(downlad: boolean) {
    this.downloadDeliverable.next(downlad);
  }

  changeTaskDownloadFlag(downlad: boolean) {
    this.downloadTask.next(downlad);
  }

  ResetFilter() {

    this.DeliverableFilters.deliverableName = [];
    this.DeliverableFilters.countries = [];
    this.DeliverableFilters.reportTiers = [];
    this.DeliverableFilters.milestones = [];
    this.DeliverableFilters.cbcNotificationStartDate = '';
    this.DeliverableFilters.cbcNotificationEndDate = '';
    this.DeliverableFilters.statutoryDueDateStartDate = '';
    this.DeliverableFilters.statutoryDueDateEndDate = '';
    this.DeliverableFilters.targetDeliverableIssueStartDate = '';
    this.DeliverableFilters.targetDeliverableIssueEndDate = '';
    this.DeliverableFilters.taxableYearStartDate = '';
    this.DeliverableFilters.taxableYearEndDate = '';
    this.SetOrResetFilter(this.DeliverableFilters);
  }

  SetOrResetFilter(deliverableFilters: deliverableFilterViewModel) {
    this.DeliverableFilter$.next(deliverableFilters);
    this.changeApplyDeliverableFilter(true);
  }

  changeApplyDeliverableFilter(applyFilter: boolean) {
    this.applyDeliverableFilter.next(applyFilter);
  }

  changeCurrentDeliverable(deliverableId: string) {
    this.selectedDeliverable.next(deliverableId);
  }


  changeCurrentTab(menu: Menus) {
    this.selectedMenu.next(menu);
  }

  
  changeReloadTaskGrid(reload:boolean){
    this.reloadTaskGrid.next(reload);
  }

  changeTaskForReassign(nextTasks:any[])
  {
    this.tasksForReassign.next(nextTasks);
  }

  changeCompleteTask(completeTask:any)
  {
    this.completeTask.next(completeTask);
  }

  // Starts Block Filter Behaviour Methods

  ResetBlockFilter() {
    this.BlockFilters.projectId = '';
    this.BlockFilters.entityId = '';
    this.BlockFilters.comment = '';
    this.BlockFilters.blockReferenceId = '';
    this.BlockFilters.parentStackId = '';
    this.BlockFilters.templateId = '';
    this.BlockFilters.blockReportFilterRequest = new BlockReportFilterRequest()
    this.BlockFilters.blockReportFilterRequest.BlockStatus = [];
    this.BlockFilters.blockReportFilterRequest.BlockType = [];
    this.BlockFilters.blockReportFilterRequest.MaxDueDate = '';
    this.BlockFilters.blockReportFilterRequest.MinDueDate = '';
    this.BlockFilters.blockReportFilterRequest.UserAssignment = [];
    this.SetOrResetBlockFilter(this.BlockFilters);
  }

  ResetTaskFilter() {
    this.taskFilters.projectId = '';
    this.taskFilters.searchText = '';
    this.taskFilters.dueDateMin = '';
    this.taskFilters.dueDateMax = '';
    this.taskFilters.myTasksOnly = false;
    this.taskFilters.others = false;
    this.taskFilters.pageIndex = 1;
    this.taskFilters.pageSize = 10;
    this.taskFilters.assignedByMe = false;
    this.taskFilters.assignedToMe = false;
    this.taskFilters.coReviewerId = [];
    this.taskFilters.updatedById = [];
    this.taskFilters.updatedOnMax = '';
    this.taskFilters.updatedOnMin = '';
    this.taskFilters.nameId = [];
    this.taskFilters.dataSource = [];
    this.taskFilters.statusId = [];
    this.taskFilters.assignToId = [];
    this.setResetTaskFilter(this.taskFilters);
  }

  SetOrResetBlockFilter(BlockFilters: BlockRequestModel) {
    this.BlockFilter$.next(BlockFilters);
    this.ChangeApplyBlockFilters(true);
  }

  ChangeApplyBlockFilters(applyFilter: boolean) {
    this.applyBlockFilter.next(applyFilter);
  }

  // ends Block Filter Behaviour Methods

  // start task filter behaviours
  setResetTaskFilter(taskFilters: taskFilterRequest) {
    this.taskFilter$.next(taskFilters);
    this.changeTaskFilter(true);
  }

  changeTaskFilter(applyFilter: boolean) {
    this.applyTaskFilter.next(applyFilter);
  }
  // end task filter behaviours

  changeTaskDueDate(dueDate: string) {
    this.taskDuedate.next(dueDate);
  }

  changeFilter(filter: TaskSubMenu) {
    this.taskTab$.next(filter);
  }

  changeBlockAssignToUser(list : any)
  {
    this.blockAssignToUsers.next(list);
  }


  changeCurrentEntity(entity:any)
  {
    this.entity.next(entity);
  }


  SetOrResetVisualizationFilter(filteRequest: visualizationRequest) {
    this.visualizationFilter$.next(filteRequest);
    this.changeApplyVisualizationFilter(true);
  }

  changeApplyVisualizationFilter(applyFilter: boolean)
  {
    this.applyVisFilter.next(applyFilter);
  }

  changeToggleVisClearFilter(enableFilter:boolean)
  {
    this.enableVisualizationClearFilter.next(enableFilter);
  }
  changeResetStyleCountries(resetStyle:boolean)
  {
    this.countriesStyleReset.next(resetStyle);
  }

}
