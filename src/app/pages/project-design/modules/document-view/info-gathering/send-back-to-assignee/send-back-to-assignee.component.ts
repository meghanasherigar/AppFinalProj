import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { TranslateService } from '@ngx-translate/core';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { ApproveRejectViewModel } from '../../../../../../@models/projectDesigner/common';
import { DesignerService } from '../../../../services/designer.service';
import { InformationRequestViewModel } from '../../../../../../@models/projectDesigner/task';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';
import { SubMenus } from '../../../../../../@models/projectDesigner/designer';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { ToastrService } from 'ngx-toastr';
import { StorageKeys } from '../../../../../../@core/services/storage/storage.service';
import { Location } from '@angular/common';
import { SessionStorageService } from '../../../../../../@core/services/storage/sessionStorage.service';

@Component({
  selector: 'ngx-send-back-to-assignee',
  templateUrl: './send-back-to-assignee.component.html',
  styleUrls: ['./send-back-to-assignee.component.scss']
})
export class SendBackToAssigneeComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  sendBackToAssigneeFrom: FormGroup;
  approveRejectViewModel = new ApproveRejectViewModel(); 
  IsCheckedRejected : string;

  constructor(
    private _eventService: EventAggregatorService, 
    private router: Router,
    protected ref: NbDialogRef<any>,
    private shareDetailService: ShareDetailService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private toastr: ToastrService,
    private dialogService: DialogService,
    private designerService: DesignerService,
    private taskService: TaskService,
    private sessionStorageService: SessionStorageService,
    private location: Location) { 
    this.sendBackToAssigneeFrom = this.formBuilder.group({
      IsOnlyRejected: [''],
      IsCompleteInfoReq: [''],
    });
  }

  ngOnInit() {
  }

  
  dismiss() {
    this.ref.close();
  }

  SendBackToAssignee() {
    let infoRequest = new InformationRequestViewModel();
    infoRequest.Id = this.designerService.infoRequestId;
    if(this.IsCheckedRejected != undefined){
      if(this.IsCheckedRejected == "true"){
        infoRequest.IsCompleteRequest = true;
      }
      else if(this.IsCheckedRejected == "false"){
        infoRequest.IsCompleteRequest = false;
      }
    }
    else{
      this.dialogService.Open(DialogTypes.Error, "Please select atleast one value.");
      return;
    }
    this.designerService.disableMessage = true;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.saveInfoRequest).publish("saveinforequest")); 
   
    this.subscriptions.add(this.taskService.sendbacktoassignee(infoRequest).subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.info-gathering.sendBackToAssignSuccessfully'));
          this.dismiss();
          if (this.sessionStorageService.getItem(StorageKeys.REDIRECTURLID) != null) {
            this.sessionStorageService.removeItem(StorageKeys.REDIRECTURLID);
            this.sessionStorageService.removeItem(StorageKeys.PROJECTINCONTEXT);
            window.open(this.location.path.name + '/assets/static-pages/inforequest-en.html', '_self');
          } else {
            this.redirectToLandingPage();
          }
        } else {
              this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
        }
      },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      }));
  }

  redirectToLandingPage(){
    this.designerService.changeIsDocFullView(true);
    this.designerService.changeTabDocumentView(SubMenus.InformationRequest);
    this.router.navigate(['pages/project-design/projectdesignMain/documentViewMain', { outlets: { primary: ['info-list'], level2Menu: ['info-level2-menu'], topmenu: ['iconviewtopmenu'] } }]);
  }


}
