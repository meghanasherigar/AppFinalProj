import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { ViewCell, LocalDataSource } from '../../../../../../@core/components/ng2-smart-table';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { InformationRequestFilterViewModel, InformationResponseViewModel, InfoRequestStatus, Index, createInfoLabels } from '../../../../../../@models/projectDesigner/infoGathering';
import { CreateInfoService } from '../../services/create-info.service';
import { DesignerService } from '../../../../services/designer.service';
import { InformationRequestViewModel, UserBasicViewModel, InfoReqDetailsForSendReminder, QuestionsResponseViewModel, InfoRequestDetailsModel, QuestionTypeViewModel } from '../../../../../../@models/projectDesigner/task';
import { Router } from '@angular/router';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { SendEmailService } from '../../../../../../shared/services/send-email.service';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { Subscription } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TaskService } from '../../services/task.service';
import { UserRightsViewModel } from '../../../../../../@models/userAdmin';
import { Question } from '../../../../../../@models/admin/content-whatsnew';
import { BlockType } from '../../../../../../@models/projectDesigner/block';
import { SortEvents, ValueConstants } from '../../../../../../@models/common/valueconstants';
import { CommonDataSource } from '../../../../../../@core/components/ng2-smart-table/lib/data-source/common-data-source';
import { ToastrService } from 'ngx-toastr';
import { Menus } from '../../../../../../@models/projectDesigner/designer';
@Component({
  selector: 'InfoRequest-link-view',
  template: `
  <div class="row-fluid">
      <div class="">
      <a [routerLink]="" (click)="onGetInfoRequest(row)" >{{row.name}}</a> 
      </div>
  </div>`
})

export class InfoRequestLinkComponent implements ViewCell, OnInit {
  row: any;
  // loaderId = 'infoRequestLink';
  @Input() rowData: any;
  @Input() value: string | number;
  userAccessRights: UserRightsViewModel;
  constructor(private readonly eventService: EventAggregatorService, private infoGatheringService: CreateInfoService, private designerService: DesignerService,
    private ngxLoader: NgxUiLoaderService, private router: Router, private shareDetailService: ShareDetailService, private taskService: TaskService, private dialogService: DialogService) {

  }
  ngOnInit() {
    this.row = this.rowData;
    this.designerService.informationResponseViewModel = [];
    this.taskService.getIsExternalUser().subscribe((payload) => {
      this.designerService.isExternalUser = payload;
    })
  }
  onGetInfoRequest(event) {
    this.ngxLoader.startBackgroundLoader(this.ngxLoader['loaders'].infoRequestList.loaderId);
    if (this.designerService.docViewAccessRights) {
      this.userAccessRights = this.designerService.docViewAccessRights;
    }
    this.designerService.deliverableInformationRequestModel = [];
    this.designerService.clearinforRequest();
    const project = this.shareDetailService.getORganizationDetail();
    this.infoGatheringService.getInformationRequestById(event.id).subscribe((data: InformationResponseViewModel) => {
      this.designerService.infoRequestId = event.id;
      this.designerService.viewedInforRequestId = event.id;
      this.designerService.infoRequestStatus = String(data.status); //TODO: This should be a proper Enum mapping
      this.designerService.infoRequestinProgressEdited = data.isSaved;
      this.designerService.infoDraftResponseModel = new InfoRequestDetailsModel();
      this.designerService.infoDraftResponseModel.ProjectId = data.projectId;
      this.designerService.infoDraftResponseModel.DeliverableId = data.deliverableId;
      this.designerService.infoDraftResponseModel.TemplateId = data.templateId;
      if (event.templateId != null && event.templateId != ValueConstants.DefaultId)
        this.designerService.ViewedTemplateOrDelieverable = event.templateId;
      else
        this.designerService.ViewedTemplateOrDelieverable = event.deliverableId;

      this.designerService.infoDraftResponseModel.Questions = data.questions;
      this.designerService.infoDraftResponseModel.questionsFilters = data.filters;
      data.questions.forEach(x => {
        let questionModel = new QuestionsResponseViewModel();
        questionModel.id = x.questionId;
        questionModel.blockTitle = x.blockTitle;
        questionModel.questionnariesId = x.questionnaireId;
        questionModel.blockType = new BlockType();
        questionModel.blockType.blockType = x.blockType;
        questionModel.blockTitle = x.blockTitle;
        questionModel.questionType = new QuestionTypeViewModel();
        questionModel.delivearbleIds.push(data.deliverableId);
        this.designerService.infoDraftResponseModel.selectedQuestionsResponse.push(questionModel);
      })
      //Step 2 in Create Info Screen
      this.designerService.infoDraftResponseModel.Id = event.id;
      this.designerService.infoDraftResponseModel.status = data.status;
      this.designerService.infoDraftResponseModel.Name = data.name;
      this.designerService.infoDraftResponseModel.AssignTo = data.assignTo;
      this.designerService.infoDraftResponseModel.CoReviewer = data.coReviewer;
      this.designerService.infoDraftResponseModel.IsViewBlock = data.isViewBlock;
      this.designerService.infoDraftResponseModel.BlockIds = data.blockIds;
      this.designerService.infoDraftResponseModel.DueDate = data.dueDate;
      // Step 3 in Create Info Screen
      this.designerService.infoDraftResponseModel.CoverPage = data.coverPage;
      if (data.status == Index.one) {
        this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['create-info'], level2Menu: ['info-request-menu'], topmenu: ['iconviewtopmenu'] } }]);
      }
      else if (data.status == Index.two) {
        this.taskService.getuserinformationrequestbyprojectId(project.projectId).subscribe((response) => {
          response.forEach(element => {
            if (element.informationRequest == data.id) {
              if (element.isAssignTo || element.isCoReviewer || element.isCreator) {
                this.designerService.hideOrShowMenus(Menus.InformationRequest);
                this.designerService.selectedSubmenus(0);
                this.designerService.selecteMenu(Menus.InformationRequest);
                this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-request'], level2Menu: ['inforequest-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
              }
              else {
                this.dialogService.Open(DialogTypes.Warning, "The user do not have access to information request.");
              }
            }
          });
        });
      }
      else if (data.status == Index.three || data.status == Index.four) {
        this.taskService.getuserinformationrequestbyprojectId(project.projectId).subscribe((response) => {
          response.forEach(element => {
            if (element.informationRequest == data.id) {
              if (element.isCoReviewer || element.isCreator) {
                this.designerService.hideOrShowMenus(Menus.InformationRequest);
                this.designerService.selectedSubmenus(0);
                this.designerService.selecteMenu(Menus.InformationRequest);
                this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-request'], level2Menu: ['inforequest-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
              }
              else {
                this.dialogService.Open(DialogTypes.Warning, "The user do not have access to information request.");
              }
            }
          });
        });
      }
      //this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-request'], level2Menu: ['inforequest-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
      else
        this.dialogService.Open(DialogTypes.Warning, "The user do not have access to information request.");
    })
    this.ngxLoader.stopBackgroundLoader(this.ngxLoader['loaders'].infoRequestList.loaderId);

  }
}
@Component({
  selector: 'coreviewer-view',
  template: `
  <div class="row-fluid">
      <div class="" *ngIf="row.coReviewer.length > 0">
      <span>{{row.coReviewer[0].firstName}} {{row.coReviewer[0].lastName}}</span>
      <a [routerLink]="" class="testpopup moreAssigneeLInk"  *ngIf="row.coReviewer.length > 1" (click)="onViewMoreUsers(row)" [nbPopover]="moreAssigneeRef" nbPopoverPlacement="bottom">+{{row.coReviewer.length-1}} more</a> 
      <ng-template #moreAssigneeRef>
        <div *ngFor ="let assignee of row.coReviewer">
          {{assignee.firstName+ ' ' + assignee.lastName}}
        </div>
      </ng-template>
      </div>
  </div>`
})

export class LinkViewComponent implements ViewCell, OnInit {
  row: any;
  @Input() rowData: any;
  @Input() value: string | number;
  constructor(private readonly eventService: EventAggregatorService) {
  }
  ngOnInit() {
    this.row = this.rowData;
  }

  onViewMoreUsers(event) {
    //to do
  }
}
@Component({
  selector: 'coreviewer-view',
  template: `
  <div class="row-fluid">
      <div class="" *ngIf="row.assignTo.length > 0">
      <span>{{row.assignTo[0].firstName}} {{row.assignTo[0].lastName}}</span>
      <a [routerLink]="" class="moreAssigneeLInk" *ngIf="row.assignTo.length > 1" (click)="onViewMoreUsers(row)" [nbPopover]="moreAssigneeRef" nbPopoverPlacement="bottom">+{{row.assignTo.length-1}} more</a> 
      <ng-template #moreAssigneeRef>
      <div class="moreAssigneeRef">
        <p *ngFor ="let assignee of row.assignTo">
          {{assignee.firstName + ' ' + assignee.lastName}}
        </p>
        </div>
      </ng-template>
      </div>
  </div>`
})

export class LinkViewCoReviewerComponent implements ViewCell, OnInit {
  row: any;
  @Input() rowData: any;
  @Input() value: string | number;
  constructor(private readonly eventService: EventAggregatorService) {

  }
  ngOnInit() {
    this.row = this.rowData;
  }
  onViewMoreUsers(event) {
    //to do
  }
}
@Component({
  selector: 'ngx-info-request-list',
  templateUrl: './info-request-list.component.html',
  styleUrls: ['./info-request-list.component.scss']
})
export class InfoRequestListComponent implements OnInit, OnDestroy {
  removeIconTitle= this.translate.instant('iconviewtooltip.Delete');
   settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      columnTitle: '',
      edit: false,
      class: 'testclass',
      delete: false,
      select: true,
      custom: [
        {
          name: 'remove',
          title: `<img src="assets/images/information_Gathering/Remove_clicked.svg" class="smallIcon" title="${this.removeIconTitle}">`
        }
      ],
      position: 'right'
    },
    noDataMessage: this.translate.instant('screens.project-designer.document-view.info-request.Nodatafoundmsg'),
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {},
    mode: 'inline'
  }
  loaderId = 'infoRequestList';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  subscriptions: Subscription = new Subscription();

  infoGatheringRequestModel = new InformationRequestFilterViewModel();
  source: CommonDataSource = new CommonDataSource();
  selectedInfoProgress: number = 0;
  selectedOther: number = 0;

  constructor(private shareDetailService: ShareDetailService,
    private _eventService: EventAggregatorService,
    private toastr: ToastrService,
    private infoGatheringService: CreateInfoService,
    private ngxLoader: NgxUiLoaderService,
    private translate: TranslateService,
    private designerService: DesignerService,
    private dialog: MatDialog,
    private sendEmailService: SendEmailService,
    private dialogService: DialogService) {
    this.subscriptions.add(this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setColumnSettings();
      this.source.refresh();
    }));

    this.setColumnSettings();
  }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId)
    const project = this.shareDetailService.getORganizationDetail();
    this.infoGatheringRequestModel.projectId = project.projectId;
    this.basicPayload(this.infoGatheringRequestModel);
    this.getInfoGatheringRecords();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadInfoGathering).subscribe((payload: InformationRequestFilterViewModel) => {

      payload.projectId = this.infoGatheringRequestModel.projectId;
      this.infoGatheringRequestModel = payload;
      this.basicPayload(this.infoGatheringRequestModel);
      this.getInfoGatheringRecords();
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.deleteInfoRequests).subscribe((infoReqIds: string[]) => {
      this.openDeleteConfirmDialog(infoReqIds);
      // this.deleteInfoRequests(infoReqIds);
    }));

    this.source.onChanged().subscribe((change) => {
      if (change.action === SortEvents.sort || change.action === SortEvents.sorting) {
        this.infoGatheringRequestModel.sortDirection = change.sort[0].direction.toUpperCase();
        this.infoGatheringRequestModel.sortColumn = change.sort[0].field;
        this.basicPayload(this.infoGatheringRequestModel);
        this.getInfoGatheringRecords();
      }
    });
  }
  getInfoGatheringRecords() {
    this.infoGatheringService.getInfoGatheringRecords(this.infoGatheringRequestModel).subscribe((data: InformationResponseViewModel[]) => {
      this.source.load(data);
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    },
      (error) => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
      }
    );
  }
  private basicPayload(infoGatheringRequestModel) {
    infoGatheringRequestModel.pageIndex = 1;
    infoGatheringRequestModel.pageSize = this.settings.pager.perPage;
  }
  oninfoRowSelect(event) {
    if (event.selected.length == 1) {
      this.enableSendReminderButton(event);
      if (event.isSelected)
        this.designerService.informationResponseViewModel.push(event.data)
      else {
        var index = this.designerService.informationResponseViewModel.indexOf(event.data);
        this.designerService.informationResponseViewModel.splice(index, 1);
      }
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(event.selected.length);
  }
  customAction(event) {
    if (event.action == "remove") {
      let ids: string[] = [];
      ids.push(event.data.id);
      this.openDeleteConfirmDialog(ids);
    }
  }
  private dialogTemplate: Dialog;
  openDeleteConfirmDialog(ids: string[]): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordDeleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteInfoRequests(ids);
      }
    });
  }
  deleteInfoRequests(ids: string[]) {
    this.infoGatheringService.deleteInfoRequests(ids).subscribe((result: any) => {
      this.toastr.success(this.translate.instant('screens.home.labels.infoRequestDeletedSuccessfully'));
      this.getInfoGatheringRecords();
    })
  }

  enableSendReminderButton(event) {
    if (event.data.status == createInfoLabels.InProgress) {
      if (event.isSelected) {
        this.selectedInfoProgress = this.selectedInfoProgress + 1;
        if (this.selectedInfoProgress > 0 && this.selectedOther == 0)
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.sendremindericon).publish(this.selectedInfoProgress);

        let infoModel = new InfoReqDetailsForSendReminder();
        infoModel.infoRequestId = event.data.id;
        infoModel.assignTo = event.data.assignTo;
        infoModel.coReviewer = event.data.coReviewer;
        this.designerService.inforequestSendReminder.push(infoModel);
      }
      else {
        this.selectedInfoProgress = this.selectedInfoProgress - 1;
        if (this.selectedOther == 0)
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.sendremindericon).publish(this.selectedInfoProgress);

        let index = this.designerService.inforequestSendReminder.findIndex(x => x.infoRequestId == event.data.id);
        this.designerService.inforequestSendReminder.splice(index, 1);
      }
    }
    else {
      if (event.isSelected) {
        this.selectedOther = this.selectedOther + 1;
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.sendremindericon).publish(0);
      }
      else {
        this.selectedOther = this.selectedOther - 1;
        if (this.selectedInfoProgress > 0 && this.selectedOther == 0)
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.sendremindericon).publish(this.selectedInfoProgress);
      }
    }
  }
  setColumnSettings() {
    const settingsTemp = JSON.parse(JSON.stringify(this.settings));
    settingsTemp.columns = {
      name: {
        title: this.translate.instant('Name'),
        type: 'custom',
        renderComponent: InfoRequestLinkComponent
      },
      status: {
        title: this.translate.instant('Status'),
      },
      coReviewer: {
        title: this.translate.instant('AssignedTo'),
        type: 'custom',
        sort: false,
        renderComponent: LinkViewCoReviewerComponent
      },
      assignedTo: {
        title: this.translate.instant('Co-Reviewer'),
        type: 'custom',
        sort: false,
        renderComponent: LinkViewComponent
      },
      dueDate: {
        title: this.translate.instant('DueDate'),
        type: 'date',
        valuePrepareFunction: (date) => {
          if (date) {
            return moment(date).local().format('DD MMM YYYY');
          }
          return null;
        },
      },
      updatedOn: {
        title: this.translate.instant('LastUpdated'),
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          return `<div>` + row.updatedBy + `</div>
                  <div> on `+ moment(row.updatedOn).local().format("DD MMM YYYY") + `</div>`
        },
      },

    },
      this.settings = Object.assign({}, settingsTemp);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.designerService.inforequestSendReminder = [];
  }
}
