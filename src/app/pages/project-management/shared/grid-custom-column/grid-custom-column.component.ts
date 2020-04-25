import { Component, OnInit, Input, ChangeDetectorRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ProjectDeliverableService } from '../../services/project-deliverable.service';
import * as moment from 'moment';
import { NbDialogService } from '@nebular/theme';
import { InfoDialogComponent } from '../ui/info-dialog/info-dialog.component';
import { ProjectManagementService } from '../../services/project-management.service';
import { Router } from '@angular/router';
import { ProjectManagementConstants, TaskStatusConstant, taskTypes, TaskStatus } from '../../@models/Project-Management-Constants';
import { TranslateService } from '@ngx-translate/core';
import { TaskReportService } from '../../services/task-report.service';
import { SendemailsComponent } from '../../../common/sendemails/sendemails.component';
import { EmailDetails, Email } from '../../../../@models/common/commonmodel';
import { downloadFileFromTask } from '../../@models/common/common-helper';
import { DesignerService } from '../../../project-design/services/designer.service';
import { Subscription } from 'rxjs';
import { UserRightsViewModel, EntityViewModel } from '../../../../@models/userAdmin';
import { TemplateViewModel } from '../../../../@models/projectDesigner/template';
import { DeliverableViewModel } from '../../../../@models/projectDesigner/deliverable';
import { BlockDetails } from '../../../../@models/projectDesigner/block';
import { EventConstants, NavigationSource, eventConstantsEnum } from '../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { SubMenus, Menus } from '../../../../@models/projectDesigner/designer';
import { InfoRequestStatus } from '../../../../@models/projectDesigner/infoGathering';
import { infoStatus } from '../../@models/tasks/task';
 
@Component({
  selector: 'ngx-grid-custom-column',
  templateUrl: './grid-custom-column.component.html',
  styleUrls: ['./grid-custom-column.component.scss']
})
export class GridCustomColumnComponent implements OnInit,OnDestroy {
  componentType: any;

  defaultObjectId = ProjectManagementConstants.DefaultObjectId;

  masterData =
    {
      reportTiers: [],
      milestones: [],
      taskStatuses: [
        {
          value: TaskStatusConstant.Draft,
          display: TaskStatusConstant.Draft
        },
        {
          value: TaskStatusConstant.InProgress,
          display: TaskStatusConstant.InProgress
        },
        {
          value: TaskStatusConstant.Completed,
          display: TaskStatusConstant.Completed
        },
      ]
    };
  value: any;
  row: any;
  cell: any;

  fieldNameMap =
    {
      //plural: singular
      'reportTiers': 'reportTier',
      'milestones': 'mileStoneReached',
    };

  showMilestoneStepper: boolean = false;
  currentSubscriptions: Subscription= new Subscription();
  userRights=new UserRightsViewModel();
  userHasAccess:boolean=false;

  dateColumns: Array<string> = ['targetDeliverableIssueDate', 'statutoryDueDate', 'cbcNotificationDueDate'];
  constructor(private projectDeliverableService: ProjectDeliverableService,
    private readonly eventService: EventAggregatorService,
    private managementService: ProjectManagementService,
    private cdRef: ChangeDetectorRef,
    private dialogService: NbDialogService,
    private router: Router,
    private translate: TranslateService,
    private taskReportService: TaskReportService,
    private designerService:DesignerService,
    private projectDesignerService: DesignerService
  ) { }

  ngOnInit() {
    this.subscriptions();
    this.componentType = this.value.component;
    this.row = this.value.row;
    this.cell = this.value.cell;
    //Bind master values 
    this.masterData.reportTiers = this.value.reportTiers;
    this.masterData.milestones = this.value.milestones;
  }

  subscriptions() {
    this.currentSubscriptions.add(this.managementService.currentUserRights.subscribe(userRights=>
      {
        if(userRights)
        {
          this.userRights= userRights;
          this.userHasAccess=this.userRights.isCentralUser;
        }
      }));
  }

  get taskStatus() {
    return TaskStatus;
  }

  get TaskTypes() {
    return taskTypes;
  }

  showCalendar() {
    return this.dateColumns.includes(this.componentType);
  }

  saveDate(date) {
    this.row[this.componentType] = date;
    this.saveDeliverableReportRow();
  }

  saveDeliverableReportRow(field: string = '') {
    this.projectDeliverableService.updateDeliverable(this.row).subscribe(response => {
      if (field === 'milestones') {
        //if the milestone drop down is being changed, then header summary also should be reloaded
        this.managementService.changeReloadDeliverableSummaryFlag(true);
      }
      //Reload the UI grid data
      this.managementService.changeDeliverableGridRefresh(true);
    });
  }

  navigateToBlocks(deliverableId) {
    if (deliverableId && deliverableId !== this.defaultObjectId) {
      this.managementService.changeCurrentDeliverable(deliverableId);
      this.router.navigate(['pages/project-management/ProjectManagementMain/',
        {
          outlets: { primary: ['Blocks'], level2Menu: ['BlocksLevel2Menus'], topmenu: ['ProjectManagementTopMenu'] }
        }]
      );
    }

  }


  saveDataOnDropDownChange(event, field) {
    let selectedValue = this.masterData[field].find(x => x.id === event.target.value);
    let selectedField = this.fieldNameMap[field];
    this.row[selectedField] = selectedValue;
    this.saveDeliverableReportRow(field);

    if (field === 'milestones') {
      this.row.mileStoneReached.value = selectedValue.value;
      this.cdRef.detectChanges();
    }
  }


  formatDate() {
    return moment(this.cell).local().format("DD MMM YYYY");
  }

  //Methhod that returns the css class based on date validation
  checkDate() {
    let ApplyWarningCss: boolean = false;

    //'targetDeliverableIssueDate', 'statutoryDueDate','cbcNotificationDueDate'
    if (this.componentType !== 'cbcNotificationDueDate') {
      if (this.row.mileStoneReached.value !== 100) {
        let currentDate = moment(new Date()).local();
        let statutoryDueDate = moment(this.row['statutoryDueDate']).local();

        if (statutoryDueDate && statutoryDueDate.diff(currentDate, 'days') < 0) {
          ApplyWarningCss = true;
          return ApplyWarningCss;
        }
        if (this.componentType !== 'statutoryDueDate') {
          let targetDueDate = moment(this.row['targetDeliverableIssueDate']).local();
          if (targetDueDate && targetDueDate.diff(currentDate, 'days') < 0) {
            ApplyWarningCss = true;
            return ApplyWarningCss;
          }
        }
      }
    }
    return ApplyWarningCss;
  }

  showDescription() {

    const dialogRef =
      this.dialogService.open(InfoDialogComponent, {
        closeOnBackdropClick: true,
        closeOnEsc: true,
      });
    dialogRef.componentRef.instance.data = this.row[this.componentType];
    dialogRef.componentRef.instance.header = this.translate.instant('screens.Project-Management.Grid.ErrorMessages.TransferPricing');
  }

  saveTaskReportRow() {
    this.taskReportService.updateTaskReport([this.row]).subscribe(response => {

    });
  }

  saveTaskDueDate(date) {
    this.row["dueDate"] = date;
    this.saveTaskReportRow();
  }

  saveDataOnTaskStatusChange(event) {
    this.row["status"] = event.target.value;
    this.saveTaskReportRow();
  }
  checkTaskDueDate() {
    let ApplyWarningCss: boolean = false;
    let currentDate = moment(new Date()).local();

    let taskDueDate = moment(this.row['dueDate']).local();

    if (taskDueDate && taskDueDate.diff(currentDate, 'days') < 0) {
      ApplyWarningCss = true;
    }
    return ApplyWarningCss;
  }

  openEmailDialog() {
    if (this.row.assignTo && this.row.assignTo.length > 0) {

      let emailDetails: EmailDetails = new EmailDetails();
      emailDetails.isToDisabled = true;
      emailDetails.isCCDisabled = false;
      emailDetails.to = this.row.assignTo;
      emailDetails.isGenericMailer = true;

      const sendReminderRef = this.dialogService.open(SendemailsComponent,
        {
          closeOnBackdropClick: false,
          closeOnEsc: true,
        });
      sendReminderRef.componentRef.instance.emailDetails = emailDetails;
      //Add project related properties to search for only project-template-deliverable users
      let projectDetails=new TemplateViewModel();
      projectDetails.deliverableId=this.row.deliverableId;
      projectDetails.templateId=this.row.templateId;
      projectDetails.projectId=this.row.projectId;
      sendReminderRef.componentRef.instance.projectUserSearchModel=projectDetails;
    }
  }

  calculateTaskCompletionStatus(row) {
    if (row.questionsCount) {
      return (row.answersCount / row.questionsCount) * 100;
    }
    return 0;
  }

  downloadTaskAttachment(row) {

    this.taskReportService.downloadOtherTaskFile(row.attachedFileName).subscribe((response: any) => {
      downloadFileFromTask(response, row.attachedFileName);

    })

  }

  markMyTaskAsComplete(row) {
    this.managementService.changeCompleteTask(row);
  }


  navigateToDesignerPages(row)
  { 
    //Set the origin of navigation so that on close, user can be navigated to my task page.
    // this.eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.ProjectManagementNavigationSource).publish(NavigationSource.MyTask);
    this.designerService.clear();
    this.designerService.navigation(NavigationSource.MyTask);
    switch(row.taskType)
    {
        case taskTypes.BLOCKREVIEW:
            // this.designerService.LoadAllBlocksDocumentView = false;
            this.designerService.isExtendedIconicView = true;
            this.designerService.isTemplateSection = false;
            this.designerService.isDeliverableSection = false;
            this.designerService.isLibrarySection = false;
            // this.designerService.isDocFullViewEnabled = false;
            this.designerService.blockDetails = new BlockDetails();
            this.designerService.blockDetails = row;
            this.designerService.blockDetails.blockId = row.id;
            this.designerService.blockList = [];
            this.designerService.blockList.push(this.designerService.blockDetails);
            this.designerService.isProjectManagement = true;
            this.designerService.selectedSubmenus(SubMenus.Editor);
            this.designerService.hideOrShowMenus(0);
            this.designerService.changeTabDocumentView(SubMenus.Editor);
            this.designerService.changeIsDoubleClicked(true);

            if(row.templateId){
              this.designerService.isTemplateSection = true;
              this.designerService.isDeliverableSection = false;
              this.designerService.templateDetails= new TemplateViewModel();
              this.designerService.templateDetails.templateId = row.templateId;
              this.designerService.templateDetails.templateName = row.associatedDeliverable;
            } 

            else if(row.deliverableId) {
              this.designerService.isDeliverableSection = true;
              this.designerService.isTemplateSection = false; 
              this.designerService.deliverableDetails= new DeliverableViewModel();
              this.designerService.deliverableDetails.entityId = row.deliverableId;
              this.designerService.deliverableDetails.deliverableId = row.deliverableId;
              this.designerService.deliverabletemplateDetails= new TemplateViewModel();
              this.designerService.deliverabletemplateDetails.templateName = row.name;       
              
              this.designerService.entityDetails = [];
              let entityDetails : any = {};
              entityDetails.entityId = row.deliverableId;
              this.designerService.entityDetails.push(entityDetails);
            }
            else 
            {
            // used if-else if to keep the conditions mutually exlusive
            }
            this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
            this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
        break;
        case taskTypes.REPORTREVIEW:
            this.designerService.LoadAllBlocksDocumentView = true;
            this.designerService.isExtendedIconicView = false;
            this.designerService.changeIsDoubleClicked(true);
            this.designerService.selectedSubmenus(SubMenus.Editor);
            this.designerService.hideOrShowMenus(0);
            this.designerService.changeTabDocumentView(SubMenus.Editor);
            if(row.templateId){
              this.designerService.isTemplateSection = true;
              this.designerService.isDeliverableSection = false;
              this.designerService.templateDetails= new TemplateViewModel();
              this.designerService.templateDetails.templateId = row.templateId;
            } 

            else if(row.deliverableId) {
              this.designerService.isDeliverableSection = true;
              this.designerService.isTemplateSection = false;
              this.designerService.deliverableDetails= new DeliverableViewModel();
              this.designerService.deliverableDetails.entityId = row.deliverableId;
              this.designerService.deliverableDetails.deliverableId= row.deliverableId;
              this.designerService.deliverabletemplateDetails= new TemplateViewModel();
              this.designerService.deliverabletemplateDetails.templateName = row.name;       
              
              this.designerService.entityDetails = [];
              let entityDetails : any = {};
              entityDetails.entityId = row.deliverableId;
              this.designerService.entityDetails.push(entityDetails);
            }
            else 
            {
            // used if-else if to keep the conditions mutually exlusive
            }
            this.designerService.blockList=[];
            this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
            this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain/', 
            {
              outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] }
            }]);
        break;
        case taskTypes.INFORMATIONREQUEST:
        this.designerService.infoRequestId = row.id;
        this.designerService.infoRequestStatus = this.setInfoRequestStatus(row.status);
        this.designerService.hideOrShowMenus(Menus.InformationRequest);
        this.designerService.changeTabDocumentView(SubMenus.Editor);
        this.designerService.selectedSubmenus(0);
        this.designerService.selecteMenu(Menus.InformationRequest);  
        this.eventService.getEvent(EventConstants.ProjectDesignerTabAccess).publish(true);
        this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain/',
        {
          outlets: { primary: ['info-request'], level2Menu: ['inforequest-level2-menu'], topmenu: ['iconviewtopmenu'] }
        }]);
        break;

    }
  }

  entitySelect(row)
  {
    this.managementService.changeCurrentEntity(row);
  }

  setInfoRequestStatus(status: string): string {
    let RequestStatus: string;
    if(status === infoStatus.inProgress) {
      RequestStatus = InfoRequestStatus.InProgress;
    } else if (status === infoStatus.assigned) {
      RequestStatus = InfoRequestStatus.InProgress;
    } else if(status === infoStatus.review) {
      RequestStatus = InfoRequestStatus.Review
    } else if(status === infoStatus.final) {
      RequestStatus = InfoRequestStatus.Final;
    }
    return RequestStatus;
  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }
}
