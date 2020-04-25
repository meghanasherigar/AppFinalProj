import { Component, OnInit, ElementRef } from '@angular/core';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { InformationRequestMenuViewModel, createInfoLabels, Index, InformationRequestFilterViewModel } from '../../../../../../@models/projectDesigner/infoGathering';
import { CreateInfoService } from '../../services/create-info.service';
import { Router } from '@angular/router';
import { Dialog, DialogTypes } from '../../../../../../@models/common/dialog';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { SendEmailService } from '../../../../../../shared/services/send-email.service';
import { DesignerService } from '../../../../services/designer.service';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { InformationRequestViewModel, InfoRequestDetailsModel, QuestionsFilterViewModel } from '../../../../../../@models/projectDesigner/task';
import { InfoGatheringIcons } from '../../../../../../@models/projectDesigner/task';
import { UserRightsViewModel } from '../../../../../../@models/userAdmin';
// import { NbDialogRef } from '@nebular/theme';
import { NbDialogService } from '@nebular/theme/components/dialog';
import { SendemailsComponent } from '../../../../../common/sendemails/sendemails.component';
import { EmailDetails } from '../../../../../../@models/common/commonmodel';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-info-request-list-level2-menu',
  templateUrl: './info-request-list-level2-menu.component.html',
  styleUrls: ['./info-request-list-level2-menu.component.scss']
})
export class InfoRequestListLevel2MenuComponent implements OnInit {
  ddlAssignedTo: any
  ddlCoReviewers: any;
  ddlStatus: any;
  ddlInfoRequestNames: any;
  ddlUpdatedBy: any;
  selectedAssignee = [];
  selectedCoReviewers = [];
  selectedStatus = [];
  selectedInfoReqNames = [];
  selectedUpdatedBy = [];
  dialogPullback: Dialog;
  dropdownSettings = {};
  isBlockSlected = true;
  flag:boolean=false;
  isBlockSelectedPullBack= false;
  filterDisable: any = true;
  isSendReminder = false;
  subscriptions: Subscription = new Subscription();
  infoGatheringRequestModel = new InformationRequestFilterViewModel();
  userAccessRights: UserRightsViewModel;
  infoGatheringIcons : InfoGatheringIcons;

  constructor(private shareDetailService: ShareDetailService, private createInfoService: CreateInfoService,
    // protected ref: NbDialogRef<any>,
    private translate: TranslateService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private _eventService: EventAggregatorService, private dialog: MatDialog, 
    private designerService: DesignerService, private sendEmailService: SendEmailService, 
    private router: Router, private el: ElementRef, private nbDialogService: NbDialogService) { }


  ngOnInit() {
    this.AccessRights();
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown',
      idField: 'id',
      textField: 'name',
    };
    
    const project = this.shareDetailService.getORganizationDetail();
    this.createInfoService.getInfoReqFiltersMenu(project.projectId).subscribe((data: InformationRequestMenuViewModel) => {
      this.ddlAssignedTo = data.assignTo;
      this.ddlCoReviewers = data.coReviewer;
      this.ddlInfoRequestNames = data.name;
      this.ddlStatus = data.status;
      this.ddlUpdatedBy = data.updatedBy;  
    });
    this.resetIcons();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).subscribe((blockSelectedCount) => {
      this.resetIcons();
      this.designerService.informationResponseViewModel.forEach(row=>{
        if( row.assignTo.length==0 && row.status== createInfoLabels.InReview)
       {
        this.flag=true;
      }
      });
      if(this.flag)
      {
        this.isBlockSelectedPullBack= false;
        this.flag=false;
      }
      else
      this.isBlockSelectedPullBack= true;
      if (blockSelectedCount >= 1) {
        this.isBlockSlected = true;
        if (blockSelectedCount == 1) {
          this.isSendReminder = true;
        }
      }
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.sendremindericon).subscribe((payload) => {
      this.isSendReminder = false;
      if (payload >= 1) {      
        this.isSendReminder = true;
      }
    })); 
  }
  resetIcons() {
    this.isSendReminder = false;
    this.isBlockSlected = false;
  }
  onItemSelect(item: any) {
    if (this.selectedAssignee.length > 0 || this.selectedCoReviewers.length > 0 || this.selectedInfoReqNames.length > 0 || this.selectedStatus.length > 0
      || this.selectedUpdatedBy.length > 0) {
      this.filterDisable = false;
    }
    else if (this.selectedAssignee.length == 0 && this.selectedCoReviewers.length == 0 && this.selectedInfoReqNames.length == 0 && this.selectedStatus.length == 0
      && this.selectedUpdatedBy.length == 0)
      this.filterDisable = false;

    this.emptyFilters();
    this.selectedAssignee.forEach(x => {
      this.infoGatheringRequestModel.assignToId.push(x.id);
    })
    this.selectedCoReviewers.forEach(x => {
      this.infoGatheringRequestModel.coReviewerId.push(x.id);
    })
    this.selectedInfoReqNames.forEach(x => {
      this.infoGatheringRequestModel.nameId.push(x.id);
    })
    this.selectedStatus.forEach(x => {
      this.infoGatheringRequestModel.statusId.push(x.id);
    })
    this.selectedUpdatedBy.forEach(x => {
      this.infoGatheringRequestModel.updatedById.push(x.id);
    });
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadInfoGathering).publish(this.infoGatheringRequestModel);

  }
  clearFilters() {
    this.emptyFilters();
    this.selectedAssignee = [];
    this.selectedCoReviewers = [];
    this.selectedInfoReqNames = [];
    this.selectedStatus = [];
    this.selectedUpdatedBy=[];
    let datePicker = <HTMLInputElement>document.querySelector(createInfoLabels.DueDateId);
    if (datePicker != null)
      datePicker.value = "";
    datePicker = <HTMLInputElement>document.querySelector(createInfoLabels.UpdatedOnId);
    if (datePicker != null)
      datePicker.value = "";
    this.filterDisable = true;
    this.infoGatheringRequestModel.updatedOnMax='';
    this.infoGatheringRequestModel.updatedOnMin='';
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadInfoGathering).publish(this.infoGatheringRequestModel);

  }
  emptyFilters() {
    this.infoGatheringRequestModel.assignToId = [];
    this.infoGatheringRequestModel.coReviewerId= [];
    this.infoGatheringRequestModel.statusId = [];
    this.infoGatheringRequestModel.nameId = [];
    this.infoGatheringRequestModel.updatedById = [];
  }
  onDateSelect(item: any, type: any) {
    if (!item) return;
    var startDateSelected = item[0];
    var endDateSelected = this.getEndDateTime(item[1]);
    if (type == createInfoLabels.DueDate) {
       this.infoGatheringRequestModel.dueDateMin = startDateSelected;
       this.infoGatheringRequestModel.dueDateMax = endDateSelected;
    }
    else {
      this.infoGatheringRequestModel.updatedOnMin = startDateSelected;
       this.infoGatheringRequestModel.updatedOnMax = endDateSelected;
    }
    this.filterDisable = false;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadInfoGathering).publish(this.infoGatheringRequestModel);
  }
  onSelectAll(items: any, index) {
    if (index == Index.one) {
      this.infoGatheringRequestModel.assignToId = items;
      this.selectedAssignee = items;
    }
    else if (index == Index.two) {
      this.infoGatheringRequestModel.coReviewerId = items;
      this.selectedCoReviewers = items;
    }
    else if (index == Index.three) {
      this.infoGatheringRequestModel.statusId = items;
      this.selectedStatus = items;
    }
    else if (index == Index.four) {
      this.infoGatheringRequestModel.nameId = items;
      this.selectedInfoReqNames = items;
    }
    else if (index == Index.five) {
      this.infoGatheringRequestModel.updatedById = items;
      this.selectedUpdatedBy = items;
    }
    if (this.selectedAssignee.length > 0 || this.selectedCoReviewers.length > 0 || this.selectedInfoReqNames.length > 0 || this.selectedStatus.length > 0
      || this.selectedUpdatedBy.length > 0) {
      this.filterDisable = false;
    }
    else if (this.selectedAssignee.length == 0 && this.selectedCoReviewers.length == 0 && this.selectedInfoReqNames.length == 0 && this.selectedStatus.length == 0
      && this.selectedUpdatedBy.length == 0)
      this.filterDisable = true;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadInfoGathering).publish(this.infoGatheringRequestModel);
  }
  getEndDateTime(date: any): any {
    return moment(date).set({ h: 23, m: 59, s: 59 }).toDate();
  }
  goCreateRequest() {
    this.designerService.infoRequestId = '';
    this.designerService.infoDraftResponseModel = new InfoRequestDetailsModel();
    this.designerService.selectedEntities = [];
    this.designerService.questionsFilters = new QuestionsFilterViewModel();
    this.designerService.clearinforRequest();
    this.designerService.infoRequestStatus = undefined;
    this.designerService.deliverableInformationRequestModel = [];
    this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['create-info'], level2Menu: ['info-request-menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

  
  pullBackPopUp() {
    this.dialogPullback = new Dialog();
    this.dialogPullback.Type = DialogTypes.PullBack;
    let inforReqs="";
    this.designerService.informationResponseViewModel.forEach(obj=>{
      inforReqs+=" "+obj.name;
    });
    this.dialogPullback.Message = "Are you sure you want to pull-back the information request for "+inforReqs;
   
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogPullback
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let payLoad:InformationRequestViewModel[]=[];
        this.designerService.informationResponseViewModel.forEach(row=>{
          let tmp=new InformationRequestViewModel();
          tmp.Id=row.id;
          payLoad.push(tmp);
        });
        this.subscriptions.add(this.sendEmailService.pullBack(payLoad)
           .subscribe(response=>{
            if (response.status === ResponseStatus.Sucess) {
              this.toastr.success(this.translate.instant('screens.project-user.pullBackSuccessMessage'));
               this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadInfoGathering).publish(this.infoGatheringRequestModel);
              this.isBlockSlected = false;
            } else {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
            }
            this.dismiss();
          },
            error => {
              this.dialogService.Open(DialogTypes.Warning, error.message);
            }));
      }
    });
  }
  deleteInfoRequests()
  {
    let payLoad:string[]=[];
    this.designerService.informationResponseViewModel.forEach(row=>{
      payLoad.push(row.id);
    });
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.deleteInfoRequests).publish(payLoad);   
    this.isBlockSlected = false;
  }
  dismiss()
  {
    // this.ref.close();  
  }  

  AccessRights(){
    this.infoGatheringIcons = new InfoGatheringIcons();
    if (this.designerService.docViewAccessRights){
      this.userAccessRights = this.designerService.docViewAccessRights;
      if(this.userAccessRights.isCentralUser){
        this.infoGatheringIcons.EnableCreateInfoRequest = true;
      }
      else if(!this.userAccessRights.isCentralUser && this.userAccessRights.hasProjectTemplateAccess){
        this.infoGatheringIcons.EnableCreateInfoRequest = true;
      }
      else {
        this.infoGatheringIcons.EnableCreateInfoRequest = false;
      }
    }
    else {
      this.infoGatheringIcons.EnableCreateInfoRequest = false;
    }
  }
  show=true;
  imageName= this.translate.instant("collapse");
  toggleCollapse(){
    this.show=!this.show;
    if(this.show==false){
      this.imageName= this.translate.instant("expand");
    }
    else
    this.imageName= this.translate.instant("collapse");
  }

  sendReminderMailPopUp() {
    this.designerService.isInforeqsendReminder = true;
    let referance = this.nbDialogService.open(SendemailsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
    
    let emailDetails = new EmailDetails();
    this.designerService.inforequestSendReminder.forEach(data => {
      data.assignTo.forEach(x => {
        emailDetails.to.push(x);
      });
      data.coReviewer.forEach(x => {
        emailDetails.cc.push(x);
      });

      emailDetails.isBCCDisabled = true;
      emailDetails.isCCDisabled = true;
      emailDetails.isToDisabled = true;
    });

    referance.componentRef.instance.emailDetails = emailDetails;
  }

}
