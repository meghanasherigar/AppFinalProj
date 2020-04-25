import { Component, OnInit, Output, EventEmitter, ElementRef, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { DatePipe } from '@angular/common';
import { AlertService } from '../../../shared/services/alert.service';
import { EventConstants, eventConstantsEnum, NavigationSource } from '../../../@models/common/eventConstants';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { NotificationFilterRequestViewModel, NotificationGridData, NotificationGridResponseViewModel, NotifyUserDeleteViewModel, ProjectContext, ProjectAccessRight } from '../../../@models/organization';
import { DialogService } from '../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../@models/common/dialog';
import { LocalDataSource, ViewCell } from '../../../@core/components/ng2-smart-table';
import { MatDialog } from '@angular/material';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { ResponseStatus } from '../../../@models/ResponseStatus';
import { NotificationRequestModel } from '../../../@models/user';
import { UserService } from '../../user/user.service';
import * as moment from 'moment';
import { NotificationViewModel, NotificationType, NotificationGridModel, EntityOutScopeModel, TransactionOutScopeModel, NotificationResponseModel } from '../../../@models/notification';
import { TransactionService } from '../../project-setup/transaction/transaction.service';
import { EntitiesService } from '../../project-setup/entity/entity.service';
import { NotificationHelper } from '../../../shared/notification-helper';
import { CBCBlocDeleteModel } from '../../../@models/projectDesigner/library';
import { BlockService } from '../../project-design/services/block.service';
import { HomeService } from '../../home/home.service';
import { NotificationService } from '../../home/notification.service';
import { TemplateService } from '../../project-design/services/template.service';
import { TemplateDeleteRequestModel } from '../../../@models/projectDesigner/template';
import { Router } from '@angular/router';
import { RoleService } from '../../../shared/services/role.service';
import { ToastrService } from 'ngx-toastr';
import { DesignerService } from '../../project-design/services/designer.service';
import { Menus, SubMenus } from '../../../@models/projectDesigner/designer';
import { InformationResponseViewModel } from '../../../@models/projectDesigner/infoGathering';
import { CreateInfoService } from '../../project-design/modules/document-view/services/create-info.service';

@Component({
  selector: 'ngx-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss']
})
export class NotificationPageComponent implements OnInit {
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
    columns: {}
  };

  constructor(
    private dialogService: DialogService,
    private alertService: AlertService,
    private el: ElementRef,
    private toastr: ToastrService,
    private service: HomeService,
    private shareDetailService: ShareDetailService,
    private readonly _eventService: EventAggregatorService,
    private datepipe: DatePipe,
    private dialog: MatDialog,
    private translate: TranslateService,
    private userService: UserService,
    private notificationService: NotificationService,
    private notificationHelper: NotificationHelper
  ) { 
    this.subscriptions = new Subscription();
    this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getNotificationData();
      this.NotificationGridSource.refresh();
    }));

    this.setColumnSettings();
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

  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      displayMessage: {
        filter: false,
        width: '60%',
        type: 'custom',
        renderComponent: NotificationLink,
      },
      actionRequested:{
        title:'',
        type:'custom',
        renderComponent: ActionRequestedComponent,
      }
    }
    this.settings = Object.assign({}, settingsTemp );
  }


  navigateToIR(){
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
    private translate: TranslateService,
    private toastr: ToastrService,
    private templateService: TemplateService) { }

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
                   blockId.push({"blockId" : row.NotificationViewModel.actionReference.blockId});
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

                case NotificationType.TemplateDeletion:
                  const templateDeleteModel = new TemplateDeleteRequestModel();
                    templateDeleteModel.TemplateIds = new Array(row.NotificationViewModel.actionReference.templateId);
                    templateDeleteModel.ProjectId = row.NotificationViewModel.actionReference.projectId;

                  this.templateService.deleteTemplates(templateDeleteModel).subscribe(
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

@Component({
  selector: 'button-view',
  template: `
  <div class="row-fluid">
      <div class="">
      <div *ngIf="(row.NotificationViewModel.notificationType != 7) && (row.NotificationViewModel.notificationType != 8) && (row.NotificationViewModel.notificationType != 9) && (row.NotificationViewModel.notificationType != 19)" [innerHTML]="row.displayMessage"></div>
      <a [routerLink]="" (click)="notificationNavigate(row)"><div *ngIf="(row.NotificationViewModel.notificationType == 7) || (row.NotificationViewModel.notificationType == 8) || (row.NotificationViewModel.notificationType == 9)" [innerHTML]="row.displayMessage"></div></a> <br/>
      <a [routerLink]="" (click)="navigateToAdmin(row)"><div *ngIf="row.NotificationViewModel.notificationType == 19" [innerHTML]="row.displayMessage"></div></a> <br/>

      </div>
  </div>`
})

export class NotificationLink implements ViewCell, OnInit, OnDestroy {
  row: any;
  subscriptions: Subscription = new Subscription();
  projectId: string;
  organizationId: string;

  constructor(private notificationService: NotificationService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private transacionService: TransactionService,
    private _eventService: EventAggregatorService,
    private tservice: EntitiesService,
    private blockService: BlockService,
    private translate: TranslateService,
    private router: Router,
    private shareDetailService: ShareDetailService,
    private homeService: HomeService,
    private readonly eventService: EventAggregatorService,
    private roleService: RoleService,
    private designerService: DesignerService,
    private infoGatheringService: CreateInfoService,
    private notificationHelper: NotificationHelper) { }

  @Input() rowData: any;
  @Input() value: string | number;


  ngOnInit() {
    this.row = this.rowData;
  }

  notificationNavigate(event){
    this.notificationHelper.navigateFromNotification(event);
  }

  navigateToAdmin(event){
    let adminSwitch = true;
    const usersetting = this.roleService.getUserRole();
    usersetting.adminView = adminSwitch;
    this.roleService.setUserRole(usersetting);
    this.eventService.getEvent(EventConstants.ProjectTabAccess).publish(false);
    this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(false);
    this.eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(false);
    this.eventService.getEvent(EventConstants.AdminView).publish(adminSwitch);
    this.router.navigate(['pages/admin/adminMain', { outlets: { primary: 'blockSuggestionMain', level2Menu: 'blockSuggestionLevel2Menu', leftNav: 'leftNav' } }]);
    this.eventService.getEvent(EventConstants.AdminView).publish(undefined);

  }



  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
