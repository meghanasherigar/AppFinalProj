import { Injectable } from '@angular/core';
import { NotificationGridModel, NotificationType } from '../@models/notification';
import { TranslateService } from '@ngx-translate/core';
import { TransactionService } from '../pages/project-setup/transaction/transaction.service';
import { EntitiesService } from '../pages/project-setup/entity/entity.service';
import { BlockService } from '../pages/project-design/services/block.service';
import { TemplateService } from '../pages/project-design/services/template.service';
import { ResponseStatus } from '../@models/ResponseStatus';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from './services/dialog.service';
import { DialogTypes } from '../@models/common/dialog';
import { TemplateDeleteRequestModel } from '../@models/projectDesigner/template';
import { NotificationService } from '../pages/home/notification.service';
import { eventConstantsEnum } from '../@models/common/eventConstants';
import { EventAggregatorService } from './services/event/event.service';
import { NavigationHelperService } from './services/navigation-helper.service';
import { ValueConstants } from '../@models/common/valueconstants';


@Injectable({
  providedIn: 'root'
})
export class NotificationHelper {

  constructor(
    private transacionService: TransactionService,
    private translate: TranslateService,
    private tservice: EntitiesService,
    private blockService: BlockService,
    private templateService: TemplateService,
    private toastr: ToastrService,
    private dialogService: DialogService,
    private _eventService: EventAggregatorService,
    private navigationHelper: NavigationHelperService,
    private notificationService: NotificationService) { }

  public updateNotificationMessage(data) {
    let notificationGridList = [];

    data.forEach(element => {
      let notificationGridData = new NotificationGridModel();
      notificationGridData.NotificationViewModel = element;


      switch (element.notificationType) {
        case NotificationType.FAQ:
        case NotificationType.TermsOfUse:
        case NotificationType.PrivacyPolicy:
        case NotificationType.WhatNew:
        case NotificationType.UserManual:
          notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.UpdatesWereMereMade') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Section');
          break;
        case NotificationType.TransactionDeletion:
          if (element.isActionRequired)
            notificationGridData.displayMessage = '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>' + this.translate.instant('screens.home.notification-message.deleteSuggestion') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.ApproveReject');
          else {
            if (element.actionTaken)
              notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.afterTransactionDelete') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Accepted');
            else
              notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.afterTransactionDelete') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Rejected');
          }
          break;
        case NotificationType.EntityDeletion:
          if (element.isActionRequired)
            notificationGridData.displayMessage = '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>' + this.translate.instant('screens.home.notification-message.deleteSuggestion') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.ApproveReject');
          else {
            if (element.actionTaken)
              notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.afterEntityDelete') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Accepted');
            else
              notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.afterEntityDelete') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Rejected');
          }
          break;
        case NotificationType.TemplateDeletion:
          if (element.isActionRequired)
            notificationGridData.displayMessage = '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>' + this.translate.instant('screens.home.notification-message.deleteSuggestion') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.ApproveReject');
          else {
            if (element.actionTaken)
              notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.afterTemplateDelete') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Accepted');
            else
              notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.afterTemplateDelete') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Rejected');
          }
          break;
        case NotificationType.UserDeletion:
          notificationGridData.displayMessage = '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>' + this.translate.instant('screens.home.notification-message.deleteSuggestion') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.ApproveReject');
          break;
        case NotificationType.BlockSuggestion:
          notificationGridData.displayMessage = '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>' + this.translate.instant('screens.home.notification-message.blockSuggestion') + '<b>' + element.messageContent + '</b>' + " to the ‘Global’ OR ‘Country’ Library." + this.translate.instant('screens.home.notification-message.ApproveReject');
          break;
        case NotificationType.InformationRequestAssignment:
        case NotificationType.BlockAssignment:
        case NotificationType.ReportAssignment:
          notificationGridData.displayMessage =
            `<b>${element.requestedBy.firstName} ${element.requestedBy.lastName} </b> ${this.translate.instant('screens.home.notification-message.workInvitation')}
          <b>${element.messageContent}</b>`;

          //TODO: Add more checks here before setting true
          notificationGridData.clickable = true;
          break;
        case NotificationType.InformationRequestCompletion:
          notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.informationRequest') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.IRApproval') + '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>';
          break;
        case NotificationType.InformationRequestPullBack:
          notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.informationRequest') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.IRPulledBack') + '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>';
          break;
        case NotificationType.EntityScope:
        case NotificationType.TransactionScope:
          notificationGridData.displayMessage = '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>' + this.translate.instant('screens.home.notification-message.outScope') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.ApproveReject');
          break;
        case NotificationType.BlockDeletionFromCBC:
          if (element.isActionRequired)
            notificationGridData.displayMessage = '<b>' + element.requestedBy.firstName + ' ' + element.requestedBy.lastName + '</b>' + this.translate.instant('screens.home.notification-message.deleteBlock') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.ApproveReject');
          else {
            if (element.actionTaken)
              notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.afterDeleteBlock') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Accepted');
            else
              notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.afterDeleteBlock') + '<b>' + element.messageContent + '</b>' + this.translate.instant('screens.home.notification-message.Rejected');
          }
          break;
        case NotificationType.DeliverableIssueDateReminder:
          let message = this.splitMessage(element.messageContent)
          let deliverableName = message[0];
          let daysDue = message[1];
          notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.yourDeliverable') + deliverableName + this.translate.instant('screens.home.notification-message.isDueIn') + daysDue + this.translate.instant('screens.home.notification-message.days');
          break;
        case NotificationType.TaskDueDateReminder:
          let Taskmessage = this.splitMessage(element.messageContent)
          let TaskName = Taskmessage[0];
          let TaskdaysDue = Taskmessage[1];
          notificationGridData.displayMessage = this.translate.instant('screens.home.notification-message.yourTask') + TaskName + this.translate.instant('screens.home.notification-message.isDueIn') + TaskdaysDue + this.translate.instant('screens.home.notification-message.days');
          break;

        default:
          notificationGridData.displayMessage = element.messageContent;
          break;
      }
      notificationGridList.push(notificationGridData);
    });
    return notificationGridList;
  }

  splitMessage(data) {
    let message = data.split(ValueConstants.NotificationSplitChar);
    return message;
  }


  acceptNotification(row) {
    row.NotificationViewModel.actionTaken = true;
    switch (row.NotificationViewModel.notificationType) {

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
            _error => {
              this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
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
            _error => {
              this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
            });
        break;

      case NotificationType.EntityScope:
        let entityScopeId = new Array();
        entityScopeId.push(row.NotificationViewModel.actionReference.deliverableId);
        let entityOutScopeModel: any = {};
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
            _error => {
              this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
            });
        break;

      case NotificationType.TransactionScope:
        let transactionScopeId = new Array();
        transactionScopeId.push(row.NotificationViewModel.actionReference.transactionId);
        let transactionOutScopeModel: any = {};
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
            _error => {
              this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
            });
        break;

      case NotificationType.BlockDeletionFromCBC:
        let cbcBlocDeleteModel: any = {};
        let blockId = new Array();
        blockId.push({ "blockId": row.NotificationViewModel.actionReference.blockId });
        cbcBlocDeleteModel.BlockIds = blockId;
        cbcBlocDeleteModel.OrganizationId = row.NotificationViewModel.actionReference.OrganizationId;
        cbcBlocDeleteModel.ProjectId = row.NotificationViewModel.actionReference.projectId;
        cbcBlocDeleteModel.Status = ValueConstants.CbcBlockDeletionStatusPending;
        this.blockService.removeCBCBlocks(cbcBlocDeleteModel)
          .subscribe(
            response => {
              if (response.status === ResponseStatus.Sucess) {
                this.toastr.success(this.translate.instant('screens.home.notification-screen.updatedSuccesfully'));

              } else {
                this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
              }
            },
            _error => {
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
          _error => {
            this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.home.notification-screen.ErrorOccured'));
          });
        break;

    }

    this.updateNotification(row);

  }

  updateNotification(notification) {

    this.notificationService.ApproveRejectNotification(notification.NotificationViewModel)
      .subscribe(_response => {
        this._eventService.getEvent(eventConstantsEnum.notification.loadNotifications)
          .publish(eventConstantsEnum.notification.Reload);
      });
  }


  navigateFromNotification(notification) {

    let projectId = notification.NotificationViewModel.actionReference.projectId;

    const blockId = notification.NotificationViewModel.actionReference.blockId;
    const templateId = notification.NotificationViewModel.actionReference.templateId;
    const deliverableId = notification.NotificationViewModel.actionReference.deliverableId;

    switch (notification.NotificationViewModel.notificationType) {
      case NotificationType.BlockAssignment:
        this.navigationHelper.navigateToExtendedView(projectId,templateId,deliverableId,blockId);
        break;
      case NotificationType.ReportAssignment:
        this.navigationHelper.navigateToDocumentView(projectId,templateId,deliverableId);
        break;
      case NotificationType.InformationRequestAssignment:
        let infoRequestId = notification.NotificationViewModel.actionReference.informationRequestId;
        this.navigationHelper.navigateToInfoRequest(infoRequestId, projectId);
        break;
    }
  }

}
