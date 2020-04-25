import { Component, OnInit, Output, EventEmitter, ElementRef, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { DatePipe } from '@angular/common';
import { AlertService } from '../../../shared/services/alert.service';
import { EventConstants, eventConstantsEnum } from '../../../@models/common/eventConstants';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { HomeService } from '../home.service';
import { NotificationFilterRequestViewModel, NotificationGridData, NotificationGridResponseViewModel, NotifyUserDeleteViewModel } from '../../../@models/organization';
import { DialogService } from '../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../@models/common/dialog';
import { LocalDataSource, ViewCell } from '../../../@core/components/ng2-smart-table';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { NotificationRequestModel } from '../../../@models/user';
import { UserService } from '../../user/user.service';
import * as moment from 'moment';
import { NotificationService } from '../notification.service';
import { NotificationViewModel, NotificationType, NotificationGridModel, EntityOutScopeModel, TransactionOutScopeModel, NotificationResponseModel } from '../../../@models/notification';
import { TransactionService } from '../../project-setup/transaction/transaction.service';
import { EntitiesService } from '../../project-setup/entity/entity.service';
import { NotificationHelper } from '../../../shared/notification-helper';
import { CBCBlocDeleteModel } from '../../../@models/projectDesigner/library';
import { BlockService } from '../../project-design/services/block.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-veiw-all-notification',
  templateUrl: './veiw-all-notification.component.html',
  styleUrls: ['./veiw-all-notification.component.scss']
})
export class VeiwAllNotificationComponent implements OnInit {
  projectId: string;
  createdByList: any;
  selectedCreatedByItems = [];
  selectedNotificationIds = [];
  dropdownCreatedBySettings = {};
  @Output() loadChildComp: EventEmitter<any> = new EventEmitter();
  subscriptions: Subscription = new Subscription();
  notificationGridRequestViewModel = new NotificationFilterRequestViewModel();
  notificationGridResponseViewModel = new NotificationGridResponseViewModel();
  notificationRequestModel = new NotificationRequestModel();
  notificationGridData = new NotificationGridModel();
  selectedNotificationRows: NotificationGridModel[];
  private dialogTemplate: Dialog;
  isMarkDisabled: boolean = true;
  isDeleteDisabled: boolean = true;
  _pageSize: number = 10;
  _pageIndex: number = 0;
  NotificationGridSource: LocalDataSource = new LocalDataSource();
  //htmlContent:any;

  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      add: false, edit: false, delete: false, select: true, 
      position: 'right',
    },
    filters: false,
    pager: {
      display: true,
      perPage: this._pageSize,
    },
    columns: {
      displayMessage: {
        filter: false,
        width: '60%',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return '<img src="assets/images/userProfilePic.png" width="2%"><p class="main-text">'+ 
                  '' +
                  '' + 
                  row.displayMessage + '<br/>' +
                  '' +
                  '<span class="notificationData">'+moment(row.createdOn).local().format("MMM DD, YYYY") +'</span>'+ 
                  '</p>';
        },
      },
      actionRequested:{
        title:'',
        type:'custom',
        renderComponent: ActionRequestedComponent,
      }
    }
  };

  constructor(
    private dialogService: DialogService,
    private alertService: AlertService,
    private el: ElementRef,
    private service: HomeService,
    private toastr: ToastrService,
    private shareDetailService: ShareDetailService,
    private readonly _eventService: EventAggregatorService,
    private datepipe: DatePipe,
    
    private dialog: MatDialog,
    private translate: TranslateService,
    private userService: UserService,
    private notificationService: NotificationService,
    private notificationHelper: NotificationHelper
  ) { 
  }


  ngOnInit() {

    this.notificationRequestModel.pageSize = this._pageSize;
    this.notificationRequestModel.pageIndex = this._pageIndex;

    this.getNotificationData();
    this.LoadFilterDropdown();
    this.dropdownCreatedBySettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.notification.loadNotifications).subscribe((payload) => {
      if(payload == "Reload")
      this.getNotificationData();
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.NotificationFilter).subscribe((payload) => {
      this.getNotificationFilterData(payload);
    }));

    this.NotificationGridSource.onChanged().subscribe((change) => {
      // this.removeViewMore();
      if (change.action === 'page' || change.action === 'paging') {
        this.notificationRequestModel.pageSize= this._pageSize = change.paging.perPage;
        this.notificationRequestModel.pageIndex= this._pageIndex = change.paging.page;
        this.getNotificationData();
      }
    });
  }

  enableAction(payload){
    if(payload.length == 0){
      this.isMarkDisabled = false;
      this.isDeleteDisabled = true;
    }
    else{
      this.isMarkDisabled = true;
      this.isDeleteDisabled = false;
    }
  }

  updateStatusByAction(NotifyId, Action){
    
    this.subscriptions.add(this.service.updateStatusByAction(NotifyId, Action)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.project-user.ProjectUserDeleteSuccessMessage'));
          
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.service.selectedAdminUserRows = [];
          this.enableAction([]);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }


  LoadFilterDropdown(){
    this.service.getNotificationFilter().subscribe(data => {
      this.createdByList = data.actionBy;
    });
  }
  
  onAdminUserRowSelect(event) {
    if(event.selected.length == 0) {
      this.enableAction(event.selected);
    }
    else {
      this.enableAction(event.selected);
    }
    this.selectedNotificationRows = event.selected;
  }

  onItemSelect(item: any){
    this.enableAction([]);
    if (this.selectedCreatedByItems != undefined) {
      this.notificationGridRequestViewModel.ActionBy = new Array();
      this.selectedCreatedByItems.forEach((element: never) => {
        this.notificationGridRequestViewModel.ActionBy.push(element["id"]);
      });
    }
  this._eventService.getEvent(EventConstants.NotificationFilter).publish(this.notificationGridRequestViewModel);
  }

  onSelectAllCreatedBy(items:any) {
    this.enableAction([]);
    if (this.selectedCreatedByItems != undefined) {
      this.notificationGridRequestViewModel.ActionBy = new Array();
      items.forEach((element: never) => {
        this.notificationGridRequestViewModel.ActionBy.push(element["id"]);
      });
    }
    this._eventService.getEvent(EventConstants.NotificationFilter).publish(this.notificationGridRequestViewModel);
  }

  onDateSelect(item: any) {
  this.enableAction([]);
  var startDateSelected = item[0];
  var endDateSelected = this.getEndDateTime(item[1]);

  if (startDateSelected != null && endDateSelected != null) {
    this.notificationGridRequestViewModel.DateFrom = startDateSelected;
    this.notificationGridRequestViewModel.DateTo = endDateSelected;
    this._eventService.getEvent(EventConstants.NotificationFilter).publish(this.notificationGridRequestViewModel);
  }
  }

  getEndDateTime(date: any): any {
    return moment(date).set({h: 23, m: 59, s: 59}).toDate();
  }
  getNotificationData() {
    this.subscriptions.add(this.notificationService.getNotifications(this.notificationRequestModel)
      .subscribe(
        response => {
          this.loadNotificationGridDetails(response.notifications);
          this.NotificationGridSource.totalCount = response.totalCount;
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
    this.enableAction([]);
  }

  loadNotificationGridDetails(data: any) {
    let notificationGridList = [];
    notificationGridList = this.notificationHelper.updateNotificationMessage(data);
    this.NotificationGridSource.load(notificationGridList);
  }

  loadMyChildComponent(action) {
    if(action == "MarkRead"){
      this.updateAllAsRead()
    }
    if(action == "Delete"){
      this.openDeleteConfirmDialog();
    }
  }


  openDeleteConfirmDialog(): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-user.DeleteConfirmationMessage');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteNotifications();
        dialogRef.close();
      }
      else
        this.dialog.closeAll();
    });
  }

  deleteNotifications() {

    if (!this.selectedNotificationRows) {
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.DeleteValidationMessage'));
    }

    let notificationIds = new Array();
    this.selectedNotificationRows.forEach(element => {
      notificationIds.push(element.NotificationViewModel.id);
    })

    this.subscriptions.add(this.notificationService.deleteNotifications(notificationIds)
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.toastr.success(this.translate.instant('screens.home.notification-screen.deletedNotifications'));
            this.getNotificationData();
          } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
          this.selectedNotificationRows = [];
          this.enableAction([]);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

  updateAllAsRead(){
    this.subscriptions.add(this.notificationService.updateAllRead()
      .subscribe(
        response => {
          if (response.status === ResponseStatus.Sucess) {
            this.getNotificationData();
        } else {
            this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          }
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
  }

  getNotificationFilterData(data) {
    let notificationFilterData = new NotificationFilterRequestViewModel();
    notificationFilterData.ActionBy = data.ActionBy;
    notificationFilterData.DateFrom = data.DateFrom;
    notificationFilterData.DateTo = data.DateTo;
    notificationFilterData.PageSize = this._pageSize;
    notificationFilterData.PageIndex = this._pageIndex;
    this.subscriptions.add(this.notificationService.getNotificationFilterData(notificationFilterData)
      .subscribe(
        response => {
          this.loadNotificationGridDetails(response.notifications);
        },
        error => {
          this.dialogService.Open(DialogTypes.Warning, error.message);
        }));
    this.enableAction([]);
  }

}

@Component({
  selector: 'button-view',
  template: `
  <div class="row-fluid text-right">
   <span *ngIf="IsActionRequired"><a href="javascript:void(0)" (click) = "accept(row)"><img class="viewMorelessIcon"  src="assets/images/green-tick.png" width="8%"><font color="green">&nbsp;Accept&nbsp;</font></a></span>
   <span *ngIf="IsActionRequired"><a href="javascript:void(0)" (click) = "reject(row)" ><img class="viewMorelessIcon" src="assets/images/close-task - red.svg" width="8%"><font color="red">&nbsp;Reject&nbsp;</font></a></span>
   <span *ngIf="!isRead"><img class="viewMorelessIcon" (click) = "markAsRead(row)" src="assets/images/MarkAsRead.png"></span>
  </div>`
})

export class ActionRequestedComponent implements ViewCell, OnInit, OnDestroy {
  row: any;
  isRead: boolean;
  IsActionRequired: boolean;
  subscriptions: Subscription = new Subscription();

  constructor(private notificationService: NotificationService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private transacionService: TransactionService,
    private _eventService: EventAggregatorService,
    private tservice: EntitiesService,
    private blockService: BlockService,
    private toastr: ToastrService,
    private translate: TranslateService,) { }

  @Input() rowData: any;
  @Input() value: string | number;


  ngOnInit() {
    this.row = this.rowData;
    this.isRead = this.row.NotificationViewModel.isRead;
    if(this.row.NotificationViewModel.actionTaken == null)
    this.IsActionRequired = this.row.NotificationViewModel.isActionRequired;
    else
    this.IsActionRequired = false;
  }

  accept(row){
    row.NotificationViewModel.actionTaken = true;
    switch(row.NotificationViewModel.notificationType){

      case NotificationType.TransactionDeletion:
          let transactionId = new Array();
          transactionId.push(row.NotificationViewModel.actionReference.transactionId)
          this.transacionService.deleteTransaction(transactionId)
          .subscribe(
            response => {    
              if (response.status === ResponseStatus.Sucess) {
                this.toastr.success(this.translate.instant('screens.home.notification-screen.updatedSuccesfully'));
              
              } else {
                this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
              }    
            },
            error => {
              this.dialogService.Open(DialogTypes.Error,  this.translate.instant('screens.home.notification-screen.ErrorOccured'));
            });
            break;

        case NotificationType.EntityDeletion:    
            let entityId = new Array();
            entityId.push(row.NotificationViewModel.actionReference.deliverableId);
            this.tservice.deleteEntity(entityId)
                .subscribe(
                  response => {
                    if (response.status === ResponseStatus.Sucess) {
                      this.toastr.success(this.translate.instant('screens.home.notification-screen.updatedSuccesfully'));
                     
                    } else {
                      this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
                    }
                  },
                  error => {
                    this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
                  });
                  break;

          case NotificationType.EntityScope:
              let entityScopeId = new Array();
              entityScopeId.push(row.NotificationViewModel.actionReference.deliverableId);
              let entityOutScopeModel= new EntityOutScopeModel();
              entityOutScopeModel.EntityIds = entityScopeId;
              entityOutScopeModel.ProjectId = row.NotificationViewModel.actionReference.projectId;
              this.tservice.EntityOutOfScope(entityOutScopeModel)
                .subscribe(
                  response => {
                    if (response.status === ResponseStatus.Sucess) {
                      this.toastr.success(this.translate.instant('screens.home.notification-screen.updatedSuccesfully'));
                     
                    } else {
                      this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
                    }
                  },
                  error => {
                    this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
                  });
                  break;

             case NotificationType.TransactionScope:
                let transactionScopeId = new Array();
                transactionScopeId.push(row.NotificationViewModel.actionReference.transactionId);
                let transactionOutScopeModel= new TransactionOutScopeModel();
                transactionOutScopeModel.TransactionIds = transactionScopeId;
                transactionOutScopeModel.ProjectId = row.NotificationViewModel.actionReference.projectId;
                this.transacionService.TransactionOutOfScope(transactionOutScopeModel)
                  .subscribe(
                    response => {
                      if (response.status === ResponseStatus.Sucess) {
                        this.toastr.success(this.translate.instant('screens.home.notification-screen.updatedSuccesfully'));
                       
                      } else {
                        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
                      }
                    },
                    error => {
                      this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
                    });
                    break;

               case NotificationType.BlockDeletionFromCBC:
                   let cbcBlocDeleteModel = new CBCBlocDeleteModel();
                   let blockId = new Array();
                   blockId.push(row.NotificationViewModel.actionReference.blockId);
                   cbcBlocDeleteModel.BlockIds = blockId;
                   cbcBlocDeleteModel.OrganizationId = row.NotificationViewModel.actionReference.OrganizationId;
                   cbcBlocDeleteModel.ProjectId = row.NotificationViewModel.actionReference.projectId;
                   cbcBlocDeleteModel.Status = 'pending';
                   this.blockService.removeCBCBlocks(cbcBlocDeleteModel)
                  .subscribe(
                    response => {
                      if (response.status === ResponseStatus.Sucess) {
                        this.toastr.success(this.translate.instant('screens.home.notification-screen.updatedSuccesfully'));
                        
                      } else {
                        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
                      }
                    },
                    error => {
                      this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
                    });
                    break;

    }
    this.notificationService.ApproveRejectNotification(row.NotificationViewModel)
      .subscribe(response=>
        {
          this._eventService.getEvent(eventConstantsEnum.notification.loadNotifications).publish("Reload");
        });
        
  }

  reject(row){
    row.NotificationViewModel.actionTaken = false;

    this.notificationService.ApproveRejectNotification(row.NotificationViewModel)
      .subscribe(response=>
        {
          this._eventService.getEvent(eventConstantsEnum.notification.loadNotifications).publish("Reload");
        });
  }

  markAsRead(event){
    let Ids= new Array();
    Ids.push(event.NotificationViewModel.id);
    this.subscriptions.add(this.notificationService.updateIsRead(Ids)
    .subscribe(
      response => {       
        this._eventService.getEvent(eventConstantsEnum.notification.loadNotifications).publish("Reload");
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
