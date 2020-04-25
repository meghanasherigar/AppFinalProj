import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectManagementService } from '../../services/project-management.service';
import { ProjectDeliverableService } from '../../services/project-deliverable.service';
import { Deliverable, DeliverableReport } from '../../@models/deliverable/deliverable';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-edit-deliverable',
  templateUrl: './edit-deliverable.component.html',
  styleUrls: ['./edit-deliverable.component.scss']
})
export class EditDeliverableComponent implements OnInit {

  deliverableIdsForEdit: any[];
  currentSubscriptions: Subscription;

  @Output() editDeliverableAction = new EventEmitter<boolean>();

  targetDeliverableIssueDate: string='';
  statutoryDueDate: string='';
  cbcNotificationDueDate: string='';

  //ngx-ui-loader configuration
  loaderId = 'editDeliverableDatesLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  constructor(private managementService: ProjectManagementService,
    private sharedService:ShareDetailService,
    private ngxLoader:NgxUiLoaderService,
    private projectDeliverableService: ProjectDeliverableService) {
    this.currentSubscriptions = new Subscription();
  }

  ngOnInit() {
    this.subscriptionActions();
  }

  subscriptionActions() {
    this.currentSubscriptions.add(
      this.managementService.currentDeliverableIdsForEdit.subscribe(deliverableIds => {
        this.deliverableIdsForEdit = deliverableIds;
      })
    );
  }

  onCancel() {
    this.editDeliverableAction.emit(false);
  }
  onSave() {

    if (this.deliverableIdsForEdit.length > 0
      && (this.statutoryDueDate!==''
      || this.targetDeliverableIssueDate!==''
      || this.cbcNotificationDueDate!==''))
      {
       //this.ngxLoader.startBackgroundLoader(this.loaderId);
       let deliverableRequest=new DeliverableReport();
       deliverableRequest.projectId= this.sharedService.getORganizationDetail().projectId;
       deliverableRequest.deliverableReportIds= this.deliverableIdsForEdit;

       deliverableRequest.statutoryDueDate=this.statutoryDueDate;
       deliverableRequest.targetIssueDate=this.targetDeliverableIssueDate;
       deliverableRequest.cbcNotificationDueDate=this.cbcNotificationDueDate;
       
       this.ngxLoader.startBackgroundLoader(this.loaderId);
       this.projectDeliverableService.updateDeliverableReportDates(deliverableRequest).subscribe(response=>
         {
          this.editDeliverableAction.emit(true);
           this.ngxLoader.stopBackgroundLoader(this.loaderId);
         });
    }


  }

  ngOnDestroy() {
    this.currentSubscriptions.unsubscribe();
  }
}
